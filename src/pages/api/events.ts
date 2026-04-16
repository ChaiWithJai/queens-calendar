import { events } from '../../data/site';

export const prerender = true;

export function GET() {
	return Response.json(
		events.map((event) => ({
			id: event.id,
			slug: event.slug,
			title: event.title,
			subtitle: event.subtitle,
			shortDescription: event.shortDescription,
			startTime: event.startTime,
			endTime: event.endTime,
			timezone: event.timezone,
			date: event.date,
			dayOfWeek: event.dayOfWeek,
			venue: {
				name: event.venue.name,
				neighborhood: event.venue.neighborhood,
				address: event.venue.address,
				coordinates: event.venue.coordinates,
			},
			vertical: event.vertical,
			format: event.format,
			track: event.track?.name,
			externalProvider: event.externalProvider,
			externalUrl: event.externalUrl,
			rsvpCount: event.rsvpCount,
			capacity: event.capacity,
			status: event.status,
			isFeatured: event.isFeatured,
			isFlagship: event.isFlagship,
		})),
		{
			headers: {
				'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
			},
		},
	);
}
