'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Button, Progress, Alert, List, Badge, Tooltip } from 'antd';
import {
  ShoppingCartOutlined,
  FileTextOutlined,
  WalletOutlined,
  DollarOutlined,
  RightOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useSalesStatistics, useSalesOrders } from '@/lib/api/hooks/useSales';
import { useInvoiceStatistics, useInvoices } from '@/lib/api/hooks/useInvoices';
import { usePaymentStatistics } from '@/lib/api/hooks/usePayments';
import type { SalesOrderListItem, SalesOrderStatus } from '@/lib/api/services/sales.service';
import type { InvoiceListItem } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: Record<SalesOrderStatus, string> = {
  Draft: 'default',
  Approved: 'processing',
  Confirmed: 'cyan',
  Shipped: 'blue',
  Delivered: 'geekblue',
  Completed: 'success',
  Cancelled: 'error',
};

const statusLabels: Record<SalesOrderStatus, string> = {
  Draft: 'Taslak',
  Approved: 'Onaylı',
  Confirmed: 'Onaylandı',
  Shipped: 'Gönderildi',
  Delivered: 'Teslim Edildi',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

export default function SalesDashboardPage() {
  const router = useRouter();

  const { data: salesStats, isLoading: salesStatsLoading } = useSalesStatistics();
  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStatistics();
  const { data: paymentStats, isLoading: paymentStatsLoading } = usePaymentStatistics();
  const { data: recentOrders, isLoading: ordersLoading } = useSalesOrders({ pageSize: 5 });
  const { data: overdueInvoices, isLoading: overdueLoading } = useInvoices({ status: 'Overdue', pageSize: 5 });

  const hasOverdueInvoices = (invoiceStats?.overdueInvoices ?? 0) > 0;
  const overdueAmount = overdueInvoices?.items?.reduce((sum, inv) => sum + inv.grandTotal, 0) ?? 0;

  const columns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record: SalesOrderListItem) => (
        <a onClick={() => router.push(`/sales/orders/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tarih',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount: number, record: SalesOrderListItem) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesOrderStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Satış Dashboard</Title>
        <Text type="secondary">Satış operasyonlarınızın genel görünümü</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => router.push('/sales/orders')}>
            <Statistic
              title="Toplam Sipariş"
              value={salesStats?.totalOrders ?? 0}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              loading={salesStatsLoading}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {salesStats?.draftOrders ?? 0} taslak, {salesStats?.approvedOrders ?? 0} onaylı
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => router.push('/sales/invoices')}>
            <Statistic
              title="Toplam Fatura"
              value={invoiceStats?.totalInvoices ?? 0}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              loading={invoiceStatsLoading}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {invoiceStats?.overdueInvoices ?? 0} gecikmiş
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => router.push('/sales/payments')}>
            <Statistic
              title="Toplam Ödeme"
              value={paymentStats?.totalPayments ?? 0}
              prefix={<WalletOutlined style={{ color: '#722ed1' }} />}
              loading={paymentStatsLoading}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {paymentStats?.pendingPayments ?? 0} beklemede
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Gelir"
              value={salesStats?.totalRevenue ?? 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="₺"
              loading={salesStatsLoading}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Ort: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(salesStats?.averageOrderValue ?? 0)}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Overdue Invoices Alert */}
      {hasOverdueInvoices && (
        <Alert
          message={
            <span>
              <WarningOutlined style={{ marginRight: 8 }} />
              <strong>{invoiceStats?.overdueInvoices ?? 0} adet vadesi geçmiş fatura</strong> bulunmaktadır.
              Toplam tutar: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(overdueAmount)}
            </span>
          }
          type="warning"
          showIcon={false}
          action={
            <Button size="small" type="primary" danger onClick={() => router.push('/sales/invoices?status=Overdue')}>
              Faturaları Görüntüle
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Quick Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Sipariş Durumları" size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Taslak</Text>
                <Text strong>{salesStats?.draftOrders ?? 0}</Text>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.draftOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#d9d9d9"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Onaylı</Text>
                <Text strong>{salesStats?.approvedOrders ?? 0}</Text>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.approvedOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#1890ff"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Tamamlanan</Text>
                <Text strong>{salesStats?.completedOrders ?? 0}</Text>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.completedOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#52c41a"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>İptal</Text>
                <Text strong>{salesStats?.cancelledOrders ?? 0}</Text>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.cancelledOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#ff4d4f"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Fatura Durumları" size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Taslak</Text>
                <Text strong>{invoiceStats?.draftInvoices ?? 0}</Text>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.draftInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#d9d9d9"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Kesilmiş</Text>
                <Text strong>{invoiceStats?.issuedInvoices ?? 0}</Text>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.issuedInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#1890ff"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Ödenmiş</Text>
                <Text strong>{invoiceStats?.paidInvoices ?? 0}</Text>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.paidInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#52c41a"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Gecikmiş</Text>
                <Text strong>{invoiceStats?.overdueInvoices ?? 0}</Text>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.overdueInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#ff4d4f"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Ödeme Durumları" size="small">
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Beklemede</Text>
                <Text strong>{paymentStats?.pendingPayments ?? 0}</Text>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.pendingPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#faad14"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Reddedilen</Text>
                <Text strong>{paymentStats?.rejectedPayments ?? 0}</Text>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.rejectedPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#ff7a45"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Tamamlanan</Text>
                <Text strong>{paymentStats?.completedPayments ?? 0}</Text>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.completedPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#52c41a"
              />
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>İade</Text>
                <Text strong>{paymentStats?.refundedPayments ?? 0}</Text>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.refundedPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#ff4d4f"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders and Overdue Invoices */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Son Siparişler"
            extra={
              <Button type="link" onClick={() => router.push('/sales/orders')}>
                Tümünü Gör <RightOutlined />
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={recentOrders?.items ?? []}
              rowKey="id"
              loading={ordersLoading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                Vadesi Geçmiş Faturalar
              </span>
            }
            extra={
              <Button type="link" onClick={() => router.push('/sales/invoices?status=Overdue')}>
                Tümü <RightOutlined />
              </Button>
            }
          >
            {overdueLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>Yükleniyor...</div>
            ) : overdueInvoices?.items?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#52c41a' }}>
                <Badge status="success" text="Vadesi geçmiş fatura yok" />
              </div>
            ) : (
              <List
                size="small"
                dataSource={overdueInvoices?.items ?? []}
                renderItem={(invoice: InvoiceListItem) => {
                  const daysOverdue = dayjs().diff(dayjs(invoice.dueDate), 'day');
                  return (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/sales/invoices/${invoice.id}`)}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong>{invoice.invoiceNumber}</Text>
                            <Tag color="error">{daysOverdue} gün gecikmiş</Tag>
                          </div>
                        }
                        description={
                          <div>
                            <Text type="secondary">{invoice.customerName}</Text>
                            <br />
                            <Text strong style={{ color: '#ff4d4f' }}>
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(invoice.grandTotal)}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
