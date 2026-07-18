import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { dedupeEvents, normalizeEvent, validateEvent } from './lib/event-pipeline.mjs';

const ROOT = process.cwd();
const sources = JSON.parse(await fs.readFile(path.join(ROOT, 'config/sources.json'), 'utf8'));
const now = new Date();
const oldest = new Date(now.getTime() - 86400000);
const newest = new Date(now.getTime() + 400 * 86400000);
const userAgent = 'QueensCalendarBot/0.1 (+https://queens-calendar.netlify.app/about)';

// Approximate centroids for sources (like City Parks Foundation) whose event pages
// name a park/neighborhood but never publish geo coordinates or a street address.
const QUEENS_NEIGHBORHOOD_COORDS = [
  { match: /astoria/i, neighborhood: 'Astoria', latitude: 40.7643, longitude: -73.9235 },
  { match: /long island city|hunters point/i, neighborhood: 'Long Island City', latitude: 40.7447, longitude: -73.9485 },
  { match: /flushing meadows|corona park/i, neighborhood: 'Flushing Meadows–Corona Park', latitude: 40.7466, longitude: -73.8455 },
  { match: /flushing/i, neighborhood: 'Flushing', latitude: 40.7654, longitude: -73.8318 },
  { match: /jamaica/i, neighborhood: 'Jamaica', latitude: 40.7027, longitude: -73.7890 },
  { match: /forest hills/i, neighborhood: 'Forest Hills', latitude: 40.7196, longitude: -73.8448 },
  { match: /ridgewood/i, neighborhood: 'Ridgewood', latitude: 40.7043, longitude: -73.9028 },
  { match: /woodside/i, neighborhood: 'Woodside', latitude: 40.7452, longitude: -73.9067 },
  { match: /sunnyside/i, neighborhood: 'Sunnyside', latitude: 40.7433, longitude: -73.9196 },
  { match: /elmhurst/i, neighborhood: 'Elmhurst', latitude: 40.7362, longitude: -73.8827 },
  { match: /rockaway/i, neighborhood: 'Rockaway', latitude: 40.5834, longitude: -73.8157 },
  { match: /bayside/i, neighborhood: 'Bayside', latitude: 40.7615, longitude: -73.7723 },
  { match: /college point/i, neighborhood: 'College Point', latitude: 40.7873, longitude: -73.8420 },
  { match: /whitestone/i, neighborhood: 'Whitestone', latitude: 40.7965, longitude: -73.8134 },
  { match: /howard beach/i, neighborhood: 'Howard Beach', latitude: 40.6551, longitude: -73.8410 },
  { match: /kew gardens/i, neighborhood: 'Kew Gardens', latitude: 40.7134, longitude: -73.8302 },
];

