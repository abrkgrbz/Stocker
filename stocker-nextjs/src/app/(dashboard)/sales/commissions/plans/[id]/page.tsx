'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Space,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import {
  useCommissionPlan,
  useActivateCommissionPlan,
  useDeactivateCommissionPlan,
} from '@/lib/api/hooks/useSales';
import type { CommissionType } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const typeLabels: Record<CommissionType, string> = {
  Percentage: 'Yüzde',
  FixedAmount: 'Sabit Tutar',
  Tiered: 'Kademeli',
  Target: 'Hedef Bazlı',
};

export default function CommissionPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: plan, isLoading } = useCommissionPlan(id);
  const activateMutation = useActivateCommissionPlan();
  const deactivateMutation = useDeactivateCommissionPlan();

  const handleToggleActive = async () => {
    try {
      if (plan?.isActive) {
        await deactivateMutation.mutateAsync(id);
        message.success('Plan pasifleştirildi');
      } else {
        await activateMutation.mutateAsync(id);
        message.success('Plan aktifleştirildi');
      }
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/sales/commissions')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {plan.name}
          </Title>
          <Tag color={plan.isActive ? 'success' : 'default'}>
            {plan.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => router.push(`/sales/commissions/plans/${id}/edit`)}>
            Düzenle
          </Button>
          <Button
            type={plan.isActive ? 'default' : 'primary'}
            icon={plan.isActive ? <StopOutlined /> : <CheckOutlined />}
            onClick={handleToggleActive}
          >
            {plan.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
        </Space>
      </div>

      <Card title="Plan Bilgileri" style={{ marginBottom: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Ad">{plan.name}</Descriptions.Item>
          <Descriptions.Item label="Tür">
            <Tag color="blue">{typeLabels[plan.type as CommissionType]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Temel Oran">
            {plan.type === 'FixedAmount'
              ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(plan.fixedAmount || 0)
              : `%${plan.baseRate}`}
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={plan.isActive ? 'success' : 'default'}>
              {plan.isActive ? 'Aktif' : 'Pasif'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Minimum Satış">
            {plan.minimumSalesAmount
              ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(plan.minimumSalesAmount)
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Maksimum Komisyon">
            {plan.maximumCommission
              ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(plan.maximumCommission)
              : 'Limitsiz'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {plan.description && (
        <Card title="Açıklama" style={{ marginBottom: 24 }}>
          <Text>{plan.description}</Text>
        </Card>
      )}

      <Card title="Tarihler">
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Oluşturulma">
            {dayjs(plan.createdAt).format('DD.MM.YYYY HH:mm')}
          </Descriptions.Item>
          {plan.updatedAt && (
            <Descriptions.Item label="Son Güncelleme">
              {dayjs(plan.updatedAt).format('DD.MM.YYYY HH:mm')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}
