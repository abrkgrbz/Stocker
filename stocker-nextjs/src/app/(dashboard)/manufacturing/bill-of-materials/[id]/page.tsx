'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Modal,
  Descriptions,
  Tag,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  CubeIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useBillOfMaterial,
  useDeleteBillOfMaterial,
  useApproveBillOfMaterial,
  useActivateBillOfMaterial,
} from '@/lib/api/hooks/useManufacturing';
import type { BomStatus, BomItemDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// BOM status configuration
const bomStatusConfig: Record<BomStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Active: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Aktif', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Obsolete: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Geçersiz', icon: <ArchiveBoxIcon className="w-3 h-3" /> },
};

export default function BillOfMaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bomId = params.id as string;

  const { data: bom, isLoading, error } = useBillOfMaterial(bomId);
  const deleteBom = useDeleteBillOfMaterial();
  const approveBom = useApproveBillOfMaterial();
  const activateBom = useActivateBillOfMaterial();

  const handleDelete = async () => {
    if (!bom) return;
    const confirmed = await confirmDelete('Ürün Reçetesi', bom.bomNumber);
    if (confirmed) {
      try {
        await deleteBom.mutateAsync(bomId);
        router.push('/manufacturing/bill-of-materials');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleApprove = async () => {
    if (!bom || bom.status !== 'Draft') return;
    try {
      await approveBom.mutateAsync(bomId);
    } catch {
      // Error handled by hook
    }
  };

  const handleActivate = async () => {
    if (!bom || bom.status !== 'Approved') return;
    try {
      await activateBom.mutateAsync(bomId);
    } catch {
      // Error handled by hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !bom) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Reçete Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen ürün reçetesi bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/bill-of-materials')} className="!border-slate-300">
            Reçetelere Dön
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = bomStatusConfig[bom.status] || { color: '#64748b', bgColor: '#f1f5f9', label: bom.status, icon: null };

  // Material items table columns
  const itemColumns: ColumnsType<BomItemDto> = [
    {
      title: 'Sıra',
      dataIndex: 'position',
      key: 'position',
      width: 70,
      align: 'center',
      render: (pos) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
          {pos}
        </span>
      ),
    },
    {
      title: 'Malzeme',
      key: 'material',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.materialName}</div>
          <div className="text-xs text-slate-500">{record.materialCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="text-right">
          <span className="font-semibold text-slate-900">{record.quantity}</span>
          <span className="text-sm text-slate-500 ml-1">{record.unitOfMeasure}</span>
        </div>
      ),
    },
    {
      title: 'Fire %',
      dataIndex: 'scrapPercentage',
      key: 'scrapPercentage',
      width: 100,
      align: 'center',
      render: (scrap) => (
        scrap ? (
          <span className="text-sm text-slate-600">{scrap}%</span>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'Notlar',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => (
        <span className="text-sm text-slate-600">{notes || '-'}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{bom.bomNumber}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                {bom.isDefault && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                    Varsayılan
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 m-0">
                {bom.productName} ({bom.productCode}) - v{bom.version}
              </p>
            </div>
          </div>
          <Space size="small">
            {bom.status === 'Draft' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveBom.isPending}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              >
                Onayla
              </Button>
            )}
            {bom.status === 'Approved' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleActivate}
                loading={activateBom.isPending}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              >
                Aktifleştir
              </Button>
            )}
            <Button
              icon={<PencilSquareIcon className="w-4 h-4" />}
              onClick={() => router.push(`/manufacturing/bill-of-materials/${bomId}/edit`)}
              className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
              loading={deleteBom.isPending}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* KPI Cards */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Malzeme Sayısı</p>
              </div>
              <div className="text-3xl font-bold text-slate-900">{bom.items.length}</div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Versiyon</p>
              </div>
              <div className="text-3xl font-bold text-slate-900">{bom.version}</div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geçerlilik Başlangıcı</p>
              </div>
              <div className="text-xl font-bold text-slate-900">{dayjs(bom.effectiveDate).format('DD.MM.YYYY')}</div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geçerlilik Bitişi</p>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {bom.expiryDate ? dayjs(bom.expiryDate).format('DD.MM.YYYY') : '-'}
              </div>
            </div>
          </div>

          {/* BOM Details */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Reçete Bilgileri</p>
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2, md: 3 }}
                size="small"
                className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
              >
                <Descriptions.Item label="Reçete No">{bom.bomNumber}</Descriptions.Item>
                <Descriptions.Item label="Ürün">{bom.productName}</Descriptions.Item>
                <Descriptions.Item label="Ürün Kodu">{bom.productCode}</Descriptions.Item>
                <Descriptions.Item label="Versiyon">{bom.version}</Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Varsayılan">
                  {bom.isDefault ? (
                    <Tag color="success">Evet</Tag>
                  ) : (
                    <Tag>Hayır</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Geçerlilik Başlangıcı">
                  {dayjs(bom.effectiveDate).format('DD MMMM YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Geçerlilik Bitişi">
                  {bom.expiryDate ? dayjs(bom.expiryDate).format('DD MMMM YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Oluşturan">{bom.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Oluşturulma Tarihi">
                  {dayjs(bom.createdAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
                {bom.updatedAt && (
                  <>
                    <Descriptions.Item label="Güncelleyen">{bom.updatedBy || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Güncelleme Tarihi">
                      {dayjs(bom.updatedAt).format('DD.MM.YYYY HH:mm')}
                    </Descriptions.Item>
                  </>
                )}
                {bom.description && (
                  <Descriptions.Item label="Açıklama" span={3}>
                    {bom.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </div>

          {/* Material Items */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Malzeme Listesi</p>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {bom.items.length} malzeme
                  </span>
                </div>
              </div>
              <Table
                columns={itemColumns}
                dataSource={bom.items}
                rowKey="id"
                pagination={false}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
