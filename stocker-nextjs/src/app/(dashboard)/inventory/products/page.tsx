'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
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
  Checkbox,
  Space,
  Button,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  Cog6ToothIcon,
  CubeIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FolderIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  StarIcon,
  StopIcon,
  TableCellsIcon,
  TrashIcon,
  XMarkIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
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
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
} from '@/lib/utils/sweetalert';

// Monochrome product type configuration
const productTypeConfig: Record<ProductType, { color: string; bgColor: string; label: string }> = {
  Raw: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Hammadde' },
  SemiFinished: { color: '#334155', bgColor: '#f1f5f9', label: 'Yarı Mamul' },
  Finished: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Mamul' },
  Service: { color: '#475569', bgColor: '#f1f5f9', label: 'Hizmet' },
  Consumable: { color: '#64748b', bgColor: '#f1f5f9', label: 'Sarf Malzeme' },
  FixedAsset: { color: '#334155', bgColor: '#e2e8f0', label: 'Duran Varlık' },
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

      return matchesSearch && matchesType && matchesPrice && matchesStockStatus && matchesTrackingType;
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
    if (filters.stockStatus.length > 0) count++;
    if (filters.trackingType.length > 0) count++;
    return count;
  }, [filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const lowStock = products.filter((p) => p.totalStockQuantity > 0 && p.totalStockQuantity < p.minStockLevel).length;
    const outOfStock = products.filter((p) => p.totalStockQuantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);
    return { total, active, lowStock, outOfStock, totalValue };
  }, [products]);

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
    ],
  };

  // Table columns - Monochrome design
  const columns: ColumnsType<ProductDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.name}
          </span>
          <div className="text-xs text-slate-500">
            {record.code}
            {record.barcode && ` • ${record.barcode}`}
          </div>
          <div className="flex gap-1">
            {!record.isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                Pasif
              </span>
            )}
            {record.trackSerialNumbers && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Seri
              </span>
            )}
            {record.trackLotNumbers && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Lot
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Kategori / Marka',
      key: 'category',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.categoryName || '-'}</div>
          <div className="text-xs text-slate-500">{record.brandName || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'productType',
      key: 'productType',
      width: 120,
      render: (type: ProductType) => {
        const config = productTypeConfig[type] || { color: '#64748b', bgColor: '#f1f5f9', label: type };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price) => (
        price ? (
          <span className="font-semibold text-slate-900">₺{price.toLocaleString('tr-TR')}</span>
        ) : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'Stok',
      key: 'stock',
      width: 140,
      render: (_, record) => {
        const isLow = record.totalStockQuantity > 0 && record.totalStockQuantity < record.minStockLevel;
        const isZero = record.totalStockQuantity === 0;
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isZero ? 'text-slate-400' : isLow ? 'text-slate-700' : 'text-slate-900'}`}>
                {record.totalStockQuantity.toLocaleString('tr-TR')}
              </span>
              {isLow && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                  <ExclamationTriangleIcon className="w-3 h-3" /> Düşük
                </span>
              )}
              {isZero && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-300 text-slate-800">
                  <ExclamationTriangleIcon className="w-3 h-3" /> Yok
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Kullanılabilir: {record.availableStockQuantity.toLocaleString('tr-TR')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: isActive ? '#e2e8f0' : '#f1f5f9',
            color: isActive ? '#1e293b' : '#64748b'
          }}
        >
          {isActive ? <CheckCircleIcon className="w-4 h-4" /> : <StopIcon className="w-4 h-4" />}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.isActive ? <StopIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
            label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
            onClick: () => handleToggleActive(record),
          },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ürünler</h1>
          <p className="text-slate-500 mt-1">Ürün kataloğunuzu yönetin ve takip edin</p>
        </div>
        <Space>
          <Dropdown
            menu={{
              items: [
                { key: 'pdf', icon: <DocumentIcon className="w-4 h-4" />, label: 'PDF İndir', onClick: handleExportPDF },
                { key: 'excel', icon: <TableCellsIcon className="w-4 h-4" />, label: 'Excel İndir', onClick: handleExportExcel },
              ],
            }}
          >
            <Button icon={<ArrowDownTrayIcon className="w-4 h-4" />} className="!border-slate-300 !text-slate-700 hover:!border-slate-400">
              Dışa Aktar
            </Button>
          </Dropdown>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/products/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Ürün
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Ürün</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Ürün</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.lowStock}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Düşük Stok</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <StopIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.outOfStock}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Stokta Yok</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₺{stats.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Stok Değeri</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm font-medium text-slate-800">{selectedRowKeys.length} ürün seçildi</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="small" icon={<PencilSquareIcon className="w-4 h-4" />} onClick={handleBulkEdit} disabled={bulkLoading}>
                Toplu Düzenle
              </Button>
              <Button size="small" icon={<CheckCircleIcon className="w-4 h-4" />} onClick={() => handleBulkActivate(true)} disabled={bulkLoading}>
                Aktifleştir
              </Button>
              <Button size="small" icon={<StopIcon className="w-4 h-4" />} onClick={() => handleBulkActivate(false)} disabled={bulkLoading}>
                Pasifleştir
              </Button>
              <Button size="small" danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleBulkDelete} disabled={bulkLoading}>
                Sil
              </Button>
              <Button size="small" type="link" onClick={() => setSelectedRowKeys([])}>
                Seçimi Temizle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Saved Views */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <FolderIcon className="w-4 h-4 text-slate-400" /> Görünümler:
            </span>
            {savedViews.length === 0 ? (
              <span className="text-sm text-slate-400">Henüz kayıtlı görünüm yok</span>
            ) : (
              savedViews.slice(0, 5).map(view => (
                <span
                  key={view.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    activeViewId === view.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => handleApplyView(view)}
                >
                  {view.isDefault && <StarIconSolid className="w-3 h-3 text-amber-400" />}
                  {view.name}
                </span>
              ))
            )}
            <button
              onClick={() => setManageViewsModalOpen(true)}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <Cog6ToothIcon className="w-4 h-4" /> Yönet
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Ürün adı, kodu veya barkod ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 280 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Kategori"
            value={filters.categoryId}
            onChange={(v) => updateFilter('categoryId', v)}
            allowClear
            style={{ width: 160 }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Marka"
            value={filters.brandId}
            onChange={(v) => updateFilter('brandId', v)}
            allowClear
            style={{ width: 160 }}
            options={brands.map((b) => ({ value: b.id, label: b.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={filters.includeInactive}
            onChange={(v) => updateFilter('includeInactive', v)}
            style={{ width: 130 }}
            options={[
              { value: false, label: 'Sadece Aktif' },
              { value: true, label: 'Tümü' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <div className="flex items-center gap-2 ml-auto">
            <Badge count={activeFilterCount} size="small" offset={[-5, 5]}>
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                icon={<FunnelIcon className="w-4 h-4" />}
                className={showAdvancedFilters ? '!bg-slate-200 !border-slate-300' : '!border-slate-300'}
              >
                Gelişmiş
              </Button>
            </Badge>
            {hasActiveFilters && (
              <>
                <Button onClick={handleSaveView} icon={<CheckIcon className="w-4 h-4" />} className="!border-slate-300">
                  Kaydet
                </Button>
                <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300">
                  Temizle
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <>
            <Divider className="!my-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Ürün Türü</label>
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
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Stok Durumu</label>
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
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Takip Türü</label>
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
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
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
            <Divider className="!my-4" />
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-sm text-slate-500">Aktif Filtreler:</span>
              {filters.categoryId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                  Kategori: {categories.find(c => c.id === filters.categoryId)?.name}
                  <button onClick={() => updateFilter('categoryId', undefined)}><XMarkIcon className="w-3 h-3" /></button>
                </span>
              )}
              {filters.brandId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                  Marka: {brands.find(b => b.id === filters.brandId)?.name}
                  <button onClick={() => updateFilter('brandId', undefined)}><XMarkIcon className="w-3 h-3" /></button>
                </span>
              )}
              {filters.stockStatus.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                  Stok: {filters.stockStatus.map(s =>
                    s === 'inStock' ? 'Var' : s === 'lowStock' ? 'Düşük' : 'Yok'
                  ).join(', ')}
                  <button onClick={() => updateFilter('stockStatus', [])}><XMarkIcon className="w-3 h-3" /></button>
                </span>
              )}
              <span className="text-sm text-slate-500">
                ({filteredProducts.length} / {products.length} ürün)
              </span>
            </div>
          </>
        )}

        {/* Table */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredProducts.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Bulk Edit Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Toplu Düzenleme ({selectedRowKeys.length} ürün)</span>}
        open={bulkEditModalOpen}
        onOk={handleBulkEditConfirm}
        onCancel={() => setBulkEditModalOpen(false)}
        okText="Uygula"
        cancelText="İptal"
        confirmLoading={bulkLoading}
        width={600}
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="text-sm text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
            Sadece değiştirmek istediğiniz alanları doldurun. Boş bırakılan alanlar değiştirilmeyecektir.
          </div>

          <Form.Item name="categoryId" label={<span className="text-slate-700 font-medium">Kategori</span>}>
            <Select
              placeholder="Kategori seçin (değiştirmek için)"
              allowClear
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
            />
          </Form.Item>

          <Form.Item name="brandId" label={<span className="text-slate-700 font-medium">Marka</span>}>
            <Select
              placeholder="Marka seçin (değiştirmek için)"
              allowClear
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
              className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="priceChangeType" label={<span className="text-slate-700 font-medium">Fiyat Değişiklik Türü</span>} initialValue="fixed">
              <Select
                options={[
                  { value: 'fixed', label: 'Sabit Fiyat' },
                  { value: 'percentage', label: 'Yüzde Değişim (%)' },
                  { value: 'increase', label: 'Tutar Artırma/Azaltma' },
                ]}
                className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>
            <Form.Item name="priceChange" label={<span className="text-slate-700 font-medium">Fiyat Değeri</span>}>
              <InputNumber
                placeholder="Değer girin"
                style={{ width: '100%' }}
                className="!rounded-lg"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Save View Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Görünümü Kaydet</span>}
        open={saveViewModalOpen}
        onOk={handleSaveViewConfirm}
        onCancel={() => setSaveViewModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <Form form={saveViewForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label={<span className="text-slate-700 font-medium">Görünüm Adı</span>}
            rules={[{ required: true, message: 'Lütfen görünüm adı girin' }]}
          >
            <Input placeholder="Örn: Düşük Stoklu Ürünler" className="!rounded-lg !border-slate-300" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>
              <span className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-amber-400" />
                Varsayılan görünüm olarak ayarla
              </span>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Views Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Kayıtlı Görünümler</span>}
        open={manageViewsModalOpen}
        onCancel={() => setManageViewsModalOpen(false)}
        footer={null}
        width={600}
      >
        {savedViews.length === 0 ? (
          <Empty description="Henüz kayıtlı görünüm yok" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="space-y-3 mt-4">
            {savedViews.map(view => (
              <div key={view.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {view.isDefault && <StarIconSolid className="w-4 h-4 text-amber-400" />}
                      <span className="font-medium text-slate-900">{view.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(view.createdAt).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        handleApplyView(view);
                        setManageViewsModalOpen(false);
                      }}
                      className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                    >
                      Uygula
                    </Button>
                    {!view.isDefault && (
                      <Tooltip title="Varsayılan Yap">
                        <Button
                          size="small"
                          icon={<StarIcon className="w-4 h-4" />}
                          onClick={() => handleSetDefaultView(view.id)}
                          className="!border-slate-300"
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="Sil">
                      <Button
                        size="small"
                        danger
                        icon={<TrashIcon className="w-4 h-4" />}
                        onClick={() => handleDeleteView(view.id)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
