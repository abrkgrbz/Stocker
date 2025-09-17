import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Avatar,
  Dropdown,
  Menu,
  message,
  Tooltip,
  Badge,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import invoiceService, { Invoice, InvoiceFilters } from '@/services/invoiceService';
import './style.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>({
    pageNumber: 1,
    pageSize: 20
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Mock data for demo - API henüz hazır değilse
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          customerId: '1',
          customerName: 'ABC Teknoloji A.Ş.',
          invoiceDate: '2024-01-15T00:00:00',
          dueDate: '2024-02-15T00:00:00',
          subTotal: 10000,
          taxAmount: 1800,
          discountAmount: 500,
          totalAmount: 11300,
          currency: 'TRY',
          status: 'Paid',
          paidDate: '2024-02-10T00:00:00',
          paymentMethod: 'BankTransfer',
          items: [],
          createdAt: '2024-01-15T00:00:00'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          customerId: '2',
          customerName: 'XYZ Yazılım Ltd.',
          invoiceDate: '2024-01-20T00:00:00',
          dueDate: '2024-02-20T00:00:00',
          subTotal: 25000,
          taxAmount: 4500,
          discountAmount: 1000,
          totalAmount: 28500,
          currency: 'TRY',
          status: 'Overdue',
          items: [],
          createdAt: '2024-01-20T00:00:00'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          customerId: '3',
          customerName: 'Demo Şirketi',
          invoiceDate: '2024-02-01T00:00:00',
          dueDate: '2024-03-01T00:00:00',
          subTotal: 15000,
          taxAmount: 2700,
          discountAmount: 0,
          totalAmount: 17700,
          currency: 'TRY',
          status: 'Sent',
          items: [],
          createdAt: '2024-02-01T00:00:00'
        },
        {
          id: '4',
          invoiceNumber: 'INV-2024-004',
          customerId: '1',
          customerName: 'ABC Teknoloji A.Ş.',
          invoiceDate: '2024-02-05T00:00:00',
          dueDate: '2024-03-05T00:00:00',
          subTotal: 8000,
          taxAmount: 1440,
          discountAmount: 400,
          totalAmount: 9040,
          currency: 'TRY',
          status: 'Draft',
          items: [],
          createdAt: '2024-02-05T00:00:00'
        },
        {
          id: '5',
          invoiceNumber: 'INV-2024-005',
          customerId: '2',
          customerName: 'XYZ Yazılım Ltd.',
          invoiceDate: '2024-01-10T00:00:00',
          dueDate: '2024-02-10T00:00:00',
          subTotal: 12000,
          taxAmount: 2160,
          discountAmount: 600,
          totalAmount: 13560,
          currency: 'TRY',
          status: 'Cancelled',
          items: [],
          createdAt: '2024-01-10T00:00:00'
        }
      ];
      
      // Filter mock data based on filters
      let filteredData = [...mockInvoices];
      if (filters.status) {
        filteredData = filteredData.filter(inv => inv.status === filters.status);
      }
      
      setInvoices(filteredData);
      calculateStatistics(filteredData);
      
      // Gerçek API çağrısı - şimdilik yorum satırında
      // const data = await invoiceService.getInvoices(filters);
      // setInvoices(data);
      // calculateStatistics(data);
    } catch (error) {
      message.error('Faturalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: Invoice[]) => {
    const stats = data.reduce((acc, invoice) => {
      acc.total += invoice.totalAmount;
      if (invoice.status === 'Paid') {
        acc.paid += invoice.totalAmount;
      } else if (invoice.status === 'Sent' || invoice.status === 'Draft') {
        acc.pending += invoice.totalAmount;
      } else if (invoice.status === 'Overdue') {
        acc.overdue += invoice.totalAmount;
      }
      return acc;
    }, { total: 0, paid: 0, pending: 0, overdue: 0 });
    setStatistics(stats);
  };

  const handleStatusChange = async (invoice: Invoice, action: string) => {
    try {
      switch (action) {
        case 'send':
          await invoiceService.sendInvoice(invoice.id);
          message.success('Fatura gönderildi');
          break;
        case 'markPaid':
          await invoiceService.markAsPaid(invoice.id, {
            paymentDate: new Date().toISOString(),
            paymentMethod: 'BankTransfer'
          });
          message.success('Fatura ödendi olarak işaretlendi');
          break;
        case 'cancel':
          await invoiceService.cancelInvoice(invoice.id, 'Müşteri talebi');
          message.success('Fatura iptal edildi');
          break;
      }
      fetchInvoices();
    } catch (error) {
      message.error('İşlem başarısız oldu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await invoiceService.deleteInvoice(id);
      message.success('Fatura silindi');
      fetchInvoices();
    } catch (error) {
      message.error('Silme işlemi başarısız oldu');
    }
  };

  const getActionMenu = (record: Invoice) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => navigate(`/invoices/${record.id}`)}>
        Görüntüle
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/invoices/${record.id}/edit`)}>
        Düzenle
      </Menu.Item>
      <Menu.Divider />
      {record.status === 'Draft' && (
        <Menu.Item key="send" icon={<MailOutlined />} onClick={() => handleStatusChange(record, 'send')}>
          Gönder
        </Menu.Item>
      )}
      {record.status === 'Sent' && (
        <Menu.Item key="markPaid" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(record, 'markPaid')}>
          Ödendi İşaretle
        </Menu.Item>
      )}
      <Menu.Item key="print" icon={<PrinterOutlined />}>
        Yazdır
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />}>
        PDF İndir
      </Menu.Item>
      <Menu.Divider />
      {record.status === 'Draft' && (
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
          Sil
        </Menu.Item>
      )}
      {(record.status === 'Sent' || record.status === 'Overdue') && (
        <Menu.Item key="cancel" icon={<WarningOutlined />} danger onClick={() => handleStatusChange(record, 'cancel')}>
          İptal Et
        </Menu.Item>
      )}
    </Menu>
  );

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      fixed: 'left',
      width: 120,
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/invoices/${record.id}`)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200,
      render: (text) => (
        <Space>
          <Avatar style={{ backgroundColor: '#87d068' }}>{text?.charAt(0) || 'M'}</Avatar>
          <span>{text || 'Müşteri Adı'}</span>
        </Space>
      )
    },
    {
      title: 'Fatura Tarihi',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date, record) => {
        const daysOverdue = invoiceService.calculateDaysOverdue(date);
        const isOverdue = record.status === 'Overdue' || (record.status === 'Sent' && daysOverdue > 0);
        
        return (
          <Space>
            <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
              {new Date(date).toLocaleDateString('tr-TR')}
            </span>
            {isOverdue && (
              <Tooltip title={`${Math.abs(daysOverdue)} gün gecikme`}>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount, record) => (
        <span style={{ fontWeight: 600 }}>
          {invoiceService.formatCurrency(amount, record.currency)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          Draft: { color: 'default', text: 'Taslak' },
          Sent: { color: 'processing', text: 'Gönderildi' },
          Paid: { color: 'success', text: 'Ödendi' },
          Overdue: { color: 'error', text: 'Gecikmiş' },
          Cancelled: { color: 'warning', text: 'İptal' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: 'Taslak', value: 'Draft' },
        { text: 'Gönderildi', value: 'Sent' },
        { text: 'Ödendi', value: 'Paid' },
        { text: 'Gecikmiş', value: 'Overdue' },
        { text: 'İptal', value: 'Cancelled' }
      ]
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };

  return (
    <div className="invoice-list">
      {/* Statistics Cards */}
      <Row gutter={16} className="statistics-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Fatura"
              value={invoices.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ödenen"
              value={statistics.paid}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => invoiceService.formatCurrency(value as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen"
              value={statistics.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => invoiceService.formatCurrency(value as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gecikmiş"
              value={statistics.overdue}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              formatter={(value) => invoiceService.formatCurrency(value as number)}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card 
        title={
          <Space>
            <DollarOutlined />
            <span>Faturalar</span>
            <Badge count={invoices.length} showZero />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<FilterOutlined />}>Filtrele</Button>
            <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/invoices/new')}
            >
              Yeni Fatura
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <Row gutter={16} className="filter-row">
          <Col xs={24} sm={12} lg={6}>
            <Input
              placeholder="Fatura no veya müşteri ara..."
              prefix={<SearchOutlined />}
              onChange={(e) => setFilters({ ...filters, pageNumber: 1 })}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Durum seçin"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value, pageNumber: 1 })}
            >
              <Option value="Draft">Taslak</Option>
              <Option value="Sent">Gönderildi</Option>
              <Option value="Paid">Ödendi</Option>
              <Option value="Overdue">Gecikmiş</Option>
              <Option value="Cancelled">İptal</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    startDate: dates[0]?.toISOString(),
                    endDate: dates[1]?.toISOString(),
                    pageNumber: 1
                  });
                }
              }}
            />
          </Col>
        </Row>

        {/* Table */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: filters.pageNumber,
            pageSize: filters.pageSize,
            total: invoices.length * 2, // Mock total
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Toplam ${total} fatura`,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, pageNumber: page, pageSize });
            }
          }}
          locale={{
            emptyText: <Empty description="Fatura bulunamadı" />
          }}
        />

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <div className="bulk-actions">
            <Space>
              <span>{selectedRowKeys.length} fatura seçildi</span>
              <Button icon={<MailOutlined />}>Toplu Gönder</Button>
              <Button icon={<PrinterOutlined />}>Toplu Yazdır</Button>
              <Button icon={<DownloadOutlined />}>PDF İndir</Button>
              <Button danger icon={<DeleteOutlined />}>Sil</Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceList;