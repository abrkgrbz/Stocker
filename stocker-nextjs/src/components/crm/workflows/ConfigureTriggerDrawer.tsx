'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
} from 'antd';
import {
  ThunderboltOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  FormOutlined,
  SwapOutlined,
  RocketOutlined,
  FilterOutlined,
  DollarOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import type { WorkflowTriggerType } from '@/lib/api/services/crm.types';
import type { Step1FormData } from './CreateWorkflowDrawer';
import ConditionBuilder, {
  type ConditionGroup,
  type FieldDefinition
} from '@/components/common/ConditionBuilder';
import dayjs from 'dayjs';

interface ConfigureTriggerDrawerProps {
  open: boolean;
  step1Data: Step1FormData;
  onClose: () => void;
  onBack: () => void;
  onNext: (triggerConfig: TriggerConfiguration) => void;
}

export interface TriggerConfiguration {
  type: WorkflowTriggerType;
  entityType?: string;
  config: ScheduledConfig | EventConfig | ManualConfig;
}

export interface ScheduledConfig {
  type: 'scheduled';
  scheduleType: 'once' | 'recurring' | 'cron';
  executeAt?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    time: string;
    timezone: string;
    startDate?: string;
    endDate?: string;
  };
  cronExpression?: string;
}

export interface EventConfig {
  type: 'event';
  conditions?: ConditionGroup;
}

export interface ManualConfig {
  type: 'manual';
}

// Trigger type configurations - synced with backend WorkflowTriggerType enum
const triggerTypeConfig: Record<
  WorkflowTriggerType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string; description: string }
> = {
  Manual: {
    label: 'Manuel Tetikleyici',
    icon: <ThunderboltOutlined />,
    color: '#64748b',
    bgColor: 'bg-slate-100',
    description: 'Kullanıcı tarafından manuel olarak başlatılır',
  },
  Scheduled: {
    label: 'Zamanlanmış',
    icon: <ClockCircleOutlined />,
    color: '#f97316',
    bgColor: 'bg-orange-100',
    description: 'Belirli zamanlarda otomatik çalışır',
  },
  EntityCreated: {
    label: 'Kayıt Oluşturulduğunda',
    icon: <PlusCircleOutlined />,
    color: '#22c55e',
    bgColor: 'bg-green-100',
    description: 'Yeni kayıt oluşturulduğunda tetiklenir',
  },
  EntityUpdated: {
    label: 'Kayıt Güncellendiğinde',
    icon: <FormOutlined />,
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    description: 'Kayıt güncellendiğinde tetiklenir',
  },
  StatusChanged: {
    label: 'Durum Değiştiğinde',
    icon: <SwapOutlined />,
    color: '#8b5cf6',
    bgColor: 'bg-violet-100',
    description: 'Status alanı değiştiğinde tetiklenir',
  },
  DealStageChanged: {
    label: 'Anlaşma Aşaması Değiştiğinde',
    icon: <RocketOutlined />,
    color: '#6366f1',
    bgColor: 'bg-indigo-100',
    description: 'Anlaşma aşaması değiştiğinde tetiklenir',
  },
  FieldCondition: {
    label: 'Alan Koşulu Sağlandığında',
    icon: <FilterOutlined />,
    color: '#ef4444',
    bgColor: 'bg-red-100',
    description: 'Belirli alan koşulu sağlandığında tetiklenir',
  },
  AmountThreshold: {
    label: 'Tutar Eşiği Aşıldığında',
    icon: <DollarOutlined />,
    color: '#eab308',
    bgColor: 'bg-yellow-100',
    description: 'Belirli tutar eşiği aşıldığında tetiklenir',
  },
  DueDateEvent: {
    label: 'Vade Tarihi Yaklaştığında',
    icon: <FieldTimeOutlined />,
    color: '#ec4899',
    bgColor: 'bg-pink-100',
    description: 'Vade tarihi yaklaştığında veya geçtiğinde tetiklenir',
  },
};

