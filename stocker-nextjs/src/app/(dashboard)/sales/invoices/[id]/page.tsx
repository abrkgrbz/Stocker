'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Card,
  Button,
  Space,
  Tag,
  Descriptions,
  Table,
  Divider,
  Spin,
  message,
  Modal,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SendOutlined,
  DollarOutlined,
  MailOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  useInvoice,
  useIssueInvoice,
  useSendInvoice,
  useCancelInvoice,
} from '@/lib/api/hooks/useInvoices';
import { usePaymentsByInvoice } from '@/lib/api/hooks/usePayments';
import type { InvoiceItem, InvoiceStatus, InvoiceType } from '@/lib/api/services/invoice.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig: Record<InvoiceStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <FileTextOutlined /> },
  Issued: { color: 'blue', label: 'Kesildi', icon: <CheckCircleOutlined /> },
  Sent: { color: 'cyan', label: 'Gönderildi', icon: <SendOutlined /> },
  PartiallyPaid: { color: 'orange', label: 'Kısmi Ödendi', icon: <DollarOutlined /> },
  Paid: { color: 'green', label: 'Ödendi', icon: <CheckCircleOutlined /> },
  Overdue: { color: 'red', label: 'Vadesi Geçmiş', icon: <CloseCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal Edildi', icon: <CloseCircleOutlined /> },
};

