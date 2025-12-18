'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Row,
  Col,
  Input,
  Select,
  Form,
  Tabs,
  Tag,
  Empty,
  Spin,
  Divider,
  Image,
  Alert,
  InputNumber,
  Checkbox,
  Table,
  Modal,
  Tooltip,
  message,
  Badge,
  Descriptions,
  Progress,
} from 'antd';
import {
  BarcodeOutlined,
  ScanOutlined,
  QrcodeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  InboxOutlined,
  HistoryOutlined,
  TagsOutlined,
  CopyOutlined,
  SoundOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
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
  ProductDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
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
    // High-pitched pleasant beep for success
    playBeep(880, 0.15, 'sine');
    setTimeout(() => playBeep(1174.66, 0.15, 'sine'), 100);
  }, [playBeep]);

  const playError = useCallback(() => {
    // Low buzzing sound for error
    playBeep(200, 0.3, 'square');
  }, [playBeep]);

  const playWarning = useCallback(() => {
    // Medium tone for warning
    playBeep(440, 0.2, 'triangle');
  }, [playBeep]);

  const playQuantityIncrement = useCallback(() => {
    // Quick tick for quantity increment
    playBeep(1000, 0.08, 'sine');
  }, [playBeep]);

  return { playSuccess, playError, playWarning, playQuantityIncrement };
};

