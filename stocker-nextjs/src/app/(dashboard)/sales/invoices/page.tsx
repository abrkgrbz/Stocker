'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Typography,
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Select,
  DatePicker,
  Row,
  Col,
  Dropdown,
  Modal,
  message,
  Drawer,
  Form,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  FileTextOutlined,
  SendOutlined,
  DollarOutlined,
  MailOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  useInvoices,
  useDeleteInvoice,
  useIssueInvoice,
  useSendInvoice,
  useCancelInvoice,
  useCreateInvoice,
} from '@/lib/api/hooks/useInvoices';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import type { InvoiceListItem, InvoiceStatus, GetInvoicesParams, CreateInvoiceCommand, CreateInvoiceItemCommand } from '@/lib/api/services/invoice.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<InvoiceStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <FileTextOutlined /> },
  Issued: { color: 'blue', label: 'Kesildi', icon: <CheckCircleOutlined /> },
  Sent: { color: 'cyan', label: 'Gönderildi', icon: <SendOutlined /> },
  PartiallyPaid: { color: 'orange', label: 'Kısmi Ödendi', icon: <DollarOutlined /> },
  Paid: { color: 'green', label: 'Ödendi', icon: <CheckCircleOutlined /> },
  Overdue: { color: 'red', label: 'Vadesi Geçmiş', icon: <CloseCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal Edildi', icon: <CloseCircleOutlined /> },
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'Draft', label: 'Taslak' },
  { value: 'Issued', label: 'Kesildi' },
  { value: 'Sent', label: 'Gönderildi' },
  { value: 'PartiallyPaid', label: 'Kısmi Ödendi' },
  { value: 'Paid', label: 'Ödendi' },
  { value: 'Overdue', label: 'Vadesi Geçmiş' },
  { value: 'Cancelled', label: 'İptal Edildi' },
];

