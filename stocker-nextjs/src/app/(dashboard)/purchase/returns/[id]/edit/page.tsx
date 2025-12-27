'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Divider,
  Tag,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePurchaseReturn, useUpdatePurchaseReturn } from '@/lib/api/hooks/usePurchase';
import type { PurchaseReturnReason, RefundMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const reasonLabels: Record<PurchaseReturnReason, string> = {
  Defective: 'Kusurlu',
  WrongItem: 'Yanlis Urun',
  WrongQuantity: 'Yanlis Miktar',
  Damaged: 'Hasarli',
  QualityIssue: 'Kalite Sorunu',
  Expired: 'Vadesi Gecmis',
  NotAsDescribed: 'Tanimlandigi Gibi Degil',
  Other: 'Diger',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Defective: 'Kusurlu Urun',
  Warranty: 'Garanti',
  Exchange: 'Degisim',
};

const refundMethodOptions = [
  { value: 'Credit', label: 'Alacak' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'Check', label: 'Cek' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'Replacement', label: 'Urun Degisimi' },
];

export default function EditPurchaseReturnPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;
  const [form] = Form.useForm();

  const { data: purchaseReturn, isLoading: returnLoading } = usePurchaseReturn(returnId);
  const updateReturn = useUpdatePurchaseReturn();

  useEffect(() => {
    if (purchaseReturn) {
      form.setFieldsValue({
        rmaNumber: purchaseReturn.rmaNumber,
        reasonDetails: purchaseReturn.reasonDetails,
        refundMethod: purchaseReturn.refundMethod,
        notes: purchaseReturn.notes,
        internalNotes: purchaseReturn.internalNotes,
      });
    }
  }, [purchaseReturn, form]);

  if (returnLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
          <ArrowUturnLeftIcon className="w-8 h-8 text-white" />
        </div>
        <Spin size="large" />
      </div>
    );
  }

  if (!purchaseReturn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
          <ArrowUturnLeftIcon className="w-8 h-8 text-white" />
        </div>
        <Empty description="Iade belgesi bulunamadi" />
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/purchase/returns')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Iadelere Don
          </button>
        </div>
      </div>
    );
  }

  if (purchaseReturn.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
          <ArrowUturnLeftIcon className="w-8 h-8 text-white" />
        </div>
        <Empty description="Bu iade duzenlenemez. Sadece taslak iadeler duzenlenebilir." />
        <div className="text-center mt-4">
          <button
            onClick={() => router.push(`/purchase/returns/${returnId}`)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Iadeye Don
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateReturn.mutateAsync({
        id: returnId,
        data: {
          rmaNumber: values.rmaNumber,
          reasonDetails: values.reasonDetails,
          refundMethod: values.refundMethod,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      message.success('Iade talebi basariyla guncellendi');
      router.push(`/purchase/returns/${returnId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/returns/${returnId}`);
  };

  const isLoading = updateReturn.isPending;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <ArrowUturnLeftIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Iade Duzenle
                  </h1>
                  <p className="text-sm text-slate-500">
                    {purchaseReturn.returnNumber}
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
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Iade Bilgileri (Salt Okunur)</h3>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text className="block mb-1 text-slate-500 text-sm">Iade No</Text>
                  <Text strong className="text-slate-900">{purchaseReturn.returnNumber}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text className="block mb-1 text-slate-500 text-sm">Tedarikci</Text>
                  <Text strong className="text-slate-900">{purchaseReturn.supplierName}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text className="block mb-1 text-slate-500 text-sm">Iade Tarihi</Text>
                  <Text strong className="text-slate-900">{dayjs(purchaseReturn.returnDate).format('DD.MM.YYYY')}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text className="block mb-1 text-slate-500 text-sm">Iade Tipi</Text>
                  <Text strong className="text-slate-900">{typeLabels[purchaseReturn.type] || purchaseReturn.type}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text className="block mb-1 text-slate-500 text-sm">Iade Sebebi</Text>
                  <Tag color="default">
                    {reasonLabels[purchaseReturn.reason as PurchaseReturnReason] || purchaseReturn.reason}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text className="block mb-1 text-slate-500 text-sm">Iade Tutari</Text>
                  <Text strong className="text-slate-900 text-lg">
                    {purchaseReturn.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {purchaseReturn.currency || ''}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Duzenlenebilir Alanlar</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="rmaNumber" label={<span className="text-slate-700">RMA Numarasi</span>}>
                  <Input placeholder="Tedarikci RMA numarasi" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="refundMethod" label={<span className="text-slate-700">Iade Yontemi</span>}>
                  <Select placeholder="Secin (opsiyonel)" allowClear>
                    {refundMethodOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="reasonDetails" label={<span className="text-slate-700">Sebep Detayi</span>}>
                  <TextArea rows={3} placeholder="Iade sebebini detayli aciklayin..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Notlar</h3>
            <Form.Item name="notes" label={<span className="text-slate-700">Genel Not</span>}>
              <TextArea rows={2} placeholder="Genel notlar..." />
            </Form.Item>
            <Form.Item name="internalNotes" label={<span className="text-slate-700">Dahili Not</span>}>
              <TextArea rows={2} placeholder="Dahili not (tedarikciye gosterilmez)..." />
            </Form.Item>
          </div>

          {/* Items Summary (Read-Only) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Iade Kalemleri (Salt Okunur)</h3>
            <div className="space-y-2">
              {purchaseReturn.items?.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <Text strong className="text-slate-900">{index + 1}. {item.productName}</Text>
                    <Text className="ml-2 text-slate-500">({item.productCode})</Text>
                    <Tag color="default" className="ml-2">
                      {reasonLabels[item.reason as PurchaseReturnReason] || item.reason}
                    </Tag>
                  </div>
                  <div className="text-right">
                    <Text className="text-slate-600">{item.quantity} {item.unit} x {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                    <Text strong className="ml-4 text-slate-900">
                      {item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </Text>
                  </div>
                </div>
              ))}
              <Divider className="border-slate-200" />
              <div className="flex justify-between p-3 bg-slate-100 rounded-lg">
                <Text strong className="text-slate-700">Toplam Iade Tutari</Text>
                <Text strong className="text-slate-900 text-base">
                  {purchaseReturn.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {purchaseReturn.currency || ''}
                </Text>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
