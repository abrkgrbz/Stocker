'use client';

import React from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Slider,
  Divider,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreateSupplierEvaluation } from '@/lib/api/hooks/usePurchase';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import type { CreateSupplierEvaluationDto, EvaluationType } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;

const evaluationTypeOptions: { value: EvaluationType; label: string }[] = [
  { value: 'Periodic', label: 'Periyodik' },
  { value: 'PostDelivery', label: 'Teslimat Sonrası' },
  { value: 'Annual', label: 'Yıllık' },
  { value: 'Quarterly', label: 'Çeyreklik' },
  { value: 'Incident', label: 'Olay Bazlı' },
];

const criteriaLabels: Record<string, { label: string; description: string }> = {
  qualityScore: { label: 'Kalite', description: 'Ürün kalitesi ve standartlara uygunluk' },
  deliveryScore: { label: 'Teslimat', description: 'Zamanında ve doğru teslimat performansı' },
  priceScore: { label: 'Fiyat', description: 'Fiyat rekabetçiliği ve değer' },
  serviceScore: { label: 'Hizmet', description: 'Müşteri hizmetleri ve iletişim' },
  responsiveness: { label: 'Yanıt Hızı', description: 'Sorulara ve sorunlara yanıt süresi' },
  reliability: { label: 'Güvenilirlik', description: 'Tutarlılık ve güvenilirlik' },
  flexibility: { label: 'Esneklik', description: 'Değişen gereksinimlere uyum' },
  documentation: { label: 'Dokümantasyon', description: 'Belgelerin doğruluğu ve tamlığı' },
};

export default function NewSupplierEvaluationPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const createMutation = useCreateSupplierEvaluation();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ pageSize: 100 });

  const handleSubmit = async (values: any) => {
    const data: CreateSupplierEvaluationDto = {
      supplierId: values.supplierId,
      evaluationType: values.evaluationType,
      evaluationPeriod: values.evaluationPeriod,
      evaluationDate: values.evaluationDate?.toISOString(),
      qualityScore: values.qualityScore,
      deliveryScore: values.deliveryScore,
      priceScore: values.priceScore,
      serviceScore: values.serviceScore,
      responsiveness: values.responsiveness,
      reliability: values.reliability,
      flexibility: values.flexibility,
      documentation: values.documentation,
      strengths: values.strengths,
      weaknesses: values.weaknesses,
      recommendations: values.recommendations,
      notes: values.notes,
    };

    try {
      await createMutation.mutateAsync(data);
      router.push('/purchase/evaluations');
    } catch (error) {
      // Error handled by hook
    }
  };

  const renderScoreSlider = (name: string, info: { label: string; description: string }) => (
    <Form.Item
      name={name}
      label={
        <div>
          <span className="text-sm font-medium text-slate-700">{info.label}</span>
          <div className="text-xs text-slate-400 font-normal">{info.description}</div>
        </div>
      }
      rules={[{ required: true, message: 'Zorunlu' }]}
    >
      <Slider
        min={0}
        max={100}
        marks={{
          0: '0',
          25: '25',
          50: '50',
          75: '75',
          100: '100',
        }}
        tooltip={{ formatter: (value) => `${value} puan` }}
      />
    </Form.Item>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Yeni Tedarikçi Değerlendirmesi</h1>
                <p className="text-sm text-slate-500">Tedarikçi performansını puanlayın</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            evaluationType: 'Periodic',
            evaluationDate: dayjs(),
            qualityScore: 70,
            deliveryScore: 70,
            priceScore: 70,
            serviceScore: 70,
            responsiveness: 70,
            reliability: 70,
            flexibility: 70,
            documentation: 70,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Visual Card */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <StarIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Tedarikçi Değerlendirmesi</h3>
                  <p className="text-sm text-white/70">Performans kriterlerini puanlayın</p>
                </div>
              </div>

              {/* Supplier Selection */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BuildingStorefrontIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="font-medium text-slate-900">Tedarikçi Bilgileri</h3>
                </div>

                <Form.Item
                  name="supplierId"
                  label={<span className="text-sm font-medium text-slate-700">Tedarikçi</span>}
                  rules={[{ required: true, message: 'Tedarikçi seçimi zorunludur' }]}
                >
                  <Select
                    placeholder="Tedarikçi seçin"
                    showSearch
                    optionFilterProp="children"
                    loading={suppliersLoading}
                  >
                    {suppliersData?.items?.map(supplier => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="evaluationType"
                      label={<span className="text-sm font-medium text-slate-700">Değerlendirme Tipi</span>}
                      rules={[{ required: true }]}
                    >
                      <Select options={evaluationTypeOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="evaluationDate"
                      label={<span className="text-sm font-medium text-slate-700">Değerlendirme Tarihi</span>}
                      rules={[{ required: true }]}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="evaluationPeriod"
                  label={<span className="text-sm font-medium text-slate-700">Değerlendirme Dönemi</span>}
                >
                  <Input placeholder="Örn: 2024 Q4, Ocak 2024" />
                </Form.Item>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Scoring */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-6">Performans Puanları</h3>
                <Row gutter={24}>
                  <Col span={12}>
                    {renderScoreSlider('qualityScore', criteriaLabels.qualityScore)}
                  </Col>
                  <Col span={12}>
                    {renderScoreSlider('deliveryScore', criteriaLabels.deliveryScore)}
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    {renderScoreSlider('priceScore', criteriaLabels.priceScore)}
                  </Col>
                  <Col span={12}>
                    {renderScoreSlider('serviceScore', criteriaLabels.serviceScore)}
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    {renderScoreSlider('responsiveness', criteriaLabels.responsiveness)}
                  </Col>
                  <Col span={12}>
                    {renderScoreSlider('reliability', criteriaLabels.reliability)}
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    {renderScoreSlider('flexibility', criteriaLabels.flexibility)}
                  </Col>
                  <Col span={12}>
                    {renderScoreSlider('documentation', criteriaLabels.documentation)}
                  </Col>
                </Row>
              </div>

              {/* Comments */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-6">Değerlendirme Notları</h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="strengths"
                      label={<span className="text-sm font-medium text-emerald-700">Güçlü Yönler</span>}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Tedarikçinin güçlü yönlerini belirtin..."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="weaknesses"
                      label={<span className="text-sm font-medium text-red-700">Zayıf Yönler</span>}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Geliştirilmesi gereken alanları belirtin..."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="recommendations"
                  label={<span className="text-sm font-medium text-blue-700">Öneriler</span>}
                >
                  <TextArea
                    rows={3}
                    placeholder="İyileştirme önerilerinizi yazın..."
                  />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label={<span className="text-sm font-medium text-slate-700">Ek Notlar</span>}
                >
                  <TextArea rows={2} placeholder="Diğer notlar..." />
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