function guessQueensNeighborhood(text) {
  const normalized = text.replace(/['’]/g, '');
  const found = QUEENS_NEIGHBORHOOD_COORDS.find((entry) => entry.match.test(normalized));
  if (found) return found;
  // Honest fallback: we know the event is in Queens (borough-filtered) but not which
  // neighborhood, so we center on the borough rather than fabricating a precise venue.
  return { neighborhood: 'Queens', latitude: 40.7282, longitude: -73.7949 };
}

const cleanText = (value = '') => {
  const once = cheerio.load(`<div>${value}</div>`).text();
  return cheerio.load(`<div>${once}</div>`).text().replace(/\s+/g, ' ').trim();
};
const absolute = (href, base) => { try { return new URL(href, base).href.split('#')[0]; } catch { return null; } };
const fetchHtml = async (url) => {
  const response = await fetch(url, { headers: { 'user-agent': userAgent, accept: 'text/html,application/xhtml+xml' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
};

function bestRegistrationUrl($, canonicalUrl) {
  const canonicalHost = new URL(canonicalUrl).hostname;
  return $('a[href]').map((_, anchor) => {
    const text = $(anchor).text().trim().replace(/\s+/g, ' ');
    const href = absolute($(anchor).attr('href'), canonicalUrl);
    if (!href || !/^(rsvp|register|tickets?|reserve)/i.test(text)) return null;
    let score = /^rsvp|^register/i.test(text) ? 5 : 1;
    if (new URL(href).hostname !== canonicalHost) score += 4;
    if (/eventbrite|lu\.ma|partiful|zoom|ticket/i.test(href)) score += 3;
    return { href, score };
  }).get().filter(Boolean).sort((a, b) => b.score - a.score)[0]?.href || canonicalUrl;
}

function flattenJsonLd(value, found = []) {
  if (!value) return found;
  if (Array.isArray(value)) return value.reduce((items, item) => flattenJsonLd(item, items), found);
  if (typeof value !== 'object') return found;
  const type = value['@type'];
  if (type === 'Event' || (Array.isArray(type) && type.includes('Event'))) found.push(value);
  if (value['@graph']) flattenJsonLd(value['@graph'], found);
  return found;
}

function parseClock(value) {
  const match = value.trim().toLowerCase().match(/(\d{1,2}):(\d{2})\s*([ap]m)/);
  if (!match) return null;
  let hour = Number(match[1]);
  if (match[3] === 'pm' && hour !== 12) hour += 12;
  if (match[3] === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2]}:00`;
}

function parseFallbackDate(text) {
  const dot = text.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4}),\s*(\d{1,2}:\d{2}\s*[ap]m)\s*[–—-]\s*(\d{1,2}:\d{2}\s*[ap]m)/i);
  if (!dot) return null;
  const year = dot[3].length === 2 ? 2000 + Number(dot[3]) : Number(dot[3]);
  const offset = Number(dot[1]) >= 3 && Number(dot[1]) <= 11 ? '-04:00' : '-05:00';
  return {
    startDate: `${year}-${String(dot[1]).padStart(2, '0')}-${String(dot[2]).padStart(2, '0')}T${parseClock(dot[4])}${offset}`,
    endDate: `${year}-${String(dot[1]).padStart(2, '0')}-${String(dot[2]).padStart(2, '0')}T${parseClock(dot[5])}${offset}`
  };
}

function parseNoguchiUrlDate(url) {
  const match = url.match(/\/calendar\/event\/(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})-/);
  if (!match) return null;
  const startDate = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00-04:00`;
  const endDate = new Date(new Date(startDate).getTime() + 2 * 60 * 60 * 1000).toISOString();
  return { startDate, endDate };
}

function removeConflictingDateCopy(description, startDate) {
  if (!description || !startDate) return description;
  const local = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'long', day: 'numeric' }).format(new Date(startDate));
  const target = local.toLowerCase();
  return description.split(/(?<=[.!?])\s+/).filter((sentence) => {
    const explicit = sentence.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i);
    return !explicit || explicit[0].toLowerCase() === target;
  }).join(' ').trim() || description;
}

function imageUrl(image) {
  if (typeof image === 'string') return image;
  if (Array.isArray(image)) return imageUrl(image[0]);
  return image?.url || image?.contentUrl || null;
}

function locationFromJson(location, fallback, titleForNeighborhoodGuess) {
  const address = typeof location?.address === 'string' ? location.address : [location?.address?.streetAddress, location?.address?.addressLocality, location?.address?.addressRegion, location?.address?.postalCode].filter(Boolean).join(', ');
  const lat = Number(location?.geo?.latitude);
  const lng = Number(location?.geo?.longitude);
  if (fallback || Number.isFinite(lat)) {
    return {
      name: location?.name || fallback?.name || 'Queens venue',
      address: address || fallback?.address || 'Queens, NY',
      neighborhood: fallback?.neighborhood || location?.address?.addressLocality || 'Queens',
      latitude: Number.isFinite(lat) ? lat : fallback?.latitude,
      longitude: Number.isFinite(lng) ? lng : fallback?.longitude
    };
  }
  // No fixed venue configured and no coordinates in the source JSON-LD (e.g. City Parks
  // Foundation only names a park in the title/description). Guess the neighborhood from
  // the event text instead of dropping every event for lacking coordinates.
  const guess = guessQueensNeighborhood(`${location?.name || ''} ${titleForNeighborhoodGuess || ''}`);
  return {
    name: location?.name && location.name !== 'Queens' ? location.name : (titleForNeighborhoodGuess || 'Queens venue'),
    address: address || `${guess.neighborhood}, Queens, NY`,
    neighborhood: guess.neighborhood,
    latitude: guess.latitude,
    longitude: guess.longitude
  };
}

function parseDetail(html, url, source) {
  const $ = cheerio.load(html);
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const jsonEvents = [];
  $('script[type="application/ld+json"]').each((_, script) => {
    try { flattenJsonLd(JSON.parse($(script).text()), jsonEvents); } catch {}
  });
  const retrievedAt = new Date().toISOString();
  const canonicalEvents = jsonEvents.filter((node) => {
    const nodeUrl = absolute(node.url, url);
    return nodeUrl && (nodeUrl === url || nodeUrl.replace(/\/$/, '') === url.replace(/\/$/, ''));
  });
  if (canonicalEvents.length) return canonicalEvents
    .filter((node) => !source.boroughMustEqual || node.location?.name === source.boroughMustEqual)
    .map((node) => ({
      title: cleanText(node.name), description: removeConflictingDateCopy(cleanText(node.description || $('meta[property="og:description"]').attr('content') || node.name), node.startDate),
      startDate: node.startDate, endDate: node.endDate || node.startDate, attendanceMode: String(node.eventAttendanceMode || '').includes('Online') ? 'online' : 'offline',
      categories: source.defaultCategories, tags: [], image: imageUrl(node.image), price: node.offers?.price ? String(node.offers.price) : null,
      registrationUrl: node.offers?.url || node.url || url, venue: locationFromJson(node.location, source.venue, cleanText(node.name)),
      organizer: { name: node.organizer?.name || source.name, url: node.organizer?.url || source.organizerUrl },
      source: { name: source.name, listingUrl: source.listingUrl, canonicalUrl: url, retrievedAt, method: 'json-ld' }
    }));

  if (source.includeText && !bodyText.toLowerCase().includes(source.includeText.toLowerCase())) return [];
  // Sources filtered by borough (e.g. City Parks Foundation covers all five boroughs) with no
  // fixed venue can only be verified via structured JSON-LD location data above. Without it,
  // there is no reliable signal that a freeform HTML page is actually a Queens event, so skip
  // rather than risk publishing an event from another borough.
  if (source.boroughMustEqual && !source.venue) return [];
  const title = cleanText($('meta[property="og:title"]').attr('content') || $('h1').first().text()).replace(/^.*?\|\s*/, '').replace(/\s+[-|]\s+The Noguchi Museum$/i, '');
  const usefulParagraph = $('main p').map((_, paragraph) => cleanText($(paragraph).text())).get()
    .filter((value) => value.length > 80 && !/photo:|courtesy|images? \(|installation view|all rights reserved/i.test(value))
    .sort((a, b) => Math.abs(a.length - 320) - Math.abs(b.length - 320))[0];
  let description = cleanText(usefulParagraph || $('meta[property="og:description"]').attr('content') || bodyText.slice(0, 500));
  const datetimes = $('time[datetime]').map((_, item) => $(item).attr('datetime')).get().filter(Boolean);
  const fallbackDate = parseFallbackDate(bodyText);
  const urlDate = parseNoguchiUrlDate(url);
  const startDate = datetimes[0] || fallbackDate?.startDate || urlDate?.startDate;
  const endDate = datetimes[1] || fallbackDate?.endDate || urlDate?.endDate || startDate;
  description = removeConflictingDateCopy(description, startDate);
  if (!title || !startDate) return [];
  return [{
    title, description, startDate, endDate, attendanceMode: /\bonline\b/i.test(bodyText.slice(0, 1200)) ? 'online' : 'offline',
    categories: source.defaultCategories, tags: [], image: $('meta[property="og:image"]').attr('content') || null,
    registrationUrl: bestRegistrationUrl($, url),
    venue: source.venue || { name: source.name, address: 'Queens, NY', neighborhood: 'Queens', latitude: null, longitude: null },
    organizer: { name: source.name, url: source.organizerUrl },
    source: { name: source.name, listingUrl: source.listingUrl, canonicalUrl: url, retrievedAt, method: 'html' }
  }];
}

async function mapLimit(items, limit, handler) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await handler(items[index], index);
    }
  });
  await Promise.all(workers);
}

