'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Spin,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Empty,
  Dropdown,
  Space,
  Steps,
  Modal,
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  ShoppingCartIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useCancelPurchaseRequest,
  useConvertRequestToOrder,
  useDeletePurchaseRequest,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseRequestStatus, PurchaseRequestPriority, PurchaseRequestItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps, TimelineItemProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<PurchaseRequestStatus, string> = {
  Draft: 'default',
  Pending: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Converted: 'blue',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Converted: 'Siparişe Dönüştürüldü',
  Cancelled: 'İptal Edildi',
};

const priorityColors: Record<PurchaseRequestPriority, string> = {
  Low: 'default',
  Normal: 'blue',
  High: 'orange',
  Urgent: 'red',
};

const priorityLabels: Record<PurchaseRequestPriority, string> = {
  Low: 'Düşük',
  Normal: 'Normal',
  High: 'Yüksek',
  Urgent: 'Acil',
};

const getStatusStep = (status: PurchaseRequestStatus): number => {
  const steps: Record<PurchaseRequestStatus, number> = {
    Draft: 0,
    Pending: 1,
    Approved: 2,
    Rejected: -1,
    Converted: 3,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const { data: request, isLoading } = usePurchaseRequest(requestId);
  const submitRequest = useSubmitPurchaseRequest();
  const approveRequest = useApprovePurchaseRequest();
  const rejectRequest = useRejectPurchaseRequest();
  const cancelRequest = useCancelPurchaseRequest();
  const convertToOrder = useConvertRequestToOrder();
  const deleteRequest = useDeletePurchaseRequest();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <Empty description="Satın alma talebi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/requests')}>
            Taleplere Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    submitRequest.mutate(requestId);
  };

  const handleApprove = () => {
    approveRequest.mutate({ id: requestId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Talebi Reddet',
      icon: <XCircleIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />,
      content: 'Bu talebi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectRequest.mutate({ id: requestId, reason: 'Manuel red' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Talebi İptal Et',
      icon: <XCircleIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />,
      content: 'Bu talebi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelRequest.mutate({ id: requestId, reason: 'Manuel iptal' }),
    });
  };

  const handleConvertToOrder = () => {
    Modal.confirm({
      title: 'Siparişe Dönüştür',
      icon: <ShoppingCartIcon className="w-4 h-4" style={{ color: '#1890ff' }} />,
      content: 'Bu talebi satın alma siparişine dönüştürmek istiyor musunuz? Tedarikçi seçimi sonraki adımda yapılacaktır.',
      okText: 'Dönüştür',
      cancelText: 'Vazgeç',
      onOk: () => {
        // Note: In real implementation, this would open a supplier selection modal
        convertToOrder.mutate({ id: requestId, supplierId: '' });
      },
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Talebi Sil',
      icon: <ExclamationCircleIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />,
      content: `"${request.requestNumber}" talebini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        deleteRequest.mutate(requestId);
        router.push('/purchase/requests');
      },
    });
  };

  const actionMenuItems = [
    request.status === 'Draft' && {
      key: 'submit',
      icon: <PaperAirplaneIcon className="w-4 h-4" />,
      label: 'Onaya Gönder',
      onClick: handleSubmit,
    },
    request.status === 'Pending' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    request.status === 'Pending' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    request.status === 'Approved' && {
      key: 'convert',
      icon: <ShoppingCartIcon className="w-4 h-4" />,
      label: 'Siparişe Dönüştür',
      onClick: handleConvertToOrder,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdır',
    },
    { type: 'divider' },
    !['Cancelled', 'Converted'].includes(request.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'İptal Et',
      danger: true,
      onClick: handleCancel,
    },
    request.status === 'Draft' && {
      key: 'delete',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: handleDelete,
    },
  ].filter(Boolean) as MenuProps['items'];

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: PurchaseRequestItemDto) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number, record: PurchaseRequestItemDto) => `${qty} ${record.unit}`,
    },
    {
      title: 'Tahmini Birim Fiyat',
      dataIndex: 'estimatedUnitPrice',
      key: 'estimatedUnitPrice',
      align: 'right' as const,
      render: (price: number) => `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
    },
    {
      title: 'Tahmini Toplam',
      dataIndex: 'estimatedTotalPrice',
      key: 'estimatedTotalPrice',
      align: 'right' as const,
      render: (price: number) => (
        <Text strong>{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
      ),
    },
    {
      title: 'Tercih Edilen Tedarikçi',
      dataIndex: 'preferredSupplierName',
      key: 'preferredSupplierName',
      render: (name: string) => name || '-',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/purchase/requests')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                <DocumentTextIcon className="w-4 h-4" style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {request.requestNumber}
                  <Tag color={statusColors[request.status as PurchaseRequestStatus]}>
                    {statusLabels[request.status as PurchaseRequestStatus]}
                  </Tag>
                  <Tag color={priorityColors[request.priority as PurchaseRequestPriority]}>
                    {priorityLabels[request.priority as PurchaseRequestPriority]}
                  </Tag>
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {request.requestedByName} • {dayjs(request.requestDate).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />}>İşlemler</Button>
            </Dropdown>
            {request.status === 'Draft' && (
              <Button
                type="primary"
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/purchase/requests/${requestId}/edit`)}
              >
                Düzenle
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Progress Steps */}
        <Card className="mb-6">
          <Steps
            current={getStatusStep(request.status as PurchaseRequestStatus)}
            status={['Rejected', 'Cancelled'].includes(request.status) ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
              { title: 'Onay Bekliyor', icon: <ClockIcon className="w-4 h-4" /> },
              { title: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
              { title: 'Siparişe Dönüştürüldü', icon: <ShoppingCartIcon className="w-4 h-4" /> },
            ]}
          />
        </Card>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Toplam Kalem"
                value={(request.items || []).length}
                suffix="adet"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Tahmini Toplam"
                value={request.estimatedTotalAmount || 0}
                precision={2}
                suffix={request.currency || '₺'}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Bütçe Tutarı"
                value={request.budgetAmount || 0}
                precision={2}
                suffix={request.currency || '₺'}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Gerekli Tarih"
                value={request.requiredDate ? dayjs(request.requiredDate).format('DD.MM.YYYY') : '-'}
                valueStyle={{ fontSize: '16px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Request Items */}
            <Card title="Talep Kalemleri" className="mb-6">
              <Table
                dataSource={request.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={5} align="right">
                        <Text strong>Toplam Tahmini Tutar</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#8b5cf6', fontSize: 16 }}>
                          {request.estimatedTotalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || '₺'}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>

            {/* Purpose & Justification */}
            {(request.purpose || request.justification) && (
              <Card title="Amaç ve Gerekçe" className="mb-6">
                {request.purpose && (
                  <div className="mb-4">
                    <Text strong>Amaç:</Text>
                    <Paragraph className="mt-1 mb-0">{request.purpose}</Paragraph>
                  </div>
                )}
                {request.justification && (
                  <div>
                    <Text strong>Gerekçe:</Text>
                    <Paragraph className="mt-1 mb-0">{request.justification}</Paragraph>
                  </div>
                )}
              </Card>
            )}

            {/* Notes */}
            {request.notes && (
              <Card title="Notlar" size="small">
                <Paragraph className="mb-0 whitespace-pre-wrap">{request.notes}</Paragraph>
              </Card>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Request Info */}
            <Card title="Talep Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Talep No">{request.requestNumber}</Descriptions.Item>
                <Descriptions.Item label="Talep Tarihi">
                  {dayjs(request.requestDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Gerekli Tarih">
                  {request.requiredDate ? dayjs(request.requiredDate).format('DD.MM.YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Öncelik">
                  <Tag color={priorityColors[request.priority as PurchaseRequestPriority]}>
                    {priorityLabels[request.priority as PurchaseRequestPriority]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Para Birimi">{request.currency || 'TRY'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Requester Info */}
            <Card title="Talep Eden" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Kişi">{request.requestedByName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Departman">{request.departmentName || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Budget Info */}
            <Card title="Bütçe Bilgileri" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Bütçe Kodu">{request.budgetCode || '-'}</Descriptions.Item>
                <Descriptions.Item label="Bütçe Tutarı">
                  {request.budgetAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || '₺'}
                </Descriptions.Item>
                <Descriptions.Item label="Tahmini Tutar">
                  {request.estimatedTotalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {request.currency || '₺'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Approval Info */}
            {(request.approvedById || request.rejectionReason) && (
              <Card title="Onay Bilgileri" size="small" className="mb-4">
                <Timeline
                  items={[
                    {
                      color: 'blue',
                      children: (
                        <div>
                          <div className="font-medium">Talep Oluşturuldu</div>
                          <div className="text-xs text-gray-500">
                            {dayjs(request.createdAt).format('DD.MM.YYYY HH:mm')}
                          </div>
                        </div>
                      ),
                    },
                    request.status !== 'Draft' && {
                      color: 'orange',
                      children: (
                        <div>
                          <div className="font-medium">Onaya Gönderildi</div>
                          <div className="text-xs text-gray-500">
                            {request.requestedByName}
                          </div>
                        </div>
                      ),
                    },
                    request.approvalDate && {
                      color: 'green',
                      children: (
                        <div>
                          <div className="font-medium">Onaylandı</div>
                          <div className="text-xs text-gray-500">
                            {request.approvedByName} • {dayjs(request.approvalDate).format('DD.MM.YYYY HH:mm')}
                          </div>
                          {request.approvalNotes && (
                            <div className="text-xs mt-1">{request.approvalNotes}</div>
                          )}
                        </div>
                      ),
                    },
                    request.rejectionReason && {
                      color: 'red',
                      children: (
                        <div>
                          <div className="font-medium">Reddedildi</div>
                          <div className="text-xs text-gray-500">
                            {request.rejectionReason}
                          </div>
                        </div>
                      ),
                    },
                  ].filter(Boolean) as TimelineItemProps[]}
                />
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
