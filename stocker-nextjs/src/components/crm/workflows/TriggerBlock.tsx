'use client';

import React from 'react';
import {
  PencilIcon,
  ClockIcon,
  BoltIcon,
  CalendarIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  FunnelIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
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
    icon: <BoltIcon className="w-5 h-5" />,
    color: '#64748b',
    bgColor: 'bg-slate-100',
    description: 'Kullanıcı tarafından manuel olarak başlatılır',
  },
  Scheduled: {
    label: 'Zamanlanmış',
    icon: <ClockIcon className="w-5 h-5" />,
    color: '#f97316',
    bgColor: 'bg-orange-100',
    description: 'Belirli zamanlarda otomatik çalışır',
  },
  EntityCreated: {
    label: 'Kayıt Oluşturulduğunda',
    icon: <PlusCircleIcon className="w-5 h-5" />,
    color: '#22c55e',
    bgColor: 'bg-green-100',
    description: 'Yeni kayıt oluşturulduğunda tetiklenir',
  },
  EntityUpdated: {
    label: 'Kayıt Güncellendiğinde',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    description: 'Kayıt güncellendiğinde tetiklenir',
  },
  StatusChanged: {
    label: 'Durum Değiştiğinde',
    icon: <ArrowsRightLeftIcon className="w-5 h-5" />,
    color: '#8b5cf6',
    bgColor: 'bg-violet-100',
    description: 'Status alanı değiştiğinde tetiklenir',
  },
  DealStageChanged: {
    label: 'Anlaşma Aşaması Değiştiğinde',
    icon: <RocketLaunchIcon className="w-5 h-5" />,
    color: '#6366f1',
    bgColor: 'bg-indigo-100',
    description: 'Anlaşma aşaması değiştiğinde tetiklenir',
  },
  FieldCondition: {
    label: 'Alan Koşulu Sağlandığında',
    icon: <FunnelIcon className="w-5 h-5" />,
    color: '#ef4444',
    bgColor: 'bg-red-100',
    description: 'Belirli alan koşulu sağlandığında tetiklenir',
  },
  AmountThreshold: {
    label: 'Tutar Eşiği Aşıldığında',
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
    color: '#eab308',
    bgColor: 'bg-yellow-100',
    description: 'Belirli tutar eşiği aşıldığında tetiklenir',
  },
  DueDateEvent: {
    label: 'Vade Tarihi Yaklaştığında',
    icon: <CalendarDaysIcon className="w-5 h-5" />,
    color: '#ec4899',
    bgColor: 'bg-pink-100',
    description: 'Vade tarihi yaklaştığında veya geçtiğinde tetiklenir',
  },
};

export default function TriggerBlock({ trigger, onEdit }: TriggerBlockProps) {
  const config = triggerTypeConfig[trigger.type] || {
    label: trigger.type,
    icon: <BoltIcon className="w-5 h-5" />,
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
              <CalendarIcon className="w-3 h-3" />
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
              <ClockIcon className="w-3 h-3" />
              {scheduleText} - {time}
            </div>
            {scheduledConfig.recurrence.timezone && (
              <p className="text-[11px] text-slate-500">
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
              <ClockIcon className="w-3 h-3" />
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
            <FunnelIcon className="w-4 h-4 text-blue-500" />
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-md text-xs font-semibold uppercase tracking-wide">
            <BoltIcon className="w-3 h-3" />
            Tetikleyici
          </span>
          {trigger.entityType && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
              {trigger.entityType}
            </span>
          )}
        </div>

        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <PencilIcon className="w-3.5 h-3.5" />
          Düzenle
        </button>
      </div>

      {/* Icon & Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
          <span style={{ color: config.color }}>
            {config.icon}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          {config.label}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-1">
        {config.description}
      </p>

      {/* Trigger Details */}
      <div>{renderTriggerDetails()}</div>
    </div>
  );
}