async function ingestSource(source) {
  const started = Date.now();
  const report = { id: source.id, name: source.name, status: 'ok', discovered: 0, accepted: 0, rejected: 0, rejections: [], errors: [], durationMs: 0 };
  const accepted = [];
  try {
    const listing = await fetchHtml(source.listingUrl);
    const $ = cheerio.load(listing);
    const links = [...new Set($('a[href]').map((_, a) => absolute($(a).attr('href'), source.listingUrl)).get().filter((href) => href && href.includes(source.linkPattern) && href !== source.listingUrl && !/\/page\/\d+\/?$/.test(href)))].slice(0, source.maxDetails ?? 40);
    report.discovered = links.length;
    if (!links.length) throw new Error('No matching event detail links discovered');
    await mapLimit(links, 6, async (link) => {
      try {
        const detail = await fetchHtml(link);
        const raws = parseDetail(detail, link, source);
        if (!raws.length) { report.rejected += 1; if (report.rejections.length < 5) report.rejections.push({ link, reasons: ['could not extract title/date from page'] }); return; }
        for (const raw of raws) {
          const event = normalizeEvent(raw);
          const errors = validateEvent(event);
          const when = new Date(event.startDate);
          if (when < oldest || when > newest) errors.push(`outside rolling publication window (${event.startDate})`);
          if (errors.length) { report.rejected += 1; if (report.rejections.length < 5) report.rejections.push({ link, reasons: errors }); continue; }
          accepted.push(event); report.accepted += 1;
        }
      } catch (error) { report.rejected += 1; report.errors.push(`${link}: ${error.message}`); }
    });
  } catch (error) { report.status = 'failed'; report.errors.push(error.message); }
  report.durationMs = Date.now() - started;
  return { accepted, report };
}

