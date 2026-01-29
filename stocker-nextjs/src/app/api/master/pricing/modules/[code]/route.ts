
import { NextResponse } from 'next/server';
import { pricingStore } from '@/lib/data/pricingStore';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const body = await request.json();
    const updated = pricingStore.updateModule(code, body);

    if (!updated) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, module: updated });
}
