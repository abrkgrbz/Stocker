'use client';

/**
 * Advance Payments Page
 * Track deposits and pre-payments (Ledger View)
 * Financial-grade UI with clean, high-contrast numbers
 */

import React, { useState } from 'react';
import { Modal, message, Input, Select } from 'antd';
import {
  CreditCard,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  RotateCcw,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Building2,
  FileText,
  Banknote,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/ui/enterprise-page';
import { WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
type PaymentStatus = 'Pending' | 'Captured' | 'Refunded' | 'Cancelled';
type PaymentMethod = 'CreditCard' | 'BankTransfer' | 'Cash' | 'Check';

interface AdvancePayment {
  id: string;
  transactionId: string;
  date: string;
  customerId: string;
  customerName: string;
  orderRef: string | null;
  orderId: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  capturedAt: string | null;
  refundedAt: string | null;
  notes?: string;
}

// Mock data
const mockPayments: AdvancePayment[] = [
  {
    id: '1',
    transactionId: 'TRX-2024-001234',
    date: '2024-12-24T10:30:00',
    customerId: 'c1',
    customerName: 'MediaMarkt Turkey',
    orderRef: 'SIP-2024-001250',
    orderId: 'ord1',
    amount: 125000,
    currency: 'TRY',
    paymentMethod: 'CreditCard',
    status: 'Pending',
    capturedAt: null,
    refundedAt: null,
  },
  {
    id: '2',
    transactionId: 'TRX-2024-001233',
    date: '2024-12-23T14:15:00',
    customerId: 'c2',
    customerName: 'Teknosa A.Ş.',
    orderRef: 'SIP-2024-001248',
    orderId: 'ord2',
    amount: 89500,
    currency: 'TRY',
    paymentMethod: 'BankTransfer',
    status: 'Captured',
    capturedAt: '2024-12-23T16:00:00',
    refundedAt: null,
  },
  {
    id: '3',
    transactionId: 'TRX-2024-001232',
    date: '2024-12-22T09:45:00',
    customerId: 'c3',
    customerName: 'Hepsiburada',
    orderRef: 'SIP-2024-001245',
    orderId: 'ord3',
    amount: 250000,
    currency: 'TRY',
    paymentMethod: 'CreditCard',
    status: 'Captured',
    capturedAt: '2024-12-22T11:30:00',
    refundedAt: null,
  },
  {
    id: '4',
    transactionId: 'TRX-2024-001231',
    date: '2024-12-21T16:20:00',
    customerId: 'c4',
    customerName: 'Vatan Bilgisayar',
    orderRef: null,
    orderId: null,
    amount: 45000,
    currency: 'TRY',
    paymentMethod: 'Cash',
    status: 'Pending',
    capturedAt: null,
    refundedAt: null,
    notes: 'Müşteri depozito - sipariş bekleniyor',
  },
  {
    id: '5',
    transactionId: 'TRX-2024-001230',
    date: '2024-12-20T11:00:00',
    customerId: 'c5',
    customerName: 'n11.com',
    orderRef: 'SIP-2024-001200',
    orderId: 'ord5',
    amount: 175000,
    currency: 'TRY',
    paymentMethod: 'CreditCard',
    status: 'Refunded',
    capturedAt: '2024-12-20T12:00:00',
    refundedAt: '2024-12-22T10:00:00',
    notes: 'Sipariş iptal edildi',
  },
  {
    id: '6',
    transactionId: 'TRX-2024-001229',
    date: '2024-12-19T13:30:00',
    customerId: 'c6',
    customerName: 'Trendyol',
    orderRef: 'SIP-2024-001195',
    orderId: 'ord6',
    amount: 320000,
    currency: 'TRY',
    paymentMethod: 'BankTransfer',
    status: 'Captured',
    capturedAt: '2024-12-19T15:45:00',
    refundedAt: null,
  },
  {
    id: '7',
    transactionId: 'TRX-2024-001228',
    date: '2024-12-18T10:00:00',
    customerId: 'c7',
    customerName: 'Amazon Turkey',
    orderRef: null,
    orderId: null,
    amount: 500000,
    currency: 'TRY',
    paymentMethod: 'Check',
    status: 'Cancelled',
    capturedAt: null,
    refundedAt: null,
    notes: 'Çek karşılıksız',
  },
];

export default function AdvancePaymentsPage() {
  const [payments, setPayments] = useState<AdvancePayment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdvancePayment | null>(null);

  const getStatusConfig = (status: PaymentStatus) => {
    const configs = {
      Pending: {
        label: 'Beklemede',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        icon: Clock,
      },
      Captured: {
        label: 'Tahsil Edildi',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        icon: CheckCircle,
      },
      Refunded: {
        label: 'İade Edildi',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        icon: RotateCcw,
      },
      Cancelled: {
        label: 'İptal',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        icon: Clock,
      },
    };
    return configs[status];
  };

  const getPaymentMethodConfig = (method: PaymentMethod) => {
    const configs = {
      CreditCard: { label: 'Kredi Kartı', icon: CreditCard },
      BankTransfer: { label: 'Havale/EFT', icon: Building2 },
      Cash: { label: 'Nakit', icon: Banknote },
      Check: { label: 'Çek', icon: FileText },
    };
    return configs[method];
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCaptureClick = (payment: AdvancePayment) => {
    setSelectedPayment(payment);
    setCaptureModalOpen(true);
    setOpenDropdown(null);
  };

  const handleCaptureConfirm = () => {
    if (!selectedPayment) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id
          ? {
              ...p,
              status: 'Captured' as PaymentStatus,
              capturedAt: new Date().toISOString(),
            }
          : p
      )
    );
    message.success('Ödeme başarıyla tahsil edildi');
    setCaptureModalOpen(false);
    setSelectedPayment(null);
  };

  const handleRefund = (id: string) => {
    Modal.confirm({
      title: 'Ödeme İadesi',
      content: 'Bu ödemeyi iade etmek istediğinizden emin misiniz?',
      okText: 'İade Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'Refunded' as PaymentStatus,
                  refundedAt: new Date().toISOString(),
                }
              : p
          )
        );
        message.success('İade işlemi tamamlandı');
      },
    });
    setOpenDropdown(null);
  };

  // Filter
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderRef?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Summary calculations
  const pendingTotal = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const capturedTotal = payments
    .filter((p) => p.status === 'Captured')
    .reduce((sum, p) => sum + p.amount, 0);
  const refundedTotal = payments
    .filter((p) => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<WalletOutlined />}
        iconColor="#6366f1"
        title="Avans Ödemeler"
        description="Depozito ve ön ödemeleri takip edin"
        itemCount={payments.length}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam İşlem</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 font-mono">
            {payments.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Bekleyen</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-600 font-mono">
            {formatCurrency(pendingTotal)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Tahsil Edilen</span>
            <ArrowDownLeft className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-600 font-mono">
            {formatCurrency(capturedTotal)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">İade Edilen</span>
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-600 font-mono">
            {formatCurrency(refundedTotal)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="İşlem no, müşteri veya sipariş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            allowClear
            value={statusFilter === 'All' ? undefined : statusFilter}
            onChange={(value) => setStatusFilter(value || 'All')}
            style={{ width: 160 }}
            options={[
              { value: 'Pending', label: 'Beklemede' },
              { value: 'Captured', label: 'Tahsil Edildi' },
              { value: 'Refunded', label: 'İade Edildi' },
              { value: 'Cancelled', label: 'İptal' },
            ]}
          />
        </div>
      </Card>

      {/* Ledger Table */}
      {filteredPayments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CreditCard className="w-6 h-6" />}
            title="Ödeme bulunamadı"
            description="Arama kriterlerinize uygun ödeme kaydı yok"
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Tarih
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    İşlem No
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Müşteri
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Sipariş Ref
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Ödeme Yöntemi
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Tutar
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Durum
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const methodConfig = getPaymentMethodConfig(payment.paymentMethod);
                  const StatusIcon = statusConfig.icon;
                  const MethodIcon = methodConfig.icon;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <div>{dayjs(payment.date).format('DD MMM YYYY')}</div>
                            <div className="text-xs text-slate-400">
                              {dayjs(payment.date).format('HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-900">
                          {payment.transactionId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{payment.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.orderRef ? (
                          <span className="font-mono text-sm text-indigo-600 hover:underline cursor-pointer">
                            {payment.orderRef}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Atanmamış</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MethodIcon className="w-4 h-4 text-slate-400" />
                          {methodConfig.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-mono text-lg font-semibold ${
                            payment.status === 'Captured'
                              ? 'text-green-600'
                              : payment.status === 'Refunded'
                              ? 'text-red-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(payment.status === 'Pending' || payment.status === 'Captured') && (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setOpenDropdown(openDropdown === payment.id ? null : payment.id)
                              }
                              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            {openDropdown === payment.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdown(null)}
                                />
                                <div className="absolute right-0 z-20 mt-1 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                  <div className="py-1">
                                    {payment.status === 'Pending' && (
                                      <button
                                        onClick={() => handleCaptureClick(payment)}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Tahsil Et
                                      </button>
                                    )}
                                    {payment.status === 'Captured' && (
                                      <button
                                        onClick={() => handleRefund(payment.id)}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        İade Et
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Capture Payment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span>Ödeme Tahsil Et</span>
          </div>
        }
        open={captureModalOpen}
        onOk={handleCaptureConfirm}
        onCancel={() => {
          setCaptureModalOpen(false);
          setSelectedPayment(null);
        }}
        okText="Tahsil Et"
        cancelText="Vazgeç"
        okButtonProps={{ className: 'bg-green-600 hover:bg-green-700' }}
        width={450}
      >
        {selectedPayment && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Tahsil Edilecek Tutar</div>
              <div className="text-3xl font-bold text-green-600 font-mono">
                {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">Müşteri</div>
                <div className="font-medium text-slate-900">{selectedPayment.customerName}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">İşlem No</div>
                <div className="font-mono text-slate-900">{selectedPayment.transactionId}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Ödeme Yöntemi</div>
                <div className="text-slate-900">
                  {getPaymentMethodConfig(selectedPayment.paymentMethod).label}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Sipariş</div>
                <div className="font-mono text-slate-900">
                  {selectedPayment.orderRef || '-'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Bu işlem onaylandığında ödeme "Tahsil Edildi" olarak işaretlenecek ve
                müşteri bakiyesine yansıtılacaktır.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
