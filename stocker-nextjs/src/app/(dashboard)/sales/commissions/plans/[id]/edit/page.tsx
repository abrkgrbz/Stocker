'use client';

import React, { useEffect } from 'react';
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
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Spinner } from '@/components/primitives';
import { useRouter, useParams } from 'next/navigation';
import { useCommissionPlan, useUpdateCommissionPlan } from '@/lib/api/hooks/useSales';
import type { UpdateCommissionPlanDto, CommissionType } from '@/lib/api/services/sales.service';

const { Title, Text } = Typography;
const { TextArea } = Input;

const typeOptions: { value: CommissionType; label: string }[] = [
  { value: 'Percentage', label: 'Yüzde' },
  { value: 'FixedAmount', label: 'Sabit Tutar' },
  { value: 'Tiered', label: 'Kademeli' },
  { value: 'Target', label: 'Hedef Bazlı' },
];

export default function EditCommissionPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();
  const planType = Form.useWatch('type', form);

  const { data: plan, isLoading } = useCommissionPlan(id);
  const updateMutation = useUpdateCommissionPlan();

  useEffect(() => {
    if (plan) {
      form.setFieldsValue({
        name: plan.name,
        description: plan.description,
        type: plan.type,
        baseRate: plan.baseRate,
        fixedAmount: plan.fixedAmount,
        minimumSalesAmount: plan.minimumSalesAmount,
        maximumCommission: plan.maximumCommission,
        isActive: plan.isActive,
      });
    }
  }, [plan, form]);

  const handleSubmit = async (values: any) => {
    const dto: UpdateCommissionPlanDto = {
      name: values.name,
      description: values.description,
      type: values.type,
      baseRate: values.baseRate,
      fixedAmount: values.type === 'FixedAmount' ? values.fixedAmount : undefined,
      minimumSalesAmount: values.minimumSalesAmount,
      maximumCommission: values.maximumCommission,
      isActive: values.isActive,
    };

    try {
      await updateMutation.mutateAsync({ id, data: dto });
      message.success('Komisyon planı güncellendi');
      router.push(`/sales/commissions/plans/${id}`);
    } catch {
      message.error('Komisyon planı güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">Plan bulunamadı</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push(`/sales/commissions/plans/${id}`)}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Plan Düzenle: {plan.name}</Title>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  icon={<CheckIcon className="w-4 h-4" />}
                  htmlType="submit"
                  loading={updateMutation.isPending}
                  block
                >
                  Kaydet
                </Button>
                <Button block onClick={() => router.push(`/sales/commissions/plans/${id}`)}>
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
