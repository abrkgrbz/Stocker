'use client';

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Row, Col, Card, Alert, Button } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  PercentageOutlined,
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Deal } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface DealModalProps {
  open: boolean;
  deal: Deal | null;
  loading: boolean;
  stages: Array<{ id: number; name: string; color: string }>;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onDelete?: (id: number) => void;
}

export function DealModal({
  open,
  deal,
  loading,
  stages,
  onCancel,
  onSubmit,
  onDelete,
}: DealModalProps) {
  const [form] = Form.useForm();
  const isEditMode = !!deal;

  React.useEffect(() => {
    if (open && deal) {
      form.setFieldsValue({
        ...deal,
        expectedCloseDate: deal.expectedCloseDate ? dayjs(deal.expectedCloseDate) : null,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, deal, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = () => {
    if (deal && onDelete) {
      onDelete(deal.id);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Fırsatı Düzenle' : 'Yeni Fırsat'}
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={750}
      destroyOnClose
      styles={{ body: { paddingTop: 24 } }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          İptal
        </Button>,
        isEditMode && onDelete && (
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Sil
          </Button>
        ),
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEditMode ? 'Güncelle' : 'Oluştur'}
        </Button>,
      ]}
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
                placeholder="Örn: Yıllık Yazılım Lisansı Anlaşması"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Açıklama</span>}
              name="description"
            >
              <TextArea
                rows={3}
                placeholder="Fırsat hakkında detaylar..."
                className="rounded-lg"
              />
            </Form.Item>
          </Card>
        </div>

        {/* Finansal Bilgiler */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarOutlined className="text-green-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Finansal Bilgiler</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Tutar (₺)</span>}
                  name="amount"
                  rules={[{ required: true, message: 'Tutar gerekli' }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    className="rounded-lg"
                    prefix={<DollarOutlined className="text-gray-400" />}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Olasılık (%)</span>}
                  name="probability"
                  rules={[{ required: true, message: 'Olasılık gerekli' }]}
                  initialValue={50}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    className="rounded-lg"
                    prefix={<PercentageOutlined className="text-gray-400" />}
                    placeholder="50"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Beklenen Gelir Hesaplama"
              description={`Beklenen gelir = Tutar × Olasılık. Örnek: ₺100,000 × %50 = ₺50,000`}
              type="info"
              showIcon
              className="mt-2"
            />
          </Card>
        </div>

        {/* Aşama ve Durum */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FlagOutlined className="text-purple-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Aşama ve Durum</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Aşama</span>}
                  name="stageId"
                  rules={[{ required: true, message: 'Aşama gerekli' }]}
                  initialValue={1}
                >
                  <Select placeholder="Aşama seçiniz" className="rounded-lg">
                    {stages.map((stage) => (
                      <Select.Option key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span>{stage.name}</span>
                        </div>
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
                  initialValue="Open"
                >
                  <Select placeholder="Durum seçiniz" className="rounded-lg">
                    <Select.Option value="Open">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-blue-500" />
                        <span>Açık</span>
                      </div>
                    </Select.Option>
                    <Select.Option value="Won">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-500" />
                        <span>Kazanıldı</span>
                      </div>
                    </Select.Option>
                    <Select.Option value="Lost">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-red-500" />
                        <span>Kaybedildi</span>
                      </div>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Tarih ve Müşteri */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <CalendarOutlined className="text-orange-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Tarih ve Müşteri</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Tahmini Kapanış Tarihi</span>}
                  name="expectedCloseDate"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    className="rounded-lg"
                    placeholder="Tarih seçiniz"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Müşteri ID</span>}
                  name="customerId"
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    className="rounded-lg"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Müşteri seçin (opsiyonel)"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>
      </Form>
    </Modal>
  );
}
