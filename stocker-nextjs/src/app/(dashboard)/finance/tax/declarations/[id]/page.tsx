'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Spin, Empty, Modal, Table, Form, InputNumber, DatePicker, Select, Input } from 'antd';
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
  BanknotesIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useTaxDeclaration,
  useDeleteTaxDeclaration,
  useApproveTaxDeclaration,
  useFileTaxDeclaration,
  useRecordTaxPayment,
  useCancelTaxDeclaration,
  useCreateTaxAmendment,
} from '@/lib/api/hooks/useFinance';
import type {
  TaxDeclarationDetailDto,
  TaxDeclarationPaymentDto,
  TaxDeclarationStatus,
  RecordTaxPaymentDto,
  TaxPaymentMethod,
} from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const quarterNames = ['Q1 (Ocak-Mart)', 'Q2 (Nisan-Haziran)', 'Q3 (Temmuz-Eylül)', 'Q4 (Ekim-Aralık)'];

const declarationTypeLabels: Record<string, string> = {
  Kdv: 'KDV Beyannamesi',
  Kdv2: 'KDV 2 No\'lu Beyanname',
  Muhtasar: 'Muhtasar Beyanname',
  MuhtasarPrimHizmet: 'Muhtasar ve Prim Hizmet',
  GeciciVergi: 'Geçici Vergi',
  KurumlarVergisi: 'Kurumlar Vergisi',
  GelirVergisi: 'Gelir Vergisi',
  DamgaVergisi: 'Damga Vergisi',
  Otv: 'ÖTV Beyannamesi',
  VerasetIntikal: 'Veraset ve İntikal',
};

const paymentMethodOptions = [
  { value: 'BankTransfer', label: 'Banka Havalesi' },
  { value: 'CreditCard', label: 'Kredi Kartı' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'DirectDebit', label: 'Otomatik Ödeme' },
  { value: 'InteractiveVD', label: 'İnteraktif Vergi Dairesi' },
];

