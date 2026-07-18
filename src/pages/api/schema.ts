import schema from '../../../schemas/event.schema.json';
export const prerender = true;
export function GET() { return Response.json(schema, { headers: { 'Cache-Control': 'public, max-age=86400' } }); }
