'use client';

import React, { useState, useEffect } from 'react';
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
  Drawer,
  Form,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useSalesOrders,
  useApproveSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
  useCreateSalesOrder,
} from '@/lib/api/hooks/useSales';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import type { SalesOrderListItem, SalesOrderStatus, GetSalesOrdersParams, CreateSalesOrderCommand, CreateSalesOrderItemCommand } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

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
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<GetSalesOrdersParams>({
    page: 1,
    pageSize: 10,
  });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderListItem | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const { data, isLoading, refetch } = useSalesOrders(filters);
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50
  });
  const approveMutation = useApproveSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();
  const createMutation = useCreateSalesOrder();

  // Get customers list for select options
  const customerOptions = customersData?.items?.map((customer: Customer) => ({
    value: customer.id.toString(),
    label: customer.companyName || `${customer.contactPerson}`,
    customer: customer,
  })) || [];

  // Handle query param to open drawer
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateDrawer();
      // Clear the query param
      router.replace('/sales/orders');
    }
  }, [searchParams]);

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

  const handleCreateOrder = async (values: any) => {
    try {
      // Find selected customer from options
      const selectedCustomer = customerOptions.find(
        (opt: { value: string; customer: Customer }) => opt.value === values.customerId
      )?.customer;

      const orderData: CreateSalesOrderCommand = {
        orderDate: values.orderDate.toISOString(),
        customerId: selectedCustomer?.id?.toString() || undefined,
        customerName: selectedCustomer?.companyName || selectedCustomer?.contactPerson || values.customerName,
        customerEmail: selectedCustomer?.email || values.customerEmail,
        currency: values.currency || 'TRY',
        shippingAddress: values.shippingAddress || selectedCustomer?.address,
        billingAddress: values.billingAddress || selectedCustomer?.address,
        notes: values.notes,
        salesPersonName: values.salesPersonName,
        items: values.items.map((item: any, index: number) => ({
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit || 'Adet',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate || 18,
          description: item.description,
          discountRate: item.discountRate || 0,
        })),
      };
      await createMutation.mutateAsync(orderData);
      message.success('Sipariş oluşturuldu');
      setCreateDrawerOpen(false);
      form.resetFields();
    } catch {
      message.error('Sipariş oluşturulamadı');
    }
  };

  const openCreateDrawer = () => {
    form.resetFields();
    form.setFieldsValue({
      orderDate: dayjs(),
      currency: 'TRY',
      items: [{ quantity: 1, vatRate: 18, unit: 'Adet' }],
    });
    setCreateDrawerOpen(true);
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
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateDrawer}
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
          columns={columns}
          dataSource={data?.items ?? []}
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

      {/* Create Order Drawer */}
      <Drawer
        title="Yeni Sipariş Oluştur"
        width={720}
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setCreateDrawerOpen(false)}>İptal</Button>
            <Button type="primary" onClick={() => form.submit()} loading={createMutation.isPending}>
              Oluştur
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrder}
          initialValues={{
            orderDate: dayjs(),
            currency: 'TRY',
            items: [{ quantity: 1, vatRate: 18, unit: 'Adet' }],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Select
                  showSearch
                  placeholder="Müşteri seçiniz"
                  loading={customersLoading}
                  filterOption={false}
                  onSearch={(value) => setCustomerSearch(value)}
                  options={customerOptions}
                  onChange={(value) => {
                    const customer = customerOptions.find(
                      (opt: { value: string; customer: Customer }) => opt.value === value
                    )?.customer;
                    if (customer) {
                      form.setFieldsValue({
                        customerEmail: customer.email,
                        shippingAddress: customer.address,
                        billingAddress: customer.address,
                      });
                    }
                  }}
                  notFoundContent={customersLoading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerEmail" label="Müşteri E-posta">
                <Input placeholder="E-posta adresi" type="email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="Sipariş Tarihi"
                rules={[{ required: true, message: 'Sipariş tarihi zorunludur' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="Para Birimi">
                <Select>
                  <Select.Option value="TRY">TRY - Türk Lirası</Select.Option>
                  <Select.Option value="USD">USD - Amerikan Doları</Select.Option>
                  <Select.Option value="EUR">EUR - Euro</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salesPersonName" label="Satış Temsilcisi">
                <Input placeholder="Satış temsilcisi adı" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippingAddress" label="Teslimat Adresi">
                <Input.TextArea rows={2} placeholder="Teslimat adresi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="billingAddress" label="Fatura Adresi">
                <Input.TextArea rows={2} placeholder="Fatura adresi" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={2} placeholder="Sipariş notları" />
          </Form.Item>

          <Divider>Sipariş Kalemleri</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16 }}
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        />
                      )
                    }
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'productCode']}
                          label="Ürün Kodu"
                          rules={[{ required: true, message: 'Zorunlu' }]}
                        >
                          <Input placeholder="Ürün kodu" />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[name, 'productName']}
                          label="Ürün Adı"
                          rules={[{ required: true, message: 'Zorunlu' }]}
                        >
                          <Input placeholder="Ürün adı" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          label="Miktar"
                          rules={[{ required: true, message: 'Zorunlu' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...restField} name={[name, 'unit']} label="Birim">
                          <Select>
                            <Select.Option value="Adet">Adet</Select.Option>
                            <Select.Option value="Kg">Kg</Select.Option>
                            <Select.Option value="Lt">Lt</Select.Option>
                            <Select.Option value="M">M</Select.Option>
                            <Select.Option value="M2">M2</Select.Option>
                            <Select.Option value="Paket">Paket</Select.Option>
                            <Select.Option value="Kutu">Kutu</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'unitPrice']}
                          label="Birim Fiyat"
                          rules={[{ required: true, message: 'Zorunlu' }]}
                        >
                          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...restField} name={[name, 'vatRate']} label="KDV %">
                          <Select>
                            <Select.Option value={0}>%0</Select.Option>
                            <Select.Option value={1}>%1</Select.Option>
                            <Select.Option value={8}>%8</Select.Option>
                            <Select.Option value={10}>%10</Select.Option>
                            <Select.Option value={18}>%18</Select.Option>
                            <Select.Option value={20}>%20</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'discountRate']} label="İndirim %">
                          <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'description']} label="Açıklama">
                          <Input placeholder="Kalem açıklaması" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add({ quantity: 1, vatRate: 18, unit: 'Adet' })} block icon={<PlusOutlined />}>
                    Kalem Ekle
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </div>
  );
}
