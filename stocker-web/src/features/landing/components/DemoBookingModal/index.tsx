import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, Button, message, Row, Col } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './style.css';

interface DemoBookingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // API integration will be added here
      console.log('Demo booking values:', values);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      message.success({
        content: 'Demo talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.',
        duration: 5
      });

      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const companySizeOptions = [
    { value: '1-10', label: '1-10 kişi' },
    { value: '11-50', label: '11-50 kişi' },
    { value: '51-100', label: '51-100 kişi' },
    { value: '101-500', label: '101-500 kişi' },
    { value: '500+', label: '500+ kişi' }
  ];

  const preferredTimeOptions = [
    { value: 'morning', label: 'Sabah (09:00 - 12:00)' },
    { value: 'afternoon', label: 'Öğleden Sonra (13:00 - 17:00)' },
    { value: 'evening', label: 'Akşam (17:00 - 19:00)' }
  ];

  const disabledDate = (current: any) => {
    // Disable past dates and weekends
    const today = dayjs().startOf('day');
    const isWeekend = current && (current.day() === 0 || current.day() === 6);
    return current && (current < today || isWeekend);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="demo-booking-modal"
      destroyOnClose
    >
      <div className="demo-modal-header">
        <div className="demo-header-icon">
          <CalendarOutlined />
        </div>
        <h2>Ücretsiz Demo Rezervasyonu</h2>
        <p>Uzmanlarımızla 30 dakikalık demo görüşmesi planlayın</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="demo-booking-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Ad Soyad"
              rules={[{ required: true, message: 'Lütfen adınızı girin' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Ahmet Yılmaz"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefon"
              rules={[{ required: true, message: 'Lütfen telefon numaranızı girin' }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="5XX XXX XX XX"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="companyName"
              label="Şirket Adı"
              rules={[{ required: true, message: 'Lütfen şirket adını girin' }]}
            >
              <Input
                prefix={<ShopOutlined />}
                placeholder="ABC Teknoloji"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="companySize"
          label="Şirket Büyüklüğü"
          rules={[{ required: true, message: 'Lütfen şirket büyüklüğünü seçin' }]}
        >
          <Select
            placeholder="Çalışan sayısı seçin"
            size="large"
            suffixIcon={<TeamOutlined />}
            options={companySizeOptions}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="preferredDate"
              label="Tercih Edilen Tarih"
              rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
                disabledDate={disabledDate}
                placeholder="Tarih seçin"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="preferredTime"
              label="Tercih Edilen Saat"
              rules={[{ required: true, message: 'Lütfen saat seçin' }]}
            >
              <Select
                placeholder="Zaman dilimi seçin"
                size="large"
                suffixIcon={<ClockCircleOutlined />}
                options={preferredTimeOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="message"
          label="Mesajınız (Opsiyonel)"
        >
          <Input.TextArea
            placeholder="Özel ihtiyaçlarınız veya sorularınız varsa buraya yazabilirsiniz..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="demo-form-footer">
          <Button onClick={onClose} size="large">
            İptal
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            icon={<CalendarOutlined />}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Demo Rezervasyonu Yap
          </Button>
        </div>
      </Form>

      <div className="demo-modal-info">
        <p>✅ Kredi kartı gerektirmez</p>
        <p>✅ 30 dakikalık özel demo</p>
        <p>✅ Sorularınızı uzmanlarımıza sorun</p>
      </div>
    </Modal>
  );
};
