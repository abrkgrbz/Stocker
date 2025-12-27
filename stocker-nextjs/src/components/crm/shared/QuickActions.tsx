'use client';

import React from 'react';
import { Button, Dropdown, MenuProps } from 'antd';
import {
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

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
      icon: <PencilSquareIcon className="w-4 h-4" />,
      label: 'Düzenle',
      onClick: onEdit,
    },
    onDuplicate && {
      key: 'duplicate',
      icon: <DocumentDuplicateIcon className="w-4 h-4" />,
      label: 'Kopyala',
      onClick: onDuplicate,
    },
    onArchive && {
      key: 'archive',
      icon: <ArchiveBoxIcon className="w-4 h-4" />,
      label: 'Arşivle',
      onClick: onArchive,
    },
    ...extraActions,
    onDelete && {
      type: 'divider' as const,
    },
    onDelete && {
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: onDelete,
    },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
    </Dropdown>
  );
}
