'use client';

import React from 'react';
import { Space, Button, Dropdown, message } from 'antd';
import { DeleteOutlined, TagOutlined, StarOutlined, SwapOutlined, CloseOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkScoreAssign: () => void;
  onBulkTagAssign: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  onBulkScoreAssign,
  onBulkTagAssign,
}) => {
  const statusMenuItems: MenuProps['items'] = [
    { key: 'NewLead', label: 'Yeni Lead' },
    { key: 'Contacted', label: 'İletişim Kuruldu' },
    { key: 'Qualified', label: 'Nitelikli' },
    { key: 'MeetingScheduled', label: 'Görüşme Ayarlandı' },
    { key: 'Proposal', label: 'Teklif Verildi' },
    { key: 'Negotiation', label: 'Müzakere' },
    { key: 'Won', label: 'Kazanıldı' },
    { key: 'Lost', label: 'Kaybedildi' },
  ];

  const handleStatusChange: MenuProps['onClick'] = ({ key }) => {
    onBulkStatusChange(key);
  };

  const handleDelete = () => {
    if (selectedCount > 0) {
      message.warning('Toplu silme işlemi için onay modalı eklenecek');
      onBulkDelete();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClearSelection}
          className="text-gray-600 hover:text-gray-800"
        />
        <span className="font-medium text-blue-700">
          {selectedCount} {selectedCount === 1 ? 'Müşteri' : 'Müşteri'} Seçildi
        </span>
      </div>

      <Space size="small">
        <Dropdown
          menu={{ items: statusMenuItems, onClick: handleStatusChange }}
          placement="bottomRight"
        >
          <Button icon={<SwapOutlined />}>
            Durum Değiştir
          </Button>
        </Dropdown>

        <Button
          icon={<StarOutlined />}
          onClick={onBulkScoreAssign}
        >
          Puan Ata
        </Button>

        <Button
          icon={<TagOutlined />}
          onClick={onBulkTagAssign}
        >
          Etiketle
        </Button>

        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
        >
          Sil
        </Button>
      </Space>
    </div>
  );
};

export default BulkActionsToolbar;