// ═══════════════════════════════════════════════════════════════
// SCAN HISTORY ITEM TYPE - Enhanced with quantity tracking
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
  const [scanBuffer, setScanBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [totalScannedItems, setTotalScannedItems] = useState(0);

  // Refs for pro scanner
  const scanInputRef = useRef<any>(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const SCANNER_SPEED_THRESHOLD = 50; // ms between keystrokes for hardware scanner detection

  // Audio feedback hook
  const { playSuccess, playError, playWarning, playQuantityIncrement } = useAudioFeedback();

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
  const { data: barcodeFormats = [] } = useBarcodeFormats();
  const { data: labelSizes = [] } = useLabelSizes();

  // Barcode lookup (only when lastScannedBarcode is set)
  const { data: lookupResult, isLoading: isLookingUp, refetch: refetchLookup } = useBarcodeLookup(
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
  // SMART AUTO-FOCUS SYSTEM - Pro Scanner Feature #1
  // ═══════════════════════════════════════════════════════════════
  const refocusScanner = useCallback(() => {
    if (activeTab === 'scanner' && scanInputRef.current && isScannerActive) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        scanInputRef.current?.focus();
      });
    }
  }, [activeTab, isScannerActive]);

  // Focus on tab switch
  useEffect(() => {
    refocusScanner();
  }, [activeTab, refocusScanner]);

  // Aggressive auto-refocus system
  useEffect(() => {
    if (activeTab !== 'scanner' || !isScannerActive) return;

    // Refocus on any click outside focused element
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't refocus if clicking on interactive elements
      if (target.closest('button, select, .ant-select, .ant-modal, .ant-dropdown')) return;
      setTimeout(refocusScanner, 100);
    };

    // Refocus on window focus
    const handleWindowFocus = () => {
      setTimeout(refocusScanner, 100);
    };

    // Refocus on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(refocusScanner, 100);
      }
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
  // INTELLIGENT HISTORY MANAGEMENT - Pro Scanner Feature #3
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (lookupResult && lastScannedBarcode) {
      const now = new Date();

      setScanHistory((prev) => {
        // Check if this barcode already exists in history
        const existingIndex = prev.findIndex(item => item.barcode === lastScannedBarcode);

        if (existingIndex >= 0) {
          // Increment quantity instead of adding duplicate
          const updated = [...prev];
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + 1,
            lastScannedAt: now,
          };
          // Move to top of list
          const [item] = updated.splice(existingIndex, 1);
          updated.unshift(item);

          // Play quantity increment sound
          if (soundEnabled) {
            playQuantityIncrement();
          }

          return updated;
        }

        // Add new item
        const newItem: ScanHistoryItem = {
          id: `${lastScannedBarcode}-${now.getTime()}`,
          barcode: lastScannedBarcode,
          quantity: 1,
          lookupResult,
          firstScannedAt: now,
          lastScannedAt: now,
        };

        // Play appropriate sound
        if (soundEnabled) {
          if (lookupResult.found) {
            playSuccess();
          } else {
            playError();
          }
        }

        return [newItem, ...prev.slice(0, 49)]; // Keep last 50
      });

      // Update total count
      setTotalScannedItems(prev => prev + 1);

      // Refocus after scan
      setTimeout(refocusScanner, 50);
    }
  }, [lookupResult, lastScannedBarcode, soundEnabled, playSuccess, playError, playQuantityIncrement, refocusScanner]);

  // ═══════════════════════════════════════════════════════════════
  // OPTIMIZED SCANNER HANDLER - Pro Scanner Feature #5
  // Handles both hardware scanners and manual input
  // ═══════════════════════════════════════════════════════════════
  const handleScanKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Hardware scanner detection: rapid keystrokes
      const isHardwareScanner = timeDiff < SCANNER_SPEED_THRESHOLD;

      if (e.key === 'Enter') {
        e.preventDefault();
        const barcodeValue = scanInput.trim();

        if (barcodeValue) {
          // Process the scan
          setLastScannedBarcode(barcodeValue);
          setScanInput('');
          scanBufferRef.current = '';

          // Haptic-like visual feedback
          if (scanInputRef.current) {
            scanInputRef.current.input?.classList.add('scan-flash');
            setTimeout(() => {
              scanInputRef.current?.input?.classList.remove('scan-flash');
            }, 200);
          }
        }
        return;
      }

      // For hardware scanner: collect in buffer for rapid processing
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

  // Clear history
  const handleClearHistory = useCallback(() => {
    setScanHistory([]);
    setTotalScannedItems(0);
  }, []);

  // Remove single item from history
  const handleRemoveFromHistory = useCallback((id: string) => {
    setScanHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // Update quantity manually
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

      // Download ZIP file
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

  // Copy barcode to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Kopyalandı');
  };

  // Download generated image
  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ═══════════════════════════════════════════════════════════════
  // ENHANCED RESULT CARD - Pro Scanner Feature #4
  // Large product visualization with image, name, price, stock
  // ═══════════════════════════════════════════════════════════════
  const renderLookupResult = () => {
    if (isLookingUp) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <Spin size="large" />
            <div className="absolute -inset-4 border-2 border-slate-200 rounded-full animate-ping opacity-30" />
          </div>
          <Text className="mt-4 text-lg text-slate-500">Aranıyor...</Text>
        </div>
      );
    }

    if (!lookupResult) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <ScanOutlined className="text-4xl text-slate-400" />
          </div>
          <Text className="text-lg text-slate-500">Barkod Tarayın</Text>
          <Text type="secondary" className="text-sm mt-1">Hardware scanner veya manuel giriş kullanın</Text>
        </div>
      );
    }

    if (!lookupResult.found) {
      return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 text-center border border-amber-200">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleOutlined className="text-4xl text-amber-500" />
          </div>
          <Title level={4} className="!mb-2 !text-amber-800">Barkod Bulunamadı</Title>
          <Text className="text-amber-700 text-lg font-mono">{lookupResult.searchedBarcode}</Text>
          <div className="mt-4">
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => router.push('/inventory/products/new')}>
              Yeni Ürün Ekle
            </Button>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // ENHANCED PRODUCT CARD - Large, visual, enterprise-grade
    // ═══════════════════════════════════════════════════════════════
    if (lookupResult.matchType === 'Product' && lookupResult.product) {
      const p = lookupResult.product;
      const stockPercentage = p.totalStockQuantity > 0
        ? Math.min(100, (p.availableStockQuantity / p.totalStockQuantity) * 100)
        : 0;
      const stockStatus = p.totalStockQuantity <= 0 ? 'exception' :
        stockPercentage < 25 ? 'exception' :
        stockPercentage < 50 ? 'normal' : 'success';

      return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl overflow-hidden border border-emerald-200">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 flex items-center justify-between">
            <Space>
              <CheckCircleOutlined className="text-white text-xl" />
              <Text className="text-white font-semibold text-lg">Ürün Bulundu</Text>
            </Space>
            <Button
              type="text"
              className="!text-white hover:!bg-white/20"
              onClick={() => router.push(`/inventory/products/${p.id}`)}
            >
              Detay →
            </Button>
          </div>

          {/* Product Main Info */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Product Image Placeholder */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                  {p.primaryImageUrl ? (
                    <Image
                      src={p.primaryImageUrl}
                      alt={p.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-lg"
                      preview={false}
                    />
                  ) : (
                    <ShoppingOutlined className="text-5xl text-slate-300" />
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Title level={3} className="!mb-1 !text-slate-900 truncate">{p.name}</Title>
                <div className="flex items-center gap-3 mb-4">
                  <Tag color="blue" className="!m-0">{p.code}</Tag>
                  {p.sku && <Tag color="slate" className="!m-0">SKU: {p.sku}</Tag>}
                  {p.categoryName && <Tag className="!m-0">{p.categoryName}</Tag>}
                </div>

                {/* Price & Stock Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price Card */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarOutlined className="text-emerald-500" />
                      <Text type="secondary" className="text-xs uppercase tracking-wide">Birim Fiyat</Text>
                    </div>
                    <Text className="text-2xl font-bold text-slate-900">
                      {p.unitPrice?.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: p.unitPriceCurrency || 'TRY',
                        minimumFractionDigits: 2
                      })}
                    </Text>
                  </div>

                  {/* Stock Card */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <ShopOutlined className="text-blue-500" />
                      <Text type="secondary" className="text-xs uppercase tracking-wide">Stok Durumu</Text>
                    </div>
                    <div className="flex items-center gap-3">
                      <Text className="text-2xl font-bold text-slate-900">{p.availableStockQuantity}</Text>
                      <Progress
                        percent={stockPercentage}
                        status={stockStatus}
                        size="small"
                        showInfo={false}
                        className="flex-1"
                      />
                    </div>
                    <Text type="secondary" className="text-xs">
                      / {p.totalStockQuantity} toplam ({p.totalStockQuantity - p.availableStockQuantity} rezerve)
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse Stock Table */}
          {p.stockByWarehouse && p.stockByWarehouse.length > 0 && (
            <div className="border-t border-emerald-200 bg-white/50">
              <div className="px-6 py-3 border-b border-slate-100">
                <Text className="font-semibold text-slate-700">
                  <ShopOutlined className="mr-2" />
                  Depo Bazlı Stok
                </Text>
              </div>
              <Table
                dataSource={p.stockByWarehouse}
                rowKey="warehouseId"
                size="small"
                pagination={false}
                className="[&_.ant-table]:!bg-transparent"
                columns={[
                  {
                    title: 'Depo',
                    dataIndex: 'warehouseName',
                    key: 'warehouse',
                    render: (name) => <Text strong>{name}</Text>
                  },
                  {
                    title: 'Miktar',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'right' as const,
                    render: (qty) => <Text className="font-mono">{qty}</Text>
                  },
                  {
                    title: 'Mevcut',
                    dataIndex: 'availableQuantity',
                    key: 'available',
                    align: 'right' as const,
                    render: (qty) => <Text className="font-mono text-emerald-600 font-semibold">{qty}</Text>
                  },
                  {
                    title: 'Rezerve',
                    dataIndex: 'reservedQuantity',
                    key: 'reserved',
                    align: 'right' as const,
                    render: (qty) => <Text className="font-mono text-amber-600">{qty}</Text>
                  },
                ]}
              />
            </div>
          )}
        </div>
      );
    }

    if (lookupResult.matchType === 'ProductVariant' && lookupResult.variant) {
      const v = lookupResult.variant;
      return (
        <Card
          size="small"
          title={
            <Space>
              <TagsOutlined />
              <span>Varyant Bulundu</span>
              <Tag color="purple">{lookupResult.matchType}</Tag>
            </Space>
          }
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ürün">{v.productName}</Descriptions.Item>
            <Descriptions.Item label="Varyant">{v.variantName}</Descriptions.Item>
            <Descriptions.Item label="SKU">{v.sku}</Descriptions.Item>
            <Descriptions.Item label="Fiyat">
              {v.unitPrice?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </Descriptions.Item>
            <Descriptions.Item label="Stok">{v.totalStockQuantity}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    if (lookupResult.matchType === 'SerialNumber' && lookupResult.serialNumber) {
      const s = lookupResult.serialNumber;
      return (
        <Card
          size="small"
          title={
            <Space>
              <BarcodeOutlined />
              <span>Seri Numarası Bulundu</span>
              <Tag color="orange">{lookupResult.matchType}</Tag>
            </Space>
          }
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Seri No">{s.serialNumber}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{s.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Tag>{s.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Depo">{s.warehouseName || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    if (lookupResult.matchType === 'LotBatch' && lookupResult.lotBatch) {
      const l = lookupResult.lotBatch;
      return (
        <Card
          size="small"
          title={
            <Space>
              <InboxOutlined />
              <span>Parti/Lot Bulundu</span>
              <Tag color="cyan">{lookupResult.matchType}</Tag>
            </Space>
          }
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Lot No">{l.lotNumber}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{l.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Tag>{l.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Miktar">{l.quantity}</Descriptions.Item>
            <Descriptions.Item label="Mevcut">{l.availableQuantity}</Descriptions.Item>
            <Descriptions.Item label="SKT">
              {l.expiryDate ? dayjs(l.expiryDate).format('DD.MM.YYYY') : '-'}
              {l.daysUntilExpiry !== undefined && l.daysUntilExpiry <= 30 && (
                <Tag color="red" className="ml-2">{l.daysUntilExpiry} gün</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB ITEMS - Enhanced Scanner Tab with Pro Features
  // ═══════════════════════════════════════════════════════════════
  const tabItems = [
    {
      key: 'scanner',
      label: (
        <Space>
          <ThunderboltOutlined />
          Pro Tarayıcı
        </Space>
      ),
      children: (
        <div className="space-y-4">
          {/* ═══════════════════════════════════════════════════════════════
              PRO SCANNER CONTROL BAR
          ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex flex-wrap items-center gap-4">
              {/* Scanner Input - Large & Prominent */}
              <div className="flex-1 min-w-[300px]">
                <Input
                  ref={scanInputRef}
                  size="large"
                  placeholder={isScannerActive ? "📡 Barkod tarayıcı hazır..." : "Tarayıcı devre dışı"}
                  prefix={<ScanOutlined className="text-slate-400" />}
                  value={scanInput}
                  onChange={handleScanInputChange}
                  onKeyDown={handleScanKeyDown}
                  disabled={!isScannerActive}
                  className="!bg-slate-800 !border-slate-600 !text-white placeholder:!text-slate-500 !text-lg !h-12 focus:!border-emerald-500 focus:!ring-2 focus:!ring-emerald-500/20 scanner-input"
                  suffix={
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleManualSearch}
                      disabled={!isScannerActive || !scanInput.trim()}
                      className="!bg-emerald-500 !border-emerald-500 hover:!bg-emerald-600"
                    >
                      Ara
                    </Button>
                  }
                />
              </div>

              {/* Warehouse Filter */}
              <Select
                placeholder="Tüm Depolar"
                allowClear
                style={{ width: 180 }}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
                className="[&_.ant-select-selector]:!bg-slate-800 [&_.ant-select-selector]:!border-slate-600 [&_.ant-select-selection-placeholder]:!text-slate-500 [&_.ant-select-selection-item]:!text-white"
              >
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>

              {/* Sound Toggle */}
              <Tooltip title={soundEnabled ? "Ses Açık" : "Ses Kapalı"}>
                <Button
                  type={soundEnabled ? "primary" : "default"}
                  icon={<SoundOutlined />}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={soundEnabled ? "!bg-emerald-500 !border-emerald-500" : "!bg-slate-700 !border-slate-600 !text-slate-400"}
                />
              </Tooltip>

              {/* Scanner Toggle */}
              <Tooltip title={isScannerActive ? "Tarayıcıyı Durdur" : "Tarayıcıyı Başlat"}>
                <Button
                  type={isScannerActive ? "primary" : "default"}
                  icon={<ThunderboltOutlined />}
                  onClick={() => {
                    setIsScannerActive(!isScannerActive);
                    if (!isScannerActive) {
                      setTimeout(refocusScanner, 100);
                    }
                  }}
                  className={isScannerActive ? "!bg-emerald-500 !border-emerald-500" : "!bg-slate-700 !border-slate-600 !text-slate-400"}
                >
                  {isScannerActive ? "Aktif" : "Durduruldu"}
                </Button>
              </Tooltip>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScannerActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <Text className="text-slate-400">
                  {isScannerActive ? 'Taramaya hazır' : 'Beklemede'}
                </Text>
              </div>
              <div className="text-slate-500">|</div>
              <Text className="text-slate-400">
                <span className="text-white font-semibold">{totalScannedItems}</span> tarama yapıldı
              </Text>
              <div className="text-slate-500">|</div>
              <Text className="text-slate-400">
                <span className="text-white font-semibold">{historyStats.uniqueItems}</span> benzersiz ürün
              </Text>
              {historyStats.totalValue > 0 && (
                <>
                  <div className="text-slate-500">|</div>
                  <Text className="text-emerald-400">
                    Toplam: <span className="font-semibold">
                      {historyStats.totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </Text>
                </>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <Row gutter={[16, 16]}>
            {/* Lookup Result - Full Width on Mobile, Side on Desktop */}
            <Col xs={24} lg={14}>
              <Card
                className="h-full !border-slate-200"
                title={
                  <Space>
                    <InboxOutlined />
                    <span>Tarama Sonucu</span>
                    {lastScannedBarcode && (
                      <Tag color="blue" className="font-mono">{lastScannedBarcode}</Tag>
                    )}
                  </Space>
                }
              >
                {renderLookupResult()}
              </Card>
            </Col>

            {/* Quick Stats & Actions */}
            <Col xs={24} lg={10}>
              <div className="space-y-4">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircleOutlined className="text-emerald-500" />
                      <Text type="secondary" className="text-xs">Bulunan</Text>
                    </div>
                    <Text className="text-2xl font-bold text-emerald-600">{historyStats.foundItems}</Text>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CloseCircleOutlined className="text-red-500" />
                      <Text type="secondary" className="text-xs">Bulunamayan</Text>
                    </div>
                    <Text className="text-2xl font-bold text-red-600">{historyStats.notFoundItems}</Text>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BarcodeOutlined className="text-blue-500" />
                      <Text type="secondary" className="text-xs">Toplam Adet</Text>
                    </div>
                    <Text className="text-2xl font-bold text-blue-600">{historyStats.totalQuantity}</Text>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <HistoryOutlined className="text-purple-500" />
                      <Text type="secondary" className="text-xs">Tarama</Text>
                    </div>
                    <Text className="text-2xl font-bold text-purple-600">{totalScannedItems}</Text>
                  </div>
                </div>

                {/* Help Card */}
                <Card size="small" className="!bg-slate-50 !border-slate-200">
                  <div className="space-y-2">
                    <Text strong className="text-slate-700">💡 Pro Tarayıcı İpuçları</Text>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Hardware scanner otomatik algılanır</li>
                      <li>Aynı barkod = miktar artışı</li>
                      <li>Ses açık iken başarı/hata bildirimi</li>
                      <li>Focus otomatik korunur</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>

          {/* ═══════════════════════════════════════════════════════════════
              INTELLIGENT SCAN HISTORY - With Quantity Aggregation
          ═══════════════════════════════════════════════════════════════ */}
          <Card
            title={
              <Space>
                <HistoryOutlined />
                Akıllı Tarama Geçmişi
                <Badge count={historyStats.uniqueItems} style={{ backgroundColor: '#1890ff' }} />
                {historyStats.totalQuantity !== historyStats.uniqueItems && (
                  <Tag color="green">{historyStats.totalQuantity} adet toplam</Tag>
                )}
              </Space>
            }
            extra={
              <Space>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const data = scanHistory.map(item => `${item.barcode}\t${item.quantity}`).join('\n');
                    navigator.clipboard.writeText(data);
                    message.success('Geçmiş kopyalandı');
                  }}
                  disabled={scanHistory.length === 0}
                >
                  Kopyala
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={handleClearHistory}
                  disabled={scanHistory.length === 0}
                >
                  Temizle
                </Button>
              </Space>
            }
          >
            {scanHistory.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">
                    Henüz tarama yapılmadı. Barkod okuyucunuzu hazırlayın ve taramaya başlayın.
                  </span>
                }
              />
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
                      <Text copyable className="font-mono text-slate-700">{barcode}</Text>
                    ),
                  },
                  {
                    title: 'Adet',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 120,
                    render: (quantity: number, record: ScanHistoryItem) => (
                      <InputNumber
                        min={1}
                        max={9999}
                        value={quantity}
                        size="small"
                        onChange={(val) => handleUpdateQuantity(record.id, val || 1)}
                        className="!w-20"
                      />
                    ),
                  },
                  {
                    title: 'Durum',
                    key: 'status',
                    width: 120,
                    render: (_, record: ScanHistoryItem) =>
                      record.lookupResult.found ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          {record.lookupResult.matchType}
                        </Tag>
                      ) : (
                        <Tag color="red" icon={<CloseCircleOutlined />}>
                          Bulunamadı
                        </Tag>
                      ),
                  },
                  {
                    title: 'Ürün / Kayıt',
                    key: 'item',
                    ellipsis: true,
                    render: (_, record: ScanHistoryItem) => {
                      const r = record.lookupResult;
                      if (!r.found) return <Text type="secondary">-</Text>;
                      if (r.product) return <Text strong>{r.product.name}</Text>;
                      if (r.variant) return <Text>{r.variant.variantName}</Text>;
                      if (r.serialNumber) return <Text className="font-mono">{r.serialNumber.serialNumber}</Text>;
                      if (r.lotBatch) return <Text className="font-mono">{r.lotBatch.lotNumber}</Text>;
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
                          <Text className="text-slate-900 font-semibold">
                            {total.toLocaleString('tr-TR', { style: 'currency', currency: product.unitPriceCurrency || 'TRY' })}
                          </Text>
                          {record.quantity > 1 && (
                            <Text type="secondary" className="block text-xs">
                              {record.quantity}x {product.unitPrice.toLocaleString('tr-TR')}
                            </Text>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    title: '',
                    key: 'actions',
                    width: 100,
                    render: (_, record: ScanHistoryItem) => (
                      <Space size="small">
                        <Tooltip title="Tekrar Ara">
                          <Button
                            type="text"
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={() => setLastScannedBarcode(record.barcode)}
                          />
                        </Tooltip>
                        <Tooltip title="Sil">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveFromHistory(record.id)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'generator',
      label: (
        <Space>
          <BarcodeOutlined />
          Barkod Oluşturucu
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Barkod Oluştur">
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
                      <Select.Option key={value} value={value}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="width" label="Genişlik (px)" initialValue={300}>
                      <InputNumber min={100} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="height" label="Yükseklik (px)" initialValue={100}>
                      <InputNumber min={50} max={500} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="includeText" valuePropName="checked" initialValue={true}>
                  <Checkbox>Barkod metnini göster</Checkbox>
                </Form.Item>

                <Button
                  type="primary"
                  icon={<BarcodeOutlined />}
                  onClick={handleGenerateBarcode}
                  loading={generateBarcode.isPending}
                  block
                >
                  Barkod Oluştur
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Önizleme">
              {generatedBarcodeImage ? (
                <div className="text-center">
                  <Image
                    src={`data:image/png;base64,${generatedBarcodeImage}`}
                    alt="Generated Barcode"
                    style={{ maxWidth: '100%', maxHeight: 300 }}
                  />
                  <Divider />
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => downloadImage(generatedBarcodeImage, 'barcode.png')}
                    >
                      İndir
                    </Button>
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generateForm.getFieldValue('content'))}
                    >
                      Kopyala
                    </Button>
                  </Space>
                </div>
              ) : (
                <Empty description="Barkod oluşturun" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'labels',
      label: (
        <Space>
          <TagsOutlined />
          Ürün Etiketi
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Ürün Etiketi Oluştur">
              <Form form={labelForm} layout="vertical">
                <Form.Item
                  name="productId"
                  label="Ürün"
                  rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
                >
                  <Select
                    placeholder="Ürün seçin"
                    showSearch
                    optionFilterProp="children"
                    onChange={setSelectedProductForLabel}
                  >
                    {products.map((p) => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="labelSize" label="Etiket Boyutu" initialValue="Medium">
                      <Select>
                        {Object.entries(sizeLabels).map(([value, label]) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="barcodeFormat" label="Barkod Formatı" initialValue="Code128">
                      <Select>
                        {Object.entries(formatLabels).map(([value, label]) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="includeProductName" valuePropName="checked" initialValue={true}>
                      <Checkbox>Ürün adını göster</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="includePrice" valuePropName="checked" initialValue={true}>
                      <Checkbox>Fiyatı göster</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="includeSKU" valuePropName="checked" initialValue={false}>
                      <Checkbox>SKU göster</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="includeQRCode" valuePropName="checked" initialValue={false}>
                      <Checkbox>QR Kod ekle</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  icon={<TagsOutlined />}
                  onClick={handleGenerateProductLabel}
                  loading={generateProductLabel.isPending}
                  block
                >
                  Etiket Oluştur
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Önizleme">
              {generatedLabelImage ? (
                <div className="text-center">
                  <Image
                    src={`data:image/png;base64,${generatedLabelImage}`}
                    alt="Generated Label"
                    style={{ maxWidth: '100%', maxHeight: 300, border: '1px solid #f0f0f0' }}
                  />
                  <Divider />
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => downloadImage(generatedLabelImage, 'product-label.png')}
                    >
                      İndir
                    </Button>
                    <Button icon={<PrinterOutlined />}>Yazdır</Button>
                  </Space>
                </div>
              ) : (
                <Empty description="Etiket oluşturun" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'bulk',
      label: (
        <Space>
          <PrinterOutlined />
          Toplu Etiket
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title="Ürün Listesi"
              extra={
                <Select
                  placeholder="Ürün ekle"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: 250 }}
                  value={undefined}
                  onChange={handleAddProductToBulk}
                >
                  {products
                    .filter((p) => !bulkProducts.some((bp) => bp.productId === p.id))
                    .map((p) => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </Select.Option>
                    ))}
                </Select>
              }
            >
              {bulkProducts.length === 0 ? (
                <Empty description="Etiket yazdırmak için ürün ekleyin" />
              ) : (
                <Table
                  dataSource={bulkProducts}
                  rowKey="productId"
                  pagination={false}
                  columns={[
                    {
                      title: 'Ürün',
                      dataIndex: 'productName',
                      key: 'name',
                    },
                    {
                      title: 'Etiket Adedi',
                      key: 'quantity',
                      width: 150,
                      render: (_, record) => (
                        <InputNumber
                          min={1}
                          max={100}
                          value={record.quantity}
                          onChange={(val) =>
                            handleBulkQuantityChange(record.productId, val || 1)
                          }
                        />
                      ),
                    },
                    {
                      title: '',
                      key: 'action',
                      width: 80,
                      render: (_, record) => (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveProductFromBulk(record.productId)}
                        />
                      ),
                    },
                  ]}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <Text strong>Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong>
                          {bulkProducts.reduce((sum, p) => sum + p.quantity, 0)} etiket
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  )}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Etiket Ayarları">
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <Text type="secondary">Etiket Boyutu</Text>
                  <Select
                    value={bulkLabelSize}
                    onChange={setBulkLabelSize}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    {Object.entries(sizeLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Text type="secondary">Barkod Formatı</Text>
                  <Select
                    value={bulkBarcodeFormat}
                    onChange={setBulkBarcodeFormat}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    {Object.entries(formatLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <Divider />

                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleGenerateBulkLabels}
                  loading={generateBulkLabels.isPending}
                  block
                  disabled={bulkProducts.length === 0}
                >
                  Etiketleri İndir (ZIP)
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'autogen',
      label: (
        <Space>
          <QrcodeOutlined />
          Otomatik Barkod
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Otomatik Barkod Oluştur">
              <Alert
                type="info"
                showIcon
                className="mb-4"
                message="Otomatik Barkod"
                description="Seçilen formata uygun, benzersiz bir barkod numarası oluşturur. EAN-13 formatı için geçerli checksum hesaplanır."
              />

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

                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={handleAutoGenerate}
                  loading={autoGenerateBarcode.isPending}
                  block
                >
                  Barkod Oluştur
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Sonuç">
              {autoGenResult ? (
                <div className="text-center">
                  <Alert
                    type="success"
                    showIcon
                    message="Barkod Oluşturuldu"
                    description={
                      <div className="mt-2">
                        <Text strong className="text-2xl block mb-2">{autoGenResult.barcode}</Text>
                        {autoGenResult.saved ? (
                          <Tag color="green">Ürüne kaydedildi</Tag>
                        ) : (
                          <Tag color="blue">Sadece oluşturuldu</Tag>
                        )}
                      </div>
                    }
                  />
                  <Divider />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(autoGenResult.barcode)}
                  >
                    Kopyala
                  </Button>
                </div>
              ) : (
                <Empty description="Barkod oluşturun" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'validate',
      label: (
        <Space>
          <CheckCircleOutlined />
          Doğrulama
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Barkod Doğrulama">
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <Text type="secondary">Barkod</Text>
                  <Input
                    placeholder="Doğrulanacak barkod"
                    value={validationBarcode}
                    onChange={(e) => setValidationBarcode(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                </div>

                <div>
                  <Text type="secondary">Format</Text>
                  <Select
                    value={validationFormat}
                    onChange={setValidationFormat}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    {Object.entries(formatLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <Divider />

                <Space wrap>
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={handleValidateBarcode}
                    loading={validateBarcode.isPending}
                  >
                    Format Doğrula
                  </Button>
                  <Button
                    icon={<SearchOutlined />}
                    onClick={handleCheckUnique}
                    loading={checkBarcodeUnique.isPending}
                  >
                    Benzersizlik Kontrol
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Barkod Formatları">
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
                        <Tag color="blue">1D (Linear)</Tag>
                      ),
                  },
                  {
                    title: 'Açıklama',
                    key: 'desc',
                    render: (_, record) => {
                      const descriptions: Record<string, string> = {
                        EAN13: 'Uluslararası ürün barkodu (13 hane)',
                        EAN8: 'Küçük ürünler için (8 hane)',
                        UPC_A: 'ABD ürün barkodu (12 hane)',
                        UPC_E: 'Kompakt ABD barkodu (6 hane)',
                        Code128: 'Yüksek yoğunluklu alfanümerik',
                        Code39: 'Yaygın endüstriyel barkod',
                        QRCode: '2D matris, URL ve metin için',
                        DataMatrix: 'Küçük 2D matris',
                        PDF417: 'Yüksek kapasiteli 2D',
                        ITF14: 'Lojistik ve paletler için',
                      };
                      return descriptions[record.value] || '';
                    },
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Barkod Yönetimi</Title>
          <Text type="secondary">
            Barkod tarama, oluşturma, etiket yazdırma ve doğrulama işlemleri
          </Text>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Card>
    </div>
  );
}
