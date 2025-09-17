import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Table,
  Space,
  Row,
  Col,
  InputNumber,
  Divider,
  message,
  AutoComplete,
  Typography,
  Alert,
  Statistic,
  Modal,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  CalculatorOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import invoiceService, { CreateInvoiceDto, CreateInvoiceItemDto } from '@/services/invoiceService';
import './style.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// Mock müşteri verisi
const mockCustomers = [
  { id: '1', name: 'ABC Teknoloji A.Ş.', email: 'info@abc.com', phone: '0212 555 0001', taxNumber: '1234567890' },
  { id: '2', name: 'XYZ Yazılım Ltd.', email: 'contact@xyz.com', phone: '0216 555 0002', taxNumber: '0987654321' },
  { id: '3', name: 'Demo Şirketi', email: 'demo@demo.com', phone: '0312 555 0003', taxNumber: '1122334455' }
];

// Mock ürün verisi
const mockProducts = [
  { id: '1', name: 'Yazılım Lisansı', price: 5000, description: 'Yıllık yazılım lisansı' },
  { id: '2', name: 'Danışmanlık Hizmeti', price: 1500, description: 'Saatlik danışmanlık ücreti' },
  { id: '3', name: 'Eğitim Paketi', price: 10000, description: '3 günlük eğitim paketi' },
  { id: '4', name: 'Destek Hizmeti', price: 2000, description: 'Aylık teknik destek' }
];

