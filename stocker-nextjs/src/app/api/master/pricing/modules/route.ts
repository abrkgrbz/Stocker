
import { NextResponse } from 'next/server';
import { pricingStore } from '@/lib/data/pricingStore';

export async function GET() {
    const modules = pricingStore.getModules();
    return NextResponse.json({ modules });
}

export async function POST(request: Request) {
    // Mock implementations don't usually create modules for this system, but added for completeness
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
