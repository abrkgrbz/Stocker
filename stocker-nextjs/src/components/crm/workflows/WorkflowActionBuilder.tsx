'use client';

import React from 'react';
import { Card, Select, Input, Space, Button, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { WorkflowActionType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface ActionParameter {
  type: WorkflowActionType;
  parameters: { [key: string]: any };
}

interface WorkflowActionBuilderProps {
  action: ActionParameter;
  index: number;
  onChange: (index: number, action: ActionParameter) => void;
  onRemove: (index: number) => void;
}

export default function WorkflowActionBuilder({
  action,
  index,
  onChange,
  onRemove,
}: WorkflowActionBuilderProps) {
  const handleTypeChange = (newType: WorkflowActionType) => {
    // Reset parameters when type changes
    onChange(index, {
      type: newType,
      parameters: getDefaultParameters(newType),
    });
  };

  const handleParameterChange = (key: string, value: any) => {
    onChange(index, {
      ...action,
      parameters: {
        ...action.parameters,
        [key]: value,
      },
    });
  };

  const getDefaultParameters = (type: WorkflowActionType): { [key: string]: any } => {
    switch (type) {
      case 'SendEmail':
        return { to: '', subject: '', body: '' };
      case 'SendSMS':
        return { to: '', message: '' };
      case 'CreateTask':
        return { title: '', description: '', dueInDays: 1, assignTo: '' };
      case 'UpdateField':
        return { field: '', value: '' };
      case 'SendNotification':
        return { title: '', message: '', type: 'info' };
      case 'CallWebhook':
        return { url: '', method: 'POST', headers: {}, body: {} };
      case 'CreateActivity':
        return { type: 'Note', subject: '', description: '' };
      case 'AssignToUser':
        return { userId: '' };
      default:
        return {};
    }
  };

  const renderParameterFields = () => {
    switch (action.type) {
      case 'SendEmail':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Kime (E-posta Adresi)</Text>
              <Input
                placeholder="{{Customer.Email}} veya email@example.com"
                value={action.parameters.to || ''}
                onChange={(e) => handleParameterChange('to', e.target.value)}
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Değişken kullanmak için: {`{{EntityName.FieldName}}`}
              </Text>
            </div>

            <div>
              <Text strong>Konu</Text>
              <Input
                placeholder="Hoş geldiniz, {{Customer.FirstName}}!"
                value={action.parameters.subject || ''}
                onChange={(e) => handleParameterChange('subject', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>E-posta İçeriği</Text>
              <TextArea
                rows={5}
                placeholder="Merhaba {{Customer.FirstName}},&#10;&#10;Hoş geldiniz..."
                value={action.parameters.body || ''}
                onChange={(e) => handleParameterChange('body', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        );

      case 'SendSMS':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Telefon Numarası</Text>
              <Input
                placeholder="{{Customer.Phone}} veya +90XXXXXXXXXX"
                value={action.parameters.to || ''}
                onChange={(e) => handleParameterChange('to', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Mesaj</Text>
              <TextArea
                rows={4}
                placeholder="Sayın {{Customer.FirstName}}, randevunuz..."
                value={action.parameters.message || ''}
                onChange={(e) => handleParameterChange('message', e.target.value)}
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Maksimum 160 karakter
              </Text>
            </div>
          </Space>
        );

      case 'CreateTask':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Görev Başlığı</Text>
              <Input
                placeholder="{{Customer.Name}} ile takip görüşmesi yap"
                value={action.parameters.title || ''}
                onChange={(e) => handleParameterChange('title', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Açıklama</Text>
              <TextArea
                rows={3}
                placeholder="Görev detayları..."
                value={action.parameters.description || ''}
                onChange={(e) => handleParameterChange('description', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Kaç Gün Sonra (Termin)</Text>
              <Input
                type="number"
                min={0}
                placeholder="1"
                value={action.parameters.dueInDays || 1}
                onChange={(e) => handleParameterChange('dueInDays', parseInt(e.target.value) || 1)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Atanacak Kullanıcı (Opsiyonel)</Text>
              <Input
                placeholder="{{Owner.UserId}} veya kullanıcı ID'si"
                value={action.parameters.assignTo || ''}
                onChange={(e) => handleParameterChange('assignTo', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        );

      case 'UpdateField':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Alan Adı</Text>
              <Input
                placeholder="Status, Priority, AssignedTo vb."
                value={action.parameters.field || ''}
                onChange={(e) => handleParameterChange('field', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Yeni Değer</Text>
              <Input
                placeholder="Qualified, High, {{User.Id}} vb."
                value={action.parameters.value || ''}
                onChange={(e) => handleParameterChange('value', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        );

      case 'SendNotification':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Bildirim Başlığı</Text>
              <Input
                placeholder="Yeni görev atandı"
                value={action.parameters.title || ''}
                onChange={(e) => handleParameterChange('title', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Bildirim Mesajı</Text>
              <TextArea
                rows={3}
                placeholder="{{Customer.Name}} için yeni görev..."
                value={action.parameters.message || ''}
                onChange={(e) => handleParameterChange('message', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Bildirim Tipi</Text>
              <Select
                value={action.parameters.type || 'info'}
                onChange={(value) => handleParameterChange('type', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="info">Bilgi</Option>
                <Option value="success">Başarı</Option>
                <Option value="warning">Uyarı</Option>
                <Option value="error">Hata</Option>
              </Select>
            </div>
          </Space>
        );

      case 'CallWebhook':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Webhook URL</Text>
              <Input
                placeholder="https://api.example.com/webhook"
                value={action.parameters.url || ''}
                onChange={(e) => handleParameterChange('url', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>HTTP Method</Text>
              <Select
                value={action.parameters.method || 'POST'}
                onChange={(value) => handleParameterChange('method', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="PATCH">PATCH</Option>
              </Select>
            </div>

            <div>
              <Text strong>Request Body (JSON)</Text>
              <TextArea
                rows={5}
                placeholder='{"entityId": "{{Entity.Id}}", "action": "created"}'
                value={
                  typeof action.parameters.body === 'string'
                    ? action.parameters.body
                    : JSON.stringify(action.parameters.body || {}, null, 2)
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleParameterChange('body', parsed);
                  } catch {
                    handleParameterChange('body', e.target.value);
                  }
                }}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        );

      case 'CreateActivity':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Aktivite Tipi</Text>
              <Select
                value={action.parameters.type || 'Note'}
                onChange={(value) => handleParameterChange('type', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="Note">Not</Option>
                <Option value="Call">Arama</Option>
                <Option value="Meeting">Toplantı</Option>
                <Option value="Email">E-posta Kaydı</Option>
              </Select>
            </div>

            <div>
              <Text strong>Konu</Text>
              <Input
                placeholder="İlk iletişim notu"
                value={action.parameters.subject || ''}
                onChange={(e) => handleParameterChange('subject', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <Text strong>Açıklama</Text>
              <TextArea
                rows={4}
                placeholder="Aktivite detayları..."
                value={action.parameters.description || ''}
                onChange={(e) => handleParameterChange('description', e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        );

      case 'AssignToUser':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Kullanıcı ID</Text>
              <Input
                placeholder="{{Owner.UserId}} veya kullanıcı ID'si"
                value={action.parameters.userId || ''}
                onChange={(e) => handleParameterChange('userId', e.target.value)}
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Entity'yi bu kullanıcıya atar
              </Text>
            </div>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      size="small"
      title={`Aksiyon ${index + 1}`}
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(index)}
          size="small"
        />
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>Aksiyon Tipi</Text>
          <Select
            value={action.type}
            onChange={handleTypeChange}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Option value="SendEmail">📧 E-posta Gönder</Option>
            <Option value="SendSMS">💬 SMS Gönder</Option>
            <Option value="CreateTask">✅ Görev Oluştur</Option>
            <Option value="UpdateField">✏️ Alan Güncelle</Option>
            <Option value="SendNotification">🔔 Bildirim Gönder</Option>
            <Option value="CallWebhook">🔗 Webhook Çağır</Option>
            <Option value="CreateActivity">📝 Aktivite Oluştur</Option>
            <Option value="AssignToUser">👤 Kullanıcıya Ata</Option>
          </Select>
        </div>

        {renderParameterFields()}
      </Space>
    </Card>
  );
}
