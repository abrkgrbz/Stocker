'use client';

import { useState } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Tag,
} from 'antd';
import {
  MailOutlined,
  UserAddOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DollarOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Campaign } from '@/lib/api/services/crm.service';

const { RangePicker } = DatePicker;

interface CampaignModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: Campaign | null;
  loading?: boolean;
}

const campaignTypes = [
  { value: 'Email', label: 'E-posta', icon: <MailOutlined />, color: 'blue' },
  { value: 'SocialMedia', label: 'Sosyal Medya', icon: <UserAddOutlined />, color: 'cyan' },
  { value: 'Webinar', label: 'Webinar', icon: <PlayCircleOutlined />, color: 'purple' },
  { value: 'Event', label: 'Etkinlik', icon: <CheckCircleOutlined />, color: 'green' },
  { value: 'Conference', label: 'Konferans', icon: <CalendarOutlined />, color: 'orange' },
  { value: 'Advertisement', label: 'Reklam', icon: <TrophyOutlined />, color: 'red' },
  { value: 'Banner', label: 'Banner', icon: <DollarOutlined />, color: 'gold' },
  { value: 'Telemarketing', label: 'Telemarketing', icon: <PhoneOutlined />, color: 'geekblue' },
  { value: 'PublicRelations', label: 'Halkla İlişkiler', icon: <UserAddOutlined />, color: 'magenta' },
];

