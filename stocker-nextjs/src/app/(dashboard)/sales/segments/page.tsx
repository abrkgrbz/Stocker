'use client';

/**
 * Customer Segments Page
 * Manage customer groups (VIP, Wholesale, etc.)
 * Monochrome design system
 */

import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import {
  SegmentsTable,
  CreateSegmentModal,
  useSegments,
} from '@/features/sales';
import type { CustomerSegmentListDto, CustomerSegmentQueryParams } from '@/features/sales';

export default function CustomerSegmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegmentListDto | null>(null);
  const [params] = useState<CustomerSegmentQueryParams>({});

  // Get segment count for header
  const { data } = useSegments(params);
  const segmentCount = data?.totalCount ?? 0;

  const handleCreateClick = () => {
    setEditingSegment(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (segment: CustomerSegmentListDto) => {
    setEditingSegment(segment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSegment(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Musteri Segmentleri</h1>
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {segmentCount} segment
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Musteri gruplarini ve indirim oranlarini yonetin
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Segment
        </button>
      </div>

      <SegmentsTable
        params={params}
        onEdit={handleEditClick}
        onCreate={handleCreateClick}
      />

      <CreateSegmentModal
        open={isModalOpen}
        onClose={handleModalClose}
        editingSegment={editingSegment}
      />
    </div>
  );
}
