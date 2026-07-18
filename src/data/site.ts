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

export interface Host {
	id: string;
	name: string;
	type: 'individual' | 'company' | 'community';
	bio?: string;
	avatarUrl?: string;
	website?: string;
	socials: {
		twitter?: string;
		linkedin?: string;
		instagram?: string;
	};
	events: string[];
}

export interface Sponsor {
	id: string;
	name: string;
	tier: 'presenting' | 'gold' | 'silver' | 'community';
	logoUrl: string;
	logoDarkUrl?: string;
	website: string;
	description?: string;
	events: string[];
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
	tags: string[];
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

export const venues: Venue[] = [
	{
		id: 'newlab',
		name: 'New York Hall of Science',
		address: '47-01 111th St',
		neighborhood: 'Corona',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7475, lng: -73.8516 },
		capacity: 450,
		amenities: ['ADA access', 'High-speed Wi-Fi', 'Projectors'],
	},
	{
		id: 'civic-hall',
		name: 'Queens Museum',
		address: 'New York City Building, Flushing Meadows Corona Park',
		neighborhood: 'Flushing Meadows–Corona Park',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7458, lng: -73.8467 },
		capacity: 320,
		amenities: ['Livestream', 'Workshop rooms', 'Transit nearby'],
	},
	{
		id: 'battery-workshop',
		name: 'Museum of the Moving Image',
		address: '36-01 35th Ave',
		neighborhood: 'Astoria',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7563, lng: -73.9239 },
		capacity: 180,
		amenities: ['Standing desks', 'Fast Wi-Fi', 'Coffee bar'],
	},
	{
		id: 'ace-queens',
		name: 'Culture Lab LIC',
		address: '5-25 46th Ave',
		neighborhood: 'Long Island City',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7472, lng: -73.9542 },
		capacity: 220,
		amenities: ['Photo room', 'Podcast booth', 'Childcare room'],
	},
	{
		id: 'friends-brooklyn',
		name: 'Flushing Town Hall',
		address: '137-35 Northern Blvd',
		neighborhood: 'Flushing',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7639, lng: -73.8302 },
		capacity: 140,
		amenities: ['Community tables', 'Outdoor patio', 'Hybrid AV'],
	},
	{
		id: 'queens-district',
		name: 'Queensbridge Tech Lab',
		address: '10-43 41st Ave',
		neighborhood: 'Long Island City',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7447, lng: -73.9302 },
		capacity: 260,
		amenities: ['Demo stage', 'Recording rig', 'Subway access'],
	},
];

export const tracks: Track[] = [
	{
		id: 'great-civilization',
		slug: 'great-civilization',
		name: 'Great Civilization',
		description:
			'The civic-tech spine of the week: public-interest software, open data, and ambitious systems work for the city.',
		curatorId: 'jai-bhagat',
		eventIds: ['great-civilization-hackathon', 'civic-api-walkshop', 'shipping-city-night'],
		coverImage: placeholderImage('Great Civilization'),
		color: '#f9873e',
	},
	{
		id: 'south-asian-builders',
		slug: 'south-asian-builders',
		name: 'South Asian Builders',
		description:
			'Founder dinners, product demos, and peer sessions built around South Asian operator energy across NYC.',
		curatorId: 'south-asian-builders-nyc',
		eventIds: ['south-asian-builders-demo-night', 'desi-founder-breakfast', 'creative-tooling-jam'],
		coverImage: placeholderImage('South Asian Builders'),
		color: '#d5cbff',
	},
	{
		id: 'o1-builders',
		slug: 'o1-builders',
		name: 'O-1 Builders',
		description:
			'A practical track for immigrant founders navigating story, proof, talent, and company-building under pressure.',
		curatorId: 'o1-builders-collective',
		eventIds: ['o1-founder-office-hours', 'immigrant-operator-circle', 'visa-to-venture-fireside'],
		coverImage: placeholderImage('O-1 Builders'),
		color: '#d3fbda',
	},
	{
		id: 'agent-kitchen',
		slug: 'agent-kitchen',
		name: 'Agent Kitchen',
		description:
			'Build days and demos for agentic tooling, internal copilots, and AI infrastructure that ships this quarter.',
		curatorId: 'prompt-clinic',
		eventIds: ['agent-kitchen-build-day', 'devtools-agent-clinic', 'shipping-city-night'],
		coverImage: placeholderImage('Agent Kitchen'),
		color: '#ffddab',
	},
];

