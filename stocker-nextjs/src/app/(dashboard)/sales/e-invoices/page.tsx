'use client';

import React, { useState } from 'react';
import {
  Table,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  Tabs,
  Input,
  Alert,
  Tag,
  Badge,
  Tooltip,
  Space,
} from 'antd';
import {
  Search,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  Settings,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInvoices, useSetEInvoice } from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const eInvoiceStatusConfig: Record<string, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'text-slate-700', bgColor: 'bg-slate-100', label: 'Bekliyor', icon: <AlertCircle className="w-4 h-4" /> },
  Queued: { color: 'text-slate-700', bgColor: 'bg-slate-200', label: 'Kuyrukta', icon: <RefreshCw className="w-4 h-4 animate-spin" /> },
  Sent: { color: 'text-slate-700', bgColor: 'bg-slate-300', label: 'Gönderildi', icon: <Send className="w-4 h-4" /> },
  Delivered: { color: 'text-slate-800', bgColor: 'bg-slate-400', label: 'Ulaştı', icon: <CheckCircle className="w-4 h-4" /> },
  Accepted: { color: 'text-white', bgColor: 'bg-slate-700', label: 'Kabul Edildi', icon: <CheckCircle className="w-4 h-4" /> },
  Rejected: { color: 'text-white', bgColor: 'bg-slate-900', label: 'Reddedildi', icon: <XCircle className="w-4 h-4" /> },
  Error: { color: 'text-white', bgColor: 'bg-slate-800', label: 'Hata', icon: <XCircle className="w-4 h-4" /> },
};

const invoiceStatusConfig: Record<InvoiceStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: 'text-slate-600', bgColor: 'bg-slate-100', label: 'Taslak' },
  Issued: { color: 'text-slate-700', bgColor: 'bg-slate-200', label: 'Kesildi' },
  Sent: { color: 'text-slate-700', bgColor: 'bg-slate-300', label: 'Gönderildi' },
  PartiallyPaid: { color: 'text-slate-800', bgColor: 'bg-slate-400', label: 'Kısmi Ödendi' },
  Paid: { color: 'text-white', bgColor: 'bg-slate-700', label: 'Ödendi' },
  Overdue: { color: 'text-white', bgColor: 'bg-slate-800', label: 'Vadesi Geçmiş' },
  Cancelled: { color: 'text-white', bgColor: 'bg-slate-900', label: 'İptal' },
};

