'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Table,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useQuotation, useUpdateQuotation } from '@/lib/api/hooks/usePurchase';
import type { QuotationStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

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

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  const [form] = Form.useForm();

  const { data: quotation, isLoading: quotationLoading } = useQuotation(quotationId);
  const updateQuotation = useUpdateQuotation();

  useEffect(() => {
    if (quotation) {
      form.setFieldsValue({
        title: quotation.title,
        priority: quotation.priority,
        responseDeadline: quotation.responseDeadline ? dayjs(quotation.responseDeadline) : null,
        validUntil: quotation.validUntil ? dayjs(quotation.validUntil) : null,
        notes: quotation.notes,
        internalNotes: quotation.internalNotes,
        terms: quotation.terms,
      });
    }
  }, [quotation, form]);

  if (quotationLoading) {
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
          <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Teklif Talebi Bulunamadı</h3>
          <p className="text-sm text-slate-500 mb-4">Aradığınız teklif talebi mevcut değil.</p>
          <button
            onClick={() => router.push('/purchase/quotations')}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Teklif Taleplerine Dön
          </button>
        </div>
      </div>
    );
  }

  if (quotation.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Düzenleme Yapılamaz</h3>
          <p className="text-sm text-slate-500 mb-4">Sadece taslak durumundaki talepler düzenlenebilir.</p>
          <button
            onClick={() => router.push(`/purchase/quotations/${quotationId}`)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Talebe Dön
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateQuotation.mutateAsync({
        id: quotationId,
        data: {
          title: values.title,
          priority: values.priority,
          responseDeadline: values.responseDeadline?.toISOString(),
          validUntil: values.validUntil?.toISOString(),
          notes: values.notes,
          internalNotes: values.internalNotes,
          terms: values.terms,
        },
      });
      message.success('Teklif talebi başarıyla güncellendi');
      router.push(`/purchase/quotations/${quotationId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/quotations/${quotationId}`);
  };

  const isLoading = updateQuotation.isPending;
  const status = statusConfig[quotation.status as QuotationStatus] || statusConfig.Draft;

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name || 'Belirtilmemiş'}</div>
          {record.productCode && (
            <div className="text-xs text-slate-500">{record.productCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number, record: any) => (
        <span className="text-sm text-slate-600">{qty} {record.unit || 'Adet'}</span>
      ),
    },
    {
      title: 'Özellikler',
      dataIndex: 'specifications',
      key: 'specifications',
      ellipsis: true,
      render: (specs: string) => (
        <span className="text-sm text-slate-600">{specs || '-'}</span>
      ),
    },
  ];

  const supplierColumns = [
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (name: string, record: any) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name}</div>
          {record.supplierCode && (
            <div className="text-xs text-slate-500">{record.supplierCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'responseStatus',
      key: 'responseStatus',
      width: 120,
      render: (responseStatus: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
          Pending: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Bekliyor' },
          Sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi' },
          Responded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Yanıtladı' },
          Declined: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddetti' },
        };
        const statusInfo = config[responseStatus] || config.Pending;
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      title: 'Teklif Tutarı',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right' as const,
      render: (amount: number, record: any) => (
        <span className="text-sm font-medium text-slate-900">
          {amount > 0
            ? `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${record.currency || quotation.currency}`
            : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Teklif Talebini Düzenle</h1>
                  <p className="text-sm text-slate-500">{quotation.quotationNumber}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Teklif Bilgileri (Salt Okunur)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Teklif No</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{quotation.quotationNumber}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Durum</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Oluşturma Tarihi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {quotation.quotationDate
                    ? dayjs(quotation.quotationDate).format('DD.MM.YYYY')
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tedarikçi Sayısı</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{quotation.supplierCount || 0}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Para Birimi</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{quotation.currency}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kalem Sayısı</span>
                <p className="text-sm font-medium text-slate-900 mt-1">{quotation.items?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Düzenlenebilir Alanlar</h3>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="title"
                  label={<span className="text-sm font-medium text-slate-700">Başlık</span>}
                >
                  <Input placeholder="Teklif talebi başlığı" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="priority"
                  label={<span className="text-sm font-medium text-slate-700">Öncelik</span>}
                >
                  <Select options={priorityOptions} placeholder="Öncelik seçin" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="responseDeadline"
                  label={<span className="text-sm font-medium text-slate-700">Son Teklif Tarihi</span>}
                >
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="validUntil"
                  label={<span className="text-sm font-medium text-slate-700">Geçerlilik Tarihi</span>}
                >
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="terms"
                  label={<span className="text-sm font-medium text-slate-700">Şartlar ve Koşullar</span>}
                >
                  <TextArea rows={3} placeholder="Teklif şartları ve koşulları..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="notes"
                  label={<span className="text-sm font-medium text-slate-700">Notlar</span>}
                >
                  <TextArea rows={2} placeholder="Tedarikçilere görünecek notlar..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="internalNotes"
                  label={<span className="text-sm font-medium text-slate-700">Dahili Notlar</span>}
                >
                  <TextArea rows={2} placeholder="Sadece dahili kullanım için..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Items (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-900">Ürünler (Salt Okunur)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ürünleri düzenlemek için lütfen talebi silin ve yeni bir talep oluşturun.
              </p>
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

          {/* Suppliers (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-900">Tedarikçiler (Salt Okunur)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tedarikçileri düzenlemek için lütfen talebi silin ve yeni bir talep oluşturun.
              </p>
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
        </Form>
      </div>
    </div>
  );
}