// Entity fields for different types with proper typing
const entityFieldDefinitions: Record<string, FieldDefinition[]> = {
  Account: [
    { value: 'Status', label: 'Durum', type: 'select', options: [
      { value: 'Active', label: 'Aktif' },
      { value: 'Inactive', label: 'Pasif' },
      { value: 'Pending', label: 'Beklemede' },
    ]},
    { value: 'Type', label: 'Tip', type: 'select', options: [
      { value: 'Customer', label: 'Müşteri' },
      { value: 'Partner', label: 'Partner' },
      { value: 'Supplier', label: 'Tedarikçi' },
    ]},
    { value: 'Revenue', label: 'Gelir', type: 'number' },
    { value: 'CreatedDate', label: 'Oluşturma Tarihi', type: 'date' },
  ],
  Lead: [
    { value: 'Status', label: 'Durum', type: 'select', options: [
      { value: 'New', label: 'Yeni' },
      { value: 'Qualified', label: 'Nitelikli' },
      { value: 'Unqualified', label: 'Niteliksiz' },
    ]},
    { value: 'Source', label: 'Kaynak', type: 'select', options: [
      { value: 'Website', label: 'Web Sitesi' },
      { value: 'Referral', label: 'Tavsiye' },
      { value: 'Campaign', label: 'Kampanya' },
    ]},
    { value: 'Score', label: 'Puan', type: 'number' },
    { value: 'Budget', label: 'Bütçe', type: 'number' },
    { value: 'Email', label: 'E-posta', type: 'text' },
  ],
  Opportunity: [
    { value: 'Stage', label: 'Aşama', type: 'select', options: [
      { value: 'Prospecting', label: 'Arama' },
      { value: 'Qualification', label: 'Nitelendirme' },
      { value: 'Proposal', label: 'Teklif' },
      { value: 'Negotiation', label: 'Müzakere' },
      { value: 'Closed Won', label: 'Kazanıldı' },
      { value: 'Closed Lost', label: 'Kaybedildi' },
    ]},
    { value: 'Amount', label: 'Tutar', type: 'number' },
    { value: 'Probability', label: 'Olasılık', type: 'number' },
    { value: 'CloseDate', label: 'Kapanış Tarihi', type: 'date' },
  ],
};

// Days of week for checkbox group
const daysOfWeek = [
  { value: 1, label: 'Pzt' },
  { value: 2, label: 'Sal' },
  { value: 3, label: 'Çar' },
  { value: 4, label: 'Per' },
  { value: 5, label: 'Cum' },
  { value: 6, label: 'Cmt' },
  { value: 0, label: 'Paz' },
];

