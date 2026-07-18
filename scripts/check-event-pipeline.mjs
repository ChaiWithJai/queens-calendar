import assert from 'node:assert/strict';
import { buildAeo, categoryGuess, dedupeEvents, isoWeekKey, normalizeEvent, slugify, validateEvent } from './lib/event-pipeline.mjs';

assert.equal(slugify('Queens Night: Art + AI!'), 'queens-night-art-ai');
assert.equal(isoWeekKey('2026-07-18T18:00:00-04:00'), '2026-W29');
assert(categoryGuess('An AI film and community art workshop', []).includes('technology'));
assert(categoryGuess('An AI film and community art workshop', []).includes('arts-culture'));
const base = {
  title: 'Queens Night', description: 'A community arts and technology program for neighbors.', startDate: '2026-09-09T18:00:00-04:00', endDate: '2026-09-09T19:30:00-04:00',
  categories: ['community'], venue: { name: 'Queens Museum', address: 'Queens, NY', neighborhood: 'Corona', latitude: 40.7458, longitude: -73.8467 },
  organizer: { name: 'Queens Museum', url: 'https://queensmuseum.org/' }, source: { name: 'Queens Museum', listingUrl: 'https://queensmuseum.org/event/', canonicalUrl: 'https://queensmuseum.org/event/queens-night/', retrievedAt: new Date().toISOString(), method: 'html' }
};
const event = normalizeEvent(base);
assert.deepEqual(validateEvent(event), []);
assert.equal(buildAeo(event).faqs.length, 3);
assert.equal(dedupeEvents([event, { ...event, description: `${event.description} More detail.` }]).length, 1);
console.log('event pipeline checks passed');
