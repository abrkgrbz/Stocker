'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Spin, Empty, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  PrinterIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import {
  useBaBsForm,
  useDeleteBaBsForm,
  useApproveBaBsForm,
  useFileBaBsForm,
  useCancelBaBsForm,
  useValidateBaBsForm,
} from '@/lib/api/hooks/useFinance';
import type { BaBsFormItemDto, BaBsFormStatus } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function BaBsFormDetailPage() {
  const router = useRouter();
  const params = useParams();
  const formId = Number(params.id);

  const { data: form, isLoading, error } = useBaBsForm(formId);
  const deleteBaBsForm = useDeleteBaBsForm();
  const approveBaBsForm = useApproveBaBsForm();
  const fileBaBsForm = useFileBaBsForm();
  const cancelBaBsForm = useCancelBaBsForm();
  const validateBaBsForm = useValidateBaBsForm();

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getStatusConfig = (status: BaBsFormStatus) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      Draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak', icon: <ClockIcon className="w-4 h-4" /> },
      Ready: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Hazır', icon: <ClockIcon className="w-4 h-4" /> },
      Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Filed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
      Accepted: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
      Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal', icon: <XCircleIcon className="w-4 h-4" /> },
    };
    return configs[status] || configs.Draft;
  };

  const getDocumentTypeName = (docType: string) => {
    const labels: Record<string, string> = {
      Invoice: 'Fatura',
      ProfessionalServiceReceipt: 'Serbest Meslek Makbuzu',
      ExpenseVoucher: 'Gider Pusulası',
      ProducerReceipt: 'Müstahsil Makbuzu',
      Other: 'Diğer',
    };
    return labels[docType] || docType;
  };

  const handleValidate = async () => {
    try {
      const result = await validateBaBsForm.mutateAsync(formId);
      if (result.isValid) {
        showSuccess('Form doğrulaması başarılı');
      } else {
        Modal.warning({
          title: 'Doğrulama Hataları',
          content: (
            <div>
              {result.errors && result.errors.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-red-600 mb-2">Hatalar:</p>
                  <ul className="list-disc pl-4">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-sm text-red-600">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings && result.warnings.length > 0 && (
                <div>
                  <p className="font-medium text-amber-600 mb-2">Uyarılar:</p>
                  <ul className="list-disc pl-4">
                    {result.warnings.map((warn, i) => (
                      <li key={i} className="text-sm text-amber-600">{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ),
        });
      }
    } catch (error) {
      showApiError(error, 'Doğrulama yapılamadı');
    }
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: 'Formu Onayla',
      content: 'Bu Ba-Bs formunu onaylamak istediğinize emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await approveBaBsForm.mutateAsync({ id: formId });
          showSuccess('Form onaylandı');
        } catch (error) {
          showApiError(error, 'Form onaylanamadı');
        }
      },
    });
  };

  const handleFile = async () => {
    Modal.confirm({
      title: 'GİB\'e Gönder',
      content: 'Bu Ba-Bs formunu GİB\'e göndermek istediğinize emin misiniz?',
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await fileBaBsForm.mutateAsync({ id: formId });
          showSuccess('Form GİB\'e gönderildi');
        } catch (error) {
          showApiError(error, 'Form gönderilemedi');
        }
      },
    });
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Formu İptal Et',
      content: 'Bu Ba-Bs formunu iptal etmek istediğinize emin misiniz?',
      okText: 'İptal Et',
      cancelText: 'Vazgeç',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await cancelBaBsForm.mutateAsync({ id: formId, data: { reason: 'Kullanıcı tarafından iptal edildi' } });
          showSuccess('Form iptal edildi');
        } catch (error) {
          showApiError(error, 'Form iptal edilemedi');
        }
      },
    });
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Formu Sil',
      content: 'Bu Ba-Bs formunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteBaBsForm.mutateAsync(formId);
          showSuccess('Form silindi');
          router.push('/finance/tax/ba-bs');
        } catch (error) {
          showApiError(error, 'Form silinemedi');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Ba-Bs formu bulunamadı" />
      </div>
    );
  }

  const statusConfig = getStatusConfig(form.status);
  const items = form.items || [];

  const itemColumns: ColumnsType<BaBsFormItemDto> = [
    {
      title: 'Sıra',
      dataIndex: 'sequenceNumber',
      key: 'sequenceNumber',
      width: 60,
    },
    {
      title: 'Vergi No',
      dataIndex: 'counterpartyTaxId',
      key: 'counterpartyTaxId',
    },
    {
      title: 'Karşı Taraf',
      dataIndex: 'counterpartyName',
      key: 'counterpartyName',
    },
    {
      title: 'Belge Türü',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type) => getDocumentTypeName(type),
    },
    {
      title: 'Belge Sayısı',
      dataIndex: 'documentCount',
      key: 'documentCount',
      align: 'center',
    },
    {
      title: 'KDV Hariç',
      dataIndex: 'amountExcludingVat',
      key: 'amountExcludingVat',
      align: 'right',
      render: (amount) => formatCurrency(amount, form.currency),
    },
    {
      title: 'KDV',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount, form.currency),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalAmountIncludingVat',
      key: 'totalAmountIncludingVat',
      align: 'right',
      render: (amount) => formatCurrency(amount, form.currency),
    },
  ];

  const canEdit = form.status === 'Draft';
  const canApprove = form.status === 'Draft' || form.status === 'Ready';
  const canFile = form.status === 'Approved';
  const canCancel = !['Cancelled', 'Accepted'].includes(form.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/finance/tax/ba-bs')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${form.formType === 'Ba' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {form.formNumber}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                  {form.isCorrection && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      <DocumentDuplicateIcon className="w-3 h-3" />
                      Düzeltme
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {form.formType === 'Ba' ? 'Ba Formu (Alışlar)' : 'Bs Formu (Satışlar)'} - {monthNames[form.periodMonth - 1]} {form.periodYear}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={<ExclamationTriangleIcon className="w-4 h-4" />}
              onClick={handleValidate}
              loading={validateBaBsForm.isPending}
              className="border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50"
            >
              Doğrula
            </Button>
            {canApprove && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveBaBsForm.isPending}
                className="border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Onayla
              </Button>
            )}
            {canFile && (
              <Button
                icon={<PaperAirplaneIcon className="w-4 h-4" />}
                onClick={handleFile}
                loading={fileBaBsForm.isPending}
                className="border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
              >
                GİB&apos;e Gönder
              </Button>
            )}
            {canCancel && (
              <Button
                icon={<XCircleIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelBaBsForm.isPending}
                className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
              >
                İptal Et
              </Button>
            )}
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Yazdır
            </Button>
            {canEdit && (
              <Button
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/finance/tax/ba-bs/${formId}/edit`)}
              >
                Düzenle
              </Button>
            )}
            {canEdit && (
              <Button
                icon={<TrashIcon className="w-4 h-4" />}
                danger
                onClick={handleDelete}
                loading={deleteBaBsForm.isPending}
              >
                Sil
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Form Info */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Form Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Form No</p>
                  <p className="text-sm font-medium text-slate-900">{form.formNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Form Türü</p>
                  <p className="text-sm font-medium text-slate-900">
                    {form.formType === 'Ba' ? 'Ba - Alış Bildirimi' : 'Bs - Satış Bildirimi'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Dönem</p>
                  <p className="text-sm font-medium text-slate-900">
                    {monthNames[form.periodMonth - 1]} {form.periodYear}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Son Gönderim Tarihi</p>
                  <p className={`text-sm font-medium ${
                    dayjs(form.filingDeadline).isBefore(dayjs()) && !['Filed', 'Accepted'].includes(form.status)
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}>
                    {dayjs(form.filingDeadline).format('DD MMM YYYY')}
                  </p>
                </div>
              </div>

              {/* Company Info */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Firma Bilgileri
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Firma Adı</p>
                    <p className="text-sm font-medium text-slate-900">{form.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Vergi No</p>
                    <p className="text-sm font-medium text-slate-900">{form.taxId}</p>
                  </div>
                  {form.taxOffice && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Vergi Dairesi</p>
                      <p className="text-sm font-medium text-slate-900">{form.taxOffice}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* GİB Info */}
              {form.status === 'Filed' || form.status === 'Accepted' || form.status === 'Rejected' ? (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    GİB Bilgileri
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {form.filingDate && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Gönderim Tarihi</p>
                        <p className="text-sm font-medium text-slate-900">
                          {dayjs(form.filingDate).format('DD MMM YYYY HH:mm')}
                        </p>
                      </div>
                    )}
                    {form.gibApprovalNumber && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">GİB Onay No</p>
                        <p className="text-sm font-medium text-emerald-600">{form.gibApprovalNumber}</p>
                      </div>
                    )}
                    {form.gibSubmissionReference && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Gönderim Referansı</p>
                        <p className="text-sm font-medium text-slate-900">{form.gibSubmissionReference}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Form Items */}
            <div className="bg-white border border-slate-200 rounded-xl mt-6 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Bildirim Kalemleri ({items.length} kayıt)
                </p>
              </div>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="id"
                pagination={items.length > 10 ? { pageSize: 10 } : false}
                size="small"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Toplam Kayıt</span>
                  <span className="text-sm font-medium text-slate-700">{form.totalRecordCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">KDV Hariç Toplam</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(form.totalAmountExcludingVat, form.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Toplam KDV</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(form.totalVat, form.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Genel Toplam</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(form.totalAmountIncludingVat, form.currency)}
                  </span>
                </div>
              </div>

              {/* Workflow Info */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  İş Akışı
                </p>
                <div className="space-y-2 text-xs">
                  {form.preparedBy && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hazırlayan:</span>
                      <span className="text-slate-600">{form.preparedBy}</span>
                    </div>
                  )}
                  {form.preparationDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hazırlama Tarihi:</span>
                      <span className="text-slate-600">{dayjs(form.preparationDate).format('DD MMM YYYY')}</span>
                    </div>
                  )}
                  {form.approvedBy && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Onaylayan:</span>
                      <span className="text-slate-600">{form.approvedBy}</span>
                    </div>
                  )}
                  {form.approvalDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Onay Tarihi:</span>
                      <span className="text-slate-600">{dayjs(form.approvalDate).format('DD MMM YYYY')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {form.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Notlar
                  </p>
                  <p className="text-sm text-slate-600">{form.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Oluşturulma: {dayjs(form.createdAt).format('DD MMM YYYY HH:mm')}</span>
                  </div>
                  {form.updatedAt && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Güncelleme: {dayjs(form.updatedAt).format('DD MMM YYYY HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
