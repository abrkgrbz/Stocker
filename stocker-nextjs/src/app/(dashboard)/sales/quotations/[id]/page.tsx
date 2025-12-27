'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Spin,
  Divider,
  Timeline,
  message,
  Modal,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import {
  useQuotation,
  useApproveQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useConvertQuotationToOrder,
} from '@/lib/api/hooks/useSales';
import type { QuotationStatus } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: Record<QuotationStatus, string> = {
  Draft: 'default',
  PendingApproval: 'processing',
  Approved: 'cyan',
  Sent: 'blue',
  Accepted: 'success',
  Rejected: 'error',
  Expired: 'warning',
  Cancelled: 'default',
  ConvertedToOrder: 'geekblue',
};

const statusLabels: Record<QuotationStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Sent: 'Gönderildi',
  Accepted: 'Kabul Edildi',
  Rejected: 'Reddedildi',
  Expired: 'Süresi Doldu',
  Cancelled: 'İptal',
  ConvertedToOrder: 'Siparişe Dönüştürüldü',
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: quotation, isLoading } = useQuotation(id);
  const approveMutation = useApproveQuotation();
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();
  const convertMutation = useConvertQuotationToOrder();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Teklif onaylandı');
    } catch {
      message.error('Teklif onaylanamadı');
    }
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(id);
      message.success('Teklif gönderildi');
    } catch {
      message.error('Teklif gönderilemedi');
    }
  };

  const handleAccept = async () => {
    try {
      await acceptMutation.mutateAsync(id);
      message.success('Teklif kabul edildi');
    } catch {
      message.error('Teklif kabul edilemedi');
    }
  };

  const handleConvertToOrder = async () => {
    Modal.confirm({
      title: 'Siparişe Dönüştür',
      content: 'Bu teklifi siparişe dönüştürmek istediğinizden emin misiniz?',
      okText: 'Dönüştür',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await convertMutation.mutateAsync(id);
          message.success('Teklif siparişe dönüştürüldü');
          router.push('/sales/orders');
        } catch {
          message.error('Teklif siparişe dönüştürülemedi');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">Teklif bulunamadı</Text>
      </div>
    );
  }

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
    },
    {
      title: 'Birim',
      dataIndex: 'unitName',
      key: 'unitName',
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quotation.currency }).format(price),
    },
    {
      title: 'İndirim',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      align: 'right' as const,
      render: (amount: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quotation.currency }).format(amount),
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right' as const,
      render: (total: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quotation.currency }).format(total),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/quotations')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Teklif: {quotation.quotationNumber}
          </Title>
          <Tag color={statusColors[quotation.status as QuotationStatus]}>
            {statusLabels[quotation.status as QuotationStatus]}
          </Tag>
        </Space>
        <Space>
          <Button icon={<PrinterIcon className="w-4 h-4" />}>Yazdır</Button>
          {quotation.status === 'Draft' && (
            <>
              <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/sales/quotations/${id}/edit`)}>
                Düzenle
              </Button>
              <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} onClick={handleApprove}>
                Onayla
              </Button>
            </>
          )}
          {quotation.status === 'Approved' && (
            <Button type="primary" icon={<PaperAirplaneIcon className="w-4 h-4" />} onClick={handleSend}>
              Gönder
            </Button>
          )}
          {quotation.status === 'Sent' && (
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} onClick={handleAccept}>
              Kabul Et
            </Button>
          )}
          {quotation.status === 'Accepted' && (
            <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleConvertToOrder}>
              Siparişe Dönüştür
            </Button>
          )}
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          {/* Quotation Info */}
          <Card title="Teklif Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Teklif No">{quotation.quotationNumber}</Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {dayjs(quotation.quotationDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Geçerlilik Tarihi">
                {quotation.validUntil ? dayjs(quotation.validUntil).format('DD.MM.YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Revizyon">
                {quotation.revisionNumber || 1}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Customer Info */}
          <Card title="Müşteri Bilgileri" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Müşteri">{quotation.customerName}</Descriptions.Item>
              <Descriptions.Item label="İletişim">{quotation.contactName || '-'}</Descriptions.Item>
              <Descriptions.Item label="E-posta">{quotation.contactEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="Telefon">{quotation.contactPhone || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Items */}
          <Card title="Teklif Kalemleri" style={{ marginBottom: 24 }}>
            <Table
              columns={itemColumns}
              dataSource={quotation.items}
              rowKey="id"
              pagination={false}
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <strong>Ara Toplam:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quotation.currency }).format(quotation.subTotal)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {(quotation.taxAmount ?? quotation.taxTotal) > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={5} align="right">
                        KDV:
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quotation.currency }).format(quotation.taxAmount ?? quotation.taxTotal)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <strong>Genel Toplam:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ fontSize: 16, color: '#1890ff' }}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: quotation.currency }).format(quotation.grandTotal)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            />
          </Card>

          {/* Notes */}
          {(quotation.notes || quotation.termsAndConditions) && (
            <Card title="Notlar & Koşullar">
              {quotation.notes && (
                <>
                  <Text strong>Notlar:</Text>
                  <p>{quotation.notes}</p>
                </>
              )}
              {quotation.termsAndConditions && (
                <>
                  <Divider />
                  <Text strong>Şartlar ve Koşullar:</Text>
                  <p>{quotation.termsAndConditions}</p>
                </>
              )}
            </Card>
          )}
        </div>

        <div>
          {/* Timeline */}
          <Card title="Durum Geçmişi">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Oluşturuldu</Text>
                      <br />
                      <Text type="secondary">{dayjs(quotation.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                    </>
                  ),
                },
                ...(quotation.approvedAt
                  ? [{
                      color: 'blue',
                      children: (
                        <>
                          <Text strong>Onaylandı</Text>
                          <br />
                          <Text type="secondary">{dayjs(quotation.approvedAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
                ...(quotation.sentAt
                  ? [{
                      color: 'cyan',
                      children: (
                        <>
                          <Text strong>Gönderildi</Text>
                          <br />
                          <Text type="secondary">{dayjs(quotation.sentAt).format('DD.MM.YYYY HH:mm')}</Text>
                        </>
                      ),
                    }]
                  : []),
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
