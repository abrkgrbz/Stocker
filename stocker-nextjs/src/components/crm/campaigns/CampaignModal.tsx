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
  CalculatorOutlined,
  AimOutlined,
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
        <div className="space-y-5">
          <Form.Item
            name="name"
            label={<span className="text-base font-semibold text-gray-700">Kampanya Adı</span>}
            rules={[{ required: true, message: 'Kampanya adı zorunludur' }]}
          >
            <Input
              placeholder="Örn: Yılbaşı İndirimleri"
              size="large"
              className="bg-gray-50 hover:bg-white focus:bg-white transition-colors"
            />
          </Form.Item>

          <Form.Item name="description" label={<span className="text-base font-semibold text-gray-700">Açıklama</span>}>
            <Input.TextArea
              rows={3}
              placeholder="Kampanya hakkında detaylı açıklama"
              className="bg-gray-50 hover:bg-white focus:bg-white transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label={<span className="text-base font-semibold text-gray-700">Kampanya Tipi</span>}
            rules={[{ required: true, message: 'Kampanya tipi zorunludur' }]}
          >
            <Select
              size="large"
              placeholder="Kampanya tipini seçin"
              className="campaign-select"
            >
              {campaignTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="targetAudience" label={<span className="text-base font-semibold text-gray-700">Hedef Kitle</span>}>
            <Input.TextArea
              rows={2}
              placeholder="Kampanyanın hedef kitlesi (örn: 25-40 yaş arası profesyoneller)"
              className="bg-gray-50 hover:bg-white focus:bg-white transition-colors"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Bütçe',
      content: (
        <div className="space-y-5">
          <Form.Item
            name="budgetedCost"
            label={<span className="text-base font-semibold text-gray-700">Planlanan Bütçe (₺)</span>}
            rules={[{ required: true, message: 'Planlanan bütçe zorunludur' }]}
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white transition-colors"
              size="large"
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₺\s?|(,*)/g, '') || ''}
            />
          </Form.Item>

          <Form.Item
            name="expectedRevenue"
            label={<span className="text-base font-semibold text-gray-700">Beklenen Gelir (₺)</span>}
            rules={[{ required: true, message: 'Beklenen gelir zorunludur' }]}
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white transition-colors"
              size="large"
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/₺\s?|(,*)/g, '') || ''}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.budgetedCost !== curr.budgetedCost || prev.expectedRevenue !== curr.expectedRevenue}>
            {() => {
              const budgetedCost = form.getFieldValue('budgetedCost') || 0;
              const expectedRevenue = form.getFieldValue('expectedRevenue') || 0;
              const expectedProfit = expectedRevenue - budgetedCost;
              const roi = budgetedCost > 0 ? ((expectedProfit / budgetedCost) * 100).toFixed(0) : 0;

              // Anlamsal renkler: Pozitif = Yeşil, Negatif = Kırmızı
              const profitColor = expectedProfit >= 0 ? 'text-green-600' : 'text-red-600';
              const bgColor = expectedProfit >= 0 ? 'bg-green-50' : 'bg-red-50';
              const borderColor = expectedProfit >= 0 ? 'border-green-200' : 'border-red-200';

              return (
                <div className={`p-5 ${bgColor} ${borderColor} border-2 rounded-xl shadow-sm`}>
                  <div className="flex items-center gap-2 mb-4">
                    <CalculatorOutlined className="text-xl text-blue-600" />
                    <h4 className="font-semibold text-lg text-gray-800">Bütçe Analizi</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <div className="text-sm font-medium text-gray-600 mb-2">Beklenen Kar (Net)</div>
                      <div className={`text-4xl font-bold ${profitColor}`}>
                        ₺{expectedProfit.toLocaleString('tr-TR')}
                      </div>
                    </div>
                    {budgetedCost > 0 && (
                      <div className="text-center pt-3 border-t-2 border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Bu, <span className="font-bold text-base">%{roi} ROI</span> (Yatırım Geri Dönüşü) anlamına gelir.
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
        <div className="space-y-5">
          <Form.Item
            name="targetLeads"
            label={<span className="text-base font-semibold text-gray-700">Hedef Lead Sayısı</span>}
            rules={[{ required: true, message: 'Hedef lead sayısı zorunludur' }]}
          >
            <InputNumber
              placeholder="0"
              min={0}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white transition-colors"
              size="large"
            />
          </Form.Item>

          <Form.Item name="targetConversionRate" label={<span className="text-base font-semibold text-gray-700">Hedef Dönüşüm Oranı (%) <span className="text-sm font-normal text-gray-500">(opsiyonel)</span></span>}>
            <InputNumber
              placeholder="0"
              min={0}
              max={100}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white transition-colors"
              size="large"
            />
          </Form.Item>

          <div className="p-5 bg-purple-50 border-2 border-purple-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AimOutlined className="text-xl text-purple-600" />
              <h4 className="font-semibold text-lg text-gray-800">Tahmini Performans</h4>
            </div>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.budgetedCost !== curr.budgetedCost || prev.targetLeads !== curr.targetLeads}>
              {() => {
                const budgetedCost = form.getFieldValue('budgetedCost') || 0;
                const targetLeads = form.getFieldValue('targetLeads') || 0;
                const costPerLead = targetLeads > 0 ? (budgetedCost / targetLeads).toFixed(2) : 0;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Planlanan Bütçe (Adım 2)</span>
                      <span className="text-base font-bold text-purple-900">
                        ₺{budgetedCost.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    {targetLeads > 0 && (
                      <div className="text-center pt-3 border-t-2 border-purple-200">
                        <div className="text-sm font-medium text-gray-600 mb-2">Hedef Lead Başı Maliyet</div>
                        <div className="text-3xl font-bold text-purple-900">₺{costPerLead}</div>
                        <p className="text-xs text-purple-700 mt-2 font-medium">
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
        <div className="space-y-5">
          <Form.Item
            name="dateRange"
            label={<span className="text-base font-semibold text-gray-700">Kampanya Tarihleri</span>}
            rules={[{ required: true, message: 'Kampanya tarihleri zorunludur' }]}
          >
            <RangePicker
              className="w-full campaign-date-picker"
              size="large"
              format="DD/MM/YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-base font-semibold text-gray-700">Kampanya Durumu</span>}
            initialValue="Planned"
            rules={[{ required: true, message: 'Kampanya durumu zorunludur' }]}
          >
            <Select size="large" className="campaign-select">
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
            {() => {
              const name = form.getFieldValue('name');
              const type = form.getFieldValue('type');
              const budgetedCost = form.getFieldValue('budgetedCost') || 0;
              const targetLeads = form.getFieldValue('targetLeads') || 0;
              const status = form.getFieldValue('status') || 'Planned';

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
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircleOutlined className="text-xl text-blue-600" />
                    <h4 className="font-semibold text-lg text-gray-800">Kampanya Özeti</h4>
                  </div>
                  <div className="space-y-3 bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                      <span className="text-sm font-medium text-gray-600">Kampanya Adı:</span>
                      <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                        {name || <span className="text-gray-400 font-normal">Belirtilmedi</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                      <span className="text-sm font-medium text-gray-600">Tip:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {typeLabel || <span className="text-gray-400 font-normal">Belirtilmedi</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                      <span className="text-sm font-medium text-gray-600">Bütçe:</span>
                      <span className="text-sm font-bold text-blue-900">₺{budgetedCost.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                      <span className="text-sm font-medium text-gray-600">Hedef Lead:</span>
                      <span className="text-sm font-bold text-purple-900">{targetLeads}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-medium text-gray-600">Durum:</span>
                      <Tag color={statusColors[status]} className="font-medium">
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
      <style>{`
        /* Stepper güçlendirme */
        .ant-steps-item-active .ant-steps-item-title {
          font-weight: 700 !important;
          font-size: 15px !important;
          color: #1e293b !important;
        }

        .ant-steps-item-finish .ant-steps-item-title {
          opacity: 0.6;
          font-weight: 500 !important;
        }

        .ant-steps-item-wait .ant-steps-item-title {
          opacity: 0.45;
          color: #94a3b8 !important;
        }

        .ant-steps-item-active .ant-steps-item-icon {
          background: #667eea !important;
          border-color: #667eea !important;
        }

        .ant-steps-item-finish .ant-steps-item-icon {
          background: #10b981 !important;
          border-color: #10b981 !important;
        }

        /* Input focus efekti */
        .ant-input:focus,
        .ant-input-number:focus-within,
        .ant-select:focus-within .ant-select-selector,
        .ant-picker:focus-within .ant-picker-input {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1) !important;
        }

        .ant-input:hover,
        .ant-input-number:hover,
        .ant-select:hover .ant-select-selector,
        .ant-picker:hover .ant-picker-input {
          border-color: #a5b4fc !important;
        }

        /* Select & DatePicker background */
        .campaign-select .ant-select-selector,
        .campaign-date-picker .ant-picker-input {
          background-color: #f9fafb !important;
          transition: background-color 0.2s ease;
        }

        .campaign-select:hover .ant-select-selector,
        .campaign-select.ant-select-focused .ant-select-selector,
        .campaign-date-picker:hover .ant-picker-input,
        .campaign-date-picker.ant-picker-focused .ant-picker-input {
          background-color: white !important;
        }
      `}</style>

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
