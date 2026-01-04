'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button, Spinner, Badge } from '@/components/primitives';
import { Modal, Tag } from 'antd';
import { useExpense, useDeleteExpense } from '@/lib/api/hooks/useFinance';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = Number(params.id);

  const { data: expense, isLoading, error } = useExpense(expenseId);
  const deleteExpense = useDeleteExpense();

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Gideri Sil',
      content: `${expense?.description || 'Bu gider'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteExpense.mutateAsync(expenseId);
          showSuccess('Gider başarıyla silindi!');
          router.push('/finance/expenses');
        } catch (error) {
          showApiError(error, 'Gider silinirken bir hata oluştu');
        }
      },
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      Rent: 'Kira',
      Utilities: 'Faturalar',
      Salaries: 'Maaşlar',
      Marketing: 'Pazarlama',
      Travel: 'Seyahat',
      Supplies: 'Ofis Malzemeleri',
      Equipment: 'Ekipman',
      Maintenance: 'Bakım & Onarım',
      Insurance: 'Sigorta',
      Taxes: 'Vergiler',
      Other: 'Diğer',
    };
    return labels[category] || category;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      Draft: { label: 'Taslak', color: 'default', icon: <ClockIcon className="w-3 h-3" /> },
      Pending: { label: 'Beklemede', color: 'warning', icon: <ClockIcon className="w-3 h-3" /> },
      Approved: { label: 'Onaylandı', color: 'success', icon: <CheckCircleIcon className="w-3 h-3" /> },
      Paid: { label: 'Ödendi', color: 'success', icon: <CheckCircleIcon className="w-3 h-3" /> },
      Rejected: { label: 'Reddedildi', color: 'error', icon: <XCircleIcon className="w-3 h-3" /> },
      Cancelled: { label: 'İptal', color: 'error', icon: <XCircleIcon className="w-3 h-3" /> },
    };
    return configs[status] || { label: status, color: 'default', icon: null };
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      Cash: 'Nakit',
      BankTransfer: 'Banka Havalesi',
      CreditCard: 'Kredi Kartı',
      Check: 'Çek',
      Other: 'Diğer',
    };
    return labels[method] || method;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !expense) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Gider Bulunamadı</h3>
          <p className="text-red-600 mb-4">İstenen gider bulunamadı veya bir hata oluştu.</p>
          <Button variant="secondary" onClick={() => router.push('/finance/expenses')}>
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(expense.status);
  const kdvAmount = (expense.amount || 0) * ((expense.kdvRate || 0) / 100);
  const totalAmount = (expense.amount || 0) + kdvAmount;

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{expense.expenseNumber || 'Gider'}</h1>
                <Tag color={statusConfig.color}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Tag>
              </div>
              <p className="text-sm text-slate-400">{expense.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/finance/expenses/${expenseId}/edit`)}
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
            <Button
              variant="secondary"
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Gider Bilgileri</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Gider No</span>
                  <p className="text-sm font-medium text-slate-900">{expense.expenseNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Kategori</span>
                  <p className="text-sm font-medium text-slate-900">{getCategoryLabel(expense.category)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Gider Tarihi</span>
                  <p className="text-sm font-medium text-slate-900">
                    {expense.expenseDate ? dayjs(expense.expenseDate).format('DD/MM/YYYY') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Vade Tarihi</span>
                  <p className="text-sm font-medium text-slate-900">
                    {expense.dueDate ? dayjs(expense.dueDate).format('DD/MM/YYYY') : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-slate-500">Açıklama</span>
                  <p className="text-sm font-medium text-slate-900">{expense.description || '-'}</p>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Tedarikçi Bilgileri</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Tedarikçi Adı</span>
                  <p className="text-sm font-medium text-slate-900">{expense.supplierName || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Fatura Numarası</span>
                  <p className="text-sm font-medium text-slate-900">{expense.invoiceNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Fiş Numarası</span>
                  <p className="text-sm font-medium text-slate-900">{expense.receiptNumber || '-'}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <ReceiptPercentIcon className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Ödeme Bilgileri</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Ödeme Durumu</span>
                  <p className="text-sm font-medium text-slate-900">
                    {expense.isPaid ? (
                      <span className="text-emerald-600">Ödendi</span>
                    ) : (
                      <span className="text-amber-600">Ödenmedi</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Ödeme Yöntemi</span>
                  <p className="text-sm font-medium text-slate-900">
                    {expense.paymentMethod ? getPaymentMethodLabel(expense.paymentMethod) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Ödeme Tarihi</span>
                  <p className="text-sm font-medium text-slate-900">
                    {expense.paymentDate ? dayjs(expense.paymentDate).format('DD/MM/YYYY') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Banka Hesabı</span>
                  <p className="text-sm font-medium text-slate-900">{expense.bankAccountName || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Amount Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Tutar Bilgileri</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tutar (KDV Hariç)</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(expense.amount || 0, expense.currency || 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">KDV (%{expense.kdvRate || 0})</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(kdvAmount, expense.currency || 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">Toplam</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(totalAmount, expense.currency || 'TRY')}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {expense.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Notlar</h3>
                </div>
                <p className="text-sm text-slate-600">{expense.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-medium text-slate-500 uppercase">Zaman Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm text-slate-700">
                    {expense.createdAt ? dayjs(expense.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                  </span>
                </div>
                {expense.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Son Güncelleme</span>
                    <span className="text-sm text-slate-700">
                      {dayjs(expense.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
