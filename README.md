# Build Week NYC

An Astro-based frontend architecture for Build Week NYC, designed around fast event discovery, curated tracks, local-first saved schedules, and Netlify deployment.

## What ships in this repo

- Homepage with flagship events, curated tracks, and editorial neo-brutalist styling.
- Full `/events` directory with client-side search, faceted filters, URL syncing, and list / agenda / map views.
- Dynamic event and track detail pages generated from typed local data.
- `/schedule` page with localStorage-backed saved events and `.ics` calendar export.
- `/events/submit` Netlify Forms-backed host submission flow.
- Static JSON endpoint at `/api/events`.

## Stack

- Astro 6
- TypeScript
- Self-hosted font packages for Plus Jakarta Sans and Be Vietnam Pro
- Static Astro output deployed on Netlify
- Netlify Forms for event submission intake

## Run locally

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run check
npm run build
npm run preview -- --port 4323
```

## Netlify

The site is ready for Netlify static deployment. Astro outputs to `dist/`, and the event intake form is configured for Netlify Forms with AJAX submission plus a no-JS fallback.

Recommended CLI flow:

```bash
npx netlify status
npx netlify deploy --create-site --prod
```

If the site is already linked, later deploys are:

```bash
npx netlify deploy
npx netlify deploy --prod
```

## Custom Domain with Vercel DNS

`techweeknyc.com` can stay registered and DNS-managed at Vercel while the site is hosted on Netlify.

1. Add `techweeknyc.com` to the Netlify site as the custom domain.
2. In Vercel DNS, point the apex domain to Netlify.
3. Point `www` to the Netlify subdomain.

Recommended records for standard Netlify external DNS:

```bash
# apex
ALIAS/ANAME @ apex-loadbalancer.netlify.com

# fallback if ALIAS/ANAME is unavailable
A @ 75.2.60.5

# www
CNAME www <your-netlify-site>.netlify.app
```

After the DNS records propagate, Netlify provisions TLS automatically. Keep only one apex A/ALIAS target for the site to avoid certificate issues.

## Routes

- `/`
- `/events`
- `/events/[slug]`
- `/events/submit`
- `/tracks`
- `/tracks/[slug]`
- `/schedule`
- `/map`
- `/sponsors`
- `/about`
- `/api/events`
