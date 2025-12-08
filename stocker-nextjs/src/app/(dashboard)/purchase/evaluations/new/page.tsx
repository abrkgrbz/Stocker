'use client';

import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  DatePicker,
  Slider,
  Divider,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  StarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreateSupplierEvaluation } from '@/lib/api/hooks/usePurchase';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import type { CreateSupplierEvaluationDto, EvaluationType } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
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
          <span className="font-medium">{info.label}</span>
          <div className="text-xs text-gray-400 font-normal">{info.description}</div>
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
        <div>
          <Title level={3} className="mb-1">Yeni Tedarikçi Değerlendirmesi</Title>
          <Text type="secondary">Tedarikçi performansını puanlayın</Text>
        </div>
      </div>

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
        <Row gutter={24}>
          {/* Left Panel */}
          <Col xs={24} lg={10}>
            <Card bordered={false} className="shadow-sm mb-6">
              <div
                style={{
                  background: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarOutlined style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }} />
                <p className="mt-4 text-lg font-medium text-white/90">Tedarikçi Değerlendirmesi</p>
                <p className="text-sm text-white/60">Performans kriterlerini puanlayın</p>
              </div>
            </Card>

            {/* Supplier Selection */}
            <Card
              title={
                <Space>
                  <ShopOutlined />
                  <span>Tedarikçi Bilgileri</span>
                </Space>
              }
              bordered={false}
              className="shadow-sm"
            >
              <Form.Item
                name="supplierId"
                label="Tedarikçi"
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
                    label="Değerlendirme Tipi"
                    rules={[{ required: true }]}
                  >
                    <Select options={evaluationTypeOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="evaluationDate"
                    label="Değerlendirme Tarihi"
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="evaluationPeriod" label="Değerlendirme Dönemi">
                <Input placeholder="Örn: 2024 Q4, Ocak 2024" />
              </Form.Item>
            </Card>
          </Col>

          {/* Right Panel */}
          <Col xs={24} lg={14}>
            {/* Scoring */}
            <Card title="Performans Puanları" bordered={false} className="shadow-sm mb-6">
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
            </Card>

            {/* Comments */}
            <Card title="Değerlendirme Notları" bordered={false} className="shadow-sm">
              <Form.Item name="strengths" label="Güçlü Yönler">
                <TextArea
                  rows={3}
                  placeholder="Tedarikçinin güçlü yönlerini belirtin..."
                />
              </Form.Item>

              <Form.Item name="weaknesses" label="Zayıf Yönler">
                <TextArea
                  rows={3}
                  placeholder="Geliştirilmesi gereken alanları belirtin..."
                />
              </Form.Item>

              <Form.Item name="recommendations" label="Öneriler">
                <TextArea
                  rows={3}
                  placeholder="İyileştirme önerilerinizi yazın..."
                />
              </Form.Item>

              <Form.Item name="notes" label="Ek Notlar">
                <TextArea rows={2} placeholder="Diğer notlar..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => router.back()}>İptal</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={createMutation.isPending}
          >
            Kaydet
          </Button>
        </div>
      </Form>
    </div>
  );
}
