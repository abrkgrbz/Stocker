'use client';

import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  message,
  Row,
  Col,
  Switch,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCreateCommissionPlan } from '@/lib/api/hooks/useSales';
import type { CreateCommissionPlanDto, CommissionType } from '@/lib/api/services/sales.service';

const { Title } = Typography;
const { TextArea } = Input;

const typeOptions: { value: CommissionType; label: string }[] = [
  { value: 'Percentage', label: 'Yüzde' },
  { value: 'FixedAmount', label: 'Sabit Tutar' },
  { value: 'Tiered', label: 'Kademeli' },
  { value: 'Target', label: 'Hedef Bazlı' },
];

export default function NewCommissionPlanPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const planType = Form.useWatch('type', form);

  const createMutation = useCreateCommissionPlan();

  const handleSubmit = async (values: any) => {
    const dto: CreateCommissionPlanDto = {
      name: values.name,
      description: values.description,
      type: values.type,
      baseRate: values.baseRate,
      fixedAmount: values.type === 'FixedAmount' ? values.fixedAmount : undefined,
      minimumSalesAmount: values.minimumSalesAmount,
      maximumCommission: values.maximumCommission,
      isActive: values.isActive ?? true,
    };

    try {
      await createMutation.mutateAsync(dto);
      message.success('Komisyon planı oluşturuldu');
      router.push('/sales/commissions');
    } catch {
      message.error('Komisyon planı oluşturulamadı');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/sales/commissions')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Yeni Komisyon Planı</Title>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'Percentage',
          isActive: true,
          baseRate: 5,
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            {/* Basic Info */}
            <Card title="Temel Bilgiler" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Plan Adı"
                    rules={[{ required: true, message: 'Ad giriniz' }]}
                  >
                    <Input placeholder="Standart Komisyon Planı" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="Plan açıklaması..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Commission Type & Value */}
            <Card title="Komisyon Detayları" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="Komisyon Türü"
                    rules={[{ required: true, message: 'Tür seçiniz' }]}
                  >
                    <Select options={typeOptions} />
                  </Form.Item>
                </Col>
                {(planType === 'Percentage' || planType === 'Tiered' || planType === 'Target') && (
                  <Col span={12}>
                    <Form.Item
                      name="baseRate"
                      label="Temel Komisyon Oranı"
                      rules={[{ required: true, message: 'Oran giriniz' }]}
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
                {planType === 'FixedAmount' && (
                  <Col span={12}>
                    <Form.Item
                      name="fixedAmount"
                      label="Sabit Komisyon Tutarı"
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

            {/* Limits */}
            <Card title="Limitler">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="minimumSalesAmount" label="Minimum Satış Tutarı">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      addonAfter="₺"
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maximumCommission" label="Maksimum Komisyon">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      addonAfter="₺"
                      placeholder="Limitsiz"
                    />
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
            </Card>

            {/* Actions */}
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createMutation.isPending}
                  block
                >
                  Plan Oluştur
                </Button>
                <Button block onClick={() => router.push('/sales/commissions')}>
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
