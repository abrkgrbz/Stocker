'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
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
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PrinterIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  usePurchaseReturn,
  useApprovePurchaseReturn,
  useRejectPurchaseReturn,
  useCancelPurchaseReturn,
  useShipPurchaseReturn,
  useReceivePurchaseReturn,
  useProcessPurchaseRefund,
  useSubmitReturnForApproval,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseReturnStatus, PurchaseReturnReason, PurchaseReturnItemDto } from '@/lib/api/services/purchase.types';
import type { MenuProps, TimelineItemProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<PurchaseReturnStatus, string> = {
  Draft: 'default',
  Pending: 'blue',
  Approved: 'cyan',
  Rejected: 'red',
  Shipped: 'geekblue',
  Received: 'purple',
  Completed: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseReturnStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandi',
  Rejected: 'Reddedildi',
  Shipped: 'Gonderildi',
  Received: 'Teslim Alindi',
  Completed: 'Tamamlandi',
  Cancelled: 'Iptal',
};

const reasonLabels: Record<PurchaseReturnReason, string> = {
  Defective: 'Kusurlu',
  WrongItem: 'Yanlis Urun',
  WrongQuantity: 'Yanlis Miktar',
  Damaged: 'Hasarli',
  QualityIssue: 'Kalite Sorunu',
  Expired: 'Vadesi Gecmis',
  NotAsDescribed: 'Tanimlandigi Gibi Degil',
  Other: 'Diger',
};

const reasonColors: Record<PurchaseReturnReason, string> = {
  Defective: 'red',
  WrongItem: 'orange',
  WrongQuantity: 'gold',
  Damaged: 'volcano',
  QualityIssue: 'magenta',
  Expired: 'purple',
  NotAsDescribed: 'blue',
  Other: 'default',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Defective: 'Kusurlu Urun',
  Warranty: 'Garanti',
  Exchange: 'Degisim',
};

const refundMethodLabels: Record<string, string> = {
  Credit: 'Alacak',
  BankTransfer: 'Havale/EFT',
  Check: 'Cek',
  Cash: 'Nakit',
  Replacement: 'Urun Degisimi',
};

const getStatusStep = (status: PurchaseReturnStatus): number => {
  const steps: Record<PurchaseReturnStatus, number> = {
    Draft: 0,
    Pending: 1,
    Approved: 2,
    Shipped: 3,
    Received: 4,
    Completed: 5,
    Rejected: -1,
    Cancelled: -1,
  };
  return steps[status] ?? 0;
};

export default function PurchaseReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;

  const { data: purchaseReturn, isLoading } = usePurchaseReturn(returnId);
  const approveReturn = useApprovePurchaseReturn();
  const rejectReturn = useRejectPurchaseReturn();
  const cancelReturn = useCancelPurchaseReturn();
  const shipReturn = useShipPurchaseReturn();
  const receiveReturn = useReceivePurchaseReturn();
  const processRefund = useProcessPurchaseRefund();
  const submitForApproval = useSubmitReturnForApproval();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
          <ArrowUturnLeftIcon className="w-8 h-8 text-white" />
        </div>
        <Spin size="large" />
      </div>
    );
  }

  if (!purchaseReturn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
          <ArrowUturnLeftIcon className="w-8 h-8 text-white" />
        </div>
        <Empty description="Iade belgesi bulunamadi" />
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/purchase/returns')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Iadelere Don
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveReturn.mutate({ id: returnId });
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'Iade Talebini Reddet',
      content: 'Bu iade talebini reddetmek istediginizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => rejectReturn.mutate({ id: returnId, reason: 'Manuel ret' }),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Iade Talebini Iptal Et',
      content: 'Bu iade talebini iptal etmek istediginizden emin misiniz?',
      okText: 'Iptal Et',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => cancelReturn.mutate({ id: returnId, reason: 'Manuel iptal' }),
    });
  };

  const handleShip = () => {
    Modal.confirm({
      title: 'Iade Gonderimi',
      content: 'Iadeyi gonderildi olarak isaretlemek istediginizden emin misiniz?',
      okText: 'Gonder',
      cancelText: 'Vazgec',
      onOk: () => shipReturn.mutate({
        id: returnId,
        trackingNumber: `TRK-${Date.now()}`,
      }),
    });
  };

  const handleReceive = () => {
    receiveReturn.mutate(returnId);
  };

  const handleProcessRefund = () => {
    processRefund.mutate({
      id: returnId,
      refundDetails: {
        amount: purchaseReturn.totalAmount,
        refundReference: `REF-${Date.now()}`,
      },
    });
  };

  const handleSubmitForApproval = () => {
    submitForApproval.mutate(returnId);
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const actionMenuItems = [
    purchaseReturn.status === 'Draft' && {
      key: 'submit',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onaya Gonder',
      onClick: handleSubmitForApproval,
    },
    purchaseReturn.status === 'Pending' && {
      key: 'approve',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Onayla',
      onClick: handleApprove,
    },
    purchaseReturn.status === 'Pending' && {
      key: 'reject',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Reddet',
      danger: true,
      onClick: handleReject,
    },
    purchaseReturn.status === 'Approved' && {
      key: 'ship',
      icon: <PaperAirplaneIcon className="w-4 h-4" />,
      label: 'Gonder',
      onClick: handleShip,
    },
    purchaseReturn.status === 'Shipped' && {
      key: 'receive',
      icon: <InboxIcon className="w-4 h-4" />,
      label: 'Teslim Alindi',
      onClick: handleReceive,
    },
    purchaseReturn.status === 'Received' && {
      key: 'refund',
      icon: <CurrencyDollarIcon className="w-4 h-4" />,
      label: 'Iade Isle',
      onClick: handleProcessRefund,
    },
    {
      key: 'print',
      icon: <PrinterIcon className="w-4 h-4" />,
      label: 'Yazdir',
    },
    { type: 'divider' },
    !['Cancelled', 'Completed'].includes(purchaseReturn.status) && {
      key: 'cancel',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: 'Iptal Et',
      danger: true,
      onClick: handleCancel,
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
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: PurchaseReturnItemDto) => (
        <div>
          <div className="font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number, record: PurchaseReturnItemDto) => (
        <span className="text-slate-700">{qty} {record.unit}</span>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-slate-700">{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      title: 'KDV',
      key: 'vat',
      align: 'right' as const,
      render: (_: any, record: PurchaseReturnItemDto) => (
        <span className="text-slate-600">
          %{record.vatRate}
          <div className="text-xs text-slate-400">
            {record.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
        </span>
      ),
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag color={reasonColors[reason as PurchaseReturnReason] || 'default'}>
          {reasonLabels[reason as PurchaseReturnReason] || reason}
        </Tag>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong className="text-slate-900">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/returns')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <ArrowUturnLeftIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    {purchaseReturn.returnNumber}
                    <Tag color={statusColors[purchaseReturn.status as PurchaseReturnStatus]}>
                      {statusLabels[purchaseReturn.status as PurchaseReturnStatus]}
                    </Tag>
                  </h1>
                  <p className="text-sm text-slate-500">
                    {purchaseReturn.supplierName} - {dayjs(purchaseReturn.returnDate).format('DD.MM.YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <Space>
              <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                  Islemler
                </button>
              </Dropdown>
              {purchaseReturn.status === 'Draft' && (
                <button
                  onClick={() => router.push(`/purchase/returns/${returnId}/edit`)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Duzenle
                </button>
              )}
            </Space>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Progress Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <Steps
            current={getStatusStep(purchaseReturn.status as PurchaseReturnStatus)}
            status={['Rejected', 'Cancelled'].includes(purchaseReturn.status) ? 'error' : 'process'}
            items={[
              { title: 'Taslak', icon: <DocumentTextIcon className="w-4 h-4" /> },
              { title: 'Onay Bekliyor' },
              { title: 'Onaylandi', icon: <CheckCircleIcon className="w-4 h-4" /> },
              { title: 'Gonderildi', icon: <TruckIcon className="w-4 h-4" /> },
              { title: 'Teslim Alindi', icon: <InboxIcon className="w-4 h-4" /> },
              { title: 'Tamamlandi', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <Statistic
                title={<span className="text-slate-500">Iade Tutari</span>}
                value={purchaseReturn.totalAmount}
                precision={2}
                suffix={purchaseReturn.currency || 'TRY'}
                valueStyle={{ color: '#0f172a' }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <Statistic
                title={<span className="text-slate-500">Iade Edilen</span>}
                value={purchaseReturn.refundAmount}
                precision={2}
                suffix={purchaseReturn.currency || 'TRY'}
                valueStyle={{ color: purchaseReturn.refundAmount > 0 ? '#22c55e' : '#9ca3af' }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <Statistic
                title={<span className="text-slate-500">Iade Sebebi</span>}
                value={reasonLabels[purchaseReturn.reason as PurchaseReturnReason] || purchaseReturn.reason}
                valueStyle={{ fontSize: '16px', color: '#0f172a' }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <Statistic
                title={<span className="text-slate-500">Toplam Kalem</span>}
                value={(purchaseReturn.items || []).length}
                suffix="adet"
                valueStyle={{ color: '#0f172a' }}
              />
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Return Items */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Iade Kalemleri</h3>
              <Table
                dataSource={purchaseReturn.items || []}
                columns={itemColumns}
                rowKey="id"
                pagination={false}
                size="small"
                className="border border-slate-200 rounded-lg overflow-hidden"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row className="bg-slate-50">
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong className="text-slate-600">Ara Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong className="text-slate-900">{purchaseReturn.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row className="bg-slate-50">
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text className="text-slate-600">KDV Toplam</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text className="text-slate-700">{purchaseReturn.vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row className="bg-slate-100">
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <Text strong className="text-slate-700 text-base">Iade Tutari</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong className="text-slate-900 text-base">
                          {purchaseReturn.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {purchaseReturn.currency || ''}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            {/* Notes */}
            {(purchaseReturn.notes || purchaseReturn.internalNotes || purchaseReturn.reasonDetails) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notlar</h3>
                {purchaseReturn.reasonDetails && (
                  <div className="mb-4">
                    <Text strong className="text-slate-700">Sebep Detayi:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap text-slate-600">{purchaseReturn.reasonDetails}</Paragraph>
                  </div>
                )}
                {purchaseReturn.notes && (
                  <div className="mb-4">
                    <Text strong className="text-slate-700">Genel Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap text-slate-600">{purchaseReturn.notes}</Paragraph>
                  </div>
                )}
                {purchaseReturn.internalNotes && (
                  <div>
                    <Text strong className="text-slate-700">Dahili Not:</Text>
                    <Paragraph className="mt-1 mb-0 whitespace-pre-wrap text-slate-600">{purchaseReturn.internalNotes}</Paragraph>
                  </div>
                )}
              </div>
            )}
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            {/* Supplier Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Tedarikci Bilgileri</h3>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<span className="text-slate-500">Tedarikci</span>}>
                  <a
                    onClick={() => router.push(`/purchase/suppliers/${purchaseReturn.supplierId}`)}
                    className="text-slate-900 hover:text-slate-600"
                  >
                    {purchaseReturn.supplierName}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Return Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Iade Bilgileri</h3>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<span className="text-slate-500">Iade No</span>}>
                  <span className="text-slate-900">{purchaseReturn.returnNumber}</span>
                </Descriptions.Item>
                {purchaseReturn.rmaNumber && (
                  <Descriptions.Item label={<span className="text-slate-500">RMA No</span>}>
                    <span className="text-slate-900">{purchaseReturn.rmaNumber}</span>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={<span className="text-slate-500">Iade Tarihi</span>}>
                  <span className="text-slate-900">{dayjs(purchaseReturn.returnDate).format('DD.MM.YYYY')}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500">Tip</span>}>
                  <span className="text-slate-900">{typeLabels[purchaseReturn.type] || purchaseReturn.type}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-slate-500">Sebep</span>}>
                  <Tag color={reasonColors[purchaseReturn.reason as PurchaseReturnReason] || 'default'}>
                    {reasonLabels[purchaseReturn.reason as PurchaseReturnReason] || purchaseReturn.reason}
                  </Tag>
                </Descriptions.Item>
                {purchaseReturn.refundMethod && (
                  <Descriptions.Item label={<span className="text-slate-500">Iade Yontemi</span>}>
                    <span className="text-slate-900">{refundMethodLabels[purchaseReturn.refundMethod] || purchaseReturn.refundMethod}</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            {/* Related Documents */}
            {(purchaseReturn.purchaseOrderNumber || purchaseReturn.goodsReceiptNumber || purchaseReturn.purchaseInvoiceNumber) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Iliskili Belgeler</h3>
                <Descriptions column={1} size="small">
                  {purchaseReturn.purchaseOrderNumber && (
                    <Descriptions.Item label={<span className="text-slate-500">Siparis No</span>}>
                      <a
                        onClick={() => router.push(`/purchase/orders/${purchaseReturn.purchaseOrderId}`)}
                        className="text-slate-900 hover:text-slate-600"
                      >
                        {purchaseReturn.purchaseOrderNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.goodsReceiptNumber && (
                    <Descriptions.Item label={<span className="text-slate-500">Mal Alim No</span>}>
                      <a
                        onClick={() => router.push(`/purchase/goods-receipts/${purchaseReturn.goodsReceiptId}`)}
                        className="text-slate-900 hover:text-slate-600"
                      >
                        {purchaseReturn.goodsReceiptNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.purchaseInvoiceNumber && (
                    <Descriptions.Item label={<span className="text-slate-500">Fatura No</span>}>
                      <a
                        onClick={() => router.push(`/purchase/invoices/${purchaseReturn.purchaseInvoiceId}`)}
                        className="text-slate-900 hover:text-slate-600"
                      >
                        {purchaseReturn.purchaseInvoiceNumber}
                      </a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}

            {/* Shipping Info */}
            {purchaseReturn.isShipped && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Gonderim Bilgileri</h3>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={<span className="text-slate-500">Durum</span>}>
                    <Tag color="green">Gonderildi</Tag>
                  </Descriptions.Item>
                  {purchaseReturn.shippedDate && (
                    <Descriptions.Item label={<span className="text-slate-500">Gonderim Tarihi</span>}>
                      <span className="text-slate-900">{dayjs(purchaseReturn.shippedDate).format('DD.MM.YYYY')}</span>
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.shippingCarrier && (
                    <Descriptions.Item label={<span className="text-slate-500">Kargo</span>}>
                      <span className="text-slate-900">{purchaseReturn.shippingCarrier}</span>
                    </Descriptions.Item>
                  )}
                  {purchaseReturn.trackingNumber && (
                    <Descriptions.Item label={<span className="text-slate-500">Takip No</span>}>
                      <span className="text-slate-900">{purchaseReturn.trackingNumber}</span>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}

            {/* Process History */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Islem Gecmisi</h3>
              <Timeline
                items={[
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <Text strong className="text-slate-900">Olusturuldu</Text>
                        <div className="text-xs text-slate-500">
                          {dayjs(purchaseReturn.createdAt).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.approvalDate && {
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong className="text-slate-900">Onaylandi</Text>
                        {purchaseReturn.approvedByName && (
                          <div className="text-xs text-slate-600">{purchaseReturn.approvedByName}</div>
                        )}
                        <div className="text-xs text-slate-500">
                          {dayjs(purchaseReturn.approvalDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.shippedDate && {
                    color: 'geekblue',
                    children: (
                      <div>
                        <Text strong className="text-slate-900">Gonderildi</Text>
                        <div className="text-xs text-slate-500">
                          {dayjs(purchaseReturn.shippedDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.receivedDate && {
                    color: 'purple',
                    children: (
                      <div>
                        <Text strong className="text-slate-900">Teslim Alindi</Text>
                        <div className="text-xs text-slate-500">
                          {dayjs(purchaseReturn.receivedDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  purchaseReturn.refundDate && {
                    color: 'green',
                    children: (
                      <div>
                        <Text strong className="text-slate-900">Iade Edildi</Text>
                        {purchaseReturn.refundReference && (
                          <div className="text-xs text-slate-600">{purchaseReturn.refundReference}</div>
                        )}
                        <div className="text-xs text-slate-500">
                          {dayjs(purchaseReturn.refundDate).format('DD.MM.YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                ].filter(Boolean) as TimelineItemProps[]}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
