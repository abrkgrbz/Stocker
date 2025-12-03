'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Button,
  Space,
  Table,
  Card,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  message,
  Tag,
  Tooltip,
  Statistic,
  Tabs,
  Popconfirm,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useWarehouses,
  useAdjustStock,
  useStockMovements,
} from '@/lib/api/hooks/useInventory';
import type { ProductDto, StockAdjustmentDto, StockMovementDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Adjustment status for approval workflow (simulated in frontend for now)
type AdjustmentStatus = 'Pending' | 'Approved' | 'Rejected';

interface PendingAdjustment {
  id: string;
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentQuantity: number;
  newQuantity: number;
  difference: number;
  reason: string;
  notes?: string;
  status: AdjustmentStatus;
  createdAt: string;
  createdBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

const statusConfig: Record<AdjustmentStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'warning', label: 'Beklemede', icon: <ClockCircleOutlined /> },
  Approved: { color: 'success', label: 'Onaylandı', icon: <CheckCircleOutlined /> },
  Rejected: { color: 'error', label: 'Reddedildi', icon: <CloseOutlined /> },
};

const adjustmentReasons = [
  { value: 'counting_difference', label: 'Sayım Farkı' },
  { value: 'damage', label: 'Hasar/Kırık' },
  { value: 'expiry', label: 'Son Kullanma Tarihi Geçmiş' },
  { value: 'theft_loss', label: 'Hırsızlık/Kayıp' },
  { value: 'system_error', label: 'Sistem Hatası Düzeltme' },
  { value: 'return', label: 'İade Düzeltmesi' },
  { value: 'bonus', label: 'Promosyon/Bonus' },
  { value: 'other', label: 'Diğer' },
];

