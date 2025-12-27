'use client';

import React from 'react';
import { Table, Dropdown, Modal, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  usePurchaseBudget,
  useDeletePurchaseBudget,
  useSubmitPurchaseBudget,
  useApprovePurchaseBudget,
  useActivatePurchaseBudget,
  useFreezePurchaseBudget,
  useClosePurchaseBudget,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseBudgetStatus } from '@/lib/api/services/purchase.types';

const statusConfig: Record<PurchaseBudgetStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  PendingApproval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
  Frozen: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Donduruldu' },
  Exhausted: { bg: 'bg-red-100', text: 'text-red-700', label: 'Tükendi' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal Edildi' },
};

const budgetTypeLabels: Record<string, string> = {
  Department: 'Departman',
  Category: 'Kategori',
  Project: 'Proje',
  CostCenter: 'Maliyet Merkezi',
  General: 'Genel',
};

export default function PurchaseBudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: budget, isLoading } = usePurchaseBudget(id);
  const deleteMutation = useDeletePurchaseBudget();
  const submitMutation = useSubmitPurchaseBudget();
  const approveMutation = useApprovePurchaseBudget();
  const activateMutation = useActivatePurchaseBudget();
  const freezeMutation = useFreezePurchaseBudget();
  const closeMutation = useClosePurchaseBudget();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Bütçe bulunamadı</h3>
          <Link href="/purchase/budgets">
            <button className="text-sm text-slate-600 hover:text-slate-900">← Listeye dön</button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[budget.status];
  const usedPercent = budget.totalAmount > 0 ? (budget.usedAmount / budget.totalAmount) * 100 : 0;
  const isOverThreshold = usedPercent >= (budget.alertThreshold || 80);

  const handleDelete = () => {
    Modal.confirm({
      title: 'Bütçe Silinecek',
      content: 'Bu bütçeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/budgets');
      },
    });
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Onaya Gönder',
      content: 'Bu bütçeyi onaya göndermek istediğinize emin misiniz?',
      onOk: () => submitMutation.mutate(id),
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Bütçeyi Onayla',
      content: 'Bu bütçeyi onaylamak istediğinize emin misiniz?',
      onOk: () => approveMutation.mutate({ id }),
    });
  };

  const handleActivate = () => {
    Modal.confirm({
      title: 'Bütçeyi Aktifleştir',
      content: 'Bu bütçeyi aktifleştirmek istediğinize emin misiniz?',
      onOk: () => activateMutation.mutate(id),
    });
  };

  const handleFreeze = () => {
    Modal.confirm({
      title: 'Bütçeyi Dondur',
      content: 'Bu bütçeyi dondurmak istediğinize emin misiniz?',
      okType: 'danger',
      onOk: () => freezeMutation.mutate({ id, reason: 'Manuel dondurma' }),
    });
  };

  const handleClose = () => {
    Modal.confirm({
      title: 'Bütçeyi Kapat',
      content: 'Bu bütçeyi kapatmak istediğinize emin misiniz?',
      okType: 'danger',
      onOk: () => closeMutation.mutate(id),
    });
  };

  const transactionColumns = [
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <span className="text-sm text-slate-600">{new Date(date).toLocaleDateString('tr-TR')}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      render: (type: string) => {
        const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
          Allocation: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Tahsis' },
          Commitment: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Rezervasyon' },
          Expenditure: { bg: 'bg-red-100', text: 'text-red-700', label: 'Harcama' },
          Release: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Serbest Bırakma' },
          Adjustment: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Düzeltme' },
        };
        const config = typeConfig[type] || { bg: 'bg-slate-100', text: 'text-slate-600', label: type };
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right' as const,
      render: (amount: number) => (
        <span className={`text-sm font-medium ${amount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {amount > 0 ? '-' : '+'}{Math.abs(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (text: string) => <span className="text-sm text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-sm text-slate-500">{text || '-'}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/purchase/budgets">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-900">{budget.code}</h1>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{budget.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {budget.status === 'Draft' && (
                <>
                  <Link href={`/purchase/budgets/${id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                      Düzenle
                    </button>
                  </Link>
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Onaya Gönder
                  </button>
                </>
              )}
              {budget.status === 'PendingApproval' && (
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Onayla
                </button>
              )}
              {budget.status === 'Approved' && (
                <button
                  onClick={handleActivate}
                  disabled={activateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <PlayIcon className="w-4 h-4" />
                  Aktifleştir
                </button>
              )}
              {budget.status === 'Active' && (
                <button
                  onClick={handleFreeze}
                  disabled={freezeMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <LockClosedIcon className="w-4 h-4" />
                  Dondur
                </button>
              )}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'close',
                      label: 'Kapat',
                      icon: <XMarkIcon className="w-4 h-4" />,
                      disabled: budget.status === 'Closed' || budget.status === 'Draft',
                      onClick: handleClose,
                    },
                    { type: 'divider' },
                    {
                      key: 'delete',
                      label: 'Sil',
                      icon: <TrashIcon className="w-4 h-4" />,
                      danger: true,
                      disabled: budget.status !== 'Draft',
                      onClick: handleDelete,
                    },
                  ],
                }}
              >
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-slate-500" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Budget Usage */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-6">Bütçe Kullanımı</h2>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Toplam Bütçe</div>
                  <div className="text-xl font-semibold text-slate-900">
                    {budget.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Kullanılan</div>
                  <div className={`text-xl font-semibold ${isOverThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                    {budget.usedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Kalan</div>
                  <div className={`text-xl font-semibold ${budget.remainingAmount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {budget.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">Kullanım Oranı</span>
                  <span className={isOverThreshold ? 'text-red-600 font-medium' : 'text-slate-600'}>
                    {usedPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverThreshold ? 'bg-red-500' : usedPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(usedPercent, 100)}%` }}
                  />
                </div>
                {isOverThreshold && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Uyarı eşiği ({budget.alertThreshold}%) aşıldı!
                  </div>
                )}
              </div>
            </div>

            {/* Budget Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4">Bütçe Bilgileri</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Kod</div>
                  <div className="text-sm text-slate-900">{budget.code}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ad</div>
                  <div className="text-sm text-slate-900">{budget.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Tip</div>
                  <div className="text-sm text-slate-900">{budgetTypeLabels[budget.budgetType] || budget.budgetType}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Para Birimi</div>
                  <div className="text-sm text-slate-900">{budget.currency}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Dönem Başlangıç</div>
                  <div className="text-sm text-slate-900">{new Date(budget.periodStart).toLocaleDateString('tr-TR')}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Dönem Bitiş</div>
                  <div className="text-sm text-slate-900">{new Date(budget.periodEnd).toLocaleDateString('tr-TR')}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Departman</div>
                  <div className="text-sm text-slate-900">{budget.departmentName || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Kategori</div>
                  <div className="text-sm text-slate-900">{budget.categoryName || '-'}</div>
                </div>
              </div>

              {budget.description && (
                <>
                  <div className="h-px bg-slate-100 my-4" />
                  <p className="text-sm text-slate-600">{budget.description}</p>
                </>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Hareketler</h2>
              </div>
              <Table
                columns={transactionColumns}
                dataSource={budget.transactions || []}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                locale={{ emptyText: 'Henüz işlem yok' }}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
                  <WalletIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-semibold text-slate-900">{budget.code}</div>
                <span className={`mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Uyarı Eşiği</span>
                  <span className="text-sm text-slate-900">%{budget.alertThreshold}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Oluşturulma</span>
                  <span className="text-sm text-slate-900">
                    {budget.createdAt ? new Date(budget.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500">Son Güncelleme</span>
                  <span className="text-sm text-slate-900">
                    {budget.updatedAt ? new Date(budget.updatedAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {budget.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-3">Notlar</h2>
                <p className="text-sm text-slate-600">{budget.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
