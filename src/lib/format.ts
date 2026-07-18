import type { Event, EventFormat, EventVertical } from '../data/site';

const shortDayFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	month: 'short',
	day: 'numeric',
});

const longDayFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	weekday: 'long',
	month: 'long',
	day: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	weekday: 'short',
	month: 'short',
	day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/New_York',
	hour: 'numeric',
	minute: '2-digit',
});

export const verticalLabels: Record<EventVertical, string> = {
	'civic-tech': 'Civic tech',
	'south-asian': 'South Asian builders',
	immigrant: 'Immigrant founders',
	'ai-agents': 'AI agents',
	fintech: 'Fintech',
	healthtech: 'Healthtech',
	climate: 'Climate',
	devtools: 'Devtools',
	creative: 'Creative tools',
	community: 'Community',
	general: 'General',
};

export const formatLabels: Record<EventFormat, string> = {
	hackathon: 'Hackathon',
	'demo-night': 'Demo night',
	workshop: 'Workshop',
	panel: 'Panel',
	fireside: 'Fireside',
	'happy-hour': 'Happy hour',
	'office-hours': 'Office hours',
	keynote: 'Keynote',
	'build-day': 'Build day',
	performance: 'Performance',
	exhibition: 'Exhibition',
	screening: 'Screening',
	'community-meetup': 'Community meetup',
};

export function formatDateLabel(date: string) {
	return shortDayFormatter.format(new Date(`${date}T00:00:00-04:00`));
}

export function formatLongDateLabel(date: string) {
	return longDayFormatter.format(new Date(`${date}T00:00:00-04:00`));
}

export function formatWeekdayLabel(date: string) {
	return weekdayFormatter.format(new Date(`${date}T00:00:00-04:00`));
}

export function formatTime(value: string) {
	return timeFormatter.format(new Date(value));
}

export function formatTimeRange(start: string, end: string) {
	return `${formatTime(start)} to ${formatTime(end)}`;
}

export function getSpotsLabel(event: Event) {
	if (!event.capacity) {
		return `${event.rsvpCount}+ RSVPs`;
	}

	const remaining = Math.max(event.capacity - event.rsvpCount, 0);
	if (remaining <= 12) {
		return `${remaining} spots left`;
	}

	return `${event.rsvpCount}/${event.capacity} claimed`;
}

export function getEventStatusCopy(event: Event) {
	if (event.status === 'live') {
		return 'Live now';
	}
	if (event.status === 'past') {
		return 'Wrapped';
	}
	if (event.status === 'cancelled') {
		return 'Cancelled';
	}
	return 'Upcoming';
}

export function sortEvents(events: Event[]) {
	return [...events].sort(
		(a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
	);
}

export function groupEventsByDate(events: Event[]) {
	return sortEvents(events).reduce<Record<string, Event[]>>((groups, event) => {
		groups[event.date] ??= [];
		groups[event.date].push(event);
		return groups;
	}, {});
}
