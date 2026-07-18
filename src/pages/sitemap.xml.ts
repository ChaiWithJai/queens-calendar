import { events } from '../data/site';
export const prerender = true;
export function GET() {
	const base = 'https://queens-calendar.netlify.app';
	const staticPaths = ['', '/events', '/map', '/stories', '/sources', '/events/submit', '/about'];
	const paths = [...staticPaths, ...events.flatMap((event) => [`/events/${event.slug}`, `/stories/events/${event.slug}`]), ...new Set(events.map((event) => `/stories/weeks/${event.weekKey}`))];
	const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${base}${path}</loc></url>`).join('')}</urlset>`;
	return new Response(body, { headers: { 'Content-Type':'application/xml', 'Cache-Control':'public, max-age=3600' } });
}
