'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Space,
  Card,
  Alert,
  Typography,
  DatePicker,
  TimePicker,
  Checkbox,
  InputNumber,
} from 'antd';
import {
  ThunderboltOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { WorkflowTriggerType } from '@/lib/api/services/crm.types';
import type { Step1FormData } from './CreateWorkflowDrawer';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

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

  // For 'once'
  executeAt?: string;

  // For 'recurring'
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

  // For 'cron'
  cronExpression?: string;
}

export interface EventConfig {
  type: 'event';
  conditions?: ConditionGroup;
}

export interface ManualConfig {
  type: 'manual';
}

export interface ConditionGroup {
  logicalOperator: 'AND' | 'OR';
  conditions: Condition[];
}

export interface Condition {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greater'
  | 'greaterOrEquals'
  | 'less'
  | 'lessOrEquals'
  | 'contains'
  | 'isEmpty';

// Entity fields for different types
const entityFields: Record<string, Array<{ value: string; label: string }>> = {
  Account: [
    { value: 'Status', label: 'Durum' },
    { value: 'Type', label: 'Tip' },
    { value: 'Revenue', label: 'Gelir' },
  ],
  Lead: [
    { value: 'Status', label: 'Durum' },
    { value: 'Source', label: 'Kaynak' },
    { value: 'Score', label: 'Puan' },
  ],
  Opportunity: [
    { value: 'Stage', label: 'Aşama' },
    { value: 'Amount', label: 'Tutar' },
    { value: 'Probability', label: 'Olasılık' },
  ],
  // Add more as needed
};

export default function ConfigureTriggerDrawer({
  open,
  step1Data,
  onClose,
  onBack,
  onNext,
}: ConfigureTriggerDrawerProps) {
  const [form] = Form.useForm();
  const [scheduleType, setScheduleType] = useState<'once' | 'recurring' | 'cron'>('recurring');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

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
        scheduleType: values.scheduleType,
      };

      if (values.scheduleType === 'once') {
        config.executeAt = values.executeAt?.toISOString();
      } else if (values.scheduleType === 'recurring') {
        config.recurrence = {
          frequency: values.frequency,
          interval: values.interval || 1,
          daysOfWeek: values.daysOfWeek,
          dayOfMonth: values.dayOfMonth,
          time: values.time?.format('HH:mm') || '09:00',
          timezone: values.timezone || 'Europe/Istanbul',
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
        };
      } else if (values.scheduleType === 'cron') {
        config.cronExpression = values.cronExpression;
      }

