import React from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Empty, Button } from 'antd';

interface EmptyStateProps {
  title?: string;
  description?: string;
  image?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Veri Bulunamadı',
  description = 'Henüz hiç veri eklenmemiş.',
  image,
  actionText = 'Yeni Ekle',
  onAction,
  showAction = false,
  icon = <PlusOutlined />,
}) => {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 500 }}>
              {title}
            </h3>
            <p style={{ color: '#8c8c8c', marginBottom: showAction ? 16 : 0 }}>
              {description}
            </p>
          </div>
        }
      >
        {showAction && onAction && (
          <Button type="primary" icon={icon} onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;