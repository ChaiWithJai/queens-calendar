import report from '../../data/generated/ingest-report.json';
export const prerender = true;
export function GET() { return Response.json(report, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300' } }); }
