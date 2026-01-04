'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button, Spinner, Badge } from '@/components/primitives';
import { Table, Modal, Tag, Tabs, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCurrentAccount, useCurrentAccountTransactions, useDeleteCurrentAccount } from '@/lib/api/hooks/useFinance';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { CurrentAccountTransactionDto } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';

export default function CurrentAccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = Number(params.id);

  const { data: account, isLoading, error } = useCurrentAccount(accountId);
  const { data: transactionsData, isLoading: transactionsLoading } = useCurrentAccountTransactions(accountId);
  const deleteCurrentAccount = useDeleteCurrentAccount();

  const transactions = transactionsData || [];

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Cari Hesabı Sil',
      content: `${account?.accountName || 'Bu cari hesap'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteCurrentAccount.mutateAsync(accountId);
          showSuccess('Cari hesap başarıyla silindi!');
          router.push('/finance/current-accounts');
        } catch (error) {
          showApiError(error, 'Cari hesap silinirken bir hata oluştu');
        }
      },
    });
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Customer: 'Müşteri',
      Supplier: 'Tedarikçi',
      Both: 'Müşteri & Tedarikçi',
      Employee: 'Çalışan',
      Other: 'Diğer',
    };
    return labels[type] || type;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      Invoice: { label: 'Fatura', color: 'blue' },
      Payment: { label: 'Ödeme', color: 'green' },
      Receipt: { label: 'Tahsilat', color: 'cyan' },
      CreditNote: { label: 'İade Faturası', color: 'orange' },
      DebitNote: { label: 'Borç Dekontu', color: 'red' },
      Adjustment: { label: 'Düzeltme', color: 'purple' },
      OpeningBalance: { label: 'Açılış Bakiyesi', color: 'default' },
    };
    return labels[type] || { label: type, color: 'default' };
  };

  const transactionColumns: ColumnsType<CurrentAccountTransactionDto> = [
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
        const config = getTransactionTypeLabel(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      width: 140,
    },
    {
      title: 'Belge No',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      render: (text) => text || '-',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Borç',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-red-600 font-medium">
          {amount > 0 ? formatCurrency(amount, record.currency || 'TRY') : '-'}
        </span>
      ),
    },
    {
      title: 'Alacak',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-emerald-600 font-medium">
          {amount > 0 ? formatCurrency(amount, record.currency || 'TRY') : '-'}
        </span>
      ),
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
          <h3 className="text-lg font-semibold text-red-800 mb-2">Cari Hesap Bulunamadı</h3>
          <p className="text-red-600 mb-4">İstenen cari hesap bulunamadı veya bir hata oluştu.</p>
          <Button variant="secondary" onClick={() => router.push('/finance/current-accounts')}>
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const balanceIsDebit = (account.balance || 0) < 0;

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
                {account.isBlocked && (
                  <Badge variant="error">Bloke</Badge>
                )}
              </div>
              <p className="text-sm text-slate-400">{account.accountCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/finance/current-accounts/${accountId}/edit`)}
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
            {/* Account Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Hesap Bilgileri</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Hesap Türü</span>
                  <p className="text-sm font-medium text-slate-900">{getAccountTypeLabel(account.accountType)}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Para Birimi</span>
                  <p className="text-sm font-medium text-slate-900">{account.currency}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">E-posta</span>
                  <p className="text-sm font-medium text-slate-900">{account.email || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Telefon</span>
                  <p className="text-sm font-medium text-slate-900">{account.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-slate-500">Adres</span>
                  <p className="text-sm font-medium text-slate-900">{account.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Tax Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Vergi Bilgileri</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-slate-500">Vergi Numarası</span>
                  <p className="text-sm font-medium text-slate-900">{account.taxNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Vergi Dairesi</span>
                  <p className="text-sm font-medium text-slate-900">{account.taxOffice || '-'}</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-purple-600" />
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
                  {balanceIsDebit ? (
                    <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-500" />
                  )}
                  <span className={`text-2xl font-bold ${balanceIsDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(Math.abs(account.balance || 0), account.currency || 'TRY')}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {balanceIsDebit ? 'Borçlu' : 'Alacaklı'}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Kredi Limiti</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(account.creditLimit || 0, account.currency || 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Kullanılabilir Kredi</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(Math.max(0, (account.creditLimit || 0) + (account.balance || 0)), account.currency || 'TRY')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Vade Süresi</span>
                  <span className="text-sm font-medium text-slate-900">
                    {account.paymentTermDays || 0} gün
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {account.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Notlar</h3>
                </div>
                <p className="text-sm text-slate-600">{account.notes}</p>
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