export default function TaxDeclarationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const declarationId = Number(params.id);

  const { data: declaration, isLoading, error } = useTaxDeclaration(declarationId);
  const deleteTaxDeclaration = useDeleteTaxDeclaration();
  const approveTaxDeclaration = useApproveTaxDeclaration();
  const fileTaxDeclaration = useFileTaxDeclaration();
  const recordTaxPayment = useRecordTaxPayment();
  const cancelTaxDeclaration = useCancelTaxDeclaration();
  const createTaxAmendment = useCreateTaxAmendment();

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isAmendmentModalVisible, setIsAmendmentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [amendmentForm] = Form.useForm();

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getStatusConfig = (status: TaxDeclarationStatus) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      Draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak', icon: <ClockIcon className="w-4 h-4" /> },
      Calculated: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Hesaplandı', icon: <ClockIcon className="w-4 h-4" /> },
      PendingApproval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor', icon: <ClockIcon className="w-4 h-4" /> },
      Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Filed: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
      Accepted: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
      PartiallyPaid: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Kısmi Ödeme', icon: <BanknotesIcon className="w-4 h-4" /> },
      Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ödendi', icon: <CheckCircleIcon className="w-4 h-4" /> },
      Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal', icon: <XCircleIcon className="w-4 h-4" /> },
    };
    return configs[status] || configs.Draft;
  };

  const getPeriodText = () => {
    if (!declaration) return '';
    if (declaration.taxQuarter) {
      return `${quarterNames[declaration.taxQuarter - 1]} ${declaration.taxYear}`;
    }
    if (declaration.taxMonth) {
      return `${monthNames[declaration.taxMonth - 1]} ${declaration.taxYear}`;
    }
    return `${declaration.taxYear}`;
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: 'Beyanname Onayla',
      content: 'Bu beyannamei onaylamak istediğinize emin misiniz?',
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await approveTaxDeclaration.mutateAsync({ id: declarationId });
          showSuccess('Beyanname onaylandı');
        } catch (error) {
          showApiError(error, 'Beyanname onaylanamadı');
        }
      },
    });
  };

  const handleFile = async () => {
    Modal.confirm({
      title: 'GİB\'e Gönder',
      content: 'Bu beyannameyi GİB\'e göndermek istediğinize emin misiniz?',
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await fileTaxDeclaration.mutateAsync({ id: declarationId });
          showSuccess('Beyanname GİB\'e gönderildi');
        } catch (error) {
          showApiError(error, 'Beyanname gönderilemedi');
        }
      },
    });
  };

  const handleRecordPayment = async (values: any) => {
    try {
      const paymentData: RecordTaxPaymentDto = {
        paymentDate: values.paymentDate.toISOString(),
        amount: values.amount,
        paymentMethod: values.paymentMethod as TaxPaymentMethod,
        receiptNumber: values.receiptNumber,
        notes: values.notes,
      };
      await recordTaxPayment.mutateAsync({ id: declarationId, data: paymentData });
      showSuccess('Ödeme kaydedildi');
      setIsPaymentModalVisible(false);
      paymentForm.resetFields();
    } catch (error) {
      showApiError(error, 'Ödeme kaydedilemedi');
    }
  };

  const handleCreateAmendment = async (values: any) => {
    try {
      await createTaxAmendment.mutateAsync({
        id: declarationId,
        data: {
          amendmentReason: values.amendmentReason,
          newTaxBase: values.newTaxBase,
          newCalculatedTax: values.newCalculatedTax,
          newDeductibleTax: values.newDeductibleTax,
        },
      });
      showSuccess('Düzeltme beyannamesi oluşturuldu');
      setIsAmendmentModalVisible(false);
      amendmentForm.resetFields();
    } catch (error) {
      showApiError(error, 'Düzeltme beyannamesi oluşturulamadı');
    }
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: 'Beyanname İptal Et',
      content: 'Bu beyannameyi iptal etmek istediğinize emin misiniz?',
      okText: 'İptal Et',
      cancelText: 'Vazgeç',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await cancelTaxDeclaration.mutateAsync({ id: declarationId, data: { reason: 'Kullanıcı tarafından iptal edildi' } });
          showSuccess('Beyanname iptal edildi');
        } catch (error) {
          showApiError(error, 'Beyanname iptal edilemedi');
        }
      },
    });
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Beyanname Sil',
      content: 'Bu beyannameyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteTaxDeclaration.mutateAsync(declarationId);
          showSuccess('Beyanname silindi');
          router.push('/finance/tax/declarations');
        } catch (error) {
          showApiError(error, 'Beyanname silinemedi');
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

  if (error || !declaration) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Vergi beyannamesi bulunamadı" />
      </div>
    );
  }

  const statusConfig = getStatusConfig(declaration.status);
  const details = declaration.details || [];
  const payments = declaration.payments || [];

  const detailColumns: ColumnsType<TaxDeclarationDetailDto> = [
    { title: 'Kod', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Açıklama', dataIndex: 'description', key: 'description' },
    {
      title: 'Matrah',
      dataIndex: 'taxBase',
      key: 'taxBase',
      align: 'right',
      render: (value) => formatCurrency(value, declaration.currency),
    },
    {
      title: 'Oran',
      dataIndex: 'taxRate',
      key: 'taxRate',
      align: 'center',
      render: (value) => value ? `%${value}` : '-',
    },
    {
      title: 'Vergi Tutarı',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      align: 'right',
      render: (value) => formatCurrency(value, declaration.currency),
    },
  ];

  const paymentColumns: ColumnsType<TaxDeclarationPaymentDto> = [
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    { title: 'Yöntem', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (value) => formatCurrency(value, declaration.currency),
    },
    { title: 'Makbuz No', dataIndex: 'receiptNumber', key: 'receiptNumber' },
    { title: 'Not', dataIndex: 'notes', key: 'notes' },
  ];

  const canEdit = declaration.status === 'Draft';
  const canApprove = ['Draft', 'Calculated', 'PendingApproval'].includes(declaration.status);
  const canFile = declaration.status === 'Approved';
  const canPay = ['Accepted', 'PartiallyPaid'].includes(declaration.status) && declaration.remainingBalance > 0;
  const canAmend = ['Filed', 'Accepted', 'Paid'].includes(declaration.status);
  const canCancel = !['Cancelled', 'Paid'].includes(declaration.status);

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
              onClick={() => router.push('/finance/tax/declarations')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {declaration.declarationNumber}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                  {declaration.isAmendment && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      <DocumentDuplicateIcon className="w-3 h-3" />
                      Düzeltme
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {declarationTypeLabels[declaration.declarationType] || declaration.declarationType} - {getPeriodText()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canApprove && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveTaxDeclaration.isPending}
                className="border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Onayla
              </Button>
            )}
            {canFile && (
              <Button
                icon={<PaperAirplaneIcon className="w-4 h-4" />}
                onClick={handleFile}
                loading={fileTaxDeclaration.isPending}
                className="border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
              >
                GİB&apos;e Gönder
              </Button>
            )}
            {canPay && (
              <Button
                icon={<BanknotesIcon className="w-4 h-4" />}
                onClick={() => setIsPaymentModalVisible(true)}
                className="border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Ödeme Kaydet
              </Button>
            )}
            {canAmend && (
              <Button
                icon={<DocumentDuplicateIcon className="w-4 h-4" />}
                onClick={() => setIsAmendmentModalVisible(true)}
                className="border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50"
              >
                Düzeltme
              </Button>
            )}
            {canCancel && (
              <Button
                icon={<XCircleIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelTaxDeclaration.isPending}
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
                icon={<TrashIcon className="w-4 h-4" />}
                danger
                onClick={handleDelete}
                loading={deleteTaxDeclaration.isPending}
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
          {/* Declaration Info */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Beyanname Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Beyanname No</p>
                  <p className="text-sm font-medium text-slate-900">{declaration.declarationNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Beyanname Türü</p>
                  <p className="text-sm font-medium text-slate-900">
                    {declarationTypeLabels[declaration.declarationType] || declaration.declarationType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Dönem</p>
                  <p className="text-sm font-medium text-slate-900">{getPeriodText()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Son Beyan Tarihi</p>
                  <p className={`text-sm font-medium ${
                    dayjs(declaration.filingDeadline).isBefore(dayjs()) && !['Filed', 'Accepted', 'Paid'].includes(declaration.status)
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}>
                    {dayjs(declaration.filingDeadline).format('DD MMM YYYY')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Son Ödeme Tarihi</p>
                  <p className={`text-sm font-medium ${
                    dayjs(declaration.paymentDeadline).isBefore(dayjs()) && declaration.remainingBalance > 0
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}>
                    {dayjs(declaration.paymentDeadline).format('DD MMM YYYY')}
                  </p>
                </div>
              </div>

              {/* Tax Office Info */}
              {(declaration.taxOfficeCode || declaration.taxOfficeName) && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Vergi Dairesi
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {declaration.taxOfficeCode && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Vergi Dairesi Kodu</p>
                        <p className="text-sm font-medium text-slate-900">{declaration.taxOfficeCode}</p>
                      </div>
                    )}
                    {declaration.taxOfficeName && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Vergi Dairesi</p>
                        <p className="text-sm font-medium text-slate-900">{declaration.taxOfficeName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GİB Info */}
              {(declaration.filingDate || declaration.gibApprovalNumber) && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    GİB Bilgileri
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {declaration.filingDate && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Beyan Tarihi</p>
                        <p className="text-sm font-medium text-slate-900">
                          {dayjs(declaration.filingDate).format('DD MMM YYYY HH:mm')}
                        </p>
                      </div>
                    )}
                    {declaration.gibApprovalNumber && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">GİB Onay No</p>
                        <p className="text-sm font-medium text-emerald-600">{declaration.gibApprovalNumber}</p>
                      </div>
                    )}
                    {declaration.accrualSlipNumber && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Tahakkuk Fişi No</p>
                        <p className="text-sm font-medium text-slate-900">{declaration.accrualSlipNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Declaration Details */}
            {details.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl mt-6 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Beyanname Detayları
                  </p>
                </div>
                <Table
                  columns={detailColumns}
                  dataSource={details}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl mt-6 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Ödeme Geçmişi
                  </p>
                </div>
                <Table
                  columns={paymentColumns}
                  dataSource={payments}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Vergi Özeti
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Matrah</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(declaration.taxBase, declaration.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Hesaplanan Vergi</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCurrency(declaration.calculatedTax, declaration.currency)}
                  </span>
                </div>
                {(declaration.deductibleTax || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">İndirilecek Vergi</span>
                    <span className="text-sm font-medium text-emerald-600">
                      -{formatCurrency(declaration.deductibleTax || 0, declaration.currency)}
                    </span>
                  </div>
                )}
                {(declaration.carriedForwardTax || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Sonraki Döneme Devreden</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(declaration.carriedForwardTax || 0, declaration.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Ödenecek Vergi</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(declaration.netTax, declaration.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Ödeme Durumu
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Ödenen</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {formatCurrency(declaration.paidAmount, declaration.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Kalan</span>
                    <span className={`text-sm font-medium ${
                      declaration.remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(declaration.remainingBalance, declaration.currency)}
                    </span>
                  </div>
                  {(declaration.lateInterest || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Gecikme Faizi</span>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(declaration.lateInterest || 0, declaration.currency)}
                      </span>
                    </div>
                  )}
                  {(declaration.latePenalty || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Gecikme Zammı</span>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(declaration.latePenalty || 0, declaration.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {declaration.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Notlar
                  </p>
                  <p className="text-sm text-slate-600">{declaration.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Oluşturulma: {dayjs(declaration.createdAt).format('DD MMM YYYY HH:mm')}</span>
                  </div>
                  {declaration.updatedAt && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Güncelleme: {dayjs(declaration.updatedAt).format('DD MMM YYYY HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        title="Vergi Ödemesi Kaydet"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleRecordPayment}
          initialValues={{
            paymentDate: dayjs(),
            amount: declaration?.remainingBalance || 0,
            paymentMethod: 'BankTransfer',
          }}
        >
          <Form.Item
            name="paymentDate"
            label="Ödeme Tarihi"
            rules={[{ required: true, message: 'Ödeme tarihi seçiniz' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Tutar"
            rules={[{ required: true, message: 'Tutar giriniz' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={declaration?.remainingBalance || 0}
              precision={2}
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>
          <Form.Item
            name="paymentMethod"
            label="Ödeme Yöntemi"
            rules={[{ required: true, message: 'Ödeme yöntemi seçiniz' }]}
          >
            <Select options={paymentMethodOptions} />
          </Form.Item>
          <Form.Item name="receiptNumber" label="Makbuz/Dekont No">
            <Input placeholder="Ödeme referans numarası" />
          </Form.Item>
          <Form.Item name="notes" label="Not">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsPaymentModalVisible(false)}>İptal</Button>
            <Button type="primary" htmlType="submit" loading={recordTaxPayment.isPending}>
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Amendment Modal */}
      <Modal
        title="Düzeltme Beyannamesi Oluştur"
        open={isAmendmentModalVisible}
        onCancel={() => setIsAmendmentModalVisible(false)}
        footer={null}
      >
        <Form
          form={amendmentForm}
          layout="vertical"
          onFinish={handleCreateAmendment}
        >
          <Form.Item
            name="amendmentReason"
            label="Düzeltme Nedeni"
            rules={[{ required: true, message: 'Düzeltme nedeni giriniz' }]}
          >
            <Input.TextArea rows={2} placeholder="Düzeltme yapılma nedeni" />
          </Form.Item>
          <Form.Item
            name="newTaxBase"
            label="Yeni Matrah"
            help="Değişiklik varsa yeni matrah tutarını giriniz"
          >
            <InputNumber
              style={{ width: '100%' }}
              precision={2}
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>
          <Form.Item
            name="newCalculatedTax"
            label="Yeni Hesaplanan Vergi"
          >
            <InputNumber
              style={{ width: '100%' }}
              precision={2}
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>
          <Form.Item
            name="newDeductibleTax"
            label="Yeni İndirilecek Vergi"
          >
            <InputNumber
              style={{ width: '100%' }}
              precision={2}
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsAmendmentModalVisible(false)}>İptal</Button>
            <Button type="primary" htmlType="submit" loading={createTaxAmendment.isPending}>
              Oluştur
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
