'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Form,
  InputNumber,
  Collapse,
  Slider,
  Divider,
  Badge,
  Popconfirm,
  Empty,
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
  FilePdfOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  FilterOutlined,
  SaveOutlined,
  StarOutlined,
  StarFilled,
  ClearOutlined,
  SettingOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useCategories,
  useBrands,
  useDeleteProduct,
  useActivateProduct,
  useDeactivateProduct,
  useUpdateProduct,
} from '@/lib/api/hooks/useInventory';
import type { ProductDto, ProductType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { generateInventoryPDF, exportInventoryToExcel } from '@/lib/utils/inventory-export';

const { Title, Text } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

// Product type configuration
const productTypeConfig: Record<ProductType, { color: string; label: string }> = {
  Raw: { color: 'blue', label: 'Hammadde' },
  SemiFinished: { color: 'cyan', label: 'Yarı Mamul' },
  Finished: { color: 'green', label: 'Mamul' },
  Service: { color: 'purple', label: 'Hizmet' },
  Consumable: { color: 'orange', label: 'Sarf Malzeme' },
  FixedAsset: { color: 'gold', label: 'Duran Varlık' },
};

// Filter state interface
interface FilterState {
  searchText: string;
  categoryId?: number;
  brandId?: number;
  productTypes: ProductType[];
  includeInactive: boolean;
  priceRange: [number, number] | null;
  stockRange: [number, number] | null;
  stockStatus: ('all' | 'inStock' | 'lowStock' | 'outOfStock')[];
  trackingType: ('all' | 'serial' | 'lot' | 'none')[];
}

// Saved view interface
interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  isDefault: boolean;
  createdAt: string;
}

// Default filter state
const defaultFilters: FilterState = {
  searchText: '',
  categoryId: undefined,
  brandId: undefined,
  productTypes: [],
  includeInactive: false,
  priceRange: null,
  stockRange: null,
  stockStatus: [],
  trackingType: [],
};

// Predefined filter presets
const filterPresets: { key: string; label: string; icon: React.ReactNode; filters: Partial<FilterState> }[] = [
  {
    key: 'lowStock',
    label: 'Düşük Stok',
    icon: <WarningOutlined style={{ color: '#fa8c16' }} />,
    filters: { stockStatus: ['lowStock'] },
  },
  {
    key: 'outOfStock',
    label: 'Stokta Yok',
    icon: <WarningOutlined style={{ color: '#f5222d' }} />,
    filters: { stockStatus: ['outOfStock'] },
  },
  {
    key: 'serialTracked',
    label: 'Seri Takipli',
    icon: <SettingOutlined style={{ color: '#1890ff' }} />,
    filters: { trackingType: ['serial'] },
  },
  {
    key: 'lotTracked',
    label: 'Lot Takipli',
    icon: <SettingOutlined style={{ color: '#52c41a' }} />,
    filters: { trackingType: ['lot'] },
  },
  {
    key: 'inactive',
    label: 'Pasif Ürünler',
    icon: <StopOutlined style={{ color: '#8c8c8c' }} />,
    filters: { includeInactive: true },
  },
];

// Local storage key for saved views
const SAVED_VIEWS_KEY = 'inventory_product_saved_views';

