'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Select,
  Form,
  InputNumber,
  Alert,
  Progress,
  Tooltip,
  Tabs,
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

// Stock level status helper with monochrome colors
function getStockStatus(product: ProductDto): { status: string; color: string; bgColor: string; icon: React.ReactNode; percent: number } {
  const ratio = product.minStockLevel > 0
    ? (product.totalStockQuantity / product.minStockLevel) * 100
    : 100;

  if (product.totalStockQuantity === 0) {
    return { status: 'Stok Yok', color: '#1e293b', bgColor: '#e2e8f0', icon: <MinusCircleOutlined />, percent: 0 };
  } else if (product.totalStockQuantity <= product.minStockLevel) {
    return { status: 'Kritik', color: '#1e293b', bgColor: '#cbd5e1', icon: <ExclamationCircleOutlined />, percent: Math.min(ratio, 100) };
  } else if (product.totalStockQuantity <= product.reorderLevel) {
    return { status: 'Düşük', color: '#475569', bgColor: '#f1f5f9', icon: <WarningOutlined />, percent: Math.min(ratio, 100) };
  } else if (product.totalStockQuantity <= product.maxStockLevel) {
    return { status: 'Normal', color: '#334155', bgColor: '#e2e8f0', icon: <CheckCircleOutlined />, percent: Math.min(ratio, 100) };
  } else {
    return { status: 'Yüksek', color: '#64748b', bgColor: '#f1f5f9', icon: <InfoCircleOutlined />, percent: 100 };
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
        <div>
          <div className="font-semibold text-slate-900">{record.name}</div>
          <div className="text-xs text-slate-500">{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (name: string) => <span className="text-slate-700">{name}</span>,
    },
    {
      title: 'Stok Durumu',
      key: 'stockStatus',
      width: 200,
      render: (_, record) => {
        const status = getStockStatus(record);
        return (
          <div className="space-y-2" style={{ width: '100%' }}>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
              style={{ backgroundColor: status.bgColor, color: status.color }}
            >
              {status.icon}
              {status.status}
            </span>
            <Tooltip title={`Mevcut: ${record.totalStockQuantity} / Min: ${record.minStockLevel}`}>
              <Progress
                percent={status.percent}
                size="small"
                strokeColor="#475569"
                trailColor="#e2e8f0"
                showInfo={false}
              />
            </Tooltip>
          </div>
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
        <span className="font-semibold text-slate-900">{value.toLocaleString('tr-TR')}</span>
      ),
    },
    {
      title: 'Min. Stok',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      width: 80,
      align: 'right',
      render: (value: number) => (
        <span className={value === 0 ? 'text-slate-400' : 'text-slate-700'}>
          {value === 0 ? '-' : value.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Yeniden Sipariş',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <span className={value === 0 ? 'text-slate-400' : 'text-slate-700'}>
          {value === 0 ? '-' : value.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Max. Stok',
      dataIndex: 'maxStockLevel',
      key: 'maxStockLevel',
      width: 80,
      align: 'right',
      render: (value: number) => (
        <span className={value === 0 ? 'text-slate-400' : 'text-slate-700'}>
          {value === 0 ? '-' : value.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Tedarik Süresi',
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <span className={value === 0 ? 'text-slate-400' : 'text-slate-700'}>
          {value === 0 ? '-' : `${value} gün`}
        </span>
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
          className="!text-slate-600 hover:!text-slate-900"
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
        <span className="flex items-center gap-2">
          <AlertOutlined />
          Tüm Ürünler
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
    {
      key: 'critical',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleOutlined />
          Kritik
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-400 text-white">
            {stats.critical + stats.noStock}
          </span>
        </span>
      ),
    },
    {
      key: 'low',
      label: (
        <span className="flex items-center gap-2">
          <WarningOutlined />
          Düşük
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-300 text-slate-800">
            {stats.low}
          </span>
        </span>
      ),
    },
    {
      key: 'normal',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Normal
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.normal}
          </span>
        </span>
      ),
    },
    {
      key: 'unconfigured',
      label: (
        <span className="flex items-center gap-2">
          <InfoCircleOutlined />
          Yapılandırılmamış
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
            {stats.unconfigured}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Seviye Uyarıları</h1>
          <p className="text-slate-500 mt-1">Ürün stok seviyelerini izleyin ve uyarı eşiklerini yapılandırın</p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleBulkConfigClick}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Toplu Yapılandır ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <AlertOutlined className="text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Ürün</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <MinusCircleOutlined className="text-lg text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.noStock}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Stok Yok</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-lg text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.critical}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kritik Seviye</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <WarningOutlined className="text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.low}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Düşük Stok</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleOutlined className="text-lg text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.normal}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Normal</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InfoCircleOutlined className="text-lg text-slate-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.unconfigured}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yapılandırılmamış</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.critical + stats.noStock) > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`${stats.critical + stats.noStock} ürün kritik stok seviyesinde veya stok dışı!`}
          description="Bu ürünler için acil sipariş gerekebilir."
          className="mb-6 !border-slate-300 !bg-slate-100 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
        />
      )}
      {stats.unconfigured > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          message={`${stats.unconfigured} ürün için stok seviye ayarları yapılmamış`}
          description="Stok seviye uyarılarını etkinleştirmek için minimum ve maksimum stok seviyelerini ayarlayın."
          className="mb-6 !border-slate-300 !bg-slate-50 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
        />
      )}

      {/* Tabs and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select
            placeholder="Kategori"
            allowClear
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {brands.map((b) => (
              <Select.Option key={b.id} value={b.id}>
                {b.name}
              </Select.Option>
            ))}
          </Select>
        </div>

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
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Config Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Stok Seviye Ayarları: {selectedProduct?.name || ''}</span>}
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
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Alert
          type="info"
          message="Stok Seviye Açıklamaları"
          description={
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li><strong className="text-slate-700">Min. Stok:</strong> Bu seviyenin altına düşünce kritik uyarı verilir</li>
              <li><strong className="text-slate-700">Yeniden Sipariş:</strong> Bu seviyeye ulaşıldığında sipariş önerisi yapılır</li>
              <li><strong className="text-slate-700">Max. Stok:</strong> Stok bu seviyeyi aşmamalıdır</li>
              <li><strong className="text-slate-700">Sipariş Miktarı:</strong> Sipariş verildiğinde önerilen miktar</li>
              <li><strong className="text-slate-700">Tedarik Süresi:</strong> Sipariş sonrası beklenen teslim süresi</li>
            </ul>
          }
          className="mb-4 !border-slate-300 !bg-slate-50"
          showIcon
        />
        <Form
          form={configForm}
          layout="vertical"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="minStockLevel"
              label={<span className="text-slate-700 font-medium">Minimum Stok Seviyesi</span>}
              rules={[{ required: true, message: 'Minimum stok seviyesi gerekli' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="adet"
                className="!rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="maxStockLevel"
              label={<span className="text-slate-700 font-medium">Maksimum Stok Seviyesi</span>}
              rules={[{ required: true, message: 'Maksimum stok seviyesi gerekli' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="adet"
                className="!rounded-lg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="reorderLevel"
              label={<span className="text-slate-700 font-medium">Yeniden Sipariş Seviyesi</span>}
              rules={[{ required: true, message: 'Yeniden sipariş seviyesi gerekli' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="adet"
                className="!rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="reorderQuantity"
              label={<span className="text-slate-700 font-medium">Sipariş Miktarı</span>}
              rules={[{ required: true, message: 'Sipariş miktarı gerekli' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="adet"
                className="!rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="leadTimeDays"
            label={<span className="text-slate-700 font-medium">Tedarik Süresi</span>}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="0"
              addonAfter="gün"
              className="!rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Config Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Toplu Stok Seviye Ayarları ({selectedRowKeys.length} ürün)</span>}
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
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Alert
          type="warning"
          message="Sadece doldurduğunuz alanlar güncellenecektir"
          description="Boş bıraktığınız alanlar mevcut değerlerini koruyacaktır."
          className="mb-4 !border-slate-300 !bg-slate-50"
          showIcon
        />
        <Form
          form={bulkConfigForm}
          layout="vertical"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="minStockLevel"
              label={<span className="text-slate-700 font-medium">Minimum Stok Seviyesi</span>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Değiştirme"
                className="!rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="maxStockLevel"
              label={<span className="text-slate-700 font-medium">Maksimum Stok Seviyesi</span>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Değiştirme"
                className="!rounded-lg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="reorderLevel"
              label={<span className="text-slate-700 font-medium">Yeniden Sipariş Seviyesi</span>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Değiştirme"
                className="!rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="reorderQuantity"
              label={<span className="text-slate-700 font-medium">Sipariş Miktarı</span>}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Değiştirme"
                className="!rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="leadTimeDays"
            label={<span className="text-slate-700 font-medium">Tedarik Süresi (gün)</span>}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Değiştirme"
              className="!rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
