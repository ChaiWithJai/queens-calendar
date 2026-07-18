import { events } from '../data/site';
import { eventStory } from '../lib/editorial';
export const prerender = true;
const xml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[char] ?? char));
export function GET() {
	const items = events.map((event) => { const story = eventStory(event); return `<item><title>${xml(story.headline)}</title><link>https://queens-calendar.netlify.app/stories/events/${event.slug}</link><guid>https://queens-calendar.netlify.app/stories/events/${event.slug}</guid><description>${xml(story.dek)}</description><pubDate>${new Date(event.source?.retrievedAt ?? event.startTime).toUTCString()}</pubDate></item>`; }).join('');
	return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Queens Calendar stories</title><link>https://queens-calendar.netlify.app/stories</link><description>Source-backed Queens event guides and weekly roundups.</description>${items}</channel></rss>`, { headers:{ 'Content-Type':'application/rss+xml; charset=utf-8', 'Cache-Control':'public, max-age=3600' } });
}
