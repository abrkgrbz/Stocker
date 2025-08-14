import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHeader,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProFormList,
} from '@ant-design/pro-components';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Typography,
  Divider,
  message,
  Modal,
  AutoComplete,
  Tag,
  Alert,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CalculatorOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { formatCurrency } from '@/shared/utils/formatters';
import invoiceService, { Invoice, InvoiceItem } from '@/services/invoiceService';
import dayjs from 'dayjs';
import './style.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerTaxNumber?: string;
  customerTaxOffice?: string;
  invoiceDate: dayjs.Dayjs;
  dueDate: dayjs.Dayjs;
  paymentMethod: string;
  notes?: string;
  items: InvoiceItem[];
}

export const InvoiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [totals, setTotals] = useState({
    subTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (id) {
      fetchInvoice();
    } else {
      // Yeni fatura için default değerler
      const defaultItems = [{
        id: '1',
        productId: '',
        productName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 18,
        discountRate: 0,
        totalPrice: 0,
      }];
      setItems(defaultItems);
      form.setFieldsValue({
        invoiceDate: dayjs(),
        dueDate: dayjs().add(30, 'days'),
        paymentMethod: 'BankTransfer',
        items: defaultItems,
      });
    }
    fetchCustomers();
    fetchProducts();
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      // Gerçek API çağrısı
      // const response = await invoiceService.getInvoiceById(id!);
      // const invoice = response.data;
      
      // Mock data
      const invoice: Invoice = {
        id: id!,
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'ABC Teknoloji A.Ş.',
        customerEmail: 'muhasebe@abcteknoloji.com',
        customerPhone: '+90 212 555 0100',
        customerAddress: 'Maslak Mah. Teknoloji Cad. No:15\nSarıyer/İstanbul',
        customerTaxNumber: '1234567890',
        customerTaxOffice: 'Sarıyer',
        invoiceDate: '2024-01-15T00:00:00',
        dueDate: '2024-02-15T00:00:00',
        subTotal: 10000,
        taxAmount: 1800,
        discountAmount: 500,
        totalAmount: 11300,
        currency: 'TRY',
        status: 'Draft',
        paymentMethod: 'BankTransfer',
        notes: 'Ödeme IBAN: TR12 0001 2345 6789 0123 4567 89',
        items: [
          {
            id: '1',
            productId: '1',
            productName: 'Yazılım Lisansı - Pro',
            description: 'Yıllık yazılım lisansı',
            quantity: 2,
            unitPrice: 3000,
            taxRate: 18,
            discountRate: 5,
            totalPrice: 5700,
          },
          {
            id: '2',
            productId: '2',
            productName: 'Destek Paketi',
            description: '7/24 teknik destek hizmeti',
            quantity: 1,
            unitPrice: 4000,
            taxRate: 18,
            discountRate: 0,
            totalPrice: 4720,
          },
        ],
        createdAt: '2024-01-15T10:30:00',
      };

      // Form'a verileri set et
      form.setFieldsValue({
        ...invoice,
        invoiceDate: dayjs(invoice.invoiceDate),
        dueDate: dayjs(invoice.dueDate),
      });
      setItems(invoice.items);
    } catch (error) {
      message.error('Fatura yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    // Mock müşteri listesi
    const mockCustomers = [
      {
        id: '1',
        name: 'ABC Teknoloji A.Ş.',
        email: 'muhasebe@abcteknoloji.com',
        phone: '+90 212 555 0100',
        address: 'Maslak Mah. Teknoloji Cad. No:15\nSarıyer/İstanbul',
        taxNumber: '1234567890',
        taxOffice: 'Sarıyer',
      },
      {
        id: '2',
        name: 'XYZ Yazılım Ltd.',
        email: 'info@xyzyazilim.com',
        phone: '+90 216 555 0200',
        address: 'Ataşehir/İstanbul',
        taxNumber: '9876543210',
        taxOffice: 'Ataşehir',
      },
    ];
    setCustomers(mockCustomers);
  };

  const fetchProducts = async () => {
    // Mock ürün listesi
    const mockProducts = [
      {
        id: '1',
        name: 'Yazılım Lisansı - Pro',
        description: 'Yıllık yazılım lisansı',
        price: 3000,
        taxRate: 18,
      },
      {
        id: '2',
        name: 'Destek Paketi',
        description: '7/24 teknik destek hizmeti',
        price: 4000,
        taxRate: 18,
      },
      {
        id: '3',
        name: 'Eğitim Hizmeti',
        description: 'Uzaktan eğitim (10 saat)',
        price: 5000,
        taxRate: 18,
      },
    ];
    setProducts(mockProducts);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      form.setFieldsValue({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerTaxNumber: customer.taxNumber,
        customerTaxOffice: customer.taxOffice,
      });
    }
  };

  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productName: product.name,
        description: product.description,
        unitPrice: product.price,
        taxRate: product.taxRate,
      };
      setItems(newItems);
      calculateItemTotal(index, newItems[index]);
    }
  };

  const calculateItemTotal = (index: number, item: Partial<InvoiceItem>) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discountRate = item.discountRate || 0;
    const taxRate = item.taxRate || 0;

    const subTotal = quantity * unitPrice;
    const discountAmount = subTotal * (discountRate / 100);
    const taxableAmount = subTotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const totalPrice = taxableAmount + taxAmount;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      ...item,
      totalPrice,
    };
    setItems(newItems);
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    items.forEach(item => {
      const itemSubTotal = (item.quantity || 0) * (item.unitPrice || 0);
      const itemDiscount = itemSubTotal * ((item.discountRate || 0) / 100);
      const taxableAmount = itemSubTotal - itemDiscount;
      const itemTax = taxableAmount * ((item.taxRate || 0) / 100);

      subTotal += itemSubTotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });

    const totalAmount = subTotal - discountAmount + taxAmount;

    setTotals({
      subTotal,
      taxAmount,
      discountAmount,
      totalAmount,
    });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      discountRate: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    if (['quantity', 'unitPrice', 'discountRate', 'taxRate'].includes(field)) {
      calculateItemTotal(index, newItems[index]);
    } else {
      setItems(newItems);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      
      const invoiceData = {
        ...values,
        items,
        ...totals,
        invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      };

      if (id) {
        // await invoiceService.updateInvoice(id, invoiceData);
        message.success('Fatura güncellendi');
      } else {
        // await invoiceService.createInvoice(invoiceData);
        message.success('Fatura oluşturuldu');
      }
      
      navigate(-1);
    } catch (error) {
      message.error('İşlem başarısız');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSend = async (values: any) => {
    await handleSave(values);
    message.info('Fatura kaydedildi ve gönderildi');
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'İptal Et',
      content: 'Değişiklikler kaybolacak. Devam etmek istiyor musunuz?',
      okText: 'Evet',
      cancelText: 'Hayır',
      onOk: () => navigate(-1),
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="invoice-edit-page">
      <PageHeader
        ghost={false}
        onBack={() => navigate(-1)}
        title={id ? 'Fatura Düzenle' : 'Yeni Fatura'}
        extra={[
          <Button key="cancel" onClick={handleCancel}>
            İptal
          </Button>,
          <Button
            key="save-draft"
            onClick={() => form.submit()}
            loading={saving}
          >
            Taslak Kaydet
          </Button>,
          <Button
            key="save-send"
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              form.validateFields().then(values => {
                handleSaveAndSend(values);
              });
            }}
            loading={saving}
          >
            Kaydet ve Gönder
          </Button>,
        ]}
      />

      <div className="invoice-edit-content">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="invoice-form"
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card title="Fatura Bilgileri" className="invoice-card">
                {/* Müşteri Bilgileri */}
                <Title level={5}>Müşteri Bilgileri</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="customerId"
                      label="Müşteri Seç"
                    >
                      <Select
                        showSearch
                        placeholder="Müşteri seçin veya yeni ekleyin"
                        onChange={handleCustomerSelect}
                        filterOption={(input, option) =>
                          (option?.children as string)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {customers.map(customer => (
                          <Option key={customer.id} value={customer.id}>
                            {customer.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="customerName"
                      label="Müşteri Adı"
                      rules={[{ required: true, message: 'Müşteri adı zorunludur' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Müşteri adı" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="customerEmail"
                      label="Email"
                      rules={[
                        { required: true, message: 'Email zorunludur' },
                        { type: 'email', message: 'Geçerli email giriniz' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="customerPhone"
                      label="Telefon"
                      rules={[{ required: true, message: 'Telefon zorunludur' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="+90 5XX XXX XXXX" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="customerAddress"
                      label="Adres"
                      rules={[{ required: true, message: 'Adres zorunludur' }]}
                    >
                      <TextArea
                        rows={2}
                        placeholder="Müşteri adresi"
                        prefix={<HomeOutlined />}
                      />
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
                    <Form.Item name="customerTaxOffice" label="Vergi Dairesi">
                      <Input placeholder="Vergi dairesi" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                {/* Fatura Detayları */}
                <Title level={5}>Fatura Detayları</Title>
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
                    <Form.Item
                      name="paymentMethod"
                      label="Ödeme Yöntemi"
                      rules={[{ required: true, message: 'Ödeme yöntemi zorunludur' }]}
                    >
                      <Select>
                        <Option value="BankTransfer">Banka Havalesi</Option>
                        <Option value="CreditCard">Kredi Kartı</Option>
                        <Option value="Cash">Nakit</Option>
                        <Option value="Check">Çek</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                {/* Ürün/Hizmet Kalemleri */}
                <div className="invoice-items-section">
                  <div className="section-header">
                    <Title level={5}>Ürün/Hizmet Kalemleri</Title>
                    <Button
                      type="dashed"
                      onClick={handleAddItem}
                      icon={<PlusOutlined />}
                    >
                      Kalem Ekle
                    </Button>
                  </div>

                  <Table
                    dataSource={items}
                    pagination={false}
                    rowKey="id"
                    className="invoice-items-table"
                    columns={[
                      {
                        title: 'Ürün/Hizmet',
                        dataIndex: 'productName',
                        width: 250,
                        render: (_, record, index) => (
                          <div>
                            <Select
                              style={{ width: '100%', marginBottom: 8 }}
                              placeholder="Ürün seçin"
                              value={record.productId}
                              onChange={(value) => handleProductSelect(value, index)}
                              showSearch
                            >
                              {products.map(product => (
                                <Option key={product.id} value={product.id}>
                                  {product.name}
                                </Option>
                              ))}
                            </Select>
                            <Input
                              placeholder="Açıklama"
                              value={record.description}
                              onChange={(e) =>
                                handleItemChange(index, 'description', e.target.value)
                              }
                            />
                          </div>
                        ),
                      },
                      {
                        title: 'Miktar',
                        dataIndex: 'quantity',
                        width: 100,
                        render: (_, record, index) => (
                          <InputNumber
                            min={1}
                            value={record.quantity}
                            onChange={(value) =>
                              handleItemChange(index, 'quantity', value)
                            }
                          />
                        ),
                      },
                      {
                        title: 'Birim Fiyat',
                        dataIndex: 'unitPrice',
                        width: 120,
                        render: (_, record, index) => (
                          <InputNumber
                            min={0}
                            value={record.unitPrice}
                            onChange={(value) =>
                              handleItemChange(index, 'unitPrice', value)
                            }
                            formatter={(value) => `₺ ${value}`}
                            parser={(value) => value!.replace('₺ ', '')}
                          />
                        ),
                      },
                      {
                        title: 'İndirim %',
                        dataIndex: 'discountRate',
                        width: 100,
                        render: (_, record, index) => (
                          <InputNumber
                            min={0}
                            max={100}
                            value={record.discountRate}
                            onChange={(value) =>
                              handleItemChange(index, 'discountRate', value)
                            }
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace('%', '')}
                          />
                        ),
                      },
                      {
                        title: 'KDV %',
                        dataIndex: 'taxRate',
                        width: 100,
                        render: (_, record, index) => (
                          <Select
                            value={record.taxRate}
                            onChange={(value) =>
                              handleItemChange(index, 'taxRate', value)
                            }
                          >
                            <Option value={0}>%0</Option>
                            <Option value={1}>%1</Option>
                            <Option value={8}>%8</Option>
                            <Option value={18}>%18</Option>
                          </Select>
                        ),
                      },
                      {
                        title: 'Toplam',
                        dataIndex: 'totalPrice',
                        width: 120,
                        render: (value) => (
                          <Text strong>{formatCurrency(value || 0)}</Text>
                        ),
                      },
                      {
                        title: '',
                        width: 50,
                        render: (_, __, index) => (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                          />
                        ),
                      },
                    ]}
                  />
                </div>

                <Divider />

                {/* Notlar */}
                <Title level={5}>Notlar</Title>
                <Form.Item name="notes">
                  <TextArea
                    rows={3}
                    placeholder="Fatura ile ilgili notlar (isteğe bağlı)"
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Özet */}
              <Card title="Fatura Özeti" className="summary-card">
                <div className="summary-content">
                  <div className="summary-item">
                    <Text>Ara Toplam:</Text>
                    <Text strong>{formatCurrency(totals.subTotal)}</Text>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="summary-item">
                      <Text>İndirim:</Text>
                      <Text type="danger">-{formatCurrency(totals.discountAmount)}</Text>
                    </div>
                  )}
                  <div className="summary-item">
                    <Text>KDV:</Text>
                    <Text>{formatCurrency(totals.taxAmount)}</Text>
                  </div>
                  <Divider />
                  <div className="summary-item total">
                    <Title level={4}>Genel Toplam:</Title>
                    <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                      {formatCurrency(totals.totalAmount)}
                    </Title>
                  </div>
                </div>
              </Card>

              {/* Hızlı İşlemler */}
              <Card title="Hızlı İşlemler" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    message="Fatura Durumu"
                    description={id ? "Taslak olarak kaydedilmiş" : "Henüz kaydedilmemiş"}
                    type="info"
                    showIcon
                  />
                  <Button
                    block
                    icon={<CalculatorOutlined />}
                    onClick={calculateTotals}
                  >
                    Toplamları Yeniden Hesapla
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default InvoiceEdit;