'use client';

import React from 'react';
import {
  EditOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  FormOutlined,
  SwapOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  FilterOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { WorkflowTriggerType } from '@/lib/api/services/crm.types';
import type { TriggerConfiguration } from './ConfigureTriggerDrawer';

interface TriggerBlockProps {
  trigger: TriggerConfiguration;
  onEdit: () => void;
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

export default function TriggerBlock({ trigger, onEdit }: TriggerBlockProps) {
  const config = triggerTypeConfig[trigger.type] || {
    label: trigger.type,
    icon: <ThunderboltOutlined />,
    color: '#64748b',
    bgColor: 'bg-slate-100',
    description: 'Workflow tetikleyicisi',
  };

  const renderTriggerDetails = () => {
    if (trigger.config.type === 'scheduled') {
      const scheduledConfig = trigger.config;

      if (scheduledConfig.scheduleType === 'once' && scheduledConfig.executeAt) {
        return (
          <div className="flex items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
              <CalendarOutlined className="text-[10px]" />
              {new Date(scheduledConfig.executeAt).toLocaleString('tr-TR')}
            </div>
          </div>
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
          <div className="mt-3 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
              <ClockCircleOutlined className="text-[10px]" />
              {scheduleText} - {time}
            </div>
            {scheduledConfig.recurrence.timezone && (
              <p className="text-[11px] text-slate-400">
                Saat Dilimi: {scheduledConfig.recurrence.timezone}
              </p>
            )}
          </div>
        );
      }

      if (scheduledConfig.scheduleType === 'cron' && scheduledConfig.cronExpression) {
        return (
          <div className="flex items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
              <ClockCircleOutlined className="text-[10px]" />
              Cron: {scheduledConfig.cronExpression}
            </div>
          </div>
        );
      }
    }

    if (trigger.config.type === 'event' && trigger.config.conditions) {
      const conditionsCount = trigger.config.conditions.conditions.length;
      const groupsCount = trigger.config.conditions.groups?.length || 0;

      return (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-blue-500 text-sm" />
            <span className="text-sm font-medium text-blue-700">Koşullu Tetikleme</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {conditionsCount} koşul{groupsCount > 0 ? ` ve ${groupsCount} grup` : ''} tanımlı
          </p>
        </div>
      );
    }

    if (trigger.config.type === 'manual') {
      return (
        <p className="text-xs text-slate-400 mt-3">
          Bu workflow manuel olarak çalıştırılmalıdır
        </p>
      );
    }

    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-md text-xs font-semibold uppercase tracking-wide">
            <ThunderboltOutlined className="text-[10px]" />
            Tetikleyici
          </span>
          {trigger.entityType && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs font-medium">
              {trigger.entityType}
            </span>
          )}
        </div>

        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <EditOutlined className="text-[11px]" />
          Düzenle
        </button>
      </div>

      {/* Icon & Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
          <span style={{ color: config.color }} className="text-lg">
            {config.icon}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white">
          {config.label}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-white/70 mb-1">
        {config.description}
      </p>

      {/* Trigger Details */}
      <div>{renderTriggerDetails()}</div>
    </div>
  );
}
