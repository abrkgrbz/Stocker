'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Dropdown,
  Select,
  DatePicker,
  Progress,
  Form,
  Input,
  InputNumber,
  Tooltip,
  Alert,
  Tabs,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  useLotBatches,
  useLotBatch,
  useProducts,
  useSuppliers,
  useCreateLotBatch,
  useApproveLotBatch,
  useQuarantineLotBatch,
} from '@/lib/api/hooks/useInventory';
import type {
  LotBatchListDto,
  LotBatchDto,
  LotBatchStatus,
  LotBatchFilterDto,
  CreateLotBatchDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Lot batch status configuration
const statusConfig: Record<LotBatchStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'gold', label: 'Beklemede', icon: <ClockCircleOutlined /> },
  Received: { color: 'cyan', label: 'Teslim Alındı', icon: <InboxOutlined /> },
  Approved: { color: 'green', label: 'Onaylandı', icon: <CheckCircleOutlined /> },
  Quarantined: { color: 'orange', label: 'Karantinada', icon: <ExclamationCircleOutlined /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <CloseCircleOutlined /> },
  Exhausted: { color: 'default', label: 'Tükendi', icon: <DeleteOutlined /> },
  Expired: { color: 'volcano', label: 'Tarihi Geçti', icon: <WarningOutlined /> },
  Recalled: { color: 'magenta', label: 'Geri Çağrıldı', icon: <StopOutlined /> },
};