const typeOptions = [
  { value: '', label: 'Tüm Tipler' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Return', label: 'İade' },
  { value: 'Credit', label: 'Alacak' },
  { value: 'Debit', label: 'Borç' },
];

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  // Filter state
  const [filters, setFilters] = useState<GetInvoicesParams>({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    sortBy: 'InvoiceDate',
    sortDescending: true,
  });

  // Drawer state
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // API hooks
  const { data, isLoading, refetch } = useInvoices(filters);
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50
  });
  const deleteInvoice = useDeleteInvoice();
  const issueInvoice = useIssueInvoice();
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();
  const createInvoice = useCreateInvoice();

  const invoices = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Get customers list for select options
  const customerOptions = customersData?.items?.map((customer: Customer) => ({
    value: customer.id.toString(),
    label: customer.companyName || `${customer.contactPerson}`,
    customer: customer,
  })) || [];

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value, page: 1 }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        fromDate: dates[0]?.toISOString(),
        toDate: dates[1]?.toISOString(),
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        fromDate: undefined,
        toDate: undefined,
        page: 1,
      }));
    }
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field || 'InvoiceDate',
      sortDescending: sorter.order === 'descend',
    }));
  };

  const handleIssue = async (id: string) => {
    try {
      await issueInvoice.mutateAsync(id);
      message.success('Fatura kesildi');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Fatura kesme başarısız');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendInvoice.mutateAsync(id);
      message.success('Fatura gönderildi');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Gönderim başarısız');
    }
  };

  const handleCancel = async (id: string) => {
    Modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelInvoice.mutateAsync(id);
          message.success('Fatura iptal edildi');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'İptal işlemi başarısız');
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Faturayı Sil',
      content: 'Bu faturayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteInvoice.mutateAsync(id);
          message.success('Fatura silindi');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Silme işlemi başarısız');
        }
      },
    });
  };

  const openCreateDrawer = () => {
    form.resetFields();
    form.setFieldsValue({
      invoiceDate: dayjs(),
      dueDate: dayjs().add(30, 'day'),
      currency: 'TRY',
      type: 'Sales',
      items: [{ quantity: 1, vatRate: 18, unit: 'Adet' }],
    });
    setCreateDrawerOpen(true);
  };

  const handleCreateInvoice = async (values: any) => {
    try {
      // Find selected customer from options
      const selectedCustomer = customerOptions.find(
        (opt: { value: string; customer: Customer }) => opt.value === values.customerId
      )?.customer;

      const invoiceData: CreateInvoiceCommand = {
        invoiceDate: values.invoiceDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        customerId: selectedCustomer?.id?.toString() || undefined,
        customerName: selectedCustomer?.companyName || selectedCustomer?.contactPerson || values.customerName,
        customerEmail: selectedCustomer?.email || values.customerEmail,
        customerTaxNumber: selectedCustomer?.taxId || values.customerTaxNumber,
        customerAddress: selectedCustomer?.address || values.customerAddress,
        type: values.type || 'Sales',
        currency: values.currency || 'TRY',
        notes: values.notes,
        paymentTerms: selectedCustomer?.paymentTerms || values.paymentTerms,
        items: values.items.map((item: any) => ({
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
      await createInvoice.mutateAsync(invoiceData);
      message.success('Fatura oluşturuldu');
      setCreateDrawerOpen(false);
      form.resetFields();
    } catch {
      message.error('Fatura oluşturulamadı');
    }
  };

  const getActionItems = (record: InvoiceListItem) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/invoices/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/invoices/${record.id}/edit`),
        },
        {
          key: 'issue',
          icon: <CheckCircleOutlined />,
          label: 'Kes',
          onClick: () => handleIssue(record.id),
        },
        {
          type: 'divider',
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

    if (record.status === 'Issued') {
      items.push({
        key: 'send',
        icon: <MailOutlined />,
        label: 'Gönder',
        onClick: () => handleSend(record.id),
      });
    }

    if (record.status !== 'Cancelled' && record.status !== 'Paid' && record.status !== 'Draft') {
      items.push({
        key: 'cancel',
        icon: <CloseCircleOutlined />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancel(record.id),
      });
    }

    if (record.status === 'Cancelled') {
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record.id),
      });
    }

    return items;
  };

  const columns: ColumnsType<InvoiceListItem> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      sorter: true,
      render: (text, record) => (
        <Link href={`/sales/invoices/${record.id}`} className="font-medium text-blue-600 hover:text-blue-800">
          {text}
        </Link>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: true,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: InvoiceStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Toplam',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      sorter: true,
      align: 'right',
      render: (total, record) => (
        <span className="font-semibold">
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Ödenen',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-green-600">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Kalan',
      dataIndex: 'balanceDue',
      key: 'balanceDue',
      align: 'right',
      render: (balance, record) => (
        <span className={balance > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
          {balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'E-Fatura',
      dataIndex: 'isEInvoice',
      key: 'isEInvoice',
      align: 'center',
      render: (isEInvoice) => (
        isEInvoice ? <Tag color="blue">E-Fatura</Tag> : <Tag>Normal</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <FileTextOutlined className="text-3xl text-green-500" />
          <Title level={2} className="!mb-0">
            Faturalar
          </Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
            Yeni Fatura
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input
              placeholder="Fatura ara..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Durum seçin"
              options={statusOptions}
              value={filters.status}
              onChange={handleStatusChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Tip seçin"
              options={typeOptions}
              value={filters.type}
              onChange={handleTypeChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} fatura`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Invoice Drawer */}
      <Drawer
        title="Yeni Fatura Oluştur"
        width={720}
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setCreateDrawerOpen(false)}>İptal</Button>
            <Button type="primary" onClick={() => form.submit()} loading={createInvoice.isPending}>
              Oluştur
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateInvoice}
          initialValues={{
            invoiceDate: dayjs(),
            dueDate: dayjs().add(30, 'day'),
            currency: 'TRY',
            type: 'Sales',
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
                        customerTaxNumber: customer.taxId,
                        customerAddress: customer.address,
                        paymentTerms: customer.paymentTerms,
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
              <Form.Item name="customerTaxNumber" label="Vergi No">
                <Input placeholder="Vergi numarası" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Fatura Tipi">
                <Select>
                  <Select.Option value="Sales">Satış</Select.Option>
                  <Select.Option value="Return">İade</Select.Option>
                  <Select.Option value="Credit">Alacak</Select.Option>
                  <Select.Option value="Debit">Borç</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="invoiceDate"
                label="Fatura Tarihi"
                rules={[{ required: true, message: 'Fatura tarihi zorunludur' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dueDate"
                label="Vade Tarihi"
                rules={[{ required: true, message: 'Vade tarihi zorunludur' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
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
            <Col span={24}>
              <Form.Item name="customerAddress" label="Müşteri Adresi">
                <Input.TextArea rows={2} placeholder="Müşteri adresi" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentTerms" label="Ödeme Koşulları">
                <Input placeholder="Ödeme koşulları" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="notes" label="Notlar">
                <Input.TextArea rows={2} placeholder="Fatura notları" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Fatura Kalemleri</Divider>

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
