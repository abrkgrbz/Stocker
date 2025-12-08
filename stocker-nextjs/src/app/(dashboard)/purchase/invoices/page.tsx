'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Input,
  Tag,
  Dropdown,
  Card,
  Typography,
  Tooltip,
  Modal,
  Select,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  ExportOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableProps } from 'antd';
import type { MenuProps } from 'antd';
import {
  usePurchaseInvoices,
  useDeletePurchaseInvoice,
  useApprovePurchaseInvoice,
  useRejectPurchaseInvoice,
  useMarkInvoiceAsPaid,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseInvoiceListDto, PurchaseInvoiceStatus } from '@/lib/api/services/purchase.types';
import { exportToCSV, exportToExcel, type ExportColumn, formatDateForExport, formatCurrencyForExport } from '@/lib/utils/export';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<PurchaseInvoiceStatus, string> = {
  Draft: 'default',
  PendingApproval: 'orange',
  Approved: 'purple',
  Rejected: 'red',
  PartiallyPaid: 'geekblue',
  Paid: 'green',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseInvoiceStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  PartiallyPaid: 'Kısmen Ödendi',
  Paid: 'Ödendi',
  Cancelled: 'İptal',
};

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseInvoiceStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data: invoicesData, isLoading, refetch } = usePurchaseInvoices({
    searchTerm: searchText || undefined,
    status: statusFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteInvoice = useDeletePurchaseInvoice();
  const approveInvoice = useApprovePurchaseInvoice();
  const rejectInvoice = useRejectPurchaseInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();

  const invoices = invoicesData?.items || [];
  const totalCount = invoicesData?.totalCount || 0;

  const handleDelete = (record: PurchaseInvoiceListDto) => {
    confirm({
      title: 'Faturayı Sil',
      content: `"${record.invoiceNumber}" faturasını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteInvoice.mutate(record.id),
    });
  };

  // Bulk Actions
  const selectedInvoices = invoices.filter(i => selectedRowKeys.includes(i.id));

  const handleBulkApprove = async () => {
    const pendingInvoices = selectedInvoices.filter(i => i.status === 'PendingApproval');
    if (pendingInvoices.length === 0) {
      message.warning('Seçili faturalar arasında onay bekleyen fatura yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(pendingInvoices.map(i => approveInvoice.mutateAsync({ id: i.id })));
      message.success(`${pendingInvoices.length} fatura onaylandı`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      message.error('Bazı faturalar onaylanamadı');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = () => {
    const pendingInvoices = selectedInvoices.filter(i => i.status === 'PendingApproval');
    if (pendingInvoices.length === 0) {
      message.warning('Seçili faturalar arasında onay bekleyen fatura yok');
      return;
    }
    Modal.confirm({
      title: 'Toplu Reddet',
      content: `${pendingInvoices.length} faturayı reddetmek istediğinizden emin misiniz?`,
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        setBulkLoading(true);
        try {
          await Promise.all(pendingInvoices.map(i => rejectInvoice.mutateAsync({ id: i.id, reason: 'Bulk rejection' })));
          message.success(`${pendingInvoices.length} fatura reddedildi`);
          setSelectedRowKeys([]);
          refetch();
        } catch {
          message.error('Bazı faturalar reddedilemedi');
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleBulkMarkPaid = async () => {
    const approvedInvoices = selectedInvoices.filter(i => i.status === 'Approved' || i.status === 'PartiallyPaid');
    if (approvedInvoices.length === 0) {
      message.warning('Seçili faturalar arasında ödendi işaretlenecek fatura yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(approvedInvoices.map(i => markAsPaid.mutateAsync({ id: i.id })));
      message.success(`${approvedInvoices.length} fatura ödendi olarak işaretlendi`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      message.error('Bazı faturalar güncellenemedi');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = () => {
    const draftInvoices = selectedInvoices.filter(i => i.status === 'Draft');
    if (draftInvoices.length === 0) {
      message.warning('Sadece taslak faturalar silinebilir');
      return;
    }
    Modal.confirm({
      title: 'Toplu Sil',
      content: `${draftInvoices.length} faturayı silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        setBulkLoading(true);
        try {
          await Promise.all(draftInvoices.map(i => deleteInvoice.mutateAsync(i.id)));
          message.success(`${draftInvoices.length} fatura silindi`);
          setSelectedRowKeys([]);
          refetch();
        } catch {
          message.error('Bazı faturalar silinemedi');
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  // Export Functions
  const exportColumns: ExportColumn<PurchaseInvoiceListDto>[] = [
    { key: 'invoiceNumber', title: 'Fatura No' },
    { key: 'invoiceDate', title: 'Fatura Tarihi', render: (v) => formatDateForExport(v) },
    { key: 'supplierName', title: 'Tedarikçi' },
    { key: 'status', title: 'Durum', render: (v) => statusLabels[v as PurchaseInvoiceStatus] || v },
    { key: 'totalAmount', title: 'Toplam Tutar', render: (v, r) => formatCurrencyForExport(v, r.currency) },
    { key: 'paidAmount', title: 'Ödenen', render: (v) => formatCurrencyForExport(v, 'TRY') },
    { key: 'remainingAmount', title: 'Kalan', render: (v) => formatCurrencyForExport(v, 'TRY') },
    { key: 'dueDate', title: 'Vade Tarihi', render: (v) => formatDateForExport(v) },
  ];

  const handleExportCSV = () => {
    const dataToExport = selectedRowKeys.length > 0 ? selectedInvoices : invoices;
    exportToCSV(dataToExport, exportColumns, `satin-alma-faturalari-${dayjs().format('YYYY-MM-DD')}`);
    message.success('CSV dosyası indirildi');
  };

  const handleExportExcel = async () => {
    const dataToExport = selectedRowKeys.length > 0 ? selectedInvoices : invoices;
    await exportToExcel(dataToExport, exportColumns, `satin-alma-faturalari-${dayjs().format('YYYY-MM-DD')}`, 'Faturalar');
    message.success('Excel dosyası indirildi');
  };

  // Row Selection
  const rowSelection: TableProps<PurchaseInvoiceListDto>['rowSelection'] = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  const columns: ColumnsType<PurchaseInvoiceListDto> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-blue-600">{num}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.invoiceDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PurchaseInvoiceStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <Text strong>{(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency || '₺'}</Text>
      ),
    },
    {
      title: 'Ödenen',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className="text-green-600">{(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
      ),
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span className={amount > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}>
          {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </span>
      ),
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day');
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {dayjs(date).format('DD.MM.YYYY')}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/purchase/invoices/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
              },
              { type: 'divider' },
              record.status === 'PendingApproval' && {
                key: 'approve',
                icon: <CheckCircleOutlined />,
                label: 'Onayla',
                onClick: () => approveInvoice.mutate({ id: record.id }),
              },
              record.status === 'Approved' && {
                key: 'pay',
                icon: <DollarOutlined />,
                label: 'Ödendi İşaretle',
                onClick: () => markAsPaid.mutate({ id: record.id }),
              },
              { type: 'divider' },
              record.status === 'Draft' && {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ].filter(Boolean) as MenuProps['items'],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} className="!mb-1 flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            Satın Alma Faturaları
          </Title>
          <Text type="secondary">Tedarikçi faturalarını yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/invoices/new')}
        >
          Yeni Fatura
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4" size="small">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Fatura ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            format="DD.MM.YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <div className="flex-1" />
          <Tooltip title="Yenile">
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'csv', icon: <ExportOutlined />, label: 'CSV İndir', onClick: handleExportCSV },
                { key: 'excel', icon: <FileExcelOutlined />, label: 'Excel İndir', onClick: handleExportExcel },
              ],
            }}
          >
            <Button icon={<ExportOutlined />}>
              Dışa Aktar {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </Button>
          </Dropdown>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRowKeys.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedRowKeys.length} fatura seçildi
            </span>
            <Space>
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={handleBulkApprove}
                loading={bulkLoading}
              >
                Toplu Onayla
              </Button>
              <Button
                size="small"
                icon={<DollarOutlined />}
                onClick={handleBulkMarkPaid}
                loading={bulkLoading}
              >
                Toplu Ödendi İşaretle
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleBulkReject}
                loading={bulkLoading}
              >
                Toplu Reddet
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                loading={bulkLoading}
              >
                Toplu Sil
              </Button>
              <Button
                size="small"
                type="link"
                onClick={() => setSelectedRowKeys([])}
              >
                Seçimi Temizle
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={isLoading || bulkLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} fatura`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/invoices/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