const results = [];
const sourceReports = [];
for (const source of sources) {
  const result = await ingestSource(source);
  results.push(...result.accepted); sourceReports.push(result.report);
  console.log(`${source.name}: ${result.report.status}, ${result.report.accepted}/${result.report.discovered} accepted`);
}
let events = dedupeEvents(results);
const slugCounts = new Map();
for (const event of events) slugCounts.set(event.slug, (slugCounts.get(event.slug) || 0) + 1);
events = events.map((event) => slugCounts.get(event.slug) > 1
  ? { ...event, slug: `${event.slug}-${event.startDate.slice(0, 10)}` }
  : event);
let catalogStatus = 'fresh';
if (!events.length) {
  try {
    const lastGood = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/generated/events.json'), 'utf8'));
    if (Array.isArray(lastGood) && lastGood.length) {
      events = lastGood;
      catalogStatus = 'retained-last-good';
      console.warn(`No fresh events were accepted; retaining ${events.length} previously validated event(s).`);
    }
  } catch {}
}
const report = {
  generatedAt: new Date().toISOString(),
  catalogStatus,
  sources: sourceReports,
  totals: {
    discovered: sourceReports.reduce((sum, item) => sum + item.discovered, 0),
    accepted: results.length,
    published: events.length,
    rejected: sourceReports.reduce((sum, item) => sum + item.rejected, 0)
  }
};
await fs.mkdir(path.join(ROOT, 'src/data/generated'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'src/data/generated/events.json'), `${JSON.stringify(events, null, 2)}\n`);
await fs.writeFile(path.join(ROOT, 'src/data/generated/ingest-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${events.length} deduplicated events.`);
if (!events.length) process.exitCode = 2;
