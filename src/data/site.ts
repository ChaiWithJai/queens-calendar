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
	| 'build-day';

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
		name: 'Newlab Dock 72',
		address: '63 Flushing Ave, Building 212',
		neighborhood: 'Brooklyn Navy Yard',
		borough: 'Brooklyn',
		city: 'New York',
		coordinates: { lat: 40.7002, lng: -73.9724 },
		capacity: 450,
		amenities: ['ADA access', 'High-speed Wi-Fi', 'Projectors'],
	},
	{
		id: 'civic-hall',
		name: 'Civic Hall',
		address: '124 E 14th St',
		neighborhood: 'Union Square',
		borough: 'Manhattan',
		city: 'New York',
		coordinates: { lat: 40.7336, lng: -73.9871 },
		capacity: 320,
		amenities: ['Livestream', 'Workshop rooms', 'Transit nearby'],
	},
	{
		id: 'battery-workshop',
		name: 'Battery Workshop',
		address: '1 Battery Pl',
		neighborhood: 'Financial District',
		borough: 'Manhattan',
		city: 'New York',
		coordinates: { lat: 40.7047, lng: -74.0177 },
		capacity: 180,
		amenities: ['Standing desks', 'Fast Wi-Fi', 'Coffee bar'],
	},
	{
		id: 'ace-queens',
		name: 'Ace Queens Studio',
		address: '43-18 23rd St',
		neighborhood: 'Long Island City',
		borough: 'Queens',
		city: 'New York',
		coordinates: { lat: 40.7505, lng: -73.9469 },
		capacity: 220,
		amenities: ['Photo room', 'Podcast booth', 'Childcare room'],
	},
	{
		id: 'friends-brooklyn',
		name: 'Friends of Brooklyn Lab',
		address: '470 Vanderbilt Ave',
		neighborhood: 'Prospect Heights',
		borough: 'Brooklyn',
		city: 'New York',
		coordinates: { lat: 40.6786, lng: -73.9682 },
		capacity: 140,
		amenities: ['Community tables', 'Outdoor patio', 'Hybrid AV'],
	},
	{
		id: 'queens-district',
		name: 'Queens Founders District',
		address: '31-00 47th Ave',
		neighborhood: 'Sunnyside',
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
		bio: 'Community-builder behind Build Week NYC and Prompt Clinic. Focused on making discovery, curation, and attendance feel human again.',
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

export const events: Event[] = [
	makeEvent({
		id: 'great-civilization-hackathon',
		slug: 'great-civilization-hackathon',
		title: 'Great Civilization Hackathon',
		subtitle: 'Public-interest software that actually ships',
		description:
			'A full-day sprint for builders working on city APIs, public interfaces, and resident-friendly workflows. Expect working sessions, civic mentors, and a sharp closing demo hour.',
		shortDescription: 'A flagship civic-tech sprint for builders shipping public-interest tools in one day.',
		startTime: '2026-06-02T09:00:00-04:00',
		endTime: '2026-06-02T19:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-02',
		dayOfWeek: 'Tuesday',
		venue: venues[0],
		isVirtual: false,
		vertical: 'civic-tech',
		format: 'hackathon',
		tags: ['open-data', 'shipping', 'beginner-friendly'],
		track: tracks[0],
		capacity: 220,
		rsvpCount: 182,
		status: 'upcoming',
		isFeatured: true,
		isFlagship: true,
		externalProvider: 'luma',
		externalId: 'luma_gc_hack',
		externalUrl: 'https://lu.ma/great-civilization-hackathon',
		hostId: 'jai-bhagat',
		coHostIds: ['civic-future-lab'],
		speakerIds: ['jai-bhagat', 'civic-future-lab'],
		sponsorIds: ['build-week-fund'],
		submittedBy: 'jai-bhagat',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'civic-api-walkshop',
		slug: 'civic-api-walkshop',
		title: 'Open Streets and Civic APIs Walkshop',
		description:
			'A moving workshop through Lower Manhattan on how neighborhood interfaces, transportation data, and public service maps intersect in real life.',
		shortDescription: 'A street-level workshop on civic data, transit surfaces, and public-interface design.',
		startTime: '2026-06-02T13:00:00-04:00',
		endTime: '2026-06-02T15:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-02',
		dayOfWeek: 'Tuesday',
		venue: venues[2],
		isVirtual: false,
		vertical: 'civic-tech',
		format: 'workshop',
		tags: ['transit', 'maps', 'walkshop'],
		track: tracks[0],
		capacity: 80,
		rsvpCount: 59,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'eventbrite',
		externalId: 'eb_civic_walk',
		externalUrl: 'https://eventbrite.com/e/open-streets-civic-apis',
		hostId: 'civic-future-lab',
		coHostIds: ['jai-bhagat'],
		speakerIds: ['civic-future-lab'],
		sponsorIds: ['build-week-fund'],
		submittedBy: 'civic-future-lab',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'south-asian-builders-demo-night',
		slug: 'south-asian-builders-demo-night',
		title: 'South Asian Builders Demo Night',
		subtitle: 'Founder energy, product receipts, zero filler',
		description:
			'Ten founders, one sharp room, and demos that move from traction story to product proof without the usual VC theater.',
		shortDescription: 'A flagship demo night spotlighting South Asian founders and their newest builds.',
		startTime: '2026-06-03T18:30:00-04:00',
		endTime: '2026-06-03T21:30:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-03',
		dayOfWeek: 'Wednesday',
		venue: venues[3],
		isVirtual: false,
		vertical: 'south-asian',
		format: 'demo-night',
		tags: ['founders', 'community', 'product-demo'],
		track: tracks[1],
		capacity: 180,
		rsvpCount: 166,
		status: 'upcoming',
		isFeatured: true,
		isFlagship: true,
		externalProvider: 'luma',
		externalId: 'luma_sa_demo',
		externalUrl: 'https://lu.ma/south-asian-builders-demo-night',
		hostId: 'south-asian-builders-nyc',
		coHostIds: ['jai-bhagat'],
		speakerIds: ['south-asian-builders-nyc'],
		sponsorIds: ['sunset-cloud'],
		submittedBy: 'south-asian-builders-nyc',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'desi-founder-breakfast',
		slug: 'desi-founder-breakfast',
		title: 'Desi Founder Breakfast',
		description:
			'A small-table breakfast for operators talking fundraising, hiring, and the quiet systems that keep a company compounding.',
		shortDescription: 'A breakfast circle for South Asian founders trading practical operating notes.',
		startTime: '2026-06-03T08:30:00-04:00',
		endTime: '2026-06-03T10:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-03',
		dayOfWeek: 'Wednesday',
		venue: venues[4],
		isVirtual: false,
		vertical: 'south-asian',
		format: 'happy-hour',
		tags: ['founders', 'intimate', 'operator-notes'],
		track: tracks[1],
		capacity: 48,
		rsvpCount: 42,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'manual',
		externalUrl: 'https://techweeknyc.com/events/submit',
		hostId: 'south-asian-builders-nyc',
		coHostIds: [],
		speakerIds: ['south-asian-builders-nyc'],
		sponsorIds: [],
		submittedBy: 'south-asian-builders-nyc',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'o1-founder-office-hours',
		slug: 'o1-founder-office-hours',
		title: 'O-1 Founder Office Hours',
		subtitle: 'Story, evidence, and signal for immigrant founders',
		description:
			'An editorial-style office hour block covering O-1 narratives, evidence packaging, and what traction looks like when you are building under immigration constraints.',
		shortDescription: 'A flagship office-hours block for immigrant founders building toward O-1 proof.',
		startTime: '2026-06-04T11:00:00-04:00',
		endTime: '2026-06-04T14:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-04',
		dayOfWeek: 'Thursday',
		venue: venues[1],
		isVirtual: false,
		vertical: 'immigrant',
		format: 'office-hours',
		tags: ['immigrant-founders', 'career', 'story'],
		track: tracks[2],
		capacity: 120,
		rsvpCount: 104,
		status: 'upcoming',
		isFeatured: true,
		isFlagship: true,
		externalProvider: 'partiful',
		externalUrl: 'https://partiful.com/e/o1-founder-office-hours',
		hostId: 'o1-builders-collective',
		coHostIds: ['jai-bhagat'],
		speakerIds: ['o1-builders-collective', 'jai-bhagat'],
		sponsorIds: ['operator-map'],
		submittedBy: 'jai-bhagat',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'immigrant-operator-circle',
		slug: 'immigrant-operator-circle',
		title: 'Immigrant Operator Circle',
		description:
			'An evening circle for founders and operator-builders comparing tactical notes on hiring, visas, and staying ambitious without burning the system down.',
		shortDescription: 'An evening operator circle for immigrant founders comparing hard-won notes.',
		startTime: '2026-06-04T18:00:00-04:00',
		endTime: '2026-06-04T20:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-04',
		dayOfWeek: 'Thursday',
		venue: venues[4],
		isVirtual: false,
		vertical: 'immigrant',
		format: 'panel',
		tags: ['community', 'career', 'founders'],
		track: tracks[2],
		capacity: 90,
		rsvpCount: 64,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'manual',
		externalUrl: 'https://techweeknyc.com/events/immigrant-operator-circle',
		hostId: 'o1-builders-collective',
		coHostIds: [],
		speakerIds: ['o1-builders-collective'],
		sponsorIds: ['operator-map'],
		submittedBy: 'o1-builders-collective',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'visa-to-venture-fireside',
		slug: 'visa-to-venture-fireside',
		title: 'Visa to Venture Fireside',
		description:
			'A fireside session on turning immigration friction into a sharper operating system for company-building and narrative control.',
		shortDescription: 'A fireside on turning visa complexity into clearer founder strategy.',
		startTime: '2026-06-04T15:30:00-04:00',
		endTime: '2026-06-04T16:45:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-04',
		dayOfWeek: 'Thursday',
		venue: venues[1],
		isVirtual: true,
		virtualUrl: 'https://techweeknyc.com/live/visa-to-venture',
		vertical: 'immigrant',
		format: 'fireside',
		tags: ['remote', 'founders', 'storytelling'],
		track: tracks[2],
		capacity: 160,
		rsvpCount: 91,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'luma',
		externalId: 'luma_visa_venture',
		externalUrl: 'https://lu.ma/visa-to-venture',
		hostId: 'o1-builders-collective',
		coHostIds: ['jai-bhagat'],
		speakerIds: ['o1-builders-collective'],
		sponsorIds: [],
		submittedBy: 'o1-builders-collective',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'agent-kitchen-build-day',
		slug: 'agent-kitchen-build-day',
		title: 'Agent Kitchen Build Day',
		subtitle: 'Agents, copilots, and tooling with receipts',
		description:
			'Build a useful agent in public. Teams spend the day moving from workflow mapping to live demos with mentors focused on evaluation, latency, and UX.',
		shortDescription: 'A flagship build day for agentic workflows, devtools, and pragmatic AI product design.',
		startTime: '2026-06-05T10:00:00-04:00',
		endTime: '2026-06-05T18:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-05',
		dayOfWeek: 'Friday',
		venue: venues[5],
		isVirtual: false,
		vertical: 'ai-agents',
		format: 'build-day',
		tags: ['agents', 'devtools', 'prompting'],
		track: tracks[3],
		capacity: 180,
		rsvpCount: 149,
		status: 'upcoming',
		isFeatured: true,
		isFlagship: true,
		externalProvider: 'eventbrite',
		externalId: 'eb_agent_kitchen',
		externalUrl: 'https://eventbrite.com/e/agent-kitchen-build-day',
		hostId: 'prompt-clinic',
		coHostIds: ['jai-bhagat'],
		speakerIds: ['prompt-clinic'],
		sponsorIds: ['sunset-cloud'],
		submittedBy: 'prompt-clinic',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'devtools-agent-clinic',
		slug: 'devtools-agent-clinic',
		title: 'Devtools Agent Clinic',
		description:
			'A tightly scoped clinic on agent loops, evals, local tools, and where interaction design breaks when the model gets ambitious.',
		shortDescription: 'A practical clinic on developer tooling for agents, evals, and local workflows.',
		startTime: '2026-06-05T13:00:00-04:00',
		endTime: '2026-06-05T15:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-05',
		dayOfWeek: 'Friday',
		venue: venues[5],
		isVirtual: false,
		vertical: 'devtools',
		format: 'workshop',
		tags: ['coding-agents', 'evals', 'developer-experience'],
		track: tracks[3],
		capacity: 90,
		rsvpCount: 74,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'luma',
		externalId: 'luma_devtools_clinic',
		externalUrl: 'https://lu.ma/devtools-agent-clinic',
		hostId: 'prompt-clinic',
		coHostIds: [],
		speakerIds: ['prompt-clinic'],
		sponsorIds: ['sunset-cloud'],
		submittedBy: 'prompt-clinic',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'fintech-rails-roundtable',
		slug: 'fintech-rails-roundtable',
		title: 'Fintech Rails Roundtable',
		description:
			'Payment infra, compliance UX, and what founders wish they had known before the first bank partnership call.',
		shortDescription: 'A roundtable on fintech rails, compliance UX, and honest operating notes.',
		startTime: '2026-06-05T16:30:00-04:00',
		endTime: '2026-06-05T18:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-05',
		dayOfWeek: 'Friday',
		venue: venues[2],
		isVirtual: false,
		vertical: 'fintech',
		format: 'panel',
		tags: ['payments', 'compliance', 'operators'],
		capacity: 72,
		rsvpCount: 61,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'eventbrite',
		externalId: 'eb_fintech_rails',
		externalUrl: 'https://eventbrite.com/e/fintech-rails-roundtable',
		hostId: 'civic-future-lab',
		coHostIds: [],
		speakerIds: ['civic-future-lab'],
		sponsorIds: ['community-rails'],
		submittedBy: 'civic-future-lab',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'creative-tooling-jam',
		slug: 'creative-tooling-jam',
		title: 'Creative Tooling Jam',
		description:
			'A Queens studio night for creative technologists building with video, agents, interfaces, and playful media systems.',
		shortDescription: 'A creative-tech studio jam for builders working across motion, tools, and AI workflows.',
		startTime: '2026-06-06T11:00:00-04:00',
		endTime: '2026-06-06T14:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-06',
		dayOfWeek: 'Saturday',
		venue: venues[3],
		isVirtual: false,
		vertical: 'creative',
		format: 'workshop',
		tags: ['creative', 'video', 'editing'],
		track: tracks[1],
		capacity: 95,
		rsvpCount: 78,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'manual',
		externalUrl: 'https://techweeknyc.com/events/creative-tooling-jam',
		hostId: 'queens-creator-guild',
		coHostIds: ['south-asian-builders-nyc'],
		speakerIds: ['queens-creator-guild'],
		sponsorIds: [],
		submittedBy: 'queens-creator-guild',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'brooklyn-builder-happy-hour',
		slug: 'brooklyn-builder-happy-hour',
		title: 'Brooklyn Builder Happy Hour',
		description:
			'An easy close-out hang with founders, engineers, and designers who want a room that still feels local by the end of the week.',
		shortDescription: 'A relaxed neighborhood happy hour for founders, engineers, and designers.',
		startTime: '2026-06-06T18:00:00-04:00',
		endTime: '2026-06-06T20:30:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-06',
		dayOfWeek: 'Saturday',
		venue: venues[4],
		isVirtual: false,
		vertical: 'community',
		format: 'happy-hour',
		tags: ['community', 'social', 'networking'],
		capacity: 140,
		rsvpCount: 103,
		status: 'upcoming',
		isFeatured: false,
		isFlagship: false,
		externalProvider: 'partiful',
		externalUrl: 'https://partiful.com/e/brooklyn-builder-happy-hour',
		hostId: 'queens-creator-guild',
		coHostIds: ['jai-bhagat'],
		speakerIds: ['queens-creator-guild'],
		sponsorIds: ['community-rails'],
		submittedBy: 'queens-creator-guild',
		approvalStatus: 'approved',
	}),
	makeEvent({
		id: 'shipping-city-night',
		slug: 'shipping-city-night',
		title: 'Shipping City Night',
		description:
			'Closing-night showcase for the week: product demos, public-interest launches, and a room full of builders who actually want to test the thing.',
		shortDescription: 'The closing showcase for the week, packed with demos, launches, and fast feedback.',
		startTime: '2026-06-06T19:00:00-04:00',
		endTime: '2026-06-06T22:00:00-04:00',
		timezone: 'America/New_York',
		date: '2026-06-06',
		dayOfWeek: 'Saturday',
		venue: venues[0],
		isVirtual: false,
		vertical: 'general',
		format: 'demo-night',
		tags: ['showcase', 'launches', 'community'],
		track: tracks[0],
		capacity: 260,
		rsvpCount: 211,
		status: 'upcoming',
		isFeatured: true,
		isFlagship: false,
		externalProvider: 'luma',
		externalId: 'luma_shipping_city',
		externalUrl: 'https://lu.ma/shipping-city-night',
		hostId: 'prompt-clinic',
		coHostIds: ['jai-bhagat', 'civic-future-lab'],
		speakerIds: ['prompt-clinic', 'jai-bhagat'],
		sponsorIds: ['build-week-fund'],
		submittedBy: 'prompt-clinic',
		approvalStatus: 'approved',
	}),
];

export const siteStats = [
	{ label: 'Flagship tracks', value: '4' },
	{ label: 'Seeded events', value: String(events.length) },
	{ label: 'Boroughs activated', value: '3' },
	{ label: 'Live RSVPs tracked', value: '1.2k+' },
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