const CreateInvoice: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CreateInvoiceItemDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [totals, setTotals] = useState({
    subTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0
  });
  const [showProductModal, setShowProductModal] = useState(false);

  const calculateTotals = (invoiceItems: CreateInvoiceItemDto[]) => {
    let subTotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    invoiceItems.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * ((item.discountPercentage || 0) / 100);
      const itemAfterDiscount = itemTotal - itemDiscount;
      const itemTax = itemAfterDiscount * ((item.taxRate || 0) / 100);

      subTotal += itemTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });

    const totalAmount = subTotal - discountAmount + taxAmount;

    setTotals({
      subTotal,
      taxAmount,
      discountAmount,
      totalAmount
    });
  };

  const handleAddItem = () => {
    setShowProductModal(true);
  };

  const handleProductSelect = (product: any) => {
    const newItem: CreateInvoiceItemDto = {
      productId: product.id,
      productName: product.name,
      description: product.description,
      quantity: 1,
      unitPrice: product.price,
      discountPercentage: 0,
      taxRate: 18 // Default KDV
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    calculateTotals(updatedItems);
    setShowProductModal(false);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.warning('En az bir ürün/hizmet eklemelisiniz');
      return;
    }

    try {
      setLoading(true);
      const invoiceData: CreateInvoiceDto = {
        ...values,
        invoiceDate: values.invoiceDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
        items
      };

      const result = await invoiceService.createInvoice(invoiceData);
      message.success('Fatura başarıyla oluşturuldu');
      
      if (values.sendImmediately) {
        await invoiceService.sendInvoice(result.id);
        message.success('Fatura müşteriye gönderildi');
      }

      navigate('/invoices');
    } catch (error) {
      message.error('Fatura oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ürün/Hizmet',
      dataIndex: 'productName',
      key: 'productName',
      width: '25%'
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      render: (_: any, record: any, index: number) => (
        <Input
          value={record.description}
          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
          placeholder="Açıklama..."
        />
      )
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (_: any, record: any, index: number) => (
        <InputNumber
          min={0.01}
          value={record.quantity}
          onChange={(value) => handleItemChange(index, 'quantity', value)}
        />
      )
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '12%',
      render: (_: any, record: any, index: number) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          onChange={(value) => handleItemChange(index, 'unitPrice', value)}
          formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      )
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: '10%',
      render: (_: any, record: any, index: number) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountPercentage}
          onChange={(value) => handleItemChange(index, 'discountPercentage', value)}
          formatter={(value) => `${value}%`}
        />
      )
    },
    {
      title: 'KDV %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: '10%',
      render: (_: any, record: any, index: number) => (
        <Select
          value={record.taxRate}
          onChange={(value) => handleItemChange(index, 'taxRate', value)}
          style={{ width: '100%' }}
        >
          <Option value={0}>%0</Option>
          <Option value={1}>%1</Option>
          <Option value={8}>%8</Option>
          <Option value={18}>%18</Option>
        </Select>
      )
    },
    {
      title: 'Toplam',
      key: 'total',
      width: '10%',
      align: 'right' as const,
      render: (_: any, record: any) => {
        const total = record.quantity * record.unitPrice;
        const discount = total * ((record.discountPercentage || 0) / 100);
        const afterDiscount = total - discount;
        const tax = afterDiscount * ((record.taxRate || 0) / 100);
        return <Text strong>₺{(afterDiscount + tax).toFixed(2)}</Text>;
      }
    },
    {
      title: '',
      key: 'action',
      width: '3%',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        />
      )
    }
  ];

  return (
    <div className="create-invoice">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'TRY',
          invoiceDate: dayjs(),
          dueDate: dayjs().add(30, 'days'),
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        }}
      >
        <Row gutter={24}>
          {/* Sol Panel - Fatura Bilgileri */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Yeni Fatura Oluştur</span>
                </Space>
              }
              className="invoice-form-card"
            >
              {/* Fatura Temel Bilgileri */}
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="invoiceNumber"
                    label="Fatura No"
                    rules={[{ required: true, message: 'Fatura no zorunludur' }]}
                  >
                    <Input prefix={<FileTextOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="invoiceDate"
                    label="Fatura Tarihi"
                    rules={[{ required: true, message: 'Fatura tarihi zorunludur' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="dueDate"
                    label="Vade Tarihi"
                    rules={[{ required: true, message: 'Vade tarihi zorunludur' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Müşteri Seçimi */}
              <Divider>Müşteri Bilgileri</Divider>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="customerId"
                    label="Müşteri"
                    rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Müşteri seçin veya arayın"
                      optionFilterProp="children"
                      onChange={(value) => {
                        const customer = mockCustomers.find(c => c.id === value);
                        setSelectedCustomer(customer);
                      }}
                    >
                      {mockCustomers.map(customer => (
                        <Option key={customer.id} value={customer.id}>
                          <Space>
                            <Avatar icon={<UserOutlined />} size="small" />
                            <div>
                              <div>{customer.name}</div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {customer.email} | {customer.phone}
                              </Text>
                            </div>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {selectedCustomer && (
                <Alert
                  message="Seçili Müşteri"
                  description={
                    <Space direction="vertical" size="small">
                      <Text>{selectedCustomer.name}</Text>
                      <Text type="secondary">{selectedCustomer.email} | {selectedCustomer.phone}</Text>
                      <Text type="secondary">Vergi No: {selectedCustomer.taxNumber}</Text>
                    </Space>
                  }
                  type="info"
                  showIcon
                  icon={<UserOutlined />}
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Ürün/Hizmetler */}
              <Divider>Ürün/Hizmetler</Divider>
              <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ width: '100%', marginBottom: 16 }}
              >
                Ürün/Hizmet Ekle
              </Button>

              <Table
                dataSource={items}
                columns={columns}
                pagination={false}
                rowKey={(_, index) => index?.toString() || '0'}
                locale={{ emptyText: 'Henüz ürün/hizmet eklenmedi' }}
              />

              {/* Notlar */}
              <Divider>Ek Bilgiler</Divider>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="notes" label="Notlar">
                    <TextArea rows={4} placeholder="Fatura ile ilgili notlar..." />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="terms" label="Şartlar ve Koşullar">
                    <TextArea rows={4} placeholder="Ödeme şartları, teslimat koşulları vb..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Sağ Panel - Özet ve İşlemler */}
          <Col xs={24} lg={8}>
            <Card className="invoice-summary-card">
              <Title level={4}>
                <CalculatorOutlined /> Fatura Özeti
              </Title>
              
              <div className="summary-items">
                <div className="summary-item">
                  <Text>Ara Toplam:</Text>
                  <Text strong>{invoiceService.formatCurrency(totals.subTotal)}</Text>
                </div>
                <div className="summary-item">
                  <Text>İndirim:</Text>
                  <Text type="danger">-{invoiceService.formatCurrency(totals.discountAmount)}</Text>
                </div>
                <div className="summary-item">
                  <Text>KDV:</Text>
                  <Text>{invoiceService.formatCurrency(totals.taxAmount)}</Text>
                </div>
                <Divider />
                <div className="summary-item total">
                  <Title level={5}>Genel Toplam:</Title>
                  <Title level={4} type="success">
                    {invoiceService.formatCurrency(totals.totalAmount)}
                  </Title>
                </div>
              </div>

              <Divider />

              <Form.Item name="currency" label="Para Birimi">
                <Select>
                  <Option value="TRY">TRY - Türk Lirası</Option>
                  <Option value="USD">USD - Amerikan Doları</Option>
                  <Option value="EUR">EUR - Euro</Option>
                </Select>
              </Form.Item>

              <Form.Item name="sendImmediately" valuePropName="checked">
                <Space>
                  <input type="checkbox" />
                  <Text>Oluşturduktan sonra hemen gönder</Text>
                </Space>
              </Form.Item>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  block
                >
                  Faturayı Oluştur
                </Button>
                <Button
                  onClick={() => navigate('/invoices')}
                  size="large"
                  block
                >
                  İptal
                </Button>
              </Space>
            </Card>

            {/* Hızlı İstatistikler */}
            <Card style={{ marginTop: 16 }}>
              <Title level={5}>Bu Ay</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Kesilen Fatura"
                    value={23}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Toplam Tutar"
                    value={125430}
                    prefix="₺"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Ürün Seçme Modal */}
      <Modal
        title="Ürün/Hizmet Seç"
        visible={showProductModal}
        onCancel={() => setShowProductModal(false)}
        footer={null}
        width={600}
      >
        <div className="product-grid">
          {mockProducts.map(product => (
            <Card
              key={product.id}
              hoverable
              onClick={() => handleProductSelect(product)}
              className="product-card"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <ShoppingCartOutlined />
                  <Text strong>{product.name}</Text>
                </Space>
                <Text type="secondary">{product.description}</Text>
                <Text type="success" strong>
                  {invoiceService.formatCurrency(product.price)}
                </Text>
              </Space>
            </Card>
          ))}
        </div>
        <Divider />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          block
          onClick={() => {
            message.info('Yeni ürün ekleme özelliği yakında');
            setShowProductModal(false);
          }}
        >
          Yeni Ürün Ekle
        </Button>
      </Modal>
    </div>
  );
};

export default CreateInvoice;