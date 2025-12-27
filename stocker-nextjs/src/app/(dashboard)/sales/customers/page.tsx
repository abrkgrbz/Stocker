'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Modal,
  Descriptions,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CustomerBalance {
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  currency: string;
  invoiceCount: number;
  overdueAmount: number;
  overdueCount: number;
  lastInvoiceDate: string | null;
}

export default function CustomerBalancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch all invoices to calculate balances
  const { data: invoicesData, isLoading, refetch } = useInvoices({ pageSize: 1000 });

  // Calculate customer balances from invoices
  const customerBalances = useMemo(() => {
    const invoices = invoicesData?.items ?? [];
    const balanceMap = new Map<string, CustomerBalance>();

    invoices.forEach((invoice: InvoiceListItem) => {
      if (invoice.status === 'Cancelled') return;

      const existing = balanceMap.get(invoice.customerName) || {
        customerName: invoice.customerName,
        totalInvoiced: 0,
        totalPaid: 0,
        balance: 0,
        currency: invoice.currency,
        invoiceCount: 0,
        overdueAmount: 0,
        overdueCount: 0,
        lastInvoiceDate: null,
      };

      existing.totalInvoiced += invoice.grandTotal;
      existing.totalPaid += invoice.paidAmount;
      existing.balance += invoice.balanceDue;
      existing.invoiceCount += 1;

      if (invoice.status === 'Overdue') {
        existing.overdueAmount += invoice.balanceDue;
        existing.overdueCount += 1;
      }

      if (!existing.lastInvoiceDate || new Date(invoice.invoiceDate) > new Date(existing.lastInvoiceDate)) {
        existing.lastInvoiceDate = invoice.invoiceDate;
      }

      balanceMap.set(invoice.customerName, existing);
    });

    return Array.from(balanceMap.values());
  }, [invoicesData]);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customerBalances;
    return customerBalances.filter(c =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customerBalances, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalCustomers: customerBalances.length,
      totalOutstanding: customerBalances.reduce((sum, c) => sum + c.balance, 0),
      totalOverdue: customerBalances.reduce((sum, c) => sum + c.overdueAmount, 0),
      customersWithBalance: customerBalances.filter(c => c.balance > 0).length,
      customersWithOverdue: customerBalances.filter(c => c.overdueCount > 0).length,
    };
  }, [customerBalances]);

  const handleViewDetail = (customer: CustomerBalance) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
  };

  const handleViewInvoices = (customerName: string) => {
    // Navigate to invoices with customer filter
    router.push(`/sales/invoices?customer=${encodeURIComponent(customerName)}`);
  };

  const columns = [
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string) => (
        <Space>
          <UserIcon className="w-4 h-4" />
          <Text strong>{name}</Text>
        </Space>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: 'Toplam Fatura',
      dataIndex: 'totalInvoiced',
      key: 'totalInvoiced',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.totalInvoiced - b.totalInvoiced,
    },
    {
      title: 'Ödenen',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) => (
        <Text type="success">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </Text>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.totalPaid - b.totalPaid,
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) => (
        <Text type={amount > 0 ? 'danger' : 'success'} strong>
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </Text>
      ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.balance - b.balance,
    },
    {
      title: 'Vadesi Geçmiş',
      dataIndex: 'overdueAmount',
      key: 'overdueAmount',
      align: 'right' as const,
      render: (amount: number, record: CustomerBalance) =>
        amount > 0 ? (
          <Tooltip title={`${record.overdueCount} adet vadesi geçmiş fatura`}>
            <Tag color="error" icon={<ExclamationTriangleIcon className="w-4 h-4" />}>
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="success" icon={<CheckCircleIcon className="w-4 h-4" />}>Yok</Tag>
        ),
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.overdueAmount - b.overdueAmount,
    },
    {
      title: 'Fatura Sayısı',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      align: 'center' as const,
      sorter: (a: CustomerBalance, b: CustomerBalance) => a.invoiceCount - b.invoiceCount,
    },
    {
      title: 'Ödeme Oranı',
      key: 'paymentRate',
      align: 'center' as const,
      render: (_: any, record: CustomerBalance) => {
        const rate = record.totalInvoiced > 0
          ? Math.round((record.totalPaid / record.totalInvoiced) * 100)
          : 0;
        return (
          <Tooltip title={`%${rate} ödendi`}>
            <Progress
              percent={rate}
              size="small"
              status={rate === 100 ? 'success' : rate < 50 ? 'exception' : 'normal'}
              style={{ width: 80 }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Son Fatura',
      dataIndex: 'lastInvoiceDate',
      key: 'lastInvoiceDate',
      render: (date: string | null) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
      sorter: (a: CustomerBalance, b: CustomerBalance) => {
        if (!a.lastInvoiceDate) return 1;
        if (!b.lastInvoiceDate) return -1;
        return new Date(a.lastInvoiceDate).getTime() - new Date(b.lastInvoiceDate).getTime();
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_: any, record: CustomerBalance) => (
        <Space>
          <Tooltip title="Detay">
            <Button size="small" icon={<EyeIcon className="w-4 h-4" />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="Faturaları Gör">
            <Button size="small" icon={<DocumentTextIcon className="w-4 h-4" />} onClick={() => handleViewInvoices(record.customerName)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Müşteri Bakiye Takibi</Title>
        <Text type="secondary">Müşterilerin borç/alacak durumunu takip edin</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={stats.totalCustomers}
              prefix={<UserIcon className="w-4 h-4" style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Alacak"
              value={stats.totalOutstanding}
              precision={2}
              prefix={<CurrencyDollarIcon className="w-4 h-4" style={{ color: '#faad14' }} />}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vadesi Geçmiş Alacak"
              value={stats.totalOverdue}
              precision={2}
              prefix={<ExclamationTriangleIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />}
              suffix="₺"
              valueStyle={{ color: stats.totalOverdue > 0 ? '#ff4d4f' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Borçlu Müşteri"
              value={stats.customersWithBalance}
              suffix={`/ ${stats.totalCustomers}`}
              prefix={<UserIcon className="w-4 h-4" style={{ color: '#722ed1' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {stats.customersWithOverdue} müşterinin vadesi geçmiş borcu var
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Müşteri ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()}>
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="customerName"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} müşteri`,
          }}
        />
      </Card>

      {/* Customer Detail Modal */}
      <Modal
        title={
          <Space>
            <UserIcon className="w-4 h-4" />
            {selectedCustomer?.customerName}
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="invoices" icon={<DocumentTextIcon className="w-4 h-4" />} onClick={() => {
            if (selectedCustomer) {
              handleViewInvoices(selectedCustomer.customerName);
              setDetailModalOpen(false);
            }
          }}>
            Faturaları Görüntüle
          </Button>,
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>,
        ]}
        width={600}
      >
        {selectedCustomer && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Müşteri Adı">{selectedCustomer.customerName}</Descriptions.Item>
            <Descriptions.Item label="Toplam Fatura Tutarı">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.totalInvoiced)}
            </Descriptions.Item>
            <Descriptions.Item label="Ödenen Tutar">
              <Text type="success">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.totalPaid)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kalan Borç">
              <Text type={selectedCustomer.balance > 0 ? 'danger' : 'success'} strong>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.balance)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Vadesi Geçmiş Tutar">
              <Text type="danger">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: selectedCustomer.currency }).format(selectedCustomer.overdueAmount)}
              </Text>
              {selectedCustomer.overdueCount > 0 && (
                <Tag color="error" style={{ marginLeft: 8 }}>
                  {selectedCustomer.overdueCount} fatura
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Toplam Fatura Sayısı">{selectedCustomer.invoiceCount}</Descriptions.Item>
            <Descriptions.Item label="Ödeme Oranı">
              <Progress
                percent={selectedCustomer.totalInvoiced > 0
                  ? Math.round((selectedCustomer.totalPaid / selectedCustomer.totalInvoiced) * 100)
                  : 0
                }
                status={
                  selectedCustomer.totalPaid >= selectedCustomer.totalInvoiced ? 'success' :
                  (selectedCustomer.totalPaid / selectedCustomer.totalInvoiced) < 0.5 ? 'exception' : 'normal'
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Son Fatura Tarihi">
              {selectedCustomer.lastInvoiceDate
                ? dayjs(selectedCustomer.lastInvoiceDate).format('DD/MM/YYYY')
                : '-'
              }
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
