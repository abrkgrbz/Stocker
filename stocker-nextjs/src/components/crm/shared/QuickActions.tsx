'use client';

import React from 'react';
import { Button, Dropdown, MenuProps } from 'antd';
import {
  MoreOutlined,
  EditOutlined,
  CopyOutlined,
  InboxOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

interface QuickActionsProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  extraActions?: MenuProps['items'];
}

export function QuickActions({
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  extraActions = [],
}: QuickActionsProps) {
  const items: MenuProps['items'] = [
    onEdit && {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Düzenle',
      onClick: onEdit,
    },
    onDuplicate && {
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: 'Kopyala',
      onClick: onDuplicate,
    },
    onArchive && {
      key: 'archive',
      icon: <InboxOutlined />,
      label: 'Arşivle',
      onClick: onArchive,
    },
    ...extraActions,
    onDelete && {
      type: 'divider' as const,
    },
    onDelete && {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Sil',
      danger: true,
      onClick: onDelete,
    },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
}
