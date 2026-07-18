import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const exists = (path) => access(new URL(`../dist/${path}`, import.meta.url));

await Promise.all([
	exists('index.html'),
	exists('events/index.html'),
	exists('map/index.html'),
	exists('stories/index.html'),
	exists('sources/index.html'),
	exists('api/events'),
	exists('api/schema'),
	exists('api/ingest-report'),
	exists('feed.xml'),
	exists('sitemap.xml'),
]);

const [home, map, sources, submission, catalog, schema, sitemap] = await Promise.all([
	read('index.html'),
	read('map/index.html'),
	read('sources/index.html'),
	read('events/submit/index.html'),
	read('api/events'),
	read('api/schema'),
	read('sitemap.xml'),
]);

assert.match(home, /THE SHORT LIST/);
assert.match(home, /Send this week’s picks/);
assert.match(home, /data-share-week/);
assert.match(home, /https:\/\/queens-calendar\.netlify\.app\/images\/social\/queens-calendar-og\.png/);
assert.match(map, /leaflet/i);
assert.match(sources, /Provenance ledger/);
assert.match(submission, /data-netlify="true"/);
assert.match(submission, /name="form-name" value="event-submission"/);
const schedule = await read('schedule/index.html');
assert.match(schedule, /data-share-schedule/);
assert.match(schedule, /new URLSearchParams\(window\.location\.search\)/);
assert.doesNotMatch(home, /Great Civilization Hackathon|O-1 Founder Office Hours/);

const events = JSON.parse(catalog);
const eventSchema = JSON.parse(schema);
assert.ok(Array.isArray(events));
assert.equal(new Set(events.map((event) => event.slug)).size, events.length, 'event slugs must be unique');
const now = new Date();
const twoWeeks = new Date(now.getTime() + 14 * 86400000);
const nearTerm = events.filter((event) => new Date(event.endDate) >= now && new Date(event.startDate) < twoWeeks);
assert.ok(nearTerm.length >= 6, `weekly product needs at least 6 events in the next 14 days; found ${nearTerm.length}`);
assert.ok(new Set(events.map((event) => event.source?.name).filter(Boolean)).size >= 3, 'catalog needs at least 3 reporting sources');
const expectedEasternTime = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(new Date(nearTerm[0].startDate));
assert.ok(home.includes(expectedEasternTime), `homepage must render event times in Eastern Time; expected ${expectedEasternTime}`);
assert.equal(eventSchema.title, 'Queens Calendar Event');
for (const event of events) {
	assert.ok(event.source?.canonicalUrl, `${event.title} lacks source provenance`);
	assert.ok(Number.isFinite(event.venue?.latitude) && Number.isFinite(event.venue?.longitude), `${event.title} lacks map coordinates`);
	assert.match(sitemap, new RegExp(`/events/${event.slug}`));
	assert.match(sitemap, new RegExp(`/stories/events/${event.slug}`));
	const detail = await read(`events/${event.slug}/index.html`);
	assert.match(detail, /schema.org\/Event/);
	assert.match(detail, /Quick answer/);
}

await assert.rejects(exists('tracks/index.html'));
await assert.rejects(exists('sponsors/index.html'));

console.log(`Built-site integration checks passed (${events.length} sourced events).`);
