'use client';

import { Space, Button, Dropdown, MenuProps } from 'antd';
import {
  ReloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';

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
      icon: <EditOutlined />,
      onClick: onEdit,
    },
    onDelete && {
      key: 'delete',
      label: 'Kaldır',
      icon: <DeleteOutlined />,
      onClick: onDelete,
      danger: true,
    },
  ].filter(Boolean);

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">{title}</span>
      <Space size="small">
        {showRefresh && onRefresh && (
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
        )}
        {showFullscreen && onFullscreen && (
          <Button
            type="text"
            size="small"
            icon={<FullscreenOutlined />}
            onClick={onFullscreen}
          />
        )}
        {showSettings && onSettings && (
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined />}
            onClick={onSettings}
          />
        )}
        {showMore && menuItems.length > 0 && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        )}
      </Space>
    </div>
  );
}
