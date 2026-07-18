import catalog from '../../data/generated/events.json';

export const prerender = true;

export function GET() {
	return Response.json(catalog, {
		headers: {
			'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
		},
	});
}
