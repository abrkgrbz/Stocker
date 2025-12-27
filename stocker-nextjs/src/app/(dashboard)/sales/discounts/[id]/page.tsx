'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  PencilIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useRouter, useParams } from 'next/navigation';
import {
  useDiscount,
  useActivateDiscount,
  useDeactivateDiscount,
} from '@/lib/api/hooks/useSales';
import type { DiscountType } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const typeColors: Record<DiscountType, string> = {
  Percentage: 'blue',
  FixedAmount: 'green',
  BuyXGetY: 'purple',
  Tiered: 'orange',
};

const typeLabels: Record<DiscountType, string> = {
  Percentage: 'Yüzde İndirim',
  FixedAmount: 'Sabit Tutar İndirim',
  BuyXGetY: 'X Al Y Öde',
  Tiered: 'Kademeli İndirim',
};

export default function DiscountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: discount, isLoading } = useDiscount(id);
  const activateMutation = useActivateDiscount();
  const deactivateMutation = useDeactivateDiscount();

  const handleToggleActive = async () => {
    try {
      if (discount?.isActive) {
        await deactivateMutation.mutateAsync(id);
        message.success('İndirim pasifleştirildi');
      } else {
        await activateMutation.mutateAsync(id);
        message.success('İndirim aktifleştirildi');
      }
    } catch {
      message.error('İşlem gerçekleştirilemedi');
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

  const getDiscountValue = () => {
    if (discount.type === 'Percentage') {
      return `%${discount.percentage}`;
    }
    if (discount.type === 'FixedAmount') {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(discount.amount || 0);
    }
    return '-';
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/discounts')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {discount.name}
          </Title>
          <Tag color={discount.isActive ? 'success' : 'default'}>
            {discount.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
        </Space>
        <Space>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/sales/discounts/${id}/edit`)}>
            Düzenle
          </Button>
          <Button
            type={discount.isActive ? 'default' : 'primary'}
            icon={discount.isActive ? <StopIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
            onClick={handleToggleActive}
          >
            {discount.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          {/* Discount Info */}
          <Card title="İndirim Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Kod">
                <Text strong copyable>{discount.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ad">{discount.name}</Descriptions.Item>
              <Descriptions.Item label="Tür">
                <Tag color={typeColors[discount.type as DiscountType]}>
                  {typeLabels[discount.type as DiscountType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Değer">
                <Text strong style={{ fontSize: 16 }}>{getDiscountValue()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Başlangıç Tarihi">
                {dayjs(discount.startDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">
                {discount.endDate ? dayjs(discount.endDate).format('DD.MM.YYYY') : 'Süresiz'}
              </Descriptions.Item>
              <Descriptions.Item label="Minimum Tutar">
                {discount.minimumAmount
                  ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(discount.minimumAmount)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Maksimum İndirim">
                {discount.maximumDiscount
                  ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(discount.maximumDiscount)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Description */}
          {discount.description && (
            <Card title="Açıklama" style={{ marginBottom: 24 }}>
              <Text>{discount.description}</Text>
            </Card>
          )}

          {/* Conditions */}
          <Card title="Koşullar" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Müşteri Başına Limit">
                {discount.maxUsagePerCustomer || 'Limitsiz'}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kullanım Limiti">
                {discount.maxUsageCount || 'Limitsiz'}
              </Descriptions.Item>
              <Descriptions.Item label="İlk Sipariş">
                {discount.firstOrderOnly ? 'Evet' : 'Hayır'}
              </Descriptions.Item>
              <Descriptions.Item label="Kombine Edilebilir">
                {discount.canCombine ? 'Evet' : 'Hayır'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={8}>
          {/* Stats */}
          <Card title="İstatistikler">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Kullanım Sayısı"
                  value={discount.usageCount || 0}
                  suffix={discount.maxUsageCount ? `/ ${discount.maxUsageCount}` : ''}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Toplam İndirim"
                  value={discount.totalDiscountGiven || 0}
                  prefix="₺"
                  precision={2}
                />
              </Col>
            </Row>
          </Card>

          {/* Dates */}
          <Card title="Tarihler" style={{ marginTop: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Oluşturulma">
                {dayjs(discount.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
              {discount.updatedAt && (
                <Descriptions.Item label="Son Güncelleme">
                  {dayjs(discount.updatedAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
