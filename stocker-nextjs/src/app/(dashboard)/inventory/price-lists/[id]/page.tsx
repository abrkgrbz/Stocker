'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Modal,
  Empty,
  Table,
  Row,
  Col,
  Statistic,
  Switch,
  Divider,
  InputNumber,
  AutoComplete,
  message,
  Form,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  PlusOutlined,
  CalendarOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  usePriceList,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
  useProducts,
  useAddPriceListItem,
  useUpdatePriceListItem,
} from '@/lib/api/hooks/useInventory';
import type { PriceListItemDto, CreatePriceListItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;

const currencySymbols: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

export default function PriceListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const priceListId = Number(params.id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceListItemDto | null>(null);
  const [newItemForm] = Form.useForm();

  const { data: priceList, isLoading } = usePriceList(priceListId);
  const { data: products = [] } = useProducts();
  const deletePriceList = useDeletePriceList();
  const activatePriceList = useActivatePriceList();
  const deactivatePriceList = useDeactivatePriceList();
  const addPriceListItem = useAddPriceListItem();
  const updatePriceListItem = useUpdatePriceListItem();

  const handleDelete = async () => {
    try {
      await deletePriceList.mutateAsync(priceListId);
      router.push('/inventory/price-lists');
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async () => {
    if (!priceList) return;
    try {
      if (priceList.isActive) {
        await deactivatePriceList.mutateAsync(priceListId);
      } else {
        await activatePriceList.mutateAsync(priceListId);
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddItem = async () => {
    try {
      const values = await newItemForm.validateFields();

      const data: CreatePriceListItemDto = {
        productId: values.productId,
        price: values.price,
        minQuantity: values.minQuantity,
        maxQuantity: values.maxQuantity,
        discountPercentage: values.discountPercentage,
      };

      await addPriceListItem.mutateAsync({ priceListId, data });
      setAddItemModalOpen(false);
      newItemForm.resetFields();
    } catch {
      // Validation error
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const values = await newItemForm.validateFields();

      const data: CreatePriceListItemDto = {
        productId: editingItem.productId,
        price: values.price,
        minQuantity: values.minQuantity,
        maxQuantity: values.maxQuantity,
        discountPercentage: values.discountPercentage,
      };

      await updatePriceListItem.mutateAsync({
        priceListId,
        itemId: editingItem.id,
        data,
      });
      setEditingItem(null);
      newItemForm.resetFields();
    } catch {
      // Validation error
    }
  };

  const openEditModal = (item: PriceListItemDto) => {
    setEditingItem(item);
    newItemForm.setFieldsValue({
      productId: item.productId,
      price: item.price,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      discountPercentage: item.discountPercentage,
    });
  };

  const getValidityStatus = () => {
    if (!priceList) return { status: 'unknown', label: 'Bilinmiyor', color: 'default' };

    const now = dayjs();
    const validFrom = priceList.validFrom ? dayjs(priceList.validFrom) : null;
    const validTo = priceList.validTo ? dayjs(priceList.validTo) : null;

    if (validFrom && now.isBefore(validFrom)) {
      return { status: 'pending', label: 'Beklemede', color: 'orange' };
    }
    if (validTo && now.isAfter(validTo)) {
      return { status: 'expired', label: 'Süresi Doldu', color: 'red' };
    }
    return { status: 'valid', label: 'Geçerli', color: 'green' };
  };

  const itemColumns: ColumnsType<PriceListItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Text type="secondary" className="text-xs">
            {record.productCode}
          </Text>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price, record) => (
        <Text strong>
          {price.toLocaleString('tr-TR', {
            style: 'currency',
            currency: record.currency || priceList?.currency || 'TRY',
          })}
        </Text>
      ),
    },
    {
      title: 'Miktar Aralığı',
      key: 'quantity',
      width: 150,
      render: (_, record) => {
        if (!record.minQuantity && !record.maxQuantity) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Text>
            {record.minQuantity || 1} - {record.maxQuantity || '∞'}
          </Text>
        );
      },
    },
    {
      title: 'İndirim',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      render: (discount) =>
        discount ? (
          <Tag color="green">%{discount}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Fiyat listesi bulunamadı" />
      </div>
    );
  }

  const validityStatus = getValidityStatus();
  const currencySymbol = currencySymbols[priceList.currency] || priceList.currency;
  const totalItems = priceList.items?.length || 0;
  const activeItems = priceList.items?.filter((i) => i.isActive).length || 0;
  const avgPrice =
    totalItems > 0
      ? priceList.items.reduce((sum, i) => sum + i.price, 0) / totalItems
      : 0;

  // Get products not already in the price list
  const availableProducts = products.filter(
    (p) => !priceList.items?.some((i) => i.productId === p.id)
  );

  return (
    <div className="max-w-6xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <DollarOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{priceList.name}</h1>
                  <Tag color={priceList.isActive ? 'success' : 'default'}>
                    {priceList.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  <Tag color={validityStatus.color}>{validityStatus.label}</Tag>
                  {priceList.isDefault && <Tag color="blue">Varsayılan</Tag>}
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {priceList.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={priceList.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={handleToggleActive}
              loading={activatePriceList.isPending || deactivatePriceList.isPending}
            >
              {priceList.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'}
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/price-lists/${priceListId}/edit`)}
            >
              Düzenle
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalOpen(true)}>
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Para Birimi"
              value={priceList.currency}
              prefix={currencySymbol}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Toplam Kalem"
              value={totalItems}
              suffix={`/ ${activeItems} aktif`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Ortalama Fiyat"
              value={avgPrice}
              precision={2}
              prefix={currencySymbol}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Öncelik"
              value={priceList.priority}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card title="Liste Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Kod">{priceList.code}</Descriptions.Item>
              <Descriptions.Item label="Ad">{priceList.name}</Descriptions.Item>
              <Descriptions.Item label="Para Birimi">
                {currencySymbol} {priceList.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Öncelik">{priceList.priority}</Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={2}>
                {priceList.description || <Text type="secondary">Açıklama yok</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Items */}
          <Card
            title={`Fiyat Kalemleri (${totalItems})`}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddItemModalOpen(true)}
                size="small"
                style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                disabled={availableProducts.length === 0}
              >
                Kalem Ekle
              </Button>
            }
          >
            <Table
              columns={itemColumns}
              dataSource={priceList.items || []}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} kalem`,
              }}
              size="small"
              locale={{ emptyText: 'Henüz fiyat kalemi eklenmedi' }}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Validity */}
          <Card title="Geçerlilik" className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarOutlined style={{ color: '#6b7280' }} />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Başlangıç Tarihi
                  </Text>
                  <Text>
                    {priceList.validFrom
                      ? dayjs(priceList.validFrom).format('DD/MM/YYYY')
                      : 'Belirtilmedi'}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarOutlined style={{ color: '#6b7280' }} />
                <div>
                  <Text type="secondary" className="block text-xs">
                    Bitiş Tarihi
                  </Text>
                  <Text>
                    {priceList.validTo
                      ? dayjs(priceList.validTo).format('DD/MM/YYYY')
                      : 'Belirtilmedi'}
                  </Text>
                </div>
              </div>
              <Divider className="my-2" />
              <div className="text-center">
                <Tag color={validityStatus.color} className="text-base px-4 py-1">
                  {validityStatus.label}
                </Tag>
              </div>
            </div>
          </Card>

          {/* Discounts */}
          <Card title="İndirimler" className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PercentageOutlined style={{ color: '#10b981' }} />
                  <Text>Genel İndirim</Text>
                </div>
                <Text strong>
                  {priceList.globalDiscountPercentage
                    ? `%${priceList.globalDiscountPercentage}`
                    : '-'}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PercentageOutlined style={{ color: '#ef4444' }} />
                  <Text>Genel Kar Marjı</Text>
                </div>
                <Text strong>
                  {priceList.globalMarkupPercentage
                    ? `%${priceList.globalMarkupPercentage}`
                    : '-'}
                </Text>
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card title="Ayarlar">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>Aktif</Text>
                <Switch checked={priceList.isActive} disabled />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text>Varsayılan Liste</Text>
                <Switch checked={priceList.isDefault} disabled />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        title="Fiyat Listesini Sil"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deletePriceList.isPending }}
      >
        <p>
          <strong>{priceList.name}</strong> fiyat listesini silmek istediğinize emin misiniz?
        </p>
        <p className="text-gray-500 text-sm">Bu işlem geri alınamaz.</p>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem ? 'Fiyat Kalemini Düzenle' : 'Yeni Fiyat Kalemi'}
        open={addItemModalOpen || !!editingItem}
        onCancel={() => {
          setAddItemModalOpen(false);
          setEditingItem(null);
          newItemForm.resetFields();
        }}
        onOk={editingItem ? handleUpdateItem : handleAddItem}
        okText={editingItem ? 'Güncelle' : 'Ekle'}
        cancelText="İptal"
        okButtonProps={{
          loading: addPriceListItem.isPending || updatePriceListItem.isPending,
        }}
      >
        <Form form={newItemForm} layout="vertical">
          {!editingItem && (
            <Form.Item
              name="productId"
              label="Ürün"
              rules={[{ required: true, message: 'Ürün seçiniz' }]}
            >
              <AutoComplete
                placeholder="Ürün ara..."
                options={availableProducts.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.name}`,
                }))}
                filterOption={(inputValue, option) =>
                  option?.label?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                }
              />
            </Form.Item>
          )}

          {editingItem && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Text type="secondary" className="text-xs">
                Seçilen Ürün
              </Text>
              <div className="font-medium">{editingItem.productName}</div>
              <Text type="secondary" className="text-xs">
                {editingItem.productCode}
              </Text>
            </div>
          )}

          <Form.Item
            name="price"
            label={`Fiyat (${priceList.currency})`}
            rules={[{ required: true, message: 'Fiyat gerekli' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix={currencySymbol}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minQuantity" label="Min. Miktar">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxQuantity" label="Max. Miktar">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="discountPercentage" label="İndirim Oranı (%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
