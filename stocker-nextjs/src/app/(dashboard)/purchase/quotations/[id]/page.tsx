'use client';

import React from 'react';
import { Table, Dropdown, Modal, Spin } from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  PaperAirplaneIcon,
  PencilIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useQuotation,
  useSendQuotationToSuppliers,
  useSelectQuotationSupplier,
  useConvertQuotationToOrder,
  useCancelQuotation,
} from '@/lib/api/hooks/usePurchase';
import type { QuotationStatus, QuotationSupplierDto } from '@/lib/api/services/purchase.types';

const statusConfig: Record<QuotationStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi' },
  PartiallyResponded: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Kısmi Yanıt' },
  FullyResponded: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Tam Yanıt' },
  UnderReview: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'İnceleniyor' },
  Evaluated: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Değerlendirildi' },
  SupplierSelected: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tedarikçi Seçildi' },
  Awarded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Kazanan Belirlendi' },
  Converted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Siparişe Dönüştü' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Süresi Doldu' },
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: quotation, isLoading } = useQuotation(id);
  const sendMutation = useSendQuotationToSuppliers();
  const selectMutation = useSelectQuotationSupplier();
  const convertMutation = useConvertQuotationToOrder();
  const cancelMutation = useCancelQuotation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Teklif talebi bulunamadı</h3>
          <Link href="/purchase/quotations">
            <button className="text-sm text-slate-600 hover:text-slate-900">← Listeye dön</button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[quotation.status as QuotationStatus] || statusConfig.Draft;

  const handleSendToSuppliers = () => {
    const supplierIds = quotation.suppliers?.map(s => s.supplierId) || [];
    if (supplierIds.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Tedarikçi seçilmemiş' });
      return;
    }
    sendMutation.mutate({ id, supplierIds });
  };

  const handleSelectSupplier = (supplierId: string) => {
    Modal.confirm({
      title: 'Tedarikçi Seçimi',
      content: 'Bu tedarikçiyi kazanan olarak seçmek istediğinize emin misiniz?',
      onOk: () => selectMutation.mutate({ id, supplierId }),
    });
  };

  const handleConvertToOrder = () => {
    Modal.confirm({
      title: 'Satın Alma Siparişi Oluştur',
      content: 'Bu teklif talebini satın alma siparişine dönüştürmek istediğinize emin misiniz?',
      onOk: () => convertMutation.mutate(id),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'İptal Et',
      content: 'Bu teklif talebini iptal etmek istediğinize emin misiniz?',
      okType: 'danger',
      onOk: () => cancelMutation.mutate({ id, reason: 'Kullanıcı tarafından iptal edildi' }),
    });
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
      render: (qty: number) => <span className="text-sm text-slate-600">{qty}</span>,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (text: string) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'Özellikler',
      dataIndex: 'specifications',
      key: 'specifications',
      ellipsis: true,
      render: (text: string) => <span className="text-sm text-slate-500">{text || '-'}</span>,
    },
  ];

  const supplierColumns = [
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text: string, record: QuotationSupplierDto) => (
        <div className="flex items-center gap-2">
          <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">{text}</span>
          {record.isSelected && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
              Kazanan
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
          Pending: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Bekliyor' },
          Sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi' },
          Responded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Yanıtladı' },
          Declined: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddetti' },
          Selected: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Seçildi' },
        };
        const c = config[status] || config.Pending;
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
            {c.label}
          </span>
        );
      },
    },
    {
      title: 'Teklif Tutarı',
      dataIndex: 'quotedAmount',
      key: 'quotedAmount',
      width: 140,
      align: 'right' as const,
      render: (amount: number) => (
        <span className="text-sm font-medium text-slate-900">
          {amount ? amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-'}
        </span>
      ),
    },
    {
      title: 'Yanıt Tarihi',
      dataIndex: 'respondedAt',
      key: 'respondedAt',
      width: 120,
      render: (date: string) => (
        <span className="text-sm text-slate-500">
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: QuotationSupplierDto) =>
        record.status === 'Responded' && quotation.status !== 'Awarded' && (
          <button
            onClick={() => handleSelectSupplier(record.supplierId)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Seç
          </button>
        ),
    },
  ];

  const totalSuppliers = quotation.suppliers?.length || 0;
  const respondedSuppliers = quotation.suppliers?.filter(s => s.status === 'Responded').length || 0;
  const responseProgress = totalSuppliers > 0 ? (respondedSuppliers / totalSuppliers) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/purchase/quotations">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-900">{quotation.quotationNumber}</h1>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{quotation.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {quotation.status === 'Draft' && (
                <>
                  <Link href={`/purchase/quotations/${id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                      Düzenle
                    </button>
                  </Link>
                  <button
                    onClick={handleSendToSuppliers}
                    disabled={sendMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Tedarikçilere Gönder
                  </button>
                </>
              )}
              {quotation.status === 'Awarded' && (
                <button
                  onClick={handleConvertToOrder}
                  disabled={convertMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  Sipariş Oluştur
                </button>
              )}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'cancel',
                      label: 'İptal Et',
                      icon: <XMarkIcon className="w-4 h-4" />,
                      danger: true,
                      disabled: quotation.status === 'Cancelled' || quotation.status === 'Closed',
                      onClick: handleCancel,
                    },
                  ],
                }}
              >
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-slate-500" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Basic Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4">Teklif Talebi Bilgileri</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Başlık</div>
                  <div className="text-sm text-slate-900">{quotation.title}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Talep No</div>
                  <div className="text-sm text-slate-900">{quotation.quotationNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Son Teklif Tarihi</div>
                  <div className="text-sm text-slate-900">
                    {quotation.responseDeadline
                      ? new Date(quotation.responseDeadline).toLocaleDateString('tr-TR')
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Geçerlilik Süresi</div>
                  <div className="text-sm text-slate-900">{quotation.validityPeriod} gün</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Para Birimi</div>
                  <div className="text-sm text-slate-900">{quotation.currency}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ödeme Koşulları</div>
                  <div className="text-sm text-slate-900">{quotation.paymentTerms || '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Teslimat Yeri</div>
                  <div className="text-sm text-slate-900">{quotation.deliveryLocation || '-'}</div>
                </div>
              </div>

              {quotation.description && (
                <>
                  <div className="h-px bg-slate-100 my-4" />
                  <p className="text-sm text-slate-600">{quotation.description}</p>
                </>
              )}
            </div>

            {/* Items */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Ürünler</h2>
              </div>
              <Table
                columns={itemColumns}
                dataSource={quotation.items || []}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </div>

            {/* Suppliers */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900">Tedarikçiler</h2>
                  <span className="text-xs text-slate-500">
                    {respondedSuppliers} / {totalSuppliers} yanıt
                  </span>
                </div>
                {totalSuppliers > 0 && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${responseProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Table
                columns={supplierColumns}
                dataSource={quotation.suppliers || []}
                rowKey="supplierId"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-semibold text-slate-900">{quotation.quotationNumber}</div>
                <span className={`mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Oluşturulma</span>
                  <span className="text-sm text-slate-900">
                    {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Son Güncelleme</span>
                  <span className="text-sm text-slate-900">
                    {quotation.updatedAt ? new Date(quotation.updatedAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500">Oluşturan</span>
                  <span className="text-sm text-slate-900">{quotation.createdByName || '-'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-3">Notlar</h2>
                <p className="text-sm text-slate-600">{quotation.notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4">İşlem Geçmişi</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Oluşturuldu</div>
                    <div className="text-xs text-slate-500">
                      {new Date(quotation.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
                {quotation.status !== 'Draft' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Tedarikçilere Gönderildi</div>
                    </div>
                  </div>
                )}
                {quotation.status === 'Awarded' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Kazanan Belirlendi</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
