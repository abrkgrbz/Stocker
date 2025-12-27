'use client';

import { Space, Button, Dropdown, MenuProps } from 'antd';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export interface WidgetHeaderProps {
  title: string;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onSettings?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showRefresh?: boolean;
  showFullscreen?: boolean;
  showSettings?: boolean;
  showMore?: boolean;
}

export function WidgetHeader({
  title,
  onRefresh,
  onFullscreen,
  onSettings,
  onEdit,
  onDelete,
  showRefresh = true,
  showFullscreen = true,
  showSettings = true,
  showMore = true,
}: WidgetHeaderProps) {
  const menuItems: MenuProps['items'] = [
    onEdit && {
      key: 'edit',
      label: 'Düzenle',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: onEdit,
    },
    onDelete && {
      key: 'delete',
      label: 'Kaldır',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: onDelete,
      danger: true,
    },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">{title}</span>
      <Space size="small">
        {showRefresh && onRefresh && (
          <Button
            type="text"
            size="small"
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={onRefresh}
          />
        )}
        {showFullscreen && onFullscreen && (
          <Button
            type="text"
            size="small"
            icon={<ArrowsPointingOutIcon className="w-4 h-4" />}
            onClick={onFullscreen}
          />
        )}
        {showSettings && onSettings && (
          <Button
            type="text"
            size="small"
            icon={<Cog6ToothIcon className="w-4 h-4" />}
            onClick={onSettings}
          />
        )}
        {showMore && menuItems && menuItems.length > 0 && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
            />
          </Dropdown>
        )}
      </Space>
    </div>
  );
}
