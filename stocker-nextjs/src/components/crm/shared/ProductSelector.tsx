'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  InputNumber,
  Select,
  Space,
  Modal,
  Typography,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Guid } from '@/lib/api/services/crm.types';

const { Title, Text } = Typography;

interface Product {
  id: Guid;
  name: string;
  description?: string;
  unitPrice: number;
  stockQuantity?: number;
}

interface ProductItem {
  id: Guid;
  productId: Guid;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface ProductSelectorProps {
  entityType: 'deal' | 'opportunity';
  entityId: Guid;
  products: ProductItem[];
  availableProducts?: Product[];
  isLoading?: boolean;
  onAdd: (productId: Guid, quantity: number, unitPrice: number, discount?: number) => Promise<void>;
  onRemove: (productId: Guid) => Promise<void>;
}

export function ProductSelector({
  entityType,
  entityId,
  products,
  availableProducts = [],
  isLoading = false,
  onAdd,
  onRemove,
}: ProductSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();

  // Calculate totals
  const subtotal = products.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = products.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + (itemTotal * (item.discount / 100));
  }, 0);
  const total = subtotal - totalDiscount;

  const handleAddProduct = async () => {
    try {
      const values = await form.validateFields();
      setIsAdding(true);

      await onAdd(
        values.productId,
        values.quantity,
        values.unitPrice,
        values.discount || 0
      );

      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error, don't show message
        return;
      }
      console.error('Error adding product:', error);
      message.error('Ürün eklenirken hata oluştu');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveProduct = async (productId: Guid) => {
    try {
      await onRemove(productId);
    } catch (error) {
      console.error('Error removing product:', error);
      message.error('Ürün kaldırılırken hata oluştu');
    }
  };

  const handleProductSelect = (productId: Guid) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      form.setFieldsValue({
        unitPrice: product.unitPrice,
      });
    }
  };

  const columns = [
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => (
        <Space>
          <ShoppingCartOutlined style={{ color: '#1890ff' }} />
          <Text strong>{name || 'Ürün'}</Text>
        </Space>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      align: 'right' as const,
      render: (price: number) => `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'İndirim',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      align: 'center' as const,
      render: (discount: number) => `%${discount}`,
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 150,
      align: 'right' as const,
      render: (_: any, record: ProductItem) => {
        const itemTotal = record.quantity * record.unitPrice;
        const discountAmount = itemTotal * (record.discount / 100);
        const finalTotal = itemTotal - discountAmount;
        return (
          <Text strong style={{ color: '#52c41a' }}>
            ₺{finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Text>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: ProductItem) => (
        <Popconfirm
          title="Ürünü kaldır"
          description="Bu ürünü listeden kaldırmak istediğinizden emin misiniz?"
          onConfirm={() => handleRemoveProduct(record.productId)}
          okText="Kaldır"
          cancelText="İptal"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Add Product Button */}
      <Card>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          size="large"
          block
        >
          Ürün Ekle
        </Button>
      </Card>

      {/* Products Table */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            title={
              <Space>
                <ShoppingCartOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                <span>Ürünler ({products.length})</span>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              size="middle"
            />

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Row gutter={16} justify="end">
                <Col>
                  <Statistic
                    title="Ara Toplam"
                    value={subtotal}
                    precision={2}
                    prefix="₺"
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="İndirim"
                    value={totalDiscount}
                    precision={2}
                    prefix="₺"
                    valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="Genel Toplam"
                    value={total}
                    precision={2}
                    prefix="₺"
                    valueStyle={{ fontSize: '20px', color: '#52c41a', fontWeight: 'bold' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add Product Modal */}
      <Modal
        title={`Ürün Ekle - ${entityType === 'deal' ? 'Anlaşma' : 'Fırsat'}`}
        open={isModalVisible}
        onOk={handleAddProduct}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={isAdding}
        okText="Ekle"
        cancelText="İptal"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            quantity: 1,
            discount: 0,
          }}
        >
          <Form.Item
            name="productId"
            label="Ürün"
            rules={[{ required: true, message: 'Ürün seçiniz' }]}
          >
            <Select
              placeholder="Ürün seçiniz"
              showSearch
              optionFilterProp="children"
              onChange={handleProductSelect}
              filterOption={(input, option) =>
                (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableProducts.map(product => ({
                label: `${product.name}${product.stockQuantity !== undefined ? ` (Stok: ${product.stockQuantity})` : ''}`,
                value: product.id,
                disabled: product.stockQuantity !== undefined && product.stockQuantity === 0,
              }))}
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Miktar"
                rules={[
                  { required: true, message: 'Miktar giriniz' },
                  { type: 'number', min: 1, message: 'En az 1 olmalı' },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="1"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label="Birim Fiyat (₺)"
                rules={[
                  { required: true, message: 'Fiyat giriniz' },
                  { type: 'number', min: 0, message: 'Geçerli fiyat giriniz' },
                ]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="discount"
                label="İndirim (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: '0-100 arası değer giriniz' },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate>
            {() => {
              const quantity = form.getFieldValue('quantity') || 0;
              const unitPrice = form.getFieldValue('unitPrice') || 0;
              const discount = form.getFieldValue('discount') || 0;
              const itemTotal = quantity * unitPrice;
              const discountAmount = itemTotal * (discount / 100);
              const finalTotal = itemTotal - discountAmount;

              return itemTotal > 0 ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text type="secondary">Ara Toplam:</Text>
                      <div className="text-lg">
                        ₺{itemTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">İndirim:</Text>
                      <div className="text-lg text-red-500">
                        -₺{discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">Toplam:</Text>
                      <div className="text-xl font-bold text-green-600">
                        ₺{finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
