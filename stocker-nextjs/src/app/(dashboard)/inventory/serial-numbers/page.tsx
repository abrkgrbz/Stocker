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
  Form,
  Input,
  InputNumber,
  Tooltip,
  Alert,
  Tabs,
  Badge,
  message,
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
  BarcodeOutlined,
  ShoppingOutlined,
  ToolOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import {
  useSerialNumbers,
  useSerialNumber,
  useProducts,
  useWarehouses,
  useCreateSerialNumber,
  useReceiveSerialNumber,
  useReserveSerialNumber,
  useReleaseSerialNumber,
  useSellSerialNumber,
  useMarkSerialNumberDefective,
  useScrapSerialNumber,
} from '@/lib/api/hooks/useInventory';
import type {
  SerialNumberListDto,
  SerialNumberDto,
  SerialNumberStatus,
  SerialNumberFilterDto,
  CreateSerialNumberDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Serial number status configuration
const statusConfig: Record<SerialNumberStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Available: { color: 'green', label: 'Mevcut', icon: <CheckCircleOutlined /> },
  InStock: { color: 'blue', label: 'Stokta', icon: <BarcodeOutlined /> },
  Reserved: { color: 'gold', label: 'Rezerve', icon: <LockOutlined /> },
  Sold: { color: 'cyan', label: 'Satıldı', icon: <ShoppingOutlined /> },
  Returned: { color: 'purple', label: 'İade', icon: <RollbackOutlined /> },
  Defective: { color: 'orange', label: 'Arızalı', icon: <ExclamationCircleOutlined /> },
  InRepair: { color: 'volcano', label: 'Tamirde', icon: <ToolOutlined /> },
  Scrapped: { color: 'red', label: 'Hurda', icon: <DeleteOutlined /> },
  Lost: { color: 'default', label: 'Kayıp', icon: <WarningOutlined /> },
  OnLoan: { color: 'geekblue', label: 'Ödünç', icon: <ShoppingCartOutlined /> },
  InTransit: { color: 'lime', label: 'Taşımada', icon: <ClockCircleOutlined /> },
};

