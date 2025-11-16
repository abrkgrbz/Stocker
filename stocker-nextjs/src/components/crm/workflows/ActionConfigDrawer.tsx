'use client';

import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Select, Button, Space, Card, Alert } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { WorkflowActionType } from '@/lib/api/services/crm.types';
import type { WorkflowActionConfig } from './ActionBlock';

const { TextArea } = Input;
const { Option } = Select;

interface ActionConfigDrawerProps {
  open: boolean;
  actionType: WorkflowActionType | null;
  initialData?: WorkflowActionConfig;
  onClose: () => void;
  onSave: (actionData: Partial<WorkflowActionConfig>) => void;
}

const actionTypeLabels: Record<WorkflowActionType, string> = {
  SendEmail: 'E-posta Gönder',
  SendSMS: 'SMS Gönder',
  CreateTask: 'Görev Oluştur',
  UpdateField: 'Alan Güncelle',
  SendNotification: 'Bildirim Gönder',
  CallWebhook: 'Webhook Çağır',
  CreateActivity: 'Aktivite Oluştur',
  AssignToUser: 'Kullanıcıya Ata',
};

export default function ActionConfigDrawer({
  open,
  actionType,
  initialData,
  onClose,
  onSave,
}: ActionConfigDrawerProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description,
        delayMinutes: initialData.delayMinutes || 0,
        ...initialData.parameters,
      });
    } else if (open && !initialData) {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    const { name, description, delayMinutes, ...parameters } = values;

    const actionData: Partial<WorkflowActionConfig> = {
      type: actionType!,
      name: name || actionTypeLabels[actionType!],
      description,
      delayMinutes: delayMinutes || 0,
      parameters,
      isEnabled: true,
    };

    onSave(actionData);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const renderActionFields = () => {
    if (!actionType) return null;

    switch (actionType) {
      case 'SendEmail':
        return (
          <>
            <Form.Item
              name="to"
              label="Alıcı E-posta"
              rules={[{ required: true, message: 'E-posta adresi gerekli' }]}
            >
              <Input placeholder="ornek@email.com veya {{Email}} için dinamik alan" />
            </Form.Item>

            <Form.Item
              name="subject"
              label="Konu"
              rules={[{ required: true, message: 'E-posta konusu gerekli' }]}
            >
              <Input placeholder="E-posta konusu" />
            </Form.Item>

            <Form.Item
              name="body"
              label="İçerik"
              rules={[{ required: true, message: 'E-posta içeriği gerekli' }]}
            >
              <TextArea rows={6} placeholder="E-posta içeriği... {{Variable}} kullanabilirsiniz" />
            </Form.Item>
          </>
        );

      case 'SendSMS':
        return (
          <>
            <Form.Item
              name="phoneNumber"
              label="Telefon Numarası"
              rules={[{ required: true, message: 'Telefon numarası gerekli' }]}
            >
              <Input placeholder="+90 5xx xxx xx xx veya {{Phone}} için dinamik alan" />
            </Form.Item>

            <Form.Item
              name="message"
              label="Mesaj"
              rules={[
                { required: true, message: 'SMS mesajı gerekli' },
                { max: 160, message: 'SMS mesajı max 160 karakter olabilir' },
              ]}
            >
              <TextArea rows={4} maxLength={160} showCount placeholder="SMS mesajı (max 160 karakter)" />
            </Form.Item>
          </>
        );

      case 'CreateTask':
        return (
          <>
            <Form.Item
              name="title"
              label="Görev Başlığı"
              rules={[{ required: true, message: 'Görev başlığı gerekli' }]}
            >
              <Input placeholder="Görev başlığı" />
            </Form.Item>

            <Form.Item name="taskDescription" label="Görev Açıklaması">
              <TextArea rows={4} placeholder="Görev detayları..." />
            </Form.Item>

            <Form.Item name="dueInDays" label="Termin (Gün Sonra)" initialValue={7}>
              <InputNumber min={0} max={365} style={{ width: '100%' }} addonAfter="gün sonra" />
            </Form.Item>

            <Form.Item name="assignedToUserId" label="Atanan Kullanıcı ID">
              <Input placeholder="Kullanıcı ID (opsiyonel)" />
            </Form.Item>

            <Form.Item name="priority" label="Öncelik" initialValue="medium">
              <Select>
                <Option value="low">Düşük</Option>
                <Option value="medium">Orta</Option>
                <Option value="high">Yüksek</Option>
                <Option value="urgent">Acil</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'UpdateField':
        return (
          <>
            <Form.Item
              name="fieldName"
              label="Güncellenecek Alan"
              rules={[{ required: true, message: 'Alan adı gerekli' }]}
            >
              <Input placeholder="Örn: Status, Priority, AssignedTo" />
            </Form.Item>

            <Form.Item
              name="fieldValue"
              label="Yeni Değer"
              rules={[{ required: true, message: 'Alan değeri gerekli' }]}
            >
              <Input placeholder="Yeni değer veya {{Variable}}" />
            </Form.Item>
          </>
        );

      case 'SendNotification':
        return (
          <>
            <Form.Item
              name="recipientType"
              label="Alıcı Tipi"
              initialValue="owner"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="owner">Kayıt Sahibi</Option>
                <Option value="assignedUser">Atanan Kullanıcı</Option>
                <Option value="specificUser">Belirli Kullanıcı</Option>
                <Option value="role">Rol Bazlı</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="message"
              label="Bildirim Mesajı"
              rules={[{ required: true, message: 'Bildirim mesajı gerekli' }]}
            >
              <TextArea rows={4} placeholder="Bildirim mesajı..." />
            </Form.Item>
          </>
        );

      case 'CallWebhook':
        return (
          <>
            <Form.Item
              name="url"
              label="Webhook URL"
              rules={[
                { required: true, message: 'Webhook URL gerekli' },
                { type: 'url', message: 'Geçerli bir URL girin' },
              ]}
            >
              <Input placeholder="https://api.example.com/webhook" />
            </Form.Item>

            <Form.Item name="method" label="HTTP Method" initialValue="POST">
              <Select>
                <Option value="POST">POST</Option>
                <Option value="GET">GET</Option>
                <Option value="PUT">PUT</Option>
                <Option value="PATCH">PATCH</Option>
                <Option value="DELETE">DELETE</Option>
              </Select>
            </Form.Item>

            <Form.Item name="headers" label="Headers (JSON)">
              <TextArea
                rows={4}
                placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
              />
            </Form.Item>

            <Form.Item name="body" label="Request Body (JSON)">
              <TextArea rows={6} placeholder='{"recordId": "{{Id}}", "status": "{{Status}}"}' />
            </Form.Item>
          </>
        );

      case 'CreateActivity':
        return (
          <>
            <Form.Item
              name="activityType"
              label="Aktivite Tipi"
              initialValue="Note"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Note">Not</Option>
                <Option value="Call">Arama</Option>
                <Option value="Meeting">Toplantı</Option>
                <Option value="Email">E-posta</Option>
                <Option value="Task">Görev</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="subject"
              label="Konu"
              rules={[{ required: true, message: 'Aktivite konusu gerekli' }]}
            >
              <Input placeholder="Aktivite konusu" />
            </Form.Item>

            <Form.Item name="activityDescription" label="Açıklama">
              <TextArea rows={4} placeholder="Aktivite detayları..." />
            </Form.Item>
          </>
        );

      case 'AssignToUser':
        return (
          <>
            <Form.Item
              name="userId"
              label="Kullanıcı ID"
              rules={[{ required: true, message: 'Kullanıcı ID gerekli' }]}
            >
              <Input placeholder="Atanacak kullanıcının ID'si" />
            </Form.Item>

            <Alert
              type="info"
              message="Dinamik Atama"
              description="{{OwnerId}} veya {{AssignedUserId}} gibi değişkenler kullanabilirsiniz"
              style={{ marginBottom: 16 }}
            />
          </>
        );

      default:
        return (
          <Alert
            type="warning"
            message="Geliştirme Aşamasında"
            description="Bu aksiyon tipi için yapılandırma henüz hazır değil"
          />
        );
    }
  };

  return (
    <Drawer
      title={`${actionType ? actionTypeLabels[actionType] : 'Aksiyon'} - Yapılandırma`}
      width={600}
      open={open}
      onClose={handleClose}
      styles={{
        body: { paddingBottom: 80 },
      }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleClose}>
              İptal
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
              Kaydet
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Common Fields */}
        <Card size="small" title="Genel Bilgiler" style={{ marginBottom: 16 }}>
          <Form.Item name="name" label="Aksiyon Adı (Opsiyonel)">
            <Input placeholder={`Örn: ${actionType ? actionTypeLabels[actionType] : ''} - Müşteriye`} />
          </Form.Item>

          <Form.Item name="description" label="Açıklama (Opsiyonel)">
            <TextArea rows={2} placeholder="Bu aksiyonun ne yaptığını açıklayın" />
          </Form.Item>

          <Form.Item name="delayMinutes" label="Gecikme (Dakika)" initialValue={0}>
            <InputNumber min={0} max={10080} style={{ width: '100%' }} addonAfter="dakika sonra çalıştır" />
          </Form.Item>
        </Card>

        {/* Action-Specific Fields */}
        <Card size="small" title="Aksiyon Detayları">
          {renderActionFields()}
        </Card>

        <Alert
          type="info"
          message="Dinamik Değişkenler"
          description="{{FieldName}} formatında değişkenler kullanarak workflow tetikleyen kaydın alanlarını kullanabilirsiniz. Örn: {{Name}}, {{Email}}, {{Status}}"
          style={{ marginTop: 16 }}
        />
      </Form>
    </Drawer>
  );
}
