import scrapedCatalog from './generated/events.json';

export type ISO8601 = string;
export type CalendarDate = string;

export type EventVertical =
	| 'civic-tech'
	| 'south-asian'
	| 'immigrant'
	| 'ai-agents'
	| 'fintech'
	| 'healthtech'
	| 'climate'
	| 'devtools'
	| 'creative'
	| 'community'
	| 'general';

export type EventFormat =
	| 'hackathon'
	| 'demo-night'
	| 'workshop'
	| 'panel'
	| 'fireside'
	| 'happy-hour'
	| 'office-hours'
	| 'keynote'
	| 'build-day'
	| 'performance'
	| 'exhibition'
	| 'screening'
	| 'community-meetup';

export type DayLabel =
	| 'Monday'
	| 'Tuesday'
	| 'Wednesday'
	| 'Thursday'
	| 'Friday'
	| 'Saturday'
	| 'Sunday';

export interface ImageAsset {
	url: string;
	alt: string;
	width: number;
	height: number;
	blurhash?: string;
}

export interface Venue {
	id: string;
	name: string;
	address: string;
	neighborhood: string;
	borough?: string;
	city: string;
	coordinates: { lat: number; lng: number };
	capacity?: number;
	amenities: string[];
	imageUrl?: string;
}

export interface Track {
	id: string;
	slug: string;
	name: string;
	description: string;
	curatorId: string;
	eventIds: string[];
	coverImage: ImageAsset;
	color: string;
}

export interface UserSchedule {
	savedEventIds: string[];
	rsvpdEventIds: string[];
	preferences: {
		verticals: EventVertical[];
		formats: EventFormat[];
		neighborhoods: string[];
	};
}

export interface Event {
	id: string;
	slug: string;
	title: string;
	subtitle?: string;
	description: string;
	shortDescription: string;
	startTime: ISO8601;
	endTime: ISO8601;
	timezone: string;
	date: CalendarDate;
	dayOfWeek: DayLabel;
	venue: Venue;
	isVirtual: boolean;
	virtualUrl?: string;
	vertical: EventVertical;
	format: EventFormat;
	categories: string[];
	tags: string[];
	price?: string | null;
	track?: Track;
	capacity?: number;
	rsvpCount: number;
	status: 'upcoming' | 'live' | 'past' | 'cancelled';
	isFeatured: boolean;
	isFlagship: boolean;
	externalProvider: 'luma' | 'partiful' | 'eventbrite' | 'manual';
	externalId?: string;
	externalUrl: string;
	hostId: string;
	coHostIds: string[];
	speakerIds: string[];
	sponsorIds: string[];
	coverImage: ImageAsset;
	thumbnailImage: ImageAsset;
	createdAt: ISO8601;
	updatedAt: ISO8601;
	submittedBy: string;
	approvalStatus: 'pending' | 'approved' | 'rejected';
	source?: {
		name: string;
		listingUrl: string;
		canonicalUrl: string;
		retrievedAt: string;
		method: string;
	};
	answerSummary?: string;
	faqs?: Array<{ question: string; answer: string }>;
	weekKey?: string;
}

const placeholderImage = (title: string): ImageAsset => ({
	url: '/favicon.svg',
	alt: `${title} editorial artwork`,
	width: 1600,
	height: 1200,
});

const createdAt = '2026-04-15T08:30:00-04:00';
const updatedAt = '2026-04-15T08:30:00-04:00';

const makeEvent = (event: Omit<Event, 'coverImage' | 'thumbnailImage' | 'createdAt' | 'updatedAt'>): Event => ({
	...event,
	coverImage: placeholderImage(event.title),
	thumbnailImage: placeholderImage(event.title),
	createdAt,
	updatedAt,
});


const verticalForCategories = (categories: string[]): EventVertical => {
	if (categories.includes('arts-culture')) return 'creative';
	if (categories.includes('technology')) return 'ai-agents';
	if (categories.includes('civic')) return 'civic-tech';
	return 'community';
};
const formatForEvent = (title: string): EventFormat => {
	const value = title.toLowerCase();
	if (/workshop|class|studio/.test(value)) return 'workshop';
	if (/screening|film|movie/.test(value)) return 'screening';
	if (/exhibition|gallery|opening/.test(value)) return 'exhibition';
	if (/concert|performance|recital|dance|theater|theatre/.test(value)) return 'performance';
	if (/panel|talk|conversation|session/.test(value)) return 'panel';
	return 'community-meetup';
};

const scrapedEvents: Event[] = scrapedCatalog.map((item) => {
	const start = new Date(item.startDate);
	const date = new Intl.DateTimeFormat('en-CA', { timeZone: item.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(start);
	const event = makeEvent({
		id: item.id,
		slug: item.slug,
		title: item.title,
		description: item.description,
		shortDescription: item.answerSummary,
		startTime: item.startDate,
		endTime: item.endDate,
		timezone: item.timezone,
		date,
		dayOfWeek: new Intl.DateTimeFormat('en-US', { timeZone: item.timezone, weekday: 'long' }).format(start) as DayLabel,
		venue: {
			id: slugifyVenue(item.venue.name),
			name: item.venue.name,
			address: item.venue.address,
			neighborhood: item.venue.neighborhood,
			borough: 'Queens',
			city: 'New York',
			coordinates: { lat: item.venue.latitude, lng: item.venue.longitude },
			amenities: [],
		},
		isVirtual: item.attendanceMode === 'online',
		virtualUrl: item.attendanceMode === 'online' ? item.registrationUrl : undefined,
		vertical: verticalForCategories(item.categories),
		format: formatForEvent(item.title),
		categories: item.categories,
		tags: item.tags,
		price: item.price,
		rsvpCount: 0,
		status: item.status === 'cancelled' ? 'cancelled' : 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'manual',
		externalUrl: item.registrationUrl,
		hostId: `source-${slugifyVenue(item.organizer.name)}`,
		coHostIds: [],
		speakerIds: [],
		sponsorIds: [],
		submittedBy: item.source.name,
		approvalStatus: 'approved',
		source: item.source,
		answerSummary: item.answerSummary,
		faqs: item.faqs,
		weekKey: item.weekKey,
	});
	if (!item.image) return event;
	const artwork = { url: item.image, alt: `${item.title} event artwork`, width: 1600, height: 1200 };
	return { ...event, coverImage: artwork, thumbnailImage: artwork };
});

function slugifyVenue(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const events: Event[] = scrapedEvents;

export const siteStats = [
	{ label: 'Published events', value: String(events.length) },
	{ label: 'Neighborhoods', value: String(new Set(events.map((event) => event.venue.neighborhood)).size) },
	{ label: 'Official sources', value: String(new Set(events.map((event) => event.source?.name).filter(Boolean)).size) },
	{ label: 'Mapped venues', value: String(new Set(events.map((event) => event.venue.id)).size) },
];

export const defaultSchedule: UserSchedule = {
	savedEventIds: [],
	rsvpdEventIds: [],
	preferences: {
		verticals: [],
		formats: [],
		neighborhoods: [],
	},
};

export const eventsBySlug = Object.fromEntries(events.map((event) => [event.slug, event]));

export function getNeighborhoods() {
	return [...new Set(events.map((event) => event.venue.neighborhood))].sort();
}

export function getEventBySlug(slug: string) {
	return eventsBySlug[slug];
}
