'use client';

/**
 * Advance Payments Page
 * Track deposits and pre-payments (Ledger View)
 * Financial-grade UI with clean, high-contrast numbers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, message, Select, Spin } from 'antd';
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
  RefreshCw,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  EmptyState,
} from '@/components/ui/enterprise-page';
import { WalletOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import SalesService, {
  AdvancePaymentListDto,
  AdvancePaymentStatisticsDto,
  AdvancePaymentStatus
} from '@/lib/api/services/sales.service';

dayjs.locale('tr');

type PaymentMethod = 'CreditCard' | 'BankTransfer' | 'Cash' | 'Check' | 'DebitCard' | 'Other';

export default function AdvancePaymentsPage() {
  const [payments, setPayments] = useState<AdvancePaymentListDto[]>([]);
  const [statistics, setStatistics] = useState<AdvancePaymentStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdvancePaymentStatus | 'All'>('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdvancePaymentListDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsResult, statsResult] = await Promise.all([
        SalesService.getAdvancePayments({
          searchTerm: searchTerm || undefined,
          status: statusFilter === 'All' ? undefined : statusFilter,
          pageSize: 100,
        }),
        SalesService.getAdvancePaymentStatistics(),
      ]);
      setPayments(paymentsResult.items);
      setStatistics(statsResult);
    } catch (error) {
      console.error('Failed to fetch advance payments:', error);
      message.error('Avans ödemeleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; bgColor: string; textColor: string; icon: typeof Clock }> = {
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
      PartiallyApplied: {
        label: 'Kısmen Uygulandı',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        icon: CheckCircle,
      },
      FullyApplied: {
        label: 'Tamamen Uygulandı',
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
    return configs[status] || configs['Pending'];
  };

  const getPaymentMethodConfig = (method: string) => {
    const configs: Record<string, { label: string; icon: typeof CreditCard }> = {
      CreditCard: { label: 'Kredi Kartı', icon: CreditCard },
      DebitCard: { label: 'Banka Kartı', icon: CreditCard },
      BankTransfer: { label: 'Havale/EFT', icon: Building2 },
      Cash: { label: 'Nakit', icon: Banknote },
      Check: { label: 'Çek', icon: FileText },
      Other: { label: 'Diğer', icon: CreditCard },
    };
    return configs[method] || configs['Other'];
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCaptureClick = (payment: AdvancePaymentListDto) => {
    setSelectedPayment(payment);
    setCaptureModalOpen(true);
    setOpenDropdown(null);
  };

  const handleCaptureConfirm = async () => {
    if (!selectedPayment) return;

    try {
      setActionLoading(true);
      await SalesService.captureAdvancePayment(selectedPayment.id);
      message.success('Ödeme başarıyla tahsil edildi');
      setCaptureModalOpen(false);
      setSelectedPayment(null);
      fetchData();
    } catch (error) {
      console.error('Failed to capture payment:', error);
      message.error('Ödeme tahsil edilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (id: string) => {
    Modal.confirm({
      title: 'Ödeme İadesi',
      content: 'Bu ödemeyi iade etmek istediğinizden emin misiniz?',
      okText: 'İade Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await SalesService.refundAdvancePayment(id, { reason: 'Müşteri talebi' });
          message.success('İade işlemi tamamlandı');
          fetchData();
        } catch (error) {
          console.error('Failed to refund payment:', error);
          message.error('İade işlemi sırasında hata oluştu');
        }
      },
    });
    setOpenDropdown(null);
  };

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<WalletOutlined />}
        iconColor="#6366f1"
        title="Avans Ödemeler"
        description="Depozito ve ön ödemeleri takip edin"
        itemCount={payments.length}
        secondaryActions={
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam İşlem</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 font-mono">
            {statistics?.totalCount ?? payments.length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Bekleyen</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-600 font-mono">
            {statistics ? formatCurrency(statistics.totalAmount - statistics.appliedAmount, statistics.currency) : '₺0,00'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Tutar</span>
            <ArrowDownLeft className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-600 font-mono">
            {statistics ? formatCurrency(statistics.totalAmount, statistics.currency) : '₺0,00'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Uygulanan</span>
            <ArrowUpRight className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-blue-600 font-mono">
            {statistics ? formatCurrency(statistics.appliedAmount, statistics.currency) : '₺0,00'}
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
              { value: 'PartiallyApplied', label: 'Kısmen Uygulandı' },
              { value: 'FullyApplied', label: 'Tamamen Uygulandı' },
              { value: 'Refunded', label: 'İade Edildi' },
              { value: 'Cancelled', label: 'İptal' },
            ]}
          />
        </div>
      </Card>

      {/* Ledger Table */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : payments.length === 0 ? (
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
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Kalan
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
                {payments.map((payment) => {
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
                            <div>{dayjs(payment.paymentDate).format('DD MMM YYYY')}</div>
                            <div className="text-xs text-slate-400">
                              {dayjs(payment.paymentDate).format('HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-900">
                          {payment.paymentNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{payment.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.salesOrderNumber ? (
                          <span className="font-mono text-sm text-indigo-600 hover:underline cursor-pointer">
                            {payment.salesOrderNumber}
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
                        <span className="font-mono text-lg font-semibold text-slate-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-mono text-sm ${
                            payment.remainingAmount > 0
                              ? 'text-amber-600'
                              : 'text-green-600'
                          }`}
                        >
                          {formatCurrency(payment.remainingAmount, payment.currency)}
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
                                    {payment.status === 'Pending' && !payment.isCaptured && (
                                      <button
                                        onClick={() => handleCaptureClick(payment)}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Tahsil Et
                                      </button>
                                    )}
                                    {(payment.status === 'Captured' || payment.isCaptured) && (
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
        okButtonProps={{ className: 'bg-green-600 hover:bg-green-700', loading: actionLoading }}
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
                <div className="font-mono text-slate-900">{selectedPayment.paymentNumber}</div>
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
                  {selectedPayment.salesOrderNumber || '-'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Bu işlem onaylandığında ödeme &quot;Tahsil Edildi&quot; olarak işaretlenecek ve
                müşteri bakiyesine yansıtılacaktır.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
