'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Alert, Tag, Table, Empty, Tabs } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  TrashIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import {
  useMrpPlan,
  useDeleteMrpPlan,
  useExecuteMrpPlan,
} from '@/lib/api/hooks/useManufacturing';
import type { MrpPlanStatus, MrpPlanType, PlannedOrderDto, MrpExceptionDto, PlannedOrderStatus, PlannedOrderType } from '@/lib/api/services/manufacturing.types';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// MRP Plan status configuration
const statusConfig: Record<MrpPlanStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-4 h-4" /> },
  Executed: { color: '#334155', bgColor: '#e2e8f0', label: 'Çalıştırıldı', icon: <PlayIcon className="w-4 h-4" /> },
  Approved: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Onaylı', icon: <DocumentCheckIcon className="w-4 h-4" /> },
  Completed: { color: '#475569', bgColor: '#f8fafc', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
};

const planTypeLabels: Record<MrpPlanType, string> = {
  Regenerative: 'Yeniden Oluşturma',
  NetChange: 'Net Değişim',
};

const orderTypeConfig: Record<PlannedOrderType, { label: string; icon: React.ReactNode }> = {
  Purchase: { label: 'Satınalma', icon: <ShoppingCartIcon className="w-3 h-3" /> },
  Production: { label: 'Üretim', icon: <CubeIcon className="w-3 h-3" /> },
};

const orderStatusLabels: Record<PlannedOrderStatus, string> = {
  Pending: 'Bekliyor',
  Confirmed: 'Onaylandı',
  Released: 'Serbest',
  Converted: 'Dönüştürüldü',
  Cancelled: 'İptal',
};

export default function MrpPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const { data: plan, isLoading, error } = useMrpPlan(planId);
  const deletePlan = useDeleteMrpPlan();
  const executePlan = useExecuteMrpPlan();

  const handleDelete = async () => {
    if (!plan) return;
    const confirmed = await confirmDelete('MRP Planı', plan.name);
    if (confirmed) {
      try {
        await deletePlan.mutateAsync(plan.id);
        router.push('/manufacturing/mrp-plans');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleExecute = async () => {
    try {
      await executePlan.mutateAsync({ id: planId, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-8">
        <Alert
          message="Plan Bulunamadı"
          description="İstenen MRP planı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/mrp-plans')}>
              Planlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[plan.status] || { color: '#64748b', bgColor: '#f1f5f9', label: plan.status, icon: null };
  const canExecute = plan.status === 'Draft';
  const canDelete = plan.status === 'Draft';

  const orderColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_: unknown, record: PlannedOrderDto) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 120,
      render: (orderType: PlannedOrderType) => {
        const config = orderTypeConfig[orderType];
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Miktar',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span className="font-medium text-slate-900">{v.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Gerekli Tarih',
      dataIndex: 'requiredDate',
      key: 'requiredDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Serbest Bırakma',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PlannedOrderStatus) => (
        <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">
          {orderStatusLabels[status]}
        </Tag>
      ),
    },
  ];

  const exceptionColumns = [
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
    },
    {
      title: 'Mesaj',
      dataIndex: 'message',
      key: 'message',
      width: 300,
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            severity === 'High' ? 'bg-red-50 text-red-700' :
            severity === 'Medium' ? 'bg-amber-50 text-amber-700' :
            'bg-slate-100 text-slate-700'
          }`}
        >
          {severity === 'High' ? 'Yüksek' : severity === 'Medium' ? 'Orta' : 'Düşük'}
        </span>
      ),
    },
    {
      title: 'Çözüldü',
      dataIndex: 'isResolved',
      key: 'isResolved',
      width: 100,
      render: (isResolved: boolean) => (
        isResolved ? (
          <CheckCircleIcon className="w-5 h-5 text-slate-600" />
        ) : (
          <ClockIcon className="w-5 h-5 text-amber-500" />
        )
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
              onClick={() => router.push('/manufacturing/mrp-plans')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <CalculatorIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {plan.planNumber}
                  </h1>
                  <Tag
                    className="ml-2"
                    style={{
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.color,
                      border: 'none',
                    }}
                  >
                    {statusInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{plan.name}</p>
              </div>
            </div>
          </div>
          <Space>
            {canExecute && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleExecute}
                loading={executePlan.isPending}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Çalıştır
              </Button>
            )}
            {canDelete && (
              <Button
                danger
                icon={<TrashIcon className="w-4 h-4" />}
                onClick={handleDelete}
                loading={deletePlan.isPending}
              >
                Sil
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Planlanan Emir</div>
              <div className="text-2xl font-bold text-slate-900">{plan.plannedOrders?.length || 0}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">İstisna</div>
              <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
                {plan.exceptions?.length || 0}
                {(plan.exceptions?.length || 0) > 0 && <ExclamationTriangleIcon className="w-6 h-6" />}
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Üretim Emirleri</div>
              <div className="text-2xl font-bold text-slate-700">
                {plan.plannedOrders?.filter(o => o.orderType === 'Production').length || 0}
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Satınalma Emirleri</div>
              <div className="text-2xl font-bold text-slate-800">
                {plan.plannedOrders?.filter(o => o.orderType === 'Purchase').length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Bilgileri</h2>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
            <Descriptions.Item label="Plan No">{plan.planNumber}</Descriptions.Item>
            <Descriptions.Item label="Ad">{plan.name}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Plan Tipi">{planTypeLabels[plan.planType]}</Descriptions.Item>
            <Descriptions.Item label="Başlangıç">
              {plan.planningHorizonStart ? dayjs(plan.planningHorizonStart).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Bitiş">
              {plan.planningHorizonEnd ? dayjs(plan.planningHorizonEnd).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Emniyet Stoğu Dahil">
              {plan.includeSafetyStock ? 'Evet' : 'Hayır'}
            </Descriptions.Item>
            <Descriptions.Item label="Tedarik Süreleri Dahil">
              {plan.includeLeadTimes ? 'Evet' : 'Hayır'}
            </Descriptions.Item>
            <Descriptions.Item label="Çalıştırma Tarihi">
              {plan.executedAt ? dayjs(plan.executedAt).format('DD.MM.YYYY HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama" span={3}>
              {plan.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Tabs for Orders and Exceptions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Tabs
            defaultActiveKey="orders"
            items={[
              {
                key: 'orders',
                label: `Planlanan Emirler (${plan.plannedOrders?.length || 0})`,
                children: (
                  <Table
                    columns={orderColumns}
                    dataSource={plan.plannedOrders || []}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Planlanan emir bulunamadı"
                        />
                      ),
                    }}
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                  />
                ),
              },
              {
                key: 'exceptions',
                label: (
                  <span className="flex items-center gap-2">
                    İstisnalar
                    {(plan.exceptions?.length || 0) > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                        {plan.exceptions?.length}
                      </span>
                    )}
                  </span>
                ),
                children: (
                  <Table
                    columns={exceptionColumns}
                    dataSource={plan.exceptions || []}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 900 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="İstisna bulunamadı"
                        />
                      ),
                    }}
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
