'use client';

/**
 * Barcode Management Page - Pro Scanner
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Table,
  Input,
  Select,
  Form,
  Tabs,
  Empty,
  Spin,
  InputNumber,
  Checkbox,
  Tooltip,
  message,
  Descriptions,
  Button,
  Space,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  SpeakerWaveIcon,
  TagIcon,
  TrashIcon,
  ViewfinderCircleIcon,
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

const { TextArea } = Input;

// Audio Feedback System
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
      // Audio not supported
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

interface ScanHistoryItem {
  id: string;
  barcode: string;
  quantity: number;
  lookupResult: BarcodeLookupResponse;
  firstScannedAt: Date;
  lastScannedAt: Date;
}

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

const sizeLabels: Record<string, string> = {
  Small: 'Kucuk (30x20mm)',
  Medium: 'Orta (50x30mm)',
  Large: 'Buyuk (70x40mm)',
  Wide: 'Genis (100x30mm)',
  Square: 'Kare (50x50mm)',
  Custom: 'Ozel',
};

export default function BarcodesPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('scanner');
  const [scanInput, setScanInput] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalScannedItems, setTotalScannedItems] = useState(0);

  const scanInputRef = useRef<any>(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const SCANNER_SPEED_THRESHOLD = 50;

  const { playSuccess, playError, playQuantityIncrement } = useAudioFeedback();

  const [generateForm] = Form.useForm();
  const [generatedBarcodeImage, setGeneratedBarcodeImage] = useState<string | null>(null);

  const [labelForm] = Form.useForm();
  const [generatedLabelImage, setGeneratedLabelImage] = useState<string | null>(null);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<number | undefined>();

  const [bulkProducts, setBulkProducts] = useState<Array<BulkLabelProductItem & { productName?: string }>>([]);
  const [bulkLabelSize, setBulkLabelSize] = useState<string>('Medium');
  const [bulkBarcodeFormat, setBulkBarcodeFormat] = useState<string>('Code128');

  const [autoGenForm] = Form.useForm();
  const [autoGenResult, setAutoGenResult] = useState<{ barcode: string; saved: boolean } | null>(null);

  const [validationBarcode, setValidationBarcode] = useState('');
  const [validationFormat, setValidationFormat] = useState<string>('Code128');

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();

  const { data: lookupResult, isLoading: isLookingUp } = useBarcodeLookup(
    lastScannedBarcode,
    true,
    selectedWarehouse,
    !!lastScannedBarcode
  );

  const generateBarcode = useGenerateBarcode();
  const generateProductLabel = useGenerateProductLabel();
  const generateBulkLabels = useGenerateBulkLabels();
  const autoGenerateBarcode = useAutoGenerateBarcode();
  const validateBarcode = useValidateBarcode();
  const checkBarcodeUnique = useCheckBarcodeUnique();

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
      // Validation error
    }
  };

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
      // Validation error
    }
  };

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
      message.warning('En az bir urun ekleyin');
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
      // Error handled
    }
  };

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
      // Error handled
    }
  };

  const handleValidateBarcode = async () => {
    if (!validationBarcode) return;

    try {
      const result = await validateBarcode.mutateAsync({
        barcode: validationBarcode,
        format: validationFormat as BarcodeFormat,
      });

      if (result.isValid) {
        message.success('Barkod formati gecerli');
      } else {
        message.error(result.errorMessage || 'Barkod formati gecersiz');
      }
    } catch (error) {
      // Error handled
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
        message.warning(`Barkod zaten kullaniliyor: ${result.conflictingProductCode}`);
      }
    } catch (error) {
      // Error handled
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Kopyalandi');
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderLookupResult = () => {
    if (isLookingUp) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spin size="large" />
          <span className="mt-3 text-sm text-slate-500">Araniyor...</span>
        </div>
      );
    }

    if (!lookupResult) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ViewfinderCircleIcon className="w-6 h-6 text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-900">Barkod Tarayin</span>
          <span className="text-xs text-slate-500 mt-1">Hardware scanner veya manuel giris</span>
        </div>
      );
    }

    if (!lookupResult.found) {
      return (
        <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
            <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-sm font-medium text-slate-900 mb-1">Barkod Bulunamadi</div>
          <div className="text-xs text-slate-500 font-mono mb-3">{lookupResult.searchedBarcode}</div>
          <button
            onClick={() => router.push('/inventory/products/new')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Urun Ekle
          </button>
        </div>
      );
    }

    if (lookupResult.matchType === 'Product' && lookupResult.product) {
      const p = lookupResult.product;
      const stockPercentage = p.totalStockQuantity > 0
        ? Math.min(100, (p.availableStockQuantity / p.totalStockQuantity) * 100)
        : 0;

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Urun Bulundu</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
              {lookupResult.matchType}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              {p.primaryImageUrl ? (
                <Image src={p.primaryImageUrl} alt={p.name} width={56} height={56} className="object-cover rounded" />
              ) : (
                <ShoppingBagIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">Kod: {p.code}</span>
                {p.sku && <span className="text-xs text-slate-500">- SKU: {p.sku}</span>}
              </div>
              {p.categoryName && (
                <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-slate-100 text-slate-600">
                  {p.categoryName}
                </span>
              )}
            </div>
          </div>

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
                <span className={`text-lg font-semibold ${p.availableStockQuantity <= 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                  {p.availableStockQuantity}
                </span>
                <span className="text-xs text-slate-500">/ {p.totalStockQuantity}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2">
                <div
                  className="h-full rounded-full bg-slate-600"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {p.stockByWarehouse && p.stockByWarehouse.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Depo Bazli Stok</div>
              <div className="space-y-2">
                {p.stockByWarehouse.map((w) => (
                  <div key={w.warehouseId} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{w.warehouseName}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{w.availableQuantity}</span>
                      {w.reservedQuantity > 0 && (
                        <span className="text-xs text-slate-500">({w.reservedQuantity} rezerve)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => router.push(`/inventory/products/${p.id}`)}
              className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
            >
              Detaya Git
            </button>
          </div>
        </div>
      );
    }

    if (lookupResult.matchType === 'ProductVariant' && lookupResult.variant) {
      const v = lookupResult.variant;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Varyant Bulundu</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
              {lookupResult.matchType}
            </span>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Urun">{v.productName}</Descriptions.Item>
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

    if (lookupResult.matchType === 'SerialNumber' && lookupResult.serialNumber) {
      const s = lookupResult.serialNumber;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Seri Numarasi Bulundu</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
              {lookupResult.matchType}
            </span>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Seri No">{s.serialNumber}</Descriptions.Item>
            <Descriptions.Item label="Urun">{s.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                {s.status}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Depo">{s.warehouseName || '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    if (lookupResult.matchType === 'LotBatch' && lookupResult.lotBatch) {
      const l = lookupResult.lotBatch;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Parti/Lot Bulundu</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
              {lookupResult.matchType}
            </span>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Lot No">{l.lotNumber}</Descriptions.Item>
            <Descriptions.Item label="Urun">{l.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                {l.status}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Miktar">{l.quantity}</Descriptions.Item>
            <Descriptions.Item label="Mevcut">{l.availableQuantity}</Descriptions.Item>
            <Descriptions.Item label="SKT">
              {l.expiryDate ? dayjs(l.expiryDate).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    return null;
  };

  const tabItems = [
    {
      key: 'scanner',
      label: (
        <span className="flex items-center gap-2">
          <ViewfinderCircleIcon className="w-4 h-4" />
          Pro Tarayici
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ViewfinderCircleIcon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalScannedItems}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tarama</div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <QrCodeIcon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{historyStats.uniqueItems}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Benzersiz</div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{historyStats.foundItems}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bulunan</div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <XCircleIcon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{historyStats.notFoundItems}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bulunamayan</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px]">
                <Input
                  ref={scanInputRef}
                  size="large"
                  placeholder={isScannerActive ? "Barkod tarayin veya girin..." : "Tarayici devre disi"}
                  prefix={<ViewfinderCircleIcon className="w-5 h-5 text-slate-400" />}
                  value={scanInput}
                  onChange={handleScanInputChange}
                  onKeyDown={handleScanKeyDown}
                  disabled={!isScannerActive}
                  className="!rounded-lg !border-slate-300"
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

              <Select
                placeholder="Tum Depolar"
                allowClear
                style={{ width: 160 }}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              >
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>
                    {w.name}
                  </Select.Option>
                ))}
              </Select>

              <Tooltip title={soundEnabled ? "Ses Acik" : "Ses Kapali"}>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-md transition-colors ${soundEnabled ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  <SpeakerWaveIcon className="w-5 h-5" />
                </button>
              </Tooltip>

              <button
                onClick={() => {
                  setIsScannerActive(!isScannerActive);
                  if (!isScannerActive) setTimeout(refocusScanner, 100);
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isScannerActive
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BoltIcon className="w-5 h-5" />
                {isScannerActive ? "Aktif" : "Durduruldu"}
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScannerActive ? 'bg-slate-900' : 'bg-slate-400'}`} />
                <span className="text-slate-500">{isScannerActive ? 'Taramaya hazir' : 'Beklemede'}</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl">
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

            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-4 py-3 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-900">Pro Tarayici Ipuclari</span>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Hardware scanner otomatik algilanir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Ayni barkod tarandiginda miktar artar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Ses acikken basari/hata bildirimi alirsiniz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Focus otomatik olarak korunur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Enter tusu ile hizli arama yapabilirsiniz</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">Tarama Gecmisi</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {historyStats.uniqueItems}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const data = scanHistory.map(item => `${item.barcode}\t${item.quantity}`).join('\n');
                    navigator.clipboard.writeText(data);
                    message.success('Gecmis kopyalandi');
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
                    <ClockIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-500">Henuz tarama yapilmadi</span>
                </div>
              ) : (
                <Table
                  dataSource={scanHistory}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} kayit` }}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">
                            {record.lookupResult.matchType}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600">
                            Bulunamadi
                          </span>
                        ),
                    },
                    {
                      title: 'Urun',
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
                          <button
                            onClick={() => setLastScannedBarcode(record.barcode)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromHistory(record.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
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
          <QrCodeIcon className="w-4 h-4" />
          Barkod Olusturucu
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Barkod Olustur</h3>
            </div>
            <Form form={generateForm} layout="vertical">
              <Form.Item
                name="content"
                label="Barkod Icerigi"
                rules={[{ required: true, message: 'Barkod icerigi gerekli' }]}
              >
                <Input placeholder="Barkod numarasi veya metin" className="!rounded-lg !border-slate-300" />
              </Form.Item>

              <Form.Item name="format" label="Barkod Formati" initialValue="Code128">
                <Select className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg">
                  {Object.entries(formatLabels).map(([value, label]) => (
                    <Select.Option key={value} value={value}>{label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="width" label="Genislik (px)" initialValue={300}>
                  <InputNumber min={100} max={1000} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="height" label="Yukseklik (px)" initialValue={100}>
                  <InputNumber min={50} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </div>

              <Form.Item name="includeText" valuePropName="checked" initialValue={true}>
                <Checkbox>Barkod metnini goster</Checkbox>
              </Form.Item>

              <Button
                type="primary"
                onClick={handleGenerateBarcode}
                loading={generateBarcode.isPending}
                icon={<QrCodeIcon className="w-4 h-4" />}
                className="w-full !bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Barkod Olustur
              </Button>
            </Form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Onizleme</h3>
            </div>
            {generatedBarcodeImage ? (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${generatedBarcodeImage}`}
                  alt="Generated Barcode"
                  className="max-w-full max-h-64 mx-auto border border-slate-200 rounded"
                />
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button
                    onClick={() => downloadImage(generatedBarcodeImage, 'barcode.png')}
                    icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    className="!border-slate-300 !text-slate-700"
                  >
                    Indir
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(generateForm.getFieldValue('content'))}
                    icon={<ClipboardDocumentIcon className="w-4 h-4" />}
                    className="!border-slate-300 !text-slate-700"
                  >
                    Kopyala
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <QrCodeIcon className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-sm text-slate-500">Barkod olusturun</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'labels',
      label: (
        <span className="flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          Urun Etiketi
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Urun Etiketi Olustur</h3>
            </div>
            <Form form={labelForm} layout="vertical">
              <Form.Item
                name="productId"
                label="Urun"
                rules={[{ required: true, message: 'Urun secimi gerekli' }]}
              >
                <Select
                  placeholder="Urun secin"
                  showSearch
                  optionFilterProp="children"
                  onChange={setSelectedProductForLabel}
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                >
                  {products.map((p) => (
                    <Select.Option key={p.id} value={p.id}>{p.code} - {p.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="labelSize" label="Etiket Boyutu" initialValue="Medium">
                  <Select className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg">
                    {Object.entries(sizeLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>{label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="barcodeFormat" label="Barkod Formati" initialValue="Code128">
                  <Select className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg">
                    {Object.entries(formatLabels).map(([value, label]) => (
                      <Select.Option key={value} value={value}>{label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="includeProductName" valuePropName="checked" initialValue={true}>
                  <Checkbox>Urun adini goster</Checkbox>
                </Form.Item>
                <Form.Item name="includePrice" valuePropName="checked" initialValue={true}>
                  <Checkbox>Fiyati goster</Checkbox>
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="includeSKU" valuePropName="checked" initialValue={false}>
                  <Checkbox>SKU goster</Checkbox>
                </Form.Item>
                <Form.Item name="includeQRCode" valuePropName="checked" initialValue={false}>
                  <Checkbox>QR Kod ekle</Checkbox>
                </Form.Item>
              </div>

              <Button
                type="primary"
                onClick={handleGenerateProductLabel}
                loading={generateProductLabel.isPending}
                icon={<TagIcon className="w-4 h-4" />}
                className="w-full !bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Etiket Olustur
              </Button>
            </Form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-900">Onizleme</h3>
            </div>
            {generatedLabelImage ? (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${generatedLabelImage}`}
                  alt="Generated Label"
                  className="max-w-full max-h-64 mx-auto border border-slate-200 rounded"
                />
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button
                    onClick={() => downloadImage(generatedLabelImage, 'product-label.png')}
                    icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    className="!border-slate-300 !text-slate-700"
                  >
                    Indir
                  </Button>
                  <Button
                    icon={<PrinterIcon className="w-4 h-4" />}
                    className="!border-slate-300 !text-slate-700"
                  >
                    Yazdir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <TagIcon className="w-6 h-6 text-slate-400" />
                </div>
                <span className="text-sm text-slate-500">Etiket olusturun</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Barkod Yonetimi</h1>
          <p className="text-slate-500 mt-1">Barkod tarama, olusturma ve etiket islemleri</p>
        </div>
        <Button
          icon={<ArrowPathIcon className="w-4 h-4" />}
          onClick={refocusScanner}
          className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
        >
          Yenile
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="[&_.ant-tabs-nav]:px-4 [&_.ant-tabs-content]:p-4"
        />
      </div>
    </div>
  );
}
