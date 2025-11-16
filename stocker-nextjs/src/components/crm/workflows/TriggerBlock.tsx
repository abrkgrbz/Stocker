'use client';

import React from 'react';
import { Card, Space, Tag, Button, Typography, Alert } from 'antd';
import {
  EditOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  FormOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { WorkflowTriggerType } from '@/lib/api/services/crm.types';
import type { TriggerConfiguration } from './ConfigureTriggerDrawer';

const { Text, Title } = Typography;

interface TriggerBlockProps {
  trigger: TriggerConfiguration;
  onEdit: () => void;
}

// Trigger type configurations
const triggerTypeConfig: Record<
  WorkflowTriggerType,
  { label: string; icon: React.ReactNode; color: string; description: string }
> = {
  Manual: {
    label: 'Manuel Tetikleyici',
    icon: <ThunderboltOutlined />,
    color: 'default',
    description: 'Kullanıcı tarafından manuel olarak başlatılır',
  },
  Scheduled: {
    label: 'Zamanlanmış',
    icon: <ClockCircleOutlined />,
    color: 'orange',
    description: 'Belirli zamanlarda otomatik çalışır',
  },
  OnCreate: {
    label: 'Kayıt Oluşturulduğunda',
    icon: <PlusCircleOutlined />,
    color: 'blue',
    description: 'Yeni kayıt oluşturulduğunda tetiklenir',
  },
  OnUpdate: {
    label: 'Kayıt Güncellendiğinde',
    icon: <FormOutlined />,
    color: 'cyan',
    description: 'Kayıt güncellendiğinde tetiklenir',
  },
  OnDelete: {
    label: 'Kayıt Silindiğinde',
    icon: <DeleteOutlined />,
    color: 'red',
    description: 'Kayıt silindiğinde tetiklenir',
  },
  OnStatusChange: {
    label: 'Durum Değiştiğinde',
    icon: <SwapOutlined />,
    color: 'purple',
    description: 'Status alanı değiştiğinde tetiklenir',
  },
};

export default function TriggerBlock({ trigger, onEdit }: TriggerBlockProps) {
  const config = triggerTypeConfig[trigger.type] || {
    label: trigger.type,
    icon: <ThunderboltOutlined />,
    color: 'default',
    description: 'Workflow tetikleyicisi',
  };

  const renderTriggerDetails = () => {
    if (trigger.config.type === 'scheduled') {
      const scheduledConfig = trigger.config;

      if (scheduledConfig.scheduleType === 'once' && scheduledConfig.executeAt) {
        return (
          <Tag icon={<CalendarOutlined />} color="orange">
            {new Date(scheduledConfig.executeAt).toLocaleString('tr-TR')}
          </Tag>
        );
      }

      if (scheduledConfig.scheduleType === 'recurring' && scheduledConfig.recurrence) {
        const { frequency, interval, daysOfWeek, dayOfMonth, time } = scheduledConfig.recurrence;

        let scheduleText = '';
        if (frequency === 'daily') {
          scheduleText = interval === 1 ? 'Her gün' : `Her ${interval} günde bir`;
        } else if (frequency === 'weekly') {
          const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
          const days = daysOfWeek?.map(d => dayNames[d]).join(', ') || 'Belirtilmemiş';
          scheduleText = `Her hafta ${days}`;
        } else if (frequency === 'monthly') {
          scheduleText = `Her ayın ${dayOfMonth}. günü`;
        } else if (frequency === 'yearly') {
          scheduleText = interval === 1 ? 'Her yıl' : `Her ${interval} yılda bir`;
        }

        return (
          <Space direction="vertical" size={0}>
            <Tag icon={<ClockCircleOutlined />} color="orange">
              {scheduleText} - {time}
            </Tag>
            {scheduledConfig.recurrence.timezone && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Saat Dilimi: {scheduledConfig.recurrence.timezone}
              </Text>
            )}
          </Space>
        );
      }

      if (scheduledConfig.scheduleType === 'cron' && scheduledConfig.cronExpression) {
        return (
          <Tag icon={<ClockCircleOutlined />} color="orange">
            Cron: {scheduledConfig.cronExpression}
          </Tag>
        );
      }
    }

    if (trigger.config.type === 'event' && trigger.config.conditions) {
      const conditionsCount = trigger.config.conditions.conditions.length;
      const groupsCount = trigger.config.conditions.groups?.length || 0;

      return (
        <Alert
          type="info"
          message="Koşullu Tetikleme"
          description={`${conditionsCount} koşul${groupsCount > 0 ? ` ve ${groupsCount} grup` : ''} tanımlı`}
          showIcon
          style={{ marginTop: 8 }}
        />
      );
    }

    if (trigger.config.type === 'manual') {
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Bu workflow manuel olarak çalıştırılmalıdır
        </Text>
      );
    }

    return null;
  };

  return (
    <Card
      className="trigger-block"
      style={{
        marginBottom: 16,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
      }}
      size="small"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Space>
          <Tag color="purple" icon={config.icon} style={{ margin: 0 }}>
            TETİKLEYİCİ
          </Tag>
          {trigger.entityType && (
            <Tag color="blue" style={{ margin: 0 }}>
              {trigger.entityType}
            </Tag>
          )}
        </Space>

        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={onEdit}
          style={{ color: 'white' }}
        >
          Düzenle
        </Button>
      </div>

      {/* Title */}
      <Title level={5} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
        {config.label}
      </Title>

      {/* Description */}
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, display: 'block', marginBottom: 8 }}>
        {config.description}
      </Text>

      {/* Trigger Details */}
      <div>{renderTriggerDetails()}</div>
    </Card>
  );
}