const typeLabels: Record<InvoiceType, string> = {
  Sales: 'Satış Faturası',
  Return: 'İade Faturası',
  Credit: 'Alacak Dekontu',
  Debit: 'Borç Dekontu',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: invoice, isLoading } = useInvoice(id);
  const { data: payments } = usePaymentsByInvoice(id);
  const issueInvoice = useIssueInvoice();
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();

  const handleIssue = async () => {
    try {
      await issueInvoice.mutateAsync(id);
      message.success('Fatura kesildi');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Fatura kesme başarısız');
    }
  };

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(id);
      message.success('Fatura gönderildi');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Gönderim başarısız');
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelInvoice.mutateAsync(id);
          message.success('Fatura iptal edildi');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'İptal işlemi başarısız');
        }
      },
    });
  };

  const itemColumns: ColumnsType<InvoiceItem> = [
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
      render: (text) => text || '-',
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      align: 'center',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
    },
    {
      title: 'İskonto %',
      dataIndex: 'discountRate',
      key: 'discountRate',
      align: 'right',
      render: (rate) => `%${rate}`,
    },
    {
      title: 'KDV %',
      dataIndex: 'vatRate',
      key: 'vatRate',
      align: 'right',
      render: (rate) => `%${rate}`,
    },
    {
      title: 'KDV Tutarı',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      align: 'right',
      render: (amount) => amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotalWithVat',
      key: 'lineTotalWithVat',
      align: 'right',
      render: (total) => (
        <span className="font-semibold">
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Text type="secondary">Fatura bulunamadı</Text>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[invoice.status];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Geri
          </Button>
          <FileTextOutlined className="text-3xl text-green-500" />
          <div>
            <Title level={2} className="!mb-0">
              {invoice.invoiceNumber}
            </Title>
            <Text type="secondary">{typeLabels[invoice.type]}</Text>
          </div>
          <Tag color={statusInfo.color} icon={statusInfo.icon} className="ml-4">
            {statusInfo.label}
          </Tag>
          {invoice.isEInvoice && <Tag color="blue">E-Fatura</Tag>}
        </div>
        <Space>
          <Button icon={<PrinterOutlined />}>Yazdır</Button>
          {invoice.status === 'Draft' && (
            <>
              <Link href={`/sales/invoices/${id}/edit`}>
                <Button icon={<EditOutlined />}>Düzenle</Button>
              </Link>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleIssue}
                loading={issueInvoice.isPending}
              >
                Kes
              </Button>
            </>
          )}
          {invoice.status === 'Issued' && (
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={handleSend}
              loading={sendInvoice.isPending}
            >
              Gönder
            </Button>
          )}
          {invoice.status !== 'Cancelled' && invoice.status !== 'Paid' && invoice.status !== 'Draft' && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleCancel}
              loading={cancelInvoice.isPending}
            >
              İptal Et
            </Button>
          )}
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Tutar"
              value={invoice.grandTotal}
              precision={2}
              suffix={invoice.currency}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ödenen Tutar"
              value={invoice.paidAmount}
              precision={2}
              suffix={invoice.currency}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kalan Tutar"
              value={invoice.balanceDue}
              precision={2}
              suffix={invoice.currency}
              valueStyle={{ color: invoice.balanceDue > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vade Tarihi"
              value={dayjs(invoice.dueDate).format('DD/MM/YYYY')}
              valueStyle={{
                color: dayjs(invoice.dueDate).isBefore(dayjs()) && invoice.balanceDue > 0
                  ? '#ff4d4f'
                  : undefined,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Invoice Info */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Fatura Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Fatura No">{invoice.invoiceNumber}</Descriptions.Item>
              <Descriptions.Item label="Fatura Tarihi">
                {dayjs(invoice.invoiceDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Vade Tarihi">
                {dayjs(invoice.dueDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Fatura Tipi">{typeLabels[invoice.type]}</Descriptions.Item>
              <Descriptions.Item label="Para Birimi">{invoice.currency}</Descriptions.Item>
              {invoice.salesOrderId && (
                <Descriptions.Item label="Sipariş">
                  <Link href={`/sales/orders/${invoice.salesOrderId}`} className="text-blue-600">
                    Siparişi Görüntüle
                  </Link>
                </Descriptions.Item>
              )}
              {invoice.paymentTerms && (
                <Descriptions.Item label="Ödeme Koşulları">{invoice.paymentTerms}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Müşteri Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Müşteri Adı">{invoice.customerName}</Descriptions.Item>
              {invoice.customerEmail && (
                <Descriptions.Item label="E-posta">{invoice.customerEmail}</Descriptions.Item>
              )}
              {invoice.customerTaxNumber && (
                <Descriptions.Item label="Vergi No">{invoice.customerTaxNumber}</Descriptions.Item>
              )}
              {invoice.customerAddress && (
                <Descriptions.Item label="Adres">{invoice.customerAddress}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* E-Invoice Info */}
      {invoice.isEInvoice && (
        <Card title="E-Fatura Bilgileri" className="mb-6">
          <Descriptions column={3} size="small">
            <Descriptions.Item label="E-Fatura ID">{invoice.eInvoiceId || '-'}</Descriptions.Item>
            <Descriptions.Item label="E-Fatura Durumu">{invoice.eInvoiceStatus || '-'}</Descriptions.Item>
            <Descriptions.Item label="Gönderim Tarihi">
              {invoice.eInvoiceSentAt ? dayjs(invoice.eInvoiceSentAt).format('DD/MM/YYYY HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Items Table */}
      <Card title="Fatura Kalemleri" className="mb-6">
        <Table
          columns={itemColumns}
          dataSource={invoice.items}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={9} align="right">
                  <Text strong>Ara Toplam:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2} align="right">
                  <Text strong>
                    {invoice.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              {invoice.discountAmount > 0 && (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={9} align="right">
                    <Text>İskonto ({invoice.discountRate}%):</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2} align="right">
                    <Text type="danger">
                      -{invoice.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={9} align="right">
                  <Text>KDV Toplam:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2} align="right">
                  <Text>
                    {invoice.taxTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row className="bg-gray-50">
                <Table.Summary.Cell index={0} colSpan={9} align="right">
                  <Text strong className="text-lg">Genel Toplam:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2} align="right">
                  <Text strong className="text-lg text-blue-600">
                    {invoice.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {invoice.currency}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Payments */}
      {payments && payments.length > 0 && (
        <Card title="Ödemeler" className="mb-6">
          <Table
            dataSource={payments}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Ödeme No',
                dataIndex: 'paymentNumber',
                key: 'paymentNumber',
                render: (text, record) => (
                  <Link href={`/sales/payments/${record.id}`} className="text-blue-600">
                    {text}
                  </Link>
                ),
              },
              {
                title: 'Tarih',
                dataIndex: 'paymentDate',
                key: 'paymentDate',
                render: (date) => dayjs(date).format('DD/MM/YYYY'),
              },
              {
                title: 'Yöntem',
                dataIndex: 'method',
                key: 'method',
              },
              {
                title: 'Tutar',
                dataIndex: 'amount',
                key: 'amount',
                align: 'right',
                render: (amount, record) => (
                  <span className="font-semibold text-green-600">
                    {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
                  </span>
                ),
              },
              {
                title: 'Durum',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'orange' : 'default'}>
                    {status}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Notes */}
      {invoice.notes && (
        <Card title="Notlar">
          <Text>{invoice.notes}</Text>
        </Card>
      )}

      {/* Timestamps */}
      <Card className="mt-6">
        <Descriptions size="small">
          <Descriptions.Item label="Oluşturulma">
            {dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Son Güncelleme">
            {dayjs(invoice.updatedAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          {invoice.sentAt && (
            <Descriptions.Item label="Gönderilme">
              {dayjs(invoice.sentAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}
