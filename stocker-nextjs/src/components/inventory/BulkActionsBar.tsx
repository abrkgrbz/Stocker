'use client';

import React from 'react';
import { Button, Space, Dropdown, Typography, Progress, Tooltip, Modal, Tag } from 'antd';
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentIcon,
  TableCellsIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { MenuProps } from 'antd';

const { Text } = Typography;

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  confirmTitle?: string;
  confirmContent?: string | ((count: number) => string);
  onClick: () => void | Promise<void>;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  isExecuting?: boolean;
  progress?: number;
  progressTotal?: number;
  // Export options
  onExportSelected?: (format: 'pdf' | 'excel') => void;
  // Slot for custom content
  extraContent?: React.ReactNode;
}

export default function BulkActionsBar({
  selectedCount,
  totalCount,
  actions,
  onClearSelection,
  isExecuting = false,
  progress = 0,
  progressTotal = 0,
  onExportSelected,
  extraContent,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const handleActionClick = async (action: BulkAction) => {
    if (action.confirmTitle || action.confirmContent) {
      const content =
        typeof action.confirmContent === 'function'
          ? action.confirmContent(selectedCount)
          : action.confirmContent || `${selectedCount} kayıt üzerinde bu işlemi gerçekleştirmek istediğinizden emin misiniz?`;

      Modal.confirm({
        title: action.confirmTitle || 'İşlemi Onayla',
        icon: action.danger ? <ExclamationCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />,
        content,
        okText: action.label,
        okType: action.danger ? 'danger' : 'primary',
        cancelText: 'İptal',
        onOk: async () => {
          await action.onClick();
        },
      });
    } else {
      await action.onClick();
    }
  };

  // Group actions into primary (first 3) and secondary (rest)
  const primaryActions = actions.slice(0, 3).filter((a) => !a.disabled);
  const secondaryActions = actions.slice(3).filter((a) => !a.disabled);

  // Export menu items
  const exportMenuItems: MenuProps['items'] = onExportSelected
    ? [
        {
          key: 'pdf',
          icon: <DocumentIcon className="w-4 h-4" />,
          label: 'Seçilenleri PDF İndir',
          onClick: () => onExportSelected('pdf'),
        },
        {
          key: 'excel',
          icon: <TableCellsIcon className="w-4 h-4" />,
          label: 'Seçilenleri Excel İndir',
          onClick: () => onExportSelected('excel'),
        },
      ]
    : [];

  // More actions menu
  const moreMenuItems: MenuProps['items'] = secondaryActions.map((action) => ({
    key: action.key,
    icon: action.icon,
    label: action.label,
    danger: action.danger,
    disabled: action.disabled,
    onClick: () => handleActionClick(action),
  }));

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Selection info */}
        <div className="flex items-center gap-2">
          <Tag color="blue" className="text-sm">
            {selectedCount} / {totalCount}
          </Tag>
          <Text className="text-blue-700">kayıt seçildi</Text>
        </div>

        {/* Progress indicator when executing */}
        {isExecuting && progressTotal > 0 && (
          <div className="flex items-center gap-2 ml-4">
            <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />
            <Progress
              percent={Math.round((progress / progressTotal) * 100)}
              size="small"
              style={{ width: 100 }}
              showInfo={false}
            />
            <Text type="secondary" className="text-xs">
              {progress} / {progressTotal}
            </Text>
          </div>
        )}

        {/* Extra content slot */}
        {extraContent}
      </div>

      <Space>
        {/* Primary actions */}
        {primaryActions.map((action) => (
          <Tooltip key={action.key} title={action.label}>
            <Button
              type={action.danger ? 'default' : 'primary'}
              danger={action.danger}
              icon={action.icon}
              onClick={() => handleActionClick(action)}
              disabled={isExecuting || action.disabled}
              ghost={!action.danger}
            >
              {action.label}
            </Button>
          </Tooltip>
        ))}

        {/* Export dropdown */}
        {onExportSelected && exportMenuItems.length > 0 && (
          <Dropdown menu={{ items: exportMenuItems }} disabled={isExecuting}>
            <Button icon={<ArrowDownTrayIcon className="w-4 h-4" />} disabled={isExecuting}>
              Dışa Aktar
            </Button>
          </Dropdown>
        )}

        {/* More actions dropdown */}
        {moreMenuItems.length > 0 && (
          <Dropdown menu={{ items: moreMenuItems }} disabled={isExecuting}>
            <Button disabled={isExecuting}>Diğer İşlemler</Button>
          </Dropdown>
        )}

        {/* Clear selection */}
        <Button
          type="text"
          icon={<XCircleIcon className="w-4 h-4" />}
          onClick={onClearSelection}
          disabled={isExecuting}
        >
          Seçimi Temizle
        </Button>
      </Space>
    </div>
  );
}

