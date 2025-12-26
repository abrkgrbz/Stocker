'use client';

/**
 * SegmentsTable Component
 * Displays customer segments in a table with actions
 * Feature-Based Architecture - Smart Component
 */

import React, { useState } from 'react';
import { Modal, message, Skeleton } from 'antd';
import { Users, Edit2, Trash2, MoreVertical, Power, PowerOff, RefreshCw } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui/enterprise-page';
import {
  useSegments,
  useDeleteSegment,
  useActivateSegment,
  useDeactivateSegment,
  useRecalculateSegment,
} from '../../hooks';
import type { CustomerSegmentListDto, CustomerSegmentQueryParams } from '../../types';

interface SegmentsTableProps {
  params?: CustomerSegmentQueryParams;
  onEdit: (segment: CustomerSegmentListDto) => void;
  onCreate: () => void;
}

export function SegmentsTable({ params, onEdit, onCreate }: SegmentsTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Queries
  const { data, isLoading, isError, error } = useSegments(params);

  // Mutations
  const deleteSegment = useDeleteSegment();
  const activateSegment = useActivateSegment();
  const deactivateSegment = useDeactivateSegment();
  const recalculateSegment = useRecalculateSegment();

  const segments = data?.items ?? [];

  const handleDeleteClick = (id: string, name: string) => {
    Modal.confirm({
      title: 'Segmenti Sil',
      content: `"${name}" segmentini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        deleteSegment.mutate(id);
      },
    });
    setOpenDropdown(null);
  };

  const handleActivateClick = (id: string) => {
    activateSegment.mutate(id);
    setOpenDropdown(null);
  };

  const handleDeactivateClick = (id: string) => {
    deactivateSegment.mutate(id);
    setOpenDropdown(null);
  };

  const handleRecalculateClick = (id: string) => {
    recalculateSegment.mutate(id);
    setOpenDropdown(null);
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return <Badge variant="success">En Yüksek</Badge>;
    if (priority === 2) return <Badge variant="info">Yüksek</Badge>;
    if (priority === 3) return <Badge variant="warning">Normal</Badge>;
    return <Badge variant="default">Düşük</Badge>;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card padding="none">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton.Avatar active size="large" shape="square" />
              <div className="flex-1 space-y-2">
                <Skeleton.Input active size="small" block />
                <Skeleton.Input active size="small" style={{ width: '60%' }} />
              </div>
              <Skeleton.Button active size="small" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Veriler yüklenemedi"
          description={error?.message || 'Segmentler yüklenirken bir hata oluştu'}
          action={{
            label: 'Tekrar Dene',
            onClick: () => window.location.reload(),
          }}
        />
      </Card>
    );
  }

  // Empty state
  if (segments.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Henüz segment yok"
          description="Müşterilerinizi gruplandırmak için ilk segmenti oluşturun"
          action={{
            label: 'Segment Oluştur',
            onClick: onCreate,
          }}
        />
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                Segment Adı
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                Açıklama
              </th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                İndirim Oranı
              </th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                Öncelik
              </th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                Müşteri Sayısı
              </th>
              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                Durum
              </th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {segments.map((segment) => (
              <tr
                key={segment.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-slate-900">
                      {segment.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500">
                    {segment.description || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    %{segment.discountRate}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {getPriorityBadge(segment.priority)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-slate-600">
                    {segment.customerCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={segment.isActive ? 'success' : 'default'}>
                    {segment.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === segment.id ? null : segment.id
                        )
                      }
                      className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                      disabled={deleteSegment.isPending || activateSegment.isPending || deactivateSegment.isPending}
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    {openDropdown === segment.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onEdit(segment);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Edit2 className="w-4 h-4" />
                              Düzenle
                            </button>
                            {segment.isActive ? (
                              <button
                                onClick={() => handleDeactivateClick(segment.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              >
                                <PowerOff className="w-4 h-4" />
                                Pasifleştir
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateClick(segment.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              >
                                <Power className="w-4 h-4" />
                                Aktifleştir
                              </button>
                            )}
                            <button
                              onClick={() => handleRecalculateClick(segment.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Yeniden Hesapla
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => handleDeleteClick(segment.id, segment.name)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
