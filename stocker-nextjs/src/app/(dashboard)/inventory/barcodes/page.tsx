'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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

  // Scanner state
  const [scanInput, setScanInput] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState<BarcodeLookupResponse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const scanInputRef = useRef<any>(null);

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

  // Focus scanner input when switching to scanner tab
  useEffect(() => {
    if (activeTab === 'scanner' && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [activeTab]);

  // Add to history when lookup completes
  useEffect(() => {
    if (lookupResult && lastScannedBarcode) {
      setScanHistory((prev) => {
        // Don't add duplicates consecutively
        if (prev.length > 0 && prev[0].searchedBarcode === lookupResult.searchedBarcode) {
          return prev;
        }
        return [lookupResult, ...prev.slice(0, 9)]; // Keep last 10
      });
    }
  }, [lookupResult, lastScannedBarcode]);

  // Scanner handlers
  const handleScan = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && scanInput.trim()) {
        setLastScannedBarcode(scanInput.trim());
        setScanInput('');
      }
    },
    [scanInput]
  );

  const handleManualSearch = () => {
    if (scanInput.trim()) {
      setLastScannedBarcode(scanInput.trim());
      setScanInput('');
    }
  };

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

  // Render lookup result
  const renderLookupResult = () => {
    if (isLookingUp) {
      return (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-2">Aranıyor...</div>
        </div>
      );
    }

    if (!lookupResult) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Barkod tarayın veya arama yapın"
        />
      );
    }

    if (!lookupResult.found) {
      return (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Barkod Bulunamadı"
          description={`"${lookupResult.searchedBarcode}" barkodu sistemde bulunamadı.`}
        />
      );
    }

    if (lookupResult.matchType === 'Product' && lookupResult.product) {
      const p = lookupResult.product;
      return (
        <Card
          size="small"
          title={
            <Space>
              <InboxOutlined />
              <span>Ürün Bulundu</span>
              <Tag color="blue">{lookupResult.matchType}</Tag>
            </Space>
          }
          extra={
            <Button
              type="link"
              onClick={() => router.push(`/inventory/products/${p.id}`)}
            >
              Detay
            </Button>
          }
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Text strong className="text-lg">{p.name}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Kod:</Text> <Text>{p.code}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">SKU:</Text> <Text>{p.sku || '-'}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Kategori:</Text> <Text>{p.categoryName || '-'}</Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Birim Fiyat:</Text>{' '}
              <Text strong>
                {p.unitPrice?.toLocaleString('tr-TR', { style: 'currency', currency: p.unitPriceCurrency || 'TRY' })}
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Toplam Stok:</Text>{' '}
              <Text strong className={p.totalStockQuantity <= 0 ? 'text-red-500' : ''}>
                {p.totalStockQuantity}
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary">Mevcut Stok:</Text>{' '}
              <Text strong className="text-green-600">{p.availableStockQuantity}</Text>
            </Col>
          </Row>

          {p.stockByWarehouse && p.stockByWarehouse.length > 0 && (
            <>
              <Divider className="my-3" />
              <Text type="secondary" className="block mb-2">Depo Bazlı Stok:</Text>
              <Table
                dataSource={p.stockByWarehouse}
                rowKey="warehouseId"
                size="small"
                pagination={false}
                columns={[
                  { title: 'Depo', dataIndex: 'warehouseName', key: 'warehouse' },
                  { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', align: 'right' as const },
                  { title: 'Mevcut', dataIndex: 'availableQuantity', key: 'available', align: 'right' as const },
                  { title: 'Rezerve', dataIndex: 'reservedQuantity', key: 'reserved', align: 'right' as const },
                ]}
              />
            </>
          )}
        </Card>
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

  // Tab items
  const tabItems = [
    {
      key: 'scanner',
      label: (
        <Space>
          <ScanOutlined />
          Barkod Tarayıcı
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Scanner Input */}
          <Col xs={24} lg={12}>
            <Card title="Barkod Tara / Ara" className="h-full">
              <Space direction="vertical" className="w-full" size="middle">
                <Input
                  ref={scanInputRef}
                  size="large"
                  placeholder="Barkodu tarayın veya manuel girin..."
                  prefix={<ScanOutlined />}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={handleScan}
                  suffix={
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleManualSearch}>
                      Ara
                    </Button>
                  }
                />

                <Select
                  placeholder="Depo filtresi (opsiyonel)"
                  allowClear
                  style={{ width: '100%' }}
                  value={selectedWarehouse}
                  onChange={setSelectedWarehouse}
                >
                  {warehouses.map((w) => (
                    <Select.Option key={w.id} value={w.id}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>

                <Alert
                  type="info"
                  showIcon
                  message="Tarama İpucu"
                  description="Barkod okuyucuyu bu alana odaklayın ve tarama yapın. Enter tuşu otomatik arama başlatır."
                />
              </Space>
            </Card>
          </Col>

          {/* Lookup Result */}
          <Col xs={24} lg={12}>
            <Card title="Sonuç" className="h-full">
              {renderLookupResult()}
            </Card>
          </Col>

          {/* Scan History */}
          <Col span={24}>
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  Tarama Geçmişi
                  <Badge count={scanHistory.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              }
              extra={
                <Button size="small" onClick={() => setScanHistory([])}>
                  Temizle
                </Button>
              }
            >
              {scanHistory.length === 0 ? (
                <Empty description="Henüz tarama yapılmadı" />
              ) : (
                <Table
                  dataSource={scanHistory}
                  rowKey={(r, i) => `${r.searchedBarcode}-${i}`}
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Barkod',
                      dataIndex: 'searchedBarcode',
                      key: 'barcode',
                      render: (text: string) => (
                        <Space>
                          <Text copyable>{text}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: 'Sonuç',
                      key: 'result',
                      render: (_, record: BarcodeLookupResponse) =>
                        record.found ? (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            {record.matchType}
                          </Tag>
                        ) : (
                          <Tag color="red" icon={<CloseCircleOutlined />}>
                            Bulunamadı
                          </Tag>
                        ),
                    },
                    {
                      title: 'Ürün/Kayıt',
                      key: 'item',
                      render: (_, record: BarcodeLookupResponse) => {
                        if (!record.found) return '-';
                        if (record.product) return record.product.name;
                        if (record.variant) return record.variant.variantName;
                        if (record.serialNumber) return record.serialNumber.serialNumber;
                        if (record.lotBatch) return record.lotBatch.lotNumber;
                        return '-';
                      },
                    },
                    {
                      title: 'İşlem',
                      key: 'action',
                      render: (_, record: BarcodeLookupResponse) => (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => setLastScannedBarcode(record.searchedBarcode)}
                        >
                          Tekrar Ara
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </Col>
        </Row>
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
