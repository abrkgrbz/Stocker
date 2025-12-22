'use client';

import React, { useState, useMemo } from 'react';
import { Drawer } from 'antd';
import {
  MailOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  EditOutlined,
  BellOutlined,
  ApiOutlined,
  FileTextOutlined,
  UserAddOutlined,
  SearchOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { WorkflowActionType } from '@/lib/api/services/crm.types';

interface ActionSelectorDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (actionType: WorkflowActionType) => void;
}

interface ActionTypeCard {
  type: WorkflowActionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  category: 'communication' | 'task' | 'data' | 'integration';
}

const actionTypes: ActionTypeCard[] = [
  {
    type: 'SendEmail',
    title: 'E-posta Gönder',
    description: 'Otomatik e-posta bildirimi gönder',
    icon: <MailOutlined />,
    iconColor: '#3b82f6',
    bgColor: 'bg-blue-50',
    category: 'communication',
  },
  {
    type: 'SendSMS',
    title: 'SMS Gönder',
    description: 'SMS bildirimi gönder',
    icon: <MessageOutlined />,
    iconColor: '#14b8a6',
    bgColor: 'bg-teal-50',
    category: 'communication',
  },
  {
    type: 'SendNotification',
    title: 'Bildirim Gönder',
    description: 'Uygulama içi bildirim gönder',
    icon: <BellOutlined />,
    iconColor: '#8b5cf6',
    bgColor: 'bg-violet-50',
    category: 'communication',
  },
  {
    type: 'CreateTask',
    title: 'Görev Oluştur',
    description: 'Otomatik görev oluştur ve ata',
    icon: <CheckSquareOutlined />,
    iconColor: '#22c55e',
    bgColor: 'bg-green-50',
    category: 'task',
  },
  {
    type: 'CreateActivity',
    title: 'Aktivite Oluştur',
    description: 'Yeni aktivite kaydı oluştur',
    icon: <FileTextOutlined />,
    iconColor: '#6366f1',
    bgColor: 'bg-indigo-50',
    category: 'task',
  },
  {
    type: 'AssignToUser',
    title: 'Kullanıcıya Ata',
    description: 'Kaydı belirli kullanıcıya ata',
    icon: <UserAddOutlined />,
    iconColor: '#f97316',
    bgColor: 'bg-orange-50',
    category: 'task',
  },
  {
    type: 'UpdateField',
    title: 'Alan Güncelle',
    description: 'Kayıt alanını otomatik güncelle',
    icon: <EditOutlined />,
    iconColor: '#eab308',
    bgColor: 'bg-yellow-50',
    category: 'data',
  },
  {
    type: 'CallWebhook',
    title: 'Webhook Çağır',
    description: 'Harici API/Webhook çağrısı yap',
    icon: <ApiOutlined />,
    iconColor: '#ec4899',
    bgColor: 'bg-pink-50',
    category: 'integration',
  },
];

const categoryLabels: Record<string, { label: string; icon: string }> = {
  communication: { label: 'İletişim', icon: '📢' },
  task: { label: 'Görev Yönetimi', icon: '📋' },
  data: { label: 'Veri İşlemleri', icon: '💾' },
  integration: { label: 'Entegrasyon', icon: '🔗' },
};

export default function ActionSelectorDrawer({ open, onClose, onSelect }: ActionSelectorDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (actionType: WorkflowActionType) => {
    onSelect(actionType);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  // Filter actions based on search query
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return actionTypes;

    const query = searchQuery.toLowerCase().trim();
    return actionTypes.filter(
      (action) =>
        action.title.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        categoryLabels[action.category].label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered actions by category
  const groupedActions = useMemo(() => {
    return filteredActions.reduce((acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = [];
      }
      acc[action.category].push(action);
      return acc;
    }, {} as Record<string, ActionTypeCard[]>);
  }, [filteredActions]);

  return (
    <Drawer
      title={null}
      width={560}
      open={open}
      onClose={handleClose}
      closable={false}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Aksiyon Seçin</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Workflow'a eklenecek aksiyonu seçin
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pb-4">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Aksiyon ara... (örn: mail, sms, görev)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <CloseOutlined className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="p-6 space-y-6">
        {Object.keys(groupedActions).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <SearchOutlined className="text-2xl text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Sonuç bulunamadı</p>
            <p className="text-sm text-slate-400 mt-1">
              "{searchQuery}" ile eşleşen aksiyon yok
            </p>
          </div>
        ) : (
          Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{categoryLabels[category].icon}</span>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {categoryLabels[category].label}
                </h3>
                <span className="text-xs text-slate-400">({actions.length})</span>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => handleSelect(action.type)}
                    className="group relative bg-white border border-slate-200 rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:border-slate-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
                    >
                      <span style={{ color: action.iconColor }} className="text-xl">
                        {action.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <h4 className="font-medium text-slate-900 group-hover:text-slate-900">
                      {action.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {action.description}
                    </p>

                    {/* Hover Arrow Indicator */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
}