export default function EInvoicePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceListItem | null>(null);
  const [sendForm] = Form.useForm();

  const setEInvoice = useSetEInvoice();

  // Fetch invoices that are issued or e-invoice enabled
  const { data: invoicesData, isLoading, refetch } = useInvoices({
    status: statusFilter,
    searchTerm: searchTerm || undefined,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    pageSize: 50,
  });

  const invoices = invoicesData?.items ?? [];
  const eInvoices = invoices.filter(inv => inv.isEInvoice);
  const pendingEInvoices = eInvoices.filter(inv => inv.status === 'Issued');

  const handleSendEInvoice = (invoice: InvoiceListItem) => {
    setCurrentInvoice(invoice);
    sendForm.setFieldsValue({
      eInvoiceId: '',
    });
    setSendModalOpen(true);
  };

  const handleSendSubmit = async (values: any) => {
    if (!currentInvoice) return;
    try {
      await setEInvoice.mutateAsync({
        id: currentInvoice.id,
        data: {
          eInvoiceId: values.eInvoiceId,
          eInvoiceStatus: 'Queued',
        },
      });
      message.success('E-Fatura gönderilmek üzere kuyruğa eklendi');
      setSendModalOpen(false);
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'E-Fatura gönderilemedi');
    }
  };

  const handleBulkSend = () => {
    if (selectedInvoices.length === 0) {
      message.warning('Lütfen göndermek için fatura seçiniz');
      return;
    }
    Modal.confirm({
      title: 'Toplu E-Fatura Gönderimi',
      content: `${selectedInvoices.length} adet fatura e-fatura olarak gönderilecek. Devam etmek istiyor musunuz?`,
      okText: 'Gönder',
      cancelText: 'Vazgeç',
      onOk: async () => {
        message.info('Toplu gönderim başlatıldı');
        // In a real implementation, this would send each invoice
        setSelectedInvoices([]);
      },
    });
  };

  const columns = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string, record: InvoiceListItem) => (
        <button
          onClick={() => router.push(`/sales/invoices/${record.id}`)}
          className="text-slate-900 hover:text-slate-700 font-medium hover:underline"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Fatura Tarihi',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      align: 'right' as const,
      render: (amount: number, record: InvoiceListItem) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount),
    },
    {
      title: 'Fatura Durumu',
      dataIndex: 'status',
      key: 'status',
      render: (status: InvoiceStatus) => {
        const config = invoiceStatusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'E-Fatura',
      key: 'eInvoice',
      render: (_: any, record: InvoiceListItem) => (
        record.isEInvoice ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-white">
            E-Fatura
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Klasik
          </span>
        )
      ),
    },
    {
      title: 'E-Fatura Durumu',
      key: 'eInvoiceStatus',
      render: (_: any, record: InvoiceListItem) => {
        if (!record.isEInvoice) return <span className="text-slate-400">-</span>;
        // In a real app, this would come from the API
        const status = 'Pending';
        const config = eInvoiceStatusConfig[status];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      render: (_: any, record: InvoiceListItem) => (
        <div className="flex items-center gap-2">
          {record.status === 'Issued' && (
            <Tooltip title="E-Fatura Gönder">
              <button
                onClick={() => handleSendEInvoice(record)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Gönder
              </button>
            </Tooltip>
          )}
          <Tooltip title="Detay">
            <button
              onClick={() => router.push(`/sales/invoices/${record.id}`)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedInvoices,
    onChange: (keys: React.Key[]) => setSelectedInvoices(keys as string[]),
    getCheckboxProps: (record: InvoiceListItem) => ({
      disabled: record.status !== 'Issued',
    }),
  };

  const tableClassName = `
    [&_.ant-table]:!border-slate-200
    [&_.ant-table-thead>tr>th]:!bg-slate-50
    [&_.ant-table-thead>tr>th]:!text-slate-600
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-thead>tr>th]:!border-b
    [&_.ant-table-thead>tr>th]:!border-slate-200
    [&_.ant-table-tbody>tr>td]:!border-b
    [&_.ant-table-tbody>tr>td]:!border-slate-100
    [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50
    [&_.ant-table-tbody>tr>td]:!py-4
    [&_.ant-pagination]:!mt-4
    [&_.ant-pagination-item-active]:!bg-slate-900
    [&_.ant-pagination-item-active]:!border-slate-900
    [&_.ant-pagination-item-active>a]:!text-white
  `;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">E-Fatura Yönetimi</h1>
          <p className="text-sm text-slate-500">E-Fatura ve E-Arşiv fatura işlemlerinizi yönetin</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam E-Fatura</p>
              <p className="text-xl font-bold text-slate-900">{eInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Gönderilmeyi Bekleyen</p>
              <p className="text-xl font-bold text-slate-900">{pendingEInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bu Ay Gönderilen</p>
              <p className="text-xl font-bold text-slate-900">{eInvoices.filter(inv => dayjs(inv.invoiceDate).isSame(dayjs(), 'month')).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Reddedilen</p>
              <p className="text-xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Info Alert */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-900">E-Fatura Entegrasyonu</h3>
            <p className="text-sm text-slate-500 mt-1">
              E-Fatura gönderimi için GİB (Gelir İdaresi Başkanlığı) entegrasyonu gereklidir.
              Entegrasyon ayarlarını yapılandırmak için Ayarlar butonuna tıklayın.
            </p>
          </div>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Ayarlar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Fatura no, müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            options={[
              { value: 'Issued', label: 'Kesilmiş' },
              { value: 'Sent', label: 'Gönderilmiş' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
          />
          <RangePicker
            style={{ width: 240 }}
            format="DD/MM/YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            className="[&_.ant-picker]:!border-slate-200 [&_.ant-picker]:!rounded-lg"
          />
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            {selectedInvoices.length > 0 && (
              <button
                onClick={handleBulkSend}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Seçilenleri Gönder ({selectedInvoices.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          defaultActiveKey="all"
          className="[&_.ant-tabs-tab]:!text-slate-500 [&_.ant-tabs-tab-active]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
          items={[
            {
              key: 'all',
              label: 'Tüm Faturalar',
              children: (
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={invoices}
                  rowKey="id"
                  loading={isLoading}
                  className={tableClassName}
                  pagination={{
                    total: invoicesData?.totalCount,
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Toplam ${total} fatura`,
                  }}
                />
              ),
            },
            {
              key: 'pending',
              label: (
                <span className="flex items-center gap-2">
                  Gönderilecekler
                  {pendingEInvoices.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-slate-900 rounded-full">
                      {pendingEInvoices.length}
                    </span>
                  )}
                </span>
              ),
              children: (
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={pendingEInvoices}
                  rowKey="id"
                  loading={isLoading}
                  className={tableClassName}
                  pagination={{
                    pageSize: 20,
                    showTotal: (total) => `Toplam ${total} fatura`,
                  }}
                />
              ),
            },
            {
              key: 'sent',
              label: 'Gönderilenler',
              children: (
                <Table
                  columns={columns}
                  dataSource={eInvoices.filter(inv => inv.status === 'Sent')}
                  rowKey="id"
                  loading={isLoading}
                  className={tableClassName}
                  pagination={{
                    pageSize: 20,
                    showTotal: (total) => `Toplam ${total} fatura`,
                  }}
                />
              ),
            },
            {
              key: 'history',
              label: (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Gönderim Geçmişi
                </span>
              ),
              children: (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">E-Fatura gönderim geçmişi entegrasyon sonrası görüntülenecektir.</p>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Send E-Invoice Modal */}
      <Modal
        title={<span className="text-lg font-semibold text-slate-900">E-Fatura Gönder</span>}
        open={sendModalOpen}
        onCancel={() => setSendModalOpen(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setSendModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors mr-2"
          >
            Vazgeç
          </button>,
          <button
            key="submit"
            onClick={() => sendForm.submit()}
            disabled={setEInvoice.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors"
          >
            {setEInvoice.isPending ? 'Gönderiliyor...' : 'Gönder'}
          </button>,
        ]}
      >
        <Form form={sendForm} layout="vertical" onFinish={handleSendSubmit}>
          {currentInvoice && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Fatura No:</p>
                  <p className="text-sm font-medium text-slate-900">{currentInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Müşteri:</p>
                  <p className="text-sm font-medium text-slate-900">{currentInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tutar:</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.grandTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tarih:</p>
                  <p className="text-sm font-medium text-slate-900">{dayjs(currentInvoice.invoiceDate).format('DD/MM/YYYY')}</p>
                </div>
              </div>
            </div>
          )}

          <Form.Item
            name="eInvoiceId"
            label={<span className="text-sm font-medium text-slate-700">E-Fatura UUID</span>}
            rules={[{ required: true, message: 'E-Fatura UUID gereklidir' }]}
            extra={<span className="text-xs text-slate-500">GİB tarafından otomatik üretilecektir. Manuel giriş için boş bırakabilirsiniz.</span>}
          >
            <Input
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="!border-slate-200 !rounded-lg focus:!ring-slate-900"
            />
          </Form.Item>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Bilgi</p>
                <p className="text-xs text-slate-500">E-Fatura gönderildikten sonra iptal edilemez. Lütfen fatura bilgilerini kontrol ediniz.</p>
              </div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        title={<span className="text-lg font-semibold text-slate-900">E-Fatura Ayarları</span>}
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setSettingsModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors mr-2"
          >
            Kapat
          </button>,
          <button
            key="save"
            onClick={() => {
              message.info('Ayarlar kaydedildi');
              setSettingsModalOpen(false);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Kaydet
          </button>,
        ]}
        width={600}
      >
        <Form layout="vertical">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">GİB Entegrasyonu</p>
                <p className="text-xs text-slate-500">E-Fatura göndermek için GİB (Gelir İdaresi Başkanlığı) ile entegrasyon yapmanız gerekmektedir. Entegrasyon için bir e-fatura servis sağlayıcısı ile çalışmanız önerilir.</p>
              </div>
            </div>
          </div>

          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">E-Fatura Servis Sağlayıcısı</span>}
            extra={<span className="text-xs text-slate-500">Kullanılan e-fatura entegratörü</span>}
          >
            <Select
              placeholder="Servis sağlayıcı seçin"
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={[
                { value: 'foriba', label: 'Foriba' },
                { value: 'logo', label: 'Logo e-Fatura' },
                { value: 'kolaysoft', label: 'KolaySoft' },
                { value: 'efatura', label: 'E-Fatura.gov.tr' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">API Anahtarı</span>}
            extra={<span className="text-xs text-slate-500">Servis sağlayıcınızdan aldığınız API anahtarı</span>}
          >
            <Input.Password
              placeholder="API anahtarınızı giriniz"
              className="!border-slate-200 !rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">API Gizli Anahtarı</span>}
            extra={<span className="text-xs text-slate-500">Servis sağlayıcınızdan aldığınız gizli anahtar</span>}
          >
            <Input.Password
              placeholder="Gizli anahtarınızı giriniz"
              className="!border-slate-200 !rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Şirket VKN/TCKN</span>}
            extra={<span className="text-xs text-slate-500">Fatura kesecek şirketin vergi/TC kimlik numarası</span>}
          >
            <Input
              placeholder="Vergi kimlik numaranızı giriniz"
              className="!border-slate-200 !rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-medium text-slate-700">Test Modu</span>}
            extra={<span className="text-xs text-slate-500">Test modunda faturalar gerçekte gönderilmez</span>}
          >
            <Select
              defaultValue="test"
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={[
                { value: 'test', label: 'Test Modu (Aktif)' },
                { value: 'production', label: 'Üretim Modu' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
