import crypto from 'node:crypto';

export const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);

export function isoWeekKey(dateValue) {
  const date = new Date(dateValue);
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function categoryGuess(text, defaults = ['community']) {
  const value = text.toLowerCase();
  const categories = new Set(defaults);
  if (/art|museum|film|music|dance|theater|theatre|exhibition|poetry|culture|screening|performance/.test(value)) categories.add('arts-culture');
  if (/tech|digital|ai\b|coding|science|game|media lab|robot|data/.test(value)) categories.add('technology');
  if (/family|children|kids|teen|youth/.test(value)) categories.add('family');
  if (/food|market|cook|culinary/.test(value)) categories.add('food');
  if (/sport|soccer|basketball|fitness|run|yoga/.test(value)) categories.add('sports');
  if (/civic|public|volunteer|neighborhood|community/.test(value)) categories.add('community');
  return [...categories];
}

export function buildAeo(event) {
  const when = new Intl.DateTimeFormat('en-US', { timeZone: event.timezone, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(event.startDate));
  const where = event.attendanceMode === 'online' ? 'online' : `at ${event.venue.name} in ${event.venue.neighborhood}, Queens`;
  return {
    answerSummary: `${event.title} is happening ${when} ${where}. ${event.description}`.replace(/\s+/g, ' ').slice(0, 360),
    faqs: [
      { question: `When is ${event.title}?`, answer: `${event.title} starts ${when}.` },
      { question: `Where is ${event.title}?`, answer: event.attendanceMode === 'online' ? 'This event is online.' : `${event.venue.name}, ${event.venue.address}.` },
      { question: `How do I register for ${event.title}?`, answer: `Use the organizer's registration link. Queens Calendar links directly to ${event.organizer.name}, the event source.` }
    ]
  };
}

export function normalizeEvent(raw) {
  const slug = slugify(raw.slug || raw.title);
  const sourceKey = raw.source?.canonicalUrl || raw.registrationUrl || `${raw.title}|${raw.startDate}`;
  const id = `qc_${crypto.createHash('sha256').update(sourceKey).digest('hex').slice(0, 16)}`;
  const event = {
    id, slug, title: raw.title.trim(), description: raw.description.replace(/\\n/g, ' ').replace(/\\'/g, "'").replace(/\s+/g, ' ').trim(),
    startDate: new Date(raw.startDate).toISOString(), endDate: new Date(raw.endDate || raw.startDate).toISOString(),
    timezone: 'America/New_York', status: raw.status || 'scheduled', attendanceMode: raw.attendanceMode || 'offline',
    categories: categoryGuess(`${raw.title} ${raw.description}`, raw.categories), tags: raw.tags || [], image: raw.image || null,
    price: raw.price || null, registrationUrl: raw.registrationUrl || raw.source.canonicalUrl,
    venue: raw.venue, organizer: raw.organizer, source: raw.source
  };
  event.weekKey = isoWeekKey(event.startDate);
  Object.assign(event, buildAeo(event));
  return event;
}

export function validateEvent(event) {
  const errors = [];
  for (const field of ['id','slug','title','description','startDate','endDate','timezone','weekKey','answerSummary']) if (!event[field]) errors.push(`missing ${field}`);
  if (Number.isNaN(Date.parse(event.startDate))) errors.push('invalid startDate');
  if (!event.venue?.name || !Number.isFinite(event.venue?.latitude) || !Number.isFinite(event.venue?.longitude)) errors.push('venue requires name and coordinates');
  if (!event.source?.canonicalUrl) errors.push('missing source canonicalUrl');
  if (!Array.isArray(event.faqs) || event.faqs.length < 3) errors.push('requires three FAQs');
  return errors;
}

export function dedupeEvents(events) {
  const chosen = new Map();
  for (const event of events) {
    const key = `${slugify(event.title)}|${event.startDate.slice(0, 10)}|${slugify(event.venue.name)}`;
    if (!chosen.has(key) || event.description.length > chosen.get(key).description.length) chosen.set(key, event);
  }
  return [...chosen.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}
