'use client';

import React from 'react';
import { Card, Space, Tag, Button, Tooltip, Typography } from 'antd';
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

const { Text } = Typography;

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
  { label: string; icon: React.ReactNode; color: string }
> = {
  SendEmail: { label: 'E-posta Gönder', icon: <MailOutlined />, color: 'blue' },
  SendSMS: { label: 'SMS Gönder', icon: <MessageOutlined />, color: 'cyan' },
  CreateTask: { label: 'Görev Oluştur', icon: <CheckSquareOutlined />, color: 'green' },
  UpdateField: { label: 'Alan Güncelle', icon: <EditOutlined />, color: 'orange' },
  SendNotification: { label: 'Bildirim Gönder', icon: <BellOutlined />, color: 'purple' },
  CallWebhook: { label: 'Webhook Çağır', icon: <ApiOutlined />, color: 'magenta' },
  CreateActivity: { label: 'Aktivite Oluştur', icon: <FileTextOutlined />, color: 'geekblue' },
  AssignToUser: { label: 'Kullanıcıya Ata', icon: <UserAddOutlined />, color: 'volcano' },
};

export default function ActionBlock({ action, index, onEdit, onDelete, onDuplicate }: ActionBlockProps) {
  const config = actionTypeConfig[action.type] || {
    label: action.type,
    icon: <EditOutlined />,
    color: 'default',
  };

  const renderActionSummary = () => {
    switch (action.type) {
      case 'SendEmail':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Kime: {action.parameters.to || action.parameters.toField || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Konu: {action.parameters.subject || 'Belirtilmemiş'}
            </Text>
          </Space>
        );

      case 'SendSMS':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Telefon: {action.parameters.phoneNumber || action.parameters.phoneField || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mesaj: {action.parameters.message?.substring(0, 50) || 'Belirtilmemiş'}...
            </Text>
          </Space>
        );

      case 'CreateTask':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Görev: {action.parameters.title || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Termin: {action.parameters.dueInDays ? `${action.parameters.dueInDays} gün sonra` : 'Belirtilmemiş'}
            </Text>
          </Space>
        );

      case 'UpdateField':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Alan: {action.parameters.fieldName || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Değer: {action.parameters.fieldValue?.toString() || 'Belirtilmemiş'}
            </Text>
          </Space>
        );

      case 'SendNotification':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Alıcı: {action.parameters.recipientType || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mesaj: {action.parameters.message?.substring(0, 50) || 'Belirtilmemiş'}...
            </Text>
          </Space>
        );

      case 'CallWebhook':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              URL: {action.parameters.url || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Method: {action.parameters.method || 'POST'}
            </Text>
          </Space>
        );

      case 'CreateActivity':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Aktivite Tipi: {action.parameters.activityType || 'Belirtilmemiş'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Konu: {action.parameters.subject || 'Belirtilmemiş'}
            </Text>
          </Space>
        );

      case 'AssignToUser':
        return (
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Kullanıcı: {action.parameters.userId ? `ID: ${action.parameters.userId}` : 'Belirtilmemiş'}
            </Text>
          </Space>
        );

      default:
        return <Text type="secondary" style={{ fontSize: 12 }}>Detay bilgisi yok</Text>;
    }
  };

  return (
    <Card
      className="action-block"
      style={{
        marginBottom: 16,
        opacity: action.isEnabled === false ? 0.6 : 1,
        border: action.isEnabled === false ? '1px dashed #d9d9d9' : undefined,
      }}
      size="small"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Space>
          <Tag color={config.color} icon={config.icon}>
            AKSIYON {index + 1}
          </Tag>
          <Text strong>{action.name || config.label}</Text>
          {action.isEnabled === false && <Tag color="red">Deaktif</Tag>}
          {action.delayMinutes && action.delayMinutes > 0 && (
            <Tag icon={<ClockCircleOutlined />} color="orange">
              {action.delayMinutes} dk gecikme
            </Tag>
          )}
        </Space>

        <Space size="small">
          <Tooltip title="Kopyala">
            <Button type="text" size="small" icon={<CopyOutlined />} onClick={onDuplicate} />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
          </Tooltip>
          <Tooltip title="Sil">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
          </Tooltip>
        </Space>
      </div>

      {/* Description */}
      {action.description && (
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {action.description}
          </Text>
        </div>
      )}

      {/* Action Summary */}
      <div>{renderActionSummary()}</div>
    </Card>
  );
}
