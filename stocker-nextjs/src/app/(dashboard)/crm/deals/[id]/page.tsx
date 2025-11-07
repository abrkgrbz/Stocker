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
  EditOutlined,
  UserOutlined,
  HomeOutlined,
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
      <div className="p-6">
        <Skeleton active />
        <Skeleton active className="mt-4" />
        <Skeleton active className="mt-4" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/crm/deals')}
          className="mb-4 hover:bg-white/50 backdrop-blur-sm"
        >
          Fırsat Listesine Dön
        </Button>
      </motion.div>

      {/* Clean Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Deal Title + Status/Priority Tags */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.title}</h1>
            <div className="flex items-center gap-2">
              <Tag color={statusColors[deal.status]} className="m-0">
                {deal.status === 'Open' ? 'Açık' : deal.status === 'Won' ? 'Kazanıldı' : 'Kaybedildi'}
              </Tag>
              <Tag color={priorityColors[deal.priority]} className="m-0">
                {deal.priority}
              </Tag>
            </div>
          </div>

          {/* Right: Edit Button */}
          <Button type="primary" icon={<EditOutlined />} size="large">
            Düzenle
          </Button>
        </div>
      </motion.div>

      {/* Clean Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Toplam Tutar</span>}
                value={deal.amount}
                precision={2}
                prefix="₺"
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
              />
              <div className="text-xs text-gray-400 mt-2">Fırsat Değeri</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Başarı Olasılığı</span>}
                value={deal.probability}
                suffix="%"
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
              />
              <Progress
                percent={deal.probability}
                showInfo={false}
                strokeColor={deal.probability > 70 ? '#10b981' : deal.probability > 40 ? '#f59e0b' : '#ef4444'}
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Tahmini Kapanış</span>}
                value={deal.expectedCloseDate ? dayjs(deal.expectedCloseDate).format('DD MMM YYYY') : '-'}
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.5rem' }}
              />
              {daysUntilClose !== null && (
                <div className="text-xs font-medium mt-2" style={{ color: daysUntilClose > 0 ? '#10b981' : '#ef4444' }}>
                  {daysUntilClose > 0 ? `${daysUntilClose} gün kaldı` : 'Süresi doldu'}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Ürün Sayısı</span>}
                value={dealProducts.length}
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
              />
              {dealProducts.length > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  Toplam: ₺{dealProducts.reduce((sum, p) => sum + (p.totalPrice || 0), 0).toLocaleString('tr-TR')}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Tabs Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-sm border border-gray-100">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center gap-2">
                    <HomeOutlined />
                    Genel Bakış
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <Row gutter={[24, 24]}>
                      {/* Left Column - Static Information */}
                      <Col xs={24} lg={12}>
                        {/* Deal Information Card */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileTextOutlined className="text-blue-500" />
                            Fırsat Bilgileri
                          </h3>
                          <Descriptions bordered column={1} size="middle">
                            <Descriptions.Item
                              label={
                                <>
                                  <UserOutlined /> Müşteri
                                </>
                              }
                              labelStyle={{ fontWeight: 'bold' }}
                            >
                              {deal.customerName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Pipeline" labelStyle={{ fontWeight: 'bold' }}>
                              {deal.pipelineName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Aşama" labelStyle={{ fontWeight: 'bold' }}>
                              {deal.stageName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Durum" labelStyle={{ fontWeight: 'bold' }}>
                              <Tag color={statusColors[deal.status]}>
                                {deal.status === 'Open' ? 'Açık' : deal.status === 'Won' ? 'Kazanıldı' : 'Kaybedildi'}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Öncelik" labelStyle={{ fontWeight: 'bold' }}>
                              <Tag color={priorityColors[deal.priority]}>{deal.priority}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Atanan Kişi" labelStyle={{ fontWeight: 'bold' }}>
                              {deal.assignedToName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Oluşturulma" labelStyle={{ fontWeight: 'bold' }}>
                              {dayjs(deal.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Güncellenme" labelStyle={{ fontWeight: 'bold' }}>
                              {deal.updatedAt ? dayjs(deal.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
                            </Descriptions.Item>
                          </Descriptions>
                        </motion.div>

                        {/* Description Card */}
                        {deal.description && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6"
                          >
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <FileTextOutlined className="text-blue-500" />
                              Açıklama
                            </h3>
                            <Card className="bg-gray-50 border border-gray-200 shadow-sm">
                              <p className="text-gray-700">{deal.description}</p>
                            </Card>
                          </motion.div>
                        )}

                        {/* Products Summary */}
                        {dealProducts.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6"
                          >
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <ShoppingCartOutlined className="text-blue-500" />
                              Ürünler Özeti
                            </h3>
                            <Card className="border border-gray-200 shadow-sm">
                              <div className="space-y-2">
                                {dealProducts.slice(0, 3).map((product) => (
                                  <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                    <span className="text-gray-700">
                                      {product.quantity}x {product.productName || 'Ürün'}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      ₺{(product.totalPrice || 0).toLocaleString('tr-TR')}
                                    </span>
                                  </div>
                                ))}
                                {dealProducts.length > 3 && (
                                  <div className="text-center text-sm text-gray-500 pt-2">
                                    +{dealProducts.length - 3} daha fazla ürün
                                  </div>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        )}
                      </Col>

                      {/* Right Column - Dynamic Information */}
                      <Col xs={24} lg={12}>
                        {/* Activity Timeline - Most Important */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ClockCircleOutlined className="text-blue-500" />
                            Aktivite Geçmişi
                          </h3>
                          <Card className="border border-gray-200 shadow-sm">
                            <Timeline
                              items={[
                                {
                                  dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                                  color: 'blue',
                                  children: (
                                    <>
                                      <p className="font-semibold text-gray-900">Fırsat oluşturuldu</p>
                                      <p className="text-gray-500 text-sm">
                                        {dayjs(deal.createdAt).format('DD/MM/YYYY HH:mm')}
                                      </p>
                                    </>
                                  ),
                                },
                              ]}
                            />
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Button type="dashed" block>
                                + Yeni Aktivite Ekle
                              </Button>
                            </div>
                          </Card>
                        </motion.div>

                        {/* Documents Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6"
                        >
                          <DocumentUpload
                            entityId={dealId}
                            entityType="Deal"
                            maxFileSize={10}
                            allowedFileTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg']}
                          />
                        </motion.div>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'products',
                label: (
                  <span className="flex items-center gap-2">
                    <ShoppingCartOutlined />
                    Ürünler ({dealProducts.length})
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <ProductSelector
                      entityType="deal"
                      entityId={dealId}
                      products={dealProducts}
                      availableProducts={mockProducts}
                      isLoading={productsLoading}
                      onAdd={handleAddProduct}
                      onRemove={handleRemoveProduct}
                    />
                  </div>
                ),
              },
              {
                key: 'documents',
                label: (
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Dokümanlar
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <DocumentUpload
                      entityId={dealId}
                      entityType="Deal"
                      maxFileSize={10}
                      allowedFileTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg']}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </motion.div>
    </div>
  );
}
