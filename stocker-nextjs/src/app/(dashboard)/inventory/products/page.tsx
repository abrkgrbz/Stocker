'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Dropdown,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  AppstoreOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useCategories,
  useBrands,
  useDeleteProduct,
  useActivateProduct,
  useDeactivateProduct,
} from '@/lib/api/hooks/useInventory';
import type { ProductDto, ProductType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

// Product type configuration
const productTypeConfig: Record<ProductType, { color: string; label: string }> = {
  Raw: { color: 'blue', label: 'Hammadde' },
  SemiFinished: { color: 'cyan', label: 'Yarı Mamul' },
  Finished: { color: 'green', label: 'Mamul' },
  Service: { color: 'purple', label: 'Hizmet' },
  Consumable: { color: 'orange', label: 'Sarf Malzeme' },
  FixedAsset: { color: 'gold', label: 'Duran Varlık' },
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(undefined);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Check for lowStock query param
  const lowStockFilter = searchParams.get('lowStock') === 'true';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: products = [], isLoading, refetch } = useProducts(includeInactive, selectedCategory, selectedBrand);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const deleteProduct = useDeleteProduct();
  const activateProduct = useActivateProduct();
  const deactivateProduct = useDeactivateProduct();

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !debouncedSearch ||
      product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(debouncedSearch.toLowerCase()));

    const matchesLowStock = !lowStockFilter || product.totalStockQuantity < product.minStockLevel;

    return matchesSearch && matchesLowStock;
  });

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const lowStockProducts = products.filter((p) => p.totalStockQuantity < p.minStockLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/products/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/inventory/products/${id}/edit`);
  };

  const handleDelete = (product: ProductDto) => {
    Modal.confirm({
      title: 'Ürünü Sil',
      content: `"${product.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteProduct.mutateAsync(product.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (product: ProductDto) => {
    try {
      if (product.isActive) {
        await deactivateProduct.mutateAsync(product.id);
      } else {
        await activateProduct.mutateAsync(product.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<ProductDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code, record) => (
        <div>
          <div className="font-medium">{code}</div>
          {record.barcode && (
            <Text type="secondary" className="text-xs">{record.barcode}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800" onClick={() => handleView(record.id)}>
            {name}
          </div>
          {record.categoryName && (
            <Tag color="default" className="text-xs mt-1">{record.categoryName}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'productType',
      key: 'productType',
      width: 120,
      render: (type: ProductType) => {
        const config = productTypeConfig[type] || { color: 'default', label: type };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Marka',
      dataIndex: 'brandName',
      key: 'brandName',
      width: 120,
      render: (brand) => brand || '-',
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price, record) => (
        price ? (
          <div>
            <div className="font-semibold">₺{price.toLocaleString('tr-TR')}</div>
            {record.unitPriceCurrency && record.unitPriceCurrency !== 'TRY' && (
              <Text type="secondary" className="text-xs">{record.unitPriceCurrency}</Text>
            )}
          </div>
        ) : '-'
      ),
    },
    {
      title: 'Stok',
      dataIndex: 'totalStockQuantity',
      key: 'totalStockQuantity',
      width: 100,
      align: 'right',
      render: (qty, record) => {
        const isLow = qty < record.minStockLevel;
        const isZero = qty === 0;
        return (
          <div>
            <span className={isZero ? 'text-red-600 font-bold' : isLow ? 'text-orange-600 font-semibold' : 'font-medium'}>
              {qty}
            </span>
            {isLow && !isZero && (
              <Tooltip title="Düşük stok">
                <WarningOutlined className="text-orange-500 ml-2" />
              </Tooltip>
            )}
            {isZero && (
              <Tooltip title="Stok yok">
                <WarningOutlined className="text-red-500 ml-2" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Kullanılabilir',
      dataIndex: 'availableStockQuantity',
      key: 'availableStockQuantity',
      width: 100,
      align: 'right',
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive) => (
        isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
        ) : (
          <Tag color="default" icon={<StopOutlined />}>Pasif</Tag>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => handleEdit(record.id),
              },
              {
                type: 'divider',
              },
              {
                key: 'toggle',
                icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                onClick: () => handleToggleActive(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Ürünler</Title>
          <Text type="secondary">Ürün kataloğunuzu yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/inventory/products/new')}>
            Yeni Ürün
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Ürün"
              value={totalProducts}
              prefix={<AppstoreOutlined className="text-blue-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aktif Ürün"
              value={activeProducts}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={lowStockProducts > 0 ? 'border-orange-200' : ''}>
            <Statistic
              title="Düşük Stok"
              value={lowStockProducts}
              prefix={<WarningOutlined className={lowStockProducts > 0 ? 'text-orange-500' : 'text-gray-400'} />}
              valueStyle={lowStockProducts > 0 ? { color: '#fa8c16' } : undefined}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Stok Değeri"
              value={totalValue}
              prefix="₺"
              precision={0}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Ürün adı, kodu veya barkod ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Kategori"
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
              style={{ width: '100%' }}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Marka"
              value={selectedBrand}
              onChange={setSelectedBrand}
              allowClear
              style={{ width: '100%' }}
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              value={includeInactive}
              onChange={setIncludeInactive}
              style={{ width: '100%' }}
              options={[
                { value: false, label: 'Sadece Aktif' },
                { value: true, label: 'Tümü' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            {lowStockFilter && (
              <Button onClick={() => router.push('/inventory/products')}>
                Filtreyi Temizle
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredProducts.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ürün`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
