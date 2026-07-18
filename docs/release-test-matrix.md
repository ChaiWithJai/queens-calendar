# Release test matrix

Exactly three layers gate a release.

## 1. Acceptance / end-to-end

- Load the homepage and browse the current sourced event catalog.
- Use date, neighborhood, and category filters in the calendar.
- Open the map, pan and zoom, open a marker, and follow its event link.
- Save an event, confirm it appears in Saved, and export its calendar file.
- Open an event story and its weekly roundup.
- Submit the community-event form and confirm the Netlify success flow.

## 2. Integration

Run `npm run check:release`. After the static build, `scripts/check-built-site.mjs` verifies public routes, JSON endpoints, source provenance, coordinates, structured data, sitemap coverage, RSS, and Netlify form markup. It also proves the deleted tracks and sponsor routes are absent.

## 3. Unit / data pipeline

Run `npm run check:pipeline`. It exercises normalization, ISO week assignment, AEO answer/FAQ generation, schema validation, and deterministic deduplication.
