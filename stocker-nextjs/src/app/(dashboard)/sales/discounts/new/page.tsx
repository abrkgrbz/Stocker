'use client';

import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  InputNumber,
  Typography,
  message,
  Row,
  Col,
  Switch,
} from 'antd';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useCreateDiscount } from '@/lib/api/hooks/useSales';
import type { CreateDiscountDto, DiscountType } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const typeOptions: { value: DiscountType; label: string }[] = [
  { value: 'Percentage', label: 'Yüzde İndirim' },
  { value: 'FixedAmount', label: 'Sabit Tutar İndirim' },
  { value: 'BuyXGetY', label: 'X Al Y Öde' },
  { value: 'Tiered', label: 'Kademeli İndirim' },
];

export default function NewDiscountPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const discountType = Form.useWatch('type', form);

  const createMutation = useCreateDiscount();

  const handleSubmit = async (values: any) => {
    const dto: CreateDiscountDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      type: values.type,
      valueType: values.type === 'Percentage' ? 'Percentage' : 'FixedAmount',
      value: values.type === 'Percentage' ? values.percentage : values.amount,
      applicability: values.applicability || 'All',
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
      minimumOrderAmount: values.minimumAmount,
      maximumDiscountAmount: values.maximumDiscount,
      usageLimit: values.maxUsageCount,
      isStackable: values.canCombine || false,
    };

    try {
      await createMutation.mutateAsync(dto);
      message.success('İndirim oluşturuldu');
      router.push('/sales/discounts');
    } catch {
      message.error('İndirim oluşturulamadı');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/discounts')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Yeni İndirim</Title>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'Percentage',
          isActive: true,
          startDate: dayjs(),
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            {/* Basic Info */}
            <Card title="Temel Bilgiler" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="code"
                    label="İndirim Kodu"
                    rules={[{ required: true, message: 'Kod giriniz' }]}
                  >
                    <Input placeholder="INDIRIM20" style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="İndirim Adı"
                    rules={[{ required: true, message: 'Ad giriniz' }]}
                  >
                    <Input placeholder="Yaz İndirimi" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="İndirim açıklaması..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Discount Type & Value */}
            <Card title="İndirim Detayları" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="İndirim Türü"
                    rules={[{ required: true, message: 'Tür seçiniz' }]}
                  >
                    <Select options={typeOptions} />
                  </Form.Item>
                </Col>
                {discountType === 'Percentage' && (
                  <Col span={12}>
                    <Form.Item
                      name="percentage"
                      label="İndirim Yüzdesi"
                      rules={[{ required: true, message: 'Yüzde giriniz' }]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                )}
                {discountType === 'FixedAmount' && (
                  <Col span={12}>
                    <Form.Item
                      name="amount"
                      label="İndirim Tutarı"
                      rules={[{ required: true, message: 'Tutar giriniz' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        addonAfter="₺"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Validity Period */}
            <Card title="Geçerlilik Süresi" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    label="Başlangıç Tarihi"
                    rules={[{ required: true, message: 'Tarih seçiniz' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="endDate" label="Bitiş Tarihi">
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Limits */}
            <Card title="Limitler">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="minimumAmount" label="Minimum Sipariş Tutarı">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      addonAfter="₺"
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maximumDiscount" label="Maksimum İndirim Tutarı">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      addonAfter="₺"
                      placeholder="Limitsiz"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maxUsageCount" label="Toplam Kullanım Limiti">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Limitsiz" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maxUsagePerCustomer" label="Müşteri Başına Limit">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Limitsiz" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={8}>
            {/* Settings */}
            <Card title="Ayarlar" style={{ marginBottom: 24 }}>
              <Form.Item
                name="isActive"
                label="Aktif"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
              <Form.Item
                name="firstOrderOnly"
                label="Sadece İlk Sipariş"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
              <Form.Item
                name="canCombine"
                label="Diğer İndirimlerle Kombine Edilebilir"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </Card>

            {/* Actions */}
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<CheckIcon className="w-4 h-4" />}
                  htmlType="submit"
                  loading={createMutation.isPending}
                  block
                >
                  İndirim Oluştur
                </Button>
                <Button block onClick={() => router.push('/sales/discounts')}>
                  İptal
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
