'use client';

/**
 * Barcode Management Page - Pro Scanner
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Monochrome slate theme with professional scanner features
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Form,
  Tabs,
  Tag,
  Empty,
  Spin,
  InputNumber,
  Checkbox,
  Tooltip,
  message,
  Badge,
  Descriptions,
  Popconfirm,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  ShoppingBagIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useProducts,
  useWarehouses,
  useBarcodeFormats,
  useLabelSizes,
  useBarcodeLookup,
  useGenerateBarcode,
  useGenerateProductLabel,
  useGenerateBulkLabels,
  useAutoGenerateBarcode,
  useValidateBarcode,
  useCheckBarcodeUnique,
} from '@/lib/api/hooks/useInventory';
import type {
  BarcodeFormat,
  LabelSize,
  BarcodeLookupResponse,
  GenerateBarcodeRequest,
  GenerateProductLabelRequest,
  BulkLabelProductItem,
} from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const { TextArea } = Input;

// ═══════════════════════════════════════════════════════════════
// AUDIO FEEDBACK SYSTEM - Pro Scanner Feature
// ═══════════════════════════════════════════════════════════════
const useAudioFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported, fail silently
    }
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    playBeep(880, 0.15, 'sine');
    setTimeout(() => playBeep(1174.66, 0.15, 'sine'), 100);
  }, [playBeep]);

  const playError = useCallback(() => {
    playBeep(200, 0.3, 'square');
  }, [playBeep]);

  const playQuantityIncrement = useCallback(() => {
    playBeep(1000, 0.08, 'sine');
  }, [playBeep]);

  return { playSuccess, playError, playQuantityIncrement };
};

// ═══════════════════════════════════════════════════════════════
// SCAN HISTORY ITEM TYPE
// ═══════════════════════════════════════════════════════════════
interface ScanHistoryItem {
  id: string;
  barcode: string;
  quantity: number;
  lookupResult: BarcodeLookupResponse;
  firstScannedAt: Date;
  lastScannedAt: Date;
}

// Barcode format labels
const formatLabels: Record<string, string> = {
  EAN13: 'EAN-13',
  EAN8: 'EAN-8',
  UPC_A: 'UPC-A',
  UPC_E: 'UPC-E',
  Code128: 'Code 128',
  Code39: 'Code 39',
  QRCode: 'QR Code',
  DataMatrix: 'Data Matrix',
  PDF417: 'PDF417',
  ITF14: 'ITF-14',
};

// Label size labels
const sizeLabels: Record<string, string> = {
  Small: 'Küçük (30x20mm)',
  Medium: 'Orta (50x30mm)',
  Large: 'Büyük (70x40mm)',
  Wide: 'Geniş (100x30mm)',
  Square: 'Kare (50x50mm)',
  Custom: 'Özel',
};

export default function BarcodesPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState('scanner');

  // ═══════════════════════════════════════════════════════════════
  // PRO SCANNER STATE
  // ═══════════════════════════════════════════════════════════════
  const [scanInput, setScanInput] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalScannedItems, setTotalScannedItems] = useState(0);

  // Refs for pro scanner
  const scanInputRef = useRef<any>(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const SCANNER_SPEED_THRESHOLD = 50;

  // Audio feedback hook
  const { playSuccess, playError, playQuantityIncrement } = useAudioFeedback();

  // Generator state
  const [generateForm] = Form.useForm();
  const [generatedBarcodeImage, setGeneratedBarcodeImage] = useState<string | null>(null);

  // Product Label state
  const [labelForm] = Form.useForm();
  const [generatedLabelImage, setGeneratedLabelImage] = useState<string | null>(null);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<number | undefined>();

  // Bulk Labels state
  const [bulkProducts, setBulkProducts] = useState<Array<BulkLabelProductItem & { productName?: string }>>([]);
  const [bulkLabelSize, setBulkLabelSize] = useState<string>('Medium');
  const [bulkBarcodeFormat, setBulkBarcodeFormat] = useState<string>('Code128');

  // Auto-generate state
  const [autoGenForm] = Form.useForm();
  const [autoGenResult, setAutoGenResult] = useState<{ barcode: string; saved: boolean } | null>(null);

  // Validation state
  const [validationBarcode, setValidationBarcode] = useState('');
  const [validationFormat, setValidationFormat] = useState<string>('Code128');

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();

  // Barcode lookup
  const { data: lookupResult, isLoading: isLookingUp } = useBarcodeLookup(
    lastScannedBarcode,
    true,
    selectedWarehouse,
    !!lastScannedBarcode
  );

  // Mutations
  const generateBarcode = useGenerateBarcode();
  const generateProductLabel = useGenerateProductLabel();
  const generateBulkLabels = useGenerateBulkLabels();
  const autoGenerateBarcode = useAutoGenerateBarcode();
  const validateBarcode = useValidateBarcode();
  const checkBarcodeUnique = useCheckBarcodeUnique();

  // ═══════════════════════════════════════════════════════════════
  // SMART AUTO-FOCUS SYSTEM
  // ═══════════════════════════════════════════════════════════════
  const refocusScanner = useCallback(() => {
    if (activeTab === 'scanner' && scanInputRef.current && isScannerActive) {
      requestAnimationFrame(() => {
        scanInputRef.current?.focus();
      });
    }
  }, [activeTab, isScannerActive]);

  useEffect(() => {
    refocusScanner();
  }, [activeTab, refocusScanner]);

  useEffect(() => {
    if (activeTab !== 'scanner' || !isScannerActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, select, .ant-select, .ant-modal, .ant-dropdown, .ant-tabs-tab')) return;
      setTimeout(refocusScanner, 100);
    };

    const handleWindowFocus = () => setTimeout(refocusScanner, 100);
    const handleVisibilityChange = () => {
      if (!document.hidden) setTimeout(refocusScanner, 100);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, isScannerActive, refocusScanner]);

  // ═══════════════════════════════════════════════════════════════
  // INTELLIGENT HISTORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (lookupResult && lastScannedBarcode) {
      const now = new Date();

      setScanHistory((prev) => {
        const existingIndex = prev.findIndex(item => item.barcode === lastScannedBarcode);

        if (existingIndex >= 0) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1,
            lastScannedAt: now,
          };
          const [item] = updated.splice(existingIndex, 1);
          updated.unshift(item);

          if (soundEnabled) playQuantityIncrement();
          return updated;
        }

        const newItem: ScanHistoryItem = {
          id: `${lastScannedBarcode}-${now.getTime()}`,
          barcode: lastScannedBarcode,
          quantity: 1,
          lookupResult,
          firstScannedAt: now,
          lastScannedAt: now,
        };

        if (soundEnabled) {
          lookupResult.found ? playSuccess() : playError();
        }

        return [newItem, ...prev.slice(0, 49)];
      });

      setTotalScannedItems(prev => prev + 1);
      setTimeout(refocusScanner, 50);
    }
  }, [lookupResult, lastScannedBarcode, soundEnabled, playSuccess, playError, playQuantityIncrement, refocusScanner]);

  // ═══════════════════════════════════════════════════════════════
  // SCANNER HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const handleScanKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      const isHardwareScanner = timeDiff < SCANNER_SPEED_THRESHOLD;

      if (e.key === 'Enter') {
        e.preventDefault();
        const barcodeValue = scanInput.trim();

        if (barcodeValue) {
          setLastScannedBarcode(barcodeValue);
          setScanInput('');
          scanBufferRef.current = '';
        }
        return;
      }

      if (isHardwareScanner && e.key.length === 1) {
        scanBufferRef.current += e.key;
      }
    },
    [scanInput, SCANNER_SPEED_THRESHOLD]
  );

  const handleScanInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setScanInput(e.target.value);
  }, []);

  const handleManualSearch = useCallback(() => {
    if (scanInput.trim()) {
      setLastScannedBarcode(scanInput.trim());
      setScanInput('');
      setTimeout(refocusScanner, 50);
    }
  }, [scanInput, refocusScanner]);

  const handleClearHistory = useCallback(() => {
    setScanHistory([]);
    setTotalScannedItems(0);
  }, []);

  const handleRemoveFromHistory = useCallback((id: string) => {
    setScanHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, newQuantity: number) => {
    setScanHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  }, []);

  // Calculate totals
  const historyStats = useMemo(() => {
    const totalQuantity = scanHistory.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItems = scanHistory.length;
    const foundItems = scanHistory.filter(item => item.lookupResult.found).length;
    const notFoundItems = scanHistory.filter(item => !item.lookupResult.found).length;
    const totalValue = scanHistory.reduce((sum, item) => {
      if (item.lookupResult.found && item.lookupResult.product?.unitPrice) {
        return sum + (item.lookupResult.product.unitPrice * item.quantity);
      }
      return sum;
    }, 0);

    return { totalQuantity, uniqueItems, foundItems, notFoundItems, totalValue };
  }, [scanHistory]);

  // Barcode Generator handlers
  const handleGenerateBarcode = async () => {
    try {
      const values = await generateForm.validateFields();
      const request: GenerateBarcodeRequest = {
        content: values.content,
        format: values.format || 'Code128',
        width: values.width || 300,
        height: values.height || 100,
        includeText: values.includeText ?? true,
      };
      const result = await generateBarcode.mutateAsync(request);
      setGeneratedBarcodeImage(result.imageBase64);
    } catch (error) {
      // Validation error handled by form
    }
  };

  // Product Label handlers
  const handleGenerateProductLabel = async () => {
    try {
      const values = await labelForm.validateFields();
      const request: GenerateProductLabelRequest = {
        productId: values.productId,
        labelSize: values.labelSize || 'Medium',
        barcodeFormat: values.barcodeFormat || 'Code128',
        includeProductName: values.includeProductName ?? true,
        includePrice: values.includePrice ?? true,
        includeSKU: values.includeSKU ?? false,
        includeQRCode: values.includeQRCode ?? false,
      };
      const result = await generateProductLabel.mutateAsync(request);
      setGeneratedLabelImage(result.labelImageBase64);
    } catch (error) {
      // Validation error handled by form
    }
  };

  // Bulk Labels handlers
  const handleAddProductToBulk = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && !bulkProducts.some((p) => p.productId === productId)) {
      setBulkProducts((prev) => [...prev, { productId, quantity: 1, productName: product.name }]);
    }
  };

  const handleRemoveProductFromBulk = (productId: number) => {
    setBulkProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleBulkQuantityChange = (productId: number, quantity: number) => {
    setBulkProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))
    );
  };

  const handleGenerateBulkLabels = async () => {
    if (bulkProducts.length === 0) {
      message.warning('En az bir ürün ekleyin');
      return;
    }

    try {
      const result = await generateBulkLabels.mutateAsync({
        products: bulkProducts.map(({ productId, quantity }) => ({ productId, quantity })),
        labelSize: bulkLabelSize as LabelSize,
        barcodeFormat: bulkBarcodeFormat as BarcodeFormat,
        includeProductName: true,
        includePrice: true,
      });

      const link = document.createElement('a');
      link.href = `data:${result.contentType};base64,${result.fileBase64}`;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Auto-generate handlers
  const handleAutoGenerate = async () => {
    try {
      const values = await autoGenForm.validateFields();
      const result = await autoGenerateBarcode.mutateAsync({
        productId: values.productId,
        format: values.format || 'EAN13',
        updateProduct: values.updateProduct ?? true,
      });
      setAutoGenResult({
        barcode: result.generatedBarcode,
        saved: result.productUpdated,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Validation handlers
  const handleValidateBarcode = async () => {
    if (!validationBarcode) return;

    try {
      const result = await validateBarcode.mutateAsync({
        barcode: validationBarcode,
        format: validationFormat as BarcodeFormat,
      });

      if (result.isValid) {
        message.success('Barkod formatı geçerli');
      } else {
        message.error(result.errorMessage || 'Barkod formatı geçersiz');
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCheckUnique = async () => {
    if (!validationBarcode) return;

    try {
      const result = await checkBarcodeUnique.mutateAsync({
        barcode: validationBarcode,
      });

      if (result.isUnique) {
        message.success('Barkod benzersiz');
      } else {
        message.warning(`Barkod zaten kullanılıyor: ${result.conflictingProductCode}`);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Kopyalandı');
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER LOOKUP RESULT - Enterprise Design
  // ═══════════════════════════════════════════════════════════════
  const renderLookupResult = () => {
    if (isLookingUp) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spin size="large" />
          <span className="mt-3 text-sm text-slate-500">Aranıyor...</span>
        </div>
      );
    }

    if (!lookupResult) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ScanOutlined className="text-xl text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-900">Barkod Tarayın</span>
          <span className="text-xs text-slate-500 mt-1">Hardware scanner veya manuel giriş</span>
        </div>
      );
    }

    if (!lookupResult.found) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <ExclamationCircleIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-medium text-slate-900 mb-1">Barkod Bulunamadı</div>
          <div className="text-xs text-slate-500 font-mono mb-3">{lookupResult.searchedBarcode}</div>
          <button
            onClick={() => router.push('/inventory/products/new')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Ürün Ekle
          </button>
        </div>
      );
    }

    // Product found - Enterprise card design
    if (lookupResult.matchType === 'Product' && lookupResult.product) {
      const p = lookupResult.product;
      const stockPercentage = p.totalStockQuantity > 0
        ? Math.min(100, (p.availableStockQuantity / p.totalStockQuantity) * 100)
        : 0;

      return (
        <div className="space-y-4">
          {/* Success indicator */}
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Ürün Bulundu</span>
            <Tag color="blue">{lookupResult.matchType}</Tag>
          </div>

          {/* Product info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              {p.primaryImageUrl ? (
                <img src={p.primaryImageUrl} alt={p.name} className="w-14 h-14 object-cover rounded" />
              ) : (
                <ShoppingBagIcon className="w-4 h-4 text-2xl text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">Kod: {p.code}</span>
                {p.sku && <span className="text-xs text-slate-500">• SKU: {p.sku}</span>}
              </div>
              {p.categoryName && (
                <Tag className="mt-2">{p.categoryName}</Tag>
              )}
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Birim Fiyat</div>
              <div className="text-lg font-semibold text-slate-900 mt-1">
                {p.unitPrice?.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: p.unitPriceCurrency || 'TRY',
                })}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Mevcut Stok</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-lg font-semibold ${p.availableStockQuantity <= 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {p.availableStockQuantity}
                </span>
                <span className="text-xs text-slate-500">/ {p.totalStockQuantity}</span>
              </div>
              {/* Stock bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2">
                <div
                  className={`h-full rounded-full ${stockPercentage > 50 ? 'bg-emerald-500' : stockPercentage > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Warehouse stock */}
          {p.stockByWarehouse && p.stockByWarehouse.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Depo Bazlı Stok</div>
              <div className="space-y-2">
                {p.stockByWarehouse.map((w) => (
                  <div key={w.warehouseId} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{w.warehouseName}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{w.availableQuantity}</span>
                      {w.reservedQuantity > 0 && (
                        <span className="text-xs text-amber-600">({w.reservedQuantity} rezerve)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => router.push(`/inventory/products/${p.id}`)}
              className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
            >
              Detaya Git →
            </button>
          </div>
        </div>
      );
    }

    // Variant found
    if (lookupResult.matchType === 'ProductVariant' && lookupResult.variant) {
      const v = lookupResult.variant;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Varyant Bulundu</span>
            <Tag color="purple">{lookupResult.matchType}</Tag>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Ürün">{v.productName}</Descriptions.Item>
            <Descriptions.Item label="Varyant">{v.variantName}</Descriptions.Item>
            <Descriptions.Item label="SKU">{v.sku}</Descriptions.Item>
            <Descriptions.Item label="Fiyat">
              {v.unitPrice?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </Descriptions.Item>
            <Descriptions.Item label="Stok">{v.totalStockQuantity}</Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    // Serial Number found
    if (lookupResult.matchType === 'SerialNumber' && lookupResult.serialNumber) {
      const s = lookupResult.serialNumber;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Seri Numarası Bulundu</span>
            <Tag color="orange">{lookupResult.matchType}</Tag>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Seri No">{s.serialNumber}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{s.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum"><Tag>{s.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Depo">{s.warehouseName || '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    // Lot/Batch found
    if (lookupResult.matchType === 'LotBatch' && lookupResult.lotBatch) {
      const l = lookupResult.lotBatch;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Parti/Lot Bulundu</span>
            <Tag color="cyan">{lookupResult.matchType}</Tag>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Lot No">{l.lotNumber}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{l.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum"><Tag>{l.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Miktar">{l.quantity}</Descriptions.Item>
            <Descriptions.Item label="Mevcut">{l.availableQuantity}</Descriptions.Item>
            <Descriptions.Item label="SKT">
              {l.expiryDate ? dayjs(l.expiryDate).format('DD.MM.YYYY') : '-'}
              {l.daysUntilExpiry !== undefined && l.daysUntilExpiry <= 30 && (
                <Tag color="red" className="ml-2">{l.daysUntilExpiry} gün</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB ITEMS
  // ═══════════════════════════════════════════════════════════════
  const tabItems = [
    {
      key: 'scanner',
      label: (
        <span className="flex items-center gap-2">
          <ScanOutlined />
          Pro Tarayıcı
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Tarama</span>
                  <div className="text-2xl font-semibold text-slate-900">{totalScannedItems}</div>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
                  <ScanOutlined style={{ color: '#8b5cf6' }} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Benzersiz</span>
                  <div className="text-2xl font-semibold text-slate-900">{historyStats.uniqueItems}</div>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
                  <BarcodeOutlined style={{ color: '#3b82f6' }} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Bulunan</span>
                  <div className="text-2xl font-semibold text-emerald-600">{historyStats.foundItems}</div>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
                  <CheckCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Bulunamayan</span>
                  <div className="text-2xl font-semibold text-red-600">{historyStats.notFoundItems}</div>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444415' }}>
                  <XCircleIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Scanner Control Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Scanner Input */}
              <div className="flex-1 min-w-[280px]">
                <Input
                  ref={scanInputRef}
                  size="large"
                  placeholder={isScannerActive ? "Barkod tarayın veya girin..." : "Tarayıcı devre dışı"}
                  prefix={<ScanOutlined className="text-slate-400" />}
                  value={scanInput}
                  onChange={handleScanInputChange}
                  onKeyDown={handleScanKeyDown}
                  disabled={!isScannerActive}
                  className="h-11"
                  suffix={
                    <button
                      onClick={handleManualSearch}
                      disabled={!isScannerActive || !scanInput.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      Ara
                    </button>
                  }
                />
              </div>

              {/* Warehouse Filter */}
              <Select
                placeholder="Tüm Depolar"
                allowClear
                style={{ width: 160 }}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
              >
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>

              {/* Sound Toggle */}
              <Tooltip title={soundEnabled ? "Ses Açık" : "Ses Kapalı"}>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-md transition-colors ${soundEnabled ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  <SoundOutlined />
                </button>
              </Tooltip>

              {/* Scanner Toggle */}
              <button
                onClick={() => {
                  setIsScannerActive(!isScannerActive);
                  if (!isScannerActive) setTimeout(refocusScanner, 100);
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isScannerActive
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThunderboltOutlined />
                {isScannerActive ? "Aktif" : "Durduruldu"}
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScannerActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="text-slate-500">{isScannerActive ? 'Taramaya hazır' : 'Beklemede'}</span>
              </div>
              {historyStats.totalValue > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">
                    Toplam: <span className="font-medium text-slate-900">
                      {historyStats.totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Result Card */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InboxIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">Tarama Sonucu</span>
                </div>
                {lastScannedBarcode && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {lastScannedBarcode}
                  </span>
                )}
              </div>
              <div className="p-4">
                {renderLookupResult()}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-900">💡 Pro Tarayıcı İpuçları</span>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>Hardware scanner otomatik algılanır</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>Aynı barkod tarandığında miktar artar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>Ses açıkken başarı/hata bildirimi alırsınız</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>Focus otomatik olarak korunur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>Enter tuşu ile hızlı arama yapabilirsiniz</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryOutlined className="text-slate-400" />
                <span className="text-sm font-medium text-slate-900">Tarama Geçmişi</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {historyStats.uniqueItems}
                </span>
                {historyStats.totalQuantity !== historyStats.uniqueItems && (
                  <Tag color="blue">{historyStats.totalQuantity} adet</Tag>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const data = scanHistory.map(item => `${item.barcode}\t${item.quantity}`).join('\n');
                    navigator.clipboard.writeText(data);
                    message.success('Geçmiş kopyalandı');
                  }}
                  disabled={scanHistory.length === 0}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={scanHistory.length === 0}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              {scanHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <HistoryOutlined className="text-xl text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-500">Henüz tarama yapılmadı</span>
                </div>
              ) : (
                <Table
                  dataSource={scanHistory}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} kayıt` }}
                  columns={[
                    {
                      title: 'Barkod',
                      dataIndex: 'barcode',
                      key: 'barcode',
                      render: (barcode: string) => (
                        <span className="font-mono text-sm text-slate-700">{barcode}</span>
                      ),
                    },
                    {
                      title: 'Adet',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 100,
                      render: (quantity: number, record: ScanHistoryItem) => (
                        <InputNumber
                          min={1}
                          max={9999}
                          value={quantity}
                          size="small"
                          onChange={(val) => handleUpdateQuantity(record.id, val || 1)}
                          style={{ width: 70 }}
                        />
                      ),
                    },
                    {
                      title: 'Durum',
                      key: 'status',
                      width: 120,
                      render: (_, record: ScanHistoryItem) =>
                        record.lookupResult.found ? (
                          <Tag color="green" icon={<CheckCircleIcon className="w-4 h-4" />}>
                            {record.lookupResult.matchType}
                          </Tag>
                        ) : (
                          <Tag color="red" icon={<XCircleIcon className="w-4 h-4" />}>
                            Bulunamadı
                          </Tag>
                        ),
                    },
                    {
                      title: 'Ürün',
                      key: 'item',
                      ellipsis: true,
                      render: (_, record: ScanHistoryItem) => {
                        const r = record.lookupResult;
                        if (!r.found) return <span className="text-slate-400">-</span>;
                        if (r.product) return <span className="text-sm text-slate-900">{r.product.name}</span>;
                        if (r.variant) return <span className="text-sm text-slate-900">{r.variant.variantName}</span>;
                        if (r.serialNumber) return <span className="text-sm font-mono">{r.serialNumber.serialNumber}</span>;
                        if (r.lotBatch) return <span className="text-sm font-mono">{r.lotBatch.lotNumber}</span>;
                        return '-';
                      },
                    },
                    {
                      title: 'Fiyat',
                      key: 'price',
                      width: 120,
                      align: 'right' as const,
                      render: (_, record: ScanHistoryItem) => {
                        const product = record.lookupResult.product;
                        if (!product?.unitPrice) return '-';
                        const total = product.unitPrice * record.quantity;
                        return (
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-900">
                              {total.toLocaleString('tr-TR', { style: 'currency', currency: product.unitPriceCurrency || 'TRY' })}
                            </div>
                            {record.quantity > 1 && (
                              <div className="text-xs text-slate-500">
                                {record.quantity}× {product.unitPrice.toLocaleString('tr-TR')}
                              </div>
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      title: '',
                      key: 'actions',
                      width: 80,
                      render: (_, record: ScanHistoryItem) => (
                        <div className="flex items-center gap-1">
                          <Tooltip title="Tekrar Ara">
                            <button
                              onClick={() => setLastScannedBarcode(record.barcode)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <button
                              onClick={() => handleRemoveFromHistory(record.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'generator',
      label: (
        <span className="flex items-center gap-2">
          <BarcodeOutlined />
          Barkod Oluşturucu
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Barkod Oluştur</h3>
            </div>
            <Form form={generateForm} layout="vertical">
              <Form.Item
                name="content"
                label="Barkod İçeriği"
                rules={[{ required: true, message: 'Barkod içeriği gerekli' }]}
              >
                <Input placeholder="Barkod numarası veya metin" />
              </Form.Item>

              <Form.Item name="format" label="Barkod Formatı" initialValue="Code128">
                <Select>
                  {Object.entries(formatLabels).map(([value, label]) => (
                    <Select.Option key={value} value={value}>{label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="width" label="Genişlik (px)" initialValue={300}>
                  <InputNumber min={100} max={1000} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="height" label="Yükseklik (px)" initialValue={100}>
                  <InputNumber min={50} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </div>

              <Form.Item name="includeText" valuePropName="checked" initialValue={true}>
                <Checkbox>Barkod metnini göster</Checkbox>
              </Form.Item>

              <button
                type="button"
                onClick={handleGenerateBarcode}
                disabled={generateBarcode.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
              >
                <BarcodeOutlined />
                {generateBarcode.isPending ? 'Oluşturuluyor...' : 'Barkod Oluştur'}
              </button>
            </Form>
          </Card>

          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Önizleme</h3>
            </div>
            {generatedBarcodeImage ? (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${generatedBarcodeImage}`}
                  alt="Generated Barcode"
                  className="max-w-full max-h-64 mx-auto border border-slate-200 rounded"
                />
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => downloadImage(generatedBarcodeImage, 'barcode.png')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    İndir
                  </button>
                  <button
                    onClick={() => copyToClipboard(generateForm.getFieldValue('content'))}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Kopyala
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <BarcodeOutlined className="text-xl text-slate-400" />
                </div>
                <span className="text-sm text-slate-500">Barkod oluşturun</span>
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'labels',
      label: (
        <span className="flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          Ürün Etiketi
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Ürün Etiketi Oluştur</h3>
            </div>
            <Form form={labelForm} layout="vertical">
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
              >
                <Select placeholder="Ürün seçin" showSearch optionFilterProp="children" onChange={setSelectedProductForLabel}>
                  {products.map((p) => (
                    <Select.Option key={p.id} value={p.id}>{p.code} - {p.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="labelSize" label="Etiket Boyutu" initialValue="Medium">
                  <Select>
                    {Object.entries(sizeLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>{label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="barcodeFormat" label="Barkod Formatı" initialValue="Code128">
                  <Select>
                    {Object.entries(formatLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>{label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="includeProductName" valuePropName="checked" initialValue={true}>
                  <Checkbox>Ürün adını göster</Checkbox>
                </Form.Item>
                <Form.Item name="includePrice" valuePropName="checked" initialValue={true}>
                  <Checkbox>Fiyatı göster</Checkbox>
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="includeSKU" valuePropName="checked" initialValue={false}>
                  <Checkbox>SKU göster</Checkbox>
                </Form.Item>
                <Form.Item name="includeQRCode" valuePropName="checked" initialValue={false}>
                  <Checkbox>QR Kod ekle</Checkbox>
                </Form.Item>
              </div>

              <button
                type="button"
                onClick={handleGenerateProductLabel}
                disabled={generateProductLabel.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
              >
                <TagIcon className="w-4 h-4" />
                {generateProductLabel.isPending ? 'Oluşturuluyor...' : 'Etiket Oluştur'}
              </button>
            </Form>
          </Card>

          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Önizleme</h3>
            </div>
            {generatedLabelImage ? (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${generatedLabelImage}`}
                  alt="Generated Label"
                  className="max-w-full max-h-64 mx-auto border border-slate-200 rounded"
                />
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => downloadImage(generatedLabelImage, 'product-label.png')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    İndir
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                    <PrinterIcon className="w-4 h-4" />
                    Yazdır
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <TagIcon className="w-4 h-4 text-xl text-slate-400" />
                </div>
                <span className="text-sm text-slate-500">Etiket oluşturun</span>
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'bulk',
      label: (
        <span className="flex items-center gap-2">
          <PrinterIcon className="w-4 h-4" />
          Toplu Etiket
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-900">Ürün Listesi</h3>
                <Select
                  placeholder="Ürün ekle"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: 220 }}
                  value={undefined}
                  onChange={handleAddProductToBulk}
                >
                  {products
                    .filter((p) => !bulkProducts.some((bp) => bp.productId === p.id))
                    .map((p) => (
                      <Select.Option key={p.id} value={p.id}>{p.code} - {p.name}</Select.Option>
                    ))}
                </Select>
              </div>

              {bulkProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <PrinterIcon className="w-4 h-4 text-xl text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-500">Etiket yazdırmak için ürün ekleyin</span>
                </div>
              ) : (
                <Table
                  dataSource={bulkProducts}
                  rowKey="productId"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Ürün', dataIndex: 'productName', key: 'name' },
                    {
                      title: 'Etiket Adedi',
                      key: 'quantity',
                      width: 130,
                      render: (_, record) => (
                        <InputNumber
                          min={1}
                          max={100}
                          value={record.quantity}
                          onChange={(val) => handleBulkQuantityChange(record.productId, val || 1)}
                          size="small"
                          style={{ width: 80 }}
                        />
                      ),
                    },
                    {
                      title: '',
                      key: 'action',
                      width: 50,
                      render: (_, record) => (
                        <button
                          onClick={() => handleRemoveProductFromBulk(record.productId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      ),
                    },
                  ]}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <span className="font-medium">Toplam</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <span className="font-medium">{bulkProducts.reduce((sum, p) => sum + p.quantity, 0)} etiket</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  )}
                />
              )}
            </Card>
          </div>

          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Etiket Ayarları</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">Etiket Boyutu</label>
                <Select value={bulkLabelSize} onChange={setBulkLabelSize} style={{ width: '100%', marginTop: 4 }}>
                  {Object.entries(sizeLabels).map(([value, label]) => (
                    <Select.Option key={value} value={value}>{label}</Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">Barkod Formatı</label>
                <Select value={bulkBarcodeFormat} onChange={setBulkBarcodeFormat} style={{ width: '100%', marginTop: 4 }}>
                  {Object.entries(formatLabels).map(([value, label]) => (
                    <Select.Option key={value} value={value}>{label}</Select.Option>
                  ))}
                </Select>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleGenerateBulkLabels}
                  disabled={generateBulkLabels.isPending || bulkProducts.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  {generateBulkLabels.isPending ? 'Hazırlanıyor...' : 'Etiketleri İndir (ZIP)'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'autogen',
      label: (
        <span className="flex items-center gap-2">
          <QrcodeOutlined />
          Otomatik Barkod
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Otomatik Barkod Oluştur</h3>
              <p className="text-xs text-slate-500 mt-1">Seçilen formata uygun, benzersiz barkod üretir</p>
            </div>

            <Form form={autoGenForm} layout="vertical">
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
              >
                <Select placeholder="Ürün seçin" showSearch optionFilterProp="children">
                  {products.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.code} - {p.name} {p.barcode && <Tag>Barkod var</Tag>}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="format" label="Barkod Formatı" initialValue="EAN13">
                <Select>
                  <Select.Option value="EAN13">EAN-13 (13 hane)</Select.Option>
                  <Select.Option value="EAN8">EAN-8 (8 hane)</Select.Option>
                  <Select.Option value="Code128">Code 128 (Alfanümerik)</Select.Option>
                  <Select.Option value="Code39">Code 39 (Alfanümerik)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="updateProduct" valuePropName="checked" initialValue={true}>
                <Checkbox>Ürüne barkodu kaydet</Checkbox>
              </Form.Item>

              <button
                type="button"
                onClick={handleAutoGenerate}
                disabled={autoGenerateBarcode.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
              >
                <QrcodeOutlined />
                {autoGenerateBarcode.isPending ? 'Oluşturuluyor...' : 'Barkod Oluştur'}
              </button>
            </Form>
          </Card>

          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Sonuç</h3>
            </div>
            {autoGenResult ? (
              <div className="text-center">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-4">
                  <CheckCircleIcon className="w-4 h-4 text-3xl text-emerald-600 mb-2" />
                  <div className="text-sm text-slate-600 mb-2">Barkod Oluşturuldu</div>
                  <div className="text-2xl font-mono font-bold text-slate-900">{autoGenResult.barcode}</div>
                  {autoGenResult.saved ? (
                    <Tag color="green" className="mt-2">Ürüne kaydedildi</Tag>
                  ) : (
                    <Tag className="mt-2">Sadece oluşturuldu</Tag>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(autoGenResult.barcode)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Kopyala
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <QrcodeOutlined className="text-xl text-slate-400" />
                </div>
                <span className="text-sm text-slate-500">Barkod oluşturun</span>
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'validate',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Doğrulama
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Barkod Doğrulama</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">Barkod</label>
                <Input
                  placeholder="Doğrulanacak barkod"
                  value={validationBarcode}
                  onChange={(e) => setValidationBarcode(e.target.value)}
                  style={{ marginTop: 4 }}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">Format</label>
                <Select value={validationFormat} onChange={setValidationFormat} style={{ width: '100%', marginTop: 4 }}>
                  {Object.entries(formatLabels).map(([value, label]) => (
                    <Select.Option key={value} value={value}>{label}</Select.Option>
                  ))}
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleValidateBarcode}
                  disabled={validateBarcode.isPending || !validationBarcode}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Format Doğrula
                </button>
                <button
                  onClick={handleCheckUnique}
                  disabled={checkBarcodeUnique.isPending || !validationBarcode}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:bg-slate-100 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Benzersizlik
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Barkod Formatları</h3>
            </div>
            <Table
              dataSource={Object.entries(formatLabels).map(([value, label]) => ({ value, label }))}
              rowKey="value"
              size="small"
              pagination={false}
              columns={[
                { title: 'Format', dataIndex: 'label', key: 'label' },
                {
                  title: 'Tip',
                  key: 'type',
                  render: (_, record) =>
                    ['QRCode', 'DataMatrix', 'PDF417'].includes(record.value) ? (
                      <Tag color="purple">2D</Tag>
                    ) : (
                      <Tag>1D</Tag>
                    ),
                },
                {
                  title: 'Açıklama',
                  key: 'desc',
                  render: (_, record) => {
                    const descriptions: Record<string, string> = {
                      EAN13: 'Uluslararası ürün barkodu',
                      EAN8: 'Küçük ürünler için',
                      UPC_A: 'ABD ürün barkodu',
                      UPC_E: 'Kompakt ABD barkodu',
                      Code128: 'Yüksek yoğunluklu alfanümerik',
                      Code39: 'Endüstriyel barkod',
                      QRCode: '2D matris',
                      DataMatrix: 'Küçük 2D matris',
                      PDF417: 'Yüksek kapasiteli 2D',
                      ITF14: 'Lojistik barkodu',
                    };
                    return <span className="text-xs text-slate-500">{descriptions[record.value] || ''}</span>;
                  },
                },
              ]}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <ListPageHeader
        icon={<ScanOutlined />}
        iconColor="#8b5cf6"
        title="Barkod Yönetimi"
        description="Barkod tarama, oluşturma ve etiket işlemleri"
        secondaryActions={
          <button
            onClick={refocusScanner}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        }
      />

      {/* Tabs */}
      <DataTableWrapper>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="[&_.ant-tabs-nav]:px-4 [&_.ant-tabs-content]:p-4"
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
