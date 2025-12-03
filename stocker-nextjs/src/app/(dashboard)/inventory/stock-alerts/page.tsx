'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Select,
  Form,
  InputNumber,
  Alert,
  Progress,
  Tooltip,
  Tabs,
  Badge,
  message,
} from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useLowStockProducts,
  useCategories,
  useBrands,
  useUpdateProduct,
} from '@/lib/api/hooks/useInventory';
import type { ProductDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Stock level status helper
function getStockStatus(product: ProductDto): { status: string; color: string; icon: React.ReactNode; percent: number } {
  const ratio = product.minStockLevel > 0
    ? (product.totalStockQuantity / product.minStockLevel) * 100
    : 100;

  if (product.totalStockQuantity === 0) {
    return { status: 'Stok Yok', color: 'red', icon: <MinusCircleOutlined />, percent: 0 };
  } else if (product.totalStockQuantity <= product.minStockLevel) {
    return { status: 'Kritik', color: 'red', icon: <ExclamationCircleOutlined />, percent: Math.min(ratio, 100) };
  } else if (product.totalStockQuantity <= product.reorderLevel) {
    return { status: 'Düşük', color: 'orange', icon: <WarningOutlined />, percent: Math.min(ratio, 100) };
  } else if (product.totalStockQuantity <= product.maxStockLevel) {
    return { status: 'Normal', color: 'green', icon: <CheckCircleOutlined />, percent: Math.min(ratio, 100) };
  } else {
    return { status: 'Yüksek', color: 'blue', icon: <InfoCircleOutlined />, percent: 100 };
  }
}

export default function StockAlertsPage() {
  const router = useRouter();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState('all');

  // Modals
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [bulkConfigModalOpen, setBulkConfigModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // Forms
  const [configForm] = Form.useForm();
  const [bulkConfigForm] = Form.useForm();

  // API Hooks
  const { data: products = [], isLoading, refetch } = useProducts(false, selectedCategory, selectedBrand);
  const { data: lowStockProducts = [] } = useLowStockProducts();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const updateProduct = useUpdateProduct();

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'critical':
        return products.filter(p => p.totalStockQuantity <= p.minStockLevel);
      case 'low':
        return products.filter(p => p.totalStockQuantity > p.minStockLevel && p.totalStockQuantity <= p.reorderLevel);
      case 'normal':
        return products.filter(p => p.totalStockQuantity > p.reorderLevel && p.totalStockQuantity <= p.maxStockLevel);
      case 'unconfigured':
        return products.filter(p => p.minStockLevel === 0 && p.maxStockLevel === 0);
      default:
        return products;
    }
  }, [products, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = products.length;
    const noStock = products.filter(p => p.totalStockQuantity === 0).length;
    const critical = products.filter(p => p.totalStockQuantity > 0 && p.totalStockQuantity <= p.minStockLevel).length;
    const low = products.filter(p => p.totalStockQuantity > p.minStockLevel && p.totalStockQuantity <= p.reorderLevel).length;
    const normal = products.filter(p => p.totalStockQuantity > p.reorderLevel && p.totalStockQuantity <= p.maxStockLevel).length;
    const unconfigured = products.filter(p => p.minStockLevel === 0 && p.maxStockLevel === 0).length;

    return { total, noStock, critical, low, normal, unconfigured };
  }, [products]);

  // Handlers
  const handleConfigClick = (product: ProductDto) => {
    setSelectedProduct(product);
    configForm.setFieldsValue({
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      reorderLevel: product.reorderLevel,
      reorderQuantity: product.reorderQuantity,
      leadTimeDays: product.leadTimeDays,
    });
    setConfigModalOpen(true);
  };

  const handleConfigSave = async () => {
    try {
      const values = await configForm.validateFields();
      if (selectedProduct) {
        await updateProduct.mutateAsync({
          id: selectedProduct.id,
          data: {
            name: selectedProduct.name,
            categoryId: selectedProduct.categoryId,
            unitId: selectedProduct.unitId,
            productType: selectedProduct.productType,
            minStockLevel: values.minStockLevel,
            maxStockLevel: values.maxStockLevel,
            reorderLevel: values.reorderLevel,
            reorderQuantity: values.reorderQuantity,
            leadTimeDays: values.leadTimeDays,
            trackSerialNumbers: selectedProduct.trackSerialNumbers,
            trackLotNumbers: selectedProduct.trackLotNumbers,
          },
        });
        setConfigModalOpen(false);
        configForm.resetFields();
        setSelectedProduct(null);
      }
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  const handleBulkConfigClick = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Lütfen önce ürün seçin');
      return;
    }
    bulkConfigForm.resetFields();
    setBulkConfigModalOpen(true);
  };

  const handleBulkConfigSave = async () => {
    try {
      const values = await bulkConfigForm.validateFields();

      // Apply to all selected products
      for (const productId of selectedRowKeys) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const updateData: any = {};

          if (values.minStockLevel !== undefined) {
            updateData.minStockLevel = values.minStockLevel;
          }
          if (values.maxStockLevel !== undefined) {
            updateData.maxStockLevel = values.maxStockLevel;
          }
          if (values.reorderLevel !== undefined) {
            updateData.reorderLevel = values.reorderLevel;
          }
          if (values.reorderQuantity !== undefined) {
            updateData.reorderQuantity = values.reorderQuantity;
          }
          if (values.leadTimeDays !== undefined) {
            updateData.leadTimeDays = values.leadTimeDays;
          }

          if (Object.keys(updateData).length > 0) {
            await updateProduct.mutateAsync({ id: productId, data: updateData });
          }
        }
      }

      message.success(`${selectedRowKeys.length} ürün güncellendi`);
      setBulkConfigModalOpen(false);
      bulkConfigForm.resetFields();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('Toplu güncelleme sırasında hata oluştu');
    }
  };

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as number[]),
  };

  // Table columns
  const columns: ColumnsType<ProductDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" className="text-xs">{record.code}</Text>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
    },
    {
      title: 'Stok Durumu',
      key: 'stockStatus',
      width: 200,
      render: (_, record) => {
        const status = getStockStatus(record);
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Tag color={status.color} icon={status.icon}>
              {status.status}
            </Tag>
            <Tooltip title={`Mevcut: ${record.totalStockQuantity} / Min: ${record.minStockLevel}`}>
              <Progress
                percent={status.percent}
                size="small"
                strokeColor={status.color === 'red' ? '#ff4d4f' : status.color === 'orange' ? '#fa8c16' : '#52c41a'}
                showInfo={false}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: 'Mevcut Stok',
      dataIndex: 'totalStockQuantity',
      key: 'totalStockQuantity',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <Text strong>{value.toLocaleString('tr-TR')}</Text>
      ),
    },
    {
      title: 'Min. Stok',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      width: 80,
      align: 'right',
      render: (value: number) => (
        <Text type={value === 0 ? 'secondary' : undefined}>
          {value === 0 ? '-' : value.toLocaleString('tr-TR')}
        </Text>
      ),
    },
    {
      title: 'Yeniden Sipariş',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <Text type={value === 0 ? 'secondary' : undefined}>
          {value === 0 ? '-' : value.toLocaleString('tr-TR')}
        </Text>
      ),
    },
    {
      title: 'Max. Stok',
      dataIndex: 'maxStockLevel',
      key: 'maxStockLevel',
      width: 80,
      align: 'right',
      render: (value: number) => (
        <Text type={value === 0 ? 'secondary' : undefined}>
          {value === 0 ? '-' : value.toLocaleString('tr-TR')}
        </Text>
      ),
    },
    {
      title: 'Tedarik Süresi',
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <Text type={value === 0 ? 'secondary' : undefined}>
          {value === 0 ? '-' : `${value} gün`}
        </Text>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleConfigClick(record)}
        >
          Ayarla
        </Button>
      ),
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: 'all',
      label: (
        <Space>
          <AlertOutlined />
          Tüm Ürünler
          <Badge count={stats.total} showZero style={{ backgroundColor: '#1890ff' }} />
        </Space>
      ),
    },
    {
      key: 'critical',
      label: (
        <Space>
          <ExclamationCircleOutlined />
          Kritik
          <Badge count={stats.critical + stats.noStock} showZero style={{ backgroundColor: '#ff4d4f' }} />
        </Space>
      ),
    },
    {
      key: 'low',
      label: (
        <Space>
          <WarningOutlined />
          Düşük
          <Badge count={stats.low} showZero style={{ backgroundColor: '#fa8c16' }} />
        </Space>
      ),
    },
    {
      key: 'normal',
      label: (
        <Space>
          <CheckCircleOutlined />
          Normal
          <Badge count={stats.normal} showZero style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
    },
    {
      key: 'unconfigured',
      label: (
        <Space>
          <InfoCircleOutlined />
          Yapılandırılmamış
          <Badge count={stats.unconfigured} showZero style={{ backgroundColor: '#d9d9d9' }} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Stok Seviye Uyarıları</Title>
          <Text type="secondary">Ürün stok seviyelerini izleyin ve uyarı eşiklerini yapılandırın</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleBulkConfigClick}>
              Toplu Yapılandır ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Toplam Ürün"
              value={stats.total}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Stok Yok"
              value={stats.noStock}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<MinusCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Kritik Seviye"
              value={stats.critical}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Düşük Stok"
              value={stats.low}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Normal"
              value={stats.normal}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Yapılandırılmamış"
              value={stats.unconfigured}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {(stats.critical + stats.noStock) > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`${stats.critical + stats.noStock} ürün kritik stok seviyesinde veya stok dışı!`}
          description="Bu ürünler için acil sipariş gerekebilir."
        />
      )}
      {stats.unconfigured > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          message={`${stats.unconfigured} ürün için stok seviye ayarları yapılmamış`}
          description="Stok seviye uyarılarını etkinleştirmek için minimum ve maksimum stok seviyelerini ayarlayın."
        />
      )}

      {/* Tabs and Filters */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-4"
        />

        {/* Filters */}
        <Space wrap className="mb-4">
          <Select
            placeholder="Kategori"
            allowClear
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Marka"
            allowClear
            style={{ width: 150 }}
            value={selectedBrand}
            onChange={setSelectedBrand}
          >
            {brands.map((b) => (
              <Select.Option key={b.id} value={b.id}>
                {b.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          rowSelection={rowSelection}
          loading={isLoading}
          pagination={{
            total: filteredProducts.length,
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Config Modal */}
      <Modal
        title={`Stok Seviye Ayarları: ${selectedProduct?.name || ''}`}
        open={configModalOpen}
        onCancel={() => {
          setConfigModalOpen(false);
          configForm.resetFields();
          setSelectedProduct(null);
        }}
        onOk={handleConfigSave}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={updateProduct.isPending}
        width={600}
      >
        <Alert
          type="info"
          message="Stok Seviye Açıklamaları"
          description={
            <ul className="mt-2 space-y-1 text-sm">
              <li><strong>Min. Stok:</strong> Bu seviyenin altına düşünce kritik uyarı verilir</li>
              <li><strong>Yeniden Sipariş:</strong> Bu seviyeye ulaşıldığında sipariş önerisi yapılır</li>
              <li><strong>Max. Stok:</strong> Stok bu seviyeyi aşmamalıdır</li>
              <li><strong>Sipariş Miktarı:</strong> Sipariş verildiğinde önerilen miktar</li>
              <li><strong>Tedarik Süresi:</strong> Sipariş sonrası beklenen teslim süresi</li>
            </ul>
          }
          className="mb-4"
          showIcon
        />
        <Form
          form={configForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minStockLevel"
                label="Minimum Stok Seviyesi"
                rules={[{ required: true, message: 'Minimum stok seviyesi gerekli' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  addonAfter="adet"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxStockLevel"
                label="Maksimum Stok Seviyesi"
                rules={[{ required: true, message: 'Maksimum stok seviyesi gerekli' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  addonAfter="adet"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reorderLevel"
                label="Yeniden Sipariş Seviyesi"
                rules={[{ required: true, message: 'Yeniden sipariş seviyesi gerekli' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  addonAfter="adet"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reorderQuantity"
                label="Sipariş Miktarı"
                rules={[{ required: true, message: 'Sipariş miktarı gerekli' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  addonAfter="adet"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="leadTimeDays"
            label="Tedarik Süresi"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0"
              addonAfter="gün"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Config Modal */}
      <Modal
        title={`Toplu Stok Seviye Ayarları (${selectedRowKeys.length} ürün)`}
        open={bulkConfigModalOpen}
        onCancel={() => {
          setBulkConfigModalOpen(false);
          bulkConfigForm.resetFields();
        }}
        onOk={handleBulkConfigSave}
        okText="Uygula"
        cancelText="İptal"
        confirmLoading={updateProduct.isPending}
        width={600}
      >
        <Alert
          type="warning"
          message="Sadece doldurduğunuz alanlar güncellenecektir"
          description="Boş bıraktığınız alanlar mevcut değerlerini koruyacaktır."
          className="mb-4"
          showIcon
        />
        <Form
          form={bulkConfigForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minStockLevel"
                label="Minimum Stok Seviyesi"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Değiştirme"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxStockLevel"
                label="Maksimum Stok Seviyesi"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Değiştirme"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reorderLevel"
                label="Yeniden Sipariş Seviyesi"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Değiştirme"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reorderQuantity"
                label="Sipariş Miktarı"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Değiştirme"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="leadTimeDays"
            label="Tedarik Süresi (gün)"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Değiştirme"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
