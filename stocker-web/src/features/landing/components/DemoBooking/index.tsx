import React, { useState } from 'react';
import { 
  Calendar, 
  Typography, 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Card,
  Tag,
  TimePicker,
  message,
  Space
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import './style.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export const DemoBooking: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const demoTopics = [
    'CRM Modülü',
    'Stok Yönetimi',
    'Finans & Muhasebe',
    'İnsan Kaynakları',
    'Üretim Planlama',
    'E-Ticaret Entegrasyonu',
    'Genel Tanıtım'
  ];

  const handleSubmit = async (values: any) => {
    if (!selectedDate || !selectedTime) {
      message.error('Lütfen tarih ve saat seçin');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      message.success('Demo rezervasyonunuz başarıyla oluşturuldu! E-posta adresinize detaylar gönderildi.');
      form.resetFields();
      setSelectedDate(null);
      setSelectedTime('');
      setLoading(false);
    }, 2000);
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    // Disable weekends and past dates
    return current && (
      current < dayjs().startOf('day') ||
      current.day() === 0 ||
      current.day() === 6
    );
  };

  return (
    <section className="demo-booking-section" id="demo-booking">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <Tag color="purple" className="section-tag">
            <VideoCameraOutlined /> Canlı Demo
          </Tag>
          <Title level={2}>Ücretsiz Demo Rezervasyonu</Title>
          <Paragraph>
            Uzman ekibimizle 30 dakikalık özel demo seansı ayırtın
          </Paragraph>
        </motion.div>

        <Row gutter={[48, 48]}>
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="booking-benefits-card">
                <Title level={3}>
                  <TeamOutlined /> Neden Canlı Demo?
                </Title>
                
                <div className="benefits-list">
                  <div className="benefit-item">
                    <CheckCircleOutlined />
                    <div>
                      <Text strong>Kişiselleştirilmiş Sunum</Text>
                      <br />
                      <Text type="secondary">İşletmenize özel senaryolarla tanıtım</Text>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <CheckCircleOutlined />
                    <div>
                      <Text strong>Anlık Soru-Cevap</Text>
                      <br />
                      <Text type="secondary">Tüm sorularınıza anında yanıt</Text>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <CheckCircleOutlined />
                    <div>
                      <Text strong>ROI Hesaplaması</Text>
                      <br />
                      <Text type="secondary">Yatırım getirinizi birlikte hesaplayalım</Text>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <CheckCircleOutlined />
                    <div>
                      <Text strong>Özel İndirimler</Text>
                      <br />
                      <Text type="secondary">Demo sonrası özel fiyat avantajları</Text>
                    </div>
                  </div>
                </div>

                <div className="demo-stats">
                  <div className="stat">
                    <div className="stat-value">500+</div>
                    <div className="stat-label">Başarılı Demo</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">%95</div>
                    <div className="stat-label">Memnuniyet</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">30 dk</div>
                    <div className="stat-label">Ortalama Süre</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="booking-form-card">
                <Title level={3}>
                  <CalendarOutlined /> Demo Rezervasyon Formu
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Ad Soyad"
                        rules={[{ required: true, message: 'Lütfen adınızı girin' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          placeholder="Adınız Soyadınız"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="company"
                        label="Şirket"
                        rules={[{ required: true, message: 'Lütfen şirket adını girin' }]}
                      >
                        <Input 
                          placeholder="Şirket Adı"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="E-posta"
                        rules={[
                          { required: true, message: 'Lütfen e-posta adresinizi girin' },
                          { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined />} 
                          placeholder="ornek@sirket.com"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Telefon"
                        rules={[{ required: true, message: 'Lütfen telefon numaranızı girin' }]}
                      >
                        <Input 
                          prefix={<PhoneOutlined />} 
                          placeholder="0555 555 55 55"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="topic"
                    label="Demo Konusu"
                    rules={[{ required: true, message: 'Lütfen demo konusunu seçin' }]}
                  >
                    <Select 
                      placeholder="İlgilendiğiniz modülü seçin"
                      size="large"
                    >
                      {demoTopics.map(topic => (
                        <Option key={topic} value={topic}>{topic}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <div className="date-time-selector">
                    <Title level={5}>Tarih ve Saat Seçimi</Title>
                    
                    <div className="calendar-wrapper">
                      <Calendar
                        fullscreen={false}
                        disabledDate={disabledDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setSelectedTime('');
                        }}
                      />
                    </div>

                    {selectedDate && (
                      <div className="time-slots">
                        <Text strong>
                          {selectedDate.format('DD MMMM YYYY')} için uygun saatler:
                        </Text>
                        <div className="time-grid">
                          {availableTimes.map(time => (
                            <Button
                              key={time}
                              type={selectedTime === time ? 'primary' : 'default'}
                              onClick={() => setSelectedTime(time)}
                              className="time-slot"
                            >
                              <ClockCircleOutlined /> {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Form.Item
                    name="message"
                    label="Notlarınız (Opsiyonel)"
                  >
                    <Input.TextArea 
                      rows={3}
                      placeholder="Özel talepleriniz veya sorularınız varsa belirtebilirsiniz"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    disabled={!selectedDate || !selectedTime}
                    className="submit-button"
                  >
                    Demo Rezervasyonu Yap
                  </Button>

                  {selectedDate && selectedTime && (
                    <div className="selection-summary">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      <Text>
                        Seçilen tarih ve saat: 
                        <strong> {selectedDate.format('DD MMMM YYYY')} - {selectedTime}</strong>
                      </Text>
                    </div>
                  )}
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
    </section>
  );
};