      return config;
    }

    // Event-based triggers (OnCreate, OnUpdate, OnStatusChange)
    const eventConfig: EventConfig = {
      type: 'event',
    };

    if (values.conditions && values.conditions.length > 0) {
      eventConfig.conditions = {
        logicalOperator: values.logicalOperator || 'AND',
        conditions: values.conditions,
      };
    }

    return eventConfig;
  };

  const renderScheduledConfig = () => (
    <Card size="small" title="Zamanlama Ayarları">
      <Form.Item
        name="scheduleType"
        label="Zamanlama Tipi"
        initialValue="recurring"
        rules={[{ required: true }]}
      >
        <Radio.Group onChange={(e) => setScheduleType(e.target.value)}>
          <Radio value="once">Bir Kez Çalıştır</Radio>
          <Radio value="recurring">Tekrar Eden</Radio>
          <Radio value="cron">Gelişmiş (Cron Expression)</Radio>
        </Radio.Group>
      </Form.Item>

      {scheduleType === 'once' && (
        <Form.Item
          name="executeAt"
          label="Çalışma Tarihi ve Saati"
          rules={[{ required: true, message: 'Tarih ve saat seçmelisiniz' }]}
        >
          <DatePicker
            showTime
            format="DD.MM.YYYY HH:mm"
            style={{ width: '100%' }}
            placeholder="Tarih ve saat seçin"
          />
        </Form.Item>
      )}

      {scheduleType === 'recurring' && (
        <>
          <Form.Item
            name="frequency"
            label="Frekans"
            initialValue="weekly"
            rules={[{ required: true }]}
          >
            <Select onChange={(value) => setFrequency(value as any)}>
              <Option value="daily">Günlük</Option>
              <Option value="weekly">Haftalık</Option>
              <Option value="monthly">Aylık</Option>
              <Option value="yearly">Yıllık</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="interval"
            label="Aralık"
            initialValue={1}
            rules={[{ required: true }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              addonAfter={
                frequency === 'daily'
                  ? 'gün'
                  : frequency === 'weekly'
                  ? 'hafta'
                  : frequency === 'monthly'
                  ? 'ay'
                  : 'yıl'
              }
            />
          </Form.Item>

          {frequency === 'weekly' && (
            <Form.Item name="daysOfWeek" label="Günler">
              <Checkbox.Group>
                <Checkbox value={1}>Pazartesi</Checkbox>
                <Checkbox value={2}>Salı</Checkbox>
                <Checkbox value={3}>Çarşamba</Checkbox>
                <Checkbox value={4}>Perşembe</Checkbox>
                <Checkbox value={5}>Cuma</Checkbox>
                <Checkbox value={6}>Cumartesi</Checkbox>
                <Checkbox value={0}>Pazar</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          )}

          {frequency === 'monthly' && (
            <Form.Item
              name="dayOfMonth"
              label="Ayın Günü"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={31} placeholder="Örn: 15" />
            </Form.Item>
          )}

          <Form.Item
            name="time"
            label="Saat"
            initialValue={dayjs('09:00', 'HH:mm')}
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="timezone" label="Saat Dilimi" initialValue="Europe/Istanbul">
            <Select>
              <Option value="Europe/Istanbul">İstanbul (GMT+3)</Option>
              <Option value="UTC">UTC (GMT+0)</Option>
              <Option value="Europe/London">Londra (GMT+0)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="startDate" label="Başlangıç Tarihi (Opsiyonel)">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="endDate" label="Bitiş Tarihi (Opsiyonel)">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </>
      )}

      {scheduleType === 'cron' && (
        <>
          <Form.Item
            name="cronExpression"
            label="Cron Expression"
            rules={[
              { required: true, message: 'Cron expression gerekli' },
              {
                pattern: /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
                message: 'Geçersiz cron expression formatı',
              },
            ]}
          >
            <Input placeholder="0 9 * * 1" />
          </Form.Item>

          <Alert
            type="info"
            message="Cron Expression Örnekleri"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li><code>0 9 * * 1</code> - Her Pazartesi 09:00</li>
                <li><code>0 */6 * * *</code> - Her 6 saatte bir</li>
                <li><code>0 0 1 * *</code> - Her ayın 1'inde gece yarısı</li>
                <li><code>*/30 * * * *</code> - Her 30 dakikada bir</li>
              </ul>
            }
          />
        </>
      )}
    </Card>
  );

  const renderEventConfig = () => (
    <Card size="small" title="Koşullar (Opsiyonel)">
      <Alert
        type="info"
        message="Koşul Ekleme"
        description="İsterseniz workflow'un sadece belirli koşullara uyan kayıtlar için çalışmasını sağlayabilirsiniz. Örneğin: 'Amount > 1000' veya 'Status = Qualified'"
        style={{ marginBottom: 16 }}
      />

      <Form.List name="conditions">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Card key={field.key} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'field']}
                    label="Alan"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Alan seçin">
                      {step1Data.entityType &&
                        entityFields[step1Data.entityType]?.map((f) => (
                          <Option key={f.value} value={f.value}>
                            {f.label}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'operator']}
                    label="Operatör"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Operatör seçin">
                      <Option value="equals">Eşittir (=)</Option>
                      <Option value="notEquals">Eşit Değil (≠)</Option>
                      <Option value="greater">Büyüktür (&gt;)</Option>
                      <Option value="greaterOrEquals">Büyük veya Eşit (≥)</Option>
                      <Option value="less">Küçüktür (&lt;)</Option>
                      <Option value="lessOrEquals">Küçük veya Eşit (≤)</Option>
                      <Option value="contains">İçerir</Option>
                      <Option value="isEmpty">Boş</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item {...field} name={[field.name, 'value']} label="Değer">
                    <Input placeholder="Karşılaştırma değeri" />
                  </Form.Item>

                  <Button type="dashed" danger onClick={() => remove(field.name)} block>
                    Koşulu Kaldır
                  </Button>
                </Space>
              </Card>
            ))}

            <Button type="dashed" onClick={() => add()} block>
              + Koşul Ekle
            </Button>

            {fields.length > 1 && (
              <Form.Item name="logicalOperator" label="Koşullar Arası İlişki" initialValue="AND">
                <Radio.Group>
                  <Radio value="AND">VE (AND) - Tüm koşullar sağlanmalı</Radio>
                  <Radio value="OR">VEYA (OR) - En az bir koşul sağlanmalı</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    </Card>
  );

  const renderManualConfig = () => (
    <Alert
      type="info"
      message="Manuel Tetikleyici"
      description="Manuel workflow'lar için ek yapılandırma gerekmez. Bu workflow kullanıcı tarafından manuel olarak başlatılacaktır."
      icon={<ClockCircleOutlined />}
    />
  );

  return (
    <Drawer
      title={
        <Space>
          <ThunderboltOutlined />
          <span>Tetikleyiciyi Yapılandır - Adım 2/3</span>
        </Space>
      }
      width={720}
      open={open}
      onClose={onClose}
      styles={{
        body: { paddingBottom: 80 },
      }}
      footer={
        <div
          style={{
            textAlign: 'right',
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Geri
            </Button>
            <Button onClick={onClose}>İptal</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              icon={<ArrowRightOutlined />}
            >
              İleri: Aksiyonları Ekle
            </Button>
          </Space>
        </div>
      }
    >
      <Alert
        message={`Tetikleyici: ${step1Data.triggerType === 'Manual' ? 'Manuel' : step1Data.triggerType === 'Scheduled' ? 'Zamanlanmış' : 'Olay Bazlı'}`}
        description={`Workflow: ${step1Data.name}`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {step1Data.triggerType === 'Scheduled' && renderScheduledConfig()}
        {step1Data.triggerType === 'Manual' && renderManualConfig()}
        {(step1Data.triggerType === 'OnCreate' ||
          step1Data.triggerType === 'OnUpdate' ||
          step1Data.triggerType === 'OnStatusChange') &&
          renderEventConfig()}
      </Form>
    </Drawer>
  );
}
