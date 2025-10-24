'use client';

import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, Card, Space, Alert } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Activity } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Activity type configuration
const activityConfig: Record<
  Activity['type'],
  { icon: React.ReactNode; color: string; label: string }
> = {
  Call: { icon: <PhoneOutlined />, color: 'blue', label: 'Arama' },
  Email: { icon: <MailOutlined />, color: 'cyan', label: 'E-posta' },
  Meeting: { icon: <TeamOutlined />, color: 'green', label: 'Toplantı' },
  Task: { icon: <FileTextOutlined />, color: 'orange', label: 'Görev' },
  Note: { icon: <FileTextOutlined />, color: 'default', label: 'Not' },
};

interface ActivityModalProps {
  open: boolean;
  activity: Activity | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function ActivityModal({
  open,
  activity,
  loading,
  onCancel,
  onSubmit,
}: ActivityModalProps) {
  const [form] = Form.useForm();
  const isEditMode = !!activity;

  React.useEffect(() => {
    if (open && activity) {
      form.setFieldsValue({
        ...activity,
        startTime: dayjs(activity.startTime),
        endTime: activity.endTime ? dayjs(activity.endTime) : null,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, activity, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite'}
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      destroyOnClose
      styles={{ body: { paddingTop: 24 } }}
      okText={isEditMode ? 'Güncelle' : 'Oluştur'}
      cancelText="İptal"
    >
      <Form form={form} layout="vertical" className="mt-4">
        {/* Temel Bilgiler */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileTextOutlined className="text-blue-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Temel Bilgiler</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item
              label={<span className="text-gray-700 font-medium">Başlık</span>}
              name="title"
              rules={[{ required: true, message: 'Başlık gerekli' }]}
            >
              <Input
                prefix={<FileTextOutlined className="text-gray-400" />}
                placeholder="Örn: Müşteri Görüşmesi"
                className="rounded-lg"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Tip</span>}
                  name="type"
                  rules={[{ required: true, message: 'Tip gerekli' }]}
                >
                  <Select placeholder="Aktivite tipi seçiniz" className="rounded-lg">
                    {Object.entries(activityConfig).map(([key, config]) => (
                      <Select.Option key={key} value={key}>
                        <Space>
                          {config.icon}
                          {config.label}
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Durum</span>}
                  name="status"
                  rules={[{ required: true, message: 'Durum gerekli' }]}
                  initialValue="Scheduled"
                >
                  <Select placeholder="Durum seçiniz" className="rounded-lg">
                    <Select.Option value="Scheduled">
                      <Space>
                        <ClockCircleOutlined className="text-blue-500" />
                        <span>Zamanlanmış</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Completed">
                      <Space>
                        <CheckCircleOutlined className="text-green-500" />
                        <span>Tamamlandı</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Cancelled">
                      <Space>
                        <CheckCircleOutlined className="text-red-500" />
                        <span>İptal Edildi</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Zaman Bilgileri */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CalendarOutlined className="text-green-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Tarih ve Saat</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Başlangıç</span>}
                  name="startTime"
                  rules={[{ required: true, message: 'Başlangıç zamanı gerekli' }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                    className="rounded-lg"
                    placeholder="Tarih ve saat seçiniz"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Bitiş</span>}
                  name="endTime"
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                    className="rounded-lg"
                    placeholder="Tarih ve saat seçiniz"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Zaman Planlaması"
              description="Bitiş zamanı opsiyoneldir. Belirtmezseniz, aktivite tüm gün için zamanlanmış sayılır."
              type="info"
              showIcon
              className="mt-2"
            />
          </Card>
        </div>

        {/* İlgili Kayıtlar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <UserOutlined className="text-purple-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">İlgili Kayıtlar</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Müşteri ID</span>}
                  name="customerId"
                >
                  <Input
                    type="number"
                    placeholder="Müşteri"
                    className="rounded-lg"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Lead ID</span>}
                  name="leadId"
                >
                  <Input
                    type="number"
                    placeholder="Lead"
                    className="rounded-lg"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Fırsat ID</span>}
                  name="dealId"
                >
                  <Input
                    type="number"
                    placeholder="Fırsat"
                    className="rounded-lg"
                    prefix={<TrophyOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="İlişkilendirme"
              description="Bu aktiviteyi bir müşteri, lead veya fırsat ile ilişkilendirebilirsiniz. Tüm alanlar opsiyoneldir."
              type="info"
              showIcon
            />
          </Card>
        </div>

        {/* Açıklama */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              <FileTextOutlined className="text-gray-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Açıklama</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item
              label={<span className="text-gray-700 font-medium">Detaylar</span>}
              name="description"
            >
              <TextArea
                rows={4}
                placeholder="Aktivite hakkında notlar..."
                className="rounded-lg"
              />
            </Form.Item>
          </Card>
        </div>
      </Form>
    </Modal>
  );
}
