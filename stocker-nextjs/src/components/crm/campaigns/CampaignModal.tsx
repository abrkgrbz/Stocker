'use client';

import { useState } from 'react';
import {
  Drawer,
  Steps,
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  DatePicker,
  Switch,
  Tag,
} from 'antd';
import { showError } from '@/lib/utils/sweetalert';
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
      showError('Lütfen tüm zorunlu alanları doldurun');
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
      showError('Lütfen tüm zorunlu alanları doldurun');
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
                  {type.label}
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

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.budgetedCost !== curr.budgetedCost || prev.expectedRevenue !== curr.expectedRevenue}>
            {({ getFieldValue }) => {
              const budgetedCost = getFieldValue('budgetedCost') || 0;
              const expectedRevenue = getFieldValue('expectedRevenue') || 0;
              const expectedProfit = expectedRevenue - budgetedCost;
              const roi = budgetedCost > 0 ? ((expectedProfit / budgetedCost) * 100).toFixed(0) : 0;

              return (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Bütçe Analizi</h4>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Beklenen Kar (Net)</div>
                      <div className="text-3xl font-bold text-green-600">
                        ₺{expectedProfit.toLocaleString('tr-TR')}
                      </div>
                    </div>
                    {budgetedCost > 0 && (
                      <div className="text-center pt-2 border-t border-blue-200">
                        <p className="text-sm text-blue-800">
                          Bu, <span className="font-semibold">%{roi} ROI</span> (Yatırım Geri Dönüşü) anlamına gelir.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Hedefler',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="targetLeads"
            label="Hedef Lead Sayısı"
            rules={[{ required: true, message: 'Hedef lead sayısı zorunludur' }]}
          >
            <InputNumber placeholder="0" min={0} className="w-full" size="large" />
          </Form.Item>

          <Form.Item name="targetConversionRate" label="Hedef Dönüşüm Oranı (%) (opsiyonel)">
            <InputNumber placeholder="0" min={0} max={100} className="w-full" size="large" />
          </Form.Item>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-3">Tahmini Performans</h4>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.budgetedCost !== curr.budgetedCost || prev.targetLeads !== curr.targetLeads}>
              {({ getFieldValue }) => {
                const budgetedCost = getFieldValue('budgetedCost') || 0;
                const targetLeads = getFieldValue('targetLeads') || 0;
                const costPerLead = targetLeads > 0 ? (budgetedCost / targetLeads).toFixed(2) : 0;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Planlanan Bütçe (Adım 2)</span>
                      <span className="font-semibold text-purple-900">
                        ₺{budgetedCost.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    {targetLeads > 0 && (
                      <div className="text-center pt-3 border-t border-purple-200">
                        <div className="text-sm text-gray-600 mb-1">Hedef Lead Başı Maliyet</div>
                        <div className="text-2xl font-bold text-purple-900">₺{costPerLead}</div>
                        <p className="text-xs text-purple-700 mt-1">
                          (Bütçeniz / Hedef Lead Sayınız)
                        </p>
                      </div>
                    )}
                  </div>
                );
              }}
            </Form.Item>
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
              <Select.Option value="Planned">Planlandı</Select.Option>
              <Select.Option value="InProgress">Devam Ediyor</Select.Option>
              <Select.Option value="Completed">Tamamlandı</Select.Option>
              <Select.Option value="OnHold">Beklemede</Select.Option>
              <Select.Option value="Aborted">İptal Edildi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) =>
            prev.name !== curr.name ||
            prev.type !== curr.type ||
            prev.budgetedCost !== curr.budgetedCost ||
            prev.targetLeads !== curr.targetLeads ||
            prev.status !== curr.status
          }>
            {({ getFieldValue }) => {
              const name = getFieldValue('name');
              const type = getFieldValue('type');
              const budgetedCost = getFieldValue('budgetedCost') || 0;
              const targetLeads = getFieldValue('targetLeads') || 0;
              const status = getFieldValue('status') || 'Planned';

              const statusLabels: Record<string, string> = {
                Planned: 'Planlandı',
                InProgress: 'Devam Ediyor',
                Completed: 'Tamamlandı',
                OnHold: 'Beklemede',
                Aborted: 'İptal Edildi',
              };

              const statusColors: Record<string, string> = {
                Planned: 'default',
                InProgress: 'processing',
                Completed: 'success',
                OnHold: 'warning',
                Aborted: 'error',
              };

              const typeLabel = campaignTypes.find((t) => t.value === type)?.label;

              return (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Kampanya Özeti</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>
                      <strong>Kampanya Adı:</strong>{' '}
                      {name || <span className="text-gray-400">Belirtilmedi</span>}
                    </div>
                    <div>
                      <strong>Tip:</strong>{' '}
                      {typeLabel || <span className="text-gray-400">Belirtilmedi</span>}
                    </div>
                    <div>
                      <strong>Bütçe:</strong> ₺{budgetedCost.toLocaleString('tr-TR')}
                    </div>
                    <div>
                      <strong>Hedef Lead:</strong> {targetLeads}
                    </div>
                    <div>
                      <strong>Durum:</strong>{' '}
                      <Tag color={statusColors[status]}>
                        {statusLabels[status]}
                      </Tag>
                    </div>
                  </div>
                </div>
              );
            }}
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={initialData ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
      open={open}
      onClose={handleCancel}
      width={720}
      placement="right"
      destroyOnClose
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
      }}
      footer={
        <div className="flex justify-between items-center py-3 px-6 border-t border-gray-200 bg-white shadow-lg sticky bottom-0 z-10">
          <Button onClick={handleCancel} size="large">İptal</Button>
          <Space size="middle">
            {currentStep > 0 && (
              <Button onClick={handlePrev} size="large">Geri</Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext} size="large">İleri</Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleFinish} loading={loading} size="large">
                {initialData ? 'Güncelle' : 'Oluştur'}
              </Button>
            )}
          </Space>
        </div>
      }
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
      </Form>
    </Drawer>
  );
}
