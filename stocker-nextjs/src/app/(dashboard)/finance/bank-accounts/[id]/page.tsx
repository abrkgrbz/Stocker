'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button, Spinner, Badge } from '@/components/primitives';
import { Modal, Tag, Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useBankAccount, useBankAccountTransactions, useDeleteBankAccount } from '@/lib/api/hooks/useFinance';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { BankTransactionDto } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';

export default function BankAccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = Number(params.id);

  const { data: account, isLoading, error } = useBankAccount(accountId);
  const { data: transactionsData, isLoading: transactionsLoading } = useBankAccountTransactions(accountId, {});
  const deleteBankAccount = useDeleteBankAccount();

  const transactions = transactionsData?.items || [];

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Banka Hesabını Sil',
      content: `${account?.accountName || 'Bu banka hesabı'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteBankAccount.mutateAsync(accountId);
          showSuccess('Banka hesabı başarıyla silindi!');
          router.push('/finance/bank-accounts');
        } catch (error) {
          showApiError(error, 'Banka hesabı silinirken bir hata oluştu');
        }
      },
    });
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Checking: 'Vadesiz Hesap',
      Savings: 'Vadeli Hesap',
      Credit: 'Kredi Hesabı',
      Investment: 'Yatırım Hesabı',
    };
    return labels[type] || type;
  };

  const getTransactionTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      Deposit: { label: 'Para Yatırma', color: 'green' },
      Withdrawal: { label: 'Para Çekme', color: 'red' },
      Transfer: { label: 'Havale/EFT', color: 'blue' },
      Payment: { label: 'Ödeme', color: 'orange' },
      Receipt: { label: 'Tahsilat', color: 'cyan' },
      Fee: { label: 'Masraf', color: 'red' },
      Interest: { label: 'Faiz', color: 'purple' },
      Adjustment: { label: 'Düzeltme', color: 'default' },
    };
    return configs[type] || { label: type, color: 'default' };
  };

  const transactionColumns: ColumnsType<BankTransactionDto> = [
    {
      title: 'Tarih',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: 120,
    },
    {
      title: 'Tür',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type) => {
        const config = getTransactionTypeConfig(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      width: 140,
    },
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (text) => text || '-',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => {
        const isDebit = ['Withdrawal', 'Payment', 'Fee', 'Transfer'].includes(record.transactionType);
        return (
          <span className={`font-medium ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
            {isDebit ? '-' : '+'}{formatCurrency(Math.abs(amount), record.currency || 'TRY')}
          </span>
        );
      },
    },
    {
      title: 'Bakiye',
      dataIndex: 'runningBalance',
      key: 'runningBalance',
      align: 'right',
      render: (balance, record) => (
        <span className={`font-semibold ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
          {formatCurrency(balance || 0, record.currency || 'TRY')}
        </span>
      ),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Banka Hesabı Bulunamadı</h3>
          <p className="text-red-600 mb-4">İstenen banka hesabı bulunamadı veya bir hata oluştu.</p>
          <Button variant="secondary" onClick={() => router.push('/finance/bank-accounts')}>
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const currentBalance = account.currentBalance || 0;
  const isNegative = currentBalance < 0;

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
                <h1 className="text-xl font-semibold text-slate-900">{account.accountName}</h1>
                <Badge variant={account.isActive ? 'success' : 'default'}>
                  {account.isActive ? (
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircleIcon className="h-3 w-3 mr-1" />
                  )}
                  {account.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <p className="text-sm text-slate-400">{account.bankName} - {account.accountNumber || account.iban}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/finance/bank-accounts/${accountId}/edit`)}
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
            {/* Bank Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BuildingLibraryIcon className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Banka Bilgileri</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Banka</span>
                  <p className="text-sm font-medium text-slate-900">{account.bankName}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Şube</span>
                  <p className="text-sm font-medium text-slate-900">
                    {account.branchName || '-'} {account.branchCode ? `(${account.branchCode})` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Hesap Türü</span>
                  <p className="text-sm font-medium text-slate-900">{getAccountTypeLabel(account.accountType)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Para Birimi</span>
                  <p className="text-sm font-medium text-slate-900">{account.currency}</p>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <CreditCardIcon className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Hesap Detayları</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Hesap Numarası</span>
                  <p className="text-sm font-medium text-slate-900 font-mono">{account.accountNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">IBAN</span>
                  <p className="text-sm font-medium text-slate-900 font-mono">{account.iban || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">SWIFT Kodu</span>
                  <p className="text-sm font-medium text-slate-900 font-mono">{account.swiftCode || '-'}</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <ArrowsRightLeftIcon className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Hesap Hareketleri</h3>
                </div>
              </div>

              {transactionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="md" />
                </div>
              ) : transactions.length > 0 ? (
                <Table
                  columns={transactionColumns}
                  dataSource={transactions}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Toplam ${total} hareket`,
                  }}
                  size="small"
                />
              ) : (
                <div className="py-12">
                  <Empty description="Henüz hareket bulunmuyor" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Bakiye</h3>
              </div>

              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isNegative ? (
                    <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-500" />
                  )}
                  <span className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(currentBalance, account.currency || 'TRY')}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Güncel Bakiye</p>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Açılış Bakiyesi</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(account.openingBalance || 0, account.currency || 'TRY')}
                  </span>
                </div>
                {account.creditLimit && account.creditLimit > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Kredi Limiti</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(account.creditLimit, account.currency || 'TRY')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Kullanılabilir Bakiye</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(currentBalance + account.creditLimit, account.currency || 'TRY')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {account.description && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Açıklama</h3>
                </div>
                <p className="text-sm text-slate-600">{account.description}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-medium text-slate-500 uppercase">Zaman Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm text-slate-700">
                    {account.createdAt ? dayjs(account.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                  </span>
                </div>
                {account.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Son Güncelleme</span>
                    <span className="text-sm text-slate-700">
                      {dayjs(account.updatedAt).format('DD/MM/YYYY HH:mm')}
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
