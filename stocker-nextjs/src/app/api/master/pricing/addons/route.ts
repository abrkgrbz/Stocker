
import { NextResponse } from 'next/server';
import { pricingStore } from '@/lib/data/pricingStore';

export async function GET() {
    const addOns = pricingStore.getAddOns();
    return NextResponse.json({ addOns });
}