export const hosts: Host[] = [
	{
		id: 'jai-bhagat',
		name: 'Jai Bhagat',
		type: 'individual',
		bio: 'Community-builder behind Queens Calendar and Prompt Clinic. Focused on making discovery, curation, and attendance feel human again.',
		website: 'https://example.com',
		socials: { linkedin: 'https://www.linkedin.com' },
		events: [
			'great-civilization-hackathon',
			'o1-founder-office-hours',
			'shipping-city-night',
		],
	},
	{
		id: 'prompt-clinic',
		name: 'Prompt Clinic',
		type: 'community',
		bio: 'Hands-on labs for builders working with coding agents, AI workflows, and ambitious product experiments.',
		website: 'https://example.com',
		socials: { twitter: 'https://x.com' },
		events: ['agent-kitchen-build-day', 'devtools-agent-clinic', 'shipping-city-night'],
	},
	{
		id: 'south-asian-builders-nyc',
		name: 'South Asian Builders NYC',
		type: 'community',
		bio: 'A high-signal operator circle for South Asian founders, makers, and investors across the city.',
		website: 'https://example.com',
		socials: { instagram: 'https://instagram.com' },
		events: ['south-asian-builders-demo-night', 'desi-founder-breakfast', 'creative-tooling-jam'],
	},
	{
		id: 'o1-builders-collective',
		name: 'O-1 Builders Collective',
		type: 'community',
		bio: 'Immigrant founder network focused on storytelling, traction, and visa-aware company building.',
		website: 'https://example.com',
		socials: { linkedin: 'https://www.linkedin.com' },
		events: ['o1-founder-office-hours', 'immigrant-operator-circle', 'visa-to-venture-fireside'],
	},
	{
		id: 'civic-future-lab',
		name: 'Civic Future Lab',
		type: 'company',
		bio: 'Designing open-source city tooling with an emphasis on trust, transit, and public service interfaces.',
		website: 'https://example.com',
		socials: { twitter: 'https://x.com' },
		events: ['great-civilization-hackathon', 'civic-api-walkshop', 'shipping-city-night'],
	},
	{
		id: 'queens-creator-guild',
		name: 'Queens Creator Guild',
		type: 'community',
		bio: 'A cross-disciplinary home for builders working across motion, tools, and storytelling systems.',
		website: 'https://example.com',
		socials: { instagram: 'https://instagram.com' },
		events: ['creative-tooling-jam', 'brooklyn-builder-happy-hour'],
	},
];

export const sponsors: Sponsor[] = [
	{
		id: 'build-week-fund',
		name: 'Build Week Fund',
		tier: 'presenting',
		logoUrl: '/favicon.svg',
		website: 'https://example.com',
		description: 'Backs independent community infrastructure across the week.',
		events: ['great-civilization-hackathon', 'shipping-city-night'],
	},
	{
		id: 'community-rails',
		name: 'Community Rails',
		tier: 'gold',
		logoUrl: '/favicon.svg',
		website: 'https://example.com',
		description: 'Sponsors fintech and operator gatherings.',
		events: ['fintech-rails-roundtable', 'brooklyn-builder-happy-hour'],
	},
	{
		id: 'operator-map',
		name: 'Operator Map',
		tier: 'silver',
		logoUrl: '/favicon.svg',
		website: 'https://example.com',
		description: 'Keeps venue discovery and logistics smooth across boroughs.',
		events: ['o1-founder-office-hours', 'immigrant-operator-circle'],
	},
	{
		id: 'sunset-cloud',
		name: 'Sunset Cloud',
		tier: 'community',
		logoUrl: '/favicon.svg',
		website: 'https://example.com',
		description: 'Provides cloud credits for launch-night demos.',
		events: ['agent-kitchen-build-day', 'devtools-agent-clinic'],
	},
];

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
	return makeEvent({
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
		tags: item.tags,
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
});

function slugifyVenue(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Production listings only come from the normalized ingestion output. The legacy
// seed fixtures remain above temporarily for type/visual reference, but are never
// published when a source is unavailable.
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

export const hostsById = Object.fromEntries(hosts.map((host) => [host.id, host]));
export const sponsorsById = Object.fromEntries(sponsors.map((sponsor) => [sponsor.id, sponsor]));
export const tracksBySlug = Object.fromEntries(tracks.map((track) => [track.slug, track]));
export const eventsBySlug = Object.fromEntries(events.map((event) => [event.slug, event]));

export function getTrackEvents(trackId: string) {
	return events.filter((event) => event.track?.id === trackId);
}

export function getFeaturedEvents() {
	return events.filter((event) => event.isFeatured);
}

export function getFlagshipEvents() {
	return events.filter((event) => event.isFlagship);
}

export function getNeighborhoods() {
	return [...new Set(events.map((event) => event.venue.neighborhood))].sort();
}

export function getEventBySlug(slug: string) {
	return eventsBySlug[slug];
}

export function getTrackBySlug(slug: string) {
	return tracksBySlug[slug];
}
