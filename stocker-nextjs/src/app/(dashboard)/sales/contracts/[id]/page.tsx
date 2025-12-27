'use client';

/**
 * Customer Contract Detail Page
 * Enterprise-grade detail view following CRM patterns
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Spin, Alert, Modal, Tag, Descriptions, Divider } from 'antd';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import {
  useCustomerContract,
  useActivateCustomerContract,
  useSuspendCustomerContract,
  useRenewCustomerContract,
} from '@/lib/api/hooks/useSales';
import type { ContractStatus, ContractType } from '@/lib/api/services/sales.service';
import { Badge, Card, PageContainer, StatCard } from '@/components/ui/enterprise-page';
import dayjs from 'dayjs';

const statusConfig: Record<ContractStatus, { label: string; color: string }> = {
  Draft: { label: 'Taslak', color: 'default' },
  Active: { label: 'Aktif', color: 'success' },
  Suspended: { label: 'Askıda', color: 'warning' },
  Terminated: { label: 'Feshedildi', color: 'error' },
  Expired: { label: 'Süresi Doldu', color: 'default' },
  PendingApproval: { label: 'Onay Bekliyor', color: 'processing' },
};

const typeLabels: Record<ContractType, string> = {
  Standard: 'Standart',
  Premium: 'Premium',
  Enterprise: 'Kurumsal',
  Custom: 'Özel',
  Framework: 'Çerçeve Sözleşme',
  ServiceLevel: 'SLA Sözleşmesi',
};

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: contract, isLoading, error, refetch } = useCustomerContract(id);
  const activateMutation = useActivateCustomerContract();
  const suspendMutation = useSuspendCustomerContract();
  const renewMutation = useRenewCustomerContract();

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleSuspend = () => {
    Modal.confirm({
      title: 'Sözleşmeyi Askıya Al',
      content: 'Bu sözleşmeyi askıya almak istediğinizden emin misiniz?',
      okText: 'Askıya Al',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        await suspendMutation.mutateAsync({ id, reason: 'Kullanıcı tarafından askıya alındı' });
      },
    });
  };

  const handleRenew = () => {
    Modal.confirm({
      title: 'Sözleşmeyi Yenile',
      content: 'Bu sözleşmeyi 1 yıl uzatmak istediğinizden emin misiniz?',
      okText: 'Yenile',
      cancelText: 'Vazgeç',
      onOk: async () => {
        const newEndDate = dayjs(contract?.endDate).add(1, 'year').toISOString();
        await renewMutation.mutateAsync({ id, newEndDate });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-8">
        <Alert
          message="Sözleşme Bulunamadı"
          description="İstenen sözleşme bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/sales/contracts')}>
              Geri Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[contract.status as ContractStatus];
  const daysUntilExpiry = contract.endDate
    ? Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/sales/contracts')}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  {contract.contractNumber}
                </h1>
                <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
              </div>
              <p className="text-sm text-slate-400 m-0">{contract.customerName}</p>
            </div>
          </div>
          <Space>
            {contract.status === 'Draft' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleActivate}
                loading={activateMutation.isPending}
              >
                Aktifleştir
              </Button>
            )}
            {contract.status === 'Active' && (
              <>
                <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={handleRenew} loading={renewMutation.isPending}>
                  Yenile
                </Button>
                <Button icon={<PauseCircleIcon className="w-4 h-4" />} onClick={handleSuspend} loading={suspendMutation.isPending}>
                  Askıya Al
                </Button>
              </>
            )}
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/sales/contracts/${id}/edit`)}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-6xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Sözleşme Türü"
            value={typeLabels[contract.contractType as ContractType] || contract.contractType}
            iconColor="#6366f1"
          />
          <StatCard
            label="Kredi Limiti"
            value={
              contract.creditLimit
                ? new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: contract.creditLimit.currency,
                  }).format(contract.creditLimit.amount)
                : '-'
            }
            iconColor="#10b981"
          />
          <StatCard
            label="İndirim Oranı"
            value={contract.generalDiscountPercentage ? `%${contract.generalDiscountPercentage}` : '-'}
            iconColor="#f59e0b"
          />
          <StatCard
            label="Kalan Gün"
            value={daysUntilExpiry !== null ? daysUntilExpiry : '-'}
            iconColor={daysUntilExpiry !== null && daysUntilExpiry <= 30 ? '#ef4444' : '#6366f1'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-sm font-medium text-slate-900 mb-4">Sözleşme Bilgileri</h3>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Sözleşme No">
                  <span className="font-medium">{contract.contractNumber}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Müşteri">
                  <span className="font-medium">{contract.customerName}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Başlangıç Tarihi">
                  {dayjs(contract.startDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Bitiş Tarihi">
                  {dayjs(contract.endDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Vadesi">
                  {contract.defaultPaymentDueDays ? `${contract.defaultPaymentDueDays} gün` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* SLA Info */}
            {(contract.responseTimeHours || contract.resolutionTimeHours || contract.supportHours) && (
              <Card>
                <h3 className="text-sm font-medium text-slate-900 mb-4">SLA Bilgileri</h3>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Servis Seviyesi">
                    {contract.serviceLevel || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Yanıt Süresi">
                    {contract.responseTimeHours
                      ? `${contract.responseTimeHours} saat`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Çözüm Süresi">
                    {contract.resolutionTimeHours
                      ? `${contract.resolutionTimeHours} saat`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destek Saatleri">
                    {contract.supportHours || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destek Önceliği">
                    {contract.supportPriority || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Yerinde Destek">
                    {contract.includesOnSiteSupport ? 'Evet' : 'Hayır'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Special Terms */}
            {contract.specialTerms && (
              <Card>
                <h3 className="text-sm font-medium text-slate-900 mb-4">Özel Şartlar</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{contract.specialTerms}</p>
              </Card>
            )}

            {/* Internal Notes */}
            {contract.internalNotes && (
              <Card>
                <h3 className="text-sm font-medium text-slate-900 mb-4">Dahili Notlar</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{contract.internalNotes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Agreements */}
            {contract.priceAgreements && contract.priceAgreements.length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-slate-900 mb-4">Fiyat Anlaşmaları</h3>
                <div className="space-y-3">
                  {contract.priceAgreements.map((agreement, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900">
                        {agreement.productName || agreement.productId}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {agreement.discountPercentage
                          ? `%${agreement.discountPercentage} indirim`
                          : agreement.specialPrice
                          ? new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: agreement.specialPrice.currency,
                            }).format(agreement.specialPrice.amount)
                          : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Payment Terms */}
            {contract.paymentTerms && contract.paymentTerms.length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-slate-900 mb-4">Ödeme Koşulları</h3>
                <div className="space-y-3">
                  {contract.paymentTerms.map((term, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-900">
                        {term.termType}{term.isDefault ? ' (Varsayılan)' : ''}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {term.dueDays} gün | {term.discountPercentage ? `%${term.discountPercentage} iskonto (${term.discountDays} gün içinde)` : 'İskonto yok'}
                      </div>
                      {term.description && (
                        <div className="text-xs text-slate-400 mt-1">{term.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contract Info */}
            <Card>
              <h3 className="text-sm font-medium text-slate-900 mb-4">Sözleşme Bilgileri</h3>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Otomatik Yenileme">
                  {contract.autoRenewal ? 'Evet' : 'Hayır'}
                </Descriptions.Item>
                {contract.renewalPeriodMonths && (
                  <Descriptions.Item label="Yenileme Süresi">
                    {contract.renewalPeriodMonths} ay
                  </Descriptions.Item>
                )}
                {contract.renewalNoticeBeforeDays && (
                  <Descriptions.Item label="Bildirim Süresi">
                    {contract.renewalNoticeBeforeDays} gün önce
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Son Kullanım">
                  {contract.daysUntilExpiration} gün kaldı
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
