'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Tabs,
  Descriptions,
  Tag,
  Space,
  Skeleton,
  Statistic,
  Row,
  Col,
  Progress,
  Timeline,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  DollarOutlined,
  CalendarOutlined,
  PercentageOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  useDeal,
  useDealProducts,
  useAddDealProduct,
  useRemoveDealProduct,
} from '@/lib/api/hooks/useCRM';
import { ProductSelector } from '@/components/crm/shared';
import { DocumentUpload } from '@/components/crm/shared';
import dayjs from 'dayjs';
import type { Guid } from '@/lib/api/services/crm.types';

// Mock products - replace with actual API call when available
const mockProducts = [
  { id: '1' as Guid, name: 'Ürün A', description: 'Ürün A açıklaması', unitPrice: 100, stockQuantity: 50 },
  { id: '2' as Guid, name: 'Ürün B', description: 'Ürün B açıklaması', unitPrice: 200, stockQuantity: 30 },
  { id: '3' as Guid, name: 'Ürün C', description: 'Ürün C açıklaması', unitPrice: 150, stockQuantity: 20 },
  { id: '4' as Guid, name: 'Ürün D', description: 'Ürün D açıklaması', unitPrice: 300, stockQuantity: 10 },
  { id: '5' as Guid, name: 'Ürün E', description: 'Ürün E açıklaması', unitPrice: 250, stockQuantity: 0 },
];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as Guid;

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch deal data from API
  const { data: deal, isLoading, error } = useDeal(dealId);
  const { data: dealProducts = [], isLoading: productsLoading } = useDealProducts(dealId);
  const addProduct = useAddDealProduct();
  const removeProduct = useRemoveDealProduct();

  const handleAddProduct = async (productId: Guid, quantity: number, unitPrice: number, discount?: number) => {
    await addProduct.mutateAsync({
      dealId,
      productId,
      quantity,
      unitPrice,
      discount,
    });
  };

  const handleRemoveProduct = async (productId: Guid) => {
    await removeProduct.mutateAsync({
      dealId,
      productId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
        <Skeleton active />
        <Skeleton active className="mt-4" />
        <Skeleton active className="mt-4" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Fırsat Bulunamadı</h3>
          <p className="text-gray-500 mb-6">Aradığınız fırsat sistemde kayıtlı değil</p>
          <Button type="primary" size="large" onClick={() => router.push('/crm/deals')}>
            Fırsat Listesine Dön
          </Button>
        </Card>
      </div>
    );
  }

  // Status colors
  const statusColors: Record<string, string> = {
    Open: 'blue',
    Won: 'green',
    Lost: 'red',
  };

  // Priority colors
  const priorityColors: Record<string, string> = {
    Low: 'default',
    Medium: 'orange',
    High: 'red',
  };

  // Calculate days until close
  const daysUntilClose = deal.expectedCloseDate
    ? dayjs(deal.expectedCloseDate).diff(dayjs(), 'day')
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="mb-6 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/crm/deals')}
                className="mb-4 bg-white/20 border-white/40 text-white hover:bg-white/30"
              >
                Geri Dön
              </Button>

              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white m-0">{deal.title}</h1>
                <Tag color={statusColors[deal.status]} className="text-base px-3 py-1">
                  {deal.status}
                </Tag>
                <Tag color={priorityColors[deal.priority]} className="text-base px-3 py-1">
                  {deal.priority}
                </Tag>
              </div>

              {deal.description && (
                <p className="text-white/90 text-base mb-0">{deal.description}</p>
              )}
            </div>

            <div className="text-right">
              <div className="text-5xl font-bold text-white mb-2">
                ₺{deal.amount.toLocaleString('tr-TR')}
              </div>
              <div className="flex items-center justify-end gap-2 text-white/90">
                <PercentageOutlined />
                <span>Olasılık: {deal.probability}%</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Tutar"
              value={deal.amount}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Başarı Olasılığı"
              value={deal.probability}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={deal.probability} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tahmini Kapanış"
              value={deal.expectedCloseDate ? dayjs(deal.expectedCloseDate).format('DD/MM/YYYY') : '-'}
              prefix={<CalendarOutlined />}
            />
            {daysUntilClose !== null && (
              <div className="text-sm text-gray-500 mt-2">
                {daysUntilClose > 0 ? `${daysUntilClose} gün kaldı` : 'Süresi doldu'}
              </div>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ürün Sayısı"
              value={dealProducts.length}
              prefix={<ShoppingCartOutlined />}
            />
            {dealProducts.length > 0 && (
              <div className="text-sm text-gray-500 mt-2">
                Toplam: ₺{dealProducts.reduce((sum, p) => sum + p.totalPrice, 0).toLocaleString('tr-TR')}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <FileTextOutlined />
                  Genel Bakış
                </span>
              ),
              children: (
                <div className="space-y-6">
                  <Descriptions title="Fırsat Bilgileri" bordered column={2}>
                    <Descriptions.Item label="Fırsat Adı" span={2}>
                      {deal.title}
                    </Descriptions.Item>
                    <Descriptions.Item label="Müşteri">
                      {deal.customerName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Durum">
                      <Tag color={statusColors[deal.status]}>{deal.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Öncelik">
                      <Tag color={priorityColors[deal.priority]}>{deal.priority}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Pipeline">
                      {deal.pipelineName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Aşama">
                      {deal.stageName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Toplam Tutar">
                      ₺{deal.amount.toLocaleString('tr-TR')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Olasılık">
                      {deal.probability}%
                    </Descriptions.Item>
                    <Descriptions.Item label="Tahmini Kapanış">
                      {deal.expectedCloseDate ? dayjs(deal.expectedCloseDate).format('DD/MM/YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Atanan Kişi">
                      {deal.assignedToName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Oluşturulma">
                      {dayjs(deal.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Güncellenme">
                      {deal.updatedAt ? dayjs(deal.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                    {deal.description && (
                      <Descriptions.Item label="Açıklama" span={2}>
                        {deal.description}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  {/* Timeline */}
                  <Card title="Aktivite Geçmişi" className="mt-6">
                    <Timeline
                      items={[
                        {
                          dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                          color: 'blue',
                          children: (
                            <>
                              <p className="font-semibold">Fırsat oluşturuldu</p>
                              <p className="text-gray-500">
                                {dayjs(deal.createdAt).format('DD/MM/YYYY HH:mm')}
                              </p>
                            </>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: 'products',
              label: (
                <span>
                  <ShoppingCartOutlined />
                  Ürünler ({dealProducts.length})
                </span>
              ),
              children: (
                <ProductSelector
                  entityType="deal"
                  entityId={dealId}
                  products={dealProducts}
                  availableProducts={mockProducts}
                  isLoading={productsLoading}
                  onAdd={handleAddProduct}
                  onRemove={handleRemoveProduct}
                />
              ),
            },
            {
              key: 'documents',
              label: (
                <span>
                  <FileTextOutlined />
                  Dokümanlar
                </span>
              ),
              children: (
                <DocumentUpload
                  entityId={dealId}
                  entityType="Deal"
                  maxFileSize={10}
                  allowedFileTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg']}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
