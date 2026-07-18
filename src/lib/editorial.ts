import type { Event } from '../data/site';
import { events } from '../data/site';

export const eventsByWeek = Object.groupBy(events, (event) => event.weekKey ?? 'unscheduled');

export function eventStory(event: Event) {
	const date = new Intl.DateTimeFormat('en-US', { timeZone: event.timezone, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(event.startTime));
	const outside = event.categories.includes('parks-outdoors');
	const family = event.categories.includes('family');
	const handsOn = /workshop|volunteer|farm|horticulture|compost|cyanotype/i.test(event.title);
	const usefulFor = [outside ? 'getting outside' : '', family ? 'bringing kids' : '', handsOn ? 'doing something hands-on' : ''].filter(Boolean);
	return {
		headline: `${event.title} in Queens: the useful version`,
		dek: event.answerSummary ?? `${event.title} takes place ${date} in ${event.venue.neighborhood}.`,
		paragraphs: [
			`The short version: ${event.title} starts ${date} at ${event.venue.name} in ${event.venue.neighborhood}. ${usefulFor.length ? `Put it on the list if you are looking for ${usefulFor.join(' or ')}.` : ''}`,
			event.description,
			`Before you head out, use the organizer link below to confirm availability and any last-minute changes. We keep the original source beside every listing so this guide stays useful without pretending to replace the host.`,
		],
	};
}

export function weekStory(_weekKey: string, weekEvents: Event[]) {
	const neighborhoods = [...new Set(weekEvents.map((event) => event.venue.neighborhood))];
	const topics = [...new Set(weekEvents.map((event) => event.vertical.replaceAll('-', ' ')))];
	const sorted = [...weekEvents].sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
	const first = sorted[0] ? new Date(sorted[0].startTime) : new Date();
	const last = sorted.at(-1) ? new Date(sorted.at(-1)!.startTime) : first;
	const range = `${new Intl.DateTimeFormat('en-US', { month:'long', day:'numeric' }).format(first)}–${new Intl.DateTimeFormat('en-US', { month:first.getMonth() === last.getMonth() ? undefined : 'long', day:'numeric' }).format(last)}`;
	return {
		headline: `${weekEvents.length} ${weekEvents.length === 1 ? 'thing' : 'things'} to do in Queens, ${range}`,
		dek: `A sendable week plan across ${neighborhoods.join(', ') || 'Queens'}—with every time, place, and registration link checked against the original organizer.`,
		neighborhoods,
		topics,
		range,
	};
}
