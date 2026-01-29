
import { NextResponse } from 'next/server';
import { pricingStore } from '@/lib/data/pricingStore';

export async function GET() {
    const bundles = pricingStore.getBundles();
    return NextResponse.json({ bundles });
}

export async function POST(request: Request) {
    const body = await request.json();
    const created = pricingStore.createBundle(body);
    return NextResponse.json(created);
}
