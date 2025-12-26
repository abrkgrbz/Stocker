'use client';

/**
 * Customer Segments Page
 * Manage customer groups (VIP, Wholesale, etc.)
 * Refactored to Feature-Based Architecture
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageContainer, ListPageHeader } from '@/components/patterns';
import { UsersIcon } from '@heroicons/react/24/outline';
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
    <PageContainer maxWidth="6xl">
      <ListPageHeader
        icon={<UsersIcon className="w-5 h-5" />}
        iconColor="#6366f1"
        title="Müşteri Segmentleri"
        description="Müşteri gruplarını ve indirim oranlarını yönetin"
        itemCount={segmentCount}
        primaryAction={{
          label: 'Yeni Segment',
          onClick: handleCreateClick,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

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
    </PageContainer>
  );
}
