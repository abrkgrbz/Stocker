'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Table,
  Spin,
  Tag,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePurchaseRequest, useUpdatePurchaseRequest } from '@/lib/api/hooks/usePurchase';
import type { PurchaseRequestPriority } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const priorityOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Urgent', label: 'Acil' },
];

const priorityColors: Record<PurchaseRequestPriority, string> = {
  Low: 'default',
  Normal: 'blue',
  High: 'orange',
  Urgent: 'red',
};

export default function EditPurchaseRequestPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const [form] = Form.useForm();

  const { data: request, isLoading: requestLoading } = usePurchaseRequest(requestId);
  const updateRequest = useUpdatePurchaseRequest();

  useEffect(() => {
    if (request) {
      form.setFieldsValue({
        priority: request.priority,
        requiredDate: request.requiredDate ? dayjs(request.requiredDate) : null,
        purpose: request.purpose,
        justification: request.justification,
        budgetAmount: request.budgetAmount,
        budgetCode: request.budgetCode,
        notes: request.notes,
      });
    }
  }, [request, form]);

  if (requestLoading) {
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
        <h2 className="text-lg font-medium text-slate-900 mb-2">Talep bulunamadi</h2>
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

  if (request.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <DocumentTextIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Bu talep duzenlenemez</h2>
        <p className="text-sm text-slate-500 mb-4">Sadece taslak talepler duzenlenebilir.</p>
        <button
          onClick={() => router.push(`/purchase/requests/${requestId}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Talebe Don
        </button>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateRequest.mutateAsync({
        id: requestId,
        data: {
          priority: values.priority,
          requiredDate: values.requiredDate?.toISOString(),
          purpose: values.purpose,
          justification: values.justification,
          budgetAmount: values.budgetAmount,
          budgetCode: values.budgetCode,
          notes: values.notes,
        },
      });
      message.success('Talep basariyla guncellendi');
      router.push(`/purchase/requests/${requestId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/requests/${requestId}`);
  };

  const isLoading = updateRequest.isPending;

  const itemColumns = [
    {
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name}</div>
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
        <span className="text-sm text-slate-900">{qty} {record.unit || 'Adet'}</span>
      ),
    },
    {
      title: 'Tahmini Birim Fiyat',
      dataIndex: 'estimatedUnitPrice',
      key: 'estimatedUnitPrice',
      width: 150,
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm text-slate-900">
          {(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'estimatedTotalAmount',
      key: 'estimatedTotalAmount',
      width: 150,
      align: 'right' as const,
      render: (amount: number) => (
        <span className="text-sm font-semibold text-slate-900">
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      ),
    },
    {
      title: 'Tercih Edilen Tedarikci',
      dataIndex: 'preferredSupplierName',
      key: 'preferredSupplierName',
      width: 180,
      render: (name: string) => (
        <span className="text-sm text-slate-500">{name || '-'}</span>
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
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Talebi Duzenle
                  </h1>
                  <p className="text-sm text-slate-500">
                    {request.requestNumber}
                  </p>
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
                Iptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
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
            <h2 className="text-sm font-medium text-slate-900 mb-4">Talep Bilgileri (Salt Okunur)</h2>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Talep No</span>
                  <span className="text-sm font-medium text-slate-900">{request.requestNumber}</span>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Talep Eden</span>
                  <span className="text-sm font-medium text-slate-900">{request.requestedByName || '-'}</span>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Talep Tarihi</span>
                  <span className="text-sm font-medium text-slate-900">{dayjs(request.requestDate).format('DD.MM.YYYY')}</span>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Departman</span>
                  <span className="text-sm font-medium text-slate-900">{request.departmentName || '-'}</span>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Kalem Sayisi</span>
                  <span className="text-sm font-medium text-slate-900">{request.items?.length || 0}</span>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Tahmini Tutar</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {(request.estimatedTotalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || 'TL'}
                  </span>
                </div>
              </Col>
            </Row>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-medium text-slate-900 mb-4">Duzenlenebilir Alanlar</h2>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="priority"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Oncelik</span>}
                  rules={[{ required: true, message: 'Oncelik secin' }]}
                >
                  <Select options={priorityOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="requiredDate"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gerekli Tarih</span>}
                >
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="budgetCode"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Butce Kodu</span>}
                >
                  <Input placeholder="or: BTC-2024-001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="budgetAmount"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Butce Tutari</span>}
                >
                  <InputNumber
                    className="w-full"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                    precision={2}
                    min={0}
                    addonAfter="TL"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="purpose"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Amac</span>}
                  rules={[{ required: true, message: 'Amac belirtin' }]}
                >
                  <TextArea rows={2} placeholder="Bu talebin amacini aciklayin..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="justification"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gerekce</span>}
                >
                  <TextArea rows={2} placeholder="Talebin gerekcesini detayli aciklayin..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="notes"
                  label={<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notlar</span>}
                >
                  <TextArea rows={2} placeholder="Ek notlar..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Items (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Talep Kalemleri (Salt Okunur)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Kalemleri duzenlemek icin lutfen talebi silin ve yeni bir talep olusturun.
              </p>
            </div>
            <Table
              columns={itemColumns}
              dataSource={request.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              summary={() => (request.items?.length || 0) > 0 ? (
                <Table.Summary.Row className="bg-slate-900">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <span className="text-sm font-medium text-white">Toplam ({request.items?.length} kalem)</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span className="text-base font-semibold text-white">
                      {(request.estimatedTotalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              ) : null}
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