export default function StockAdjustmentsPage() {
  const [form] = Form.useForm();

  // State
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<PendingAdjustment | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Simulated pending adjustments (in real app, these would come from backend)
  const [pendingAdjustments, setPendingAdjustments] = useState<PendingAdjustment[]>([]);

  // API Hooks
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts(true);
  const { data: warehouses = [] } = useWarehouses();
  const adjustStock = useAdjustStock();
  const { data: stockMovements = [], isLoading: movementsLoading } = useStockMovements();

  // Filter adjustment movements (AdjustmentIncrease and AdjustmentDecrease)
  const adjustmentMovements = useMemo(() => {
    return stockMovements.filter(
      (m: StockMovementDto) =>
        m.movementType === 'AdjustmentIncrease' || m.movementType === 'AdjustmentDecrease'
    );
  }, [stockMovements]);

  // Filter products for search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchText ||
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.code.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchText]);

  // Filter pending adjustments
  const filteredPendingAdjustments = useMemo(() => {
    return pendingAdjustments.filter((adj) => {
      const matchesSearch = !searchText ||
        adj.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        adj.productCode.toLowerCase().includes(searchText.toLowerCase());
      const matchesWarehouse = !selectedWarehouse || adj.warehouseId === selectedWarehouse;
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'pending' && adj.status === 'Pending') ||
        (activeTab === 'approved' && adj.status === 'Approved') ||
        (activeTab === 'rejected' && adj.status === 'Rejected');
      return matchesSearch && matchesWarehouse && matchesTab;
    });
  }, [pendingAdjustments, searchText, selectedWarehouse, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const pending = pendingAdjustments.filter((a) => a.status === 'Pending').length;
    const approved = pendingAdjustments.filter((a) => a.status === 'Approved').length;
    const rejected = pendingAdjustments.filter((a) => a.status === 'Rejected').length;
    const totalIncrease = pendingAdjustments
      .filter((a) => a.status === 'Approved' && a.difference > 0)
      .reduce((sum, a) => sum + a.difference, 0);
    const totalDecrease = pendingAdjustments
      .filter((a) => a.status === 'Approved' && a.difference < 0)
      .reduce((sum, a) => sum + Math.abs(a.difference), 0);

    return { pending, approved, rejected, totalIncrease, totalDecrease };
  }, [pendingAdjustments]);

  // Handlers
  const handleCreateAdjustment = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleSubmitAdjustment = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);
      const warehouse = warehouses.find((w) => w.id === values.warehouseId);

      if (!product || !warehouse) {
        message.error('Ürün veya depo bulunamadı');
        return;
      }

      const currentQty = product.totalStockQuantity;
      const difference = values.newQuantity - currentQty;

      // Create pending adjustment
      const newAdjustment: PendingAdjustment = {
        id: `adj_${Date.now()}`,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        currentQuantity: currentQty,
        newQuantity: values.newQuantity,
        difference,
        reason: values.reason,
        notes: values.notes,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        createdBy: 'Kullanıcı', // Would come from auth context
      };

      setPendingAdjustments((prev) => [newAdjustment, ...prev]);
      setCreateModalOpen(false);
      message.success('Stok düzeltme talebi oluşturuldu ve onay bekliyor');
    } catch {
      message.error('Form doğrulama hatası');
    }
  };

  const handleDirectAdjustment = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);

      if (!product) {
        message.error('Ürün bulunamadı');
        return;
      }

      const adjustmentData: StockAdjustmentDto = {
        productId: values.productId,
        warehouseId: values.warehouseId,
        newQuantity: values.newQuantity,
        reason: values.reason,
        notes: values.notes,
      };

      await adjustStock.mutateAsync(adjustmentData);
      setCreateModalOpen(false);
      refetchProducts();
      message.success('Stok düzeltmesi başarıyla uygulandı');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReviewClick = (adjustment: PendingAdjustment) => {
    setSelectedAdjustment(adjustment);
    setReviewNotes('');
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedAdjustment) return;

    try {
      // Apply the adjustment via API
      const adjustmentData: StockAdjustmentDto = {
        productId: selectedAdjustment.productId,
        warehouseId: selectedAdjustment.warehouseId,
        newQuantity: selectedAdjustment.newQuantity,
        reason: selectedAdjustment.reason,
        notes: `${selectedAdjustment.notes || ''}\n[Onay Notu: ${reviewNotes}]`,
      };

      await adjustStock.mutateAsync(adjustmentData);

      // Update local state
      setPendingAdjustments((prev) =>
        prev.map((adj) =>
          adj.id === selectedAdjustment.id
            ? {
                ...adj,
                status: 'Approved' as AdjustmentStatus,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Onaylayan',
                reviewNotes,
              }
            : adj
        )
      );

      setReviewModalOpen(false);
      refetchProducts();
      message.success('Stok düzeltmesi onaylandı ve uygulandı');
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = () => {
    if (!selectedAdjustment) return;

    if (!reviewNotes.trim()) {
      message.warning('Reddetme sebebi girmelisiniz');
      return;
    }

    setPendingAdjustments((prev) =>
      prev.map((adj) =>
        adj.id === selectedAdjustment.id
          ? {
              ...adj,
              status: 'Rejected' as AdjustmentStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Reddeden',
              reviewNotes,
            }
          : adj
      )
    );

    setReviewModalOpen(false);
    message.info('Stok düzeltme talebi reddedildi');
  };

  const handleDeletePending = (id: string) => {
    setPendingAdjustments((prev) => prev.filter((adj) => adj.id !== id));
    message.success('Talep silindi');
  };

  // Pending adjustments columns
  const pendingColumns: ColumnsType<PendingAdjustment> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Text type="secondary" className="text-xs">{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Mevcut Miktar',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      align: 'right',
      render: (qty) => qty.toLocaleString('tr-TR'),
    },
    {
      title: 'Yeni Miktar',
      dataIndex: 'newQuantity',
      key: 'newQuantity',
      align: 'right',
      render: (qty) => qty.toLocaleString('tr-TR'),
    },
    {
      title: 'Fark',
      dataIndex: 'difference',
      key: 'difference',
      align: 'right',
      render: (diff) => (
        <span className={diff > 0 ? 'text-green-600 font-medium' : diff < 0 ? 'text-red-600 font-medium' : ''}>
          {diff > 0 ? '+' : ''}{diff.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => {
        const reasonInfo = adjustmentReasons.find((r) => r.value === reason);
        return reasonInfo?.label || reason;
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: AdjustmentStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.status === 'Pending' && (
            <>
              <Tooltip title="İncele ve Onayla/Reddet">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleReviewClick(record)}
                />
              </Tooltip>
              <Popconfirm
                title="Bu talebi silmek istediğinizden emin misiniz?"
                onConfirm={() => handleDeletePending(record.id)}
                okText="Sil"
                cancelText="İptal"
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
          {record.status !== 'Pending' && (
            <Tooltip title="Detay">
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleReviewClick(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // History columns (from stock movements)
  const historyColumns: ColumnsType<StockMovementDto> = [
    {
      title: 'Tarih',
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Text type="secondary" className="text-xs">{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Tür',
      dataIndex: 'movementType',
      key: 'movementType',
      render: (type) => (
        <Tag color={type === 'AdjustmentIncrease' ? 'success' : 'error'}>
          {type === 'AdjustmentIncrease' ? 'Artış' : 'Azalış'}
        </Tag>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (qty, record) => (
        <span className={record.movementType === 'AdjustmentIncrease' ? 'text-green-600' : 'text-red-600'}>
          {record.movementType === 'AdjustmentIncrease' ? '+' : '-'}{qty.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Stok Düzeltme</Title>
          <Text type="secondary">Stok miktarlarını düzeltin ve onay süreçlerini yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetchProducts()} loading={productsLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAdjustment}>
            Yeni Düzeltme
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Bekleyen Talepler"
              value={stats.pending}
              prefix={<ClockCircleOutlined className="text-yellow-500" />}
              valueStyle={stats.pending > 0 ? { color: '#faad14' } : undefined}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Onaylanan"
              value={stats.approved}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Reddedilen"
              value={stats.rejected}
              prefix={<CloseOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Artış"
              value={stats.totalIncrease}
              prefix={<PlusCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Azalış"
              value={stats.totalDecrease}
              prefix={<MinusCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Ürün adı veya kodu ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Depo Seçin"
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                Bekleyen ({stats.pending})
              </span>
            }
            key="pending"
          />
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                Onaylanan ({stats.approved})
              </span>
            }
            key="approved"
          />
          <TabPane
            tab={
              <span>
                <CloseOutlined />
                Reddedilen ({stats.rejected})
              </span>
            }
            key="rejected"
          />
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Geçmiş
              </span>
            }
            key="history"
          />
        </Tabs>

        {activeTab !== 'history' ? (
          <Table
            columns={pendingColumns}
            dataSource={filteredPendingAdjustments}
            rowKey="id"
            loading={productsLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
          />
        ) : (
          <Table
            columns={historyColumns}
            dataSource={adjustmentMovements}
            rowKey="id"
            loading={movementsLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
          />
        )}
      </Card>

      {/* Create Adjustment Modal */}
      <Modal
        title="Yeni Stok Düzeltme"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateModalOpen(false)}>
            İptal
          </Button>,
          <Button key="submit" type="default" onClick={handleSubmitAdjustment}>
            Onaya Gönder
          </Button>,
          <Button key="direct" type="primary" onClick={handleDirectAdjustment} loading={adjustStock.isPending}>
            Direkt Uygula
          </Button>,
        ]}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün seçiniz' }]}
              >
                <Select
                  showSearch
                  placeholder="Ürün ara ve seç"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={filteredProducts.map((p) => ({
                    value: p.id,
                    label: `${p.code} - ${p.name}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="warehouseId"
                label="Depo"
                rules={[{ required: true, message: 'Depo seçiniz' }]}
              >
                <Select
                  placeholder="Depo seçin"
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.productId !== cur.productId}>
            {({ getFieldValue }) => {
              const productId = getFieldValue('productId');
              const product = products.find((p) => p.id === productId);
              if (!product) return null;

              return (
                <Card size="small" className="mb-4" style={{ backgroundColor: '#f6f8fa' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text type="secondary">Mevcut Stok:</Text>
                      <div className="font-semibold text-lg">{product.totalStockQuantity}</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">Kullanılabilir:</Text>
                      <div className="font-semibold text-lg">{product.availableStockQuantity}</div>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">Min. Seviye:</Text>
                      <div className="font-semibold text-lg">{product.minStockLevel}</div>
                    </Col>
                  </Row>
                </Card>
              );
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="newQuantity"
                label="Yeni Miktar"
                rules={[
                  { required: true, message: 'Yeni miktar giriniz' },
                  { type: 'number', min: 0, message: 'Miktar 0 veya daha büyük olmalı' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Yeni stok miktarını girin"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reason"
                label="Düzeltme Sebebi"
                rules={[{ required: true, message: 'Sebep seçiniz' }]}
              >
                <Select
                  placeholder="Sebep seçin"
                  options={adjustmentReasons}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notlar">
            <TextArea rows={3} placeholder="Ek açıklama veya not ekleyin..." />
          </Form.Item>

          <div style={{ padding: 12, backgroundColor: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
            <Space>
              <WarningOutlined className="text-yellow-600" />
              <Text>
                <strong>Onaya Gönder:</strong> Düzeltme talebi oluşturulur ve onay bekler.<br />
                <strong>Direkt Uygula:</strong> Düzeltme anında sisteme uygulanır.
              </Text>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={selectedAdjustment?.status === 'Pending' ? 'Düzeltme Talebini İncele' : 'Düzeltme Detayı'}
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={
          selectedAdjustment?.status === 'Pending'
            ? [
                <Button key="cancel" onClick={() => setReviewModalOpen(false)}>
                  İptal
                </Button>,
                <Button key="reject" danger onClick={handleReject}>
                  Reddet
                </Button>,
                <Button key="approve" type="primary" onClick={handleApprove} loading={adjustStock.isPending}>
                  Onayla ve Uygula
                </Button>,
              ]
            : [
                <Button key="close" type="primary" onClick={() => setReviewModalOpen(false)}>
                  Kapat
                </Button>,
              ]
        }
        width={600}
      >
        {selectedAdjustment && (
          <>
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Ürün:</Text>
                  <div className="font-semibold">{selectedAdjustment.productName}</div>
                  <Text type="secondary" className="text-xs">{selectedAdjustment.productCode}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Depo:</Text>
                  <div className="font-semibold">{selectedAdjustment.warehouseName}</div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary">Mevcut Miktar:</Text>
                  <div className="font-semibold text-lg">{selectedAdjustment.currentQuantity}</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Yeni Miktar:</Text>
                  <div className="font-semibold text-lg">{selectedAdjustment.newQuantity}</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Fark:</Text>
                  <div
                    className={`font-semibold text-lg ${
                      selectedAdjustment.difference > 0
                        ? 'text-green-600'
                        : selectedAdjustment.difference < 0
                        ? 'text-red-600'
                        : ''
                    }`}
                  >
                    {selectedAdjustment.difference > 0 ? '+' : ''}
                    {selectedAdjustment.difference}
                  </div>
                </Col>
              </Row>

              <div>
                <Text type="secondary">Sebep:</Text>
                <div className="font-semibold">
                  {adjustmentReasons.find((r) => r.value === selectedAdjustment.reason)?.label ||
                    selectedAdjustment.reason}
                </div>
              </div>

              {selectedAdjustment.notes && (
                <div>
                  <Text type="secondary">Notlar:</Text>
                  <div>{selectedAdjustment.notes}</div>
                </div>
              )}

              <div>
                <Text type="secondary">Oluşturulma:</Text>
                <div>
                  {dayjs(selectedAdjustment.createdAt).format('DD.MM.YYYY HH:mm')} - {selectedAdjustment.createdBy}
                </div>
              </div>

              {selectedAdjustment.reviewedAt && (
                <div>
                  <Text type="secondary">
                    {selectedAdjustment.status === 'Approved' ? 'Onaylanma:' : 'Reddedilme:'}
                  </Text>
                  <div>
                    {dayjs(selectedAdjustment.reviewedAt).format('DD.MM.YYYY HH:mm')} - {selectedAdjustment.reviewedBy}
                  </div>
                  {selectedAdjustment.reviewNotes && (
                    <div className="mt-1 text-gray-600">{selectedAdjustment.reviewNotes}</div>
                  )}
                </div>
              )}
            </div>

            {selectedAdjustment.status === 'Pending' && (
              <div className="mt-4">
                <Text type="secondary">İnceleme Notu:</Text>
                <TextArea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Onay veya red sebebini yazın..."
                  className="mt-1"
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
