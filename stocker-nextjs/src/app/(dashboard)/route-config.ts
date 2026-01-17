// Force all dashboard routes to be dynamic (no static generation at build time)
// This significantly reduces build time from ~15 minutes to ~3-5 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 0;
