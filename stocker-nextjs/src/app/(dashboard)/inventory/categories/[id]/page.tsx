'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Spin,
  Empty,
  Row,
  Col,
  Tree,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  AppstoreOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useCategory, useCategories } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const { data: category, isLoading } = useCategory(categoryId);
  const { data: allCategories = [] } = useCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Kategori bulunamadı" />
      </div>
    );
  }

  // Find parent category
  const parentCategory = category.parentCategoryId
    ? allCategories.find((c) => c.id === category.parentCategoryId)
    : null;

  // Find child categories
  const childCategories = allCategories.filter((c) => c.parentCategoryId === categoryId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <AppstoreOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{category.name}</h1>
                  <Tag
                    icon={category.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={category.isActive ? 'success' : 'default'}
                  >
                    {category.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {category.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/categories/${categoryId}/edit`)}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Kategori Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Kategori Kodu">{category.code}</Descriptions.Item>
              <Descriptions.Item label="Kategori Adı">{category.name}</Descriptions.Item>
              <Descriptions.Item label="Sıralama">{category.displayOrder}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={category.isActive ? 'success' : 'default'}>
                  {category.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
              {parentCategory && (
                <Descriptions.Item label="Üst Kategori" span={2}>
                  <Button
                    type="link"
                    size="small"
                    className="p-0"
                    onClick={() => router.push(`/inventory/categories/${parentCategory.id}`)}
                  >
                    <FolderOutlined className="mr-1" />
                    {parentCategory.name}
                  </Button>
                </Descriptions.Item>
              )}
              {category.description && (
                <Descriptions.Item label="Açıklama" span={2}>
                  {category.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Child Categories */}
          {childCategories.length > 0 && (
            <Card title={`Alt Kategoriler (${childCategories.length})`}>
              <div className="space-y-2">
                {childCategories.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/inventory/categories/${child.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOutlined className="text-gray-400" />
                      <div>
                        <Text strong>{child.name}</Text>
                        <Text type="secondary" className="ml-2">
                          ({child.code})
                        </Text>
                      </div>
                    </div>
                    <Tag color={child.isActive ? 'success' : 'default'}>
                      {child.isActive ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Timestamps */}
          <Card title="Kayıt Bilgileri">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Oluşturulma</Text>
                <Text>{dayjs(category.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              {category.updatedAt && (
                <div className="flex justify-between">
                  <Text type="secondary">Güncelleme</Text>
                  <Text>{dayjs(category.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
