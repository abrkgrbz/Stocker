'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Spin,
  Descriptions,
  Tag,
  Row,
  Col,
  Table,
  Dropdown,
  Modal,
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useCancelPurchaseRequest,
  useConvertRequestToOrder,
  useDeletePurchaseRequest,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseRequestStatus, PurchaseRequestPriority, PurchaseRequestItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps, TimelineItemProps } from 'antd';
import dayjs from 'dayjs';

const statusColors: Record<PurchaseRequestStatus, string> = {
  Draft: 'default',
  Pending: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Converted: 'blue',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandi',
  Rejected: 'Reddedildi',
  Converted: 'Siparise Donusturuldu',
  Cancelled: 'Iptal Edildi',
};

const priorityColors: Record<PurchaseRequestPriority, string> = {
  Low: 'default',
  Normal: 'blue',
  High: 'orange',
  Urgent: 'red',
};

const priorityLabels: Record<PurchaseRequestPriority, string> = {
  Low: 'Dusuk',
  Normal: 'Normal',
  High: 'Yuksek',
  Urgent: 'Acil',
};

const getStatusStep = (status: PurchaseRequestStatus): number => {
  const steps: Record<PurchaseRequestStatus, number> = {
    Draft: 0,
    Pending: 1,
    Approved: 2,
    Rejected: -1,
    Converted: 3,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const { data: request, isLoading } = usePurchaseRequest(requestId);
  const submitRequest = useSubmitPurchaseRequest();
  const approveRequest = useApprovePurchaseRequest();
  const rejectRequest = useRejectPurchaseRequest();
  const cancelRequest = useCancelPurchaseRequest();
  const convertToOrder = useConvertRequestToOrder();
  const deleteRequest = useDeletePurchaseRequest();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <DocumentTextIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Satin alma talebi bulunamadi</h2>
        <p className="text-sm text-slate-500 mb-4">Bu talep silinmis veya erisim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/requests')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Taleplere Don
        </button>
      </div>
    );
  }

  const handleSubmit = () => {
    submitRequest.mutate(requestId);
  };

  const handleApprove = () => {
    approveRequest.mutate({ id: requestId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Talebi Reddet',
      icon: <XCircleIcon className="w-4 h-4 text-red-500" />,
      content: 'Bu talebi reddetmek istediginizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => rejectRequest.mutate({ id: requestId, reason: 'Manuel red' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Talebi Iptal Et',
      icon: <XCircleIcon className="w-4 h-4 text-red-500" />,
      content: 'Bu talebi iptal etmek istediginizden emin misiniz?',
      okText: 'Iptal Et',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => cancelRequest.mutate({ id: requestId, reason: 'Manuel iptal' }),
    });
  };

  const handleConvertToOrder = () => {
    Modal.confirm({
      title: 'Siparise Donustur',
      icon: <ShoppingCartIcon className="w-4 h-4 text-slate-600" />,
      content: 'Bu talebi satin alma siparisine donusturmek istiyor musunuz? Tedarikci secimi sonraki adimda yapilacaktir.',
      okText: 'Donustur',
      cancelText: 'Vazgec',
      onOk: () => {
        // Note: In real implementation, this would open a supplier selection modal
        convertToOrder.mutate({ id: requestId, supplierId: '' });
      },
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Talebi Sil',
      icon: <ExclamationCircleIcon className="w-4 h-4 text-red-500" />,
      content: `"${request.requestNumber}" talebini silmek istediginizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => {
        deleteRequest.mutate(requestId);
        router.push('/purchase/requests');
      },
    });
  };

  const actionMenuItems = [
    request.status === 'Draft' && {
      key: 'submit',
      icon: <PaperAirplaneIcon className="w-4 h-4" />,
      label: 'Onaya Gonder',
      onClick: handleSubmit,
    },
    request.status === 'Pending' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    request.status === 'Pending' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    request.status === 'Approved' && {
      key: 'convert',
      icon: <ShoppingCartIcon className="w-4 h-4" />,
      label: 'Siparise Donustur',
      onClick: handleConvertToOrder,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdir',
    },
    { type: 'divider' },
    !['Cancelled', 'Converted'].includes(request.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Iptal Et',
      danger: true,
      onClick: handleCancel,
    },
    request.status === 'Draft' && {
      key: 'delete',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: handleDelete,
    },
  ].filter(Boolean) as MenuProps['items'];

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => (
        <span className="text-sm text-slate-500">{index + 1}</span>
      ),
    },
    {
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: PurchaseRequestItemDto) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Aciklama',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <span className="text-sm text-slate-500">{desc || '-'}</span>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number, record: PurchaseRequestItemDto) => (
        <span className="text-sm text-slate-900">{qty} {record.unit}</span>
      ),
    },
    {
      title: 'Tahmini Birim Fiyat',
      dataIndex: 'estimatedUnitPrice',
      key: 'estimatedUnitPrice',
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm text-slate-900">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      ),
    },
    {
      title: 'Tahmini Toplam',
      dataIndex: 'estimatedTotalPrice',
      key: 'estimatedTotalPrice',
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm font-semibold text-slate-900">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      ),
    },
    {
      title: 'Tercih Edilen Tedarikci',
      dataIndex: 'preferredSupplierName',
      key: 'preferredSupplierName',
      render: (name: string) => (
        <span className="text-sm text-slate-500">{name || '-'}</span>
      ),
    },
  ];

  // Progress steps data
  const progressSteps = [
    { key: 'draft', label: 'Taslak', icon: DocumentTextIcon },
    { key: 'pending', label: 'Onay Bekliyor', icon: ClockIcon },
    { key: 'approved', label: 'Onaylandi', icon: CheckCircleIcon },
    { key: 'converted', label: 'Siparise Donusturuldu', icon: ShoppingCartIcon },
  ];

  const currentStep = getStatusStep(request.status as PurchaseRequestStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/requests')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-900">{request.requestNumber}</h1>
                    <Tag color={statusColors[request.status as PurchaseRequestStatus]}>
                      {statusLabels[request.status as PurchaseRequestStatus]}
                    </Tag>
                    <Tag color={priorityColors[request.priority as PurchaseRequestPriority]}>
                      {priorityLabels[request.priority as PurchaseRequestPriority]}
                    </Tag>
                  </div>
                  <p className="text-sm text-slate-500">
                    {request.requestedByName} - {dayjs(request.requestDate).format('DD.MM.YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                  Islemler
                </button>
              </Dropdown>
              {request.status === 'Draft' && (
                <button
                  onClick={() => router.push(`/purchase/requests/${requestId}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Duzenle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {progressSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep && currentStep >= 0;
              const isError = ['Rejected', 'Cancelled'].includes(request.status) && index === 1;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isError ? 'bg-red-100 text-red-600' :
                        isCompleted ? 'bg-slate-900 text-white' :
                        isActive ? 'bg-slate-100 text-slate-900 ring-2 ring-slate-900' :
                        'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium ${
                      isError ? 'text-red-600' :
                      isCompleted || isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-slate-900' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Toplam Kalem</div>
            <div className="text-2xl font-semibold text-slate-900">
              {(request.items || []).length} <span className="text-sm font-normal text-slate-500">adet</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Tahmini Toplam</div>
            <div className="text-2xl font-semibold text-slate-900">
              {(request.estimatedTotalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-500">{request.currency || 'TL'}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Butce Tutari</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {(request.budgetAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-500">{request.currency || 'TL'}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Gerekli Tarih</div>
            <div className="text-lg font-semibold text-slate-900">
              {request.requiredDate ? dayjs(request.requiredDate).format('DD.MM.YYYY') : '-'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Items */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Talep Kalemleri</h2>
              </div>
              <Table
                dataSource={request.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row className="bg-slate-900">
                      <Table.Summary.Cell index={0} colSpan={5} align="right">
                        <span className="text-sm font-medium text-white">Toplam Tahmini Tutar:</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-base font-semibold text-white">
                          {request.estimatedTotalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || 'TL'}
                        </span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            {/* Purpose & Justification */}
            {(request.purpose || request.justification) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Amac ve Gerekce</h2>
                {request.purpose && (
                  <div className="mb-4">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Amac</span>
                    <p className="mt-1 text-sm text-slate-600">{request.purpose}</p>
                  </div>
                )}
                {request.justification && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gerekce</span>
                    <p className="mt-1 text-sm text-slate-600">{request.justification}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {request.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-3">Notlar</h2>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Request Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Talep Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Talep No</span>
                  <span className="text-sm font-medium text-slate-900">{request.requestNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Talep Tarihi</span>
                  <span className="text-sm text-slate-900">{dayjs(request.requestDate).format('DD.MM.YYYY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Gerekli Tarih</span>
                  <span className="text-sm text-slate-900">
                    {request.requiredDate ? dayjs(request.requiredDate).format('DD.MM.YYYY') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Oncelik</span>
                  <Tag color={priorityColors[request.priority as PurchaseRequestPriority]}>
                    {priorityLabels[request.priority as PurchaseRequestPriority]}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Para Birimi</span>
                  <span className="text-sm text-slate-900">{request.currency || 'TRY'}</span>
                </div>
              </div>
            </div>

            {/* Requester Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Talep Eden</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Kisi</span>
                  <span className="text-sm text-slate-900">{request.requestedByName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Departman</span>
                  <span className="text-sm text-slate-900">{request.departmentName || '-'}</span>
                </div>
              </div>
            </div>

            {/* Budget Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Butce Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Butce Kodu</span>
                  <span className="text-sm text-slate-900">{request.budgetCode || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Butce Tutari</span>
                  <span className="text-sm text-slate-900">
                    {request.budgetAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || 'TL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tahmini Tutar</span>
                  <span className="text-sm text-slate-900">
                    {request.estimatedTotalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || 'TL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Info */}
            {(request.approvedById || request.rejectionReason) && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Onay Bilgileri</h3>
                <Timeline
                  items={[
                    {
                      color: 'blue',
                      children: (
                        <div>
                          <div className="text-sm font-medium text-slate-900">Talep Olusturuldu</div>
                          <div className="text-xs text-slate-500">
                            {dayjs(request.createdAt).format('DD.MM.YYYY HH:mm')}
                          </div>
                        </div>
                      ),
                    },
                    request.status !== 'Draft' && {
                      color: 'orange',
                      children: (
                        <div>
                          <div className="text-sm font-medium text-slate-900">Onaya Gonderildi</div>
                          <div className="text-xs text-slate-500">
                            {request.requestedByName}
                          </div>
                        </div>
                      ),
                    },
                    request.approvalDate && {
                      color: 'green',
                      children: (
                        <div>
                          <div className="text-sm font-medium text-slate-900">Onaylandi</div>
                          <div className="text-xs text-slate-500">
                            {request.approvedByName} - {dayjs(request.approvalDate).format('DD.MM.YYYY HH:mm')}
                          </div>
                          {request.approvalNotes && (
                            <div className="text-xs text-slate-500 mt-1">{request.approvalNotes}</div>
                          )}
                        </div>
                      ),
                    },
                    request.rejectionReason && {
                      color: 'red',
                      children: (
                        <div>
                          <div className="text-sm font-medium text-slate-900">Reddedildi</div>
                          <div className="text-xs text-slate-500">
                            {request.rejectionReason}
                          </div>
                        </div>
                      ),
                    },
                  ].filter(Boolean) as TimelineItemProps[]}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
