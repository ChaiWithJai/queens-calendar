# Queens Calendar

A source-transparent community calendar for Queens. It ingests official event listings into a canonical schema, deduplicates them, places them on a real map, supports search and saved schedules, and publishes answer-first event and weekly editorial pages.

## System

- `config/sources.json` — official source registry and adapter settings
- `scripts/ingest-events.mjs` — discovery, extraction, normalization, Queens filtering, and deduplication
- `schemas/event.schema.json` — public canonical event contract
- `src/data/generated/` — reproducible catalog and ingest health report
- `src/components/VenueMap.astro` — Leaflet/OpenStreetMap exploration
- `src/pages/stories/` — event guides and weekly roundup pages with structured data
- `.github/workflows/ingest-events.yml` — daily refresh, validation, and catalog commit

The site never substitutes demo events when ingestion fails. `/sources` exposes failures and every published event retains its canonical URL, retrieval time, and extraction method.

## Commands

```bash
npm ci
npm run ingest
npm run check:release
npm run dev
```

The release check has three layers documented in `docs/release-test-matrix.md`: acceptance/E2E, built-site integration, and pipeline unit checks.

## Public surfaces

- `/events` — searchable calendar
- `/map` — interactive venue map
- `/schedule` — local saved-event agenda and calendar export
- `/stories` — answer-first event and weekly guides
- `/sources` — source provenance and pipeline health
- `/events/submit` — Netlify Forms community intake
- `/api/events`, `/api/schema`, `/api/ingest-report` — public JSON
- `/feed.xml`, `/sitemap.xml` — publishing feeds

Production: <https://queens-calendar.netlify.app>
