
import { NextResponse } from 'next/server';
import { pricingStore } from '@/lib/data/pricingStore';

export async function POST(request: Request) {
    const body = await request.json();
    const { bundleCode, userCount, billingCycle } = body;

    let subtotal = 0;
    const lineItems = [];

    const modules = pricingStore.getModules();
    const bundles = pricingStore.getBundles();

    // Bundle Logic
    if (bundleCode) {
        const bundle = bundles.find(b => b.bundleCode === bundleCode);
        if (bundle) {
            const price = billingCycle === 'yearly' ? bundle.yearlyPrice : bundle.monthlyPrice;
            subtotal += price;
            lineItems.push({
                code: bundle.bundleCode,
                name: bundle.bundleName,
                type: 'Bundle',
                unitPrice: price,
                quantity: 1,
                totalPrice: price
            });
        }
    }

    // Tax
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    return NextResponse.json({
        success: true,
        subtotal,
        discount: 0, // Simplified for now
        tax,
        total,
        currency: 'TRY',
        billingCycle,
        lineItems
    });
}
