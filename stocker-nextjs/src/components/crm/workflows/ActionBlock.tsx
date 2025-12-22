'use client';

import React from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  MailOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  BellOutlined,
  ApiOutlined,
  FileTextOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { WorkflowActionType } from '@/lib/api/services/crm.types';

export interface WorkflowActionConfig {
  id?: string;
  type: WorkflowActionType;
  name: string;
  description?: string;
  parameters: Record<string, any>;
  delayMinutes?: number;
  isEnabled?: boolean;
  stepOrder: number;
}

interface ActionBlockProps {
  action: WorkflowActionConfig;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

// Action type configurations
const actionTypeConfig: Record<
  WorkflowActionType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  SendEmail: { label: 'E-posta Gönder', icon: <MailOutlined />, color: '#3b82f6', bgColor: 'bg-blue-100' },
  SendSMS: { label: 'SMS Gönder', icon: <MessageOutlined />, color: '#14b8a6', bgColor: 'bg-teal-100' },
  CreateTask: { label: 'Görev Oluştur', icon: <CheckSquareOutlined />, color: '#22c55e', bgColor: 'bg-green-100' },
  UpdateField: { label: 'Alan Güncelle', icon: <EditOutlined />, color: '#eab308', bgColor: 'bg-yellow-100' },
  SendNotification: { label: 'Bildirim Gönder', icon: <BellOutlined />, color: '#8b5cf6', bgColor: 'bg-violet-100' },
  CallWebhook: { label: 'Webhook Çağır', icon: <ApiOutlined />, color: '#ec4899', bgColor: 'bg-pink-100' },
  CreateActivity: { label: 'Aktivite Oluştur', icon: <FileTextOutlined />, color: '#6366f1', bgColor: 'bg-indigo-100' },
  AssignToUser: { label: 'Kullanıcıya Ata', icon: <UserAddOutlined />, color: '#f97316', bgColor: 'bg-orange-100' },
};

export default function ActionBlock({ action, index, onEdit, onDelete, onDuplicate }: ActionBlockProps) {
  const config = actionTypeConfig[action.type] || {
    label: action.type,
    icon: <EditOutlined />,
    color: '#64748b',
    bgColor: 'bg-slate-100',
  };

  const isDisabled = action.isEnabled === false;

  const renderActionSummary = () => {
    const summaryItems: { label: string; value: string }[] = [];

    switch (action.type) {
      case 'SendEmail':
        summaryItems.push(
          { label: 'Kime', value: action.parameters.to || action.parameters.toField || 'Belirtilmemiş' },
          { label: 'Konu', value: action.parameters.subject || 'Belirtilmemiş' }
        );
        break;

      case 'SendSMS':
        summaryItems.push(
          { label: 'Telefon', value: action.parameters.phoneNumber || action.parameters.phoneField || 'Belirtilmemiş' },
          { label: 'Mesaj', value: action.parameters.message?.substring(0, 40) + '...' || 'Belirtilmemiş' }
        );
        break;

      case 'CreateTask':
        summaryItems.push(
          { label: 'Görev', value: action.parameters.title || 'Belirtilmemiş' },
          { label: 'Termin', value: action.parameters.dueInDays ? `${action.parameters.dueInDays} gün sonra` : 'Belirtilmemiş' }
        );
        break;

      case 'UpdateField':
        summaryItems.push(
          { label: 'Alan', value: action.parameters.fieldName || 'Belirtilmemiş' },
          { label: 'Değer', value: action.parameters.fieldValue?.toString() || 'Belirtilmemiş' }
        );
        break;

      case 'SendNotification':
        summaryItems.push(
          { label: 'Alıcı', value: action.parameters.recipientType || 'Belirtilmemiş' },
          { label: 'Mesaj', value: action.parameters.message?.substring(0, 40) + '...' || 'Belirtilmemiş' }
        );
        break;

      case 'CallWebhook':
        summaryItems.push(
          { label: 'URL', value: action.parameters.url || 'Belirtilmemiş' },
          { label: 'Method', value: action.parameters.method || 'POST' }
        );
        break;

      case 'CreateActivity':
        summaryItems.push(
          { label: 'Tip', value: action.parameters.activityType || 'Belirtilmemiş' },
          { label: 'Konu', value: action.parameters.subject || 'Belirtilmemiş' }
        );
        break;

      case 'AssignToUser':
        summaryItems.push(
          { label: 'Kullanıcı', value: action.parameters.userId ? `ID: ${action.parameters.userId}` : 'Belirtilmemiş' }
        );
        break;

      default:
        return <p className="text-xs text-slate-400">Detay bilgisi yok</p>;
    }

    return (
      <div className="space-y-1">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 min-w-[50px]">{item.label}:</span>
            <span className="text-slate-600 truncate">{item.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`
        group relative bg-white border rounded-xl p-4 transition-all duration-200
        ${isDisabled
          ? 'opacity-60 border-dashed border-slate-300'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Step Number Badge */}
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: config.color }}
          >
            {index + 1}
          </span>

          {/* Action Type Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium`}
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            {config.icon}
            <span className="hidden sm:inline">{config.label}</span>
          </span>

          {/* Disabled Badge */}
          {isDisabled && (
            <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-xs font-medium">
              Deaktif
            </span>
          )}

          {/* Delay Badge */}
          {action.delayMinutes && action.delayMinutes > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-md text-xs font-medium">
              <ClockCircleOutlined className="text-[10px]" />
              {action.delayMinutes} dk
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kopyala"
          >
            <CopyOutlined className="text-sm" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Düzenle"
          >
            <EditOutlined className="text-sm" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sil"
          >
            <DeleteOutlined className="text-sm" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span style={{ color: config.color }} className="text-base">
            {config.icon}
          </span>
        </div>
        <h4 className="font-medium text-slate-900 truncate">
          {action.name || config.label}
        </h4>
      </div>

      {/* Description */}
      {action.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {action.description}
        </p>
      )}

      {/* Action Summary */}
      <div className="pt-3 border-t border-slate-100">
        {renderActionSummary()}
      </div>
    </div>
  );
}
