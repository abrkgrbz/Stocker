'use client';

import React from 'react';
import { redirect } from 'next/navigation';

/**
 * Analytics page redirects to the main analysis page.
 * The inventory analysis functionality is available at /inventory/analysis
 */
export default function InventoryAnalyticsPage() {
  redirect('/inventory/analysis');
}
