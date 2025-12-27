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
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import {
  useOpportunity,
  useOpportunityProducts,
  useAddOpportunityProduct,
  useRemoveOpportunityProduct,
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

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as Guid;

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch opportunity data from API
  const { data: opportunity, isLoading, error } = useOpportunity(opportunityId);
  const { data: opportunityProducts = [], isLoading: productsLoading } = useOpportunityProducts(opportunityId);
  const addProduct = useAddOpportunityProduct();
  const removeProduct = useRemoveOpportunityProduct();

  const handleAddProduct = async (productId: Guid, quantity: number, unitPrice: number, discount?: number) => {
    await addProduct.mutateAsync({
      opportunityId,
      productId,
      quantity,
      unitPrice,
      discount,
    });
  };

  const handleRemoveProduct = async (productId: Guid) => {
    await removeProduct.mutateAsync({
      opportunityId,
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

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Fırsat Bulunamadı</h3>
          <p className="text-gray-500 mb-6">Aradığınız fırsat sistemde kayıtlı değil</p>
          <Button type="primary" size="large" onClick={() => router.push('/crm/opportunities')}>
            Fırsat Listesine Dön
          </Button>
        </Card>
      </div>
    );
  }

  // Status colors
  const statusColors: Record<string, string> = {
    Prospecting: 'blue',
    Qualification: 'cyan',
    NeedsAnalysis: 'geekblue',
    Proposal: 'purple',
    Negotiation: 'orange',
    ClosedWon: 'green',
    ClosedLost: 'red',
  };

  // Calculate days until close
  const daysUntilClose = opportunity.expectedCloseDate
    ? dayjs(opportunity.expectedCloseDate).diff(dayjs(), 'day')
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
                icon={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={() => router.push('/crm/opportunities')}
                className="mb-4 bg-white/20 border-white/40 text-white hover:bg-white/30"
              >
                Geri Dön
              </Button>

              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white m-0">{opportunity.name}</h1>
                <Tag color={statusColors[opportunity.status]} className="text-base px-3 py-1">
                  {opportunity.status}
                </Tag>
              </div>

              {opportunity.description && (
                <p className="text-white/90 text-base mb-0">{opportunity.description}</p>
              )}
            </div>

            <div className="text-right">
              <div className="text-5xl font-bold text-white mb-2">
                ₺{opportunity.amount.toLocaleString('tr-TR')}
              </div>
              <div className="flex items-center justify-end gap-2 text-white/90">
                <ReceiptPercentIcon className="w-4 h-4" />
                <span>Olasılık: {opportunity.probability}%</span>
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
              value={opportunity.amount}
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
              value={opportunity.probability}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={opportunity.probability} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tahmini Kapanış"
              value={opportunity.expectedCloseDate ? dayjs(opportunity.expectedCloseDate).format('DD/MM/YYYY') : '-'}
              prefix={<CalendarIcon className="w-4 h-4" />}
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
              value={opportunityProducts.length}
              prefix={<ShoppingCartIcon className="w-4 h-4" />}
            />
            {opportunityProducts.length > 0 && (
              <div className="text-sm text-gray-500 mt-2">
                Toplam: ₺{opportunityProducts.reduce((sum, p) => sum + p.totalPrice, 0).toLocaleString('tr-TR')}
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
                  <DocumentTextIcon className="w-4 h-4" />
                  Genel Bakış
                </span>
              ),
              children: (
                <div className="space-y-6">
                  <Descriptions title="Fırsat Bilgileri" bordered column={2}>
                    <Descriptions.Item label="Fırsat Adı" span={2}>
                      {opportunity.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Müşteri">
                      {opportunity.customerName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Durum">
                      <Tag color={statusColors[opportunity.status]}>{opportunity.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Pipeline">
                      {opportunity.pipelineName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Aşama">
                      {opportunity.stageName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Toplam Tutar">
                      ₺{opportunity.amount.toLocaleString('tr-TR')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Olasılık">
                      {opportunity.probability}%
                    </Descriptions.Item>
                    <Descriptions.Item label="Tahmini Kapanış">
                      {opportunity.expectedCloseDate ? dayjs(opportunity.expectedCloseDate).format('DD/MM/YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gerçek Kapanış">
                      {opportunity.actualCloseDate ? dayjs(opportunity.actualCloseDate).format('DD/MM/YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Atanan Kişi">
                      {opportunity.assignedToName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Oluşturulma">
                      {dayjs(opportunity.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Güncellenme">
                      {opportunity.updatedAt ? dayjs(opportunity.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                    {opportunity.description && (
                      <Descriptions.Item label="Açıklama" span={2}>
                        {opportunity.description}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  {/* Timeline */}
                  <Card title="Aktivite Geçmişi" className="mt-6">
                    <Timeline
                      items={[
                        {
                          dot: <ClockIcon className="w-4 h-4" style={{ fontSize: '16px' }} />,
                          color: 'blue',
                          children: (
                            <>
                              <p className="font-semibold">Fırsat oluşturuldu</p>
                              <p className="text-gray-500">
                                {dayjs(opportunity.createdAt).format('DD/MM/YYYY HH:mm')}
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
                  <ShoppingCartIcon className="w-4 h-4" />
                  Ürünler ({opportunityProducts.length})
                </span>
              ),
              children: (
                <ProductSelector
                  entityType="opportunity"
                  entityId={opportunityId}
                  products={opportunityProducts}
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
                  <DocumentTextIcon className="w-4 h-4" />
                  Dokümanlar
                </span>
              ),
              children: (
                <DocumentUpload
                  entityId={opportunityId}
                  entityType="Opportunity"
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
