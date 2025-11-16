'use client';

import React from 'react';
import { Drawer, Row, Col, Card, Typography, Space } from 'antd';
import {
  MailOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  EditOutlined,
  BellOutlined,
  ApiOutlined,
  FileTextOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { WorkflowActionType } from '@/lib/api/services/crm.types';

const { Title, Text } = Typography;

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
  color: string;
  category: 'communication' | 'task' | 'data' | 'integration';
}

const actionTypes: ActionTypeCard[] = [
  {
    type: 'SendEmail',
    title: 'E-posta Gönder',
    description: 'Otomatik e-posta bildirimi gönder',
    icon: <MailOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    color: '#e6f7ff',
    category: 'communication',
  },
  {
    type: 'SendSMS',
    title: 'SMS Gönder',
    description: 'SMS bildirimi gönder',
    icon: <MessageOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
    color: '#e6fffb',
    category: 'communication',
  },
  {
    type: 'SendNotification',
    title: 'Bildirim Gönder',
    description: 'Uygulama içi bildirim gönder',
    icon: <BellOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
    color: '#f9f0ff',
    category: 'communication',
  },
  {
    type: 'CreateTask',
    title: 'Görev Oluştur',
    description: 'Otomatik görev oluştur ve ata',
    icon: <CheckSquareOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    color: '#f6ffed',
    category: 'task',
  },
  {
    type: 'CreateActivity',
    title: 'Aktivite Oluştur',
    description: 'Yeni aktivite kaydı oluştur',
    icon: <FileTextOutlined style={{ fontSize: 32, color: '#2f54eb' }} />,
    color: '#f0f5ff',
    category: 'task',
  },
  {
    type: 'AssignToUser',
    title: 'Kullanıcıya Ata',
    description: 'Kaydı belirli kullanıcıya ata',
    icon: <UserAddOutlined style={{ fontSize: 32, color: '#fa541c' }} />,
    color: '#fff2e8',
    category: 'task',
  },
  {
    type: 'UpdateField',
    title: 'Alan Güncelle',
    description: 'Kayıt alanını otomatik güncelle',
    icon: <EditOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    color: '#fff7e6',
    category: 'data',
  },
  {
    type: 'CallWebhook',
    title: 'Webhook Çağır',
    description: 'Harici API/Webhook çağrısı yap',
    icon: <ApiOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
    color: '#fff0f6',
    category: 'integration',
  },
];

const categoryLabels: Record<string, string> = {
  communication: '📢 İletişim',
  task: '📋 Görev Yönetimi',
  data: '💾 Veri İşlemleri',
  integration: '🔗 Entegrasyon',
};

export default function ActionSelectorDrawer({ open, onClose, onSelect }: ActionSelectorDrawerProps) {
  const handleSelect = (actionType: WorkflowActionType) => {
    onSelect(actionType);
    onClose();
  };

  // Group by category
  const groupedActions = actionTypes.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionTypeCard[]>);

  return (
    <Drawer
      title="Aksiyon Seçin"
      width={720}
      open={open}
      onClose={onClose}
      styles={{
        body: { paddingBottom: 80 },
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {Object.entries(groupedActions).map(([category, actions]) => (
          <div key={category}>
            <Title level={5} style={{ marginBottom: 16 }}>
              {categoryLabels[category]}
            </Title>

            <Row gutter={[16, 16]}>
              {actions.map((action) => (
                <Col span={12} key={action.type}>
                  <Card
                    hoverable
                    onClick={() => handleSelect(action.type)}
                    style={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: '1px solid #f0f0f0',
                    }}
                    styles={{
                      body: {
                        background: action.color,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        minHeight: 140,
                        justifyContent: 'center',
                      },
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>{action.icon}</div>
                    <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                      {action.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {action.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Space>
    </Drawer>
  );
}
