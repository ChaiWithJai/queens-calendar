# Build Week NYC

An Astro-based frontend architecture for Build Week NYC, designed around fast event discovery, curated tracks, local-first saved schedules, and Vercel deployment.

## What ships in this repo

- Homepage with flagship events, curated tracks, and editorial neo-brutalist styling.
- Full `/events` directory with client-side search, faceted filters, URL syncing, and list / agenda / map views.
- Dynamic event and track detail pages generated from typed local data.
- `/schedule` page with localStorage-backed saved events and `.ics` calendar export.
- `/events/submit` Vercel-ready host submission flow with webhook or mail fallback.
- Static JSON endpoint at `/api/events`.

## Stack

- Astro 6
- TypeScript
- Self-hosted font packages for Plus Jakarta Sans and Be Vietnam Pro
- Static Astro output deployed on Vercel
- Optional Vercel Function at `/api/event-submission` for event intake forwarding

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

## Vercel

The site is ready for Vercel CLI deployment. Astro static output works on Vercel with zero adapter configuration, and the custom submission endpoint lives in the root `api/` directory for Vercel Functions.

Recommended CLI flow:

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel deploy
npx vercel deploy --prod
```

To attach the custom domain after the project exists:

```bash
npx vercel domains add techweeknyc.com <project-name>
npx vercel domains add www.techweeknyc.com <project-name>
npx vercel domains inspect techweeknyc.com
```

If DNS stays with an external registrar, point the apex and `www` records based on `vercel domains inspect`. If you move DNS to Vercel, use:

```bash
npx vercel dns add techweeknyc.com @ A 76.76.21.21
npx vercel dns add techweeknyc.com www CNAME cname.vercel-dns.com
```

## Submission Intake Environment

The `/events/submit` flow can forward submissions to any webhook that accepts JSON.

Optional environment variables:

```bash
EVENT_SUBMISSION_WEBHOOK_URL=
SUBMISSION_INBOX_EMAIL=hello@techweeknyc.com
```

Behavior:

- If `EVENT_SUBMISSION_WEBHOOK_URL` is set, submissions post there and redirect to the success page.
- If it is not set, the UI falls back to opening a prefilled email draft using `SUBMISSION_INBOX_EMAIL`.

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
