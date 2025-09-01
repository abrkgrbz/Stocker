import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Badge,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Typography,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EyeOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  FilterOutlined,
  ExportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenant: string;
  tenantId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

const MasterInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: null as any,
  });

  // Mock data
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        tenant: 'TechCorp Solutions',
        tenantId: 'tenant-1',
        amount: 2500,
        tax: 450,
        total: 2950,
        status: 'paid',
        dueDate: '2024-02-15',
        issueDate: '2024-01-15',
        paymentDate: '2024-02-10',
        paymentMethod: 'Credit Card',
        items: [
          { description: 'Enterprise Package - Monthly', quantity: 1, unitPrice: 2500, total: 2500 }
        ]
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        tenant: 'Global Retail Inc',
        tenantId: 'tenant-2',
        amount: 1500,
        tax: 270,
        total: 1770,
        status: 'pending',
        dueDate: '2024-02-20',
        issueDate: '2024-01-20',
        items: [
          { description: 'Professional Package - Monthly', quantity: 1, unitPrice: 1500, total: 1500 }
        ]
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        tenant: 'StartUp Hub',
        tenantId: 'tenant-3',
        amount: 500,
        tax: 90,
        total: 590,
        status: 'overdue',
        dueDate: '2024-01-25',
        issueDate: '2023-12-25',
        items: [
          { description: 'Starter Package - Monthly', quantity: 1, unitPrice: 500, total: 500 }
        ]
      },
    ];
    setInvoices(mockInvoices);
  }, []);

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalVisible(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    message.success(`Fatura ${invoice.tenant} firmasına gönderildi`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    message.info(`${invoice.invoiceNumber} numaralı fatura indiriliyor...`);
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    Modal.confirm({
      title: 'Ödeme Onayı',
      content: `${invoice.invoiceNumber} numaralı faturayı ödendi olarak işaretlemek istediğinize emin misiniz?`,
      onOk: () => {
        message.success('Fatura ödendi olarak işaretlendi');
      },
    });
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Firma',
      dataIndex: 'tenant',
      key: 'tenant',
    },
    {
      title: 'Tutar',
      dataIndex: 'total',
      key: 'total',
      render: (value) => (
        <Text strong>₺{value.toLocaleString('tr-TR')}</Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          paid: { color: 'success', text: 'Ödendi', icon: <CheckCircleOutlined /> },
          pending: { color: 'warning', text: 'Bekliyor', icon: <ClockCircleOutlined /> },
          overdue: { color: 'error', text: 'Gecikmiş', icon: <CloseCircleOutlined /> },
          cancelled: { color: 'default', text: 'İptal', icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Düzenleme Tarihi',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Son Ödeme',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => {
        const isOverdue = dayjs(date).isBefore(dayjs()) && record.status === 'pending';
        return (
          <Text type={isOverdue ? 'danger' : undefined}>
            {dayjs(date).format('DD.MM.YYYY')}
          </Text>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="İndir">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadInvoice(record)}
            />
          </Tooltip>
          <Tooltip title="E-posta Gönder">
            <Button
              type="text"
              icon={<MailOutlined />}
              onClick={() => handleSendInvoice(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Ödendi Olarak İşaretle">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMarkAsPaid(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0),
  };

  return (
    <div className="master-invoices-page">
      <Row gutter={[24, 24]}>
        {/* Statistics Cards */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Fatura"
                  value={stats.total}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ödenen"
                  value={stats.paid}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Bekleyen"
                  value={stats.pending}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Tutar"
                  value={stats.totalAmount}
                  prefix="₺"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card
            title="Faturalar"
            extra={
              <Space>
                <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  Yeni Fatura
                </Button>
              </Space>
            }
          >
            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={8}>
                <Input
                  placeholder="Fatura no veya firma adı ile ara..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Durum"
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <Select.Option value="all">Tümü</Select.Option>
                  <Select.Option value="paid">Ödendi</Select.Option>
                  <Select.Option value="pending">Bekliyor</Select.Option>
                  <Select.Option value="overdue">Gecikmiş</Select.Option>
                  <Select.Option value="cancelled">İptal</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Başlangıç', 'Bitiş']}
                  onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                />
              </Col>
              <Col xs={24} sm={12} lg={2}>
                <Button icon={<FilterOutlined />} block>
                  Filtrele
                </Button>
              </Col>
            </Row>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={invoices}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} fatura`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Invoice Detail Modal */}
      <Modal
        title={`Fatura Detayı - ${selectedInvoice?.invoiceNumber}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button key="print" icon={<PrinterOutlined />}>
            Yazdır
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            İndir
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Firma:</Text>
                <Title level={5}>{selectedInvoice.tenant}</Title>
              </Col>
              <Col span={12}>
                <Text type="secondary">Durum:</Text>
                <div>
                  {selectedInvoice.status === 'paid' && (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Ödendi</Tag>
                  )}
                  {selectedInvoice.status === 'pending' && (
                    <Tag color="warning" icon={<ClockCircleOutlined />}>Bekliyor</Tag>
                  )}
                  {selectedInvoice.status === 'overdue' && (
                    <Tag color="error" icon={<CloseCircleOutlined />}>Gecikmiş</Tag>
                  )}
                </div>
              </Col>
            </Row>
            <Divider />
            <Table
              dataSource={selectedInvoice.items}
              columns={[
                { title: 'Açıklama', dataIndex: 'description', key: 'description' },
                { title: 'Miktar', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', render: (v) => `₺${v}` },
                { title: 'Toplam', dataIndex: 'total', key: 'total', render: (v) => `₺${v}` },
              ]}
              pagination={false}
              rowKey="description"
            />
            <Divider />
            <Row justify="end">
              <Col>
                <Space direction="vertical" align="end">
                  <Text>Ara Toplam: ₺{selectedInvoice.amount}</Text>
                  <Text>KDV (%18): ₺{selectedInvoice.tax}</Text>
                  <Title level={4}>Toplam: ₺{selectedInvoice.total}</Title>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MasterInvoicesPage;