export default function SerialNumbersPage() {
  const router = useRouter();

  // Filters
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<SerialNumberStatus | undefined>();
  const [underWarrantyOnly, setUnderWarrantyOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchSerial, setSearchSerial] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [defectiveModalOpen, setDefectiveModalOpen] = useState(false);
  const [selectedSerialId, setSelectedSerialId] = useState<number | null>(null);

  // Forms
  const [createForm] = Form.useForm();
  const [sellForm] = Form.useForm();
  const [reserveForm] = Form.useForm();
  const [defectiveForm] = Form.useForm();

  // Build filter based on active tab and filters
  const filter: SerialNumberFilterDto = useMemo(() => {
    const baseFilter: SerialNumberFilterDto = {
      productId: selectedProduct,
      warehouseId: selectedWarehouse,
    };

    switch (activeTab) {
      case 'available':
        return { ...baseFilter, status: 'Available' as SerialNumberStatus };
      case 'reserved':
        return { ...baseFilter, status: 'Reserved' as SerialNumberStatus };
      case 'sold':
        return { ...baseFilter, status: 'Sold' as SerialNumberStatus };
      case 'warranty':
        return { ...baseFilter, underWarrantyOnly: true };
      case 'defective':
        return { ...baseFilter, status: 'Defective' as SerialNumberStatus };
      default:
        return { ...baseFilter, status: selectedStatus, underWarrantyOnly };
    }
  }, [activeTab, selectedProduct, selectedWarehouse, selectedStatus, underWarrantyOnly]);

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: serialNumbers = [], isLoading, refetch } = useSerialNumbers(filter);
  const { data: selectedSerial } = useSerialNumber(selectedSerialId || 0);

  const createSerialNumber = useCreateSerialNumber();
  const receiveSerialNumber = useReceiveSerialNumber();
  const reserveSerialNumber = useReserveSerialNumber();
  const releaseSerialNumber = useReleaseSerialNumber();
  const sellSerialNumber = useSellSerialNumber();
  const markDefective = useMarkSerialNumberDefective();
  const scrapSerialNumber = useScrapSerialNumber();

  // Filter by search
  const filteredSerialNumbers = useMemo(() => {
    if (!searchSerial) return serialNumbers;
    const searchLower = searchSerial.toLowerCase();
    return serialNumbers.filter(
      (s) =>
        s.serial.toLowerCase().includes(searchLower) ||
        s.productCode.toLowerCase().includes(searchLower) ||
        s.productName.toLowerCase().includes(searchLower)
    );
  }, [serialNumbers, searchSerial]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = serialNumbers.length;
    const available = serialNumbers.filter(s => s.status === 'Available' || s.status === 'InStock').length;
    const reserved = serialNumbers.filter(s => s.status === 'Reserved').length;
    const sold = serialNumbers.filter(s => s.status === 'Sold').length;
    const defective = serialNumbers.filter(s => s.status === 'Defective' || s.status === 'InRepair').length;
    const underWarranty = serialNumbers.filter(s => s.isUnderWarranty).length;

    return { total, available, reserved, sold, defective, underWarranty };
  }, [serialNumbers]);

  // Handlers
  const handleViewDetail = (id: number) => {
    setSelectedSerialId(id);
    setDetailModalOpen(true);
  };

  const handleReceive = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Seri Numarasını Teslim Al',
      content: `"${serial.serial}" seri numarasını teslim almak istediğinizden emin misiniz?`,
      okText: 'Teslim Al',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await receiveSerialNumber.mutateAsync({ id: serial.id });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleReserveClick = (serial: SerialNumberListDto) => {
    setSelectedSerialId(serial.id);
    reserveForm.resetFields();
    setReserveModalOpen(true);
  };

  const handleReserveConfirm = async () => {
    try {
      const values = await reserveForm.validateFields();
      if (selectedSerialId) {
        await reserveSerialNumber.mutateAsync({
          id: selectedSerialId,
          request: { salesOrderId: values.salesOrderId },
        });
        setReserveModalOpen(false);
        reserveForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleRelease = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Rezervasyonu Kaldır',
      content: `"${serial.serial}" seri numarasının rezervasyonunu kaldırmak istediğinizden emin misiniz?`,
      okText: 'Kaldır',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await releaseSerialNumber.mutateAsync(serial.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSellClick = (serial: SerialNumberListDto) => {
    setSelectedSerialId(serial.id);
    sellForm.resetFields();
    setSellModalOpen(true);
  };

  const handleSellConfirm = async () => {
    try {
      const values = await sellForm.validateFields();
      if (selectedSerialId) {
        await sellSerialNumber.mutateAsync({
          id: selectedSerialId,
          request: {
            customerId: values.customerId,
            salesOrderId: values.salesOrderId,
            warrantyMonths: values.warrantyMonths,
          },
        });
        setSellModalOpen(false);
        sellForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleDefectiveClick = (serial: SerialNumberListDto) => {
    setSelectedSerialId(serial.id);
    defectiveForm.resetFields();
    setDefectiveModalOpen(true);
  };

  const handleDefectiveConfirm = async () => {
    try {
      const values = await defectiveForm.validateFields();
      if (selectedSerialId) {
        await markDefective.mutateAsync({
          id: selectedSerialId,
          request: { reason: values.reason },
        });
        setDefectiveModalOpen(false);
        defectiveForm.resetFields();
      }
    } catch (error) {
      // Validation error handled by form
    }
  };

  const handleScrap = async (serial: SerialNumberListDto) => {
    Modal.confirm({
      title: 'Hurda Olarak İşaretle',
      content: `"${serial.serial}" seri numarasını hurda olarak işaretlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Hurda İşaretle',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await scrapSerialNumber.mutateAsync({ id: serial.id });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const data: CreateSerialNumberDto = {
        serial: values.serial,
        productId: values.productId,
        warehouseId: values.warehouseId,
        locationId: values.locationId,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        batchNumber: values.batchNumber,
        supplierSerial: values.supplierSerial,
        notes: values.notes,
      };
      await createSerialNumber.mutateAsync(data);
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  // Table columns
  const columns: ColumnsType<SerialNumberListDto> = [
    {
      title: 'Seri Numarası',
      dataIndex: 'serial',
      key: 'serial',
      width: 180,
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewDetail(record.id)}>
            {text}
          </Text>
          {record.isUnderWarranty && (
            <Tag color="green" icon={<SafetyCertificateOutlined />} className="text-xs">
              Garanti: {record.remainingWarrantyDays} gün
            </Tag>
          )}
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
      render: (status: SerialNumberStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text: string | undefined) => text || <Text type="secondary">-</Text>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: any[] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Detay',
            onClick: () => handleViewDetail(record.id),
          },
        ];

        // Status-based actions
        if (record.status === 'Available') {
          menuItems.push({
            key: 'receive',
            icon: <CheckCircleOutlined />,
            label: 'Teslim Al',
            onClick: () => handleReceive(record),
          });
        }

        if (record.status === 'InStock' || record.status === 'Available') {
          menuItems.push({
            key: 'reserve',
            icon: <LockOutlined />,
            label: 'Rezerve Et',
            onClick: () => handleReserveClick(record),
          });
          menuItems.push({
            key: 'sell',
            icon: <ShoppingOutlined />,
            label: 'Sat',
            onClick: () => handleSellClick(record),
          });
        }

        if (record.status === 'Reserved') {
          menuItems.push({
            key: 'release',
            icon: <UnlockOutlined />,
            label: 'Rezervasyonu Kaldır',
            onClick: () => handleRelease(record),
          });
          menuItems.push({
            key: 'sell',
            icon: <ShoppingOutlined />,
            label: 'Sat',
            onClick: () => handleSellClick(record),
          });
        }

        if (record.status !== 'Defective' && record.status !== 'Scrapped' && record.status !== 'Sold') {
          menuItems.push({
            key: 'defective',
            icon: <ExclamationCircleOutlined />,
            label: 'Arızalı İşaretle',
            onClick: () => handleDefectiveClick(record),
          });
        }

        if (record.status === 'Defective') {
          menuItems.push({
            key: 'scrap',
            icon: <DeleteOutlined />,
            label: 'Hurda İşaretle',
            danger: true,
            onClick: () => handleScrap(record),
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
          <BarcodeOutlined />
          Tümü
          <Badge count={stats.total} showZero style={{ backgroundColor: '#1890ff' }} />
        </Space>
      ),
    },
    {
      key: 'available',
      label: (
        <Space>
          <CheckCircleOutlined />
          Mevcut
          <Badge count={stats.available} showZero style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
    },
    {
      key: 'reserved',
      label: (
        <Space>
          <LockOutlined />
          Rezerve
          <Badge count={stats.reserved} showZero style={{ backgroundColor: '#faad14' }} />
        </Space>
      ),
    },
    {
      key: 'sold',
      label: (
        <Space>
          <ShoppingOutlined />
          Satılan
          <Badge count={stats.sold} showZero style={{ backgroundColor: '#13c2c2' }} />
        </Space>
      ),
    },
    {
      key: 'warranty',
      label: (
        <Space>
          <SafetyCertificateOutlined />
          Garantili
          <Badge count={stats.underWarranty} showZero style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
    },
    {
      key: 'defective',
      label: (
        <Space>
          <ExclamationCircleOutlined />
          Arızalı
          <Badge count={stats.defective} showZero style={{ backgroundColor: '#fa8c16' }} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Seri Numarası Yönetimi</Title>
          <Text type="secondary">Ürün seri numaralarını takip edin ve yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Yeni Seri Numarası
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Toplam"
              value={stats.total}
              prefix={<BarcodeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Mevcut"
              value={stats.available}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Rezerve"
              value={stats.reserved}
              valueStyle={{ color: '#faad14' }}
              prefix={<LockOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Satılan"
              value={stats.sold}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Garantili"
              value={stats.underWarranty}
              valueStyle={{ color: '#52c41a' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Arızalı"
              value={stats.defective}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

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
          <Input
            placeholder="Seri numarası ara..."
            prefix={<SearchOutlined />}
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />

          <Select
            placeholder="Ürün"
            allowClear
            style={{ width: 200 }}
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
          >
            {products.filter(p => p.trackSerialNumbers).map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Depo"
            allowClear
            style={{ width: 150 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.name}
              </Select.Option>
            ))}
          </Select>

          {activeTab === 'all' && (
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: 130 }}
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
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredSerialNumbers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredSerialNumbers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Seri Numarası Ekle"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Ekle"
        cancelText="İptal"
        confirmLoading={createSerialNumber.isPending}
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
                name="serial"
                label="Seri Numarası"
                rules={[{ required: true, message: 'Seri numarası gerekli' }]}
              >
                <Input placeholder="SN-2024-00001" />
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
                  {products.filter(p => p.trackSerialNumbers).map((p) => (
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
                name="warehouseId"
                label="Depo"
              >
                <Select placeholder="Depo seçin" allowClear>
                  {warehouses.map((w) => (
                    <Select.Option key={w.id} value={w.id}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manufacturedDate"
                label="Üretim Tarihi"
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batchNumber"
                label="Parti/Lot Numarası"
              >
                <Input placeholder="LOT-2024-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierSerial"
                label="Tedarikçi Seri No"
              >
                <Input placeholder="Tedarikçinin seri numarası" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={3} placeholder="Seri numarası hakkında ek bilgiler..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Seri Numarası Detayı: ${selectedSerial?.serial || ''}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedSerialId(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {selectedSerial && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Seri Numarası</Text>
                <div><Text strong className="text-lg">{selectedSerial.serial}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Durum</Text>
                <div>
                  <Tag color={statusConfig[selectedSerial.status].color} icon={statusConfig[selectedSerial.status].icon}>
                    {statusConfig[selectedSerial.status].label}
                  </Tag>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Ürün</Text>
                <div>
                  <Text strong>{selectedSerial.productName}</Text>
                  <br />
                  <Text type="secondary">{selectedSerial.productCode}</Text>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Depo / Konum</Text>
                <div>
                  <Text>{selectedSerial.warehouseName || '-'}</Text>
                  {selectedSerial.locationName && (
                    <>
                      <br />
                      <Text type="secondary">{selectedSerial.locationName}</Text>
                    </>
                  )}
                </div>
              </Col>
            </Row>

            {selectedSerial.isUnderWarranty && (
              <Alert
                type="success"
                message="Garanti Kapsamında"
                description={`${selectedSerial.remainingWarrantyDays} gün garanti süresi kaldı`}
                icon={<SafetyCertificateOutlined />}
                showIcon
              />
            )}

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary">Üretim Tarihi</Text>
                <div>
                  <Text>
                    {selectedSerial.manufacturedDate
                      ? dayjs(selectedSerial.manufacturedDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Teslim Tarihi</Text>
                <div>
                  <Text>
                    {selectedSerial.receivedDate
                      ? dayjs(selectedSerial.receivedDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Satış Tarihi</Text>
                <div>
                  <Text>
                    {selectedSerial.soldDate
                      ? dayjs(selectedSerial.soldDate).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
            </Row>

            {(selectedSerial.warrantyStartDate || selectedSerial.warrantyEndDate) && (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Garanti Başlangıç</Text>
                  <div>
                    <Text>
                      {selectedSerial.warrantyStartDate
                        ? dayjs(selectedSerial.warrantyStartDate).format('DD.MM.YYYY')
                        : '-'}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Garanti Bitiş</Text>
                  <div>
                    <Text>
                      {selectedSerial.warrantyEndDate
                        ? dayjs(selectedSerial.warrantyEndDate).format('DD.MM.YYYY')
                        : '-'}
                    </Text>
                  </div>
                </Col>
              </Row>
            )}

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary">Parti/Lot No</Text>
                <div><Text>{selectedSerial.batchNumber || '-'}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Tedarikçi Seri No</Text>
                <div><Text>{selectedSerial.supplierSerial || '-'}</Text></div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Müşteri ID</Text>
                <div><Text>{selectedSerial.customerId || '-'}</Text></div>
              </Col>
            </Row>

            {(selectedSerial.salesOrderId || selectedSerial.purchaseOrderId) && (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Satış Siparişi</Text>
                  <div><Text>{selectedSerial.salesOrderId || '-'}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Satınalma Siparişi</Text>
                  <div><Text>{selectedSerial.purchaseOrderId || '-'}</Text></div>
                </Col>
              </Row>
            )}

            {selectedSerial.notes && (
              <div>
                <Text type="secondary">Notlar</Text>
                <div><Text>{selectedSerial.notes}</Text></div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <Text type="secondary" className="text-xs">
                Oluşturulma: {dayjs(selectedSerial.createdAt).format('DD.MM.YYYY HH:mm')}
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Sell Modal */}
      <Modal
        title="Seri Numarasını Sat"
        open={sellModalOpen}
        onCancel={() => {
          setSellModalOpen(false);
          sellForm.resetFields();
        }}
        onOk={handleSellConfirm}
        okText="Sat"
        cancelText="İptal"
        confirmLoading={sellSerialNumber.isPending}
      >
        <Form form={sellForm} layout="vertical" className="mt-4">
          <Form.Item
            name="customerId"
            label="Müşteri ID"
            rules={[{ required: true, message: 'Müşteri ID gerekli' }]}
          >
            <Input placeholder="Müşteri ID girin" />
          </Form.Item>
          <Form.Item
            name="salesOrderId"
            label="Satış Siparişi No"
            rules={[{ required: true, message: 'Satış siparişi numarası gerekli' }]}
          >
            <Input placeholder="Satış siparişi numarası" />
          </Form.Item>
          <Form.Item
            name="warrantyMonths"
            label="Garanti Süresi (Ay)"
          >
            <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="12" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reserve Modal */}
      <Modal
        title="Seri Numarasını Rezerve Et"
        open={reserveModalOpen}
        onCancel={() => {
          setReserveModalOpen(false);
          reserveForm.resetFields();
        }}
        onOk={handleReserveConfirm}
        okText="Rezerve Et"
        cancelText="İptal"
        confirmLoading={reserveSerialNumber.isPending}
      >
        <Form form={reserveForm} layout="vertical" className="mt-4">
          <Form.Item
            name="salesOrderId"
            label="Satış Siparişi No"
            rules={[{ required: true, message: 'Satış siparişi numarası gerekli' }]}
          >
            <Input placeholder="Satış siparişi numarası" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Defective Modal */}
      <Modal
        title="Arızalı Olarak İşaretle"
        open={defectiveModalOpen}
        onCancel={() => {
          setDefectiveModalOpen(false);
          defectiveForm.resetFields();
        }}
        onOk={handleDefectiveConfirm}
        okText="Arızalı İşaretle"
        cancelText="İptal"
        confirmLoading={markDefective.isPending}
        okButtonProps={{ danger: true }}
      >
        <Alert
          type="warning"
          message="Bu işlem seri numarasını arızalı olarak işaretleyecektir"
          description="Arızalı seri numaraları satışa kapalı olacaktır."
          className="mb-4"
          showIcon
        />
        <Form form={defectiveForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Arıza Sebebi"
          >
            <TextArea
              rows={4}
              placeholder="Arıza sebebini açıklayın..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
