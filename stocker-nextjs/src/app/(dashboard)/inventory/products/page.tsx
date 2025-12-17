'use client';

/**
 * Products List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Slider,
  Divider,
  Badge,
  Empty,
  Dropdown,
  Tooltip,
  Spin,
  Checkbox,
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
import type { ProductDto, ProductType, UpdateProductDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { generateInventoryPDF, exportInventoryToExcel } from '@/lib/utils/inventory-export';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
} from '@/lib/utils/sweetalert';

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
    setActiveViewId(null);
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

      if (newView.isDefault) {
        updatedViews = updatedViews.map(v => ({ ...v, isDefault: false }));
      }

      updatedViews.push(newView);
      setSavedViews(updatedViews);
      saveSavedViews(updatedViews);
      setActiveViewId(newView.id);
      setSaveViewModalOpen(false);
      showSuccess('Başarılı', 'Görünüm kaydedildi');
    } catch {
      // Validation error
    }
  };

  const handleApplyView = (view: SavedView) => {
    setFilters(view.filters);
    setActiveViewId(view.id);
    showSuccess('Başarılı', `"${view.name}" görünümü uygulandı`);
  };

  const handleDeleteView = (viewId: string) => {
    const updatedViews = savedViews.filter(v => v.id !== viewId);
    setSavedViews(updatedViews);
    saveSavedViews(updatedViews);
    if (activeViewId === viewId) {
      setActiveViewId(null);
    }
    showSuccess('Başarılı', 'Görünüm silindi');
  };

  const handleSetDefaultView = (viewId: string) => {
    const updatedViews = savedViews.map(v => ({
      ...v,
      isDefault: v.id === viewId,
    }));
    setSavedViews(updatedViews);
    saveSavedViews(updatedViews);
    showSuccess('Başarılı', 'Varsayılan görünüm ayarlandı');
  };

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/products/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/inventory/products/${id}/edit`);
  };

  const handleDelete = async (product: ProductDto) => {
    const confirmed = await confirmDelete('Ürün', product.name);
    if (confirmed) {
      try {
        await deleteProduct.mutateAsync(product.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleToggleActive = async (product: ProductDto) => {
    try {
      if (product.isActive) {
        await deactivateProduct.mutateAsync(product.id);
      } else {
        await activateProduct.mutateAsync(product.id);
      }
    } catch {
      // Error handled by hook
    }
  };

  // Bulk operations handlers
  const handleBulkEdit = () => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', 'Lütfen düzenlemek için ürün seçin');
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
        showWarning('Uyarı', 'En az bir alan değiştirmelisiniz');
        return;
      }

      setBulkLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const productId of selectedRowKeys) {
        try {
          const product = products.find(p => p.id === productId);
          if (!product) continue;

          const updateData: Partial<UpdateProductDto> = {};

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
            await updateProduct.mutateAsync({ id: productId, data: updateData as UpdateProductDto });
            successCount++;
          }
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        showSuccess('Başarılı', `${successCount} ürün başarıyla güncellendi`);
        refetch();
      }
      if (errorCount > 0) {
        showError(`${errorCount} ürün güncellenemedi`);
      }

      setBulkEditModalOpen(false);
      setSelectedRowKeys([]);
    } catch {
      showError('Form doğrulama hatası');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', 'Lütfen silmek için ürün seçin');
      return;
    }

    const confirmed = await confirmDelete('Ürün', `${selectedRowKeys.length} ürün`);
    if (confirmed) {
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
        showSuccess('Başarılı', `${successCount} ürün başarıyla silindi`);
        refetch();
      }
      if (errorCount > 0) {
        showError(`${errorCount} ürün silinemedi`);
      }

      setSelectedRowKeys([]);
      setBulkLoading(false);
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (selectedRowKeys.length === 0) {
      showWarning('Uyarı', `Lütfen ${activate ? 'aktifleştirmek' : 'pasifleştirmek'} için ürün seçin`);
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
      showSuccess('Başarılı', `${successCount} ürün başarıyla ${activate ? 'aktifleştirildi' : 'pasifleştirildi'}`);
      refetch();
    }
    if (errorCount > 0) {
      showError(`${errorCount} ürün ${activate ? 'aktifleştirilemedi' : 'pasifleştirilemedi'}`);
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
        showWarning('Uyarı', 'Dışa aktarılacak ürün bulunamadı');
        return;
      }

      generateInventoryPDF(dataToExport, {
        title: selectedRowKeys.length > 0 ? `Seçili Ürünler (${dataToExport.length} adet)` : 'Ürün Listesi',
      });
      showSuccess('Başarılı', 'PDF başarıyla oluşturuldu');
    } catch {
      showError('PDF oluşturulurken hata oluştu');
    }
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = selectedRowKeys.length > 0
        ? filteredProducts.filter(p => selectedRowKeys.includes(p.id))
        : filteredProducts;

      if (dataToExport.length === 0) {
        showWarning('Uyarı', 'Dışa aktarılacak ürün bulunamadı');
        return;
      }

      exportInventoryToExcel(dataToExport, {
        title: selectedRowKeys.length > 0 ? `Seçili Ürünler (${dataToExport.length} adet)` : 'Ürün Listesi',
      });
      showSuccess('Başarılı', 'Excel dosyası başarıyla oluşturuldu');
    } catch {
      showError('Excel oluşturulurken hata oluştu');
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
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#3b82f615' }}
          >
            <AppstoreOutlined style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
              onClick={() => handleView(record.id)}
            >
              {record.name}
            </div>
            <div className="text-xs text-slate-500">
              {record.code}
              {record.barcode && ` • ${record.barcode}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 140,
      render: (name) => name ? (
        <Tag color="default">{name}</Tag>
      ) : (
        <span className="text-slate-400">-</span>
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
      render: (brand) => <span className="text-sm text-slate-600">{brand || '-'}</span>,
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
            <div className="text-sm font-medium text-slate-900">₺{price.toLocaleString('tr-TR')}</div>
            {record.unitPriceCurrency && record.unitPriceCurrency !== 'TRY' && (
              <div className="text-xs text-slate-500">{record.unitPriceCurrency}</div>
            )}
          </div>
        ) : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'Stok',
      dataIndex: 'totalStockQuantity',
      key: 'totalStockQuantity',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.totalStockQuantity - b.totalStockQuantity,
      render: (qty, record) => {
        const isLow = qty < record.minStockLevel;
        const isZero = qty === 0;
        return (
          <div className="flex items-center justify-end gap-2">
            <span className={`text-sm font-medium ${isZero ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
              {qty}
            </span>
            {isLow && !isZero && (
              <Tooltip title="Düşük stok">
                <WarningOutlined className="text-amber-500" />
              </Tooltip>
            )}
            {isZero && (
              <Tooltip title="Stok yok">
                <WarningOutlined className="text-red-500" />
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
      render: (qty) => <span className="text-sm text-slate-600">{qty}</span>,
    },
    {
      title: 'Takip',
      key: 'tracking',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
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
          {!record.trackSerialNumbers && !record.trackLotNumbers && <span className="text-slate-400">-</span>}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
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
          { type: 'divider' as const },
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
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <MoreOutlined className="text-sm" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Ürün</span>
              <div className="text-2xl font-semibold text-slate-900">{totalProducts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <AppstoreOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Ürün</span>
              <div className="text-2xl font-semibold text-slate-900">{activeProducts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Düşük Stok</span>
              <div className="text-2xl font-semibold text-slate-900">{lowStockProducts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: lowStockProducts > 0 ? '#f59e0b15' : '#64748b15' }}>
              <WarningOutlined style={{ color: lowStockProducts > 0 ? '#f59e0b' : '#64748b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Değer</span>
              <div className="text-2xl font-semibold text-slate-900">₺{totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <AppstoreOutlined style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm font-medium text-blue-800">{selectedRowKeys.length} ürün seçildi</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkEdit}
                disabled={bulkLoading}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <EditOutlined className="mr-1" /> Toplu Düzenle
              </button>
              <button
                onClick={() => handleBulkActivate(true)}
                disabled={bulkLoading}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircleOutlined className="mr-1" /> Aktifleştir
              </button>
              <button
                onClick={() => handleBulkActivate(false)}
                disabled={bulkLoading}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <StopOutlined className="mr-1" /> Pasifleştir
              </button>
              <Dropdown
                menu={{
                  items: [
                    { key: 'pdf', icon: <FilePdfOutlined />, label: 'Seçilenleri PDF İndir', onClick: handleExportPDF },
                    { key: 'excel', icon: <FileExcelOutlined />, label: 'Seçilenleri Excel İndir', onClick: handleExportExcel },
                  ],
                }}
              >
                <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">
                  <DownloadOutlined className="mr-1" /> Dışa Aktar
                </button>
              </Dropdown>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <DeleteOutlined className="mr-1" /> Sil
              </button>
              <button
                onClick={() => setSelectedRowKeys([])}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Seçimi Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <ListPageHeader
        icon={<AppstoreOutlined />}
        iconColor="#3b82f6"
        title="Ürünler"
        description="Ürün kataloğunuzu yönetin"
        itemCount={filteredProducts.length}
        primaryAction={{
          label: 'Yeni Ürün',
          onClick: () => router.push('/inventory/products/new'),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
            <Dropdown
              menu={{
                items: [
                  { key: 'pdf', icon: <FilePdfOutlined />, label: 'PDF İndir', onClick: handleExportPDF },
                  { key: 'excel', icon: <FileExcelOutlined />, label: 'Excel İndir', onClick: handleExportExcel },
                ],
              }}
            >
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <DownloadOutlined />
              </button>
            </Dropdown>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Saved Views & Quick Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <FolderOutlined className="text-slate-400" /> Görünümler:
            </span>
            {savedViews.length === 0 ? (
              <span className="text-sm text-slate-400">Henüz kayıtlı görünüm yok</span>
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
              <button
                onClick={() => setManageViewsModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                +{savedViews.length - 5} daha
              </button>
            )}
            <button
              onClick={() => setManageViewsModalOpen(true)}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <SettingOutlined /> Yönet
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500">Hızlı Filtre:</span>
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
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Input
            placeholder="Ürün adı, kodu veya barkod ara..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ maxWidth: 300 }}
            className="h-10"
          />
          <Select
            placeholder="Kategori"
            value={filters.categoryId}
            onChange={(v) => updateFilter('categoryId', v)}
            allowClear
            style={{ width: 160 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            placeholder="Marka"
            value={filters.brandId}
            onChange={(v) => updateFilter('brandId', v)}
            allowClear
            style={{ width: 160 }}
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Select
            value={filters.includeInactive}
            onChange={(v) => updateFilter('includeInactive', v)}
            style={{ width: 130 }}
            options={[
              { value: false, label: 'Sadece Aktif' },
              { value: true, label: 'Tümü' },
            ]}
          />
          <div className="flex items-center gap-2 ml-auto">
            <Badge count={activeFilterCount} size="small" offset={[-5, 5]}>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  showAdvancedFilters ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FilterOutlined /> Gelişmiş
              </button>
            </Badge>
            {hasActiveFilters && (
              <>
                <button
                  onClick={handleSaveView}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <SaveOutlined /> Kaydet
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <ClearOutlined /> Temizle
                </button>
              </>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ürün Türü</label>
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
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Stok Durumu</label>
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
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Takip Türü</label>
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
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Fiyat Aralığı
                  {filters.priceRange && (
                    <span className="font-normal ml-2">
                      ₺{filters.priceRange[0].toLocaleString()} - ₺{filters.priceRange[1].toLocaleString()}
                    </span>
                  )}
                </label>
                <Slider
                  range
                  min={priceStats.min}
                  max={priceStats.max}
                  value={filters.priceRange || [priceStats.min, priceStats.max]}
                  onChange={(v) => updateFilter('priceRange', v as [number, number])}
                  tooltip={{ formatter: (v) => `₺${v?.toLocaleString()}` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500">Aktif Filtreler:</span>
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
              {filters.includeInactive && (
                <Tag closable onClose={() => updateFilter('includeInactive', false)}>
                  Pasifler Dahil
                </Tag>
              )}
              <span className="text-sm text-slate-500">
                ({filteredProducts.length} / {products.length} ürün)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1400 }}
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
          />
        </DataTableWrapper>
      )}

      {/* Bulk Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <EditOutlined style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Toplu Düzenleme</div>
              <div className="text-sm text-slate-500">{selectedRowKeys.length} ürün seçildi</div>
            </div>
          </div>
        }
        open={bulkEditModalOpen}
        onOk={handleBulkEditConfirm}
        onCancel={() => setBulkEditModalOpen(false)}
        okText="Uygula"
        cancelText="İptal"
        confirmLoading={bulkLoading}
        width={600}
      >
        <Form form={form} layout="vertical" className="pt-4">
          <div className="text-sm text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
            Sadece değiştirmek istediğiniz alanları doldurun. Boş bırakılan alanlar değiştirilmeyecektir.
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="priceChangeType" label="Fiyat Değişiklik Türü" initialValue="fixed">
              <Select
                options={[
                  { value: 'fixed', label: 'Sabit Fiyat' },
                  { value: 'percentage', label: 'Yüzde Değişim (%)' },
                  { value: 'increase', label: 'Tutar Artırma/Azaltma' },
                ]}
              />
            </Form.Item>
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
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
            <strong>Fiyat Değişiklik Örnekleri:</strong><br />
            • Sabit Fiyat: 100 → Tüm seçili ürünlerin fiyatı 100₺ olur<br />
            • Yüzde Değişim: 10 → %10 artış, -10 → %10 indirim<br />
            • Tutar Artırma: 50 → 50₺ artış, -50 → 50₺ düşüş
          </div>
        </Form>
      </Modal>

      {/* Save View Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <SaveOutlined style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Görünümü Kaydet</div>
              <div className="text-sm text-slate-500">Mevcut filtreleri kaydedin</div>
            </div>
          </div>
        }
        open={saveViewModalOpen}
        onOk={handleSaveViewConfirm}
        onCancel={() => setSaveViewModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={saveViewForm} layout="vertical" className="pt-4">
          <Form.Item
            name="name"
            label="Görünüm Adı"
            rules={[{ required: true, message: 'Lütfen görünüm adı girin' }]}
          >
            <Input placeholder="Örn: Düşük Stoklu Ürünler" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>
              <span className="flex items-center gap-1">
                <StarOutlined style={{ color: '#faad14' }} />
                Varsayılan görünüm olarak ayarla
              </span>
            </Checkbox>
          </Form.Item>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
            <strong>Kaydedilecek Filtreler:</strong><br />
            {filters.categoryId && `• Kategori: ${categories.find(c => c.id === filters.categoryId)?.name}\n`}
            {filters.brandId && `• Marka: ${brands.find(b => b.id === filters.brandId)?.name}\n`}
            {filters.productTypes.length > 0 && `• Tür: ${filters.productTypes.map(t => productTypeConfig[t]?.label).join(', ')}\n`}
            {filters.stockStatus.length > 0 && `• Stok Durumu: ${filters.stockStatus.length} kriter\n`}
            {filters.trackingType.length > 0 && `• Takip Türü: ${filters.trackingType.length} kriter\n`}
            {filters.priceRange && `• Fiyat: ₺${filters.priceRange[0]} - ₺${filters.priceRange[1]}\n`}
            {filters.includeInactive && `• Pasifler Dahil\n`}
            {!hasActiveFilters && 'Henüz filtre uygulanmadı'}
          </div>
        </Form>
      </Modal>

      {/* Manage Views Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#64748b15' }}>
              <FolderOutlined style={{ color: '#64748b' }} />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Kayıtlı Görünümler</div>
              <div className="text-sm text-slate-500">Görünümlerinizi yönetin</div>
            </div>
          </div>
        }
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
          <div className="space-y-3 pt-4">
            {savedViews.map(view => (
              <div key={view.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {view.isDefault && <StarFilled style={{ color: '#faad14' }} />}
                      <span className="font-medium text-slate-900">{view.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(view.createdAt).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleApplyView(view);
                        setManageViewsModalOpen(false);
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Uygula
                    </button>
                    {!view.isDefault && (
                      <Tooltip title="Varsayılan Yap">
                        <button
                          onClick={() => handleSetDefaultView(view.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <StarOutlined />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip title="Sil">
                      <button
                        onClick={() => handleDeleteView(view.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <DeleteOutlined />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
