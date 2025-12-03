'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  DatePicker,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useSalesOrders,
  useApproveSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
} from '@/lib/api/hooks/useSales';
import type { SalesOrderListItem, SalesOrderStatus, GetSalesOrdersParams } from '@/lib/api/services/sales.service';
import { SalesService } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { generateSalesOrderPDF } from '@/lib/utils/pdf-export';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColors: Record<SalesOrderStatus, string> = {
  Draft: 'default',
  Approved: 'processing',
  Confirmed: 'cyan',
  Shipped: 'blue',
  Delivered: 'geekblue',
  Completed: 'success',
  Cancelled: 'error',
};

const statusLabels: Record<SalesOrderStatus, string> = {
  Draft: 'Taslak',
  Approved: 'Onaylı',
  Confirmed: 'Onaylandı',
  Shipped: 'Gönderildi',
  Delivered: 'Teslim Edildi',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function SalesOrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetSalesOrdersParams>({
    page: 1,
    pageSize: 10,
  });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderListItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, isLoading, refetch } = useSalesOrders(filters);
  const approveMutation = useApproveSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Sipariş onaylandı');
    } catch {
      message.error('Sipariş onaylanamadı');
    }
  };

  const handleCancelClick = (order: SalesOrderListItem) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      message.error('İptal sebebi girilmelidir');
      return;
    }
    try {
      await cancelMutation.mutateAsync({ id: selectedOrder.id, reason: cancelReason });
      message.success('Sipariş iptal edildi');
      setCancelModalOpen(false);
      setSelectedOrder(null);
    } catch {
      message.error('Sipariş iptal edilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Siparişi Sil',
      content: 'Bu siparişi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('Sipariş silindi');
        } catch {
          message.error('Sipariş silinemedi');
        }
      },
    });
  };

  const orders = data?.items ?? [];

  // Bulk operations
  const handleBulkPdfExport = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Lütfen PDF oluşturmak için sipariş seçiniz');
      return;
    }
    setBulkLoading(true);
    try {
      for (const id of selectedRowKeys) {
        const order = await SalesService.getOrderById(id);
        await generateSalesOrderPDF(order);
      }
      message.success(`${selectedRowKeys.length} sipariş PDF olarak indirildi`);
    } catch (error) {
      message.error('PDF oluşturulurken hata oluştu');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    const draftOrders = selectedRowKeys.filter(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'Draft';
    });

    if (draftOrders.length === 0) {
      message.warning('Seçili siparişler arasında onaylanabilecek taslak sipariş bulunamadı');
      return;
    }

    Modal.confirm({
      title: 'Toplu Sipariş Onaylama',
      content: `${draftOrders.length} adet taslak sipariş onaylanacak. Devam etmek istiyor musunuz?`,
      okText: 'Onayla',
      cancelText: 'Vazgeç',
      onOk: async () => {
        setBulkLoading(true);
        let successCount = 0;
        try {
          for (const id of draftOrders) {
            try {
              await approveMutation.mutateAsync(id);
              successCount++;
            } catch {
              // Continue with others
            }
          }
          message.success(`${successCount} sipariş başarıyla onaylandı`);
          setSelectedRowKeys([]);
          refetch();
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    const deletableOrders = selectedRowKeys.filter(id => {
      const order = orders.find(o => o.id === id);
      return order?.status === 'Draft';
    });

    if (deletableOrders.length === 0) {
      message.warning('Seçili siparişler arasında silinebilecek sipariş bulunamadı (sadece taslak siparişler silinebilir)');
      return;
    }

    Modal.confirm({
      title: 'Toplu Sipariş Silme',
      content: `${deletableOrders.length} adet sipariş silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        setBulkLoading(true);
        let successCount = 0;
        try {
          for (const id of deletableOrders) {
            try {
              await deleteMutation.mutateAsync(id);
              successCount++;
            } catch {
              // Continue with others
            }
          }
          message.success(`${successCount} sipariş başarıyla silindi`);
          setSelectedRowKeys([]);
          refetch();
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  const getActionMenu = (record: SalesOrderListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/orders/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/orders/${record.id}/edit`),
        },
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record.id),
        }
      );
    }

    if (record.status !== 'Cancelled' && record.status !== 'Completed') {
      items.push({
        key: 'cancel',
        icon: <CloseOutlined />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancelClick(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<SalesOrderListItem> = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/orders/${record.id}`)}>{text}</a>
      ),
      sorter: true,
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tarih',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Teslim Tarihi',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (date: string | null) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount: number, record) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount),
      sorter: true,
      align: 'right',
    },
    {
      title: 'Satış Temsilcisi',
      dataIndex: 'salesPersonName',
      key: 'salesPersonName',
      render: (name: string | null) => name || '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesOrderStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Siparişler</Title>
          <Text type="secondary">Satış siparişlerini yönetin</Text>
        </div>
        <Space>
          {selectedRowKeys.length > 0 && (
            <>
              <span style={{ color: '#1890ff' }}>
                {selectedRowKeys.length} sipariş seçildi
              </span>
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleBulkPdfExport}
                loading={bulkLoading}
              >
                PDF İndir
              </Button>
              <Button
                icon={<CheckOutlined />}
                onClick={handleBulkApprove}
                loading={bulkLoading}
              >
                Onayla
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                loading={bulkLoading}
              >
                Sil
              </Button>
              <Button onClick={() => setSelectedRowKeys([])}>
                Seçimi Temizle
              </Button>
            </>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/sales/orders/new')}
          >
            Yeni Sipariş
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Ara..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              options={statusOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) =>
                setFilters((prev) => ({
                  ...prev,
                  fromDate: dates?.[0]?.toISOString(),
                  toDate: dates?.[1]?.toISOString(),
                  page: 1,
                }))
              }
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} sipariş`,
          }}
        />
      </Card>

      {/* Cancel Modal */}
      <Modal
        title="Siparişi İptal Et"
        open={cancelModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => setCancelModalOpen(false)}
        okText="İptal Et"
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={cancelMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            <strong>{selectedOrder?.orderNumber}</strong> numaralı siparişi iptal etmek üzeresiniz.
          </Text>
        </div>
        <Input.TextArea
          placeholder="İptal sebebini giriniz..."
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
