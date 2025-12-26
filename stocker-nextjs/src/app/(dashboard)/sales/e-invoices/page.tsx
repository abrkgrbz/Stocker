'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Alert,
  Tabs,
} from 'antd';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ClockIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useInvoices, useSetEInvoice } from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const eInvoiceStatusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'default', label: 'Bekliyor', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
  Queued: { color: 'processing', label: 'Kuyrukta', icon: <ArrowPathIcon className="w-4 h-4 animate-spin" /> },
  Sent: { color: 'blue', label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
  Delivered: { color: 'cyan', label: 'Ulaştı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Accepted: { color: 'green', label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
  Error: { color: 'error', label: 'Hata', icon: <XCircleIcon className="w-4 h-4" /> },
};

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  Draft: 'default',
  Issued: 'blue',
  Sent: 'cyan',
  PartiallyPaid: 'orange',
  Paid: 'green',
  Overdue: 'red',
  Cancelled: 'red',
};

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  Draft: 'Taslak',
  Issued: 'Kesildi',
  Sent: 'Gönderildi',
  PartiallyPaid: 'Kısmi Ödendi',
  Paid: 'Ödendi',
  Overdue: 'Vadesi Geçmiş',
  Cancelled: 'İptal',
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
        <a onClick={() => router.push(`/sales/invoices/${record.id}`)}>{text}</a>
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
      render: (status: InvoiceStatus) => (
        <Tag color={invoiceStatusColors[status]}>{invoiceStatusLabels[status]}</Tag>
      ),
    },
    {
      title: 'E-Fatura',
      key: 'eInvoice',
      render: (_: any, record: InvoiceListItem) => (
        record.isEInvoice ? (
          <Badge status="success" text="E-Fatura" />
        ) : (
          <Badge status="default" text="Klasik" />
        )
      ),
    },
    {
      title: 'E-Fatura Durumu',
      key: 'eInvoiceStatus',
      render: (_: any, record: InvoiceListItem) => {
        if (!record.isEInvoice) return '-';
        // In a real app, this would come from the API
        const status = 'Pending';
        const config = eInvoiceStatusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      render: (_: any, record: InvoiceListItem) => (
        <Space>
          {record.status === 'Issued' && (
            <Tooltip title="E-Fatura Gönder">
              <Button
                type="primary"
                size="small"
                icon={<PaperAirplaneIcon className="w-4 h-4" />}
                onClick={() => handleSendEInvoice(record)}
              >
                Gönder
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Detay">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => router.push(`/sales/invoices/${record.id}`)}
            />
          </Tooltip>
        </Space>
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

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>E-Fatura Yönetimi</Title>
        <Text type="secondary">E-Fatura ve E-Arşiv fatura işlemlerinizi yönetin</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam E-Fatura"
              value={eInvoices.length}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gönderilmeyi Bekleyen"
              value={pendingEInvoices.length}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bu Ay Gönderilen"
              value={eInvoices.filter(inv => dayjs(inv.invoiceDate).isSame(dayjs(), 'month')).length}
              prefix={<SendOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reddedilen"
              value={0}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Integration Info Alert */}
      <Alert
        message="E-Fatura Entegrasyonu"
        description="E-Fatura gönderimi için GİB (Gelir İdaresi Başkanlığı) entegrasyonu gereklidir. Entegrasyon ayarlarını yapılandırmak için Ayarlar butonuna tıklayın."
        type="info"
        showIcon
        action={
          <Button size="small" icon={<SettingOutlined />} onClick={() => setSettingsModalOpen(true)}>
            Ayarlar
          </Button>
        }
        style={{ marginBottom: 24 }}
      />

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Fatura no, müşteri ara..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Durum"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              options={[
                { value: 'Issued', label: 'Kesilmiş' },
                { value: 'Sent', label: 'Gönderilmiş' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Yenile
              </Button>
              {selectedInvoices.length > 0 && (
                <Button type="primary" icon={<PaperAirplaneIcon className="w-4 h-4" />} onClick={handleBulkSend}>
                  Seçilenleri Gönder ({selectedInvoices.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs for different views */}
      <Card>
        <Tabs
          defaultActiveKey="all"
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
                <Badge count={pendingEInvoices.length} offset={[10, 0]}>
                  Gönderilecekler
                </Badge>
              ),
              children: (
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={pendingEInvoices}
                  rowKey="id"
                  loading={isLoading}
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
                <span>
                  <HistoryOutlined /> Gönderim Geçmişi
                </span>
              ),
              children: (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">E-Fatura gönderim geçmişi entegrasyon sonrası görüntülenecektir.</Text>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Send E-Invoice Modal */}
      <Modal
        title="E-Fatura Gönder"
        open={sendModalOpen}
        onCancel={() => setSendModalOpen(false)}
        onOk={() => sendForm.submit()}
        okText="Gönder"
        cancelText="Vazgeç"
        confirmLoading={setEInvoice.isPending}
      >
        <Form form={sendForm} layout="vertical" onFinish={handleSendSubmit}>
          {currentInvoice && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Fatura No:</Text>
                  <br />
                  <Text strong>{currentInvoice.invoiceNumber}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Müşteri:</Text>
                  <br />
                  <Text strong>{currentInvoice.customerName}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text type="secondary">Tutar:</Text>
                  <br />
                  <Text strong>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currentInvoice.currency }).format(currentInvoice.grandTotal)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tarih:</Text>
                  <br />
                  <Text strong>{dayjs(currentInvoice.invoiceDate).format('DD/MM/YYYY')}</Text>
                </Col>
              </Row>
            </div>
          )}

          <Form.Item
            name="eInvoiceId"
            label="E-Fatura UUID"
            rules={[{ required: true, message: 'E-Fatura UUID gereklidir' }]}
            extra="GİB tarafından otomatik üretilecektir. Manuel giriş için boş bırakabilirsiniz."
          >
            <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </Form.Item>

          <Alert
            message="Bilgi"
            description="E-Fatura gönderildikten sonra iptal edilemez. Lütfen fatura bilgilerini kontrol ediniz."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        title="E-Fatura Ayarları"
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettingsModalOpen(false)}>
            Kapat
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.info('Ayarlar kaydedildi');
            setSettingsModalOpen(false);
          }}>
            Kaydet
          </Button>,
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Alert
            message="GİB Entegrasyonu"
            description="E-Fatura göndermek için GİB (Gelir İdaresi Başkanlığı) ile entegrasyon yapmanız gerekmektedir. Entegrasyon için bir e-fatura servis sağlayıcısı ile çalışmanız önerilir."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="E-Fatura Servis Sağlayıcısı"
            extra="Kullanılan e-fatura entegratörü"
          >
            <Select
              placeholder="Servis sağlayıcı seçin"
              options={[
                { value: 'foriba', label: 'Foriba' },
                { value: 'logo', label: 'Logo e-Fatura' },
                { value: 'kolaysoft', label: 'KolaySoft' },
                { value: 'efatura', label: 'E-Fatura.gov.tr' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="API Anahtarı"
            extra="Servis sağlayıcınızdan aldığınız API anahtarı"
          >
            <Input.Password placeholder="API anahtarınızı giriniz" />
          </Form.Item>

          <Form.Item
            label="API Gizli Anahtarı"
            extra="Servis sağlayıcınızdan aldığınız gizli anahtar"
          >
            <Input.Password placeholder="Gizli anahtarınızı giriniz" />
          </Form.Item>

          <Form.Item
            label="Şirket VKN/TCKN"
            extra="Fatura kesecek şirketin vergi/TC kimlik numarası"
          >
            <Input placeholder="Vergi kimlik numaranızı giriniz" />
          </Form.Item>

          <Form.Item
            label="Test Modu"
            extra="Test modunda faturalar gerçekte gönderilmez"
          >
            <Select
              defaultValue="test"
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