export default function LotBatchesPage() {
  const router = useRouter();

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<LotBatchStatus | undefined>();
  const [expiringWithinDays, setExpiringWithinDays] = useState<number | undefined>();
  const [expiredOnly, setExpiredOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [quarantineModalOpen, setQuarantineModalOpen] = useState(false);
  const [selectedLotBatchId, setSelectedLotBatchId] = useState<number | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [quarantineForm] = Form.useForm();

  // Build filter based on active tab and filters
  const filter: LotBatchFilterDto = useMemo(() => {
    const baseFilter: LotBatchFilterDto = {
      productId: selectedProduct,
    };

    switch (activeTab) {
      case 'pending':
        return { ...baseFilter, status: 'Pending' as LotBatchStatus };
      case 'quarantine':
        return { ...baseFilter, status: 'Quarantined' as LotBatchStatus };
      case 'expiring':
        return { ...baseFilter, expiringWithinDays: expiringWithinDays || 30 };
      case 'expired':
        return { ...baseFilter, expiredOnly: true };
      default:
        return { ...baseFilter, status: selectedStatus };
    }
  }, [activeTab, selectedProduct, selectedStatus, expiringWithinDays]);

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { data: lotBatches = [], isLoading, refetch } = useLotBatches(filter);
  const { data: selectedLotBatch } = useLotBatch(selectedLotBatchId || 0);

  const createLotBatch = useCreateLotBatch();
  const approveLotBatch = useApproveLotBatch();
  const quarantineLotBatch = useQuarantineLotBatch();

  // Calculate stats
  const allBatches = useMemo(() => {
    // For stats, we need all batches - this is a simplified approach
    // In production, you might want to fetch stats from a separate endpoint
    return lotBatches;
  }, [lotBatches]);

  const stats = useMemo(() => {
    const total = allBatches.length;
    const pending = allBatches.filter(b => b.status === 'Pending').length;
    const quarantined = allBatches.filter(b => b.isQuarantined).length;
    const expired = allBatches.filter(b => b.isExpired).length;
    const expiringSoon = allBatches.filter(b => b.daysUntilExpiry !== undefined && b.daysUntilExpiry <= 30 && b.daysUntilExpiry > 0).length;
    const totalQuantity = allBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
    const availableQuantity = allBatches.reduce((sum, b) => sum + b.availableQuantity, 0);

    return { total, pending, quarantined, expired, expiringSoon, totalQuantity, availableQuantity };
  }, [allBatches]);

  // Handlers
  const handleViewDetail = (id: number) => {
    setSelectedLotBatchId(id);
    setDetailModalOpen(true);
  };

  const handleApprove = async (lotBatch: LotBatchListDto) => {
    Modal.confirm({
      title: 'Lot/Parti Onayla',
      content: `"${lotBatch.lotNumber}" lot/partisini onaylamak istediğinizden emin misiniz?`,
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await approveLotBatch.mutateAsync(lotBatch.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleQuarantineClick = (lotBatch: LotBatchListDto) => {
    setSelectedLotBatchId(lotBatch.id);
    quarantineForm.resetFields();
    setQuarantineModalOpen(true);
  };

  const handleQuarantineConfirm = async () => {
    try {
      const values = await quarantineForm.validateFields();
      if (selectedLotBatchId) {
        await quarantineLotBatch.mutateAsync({
          id: selectedLotBatchId,
          request: { reason: values.reason },
        });
        setQuarantineModalOpen(false);
        quarantineForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const data: CreateLotBatchDto = {
        lotNumber: values.lotNumber,
        productId: values.productId,
        initialQuantity: values.initialQuantity,
        supplierId: values.supplierId,
        supplierLotNumber: values.supplierLotNumber,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
        certificateNumber: values.certificateNumber,
        notes: values.notes,
      };
      await createLotBatch.mutateAsync(data);
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  // Table columns
  const columns: ColumnsType<LotBatchListDto> = [
    {
      title: 'Lot Numarası',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 150,
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewDetail(record.id)}>
            {text}
          </Text>
          {record.isExpired && <Tag color="red" icon={<WarningOutlined />}>Süresi Doldu</Tag>}
          {record.isQuarantined && <Tag color="orange" icon={<ExclamationCircleOutlined />}>Karantinada</Tag>}
        </Space>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.productName}</Text>
          <Text type="secondary" className="text-xs">{record.productCode}</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: LotBatchStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>Mevcut: <Text strong>{record.currentQuantity.toLocaleString('tr-TR')}</Text></Text>
          <Text type="secondary" className="text-xs">
            Kullanılabilir: {record.availableQuantity.toLocaleString('tr-TR')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Son Kullanma Tarihi',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 160,
      render: (date: string | undefined, record) => {
        if (!date) return <Text type="secondary">-</Text>;

        const expiryDate = dayjs(date);
        const daysLeft = record.daysUntilExpiry;

        let color = 'default';
        if (record.isExpired) {
          color = 'red';
        } else if (daysLeft !== undefined) {
          if (daysLeft <= 7) color = 'red';
          else if (daysLeft <= 30) color = 'orange';
          else if (daysLeft <= 90) color = 'gold';
        }

        return (
          <Space direction="vertical" size={0}>
            <Text>{expiryDate.format('DD.MM.YYYY')}</Text>
            {daysLeft !== undefined && !record.isExpired && (
              <Tag color={color} className="text-xs">
                {daysLeft} gün kaldı
              </Tag>
            )}
            {record.isExpired && (
              <Tag color="red" className="text-xs">
                Süresi Doldu
              </Tag>
            )}
          </Space>
        );
      },
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
            icon: <EyeOutlined />,
            label: 'Detay',
            onClick: () => handleViewDetail(record.id),
          },
        ];

        if (record.status === 'Pending' || record.status === 'Received') {
          menuItems.push({
            key: 'approve',
            icon: <CheckCircleOutlined />,
            label: 'Onayla',
            onClick: () => handleApprove(record),
          });
        }

        if (record.status !== 'Quarantined' && record.status !== 'Exhausted' && record.status !== 'Expired') {
          menuItems.push({
            key: 'quarantine',
            icon: <ExclamationCircleOutlined />,
            label: 'Karantinaya Al',
            onClick: () => handleQuarantineClick(record),
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: 'all',
      label: (
        <Space>
          <InboxOutlined />
          Tüm Lotlar
          <Badge count={stats.total} showZero style={{ backgroundColor: '#1890ff' }} />
        </Space>
      ),
    },
    {
      key: 'pending',
      label: (
        <Space>
          <ClockCircleOutlined />
          Bekleyenler
          <Badge count={stats.pending} showZero style={{ backgroundColor: '#faad14' }} />
        </Space>
      ),
    },
    {
      key: 'quarantine',
      label: (
        <Space>
          <ExclamationCircleOutlined />
          Karantina
          <Badge count={stats.quarantined} showZero style={{ backgroundColor: '#fa8c16' }} />
        </Space>
      ),
    },
    {
      key: 'expiring',
      label: (
        <Space>
          <WarningOutlined />
          Süresi Yaklaşanlar
          <Badge count={stats.expiringSoon} showZero style={{ backgroundColor: '#faad14' }} />
        </Space>
      ),
    },
    {
      key: 'expired',
      label: (
        <Space>
          <StopOutlined />
          Süresi Dolanlar
          <Badge count={stats.expired} showZero style={{ backgroundColor: '#ff4d4f' }} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Lot/Parti Yönetimi</Title>
          <Text type="secondary">Ürün lotlarını ve partilerini yönetin, son kullanma tarihlerini takip edin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Yeni Lot/Parti
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Toplam Lot"
              value={stats.total}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Bekleyen"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Karantina"
              value={stats.quarantined}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Süresi Yaklaşan"
              value={stats.expiringSoon}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Süresi Dolan"
              value={stats.expired}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Toplam Miktar"
              value={stats.totalQuantity}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.expired > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message={`${stats.expired} adet lot/partinin son kullanma tarihi geçmiş durumda!`}
          description="Bu lotları kontrol edin ve gerekli aksiyonları alın."
        />
      )}
      {stats.expiringSoon > 0 && stats.expired === 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          message={`${stats.expiringSoon} adet lot/partinin son kullanma tarihi yaklaşıyor!`}
          description="30 gün içinde süresi dolacak lotları kontrol edin."
        />
      )}

      {/* Tabs and Filters */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-4"
        />

        {/* Filters */}
        <Space wrap className="mb-4">
          <Select
            placeholder="Ürün"
            allowClear
            style={{ width: 200 }}
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>

          {activeTab === 'all' && (
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: 150 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={config.color}>{config.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          )}

          {activeTab === 'expiring' && (
            <Select
              placeholder="Gün içinde"
              style={{ width: 130 }}
              value={expiringWithinDays || 30}
              onChange={setExpiringWithinDays}
            >
              <Select.Option value={7}>7 gün</Select.Option>
              <Select.Option value={14}>14 gün</Select.Option>
              <Select.Option value={30}>30 gün</Select.Option>
              <Select.Option value={60}>60 gün</Select.Option>
              <Select.Option value={90}>90 gün</Select.Option>
            </Select>
          )}
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={lotBatches}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: lotBatches.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Lot/Parti Oluştur"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createLotBatch.isPending}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lotNumber"
                label="Lot Numarası"
                rules={[{ required: true, message: 'Lot numarası gerekli' }]}
              >
                <Input placeholder="LOT-2024-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
              >
                <Select
                  placeholder="Ürün seçin"
                  showSearch
                  optionFilterProp="children"
                >
                  {products.filter(p => p.trackLotNumbers).map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="initialQuantity"
                label="Başlangıç Miktarı"
                rules={[{ required: true, message: 'Miktar gerekli' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="Tedarikçi"
              >
                <Select
                  placeholder="Tedarikçi seçin"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {suppliers.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manufacturedDate"
                label="Üretim Tarihi"
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Son Kullanma Tarihi"
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplierLotNumber"
                label="Tedarikçi Lot No"
              >
                <Input placeholder="Tedarikçinin lot numarası" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="certificateNumber"
                label="Sertifika No"
              >
                <Input placeholder="Kalite sertifika numarası" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={3} placeholder="Lot hakkında ek bilgiler..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Lot Detayı: ${selectedLotBatch?.lotNumber || ''}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedLotBatchId(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>,
          selectedLotBatch?.status === 'Pending' || selectedLotBatch?.status === 'Received' ? (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                if (selectedLotBatch) {
                  handleApprove(selectedLotBatch as unknown as LotBatchListDto);
                  setDetailModalOpen(false);
                }
              }}
            >
              Onayla
            </Button>
          ) : null,
        ]}
        width={700}
      >
        {selectedLotBatch && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Lot Numarası</Text>
                <div><Text strong className="text-lg">{selectedLotBatch.lotNumber}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Durum</Text>
                <div>
                  <Tag color={statusConfig[selectedLotBatch.status].color} icon={statusConfig[selectedLotBatch.status].icon}>
                    {statusConfig[selectedLotBatch.status].label}
                  </Tag>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Ürün</Text>
                <div>
                  <Text strong>{selectedLotBatch.productName}</Text>
                  <br />
                  <Text type="secondary">{selectedLotBatch.productCode}</Text>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Tedarikçi</Text>
                <div><Text>{selectedLotBatch.supplierName || '-'}</Text></div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary">Başlangıç Miktarı</Text>
                <div><Text strong>{selectedLotBatch.initialQuantity.toLocaleString('tr-TR')}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Mevcut Miktar</Text>
                <div><Text strong>{selectedLotBatch.currentQuantity.toLocaleString('tr-TR')}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Kullanılabilir</Text>
                <div><Text strong>{selectedLotBatch.availableQuantity.toLocaleString('tr-TR')}</Text></div>
              </Col>
            </Row>

            {selectedLotBatch.reservedQuantity > 0 && (
              <Alert
                type="info"
                message={`${selectedLotBatch.reservedQuantity.toLocaleString('tr-TR')} adet rezerve edilmiş`}
                showIcon
              />
            )}

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary">Üretim Tarihi</Text>
                <div>
                  <Text>
                    {selectedLotBatch.manufacturedDate
                      ? dayjs(selectedLotBatch.manufacturedDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Son Kullanma Tarihi</Text>
                <div>
                  <Text type={selectedLotBatch.isExpired ? 'danger' : undefined}>
                    {selectedLotBatch.expiryDate
                      ? dayjs(selectedLotBatch.expiryDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                  {selectedLotBatch.daysUntilExpiry !== undefined && !selectedLotBatch.isExpired && (
                    <Tag color={selectedLotBatch.daysUntilExpiry <= 30 ? 'orange' : 'default'} className="ml-2">
                      {selectedLotBatch.daysUntilExpiry} gün
                    </Tag>
                  )}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Teslim Tarihi</Text>
                <div>
                  <Text>
                    {selectedLotBatch.receivedDate
                      ? dayjs(selectedLotBatch.receivedDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
            </Row>

            {selectedLotBatch.remainingShelfLifePercentage !== undefined && (
              <div>
                <Text type="secondary">Kalan Raf Ömrü</Text>
                <Progress
                  percent={Math.round(selectedLotBatch.remainingShelfLifePercentage)}
                  status={selectedLotBatch.remainingShelfLifePercentage < 20 ? 'exception' : undefined}
                  strokeColor={selectedLotBatch.remainingShelfLifePercentage < 50 ? '#faad14' : '#52c41a'}
                />
              </div>
            )}

            {selectedLotBatch.isQuarantined && selectedLotBatch.quarantineReason && (
              <Alert
                type="warning"
                message="Karantina Sebebi"
                description={selectedLotBatch.quarantineReason}
                showIcon
              />
            )}

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Tedarikçi Lot No</Text>
                <div><Text>{selectedLotBatch.supplierLotNumber || '-'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Sertifika No</Text>
                <div><Text>{selectedLotBatch.certificateNumber || '-'}</Text></div>
              </Col>
            </Row>

            {selectedLotBatch.notes && (
              <div>
                <Text type="secondary">Notlar</Text>
                <div><Text>{selectedLotBatch.notes}</Text></div>
              </div>
            )}

            {selectedLotBatch.inspectionNotes && (
              <div>
                <Text type="secondary">Denetim Notları</Text>
                <div><Text>{selectedLotBatch.inspectionNotes}</Text></div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <Text type="secondary" className="text-xs">
                Oluşturulma: {dayjs(selectedLotBatch.createdAt).format('DD.MM.YYYY HH:mm')}
                {selectedLotBatch.inspectedDate && (
                  <> | Denetim: {dayjs(selectedLotBatch.inspectedDate).format('DD.MM.YYYY HH:mm')}</>
                )}
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Quarantine Modal */}
      <Modal
        title="Karantinaya Al"
        open={quarantineModalOpen}
        onCancel={() => {
          setQuarantineModalOpen(false);
          quarantineForm.resetFields();
        }}
        onOk={handleQuarantineConfirm}
        okText="Karantinaya Al"
        cancelText="İptal"
        confirmLoading={quarantineLotBatch.isPending}
        okButtonProps={{ danger: true }}
      >
        <Alert
          type="warning"
          message="Bu işlem lot/partiyi karantinaya alacaktır"
          description="Karantinaya alınan lotlar satışa veya kullanıma kapalı olacaktır."
          className="mb-4"
          showIcon
        />
        <Form form={quarantineForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Karantina Sebebi"
            rules={[{ required: true, message: 'Karantina sebebi gerekli' }]}
          >
            <TextArea
              rows={4}
              placeholder="Karantinaya alma sebebini açıklayın..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
