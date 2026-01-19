'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Modal, Descriptions } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import {
  useShelfLifeRule,
  useDeleteShelfLife,
  useActivateShelfLife,
  useDeactivateShelfLife,
} from '@/lib/api/hooks/useInventory';
import { ShelfLifeType, ShelfLifeRuleType, ExpiryAction } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const shelfLifeTypeLabels: Record<number, string> = {
  [ShelfLifeType.ExpiryDate]: 'Son Kullanma Tarihi',
  [ShelfLifeType.BestBefore]: 'Tavsiye Edilen (Best Before)',
  [ShelfLifeType.ManufacturingDateBased]: 'Üretim Tarihi Bazlı',
  [ShelfLifeType.AfterOpening]: 'Açıldıktan Sonra',
  [ShelfLifeType.AfterFirstUse]: 'İlk Kullanımdan Sonra',
};

const ruleTypeLabels: Record<number, string> = {
  [ShelfLifeRuleType.Days]: 'Gün Bazlı',
  [ShelfLifeRuleType.Percentage]: 'Yüzde Bazlı',
  [ShelfLifeRuleType.Both]: 'Gün ve Yüzde',
};

const expiryActionLabels: Record<number, string> = {
  [ExpiryAction.None]: 'Hiçbir Şey Yapma',
  [ExpiryAction.AlertOnly]: 'Sadece Uyarı',
  [ExpiryAction.BlockSales]: 'Satışı Engelle',
  [ExpiryAction.Quarantine]: 'Karantinaya Al',
  [ExpiryAction.Scrap]: 'Hurda Olarak İşaretle',
  [ExpiryAction.DiscountSale]: 'İndirimli Satış',
};

export default function ShelfLifeRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: rule, isLoading } = useShelfLifeRule(id);
  const deleteRule = useDeleteShelfLife();
  const activateRule = useActivateShelfLife();
  const deactivateRule = useDeactivateShelfLife();

  const handleDelete = () => {
    Modal.confirm({
      title: 'Raf Ömrü Kuralını Sil',
      content: 'Bu kuralı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteRule.mutateAsync(id);
        router.push('/inventory/shelf-life/rules');
      },
    });
  };

  const handleToggleStatus = () => {
    if (rule?.isActive) {
      deactivateRule.mutate(id);
    } else {
      activateRule.mutate(id);
    }
  };

  const formatRuleValue = (
    ruleType: number,
    days?: number,
    percent?: number
  ): string => {
    if (ruleType === ShelfLifeRuleType.Days) {
      return `${days || 0} gün`;
    } else if (ruleType === ShelfLifeRuleType.Percentage) {
      return `%${percent || 0}`;
    } else if (ruleType === ShelfLifeRuleType.Both) {
      return `${days || 0} gün / %${percent || 0}`;
    }
    return '-';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Raf ömrü kuralı bulunamadı</p>
          <Button onClick={() => router.push('/inventory/shelf-life/rules')}>
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

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
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/inventory/shelf-life/rules')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {rule.productName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      rule.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rule.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 m-0">{rule.productCode}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={
                rule.isActive ? (
                  <XCircleIcon className="w-4 h-4" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )
              }
              onClick={handleToggleStatus}
              loading={activateRule.isPending || deactivateRule.isPending}
            >
              {rule.isActive ? 'Pasif Yap' : 'Aktif Yap'}
            </Button>
            <Link href={`/inventory/shelf-life/rules/${id}/edit`}>
              <Button icon={<PencilIcon className="w-4 h-4" />}>Düzenle</Button>
            </Link>
            <Button
              icon={<TrashIcon className="w-4 h-4" />}
              danger
              onClick={handleDelete}
              loading={deleteRule.isPending}
            >
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Info */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Temel Bilgiler */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CubeIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900 m-0">
                    Temel Bilgiler
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <Descriptions column={2} size="small" className="[&_.ant-descriptions-item-label]:!text-slate-500 [&_.ant-descriptions-item-content]:!text-slate-900">
                  <Descriptions.Item label="Ürün">
                    <span className="font-medium">{rule.productName}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ürün Kodu">{rule.productCode}</Descriptions.Item>
                  <Descriptions.Item label="Raf Ömrü Tipi">
                    {shelfLifeTypeLabels[rule.shelfLifeType] || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Toplam Raf Ömrü">
                    <span className="font-medium">{rule.totalShelfLifeDays} gün</span>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>

            {/* Mal Kabul ve Satış Kuralları */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900 m-0">
                    Kabul ve Satış Kuralları
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Mal Kabul */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Mal Kabul
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Kural Tipi</span>
                        <span className="text-sm text-slate-900">
                          {ruleTypeLabels[rule.receivingRuleType] || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Minimum Kalan</span>
                        <span className="text-sm font-medium text-slate-900">
                          {formatRuleValue(
                            rule.receivingRuleType,
                            rule.minReceivingShelfLifeDays,
                            rule.minReceivingShelfLifePercent
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Satış */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Satış
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Kural Tipi</span>
                        <span className="text-sm text-slate-900">
                          {ruleTypeLabels[rule.salesRuleType] || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Minimum Kalan</span>
                        <span className="text-sm font-medium text-slate-900">
                          {formatRuleValue(
                            rule.salesRuleType,
                            rule.minSalesShelfLifeDays,
                            rule.minSalesShelfLifePercent
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uyarı Eşikleri */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900 m-0">Uyarı Eşikleri</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                      Uyarı Eşiği
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-amber-700">Gün</span>
                        <span className="text-sm font-medium text-amber-900">
                          {rule.alertThresholdDays} gün
                        </span>
                      </div>
                      {rule.alertThresholdPercent !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-amber-700">Yüzde</span>
                          <span className="text-sm font-medium text-amber-900">
                            %{rule.alertThresholdPercent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3">
                      Kritik Eşik
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700">Gün</span>
                        <span className="text-sm font-medium text-red-900">
                          {rule.criticalThresholdDays} gün
                        </span>
                      </div>
                      {rule.criticalThresholdPercent !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-red-700">Yüzde</span>
                          <span className="text-sm font-medium text-red-900">
                            %{rule.criticalThresholdPercent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Side Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Süre Dolduğunda */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArchiveBoxIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-900 m-0">Süre Dolduğunda</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block mb-1">Yapılacak İşlem</span>
                  <span className="text-sm font-medium text-slate-900">
                    {expiryActionLabels[rule.expiryAction] || '-'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {rule.autoQuarantineOnExpiry ? (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm text-slate-600">Otomatik Karantina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rule.autoScrapOnExpiry ? (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm text-slate-600">Otomatik Hurda</span>
                  </div>
                </div>

                {rule.daysBeforeQuarantineAlert && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Karantina Uyarısı</span>
                    <span className="text-sm font-medium text-slate-900">
                      {rule.daysBeforeQuarantineAlert} gün önce
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Depolama */}
            {rule.requiresSpecialStorage && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Depolama Koşulları</h3>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-xs text-blue-700 block mb-1">Özel Depolama Gerekli</span>
                  <p className="text-sm text-blue-900 m-0">
                    {rule.storageConditions || 'Koşullar belirtilmemiş'}
                  </p>
                </div>
              </div>
            )}

            {/* Tarihler */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Kayıt Bilgileri</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Oluşturulma</span>
                  <span className="text-sm text-slate-900">
                    {dayjs(rule.createdAt).format('DD.MM.YYYY HH:mm')}
                  </span>
                </div>
                {rule.updatedAt && (
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Son Güncelleme</span>
                    <span className="text-sm text-slate-900">
                      {dayjs(rule.updatedAt).format('DD.MM.YYYY HH:mm')}
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