export function CampaignModal({
  open,
  onCancel,
  onSubmit,
  initialData,
  loading = false,
}: CampaignModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Lütfen tüm zorunlu alanları doldurun');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();

      // Format dates
      if (values.dateRange) {
        values.startDate = values.dateRange[0].format('YYYY-MM-DD');
        values.endDate = values.dateRange[1].format('YYYY-MM-DD');
        delete values.dateRange;
      }

      onSubmit(values);
      form.resetFields();
      setCurrentStep(0);
    } catch (error) {
      message.error('Lütfen tüm zorunlu alanları doldurun');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    onCancel();
  };

  const steps = [
    {
      title: 'Temel Bilgiler',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="name"
            label="Kampanya Adı"
            rules={[{ required: true, message: 'Kampanya adı zorunludur' }]}
          >
            <Input placeholder="Örn: Yılbaşı İndirimleri" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Kampanya hakkında detaylı açıklama" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Kampanya Tipi"
            rules={[{ required: true, message: 'Kampanya tipi zorunludur' }]}
          >
            <Select size="large" placeholder="Kampanya tipini seçin">
              {campaignTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: `var(--ant-${type.color}-6)` }}>{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="targetAudience" label="Hedef Kitle">
            <Input.TextArea rows={2} placeholder="Kampanyanın hedef kitlesi (örn: 25-40 yaş arası profesyoneller)" />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Bütçe',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="budgetedCost"
              label="Planlanan Bütçe (₺)"
              rules={[{ required: true, message: 'Planlanan bütçe zorunludur' }]}
            >
              <InputNumber
                placeholder="0.00"
                min={0}
                className="w-full"
                size="large"
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item name="actualCost" label="Gerçekleşen Maliyet (₺)">
              <InputNumber
                placeholder="0.00"
                min={0}
                className="w-full"
                size="large"
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="expectedRevenue"
              label="Beklenen Gelir (₺)"
              rules={[{ required: true, message: 'Beklenen gelir zorunludur' }]}
            >
              <InputNumber
                placeholder="0.00"
                min={0}
                className="w-full"
                size="large"
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item name="actualRevenue" label="Gerçekleşen Gelir (₺)">
              <InputNumber
                placeholder="0.00"
                min={0}
                className="w-full"
                size="large"
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Bütçe Özeti</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <div className="text-gray-600">Toplam Bütçe</div>
                <div className="text-lg font-semibold">
                  ₺{(Form.useWatch('budgetedCost', form) || 0).toLocaleString('tr-TR')}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Beklenen Kar</div>
                <div className="text-lg font-semibold text-green-600">
                  ₺
                  {(
                    (Form.useWatch('expectedRevenue', form) || 0) -
                    (Form.useWatch('budgetedCost', form) || 0)
                  ).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Hedefler',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="targetLeads"
              label="Hedef Lead Sayısı"
              rules={[{ required: true, message: 'Hedef lead sayısı zorunludur' }]}
            >
              <InputNumber placeholder="0" min={0} className="w-full" size="large" />
            </Form.Item>

            <Form.Item name="actualLeads" label="Gerçekleşen Lead Sayısı">
              <InputNumber placeholder="0" min={0} className="w-full" size="large" />
            </Form.Item>
          </div>

          <Form.Item name="convertedLeads" label="Dönüştürülen Lead Sayısı">
            <InputNumber placeholder="0" min={0} className="w-full" size="large" />
          </Form.Item>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Performans Göstergeleri</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Hedef Lead</div>
                <div className="text-lg font-semibold text-purple-900">
                  {Form.useWatch('targetLeads', form) || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Gerçekleşen</div>
                <div className="text-lg font-semibold text-blue-600">
                  {Form.useWatch('actualLeads', form) || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Dönüşüm Oranı</div>
                <div className="text-lg font-semibold text-green-600">
                  {Form.useWatch('actualLeads', form) > 0
                    ? (
                        ((Form.useWatch('convertedLeads', form) || 0) /
                          Form.useWatch('actualLeads', form)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Zamanlama',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="dateRange"
            label="Kampanya Tarihleri"
            rules={[{ required: true, message: 'Kampanya tarihleri zorunludur' }]}
          >
            <RangePicker
              className="w-full"
              size="large"
              format="DD/MM/YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Kampanya Durumu"
            initialValue="Planned"
            rules={[{ required: true, message: 'Kampanya durumu zorunludur' }]}
          >
            <Select size="large">
              <Select.Option value="Planned">
                <Tag color="default">Planlandı</Tag>
              </Select.Option>
              <Select.Option value="InProgress">
                <Tag color="processing">Devam Ediyor</Tag>
              </Select.Option>
              <Select.Option value="Completed">
                <Tag color="success">Tamamlandı</Tag>
              </Select.Option>
              <Select.Option value="OnHold">
                <Tag color="warning">Beklemede</Tag>
              </Select.Option>
              <Select.Option value="Aborted">
                <Tag color="error">İptal Edildi</Tag>
              </Select.Option>
            </Select>
          </Form.Item>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Kampanya Özeti</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>Kampanya Adı:</strong>{' '}
                {Form.useWatch('name', form) || <span className="text-gray-400">Belirtilmedi</span>}
              </div>
              <div>
                <strong>Tip:</strong>{' '}
                {campaignTypes.find((t) => t.value === Form.useWatch('type', form))?.label || (
                  <span className="text-gray-400">Belirtilmedi</span>
                )}
              </div>
              <div>
                <strong>Bütçe:</strong> ₺{(Form.useWatch('budgetedCost', form) || 0).toLocaleString('tr-TR')}
              </div>
              <div>
                <strong>Hedef Lead:</strong> {Form.useWatch('targetLeads', form) || 0}
              </div>
              <div>
                <strong>Durum:</strong>{' '}
                <Tag
                  color={
                    Form.useWatch('status', form) === 'InProgress'
                      ? 'processing'
                      : Form.useWatch('status', form) === 'Completed'
                      ? 'success'
                      : 'default'
                  }
                >
                  {Form.useWatch('status', form) === 'Planned'
                    ? 'Planlandı'
                    : Form.useWatch('status', form) === 'InProgress'
                    ? 'Devam Ediyor'
                    : Form.useWatch('status', form) === 'Completed'
                    ? 'Tamamlandı'
                    : Form.useWatch('status', form)}
                </Tag>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={initialData ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <Steps current={currentStep} items={steps} className="mb-6" />

      <Form
        form={form}
        layout="vertical"
        initialValues={
          initialData
            ? {
                ...initialData,
                dateRange: initialData.startDate
                  ? [dayjs(initialData.startDate), dayjs(initialData.endDate)]
                  : undefined,
              }
            : { status: 'Planned' }
        }
      >
        <div className="min-h-[400px]">{steps[currentStep].content}</div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button onClick={handleCancel}>İptal</Button>

          <Space>
            {currentStep > 0 && <Button onClick={handlePrev}>Geri</Button>}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                İleri
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleFinish} loading={loading}>
                {initialData ? 'Güncelle' : 'Oluştur'}
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
