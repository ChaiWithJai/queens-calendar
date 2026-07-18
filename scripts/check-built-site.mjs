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

assert.match(home, /Editorial publishing/);
assert.match(map, /leaflet/i);
assert.match(sources, /Provenance ledger/);
assert.match(submission, /data-netlify="true"/);
assert.match(submission, /name="form-name" value="event-submission"/);
assert.doesNotMatch(home, /Great Civilization Hackathon|O-1 Founder Office Hours/);

const events = JSON.parse(catalog);
const eventSchema = JSON.parse(schema);
assert.ok(Array.isArray(events));
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
