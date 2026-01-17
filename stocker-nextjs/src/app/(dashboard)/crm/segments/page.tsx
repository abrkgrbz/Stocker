'use client';

import { ProtectedRoute } from '@/components/auth';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Tag, Modal, message, Avatar, Dropdown, Empty, Input, Spin } from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { CustomerSegment } from '@/lib/api/services/crm.service';
import { useCustomerSegments, useDeleteCustomerSegment, useCreateCustomerSegment } from '@/lib/api/hooks/useCRM';

const segmentTypeLabels: Record<string, string> = {
  Static: 'Statik',
  Dynamic: 'Dinamik',
};

function CustomerSegmentsPageContent() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: segments = [], isLoading, refetch } = useCustomerSegments();
  const deleteSegment = useDeleteCustomerSegment();
  const createSegment = useCreateCustomerSegment();

  // Filter segments based on search text
  const filteredSegments = segments.filter((segment) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      segment.name.toLowerCase().includes(searchLower) ||
      segment.description?.toLowerCase().includes(searchLower) ||
      segmentTypeLabels[segment.type]?.toLowerCase().includes(searchLower)
    );
  });

  // Stats calculations
  const totalSegments = segments.length;
  const activeSegments = segments.filter(s => s.isActive).length;
  const staticSegments = segments.filter(s => s.type === 'Static').length;
  const dynamicSegments = segments.filter(s => s.type === 'Dynamic').length;
  const totalMembers = segments.reduce((sum, s) => sum + (s.memberCount || 0), 0);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Segment Sil',
      content: 'Bu segmenti silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteSegment.mutateAsync(id);
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme islemi basarisiz';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleEdit = (segment: CustomerSegment) => {
    router.push(`/crm/segments/${segment.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/crm/segments/new');
  };

  const handleClone = async (segment: CustomerSegment) => {
    try {
      const clonedData = {
        name: `${segment.name} (Kopya)`,
        description: segment.description,
        type: segment.type,
        color: segment.color,
        isActive: false,
      };
      await createSegment.mutateAsync(clonedData as any);
      message.success('Segment basariyla kopyalandi');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Kopyalama islemi basarisiz';
      message.error(errorMessage);
    }
  };

  const handleExport = async (segment: CustomerSegment) => {
    try {
      const response = await fetch(`/api/crm/CustomerSegments/${segment.id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `${segment.name}_members.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`${segment.name} uyeleri basariyla disa aktarildi`);
    } catch (error: any) {
      message.error('CSV export islemi basarisiz oldu');
      console.error('Export error:', error);
    }
  };

  const handleSendCampaign = (segment: CustomerSegment) => {
    router.push(`/crm/campaigns?createNew=true&targetSegmentId=${segment.id}&targetSegmentName=${encodeURIComponent(segment.name)}`);
    message.success(`Kampanya olusturma sayfasina yonlendiriliyorsunuz: ${segment.name}`);
  };

  const columns: ColumnsType<CustomerSegment> = [
    {
      title: 'Segment',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${record.color || '#475569'}, ${record.color || '#475569'}dd)`,
            }}
            icon={<BuildingOffice2Icon className="w-5 h-5" />}
          >
            {text.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">{text}</div>
            {record.description && (
              <div className="text-xs text-slate-500 truncate">{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          type === 'Dynamic' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
        }`}>
          {segmentTypeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Uye Sayisi',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <div className="flex items-center justify-center gap-1.5">
          <UserIcon className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">{count || 0}</span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? (
            <CheckCircleIcon className="w-3.5 h-3.5" />
          ) : (
            <XCircleIcon className="w-3.5 h-3.5" />
          )}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Olusturma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => (
        <span className="text-slate-600">{new Date(date).toLocaleDateString('tr-TR')}</span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Duzenle',
          },
          {
            key: 'clone',
            icon: <DocumentDuplicateIcon className="w-4 h-4" />,
            label: 'Kopyala',
            disabled: createSegment.isPending,
          },
          { type: 'divider' as const },
          {
            key: 'export',
            icon: <ArrowDownTrayIcon className="w-4 h-4" />,
            label: 'Uyeleri Disa Aktar (.csv)',
          },
          {
            key: 'campaign',
            icon: <EnvelopeIcon className="w-4 h-4" />,
            label: 'Bu Segmente Kampanya Gonder',
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            disabled: deleteSegment.isPending,
          },
        ];

        const handleMenuClick = (info: { key: string }) => {
          switch (info.key) {
            case 'view':
              router.push(`/crm/segments/${record.id}`);
              break;
            case 'edit':
              handleEdit(record);
              break;
            case 'clone':
              handleClone(record);
              break;
            case 'export':
              handleExport(record);
              break;
            case 'campaign':
              handleSendCampaign(record);
              break;
            case 'delete':
              handleDelete(record.id);
              break;
          }
        };

        return (
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
            <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Musteri Segmentleri</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Musteri segmentlerinizi yonetin ve kampanyalarinizi hedefleyin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              disabled={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleCreate}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Yeni Segment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Segment</p>
              <p className="text-2xl font-bold text-slate-900">{totalSegments}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{activeSegments}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Statik</p>
              <p className="text-2xl font-bold text-slate-900">{staticSegments}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dinamik</p>
              <p className="text-2xl font-bold text-slate-900">{dynamicSegments}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Uye</p>
              <p className="text-2xl font-bold text-slate-900">{totalMembers.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Pasif</p>
              <p className="text-2xl font-bold text-slate-900">{totalSegments - activeSegments}</p>
            </div>
          </div>
        </div>

        {/* Search/Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <Input
            placeholder="Segment ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="max-w-md"
          />
        </div>

        {/* Segments Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={filteredSegments}
            rowKey="id"
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} segment`,
            }}
            locale={{
              emptyText: searchText ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Sonuc bulunamadi
                      </div>
                      <div className="text-sm text-slate-500">
                        &quot;{searchText}&quot; ile eslesen segment bulunamadi
                      </div>
                    </div>
                  }
                />
              ) : (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <UserGroupIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-2xl font-bold text-slate-800 mb-4">
                        Musterilerinizi Anlamli Gruplara Ayirin
                      </div>
                      <div className="text-base text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                        Musteri Segmentleri, dogru kisilere dogru mesaji gondermenizi saglar.
                      </div>
                      <Button
                        type="primary"
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                        icon={<PlusIcon className="w-5 h-5" />}
                      >
                        Ilk Segmentini Olustur
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </Spin>
    </div>
  );
}


export default function CustomerSegmentsPage() {
  return (
    <ProtectedRoute permission="CRM.Segments:View">
      <CustomerSegmentsPageContent />
    </ProtectedRoute>
  );
}