// Predefined bulk actions for common inventory operations
export const createTransferBulkActions = (
  onApprove: () => Promise<void>,
  onReject: () => Promise<void>,
  onShip: () => Promise<void>,
  onCancel: () => Promise<void>
): BulkAction[] => [
  {
    key: 'approve',
    label: 'Onayla',
    icon: <CheckCircleIcon className="w-4 h-4" />,
    confirmTitle: 'Transferleri Onayla',
    confirmContent: (count) => `${count} transfer onaylanacak. Devam etmek istiyor musunuz?`,
    onClick: onApprove,
  },
  {
    key: 'ship',
    label: 'Sevk Et',
    icon: <PaperAirplaneIcon className="w-4 h-4" />,
    confirmTitle: 'Transferleri Sevk Et',
    confirmContent: (count) => `${count} transfer sevk edilecek. Devam etmek istiyor musunuz?`,
    onClick: onShip,
  },
  {
    key: 'reject',
    label: 'Reddet',
    icon: <XCircleIcon className="w-4 h-4" />,
    danger: true,
    confirmTitle: 'Transferleri Reddet',
    confirmContent: (count) => `${count} transfer reddedilecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`,
    onClick: onReject,
  },
  {
    key: 'cancel',
    label: 'İptal Et',
    icon: <TrashIcon className="w-4 h-4" />,
    danger: true,
    confirmTitle: 'Transferleri İptal Et',
    confirmContent: (count) => `${count} transfer iptal edilecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`,
    onClick: onCancel,
  },
];

export const createCountBulkActions = (
  onStart: () => Promise<void>,
  onComplete: () => Promise<void>,
  onApprove: () => Promise<void>,
  onCancel: () => Promise<void>
): BulkAction[] => [
  {
    key: 'start',
    label: 'Başlat',
    icon: <CheckCircleIcon className="w-4 h-4" />,
    confirmTitle: 'Sayımları Başlat',
    confirmContent: (count) => `${count} sayım başlatılacak. Devam etmek istiyor musunuz?`,
    onClick: onStart,
  },
  {
    key: 'complete',
    label: 'Tamamla',
    icon: <CheckCircleIcon className="w-4 h-4" />,
    confirmTitle: 'Sayımları Tamamla',
    confirmContent: (count) => `${count} sayım tamamlanacak. Devam etmek istiyor musunuz?`,
    onClick: onComplete,
  },
  {
    key: 'approve',
    label: 'Onayla',
    icon: <CheckCircleIcon className="w-4 h-4" />,
    confirmTitle: 'Sayımları Onayla',
    confirmContent: (count) => `${count} sayım onaylanacak ve stok miktarları güncellenecek. Devam etmek istiyor musunuz?`,
    onClick: onApprove,
  },
  {
    key: 'cancel',
    label: 'İptal Et',
    icon: <TrashIcon className="w-4 h-4" />,
    danger: true,
    confirmTitle: 'Sayımları İptal Et',
    confirmContent: (count) => `${count} sayım iptal edilecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`,
    onClick: onCancel,
  },
];
