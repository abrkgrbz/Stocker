'use client';

import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Spin,
  Modal,
  Input,
  message,
  Row,
  Col,
  Statistic,
  Divider,
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  DocumentIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import {
  useSalesOrder,
  useApproveSalesOrder,
  useCancelSalesOrder,
  useConfirmSalesOrder,
  useShipSalesOrder,
  useDeliverSalesOrder,
  useCompleteSalesOrder,
} from '@/lib/api/hooks/useSales';
import { useCreateInvoiceFromOrder } from '@/lib/api/hooks/useInvoices';
import type { SalesOrderItem, SalesOrderStatus } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';
import { generateSalesOrderPDF } from '@/lib/utils/pdf-export';

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

export default function SalesOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: order, isLoading } = useSalesOrder(id);
  const approveMutation = useApproveSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const confirmMutation = useConfirmSalesOrder();
  const shipMutation = useShipSalesOrder();
  const deliverMutation = useDeliverSalesOrder();
  const completeMutation = useCompleteSalesOrder();
  const createInvoiceMutation = useCreateInvoiceFromOrder();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Sipariş onaylandı');
    } catch {
      message.error('Sipariş onaylanamadı');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      message.error('İptal sebebi girilmelidir');
      return;
    }
    try {
      await cancelMutation.mutateAsync({ id, reason: cancelReason });
      message.success('Sipariş iptal edildi');
      setCancelModalOpen(false);
    } catch {
      message.error('Sipariş iptal edilemedi');
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const invoice = await createInvoiceMutation.mutateAsync({
        salesOrderId: id,
        invoiceDate: new Date().toISOString(),
        dueDate: dayjs().add(30, 'day').toISOString(),
      });
      message.success('Fatura başarıyla oluşturuldu');
      router.push(`/sales/invoices/${invoice.id}`);
    } catch {
      message.error('Fatura oluşturulamadı');
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync(id);
      message.success('Sipariş müşteri tarafından onaylandı');
    } catch {
      message.error('Sipariş onaylanamadı');
    }
  };

  const handleShip = async () => {
    try {
      await shipMutation.mutateAsync(id);
      message.success('Sipariş gönderildi');
    } catch {
      message.error('Sipariş gönderilemedi');
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverMutation.mutateAsync(id);
      message.success('Sipariş teslim edildi');
    } catch {
      message.error('Sipariş teslim edilemedi');
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(id);
      message.success('Sipariş tamamlandı');
    } catch {
      message.error('Sipariş tamamlanamadı');
    }
  };

  const handleExportPDF = async () => {
    if (!order) return;
    setPdfLoading(true);
    try {
      await generateSalesOrderPDF(order);
      message.success('PDF başarıyla oluşturuldu');
    } catch (error) {
      message.error('PDF oluşturulurken hata oluştu');
    } finally {
      setPdfLoading(false);
    }
  };

  const itemColumns = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 50,
    },
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || '-',
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: order?.currency || 'TRY' }).format(price),
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountRate',
      key: 'discountRate',
      align: 'right' as const,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'KDV %',
      dataIndex: 'vatRate',
      key: 'vatRate',
      align: 'right' as const,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Satır Toplamı',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right' as const,
      render: (total: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: order?.currency || 'TRY' }).format(total),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="secondary">Sipariş bulunamadı</Text>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: order.currency }).format(amount);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/orders')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Sipariş {order.orderNumber}
            </Title>
            <Text type="secondary">
              {dayjs(order.orderDate).format('DD MMMM YYYY')} tarihinde oluşturuldu
            </Text>
          </div>
        </Space>
        <Space>
          <Tag color={statusColors[order.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
            {statusLabels[order.status]}
          </Tag>
          {order.status === 'Draft' && (
            <>
              <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/sales/orders/${id}/edit`)}>
                Düzenle
              </Button>
              <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} onClick={handleApprove} loading={approveMutation.isPending}>
                Onayla
              </Button>
            </>
          )}
          {order.status === 'Approved' && (
            <Button type="primary" icon={<CheckCircleIcon className="w-4 h-4" />} onClick={handleConfirm} loading={confirmMutation.isPending}>
              Müşteri Onayı
            </Button>
          )}
          {order.status === 'Confirmed' && (
            <Button type="primary" icon={<PaperAirplaneIcon className="w-4 h-4" />} onClick={handleShip} loading={shipMutation.isPending}>
              Gönderildi
            </Button>
          )}
          {order.status === 'Shipped' && (
            <Button type="primary" icon={<TruckIcon className="w-4 h-4" />} onClick={handleDeliver} loading={deliverMutation.isPending}>
              Teslim Edildi
            </Button>
          )}
          {order.status === 'Delivered' && (
            <Button type="primary" icon={<CheckCircleIcon className="w-4 h-4" />} onClick={handleComplete} loading={completeMutation.isPending}>
              Tamamla
            </Button>
          )}
          {order.status !== 'Cancelled' && order.status !== 'Completed' && (
            <Button danger icon={<XMarkIcon className="w-4 h-4" />} onClick={() => setCancelModalOpen(true)}>
              İptal Et
            </Button>
          )}
          {order.status !== 'Cancelled' && order.status !== 'Draft' && (
            <Button
              icon={<DocumentTextIcon className="w-4 h-4" />}
              onClick={handleCreateInvoice}
              loading={createInvoiceMutation.isPending}
            >
              Fatura Oluştur
            </Button>
          )}
          <Button icon={<DocumentIcon className="w-4 h-4" />} onClick={handleExportPDF} loading={pdfLoading}>
            PDF İndir
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Ara Toplam" value={order.subTotal} formatter={(val) => formatCurrency(val as number)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="İndirim"
              value={order.discountAmount}
              formatter={(val) => formatCurrency(val as number)}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="KDV" value={order.vatAmount} formatter={(val) => formatCurrency(val as number)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Genel Toplam"
              value={order.totalAmount}
              formatter={(val) => formatCurrency(val as number)}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Order Details */}
        <Col xs={24} lg={16}>
          <Card title="Sipariş Bilgileri" style={{ marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
              <Descriptions.Item label="Sipariş No">{order.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="Sipariş Tarihi">
                {dayjs(order.orderDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Müşteri">{order.customerName}</Descriptions.Item>
              <Descriptions.Item label="E-posta">{order.customerEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="Teslim Tarihi">
                {order.deliveryDate ? dayjs(order.deliveryDate).format('DD.MM.YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Satış Temsilcisi">{order.salesPersonName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Para Birimi">{order.currency}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusColors[order.status]}>{statusLabels[order.status]}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Addresses */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title="Teslimat Adresi" size="small">
                <Text>{order.shippingAddress || 'Belirtilmemiş'}</Text>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Fatura Adresi" size="small">
                <Text>{order.billingAddress || 'Belirtilmemiş'}</Text>
              </Card>
            </Col>
          </Row>

          {/* Notes */}
          {order.notes && (
            <Card title="Notlar" size="small" style={{ marginBottom: 16 }}>
              <Text>{order.notes}</Text>
            </Card>
          )}

          {/* Items */}
          <Card title={`Sipariş Kalemleri (${order.items.length})`}>
            <Table
              columns={itemColumns}
              dataSource={order.items}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={9} align="right">
                      <strong>Ara Toplam:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{formatCurrency(order.subTotal)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {order.discountAmount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={9} align="right">
                        <Text type="danger">İndirim ({order.discountRate}%):</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text type="danger">-{formatCurrency(order.discountAmount)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={9} align="right">
                      KDV Toplam:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      {formatCurrency(order.vatAmount)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={9} align="right">
                      <strong style={{ fontSize: 16 }}>Genel Toplam:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ fontSize: 16, color: '#3f8600' }}>{formatCurrency(order.totalAmount)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Timeline */}
          <Card title="İşlem Geçmişi" style={{ marginBottom: 16 }}>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Sipariş Oluşturuldu</Text>
                      <br />
                      <Text type="secondary">{dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                    </>
                  ),
                },
                ...(order.approvedAt
                  ? [
                      {
                        color: 'blue',
                        children: (
                          <>
                            <Text strong>Onaylandı</Text>
                            <br />
                            <Text type="secondary">{dayjs(order.approvedAt).format('DD.MM.YYYY HH:mm')}</Text>
                            {order.approvedBy && (
                              <>
                                <br />
                                <Text type="secondary">Onaylayan: {order.approvedBy}</Text>
                              </>
                            )}
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(order.cancelledAt
                  ? [
                      {
                        color: 'red',
                        children: (
                          <>
                            <Text strong>İptal Edildi</Text>
                            <br />
                            <Text type="secondary">{dayjs(order.cancelledAt).format('DD.MM.YYYY HH:mm')}</Text>
                            {order.cancelledReason && (
                              <>
                                <br />
                                <Text type="secondary">Sebep: {order.cancelledReason}</Text>
                              </>
                            )}
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(order.updatedAt !== order.createdAt
                  ? [
                      {
                        color: 'gray',
                        children: (
                          <>
                            <Text strong>Son Güncelleme</Text>
                            <br />
                            <Text type="secondary">{dayjs(order.updatedAt).format('DD.MM.YYYY HH:mm')}</Text>
                          </>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Card>

          {/* Quick Actions */}
          <Card title="Hızlı İşlemler">
            <Space direction="vertical" style={{ width: '100%' }}>
              {order.status !== 'Cancelled' && order.status !== 'Draft' && (
                <Button
                  block
                  icon={<DocumentTextIcon className="w-4 h-4" />}
                  onClick={handleCreateInvoice}
                  loading={createInvoiceMutation.isPending}
                >
                  Fatura Oluştur
                </Button>
              )}
              <Button block icon={<DocumentIcon className="w-4 h-4" />} onClick={handleExportPDF} loading={pdfLoading}>
                PDF İndir
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Cancel Modal */}
      <Modal
        title="Siparişi İptal Et"
        open={cancelModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => setCancelModalOpen(false)}
        okText="İptal Et"
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={cancelMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            <strong>{order.orderNumber}</strong> numaralı siparişi iptal etmek üzeresiniz.
          </Text>
        </div>
        <Input.TextArea
          placeholder="İptal sebebini giriniz..."
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