export default function ConfigureTriggerDrawer({
  open,
  step1Data,
  onClose,
  onBack,
  onNext,
}: ConfigureTriggerDrawerProps) {
  const [form] = Form.useForm();
  const [scheduleType, setScheduleType] = useState<'once' | 'recurring' | 'cron'>('recurring');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [conditionGroup, setConditionGroup] = useState<ConditionGroup>({
    logicalOperator: 'AND',
    conditions: [],
    groups: [],
  });

  const config = step1Data.triggerType ? triggerTypeConfig[step1Data.triggerType] : null;

  const handleFinish = (values: any) => {
    const triggerConfig: TriggerConfiguration = {
      type: step1Data.triggerType,
      entityType: step1Data.entityType,
      config: buildTriggerConfig(values),
    };
    onNext(triggerConfig);
  };

  const buildTriggerConfig = (values: any): ScheduledConfig | EventConfig | ManualConfig => {
    if (step1Data.triggerType === 'Manual') {
      return { type: 'manual' };
    }

    if (step1Data.triggerType === 'Scheduled') {
      const config: ScheduledConfig = {
        type: 'scheduled',
        scheduleType: scheduleType,
      };

      if (scheduleType === 'once') {
        config.executeAt = values.executeAt?.toISOString();
      } else if (scheduleType === 'recurring') {
        config.recurrence = {
          frequency: frequency,
          interval: values.interval || 1,
          daysOfWeek: frequency === 'weekly' ? selectedDays : undefined,
          dayOfMonth: values.dayOfMonth,
          time: values.time?.format('HH:mm') || '09:00',
          timezone: values.timezone || 'Europe/Istanbul',
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
        };
      } else if (scheduleType === 'cron') {
        config.cronExpression = values.cronExpression;
      }

      return config;
    }

    // Event-based triggers
    const eventConfig: EventConfig = {
      type: 'event',
    };

    if (conditionGroup.conditions.length > 0 || (conditionGroup.groups && conditionGroup.groups.length > 0)) {
      eventConfig.conditions = conditionGroup;
    }

    return eventConfig;
  };

  const isEventBasedTrigger = () => {
    return ['EntityCreated', 'EntityUpdated', 'StatusChanged', 'DealStageChanged', 'FieldCondition', 'AmountThreshold', 'DueDateEvent'].includes(step1Data.triggerType);
  };

  const inputClassName = "!bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white";
  const selectClassName = "[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white";

  const renderScheduledConfig = () => (
    <div className="space-y-6">
      {/* Schedule Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Zamanlama Tipi</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'once', label: 'Bir Kez', icon: <CalendarOutlined /> },
            { value: 'recurring', label: 'Tekrar Eden', icon: <ClockCircleOutlined /> },
            { value: 'cron', label: 'Gelişmiş (Cron)', icon: <ThunderboltOutlined /> },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setScheduleType(option.value as any)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                ${scheduleType === option.value
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }
              `}
            >
              <span className={`text-lg ${scheduleType === option.value ? 'text-slate-900' : 'text-slate-400'}`}>
                {option.icon}
              </span>
              <span className={`text-sm font-medium ${scheduleType === option.value ? 'text-slate-900' : 'text-slate-600'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Once - Date/Time Picker */}
      {scheduleType === 'once' && (
        <Form.Item
          name="executeAt"
          label={<span className="text-sm font-medium text-slate-700">Çalışma Tarihi ve Saati</span>}
          rules={[{ required: true, message: 'Tarih ve saat seçmelisiniz' }]}
        >
          <DatePicker
            showTime
            format="DD.MM.YYYY HH:mm"
            className={`w-full ${inputClassName}`}
            placeholder="Tarih ve saat seçin"
          />
        </Form.Item>
      )}

      {/* Recurring */}
      {scheduleType === 'recurring' && (
        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Frekans</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'daily', label: 'Günlük' },
                { value: 'weekly', label: 'Haftalık' },
                { value: 'monthly', label: 'Aylık' },
                { value: 'yearly', label: 'Yıllık' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value as any)}
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${frequency === option.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <Form.Item
            name="interval"
            label={<span className="text-sm font-medium text-slate-700">Aralık</span>}
            initialValue={1}
          >
            <InputNumber
              min={1}
              className={`w-full ${inputClassName}`}
              addonAfter={
                frequency === 'daily' ? 'gün' :
                frequency === 'weekly' ? 'hafta' :
                frequency === 'monthly' ? 'ay' : 'yıl'
              }
            />
          </Form.Item>

          {/* Days of Week - for weekly */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Günler</label>
              <div className="flex gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      if (selectedDays.includes(day.value)) {
                        setSelectedDays(selectedDays.filter(d => d !== day.value));
                      } else {
                        setSelectedDays([...selectedDays, day.value]);
                      }
                    }}
                    className={`
                      w-10 h-10 rounded-lg text-sm font-medium transition-all
                      ${selectedDays.includes(day.value)
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of Month - for monthly */}
          {frequency === 'monthly' && (
            <Form.Item
              name="dayOfMonth"
              label={<span className="text-sm font-medium text-slate-700">Ayın Günü</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={31} placeholder="Örn: 15" className={inputClassName} />
            </Form.Item>
          )}

          {/* Time */}
          <Form.Item
            name="time"
            label={<span className="text-sm font-medium text-slate-700">Saat</span>}
            initialValue={dayjs('09:00', 'HH:mm')}
          >
            <TimePicker format="HH:mm" className={`w-full ${inputClassName}`} />
          </Form.Item>

          {/* Timezone */}
          <Form.Item
            name="timezone"
            label={<span className="text-sm font-medium text-slate-700">Saat Dilimi</span>}
            initialValue="Europe/Istanbul"
          >
            <Select className={selectClassName}>
              <Select.Option value="Europe/Istanbul">İstanbul (GMT+3)</Select.Option>
              <Select.Option value="UTC">UTC (GMT+0)</Select.Option>
              <Select.Option value="Europe/London">Londra (GMT+0)</Select.Option>
            </Select>
          </Form.Item>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label={<span className="text-sm font-medium text-slate-700">Başlangıç (Opsiyonel)</span>}
            >
              <DatePicker format="DD.MM.YYYY" className={`w-full ${inputClassName}`} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label={<span className="text-sm font-medium text-slate-700">Bitiş (Opsiyonel)</span>}
            >
              <DatePicker format="DD.MM.YYYY" className={`w-full ${inputClassName}`} />
            </Form.Item>
          </div>
        </div>
      )}

      {/* Cron */}
      {scheduleType === 'cron' && (
        <div className="space-y-4">
          <Form.Item
            name="cronExpression"
            label={<span className="text-sm font-medium text-slate-700">Cron Expression</span>}
            rules={[{ required: true, message: 'Cron expression gerekli' }]}
          >
            <Input placeholder="0 9 * * 1" className={inputClassName} />
          </Form.Item>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-2">
              <InfoCircleOutlined className="text-slate-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Cron Expression Örnekleri</p>
                <ul className="text-xs text-slate-500 mt-2 space-y-1">
                  <li><code className="bg-white px-1.5 py-0.5 rounded">0 9 * * 1</code> - Her Pazartesi 09:00</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">0 */6 * * *</code> - Her 6 saatte bir</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">0 0 1 * *</code> - Her ayın 1'inde gece yarısı</li>
                  <li><code className="bg-white px-1.5 py-0.5 rounded">*/30 * * * *</code> - Her 30 dakikada bir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEventConfig = () => {
    const fields = step1Data.entityType
      ? (entityFieldDefinitions[step1Data.entityType] || [])
      : [];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-2">
            <InfoCircleOutlined className="text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Gelişmiş Koşul Oluşturucu</p>
              <p className="text-xs text-blue-600 mt-1">
                Karmaşık koşullar oluşturabilir, gruplar ekleyebilir ve AND/OR mantığı kullanabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <ConditionBuilder
          value={conditionGroup}
          onChange={setConditionGroup}
          fields={fields}
          maxDepth={3}
        />
      </div>
    );
  };

  const renderManualConfig = () => (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
        <ThunderboltOutlined className="text-2xl text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">Manuel Tetikleyici</h3>
      <p className="text-sm text-slate-500">
        Manuel workflow'lar için ek yapılandırma gerekmez.<br />
        Bu workflow kullanıcı tarafından manuel olarak başlatılacaktır.
      </p>
    </div>
  );

  return (
    <Drawer
      title={null}
      width={640}
      open={open}
      onClose={onClose}
      closable={false}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {config && (
              <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                <span style={{ color: config.color }} className="text-lg">
                  {config.icon}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tetikleyiciyi Yapılandır</h2>
              <p className="text-sm text-slate-500">Adım 2/3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Trigger Info Bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-slate-500">Tetikleyici</p>
              <p className="text-sm font-medium text-slate-900">{config?.label}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex-1">
              <p className="text-xs text-slate-500">Workflow</p>
              <p className="text-sm font-medium text-slate-900 truncate">{step1Data.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {step1Data.triggerType === 'Scheduled' && renderScheduledConfig()}
          {step1Data.triggerType === 'Manual' && renderManualConfig()}
          {isEventBasedTrigger() && renderEventConfig()}
        </Form>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeftOutlined className="text-xs" />
            Geri
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={() => form.submit()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              İleri: Aksiyonları Ekle
              <ArrowRightOutlined className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
