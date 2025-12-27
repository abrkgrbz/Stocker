'use client';

/**
 * Shipments Stats Component
 * Enterprise-grade design following Linear/Stripe/Vercel principles
 */

import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { StatCard } from '@/components/ui/enterprise-page';
import type { ShipmentListDto } from '@/lib/api/services/sales.service';

interface ShipmentsStatsProps {
  shipments: ShipmentListDto[];
  totalCount: number;
  loading?: boolean;
}

export function ShipmentsStats({ shipments, totalCount, loading = false }: ShipmentsStatsProps) {
  // Calculate statistics based on actual ShipmentStatus values
  const pendingCount = shipments.filter(
    (s) => ['Draft', 'Confirmed', 'Preparing', 'PickedUp', 'Packed'].includes(s.status)
  ).length;
  const inTransitCount = shipments.filter(
    (s) => ['Shipped', 'InTransit', 'OutForDelivery'].includes(s.status)
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === 'Delivered').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        label="Toplam Sevkiyat"
        value={loading ? '-' : totalCount}
        icon={<PaperAirplaneIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
      />
      <StatCard
        label="Hazırlanıyor"
        value={loading ? '-' : pendingCount}
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#eab308"
      />
      <StatCard
        label="Yolda"
        value={loading ? '-' : inTransitCount}
        icon={<TruckIcon className="w-5 h-5" />}
        iconColor="#3b82f6"
      />
      <StatCard
        label="Teslim Edildi"
        value={loading ? '-' : deliveredCount}
        icon={<CheckCircleIcon className="w-5 h-5" />}
        iconColor="#10b981"
      />
    </div>
  );
}
