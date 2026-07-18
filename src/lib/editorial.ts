import type { Event } from '../data/site';
import { events } from '../data/site';

export const eventsByWeek = Object.groupBy(events, (event) => event.weekKey ?? 'unscheduled');

export function eventStory(event: Event) {
	const date = new Intl.DateTimeFormat('en-US', { timeZone: event.timezone, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(event.startTime));
	return {
		headline: `${event.title}: what to know before you go`,
		dek: event.answerSummary ?? `${event.title} takes place ${date} in ${event.venue.neighborhood}.`,
		paragraphs: [
			`${event.title} is part of the week’s ${event.vertical.replaceAll('-', ' ')} calendar in Queens. It starts ${date} and is organized by ${event.source?.name ?? 'a Queens community organizer'}.`,
			event.description,
			`Why it matters: the listing connects people directly to a borough institution or organizer while keeping the event discoverable by date, neighborhood, topic, and map location.`,
		],
	};
}

export function weekStory(weekKey: string, weekEvents: Event[]) {
	const neighborhoods = [...new Set(weekEvents.map((event) => event.venue.neighborhood))];
	const topics = [...new Set(weekEvents.map((event) => event.vertical.replaceAll('-', ' ')))];
	return {
		headline: `What’s happening in Queens during ${weekKey}`,
		dek: `${weekEvents.length} sourced ${weekEvents.length === 1 ? 'event' : 'events'} across ${neighborhoods.join(', ')} covering ${topics.join(', ')}.`,
		neighborhoods,
		topics,
	};
}
