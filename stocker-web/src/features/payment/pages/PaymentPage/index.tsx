import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Modal,
  Steps,
  Spin,
  Divider,
  Radio,
  Select,
  Checkbox,
  message,
  Tag,
  Statistic,
  Progress,
  InputNumber,
  Tooltip,
  Badge,
  Result,
  List,
  Avatar,
  Tabs
} from 'antd';
import {
  CreditCardOutlined,
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  BankOutlined,
  MobileOutlined,
  WalletOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  FieldTimeOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

interface PaymentData {
  tenantId: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  companyName: string;
  contactEmail: string;
}

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'digital_wallet'>('credit_card');
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [show3DSecure, setShow3DSecure] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for 3D Secure
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Payment data from registration
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  // Card display states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardType, setCardType] = useState('');
  const [installment, setInstallment] = useState(1);

  useEffect(() => {
    // Get payment data from URL params or session
    const data: PaymentData = {
      tenantId: searchParams.get('tenantId') || '',
      packageId: searchParams.get('packageId') || '',
      packageName: searchParams.get('package') || 'Profesyonel',
      amount: Number(searchParams.get('amount')) || 999,
      currency: '₺',
      billingPeriod: searchParams.get('period') || 'Monthly',
      companyName: searchParams.get('company') || 'Demo Şirket',
      contactEmail: searchParams.get('email') || 'demo@example.com'
    };
    setPaymentData(data);
  }, [searchParams]);

  // 3D Secure countdown timer
  useEffect(() => {
    if (show3DSecure && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      message.error('3D Secure doğrulama süresi doldu');
      setShow3DSecure(false);
      setTimeLeft(180);
    }
  }, [show3DSecure, timeLeft]);

  // Detect card type
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'troy';
    return '';
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  // Calculate installment options
  const calculateInstallments = () => {
    if (!paymentData) return [];
    
    const baseAmount = paymentData.amount;
    const installmentOptions = [
      { value: 1, label: 'Tek Çekim', amount: baseAmount },
      { value: 2, label: '2 Taksit', amount: baseAmount / 2 },
      { value: 3, label: '3 Taksit', amount: baseAmount / 3 },
      { value: 6, label: '6 Taksit', amount: baseAmount / 6 },
      { value: 9, label: '9 Taksit', amount: baseAmount / 9 },
      { value: 12, label: '12 Taksit', amount: baseAmount / 12 }
    ];
    
    return installmentOptions;
  };

  // Process credit card payment
  const processCreditCardPayment = async (values: any) => {
    setProcessing(true);
    setCurrentStep(1);
    
    // Simulate payment gateway processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show 3D Secure
    setShow3DSecure(true);
    setProcessing(false);
  };

  // Verify 3D Secure
  const verify3DSecure = async () => {
    if (smsCode !== '123456') {
      message.error('Doğrulama kodu hatalı');
      return;
    }
    
    setProcessing(true);
    setShow3DSecure(false);
    setCurrentStep(2);
    
    // Simulate final payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate transaction details
    const txId = `TRX${Date.now()}`;
    const invNo = `INV-${Date.now()}`;
    
    setTransactionId(txId);
    setInvoiceNumber(invNo);
    
    // Call backend to complete payment
    try {
      await apiClient.post('/api/public/process-payment', {
        tenantId: paymentData?.tenantId,
        packageId: paymentData?.packageId,
        amount: paymentData?.amount,
        currency: paymentData?.currency,
        paymentMethod: 'credit_card',
        billingPeriod: paymentData?.billingPeriod,
        transactionId: txId,
        invoiceNumber: invNo
      });
      
      setPaymentComplete(true);
      message.success('Ödeme başarıyla tamamlandı!');
    } catch (error) {
      message.error('Ödeme işlemi başarısız');
    } finally {
      setProcessing(false);
    }
  };

  // Render credit card form
  const renderCreditCardForm = () => (
    <div className="payment-form-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <Card className="payment-form-card">
            <Title level={4}>
              <CreditCardOutlined /> Kart Bilgileri
            </Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={processCreditCardPayment}
              autoComplete="off"
            >
              <Form.Item
                label="Kart Numarası"
                name="cardNumber"
                rules={[
                  { required: true, message: 'Kart numarası zorunludur' },
                  { pattern: /^[\d\s]{19}$/, message: 'Geçerli bir kart numarası giriniz' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  prefix={<CreditCardOutlined />}
                  suffix={
                    cardType && (
                      <img
                        src={`/images/cards/${cardType}.png`}
                        alt={cardType}
                        style={{ height: 20 }}
                      />
                    )
                  }
                />
              </Form.Item>

              <Form.Item
                label="Kart Üzerindeki İsim"
                name="cardName"
                rules={[{ required: true, message: 'Kart sahibi adı zorunludur' }]}
              >
                <Input
                  size="large"
                  placeholder="AD SOYAD"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Son Kullanma Tarihi"
                    name="expiry"
                    rules={[
                      { required: true, message: 'Son kullanma tarihi zorunludur' },
                      { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'AA/YY formatında giriniz' }
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="AA/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        CVV
                        <Tooltip title="Kartınızın arkasındaki 3 haneli güvenlik kodu">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    name="cvv"
                    rules={[
                      { required: true, message: 'CVV zorunludur' },
                      { pattern: /^\d{3,4}$/, message: '3 veya 4 haneli CVV giriniz' }
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Taksit Seçenekleri">
                <Radio.Group
                  value={installment}
                  onChange={(e) => setInstallment(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Row gutter={[8, 8]}>
                    {calculateInstallments().map((option) => (
                      <Col span={8} key={option.value}>
                        <Radio.Button value={option.value} style={{ width: '100%', textAlign: 'center' }}>
                          <div>
                            <Text strong>{option.label}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {paymentData?.currency}{option.amount.toFixed(2)}
                            </Text>
                          </div>
                        </Radio.Button>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              <Divider />

              <Form.Item
                name="saveCard"
                valuePropName="checked"
              >
                <Checkbox>
                  Kartımı gelecek ödemeler için kaydet
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('Sözleşmeyi kabul etmelisiniz')),
                  },
                ]}
              >
                <Checkbox>
                  <a href="#" target="_blank">Ön Bilgilendirme Formu</a> ve{' '}
                  <a href="#" target="_blank">Mesafeli Satış Sözleşmesi</a>'ni okudum ve kabul ediyorum
                </Checkbox>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={processing}
                icon={<LockOutlined />}
              >
                Güvenli Ödeme Yap
              </Button>
            </Form>

            <Divider />

            <div className="security-badges">
              <Space size="large" wrap>
                <Space>
                  <SafetyOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <Text>256-bit SSL</Text>
                </Space>
                <Space>
                  <SecurityScanOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <Text>PCI DSS</Text>
                </Space>
                <Space>
                  <FileProtectOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                  <Text>3D Secure</Text>
                </Space>
              </Space>
            </div>
          </Card>

          {/* Bank logos */}
          <Card className="bank-logos" style={{ marginTop: 16 }}>
            <Text type="secondary">Anlaşmalı Bankalar:</Text>
            <div className="bank-logo-grid">
              {['garanti', 'isbank', 'akbank', 'yapikredi', 'qnb', 'denizbank', 'teb', 'ing'].map(bank => (
                <div key={bank} className="bank-logo">
                  <img src={`/images/banks/${bank}.png`} alt={bank} />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          {/* Visual credit card */}
          <div className="credit-card-visual">
            <div className={`credit-card ${cardType}`}>
              <div className="card-front">
                <div className="card-chip"></div>
                <div className="card-logo">
                  {cardType && <img src={`/images/cards/${cardType}-white.png`} alt={cardType} />}
                </div>
                <div className="card-number">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="card-info">
                  <div className="card-holder">
                    <Text className="label">Card Holder</Text>
                    <Text className="value">{cardName || 'AD SOYAD'}</Text>
                  </div>
                  <div className="card-expiry">
                    <Text className="label">Expires</Text>
                    <Text className="value">{cardExpiry || 'AA/YY'}</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <Card className="order-summary" style={{ marginTop: 24 }}>
            <Title level={4}>
              <ShoppingCartOutlined /> Sipariş Özeti
            </Title>
            
            <div className="summary-item">
              <Text>Şirket:</Text>
              <Text strong>{paymentData?.companyName}</Text>
            </div>
            
            <div className="summary-item">
              <Text>Paket:</Text>
              <Text strong>{paymentData?.packageName}</Text>
            </div>
            
            <div className="summary-item">
              <Text>Dönem:</Text>
              <Text strong>
                {paymentData?.billingPeriod === 'Monthly' ? 'Aylık' : 'Yıllık'}
              </Text>
            </div>

            {installment > 1 && (
              <div className="summary-item">
                <Text>Taksit:</Text>
                <Text strong>{installment} Taksit</Text>
              </div>
            )}

            <Divider />

            <div className="summary-total">
              <Title level={5}>Toplam Tutar</Title>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {paymentData?.currency}{paymentData?.amount}
              </Title>
              {installment > 1 && (
                <Text type="secondary">
                  {installment} x {paymentData?.currency}
                  {(paymentData?.amount || 0) / installment}
                </Text>
              )}
            </div>

            <Alert
              message="Güvenli Ödeme"
              description="Tüm işlemleriniz 256-bit SSL ile korunmaktadır"
              type="success"
              showIcon
              icon={<SafetyOutlined />}
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* Help section */}
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>Yardım ve Destek</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                <PhoneOutlined /> 0850 123 45 67
              </Text>
              <Text>
                <MailOutlined /> destek@stocker.com
              </Text>
              <Text>
                <FieldTimeOutlined /> 7/24 Canlı Destek
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render 3D Secure modal
  const render3DSecure = () => (
    <Modal
      title={
        <Space>
          <SecurityScanOutlined style={{ color: '#1890ff' }} />
          3D Secure Doğrulama
        </Space>
      }
      visible={show3DSecure}
      footer={null}
      closable={false}
      width={500}
    >
      <div className="secure-3d-container">
        <Alert
          message="Güvenlik Doğrulaması"
          description="Bankanız tarafından cep telefonunuza SMS ile gönderilen 6 haneli doğrulama kodunu giriniz."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div className="bank-info">
          <img src="/images/banks/bank-logo.png" alt="Bank" style={{ height: 40 }} />
          <Title level={5} style={{ margin: '16px 0' }}>
            DEMO BANK 3D Secure
          </Title>
        </div>

        <div className="transaction-info">
          <div className="info-row">
            <Text type="secondary">İşyeri:</Text>
            <Text strong>Stocker SaaS Platform</Text>
          </div>
          <div className="info-row">
            <Text type="secondary">Tutar:</Text>
            <Text strong>{paymentData?.currency}{paymentData?.amount}</Text>
          </div>
          <div className="info-row">
            <Text type="secondary">Tarih:</Text>
            <Text strong>{new Date().toLocaleString('tr-TR')}</Text>
          </div>
          <div className="info-row">
            <Text type="secondary">Kart:</Text>
            <Text strong>**** **** **** {cardNumber.slice(-4)}</Text>
          </div>
        </div>

        <Divider />

        <Form onFinish={verify3DSecure}>
          <Form.Item
            label="SMS Doğrulama Kodu"
            name="smsCode"
            rules={[{ required: true, message: 'Doğrulama kodu zorunludur' }]}
            extra={
              <Space>
                <Text type="secondary">Demo için kod:</Text>
                <Text type="success" strong>123456</Text>
              </Space>
            }
          >
            <Input
              size="large"
              placeholder="6 haneli kod"
              maxLength={6}
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              prefix={<MobileOutlined />}
              suffix={
                <Text type="secondary">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Text>
              }
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Button
                size="large"
                block
                onClick={() => {
                  setShow3DSecure(false);
                  message.info('İşlem iptal edildi');
                }}
              >
                İptal
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={processing}
              >
                Doğrula ve Öde
              </Button>
            </Col>
          </Row>
        </Form>

        <Alert
          message="Test Ortamı"
          description="Bu bir test işlemidir. Gerçek ödeme alınmayacaktır."
          type="warning"
          style={{ marginTop: 16 }}
        />
      </div>
    </Modal>
  );

  // Render payment success
  const renderPaymentSuccess = () => (
    <Result
      status="success"
      title="Ödeme Başarılı!"
      subTitle={
        <div>
          <Paragraph>
            Ödemeniz başarıyla alındı ve hesabınız aktif edildi.
          </Paragraph>
          <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
            <div className="success-detail">
              <Text type="secondary">İşlem No:</Text>
              <Text strong copyable>{transactionId}</Text>
            </div>
            <div className="success-detail">
              <Text type="secondary">Fatura No:</Text>
              <Text strong copyable>{invoiceNumber}</Text>
            </div>
            <div className="success-detail">
              <Text type="secondary">Tutar:</Text>
              <Text strong>
                {paymentData?.currency}{paymentData?.amount}
              </Text>
            </div>
            <div className="success-detail">
              <Text type="secondary">Tarih:</Text>
              <Text strong>{new Date().toLocaleString('tr-TR')}</Text>
            </div>
          </Space>
        </div>
      }
      extra={[
        <Button key="invoice" icon={<FileProtectOutlined />}>
          Faturayı İndir
        </Button>,
        <Button
          type="primary"
          key="console"
          icon={<CheckCircleOutlined />}
          onClick={() => navigate('/login')}
        >
          Panele Git
        </Button>
      ]}
    />
  );

  if (!paymentData) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-header">
        <div className="container">
          <Space size="large">
            <img src="/logo.png" alt="Stocker" style={{ height: 40 }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>
              Güvenli Ödeme
            </Title>
          </Space>
          <Space>
            <SafetyOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <Text style={{ color: '#fff' }}>256-bit SSL Güvenlik</Text>
          </Space>
        </div>
      </div>

      <div className="payment-content">
        <div className="container">
          <Steps
            current={currentStep}
            style={{ marginBottom: 32 }}
            items={[
              {
                title: 'Ödeme Bilgileri',
                icon: <CreditCardOutlined />
              },
              {
                title: 'Doğrulama',
                icon: <SecurityScanOutlined />
              },
              {
                title: 'Tamamlandı',
                icon: <CheckCircleOutlined />
              }
            ]}
          />

          {paymentComplete ? (
            renderPaymentSuccess()
          ) : (
            <>
              <Tabs
                activeKey={paymentMethod}
                onChange={(key) => setPaymentMethod(key as any)}
                size="large"
              >
                <TabPane
                  tab={
                    <Space>
                      <CreditCardOutlined />
                      Kredi/Banka Kartı
                    </Space>
                  }
                  key="credit_card"
                >
                  {renderCreditCardForm()}
                </TabPane>
                <TabPane
                  tab={
                    <Space>
                      <BankOutlined />
                      Havale/EFT
                    </Space>
                  }
                  key="bank_transfer"
                >
                  <Card>
                    <Alert
                      message="Banka Havalesi Bilgileri"
                      description="Aşağıdaki hesap bilgilerine havale/EFT yapabilirsiniz."
                      type="info"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />
                    <List
                      dataSource={[
                        { bank: 'Garanti BBVA', iban: 'TR12 0006 2000 1234 0006 2345 67', branch: 'Levent Şubesi' },
                        { bank: 'İş Bankası', iban: 'TR34 0006 4000 0011 2345 6789 00', branch: 'Maslak Şubesi' },
                        { bank: 'Akbank', iban: 'TR56 0004 6000 5888 8000 1234 56', branch: 'Sarıyer Şubesi' }
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <Card style={{ width: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text strong>{item.bank}</Text>
                              <Text copyable>{item.iban}</Text>
                              <Text type="secondary">{item.branch}</Text>
                            </Space>
                          </Card>
                        </List.Item>
                      )}
                    />
                    <Alert
                      message="Önemli"
                      description={`Açıklama kısmına "${paymentData.companyName} - ${invoiceNumber}" yazınız.`}
                      type="warning"
                      style={{ marginTop: 16 }}
                    />
                  </Card>
                </TabPane>
                <TabPane
                  tab={
                    <Space>
                      <WalletOutlined />
                      Dijital Cüzdan
                    </Space>
                  }
                  key="digital_wallet"
                >
                  <Card>
                    <Row gutter={[16, 16]}>
                      {['PayPal', 'Apple Pay', 'Google Pay', 'BKM Express'].map((wallet) => (
                        <Col span={12} key={wallet}>
                          <Card
                            hoverable
                            className="wallet-card"
                            onClick={() => message.info(`${wallet} ile ödeme simülasyonu`)}
                          >
                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                              <WalletOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                              <Text strong>{wallet}</Text>
                            </Space>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </TabPane>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {render3DSecure()}
    </div>
  );
};