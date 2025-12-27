'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Table,
  Space,
  Spin,
  Dropdown,
  Modal,
  Divider,
  Progress,
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  PencilIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import {
  useQuotation,
  useSendQuotationToSuppliers,
  useSelectQuotationSupplier,
  useConvertQuotationToOrder,
  useCancelQuotation,
} from '@/lib/api/hooks/usePurchase';
import type { QuotationStatus, QuotationSupplierDto } from '@/lib/api/services/purchase.types';

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<QuotationStatus, { color: string; text: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', text: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
  Sent: { color: 'blue', text: 'Gönderildi', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
  PartiallyResponded: { color: 'orange', text: 'Kısmi Yanıt', icon: <ClockIcon className="w-4 h-4" /> },
  FullyResponded: { color: 'cyan', text: 'Tam Yanıt', icon: <CheckCircleIcon className="w-4 h-4" /> },
  UnderReview: { color: 'purple', text: 'İnceleniyor', icon: <ClockIcon className="w-4 h-4" /> },
  Evaluated: { color: 'purple', text: 'Değerlendirildi', icon: <CheckCircleIcon className="w-4 h-4" /> },
  SupplierSelected: { color: 'green', text: 'Tedarikçi Seçildi', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Awarded: { color: 'green', text: 'Kazanan Belirlendi', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Converted: { color: 'geekblue', text: 'Siparişe Dönüştü', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Cancelled: { color: 'red', text: 'İptal', icon: <XCircleIcon className="w-4 h-4" /> },
  Closed: { color: 'gray', text: 'Kapatıldı', icon: <XCircleIcon className="w-4 h-4" /> },
  Expired: { color: 'volcano', text: 'Süresi Doldu', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: quotation, isLoading } = useQuotation(id);
  const sendMutation = useSendQuotationToSuppliers();
  const selectMutation = useSelectQuotationSupplier();
  const convertMutation = useConvertQuotationToOrder();
  const cancelMutation = useCancelQuotation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-6">
        <Text type="danger">Teklif talebi bulunamadı</Text>
      </div>
    );
  }

  const status = statusConfig[quotation.status as QuotationStatus] || statusConfig.Draft;

  const handleSendToSuppliers = () => {
    const supplierIds = quotation.suppliers?.map(s => s.supplierId) || [];
    if (supplierIds.length === 0) {
      Modal.warning({ title: 'Uyarı', content: 'Tedarikçi seçilmemiş' });
      return;
    }
    sendMutation.mutate({ id, supplierIds });
  };

  const handleSelectSupplier = (supplierId: string) => {
    Modal.confirm({
      title: 'Tedarikçi Seçimi',
      content: 'Bu tedarikçiyi kazanan olarak seçmek istediğinize emin misiniz?',
      onOk: () => selectMutation.mutate({ id, supplierId }),
    });
  };

  const handleConvertToOrder = () => {
    Modal.confirm({
      title: 'Satın Alma Siparişi Oluştur',
      content: 'Bu teklif talebini satın alma siparişine dönüştürmek istediğinize emin misiniz?',
      onOk: () => convertMutation.mutate(id),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'İptal Et',
      content: 'Bu teklif talebini iptal etmek istediğinize emin misiniz?',
      okType: 'danger',
      onOk: () => cancelMutation.mutate({ id, reason: 'Kullanıcı tarafından iptal edildi' }),
    });
  };

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
      width: 100,
      align: 'right' as const,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: 'Özellikler',
      dataIndex: 'specifications',
      key: 'specifications',
      ellipsis: true,
    },
  ];

  const supplierColumns = [
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text: string, record: QuotationSupplierDto) => (
        <Space>
          <BuildingStorefrontIcon className="w-4 h-4" />
          <span>{text}</span>
          {record.isSelected && <Tag color="green">Kazanan</Tag>}
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          Pending: 'default',
          Sent: 'blue',
          Responded: 'green',
          Declined: 'red',
          Selected: 'purple',
        };
        const statusTexts: Record<string, string> = {
          Pending: 'Bekliyor',
          Sent: 'Gönderildi',
          Responded: 'Yanıtladı',
          Declined: 'Reddetti',
          Selected: 'Seçildi',
        };
        return <Tag color={statusColors[status]}>{statusTexts[status] || status}</Tag>;
      },
    },
    {
      title: 'Teklif Tutarı',
      dataIndex: 'quotedAmount',
      key: 'quotedAmount',
      width: 140,
      align: 'right' as const,
      render: (amount: number) =>
        amount ? amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-',
    },
    {
      title: 'Yanıt Tarihi',
      dataIndex: 'respondedAt',
      key: 'respondedAt',
      width: 140,
      render: (date: string) => (date ? new Date(date).toLocaleDateString('tr-TR') : '-'),
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 100,
      render: (_: any, record: QuotationSupplierDto) =>
        record.status === 'Responded' && quotation.status !== 'Awarded' && (
          <Button
            type="link"
            size="small"
            onClick={() => handleSelectSupplier(record.supplierId)}
          >
            Seç
          </Button>
        ),
    },
  ];

  // Calculate response progress
  const totalSuppliers = quotation.suppliers?.length || 0;
  const respondedSuppliers = quotation.suppliers?.filter(s => s.status === 'Responded').length || 0;
  const responseProgress = totalSuppliers > 0 ? (respondedSuppliers / totalSuppliers) * 100 : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} />
          <div>
            <div className="flex items-center gap-3">
              <Title level={3} className="mb-0">{quotation.quotationNumber}</Title>
              <Tag color={status.color} icon={status.icon}>
                {status.text}
              </Tag>
            </div>
            <Text type="secondary">{quotation.title}</Text>
          </div>
        </div>

        <Space>
          {quotation.status === 'Draft' && (
            <>
              <Button
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/purchase/quotations/${id}/edit`)}
              >
                Düzenle
              </Button>
              <Button
                type="primary"
                icon={<PaperAirplaneIcon className="w-4 h-4" />}
                onClick={handleSendToSuppliers}
                loading={sendMutation.isPending}
              >
                Tedarikçilere Gönder
              </Button>
            </>
          )}
          {quotation.status === 'Awarded' && (
            <Button
              type="primary"
              icon={<ShoppingCartIcon className="w-4 h-4" />}
              onClick={handleConvertToOrder}
              loading={convertMutation.isPending}
            >
              Sipariş Oluştur
            </Button>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'cancel',
                  label: 'İptal Et',
                  icon: <XCircleIcon className="w-4 h-4" />,
                  danger: true,
                  disabled: quotation.status === 'Cancelled' || quotation.status === 'Closed',
                  onClick: handleCancel,
                },
              ],
            }}
          >
            <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
          </Dropdown>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Basic Info */}
          <Card title="Teklif Talebi Bilgileri" bordered={false} className="shadow-sm mb-6">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Başlık">{quotation.title}</Descriptions.Item>
              <Descriptions.Item label="Talep No">{quotation.quotationNumber}</Descriptions.Item>
              <Descriptions.Item label="Son Teklif Tarihi">
                {quotation.responseDeadline
                  ? new Date(quotation.responseDeadline).toLocaleDateString('tr-TR')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Geçerlilik Süresi">
                {quotation.validityPeriod} gün
              </Descriptions.Item>
              <Descriptions.Item label="Para Birimi">{quotation.currency}</Descriptions.Item>
              <Descriptions.Item label="Ödeme Koşulları">{quotation.paymentTerms || '-'}</Descriptions.Item>
              <Descriptions.Item label="Teslimat Yeri" span={2}>
                {quotation.deliveryLocation || '-'}
              </Descriptions.Item>
            </Descriptions>
            {quotation.description && (
              <>
                <Divider />
                <Paragraph className="text-gray-600">{quotation.description}</Paragraph>
              </>
            )}
          </Card>

          {/* Items */}
          <Card title="Ürünler" bordered={false} className="shadow-sm mb-6">
            <Table
              columns={itemColumns}
              dataSource={quotation.items || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>

          {/* Suppliers */}
          <Card title="Tedarikçiler" bordered={false} className="shadow-sm">
            {totalSuppliers > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Yanıt Durumu</span>
                  <span>{respondedSuppliers} / {totalSuppliers} yanıt</span>
                </div>
                <Progress percent={responseProgress} showInfo={false} />
              </div>
            )}
            <Table
              columns={supplierColumns}
              dataSource={quotation.suppliers || []}
              rowKey="supplierId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Status Card */}
          <Card bordered={false} className="shadow-sm mb-6">
            <div
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <DocumentTextIcon className="w-12 h-12 text-blue-500" />
              <div className="text-white/90 font-medium mt-2">{quotation.quotationNumber}</div>
              <Tag color={status.color} className="mt-2">{status.text}</Tag>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Oluşturulma">
                {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {quotation.updatedAt ? new Date(quotation.updatedAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturan">{quotation.createdByName || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card title="Notlar" bordered={false} className="shadow-sm mb-6">
              <Paragraph className="text-gray-600 mb-0">{quotation.notes}</Paragraph>
            </Card>
          )}

          {/* Timeline - Simplified */}
          <Card title="İşlem Geçmişi" bordered={false} className="shadow-sm">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="font-medium">Oluşturuldu</div>
                      <div className="text-sm text-gray-500">
                        {new Date(quotation.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  ),
                },
                ...(quotation.status !== 'Draft'
                  ? [
                      {
                        color: 'blue',
                        children: (
                          <div>
                            <div className="font-medium">Tedarikçilere Gönderildi</div>
                          </div>
                        ),
                      },
                    ]
                  : []),
                ...(quotation.status === 'Awarded'
                  ? [
                      {
                        color: 'purple',
                        children: (
                          <div>
                            <div className="font-medium">Kazanan Belirlendi</div>
                          </div>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
