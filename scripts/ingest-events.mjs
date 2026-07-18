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

const cleanText = (value = '') => cheerio.load(`<div>${value}</div>`).text().replace(/\s+/g, ' ').trim();
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

function imageUrl(image) {
  if (typeof image === 'string') return image;
  if (Array.isArray(image)) return imageUrl(image[0]);
  return image?.url || image?.contentUrl || null;
}

function locationFromJson(location, fallback) {
  const address = typeof location?.address === 'string' ? location.address : [location?.address?.streetAddress, location?.address?.addressLocality, location?.address?.addressRegion, location?.address?.postalCode].filter(Boolean).join(', ');
  const lat = Number(location?.geo?.latitude);
  const lng = Number(location?.geo?.longitude);
  return {
    name: location?.name || fallback?.name || 'Queens venue',
    address: address || fallback?.address || 'Queens, NY',
    neighborhood: fallback?.neighborhood || location?.address?.addressLocality || 'Queens',
    latitude: Number.isFinite(lat) ? lat : fallback?.latitude,
    longitude: Number.isFinite(lng) ? lng : fallback?.longitude
  };
}

function parseDetail(html, url, source) {
  const $ = cheerio.load(html);
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  if (source.includeText && !bodyText.toLowerCase().includes(source.includeText.toLowerCase())) return [];
  const jsonEvents = [];
  $('script[type="application/ld+json"]').each((_, script) => {
    try { flattenJsonLd(JSON.parse($(script).text()), jsonEvents); } catch {}
  });
  const retrievedAt = new Date().toISOString();
  const canonicalEvents = jsonEvents.filter((node) => {
    const nodeUrl = absolute(node.url, url);
    return nodeUrl && (nodeUrl === url || nodeUrl.replace(/\/$/, '') === url.replace(/\/$/, ''));
  });
  if (canonicalEvents.length) return canonicalEvents.map((node) => ({
    title: cleanText(node.name), description: cleanText(node.description || $('meta[property="og:description"]').attr('content') || node.name),
    startDate: node.startDate, endDate: node.endDate || node.startDate, attendanceMode: String(node.eventAttendanceMode || '').includes('Online') ? 'online' : 'offline',
    categories: source.defaultCategories, tags: [], image: imageUrl(node.image), price: node.offers?.price ? String(node.offers.price) : null,
    registrationUrl: node.offers?.url || node.url || url, venue: locationFromJson(node.location, source.venue),
    organizer: { name: node.organizer?.name || source.name, url: node.organizer?.url || source.organizerUrl },
    source: { name: source.name, listingUrl: source.listingUrl, canonicalUrl: url, retrievedAt, method: 'json-ld' }
  }));

  const title = cleanText($('meta[property="og:title"]').attr('content') || $('h1').first().text()).replace(/^.*?\|\s*/, '');
  const usefulParagraph = $('main p').map((_, paragraph) => cleanText($(paragraph).text())).get()
    .filter((value) => value.length > 80 && !/photo:|courtesy|images? \(|installation view|all rights reserved/i.test(value))
    .sort((a, b) => Math.abs(a.length - 320) - Math.abs(b.length - 320))[0];
  const description = cleanText(usefulParagraph || $('meta[property="og:description"]').attr('content') || bodyText.slice(0, 500));
  const datetimes = $('time[datetime]').map((_, item) => $(item).attr('datetime')).get().filter(Boolean);
  const fallbackDate = parseFallbackDate(bodyText);
  const startDate = datetimes[0] || fallbackDate?.startDate;
  const endDate = datetimes[1] || fallbackDate?.endDate || startDate;
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

async function ingestSource(source) {
  const started = Date.now();
  const report = { id: source.id, name: source.name, status: 'ok', discovered: 0, accepted: 0, rejected: 0, errors: [], durationMs: 0 };
  const accepted = [];
  try {
    const listing = await fetchHtml(source.listingUrl);
    const $ = cheerio.load(listing);
    const links = [...new Set($('a[href]').map((_, a) => absolute($(a).attr('href'), source.listingUrl)).get().filter((href) => href && href.includes(source.linkPattern) && href !== source.listingUrl))].slice(0, source.maxDetails ?? 40);
    report.discovered = links.length;
    if (!links.length) throw new Error('No matching event detail links discovered');
    for (const link of links) {
      try {
        const detail = await fetchHtml(link);
        for (const raw of parseDetail(detail, link, source)) {
          const event = normalizeEvent(raw);
          const errors = validateEvent(event);
          const when = new Date(event.startDate);
          if (when < oldest || when > newest) errors.push('outside rolling publication window');
          if (errors.length) { report.rejected += 1; continue; }
          accepted.push(event); report.accepted += 1;
        }
      } catch (error) { report.rejected += 1; report.errors.push(`${link}: ${error.message}`); }
    }
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
const events = dedupeEvents(results);
const report = {
  generatedAt: new Date().toISOString(),
  sources: sourceReports,
  totals: { discovered: sourceReports.reduce((sum, item) => sum + item.discovered, 0), accepted: events.length, rejected: sourceReports.reduce((sum, item) => sum + item.rejected, 0) }
};
await fs.mkdir(path.join(ROOT, 'src/data/generated'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'src/data/generated/events.json'), `${JSON.stringify(events, null, 2)}\n`);
await fs.writeFile(path.join(ROOT, 'src/data/generated/ingest-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${events.length} deduplicated events.`);
if (!events.length) process.exitCode = 2;
