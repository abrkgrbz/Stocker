'use client';

import React, { useEffect } from 'react';
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
import { Spinner } from '@/components/primitives';
import { useRouter, useParams } from 'next/navigation';
import { useDiscount, useUpdateDiscount } from '@/lib/api/hooks/useSales';
import type { UpdateDiscountDto, DiscountType } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const typeOptions: { value: DiscountType; label: string }[] = [
  { value: 'Percentage', label: 'Yüzde İndirim' },
  { value: 'FixedAmount', label: 'Sabit Tutar İndirim' },
  { value: 'BuyXGetY', label: 'X Al Y Öde' },
  { value: 'Tiered', label: 'Kademeli İndirim' },
];

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();
  const discountType = Form.useWatch('type', form);

  const { data: discount, isLoading } = useDiscount(id);
  const updateMutation = useUpdateDiscount();

  useEffect(() => {
    if (discount) {
      form.setFieldsValue({
        code: discount.code,
        name: discount.name,
        description: discount.description,
        type: discount.type,
        percentage: discount.percentage,
        amount: discount.amount,
        startDate: dayjs(discount.startDate),
        endDate: discount.endDate ? dayjs(discount.endDate) : null,
        minimumAmount: discount.minimumAmount,
        maximumDiscount: discount.maximumDiscount,
        maxUsageCount: discount.maxUsageCount,
        maxUsagePerCustomer: discount.maxUsagePerCustomer,
        firstOrderOnly: discount.firstOrderOnly,
        canCombine: discount.canCombine,
        isActive: discount.isActive,
      });
    }
  }, [discount, form]);

  const handleSubmit = async (values: any) => {
    const dto: UpdateDiscountDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      type: values.type,
      percentage: values.type === 'Percentage' ? values.percentage : undefined,
      amount: values.type === 'FixedAmount' ? values.amount : undefined,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate?.toISOString(),
      minimumAmount: values.minimumAmount,
      maximumDiscount: values.maximumDiscount,
      maxUsageCount: values.maxUsageCount,
      maxUsagePerCustomer: values.maxUsagePerCustomer,
      firstOrderOnly: values.firstOrderOnly || false,
      canCombine: values.canCombine || false,
      isActive: values.isActive,
    };

    try {
      await updateMutation.mutateAsync({ id, data: dto });
      message.success('İndirim güncellendi');
      router.push(`/sales/discounts/${id}`);
    } catch {
      message.error('İndirim güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!discount) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">İndirim bulunamadı</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push(`/sales/discounts/${id}`)}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>İndirim Düzenle: {discount.code}</Title>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  loading={updateMutation.isPending}
                  block
                >
                  Kaydet
                </Button>
                <Button block onClick={() => router.push(`/sales/discounts/${id}`)}>
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
