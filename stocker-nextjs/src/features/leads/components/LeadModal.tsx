'use client';

import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, Card, Alert } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  StarOutlined,
  FileTextOutlined,
  GlobalOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Lead } from '@/lib/api/services/crm.service';

const { TextArea } = Input;

interface LeadModalProps {
  open: boolean;
  lead: Lead | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function LeadModal({ open, lead, loading, onCancel, onSubmit }: LeadModalProps) {
  const [form] = Form.useForm();
  const isEditMode = !!lead;

  React.useEffect(() => {
    if (open && lead) {
      form.setFieldsValue(lead);
    } else if (open) {
      form.resetFields();
    }
  }, [open, lead, form]);

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
            {isEditMode ? 'Potansiyel Müşteri Düzenle' : 'Yeni Potansiyel Müşteri'}
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
        {/* Kişisel Bilgiler */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserOutlined className="text-blue-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Kişisel Bilgiler</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Ad</span>}
                  name="firstName"
                  rules={[{ required: true, message: 'Ad gerekli' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Örn: Ahmet"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Soyad</span>}
                  name="lastName"
                  rules={[{ required: true, message: 'Soyad gerekli' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Örn: Yılmaz"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* İletişim Bilgileri */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <MailOutlined className="text-green-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">İletişim Bilgileri</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item
              label={<span className="text-gray-700 font-medium">E-posta</span>}
              name="email"
              rules={[
                { required: true, message: 'E-posta gerekli' },
                { type: 'email', message: 'Geçerli bir e-posta girin' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="ornek@firma.com"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Telefon</span>}
              name="phone"
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="+90 (555) 123-4567"
                className="rounded-lg"
              />
            </Form.Item>
          </Card>
        </div>

        {/* Firma Bilgileri */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BankOutlined className="text-purple-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Firma Bilgileri</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Firma</span>}
                  name="company"
                >
                  <Input
                    prefix={<BankOutlined className="text-gray-400" />}
                    placeholder="Firma adı"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Pozisyon</span>}
                  name="jobTitle"
                >
                  <Input
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    placeholder="İş unvanı"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Lead Bilgileri */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <GlobalOutlined className="text-orange-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Lead Bilgileri</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Kaynak</span>}
                  name="source"
                  rules={[{ required: true, message: 'Kaynak gerekli' }]}
                >
                  <Select placeholder="Kaynak seçiniz" className="rounded-lg">
                    <Select.Option value="Website">
                      <div className="flex items-center gap-2">
                        <GlobalOutlined className="text-gray-500" />
                        <span>Web Sitesi</span>
                      </div>
                    </Select.Option>
                    <Select.Option value="Referral">
                      <div className="flex items-center gap-2">
                        <TeamOutlined className="text-gray-500" />
                        <span>Referans</span>
                      </div>
                    </Select.Option>
                    <Select.Option value="SocialMedia">
                      <div className="flex items-center gap-2">
                        <GlobalOutlined className="text-gray-500" />
                        <span>Sosyal Medya</span>
                      </div>
                    </Select.Option>
                    <Select.Option value="Event">
                      <div className="flex items-center gap-2">
                        <TeamOutlined className="text-gray-500" />
                        <span>Etkinlik</span>
                      </div>
                    </Select.Option>
                    <Select.Option value="Other">
                      <div className="flex items-center gap-2">
                        <FileTextOutlined className="text-gray-500" />
                        <span>Diğer</span>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Durum</span>}
                  name="status"
                  rules={[{ required: true, message: 'Durum gerekli' }]}
                >
                  <Select placeholder="Durum seçiniz" className="rounded-lg">
                    <Select.Option value="New">Yeni</Select.Option>
                    <Select.Option value="Contacted">İletişime Geçildi</Select.Option>
                    <Select.Option value="Qualified">Nitelikli</Select.Option>
                    <Select.Option value="Unqualified">Niteliksiz</Select.Option>
                    <Select.Option value="Converted">Dönüştürüldü</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Puan (0-100)</span>}
              name="score"
              initialValue={50}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                className="rounded-lg"
                prefix={<StarOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Alert
              message="Lead Puanlaması"
              description="0-30: Düşük öncelik | 31-70: Orta öncelik | 71-100: Yüksek öncelik"
              type="info"
              showIcon
              className="mb-4"
            />
          </Card>
        </div>

        {/* Notlar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              <FileTextOutlined className="text-gray-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Notlar</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item label={<span className="text-gray-700 font-medium">Notlar</span>} name="notes">
              <TextArea
                rows={4}
                placeholder="Bu lead hakkında notlar..."
                className="rounded-lg"
              />
            </Form.Item>
          </Card>
        </div>
      </Form>
    </Modal>
  );
}