// Helper functions for saved views
function getSavedViews(): SavedView[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SAVED_VIEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSavedViews(views: SavedView[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [saveViewForm] = Form.useForm();

  // Filter state
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Saved views state
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [saveViewModalOpen, setSaveViewModalOpen] = useState(false);
  const [manageViewsModalOpen, setManageViewsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk operation state
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Check for lowStock query param
  const lowStockFilter = searchParams.get('lowStock') === 'true';

  // Load saved views on mount
  useEffect(() => {
    const views = getSavedViews();
    setSavedViews(views);

    // Apply default view if exists
    const defaultView = views.find(v => v.isDefault);
    if (defaultView && !lowStockFilter) {
      setFilters(defaultView.filters);
      setActiveViewId(defaultView.id);
    }
  }, []);

  // Apply lowStock filter from URL
  useEffect(() => {
    if (lowStockFilter) {
      setFilters(prev => ({ ...prev, stockStatus: ['lowStock'] }));
      setActiveViewId(null);
    }
  }, [lowStockFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // API Hooks
  const { data: products = [], isLoading, refetch } = useProducts(filters.includeInactive, filters.categoryId, filters.brandId);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const deleteProduct = useDeleteProduct();
  const activateProduct = useActivateProduct();
  const deactivateProduct = useDeactivateProduct();
  const updateProduct = useUpdateProduct();

  // Calculate price and stock ranges for sliders
  const priceStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map(p => p.unitPrice || 0).filter(p => p > 0);
    return {
      min: 0,
      max: Math.ceil(Math.max(...prices, 10000) / 100) * 100,
    };
  }, [products]);

  const stockStats = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const stocks = products.map(p => p.totalStockQuantity);
    return {
      min: 0,
      max: Math.ceil(Math.max(...stocks, 1000) / 10) * 10,
    };
  }, [products]);

  // Filter products with advanced filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Text search
      const matchesSearch = !debouncedSearch ||
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(debouncedSearch.toLowerCase()));

      // Product type filter
      const matchesType = filters.productTypes.length === 0 ||
        filters.productTypes.includes(product.productType);

      // Price range filter
      const matchesPrice = !filters.priceRange ||
        ((product.unitPrice || 0) >= filters.priceRange[0] &&
         (product.unitPrice || 0) <= filters.priceRange[1]);

      // Stock range filter
      const matchesStockRange = !filters.stockRange ||
        (product.totalStockQuantity >= filters.stockRange[0] &&
         product.totalStockQuantity <= filters.stockRange[1]);

      // Stock status filter
      let matchesStockStatus = true;
      if (filters.stockStatus.length > 0 && !filters.stockStatus.includes('all')) {
        const isOutOfStock = product.totalStockQuantity === 0;
        const isLowStock = product.totalStockQuantity > 0 && product.totalStockQuantity < product.minStockLevel;
        const isInStock = product.totalStockQuantity >= product.minStockLevel;

        matchesStockStatus = (
          (filters.stockStatus.includes('outOfStock') && isOutOfStock) ||
          (filters.stockStatus.includes('lowStock') && isLowStock) ||
          (filters.stockStatus.includes('inStock') && isInStock)
        );
      }

      // Tracking type filter
      let matchesTrackingType = true;
      if (filters.trackingType.length > 0 && !filters.trackingType.includes('all')) {
        matchesTrackingType = (
          (filters.trackingType.includes('serial') && product.trackSerialNumbers) ||
          (filters.trackingType.includes('lot') && product.trackLotNumbers) ||
          (filters.trackingType.includes('none') && !product.trackSerialNumbers && !product.trackLotNumbers)
        );
      }

      return matchesSearch && matchesType && matchesPrice && matchesStockRange && matchesStockStatus && matchesTrackingType;
    });
  }, [products, debouncedSearch, filters]);

  // Check if filters are modified from default
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchText !== '' ||
      filters.categoryId !== undefined ||
      filters.brandId !== undefined ||
      filters.productTypes.length > 0 ||
      filters.includeInactive !== false ||
      filters.priceRange !== null ||
      filters.stockRange !== null ||
      filters.stockStatus.length > 0 ||
      filters.trackingType.length > 0
    );
  }, [filters]);

  // Count active filter conditions
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.brandId) count++;
    if (filters.productTypes.length > 0) count++;
    if (filters.includeInactive) count++;
    if (filters.priceRange) count++;
    if (filters.stockRange) count++;
    if (filters.stockStatus.length > 0) count++;
    if (filters.trackingType.length > 0) count++;
    return count;
  }, [filters]);

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const lowStockProducts = products.filter((p) => p.totalStockQuantity < p.minStockLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);

  // Filter handlers
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveViewId(null); // Clear active view when filters change
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setActiveViewId(null);
    if (lowStockFilter) {
      router.push('/inventory/products');
    }
  };

  const applyPreset = (preset: typeof filterPresets[0]) => {
    setFilters({ ...defaultFilters, ...preset.filters });
    setActiveViewId(null);
  };

  // Saved view handlers
  const handleSaveView = () => {
    saveViewForm.resetFields();
    setSaveViewModalOpen(true);
  };

  const handleSaveViewConfirm = async () => {
    try {
      const values = await saveViewForm.validateFields();
      const newView: SavedView = {
        id: Date.now().toString(),
        name: values.name,
        filters: { ...filters },
        isDefault: values.isDefault || false,
        createdAt: new Date().toISOString(),
      };

      let updatedViews = [...savedViews];

      // If setting as default, remove default from others
      if (newView.isDefault) {
        updatedViews = updatedViews.map(v => ({ ...v, isDefault: false }));
      }

      updatedViews.push(newView);
      setSavedViews(updatedViews);
      saveSavedViews(updatedViews);
      setActiveViewId(newView.id);
      setSaveViewModalOpen(false);
      message.success('Görünüm kaydedildi');
    } catch {
      // Validation error
    }
  };

  const handleApplyView = (view: SavedView) => {
    setFilters(view.filters);
    setActiveViewId(view.id);
    message.success(`"${view.name}" görünümü uygulandı`);
  };

  const handleDeleteView = (viewId: string) => {
    const updatedViews = savedViews.filter(v => v.id !== viewId);
    setSavedViews(updatedViews);
    saveSavedViews(updatedViews);
    if (activeViewId === viewId) {
      setActiveViewId(null);
    }
    message.success('Görünüm silindi');
  };

  const handleSetDefaultView = (viewId: string) => {
    const updatedViews = savedViews.map(v => ({
      ...v,
      isDefault: v.id === viewId,
    }));
    setSavedViews(updatedViews);
    saveSavedViews(updatedViews);
    message.success('Varsayılan görünüm ayarlandı');
  };

  // CRUD Handlers
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

  // Bulk operations handlers
  const handleBulkEdit = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Lütfen düzenlemek için ürün seçin');
      return;
    }
    form.resetFields();
    setBulkEditModalOpen(true);
  };

  const handleBulkEditConfirm = async () => {
    try {
      const values = await form.validateFields();
      const hasChanges = values.categoryId || values.brandId || values.priceChange !== undefined;

      if (!hasChanges) {
        message.warning('En az bir alan değiştirmelisiniz');
        return;
      }

      setBulkLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const productId of selectedRowKeys) {
        try {
          const product = products.find(p => p.id === productId);
          if (!product) continue;

          const updateData: any = {};

          if (values.categoryId) {
            updateData.categoryId = values.categoryId;
          }
          if (values.brandId) {
            updateData.brandId = values.brandId;
          }
          if (values.priceChange !== undefined && values.priceChange !== null) {
            const changeType = values.priceChangeType || 'fixed';
            let newPrice = product.unitPrice || 0;

            if (changeType === 'fixed') {
              newPrice = values.priceChange;
            } else if (changeType === 'percentage') {
              newPrice = newPrice * (1 + values.priceChange / 100);
            } else if (changeType === 'increase') {
              newPrice = newPrice + values.priceChange;
            }

            updateData.unitPrice = Math.max(0, newPrice);
          }

          if (Object.keys(updateData).length > 0) {
            await updateProduct.mutateAsync({ id: productId, data: updateData });
            successCount++;
          }
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        message.success(`${successCount} ürün başarıyla güncellendi`);
        refetch();
      }
      if (errorCount > 0) {
        message.error(`${errorCount} ürün güncellenemedi`);
      }

      setBulkEditModalOpen(false);
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('Form doğrulama hatası');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Lütfen silmek için ürün seçin');
      return;
    }

    Modal.confirm({
      title: 'Toplu Silme',
      content: `${selectedRowKeys.length} ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        setBulkLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const productId of selectedRowKeys) {
          try {
            await deleteProduct.mutateAsync(productId);
            successCount++;
          } catch {
            errorCount++;
          }
        }

        if (successCount > 0) {
          message.success(`${successCount} ürün başarıyla silindi`);
          refetch();
        }
        if (errorCount > 0) {
          message.error(`${errorCount} ürün silinemedi`);
        }

        setSelectedRowKeys([]);
        setBulkLoading(false);
      },
    });
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning(`Lütfen ${activate ? 'aktifleştirmek' : 'pasifleştirmek'} için ürün seçin`);
      return;
    }

    setBulkLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const productId of selectedRowKeys) {
      try {
        if (activate) {
          await activateProduct.mutateAsync(productId);
        } else {
          await deactivateProduct.mutateAsync(productId);
        }
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      message.success(`${successCount} ürün başarıyla ${activate ? 'aktifleştirildi' : 'pasifleştirildi'}`);
      refetch();
    }
    if (errorCount > 0) {
      message.error(`${errorCount} ürün ${activate ? 'aktifleştirilemedi' : 'pasifleştirilemedi'}`);
    }

    setSelectedRowKeys([]);
    setBulkLoading(false);
  };

  // Export handlers
  const handleExportPDF = () => {
    try {
      const dataToExport = selectedRowKeys.length > 0
        ? filteredProducts.filter(p => selectedRowKeys.includes(p.id))
        : filteredProducts;

      if (dataToExport.length === 0) {
        message.warning('Dışa aktarılacak ürün bulunamadı');
        return;
      }

      generateInventoryPDF(dataToExport, {
        title: selectedRowKeys.length > 0 ? `Seçili Ürünler (${dataToExport.length} adet)` : 'Ürün Listesi',
      });
      message.success('PDF başarıyla oluşturuldu');
    } catch (error) {
      message.error('PDF oluşturulurken hata oluştu');
    }
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = selectedRowKeys.length > 0
        ? filteredProducts.filter(p => selectedRowKeys.includes(p.id))
        : filteredProducts;

      if (dataToExport.length === 0) {
        message.warning('Dışa aktarılacak ürün bulunamadı');
        return;
      }

      exportInventoryToExcel(dataToExport, {
        title: selectedRowKeys.length > 0 ? `Seçili Ürünler (${dataToExport.length} adet)` : 'Ürün Listesi',
      });
      message.success('Excel dosyası başarıyla oluşturuldu');
    } catch (error) {
      message.error('Excel oluşturulurken hata oluştu');
    }
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as number[]),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'lowStock',
        text: 'Düşük Stokluları Seç',
        onSelect: () => {
          const lowStockIds = filteredProducts
            .filter(p => p.totalStockQuantity < p.minStockLevel)
            .map(p => p.id);
          setSelectedRowKeys(lowStockIds);
        },
      },
      {
        key: 'active',
        text: 'Aktifleri Seç',
        onSelect: () => {
          const activeIds = filteredProducts.filter(p => p.isActive).map(p => p.id);
          setSelectedRowKeys(activeIds);
        },
      },
      {
        key: 'inactive',
        text: 'Pasifleri Seç',
        onSelect: () => {
          const inactiveIds = filteredProducts.filter(p => !p.isActive).map(p => p.id);
          setSelectedRowKeys(inactiveIds);
        },
      },
    ],
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
      title: 'Takip',
      key: 'tracking',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {record.trackSerialNumbers && (
            <Tooltip title="Seri No Takibi">
              <Tag color="blue" style={{ margin: 0 }}>S</Tag>
            </Tooltip>
          )}
          {record.trackLotNumbers && (
            <Tooltip title="Lot Takibi">
              <Tag color="green" style={{ margin: 0 }}>L</Tag>
            </Tooltip>
          )}
          {!record.trackSerialNumbers && !record.trackLotNumbers && '-'}
        </Space>
      ),
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'pdf',
                  icon: <FilePdfOutlined />,
                  label: 'PDF İndir',
                  onClick: handleExportPDF,
                },
                {
                  key: 'excel',
                  icon: <FileExcelOutlined />,
                  label: 'Excel İndir',
                  onClick: handleExportExcel,
                },
              ],
            }}
          >
            <Button icon={<DownloadOutlined />}>
              Dışa Aktar
            </Button>
          </Dropdown>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/inventory/products/new')}>
            Yeni Ürün
          </Button>
        </Space>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <Card className="mb-4" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
          <div className="flex items-center justify-between">
            <Space>
              <Text strong>{selectedRowKeys.length} ürün seçildi</Text>
            </Space>
            <Space>
              <Button icon={<EditOutlined />} onClick={handleBulkEdit} loading={bulkLoading}>
                Toplu Düzenle
              </Button>
              <Button icon={<CheckCircleOutlined />} onClick={() => handleBulkActivate(true)} loading={bulkLoading}>
                Aktifleştir
              </Button>
              <Button icon={<StopOutlined />} onClick={() => handleBulkActivate(false)} loading={bulkLoading}>
                Pasifleştir
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'pdf',
                      icon: <FilePdfOutlined />,
                      label: 'Seçilenleri PDF İndir',
                      onClick: handleExportPDF,
                    },
                    {
                      key: 'excel',
                      icon: <FileExcelOutlined />,
                      label: 'Seçilenleri Excel İndir',
                      onClick: handleExportExcel,
                    },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
              </Dropdown>
              <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete} loading={bulkLoading}>
                Sil
              </Button>
              <Button onClick={() => setSelectedRowKeys([])}>Seçimi Temizle</Button>
            </Space>
          </div>
        </Card>
      )}

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

      {/* Saved Views & Quick Filters Bar */}
      <Card className="mb-4" size="small">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Saved Views */}
          <Space wrap>
            <Text strong style={{ marginRight: 8 }}>
              <FolderOutlined /> Görünümler:
            </Text>
            {savedViews.length === 0 ? (
              <Text type="secondary">Henüz kayıtlı görünüm yok</Text>
            ) : (
              savedViews.slice(0, 5).map(view => (
                <Tag
                  key={view.id}
                  color={activeViewId === view.id ? 'blue' : 'default'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleApplyView(view)}
                  icon={view.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : null}
                >
                  {view.name}
                </Tag>
              ))
            )}
            {savedViews.length > 5 && (
              <Button type="link" size="small" onClick={() => setManageViewsModalOpen(true)}>
                +{savedViews.length - 5} daha
              </Button>
            )}
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setManageViewsModalOpen(true)}
            >
              Yönet
            </Button>
          </Space>

          {/* Quick Filter Presets */}
          <Space wrap>
            <Text type="secondary">Hızlı Filtre:</Text>
            {filterPresets.map(preset => (
              <Tag
                key={preset.key}
                style={{ cursor: 'pointer' }}
                onClick={() => applyPreset(preset)}
                icon={preset.icon}
              >
                {preset.label}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* Filters Card */}
      <Card className="mb-4">
        {/* Basic Filters Row */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Search
              placeholder="Ürün adı, kodu veya barkod ara..."
              value={filters.searchText}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Kategori"
              value={filters.categoryId}
              onChange={(v) => updateFilter('categoryId', v)}
              allowClear
              style={{ width: '100%' }}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Marka"
              value={filters.brandId}
              onChange={(v) => updateFilter('brandId', v)}
              allowClear
              style={{ width: '100%' }}
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              value={filters.includeInactive}
              onChange={(v) => updateFilter('includeInactive', v)}
              style={{ width: '100%' }}
              options={[
                { value: false, label: 'Sadece Aktif' },
                { value: true, label: 'Tümü' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} lg={6}>
            <Space>
              <Badge count={activeFilterCount} size="small" offset={[-5, 5]}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  type={showAdvancedFilters ? 'primary' : 'default'}
                >
                  Gelişmiş
                </Button>
              </Badge>
              {hasActiveFilters && (
                <>
                  <Button icon={<SaveOutlined />} onClick={handleSaveView}>
                    Kaydet
                  </Button>
                  <Button icon={<ClearOutlined />} onClick={clearFilters}>
                    Temizle
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 16]}>
              {/* Product Types */}
              <Col xs={24} sm={12} lg={6}>
                <div className="mb-2">
                  <Text strong>Ürün Türü</Text>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Tür seçin"
                  value={filters.productTypes}
                  onChange={(v) => updateFilter('productTypes', v)}
                  style={{ width: '100%' }}
                  options={Object.entries(productTypeConfig).map(([key, config]) => ({
                    value: key,
                    label: config.label,
                  }))}
                />
              </Col>

              {/* Stock Status */}
              <Col xs={24} sm={12} lg={6}>
                <div className="mb-2">
                  <Text strong>Stok Durumu</Text>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Stok durumu"
                  value={filters.stockStatus}
                  onChange={(v) => updateFilter('stockStatus', v)}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'inStock', label: 'Stokta Var' },
                    { value: 'lowStock', label: 'Düşük Stok' },
                    { value: 'outOfStock', label: 'Stokta Yok' },
                  ]}
                />
              </Col>

              {/* Tracking Type */}
              <Col xs={24} sm={12} lg={6}>
                <div className="mb-2">
                  <Text strong>Takip Türü</Text>
                </div>
                <Select
                  mode="multiple"
                  placeholder="Takip türü"
                  value={filters.trackingType}
                  onChange={(v) => updateFilter('trackingType', v)}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'serial', label: 'Seri No Takibi' },
                    { value: 'lot', label: 'Lot Takibi' },
                    { value: 'none', label: 'Takip Yok' },
                  ]}
                />
              </Col>

              {/* Price Range */}
              <Col xs={24} sm={12} lg={6}>
                <div className="mb-2">
                  <Text strong>
                    Fiyat Aralığı
                    {filters.priceRange && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ₺{filters.priceRange[0].toLocaleString()} - ₺{filters.priceRange[1].toLocaleString()}
                      </Text>
                    )}
                  </Text>
                </div>
                <Slider
                  range
                  min={priceStats.min}
                  max={priceStats.max}
                  value={filters.priceRange || [priceStats.min, priceStats.max]}
                  onChange={(v) => updateFilter('priceRange', v as [number, number])}
                  tooltip={{ formatter: (v) => `₺${v?.toLocaleString()}` }}
                />
              </Col>

              {/* Stock Range */}
              <Col xs={24} sm={12} lg={6}>
                <div className="mb-2">
                  <Text strong>
                    Stok Aralığı
                    {filters.stockRange && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {filters.stockRange[0]} - {filters.stockRange[1]}
                      </Text>
                    )}
                  </Text>
                </div>
                <Slider
                  range
                  min={stockStats.min}
                  max={stockStats.max}
                  value={filters.stockRange || [stockStats.min, stockStats.max]}
                  onChange={(v) => updateFilter('stockRange', v as [number, number])}
                />
              </Col>
            </Row>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <div className="flex items-center gap-2 flex-wrap">
              <Text type="secondary">Aktif Filtreler:</Text>
              {filters.categoryId && (
                <Tag closable onClose={() => updateFilter('categoryId', undefined)}>
                  Kategori: {categories.find(c => c.id === filters.categoryId)?.name}
                </Tag>
              )}
              {filters.brandId && (
                <Tag closable onClose={() => updateFilter('brandId', undefined)}>
                  Marka: {brands.find(b => b.id === filters.brandId)?.name}
                </Tag>
              )}
              {filters.productTypes.length > 0 && (
                <Tag closable onClose={() => updateFilter('productTypes', [])}>
                  Tür: {filters.productTypes.map(t => productTypeConfig[t]?.label).join(', ')}
                </Tag>
              )}
              {filters.stockStatus.length > 0 && (
                <Tag closable onClose={() => updateFilter('stockStatus', [])}>
                  Stok: {filters.stockStatus.map(s =>
                    s === 'inStock' ? 'Var' : s === 'lowStock' ? 'Düşük' : 'Yok'
                  ).join(', ')}
                </Tag>
              )}
              {filters.trackingType.length > 0 && (
                <Tag closable onClose={() => updateFilter('trackingType', [])}>
                  Takip: {filters.trackingType.map(t =>
                    t === 'serial' ? 'Seri' : t === 'lot' ? 'Lot' : 'Yok'
                  ).join(', ')}
                </Tag>
              )}
              {filters.priceRange && (
                <Tag closable onClose={() => updateFilter('priceRange', null)}>
                  Fiyat: ₺{filters.priceRange[0].toLocaleString()} - ₺{filters.priceRange[1].toLocaleString()}
                </Tag>
              )}
              {filters.stockRange && (
                <Tag closable onClose={() => updateFilter('stockRange', null)}>
                  Stok: {filters.stockRange[0]} - {filters.stockRange[1]}
                </Tag>
              )}
              {filters.includeInactive && (
                <Tag closable onClose={() => updateFilter('includeInactive', false)}>
                  Pasifler Dahil
                </Tag>
              )}
              <Text type="secondary">
                ({filteredProducts.length} / {products.length} ürün)
              </Text>
            </div>
          </>
        )}
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Bulk Edit Modal */}
      <Modal
        title={`Toplu Düzenleme (${selectedRowKeys.length} ürün)`}
        open={bulkEditModalOpen}
        onOk={handleBulkEditConfirm}
        onCancel={() => setBulkEditModalOpen(false)}
        okText="Uygula"
        cancelText="İptal"
        confirmLoading={bulkLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Sadece değiştirmek istediğiniz alanları doldurun. Boş bırakılan alanlar değiştirilmeyecektir.
          </Text>

          <Form.Item name="categoryId" label="Kategori">
            <Select
              placeholder="Kategori seçin (değiştirmek için)"
              allowClear
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>

          <Form.Item name="brandId" label="Marka">
            <Select
              placeholder="Marka seçin (değiştirmek için)"
              allowClear
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priceChangeType" label="Fiyat Değişiklik Türü" initialValue="fixed">
                <Select
                  options={[
                    { value: 'fixed', label: 'Sabit Fiyat' },
                    { value: 'percentage', label: 'Yüzde Değişim (%)' },
                    { value: 'increase', label: 'Tutar Artırma/Azaltma' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priceChange"
                label="Fiyat Değeri"
                tooltip="Sabit fiyat: yeni fiyat, Yüzde: +10 veya -10, Tutar: +100 veya -100"
              >
                <InputNumber
                  placeholder="Değer girin"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Fiyat Değişiklik Örnekleri:</strong><br />
              • Sabit Fiyat: 100 → Tüm seçili ürünlerin fiyatı 100₺ olur<br />
              • Yüzde Değişim: 10 → %10 artış, -10 → %10 indirim<br />
              • Tutar Artırma: 50 → 50₺ artış, -50 → 50₺ düşüş
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Save View Modal */}
      <Modal
        title="Görünümü Kaydet"
        open={saveViewModalOpen}
        onOk={handleSaveViewConfirm}
        onCancel={() => setSaveViewModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={saveViewForm} layout="vertical">
          <Form.Item
            name="name"
            label="Görünüm Adı"
            rules={[{ required: true, message: 'Lütfen görünüm adı girin' }]}
          >
            <Input placeholder="Örn: Düşük Stoklu Ürünler" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Space>
              <StarOutlined style={{ color: '#faad14' }} />
              <span>Varsayılan görünüm olarak ayarla</span>
            </Space>
          </Form.Item>
          <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Kaydedilecek Filtreler:</strong><br />
              {filters.categoryId && `• Kategori: ${categories.find(c => c.id === filters.categoryId)?.name}\n`}
              {filters.brandId && `• Marka: ${brands.find(b => b.id === filters.brandId)?.name}\n`}
              {filters.productTypes.length > 0 && `• Tür: ${filters.productTypes.map(t => productTypeConfig[t]?.label).join(', ')}\n`}
              {filters.stockStatus.length > 0 && `• Stok Durumu: ${filters.stockStatus.length} kriter\n`}
              {filters.trackingType.length > 0 && `• Takip Türü: ${filters.trackingType.length} kriter\n`}
              {filters.priceRange && `• Fiyat: ₺${filters.priceRange[0]} - ₺${filters.priceRange[1]}\n`}
              {filters.stockRange && `• Stok: ${filters.stockRange[0]} - ${filters.stockRange[1]}\n`}
              {filters.includeInactive && `• Pasifler Dahil\n`}
              {!hasActiveFilters && 'Henüz filtre uygulanmadı'}
            </Text>
          </div>
        </Form>
      </Modal>

      {/* Manage Views Modal */}
      <Modal
        title="Kayıtlı Görünümleri Yönet"
        open={manageViewsModalOpen}
        onCancel={() => setManageViewsModalOpen(false)}
        footer={null}
        width={600}
      >
        {savedViews.length === 0 ? (
          <Empty
            description="Henüz kayıtlı görünüm yok"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-3">
            {savedViews.map(view => (
              <Card key={view.id} size="small" className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <Space>
                      {view.isDefault && <StarFilled style={{ color: '#faad14' }} />}
                      <Text strong>{view.name}</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(view.createdAt).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                      </Text>
                    </div>
                  </div>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        handleApplyView(view);
                        setManageViewsModalOpen(false);
                      }}
                    >
                      Uygula
                    </Button>
                    {!view.isDefault && (
                      <Tooltip title="Varsayılan Yap">
                        <Button
                          size="small"
                          icon={<StarOutlined />}
                          onClick={() => handleSetDefaultView(view.id)}
                        />
                      </Tooltip>
                    )}
                    <Popconfirm
                      title="Bu görünümü silmek istediğinizden emin misiniz?"
                      onConfirm={() => handleDeleteView(view.id)}
                      okText="Sil"
                      cancelText="İptal"
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
