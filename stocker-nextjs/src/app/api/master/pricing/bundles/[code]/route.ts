
import { NextResponse } from 'next/server';
import { pricingStore } from '@/lib/data/pricingStore';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const body = await request.json();
    const updated = pricingStore.updateBundle(code, body);

    if (!updated) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bundle: updated });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const deleted = pricingStore.deleteBundle(code);
    return NextResponse.json({ success: deleted });
}
