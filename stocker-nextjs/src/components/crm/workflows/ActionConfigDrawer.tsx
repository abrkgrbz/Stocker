'use client';

import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Select } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  BellOutlined,
  ApiOutlined,
  FileTextOutlined,
  UserAddOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { WorkflowActionType } from '@/lib/api/services/crm.types';
import type { WorkflowActionConfig } from './ActionBlock';

const { TextArea } = Input;

interface ActionConfigDrawerProps {
  open: boolean;
  actionType: WorkflowActionType | null;
  initialData?: WorkflowActionConfig;
  onClose: () => void;
  onSave: (actionData: Partial<WorkflowActionConfig>) => void;
}

const actionTypeConfig: Record<WorkflowActionType, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  SendEmail: { label: 'E-posta Gönder', icon: <MailOutlined />, color: '#3b82f6', bgColor: 'bg-blue-100' },
  SendSMS: { label: 'SMS Gönder', icon: <MessageOutlined />, color: '#14b8a6', bgColor: 'bg-teal-100' },
  CreateTask: { label: 'Görev Oluştur', icon: <CheckSquareOutlined />, color: '#22c55e', bgColor: 'bg-green-100' },
  UpdateField: { label: 'Alan Güncelle', icon: <EditOutlined />, color: '#eab308', bgColor: 'bg-yellow-100' },
  SendNotification: { label: 'Bildirim Gönder', icon: <BellOutlined />, color: '#8b5cf6', bgColor: 'bg-violet-100' },
  CallWebhook: { label: 'Webhook Çağır', icon: <ApiOutlined />, color: '#ec4899', bgColor: 'bg-pink-100' },
  CreateActivity: { label: 'Aktivite Oluştur', icon: <FileTextOutlined />, color: '#6366f1', bgColor: 'bg-indigo-100' },
  AssignToUser: { label: 'Kullanıcıya Ata', icon: <UserAddOutlined />, color: '#f97316', bgColor: 'bg-orange-100' },
};

export default function ActionConfigDrawer({
  open,
  actionType,
  initialData,
  onClose,
  onSave,
}: ActionConfigDrawerProps) {
  const [form] = Form.useForm();
  const config = actionType ? actionTypeConfig[actionType] : null;

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
      name: name || (actionType ? actionTypeConfig[actionType].label : ''),
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

    const inputClassName = "!bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white";
    const selectClassName = "[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white";

    switch (actionType) {
      case 'SendEmail':
        return (
          <>
            <Form.Item
              name="to"
              label={<span className="text-sm font-medium text-slate-700">Alıcı E-posta</span>}
              rules={[{ required: true, message: 'E-posta adresi gerekli' }]}
            >
              <Input placeholder="ornek@email.com veya {{Email}} için dinamik alan" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="subject"
              label={<span className="text-sm font-medium text-slate-700">Konu</span>}
              rules={[{ required: true, message: 'E-posta konusu gerekli' }]}
            >
              <Input placeholder="E-posta konusu" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="body"
              label={<span className="text-sm font-medium text-slate-700">İçerik</span>}
              rules={[{ required: true, message: 'E-posta içeriği gerekli' }]}
            >
              <TextArea rows={6} placeholder="E-posta içeriği... {{Variable}} kullanabilirsiniz" className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'SendSMS':
        return (
          <>
            <Form.Item
              name="phoneNumber"
              label={<span className="text-sm font-medium text-slate-700">Telefon Numarası</span>}
              rules={[{ required: true, message: 'Telefon numarası gerekli' }]}
            >
              <Input placeholder="+90 5xx xxx xx xx veya {{Phone}} için dinamik alan" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="message"
              label={<span className="text-sm font-medium text-slate-700">Mesaj</span>}
              rules={[
                { required: true, message: 'SMS mesajı gerekli' },
                { max: 160, message: 'SMS mesajı max 160 karakter olabilir' },
              ]}
            >
              <TextArea rows={4} maxLength={160} showCount placeholder="SMS mesajı (max 160 karakter)" className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'CreateTask':
        return (
          <>
            <Form.Item
              name="title"
              label={<span className="text-sm font-medium text-slate-700">Görev Başlığı</span>}
              rules={[{ required: true, message: 'Görev başlığı gerekli' }]}
            >
              <Input placeholder="Görev başlığı" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="taskDescription"
              label={<span className="text-sm font-medium text-slate-700">Görev Açıklaması</span>}
            >
              <TextArea rows={4} placeholder="Görev detayları..." className={inputClassName} />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="dueInDays"
                label={<span className="text-sm font-medium text-slate-700">Termin (Gün)</span>}
                initialValue={7}
              >
                <InputNumber min={0} max={365} className={`w-full ${inputClassName}`} addonAfter="gün" />
              </Form.Item>

              <Form.Item
                name="priority"
                label={<span className="text-sm font-medium text-slate-700">Öncelik</span>}
                initialValue="medium"
              >
                <Select className={selectClassName}>
                  <Select.Option value="low">Düşük</Select.Option>
                  <Select.Option value="medium">Orta</Select.Option>
                  <Select.Option value="high">Yüksek</Select.Option>
                  <Select.Option value="urgent">Acil</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="assignedToUserId"
              label={<span className="text-sm font-medium text-slate-700">Atanan Kullanıcı ID</span>}
            >
              <Input placeholder="Kullanıcı ID (opsiyonel)" className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'UpdateField':
        return (
          <>
            <Form.Item
              name="fieldName"
              label={<span className="text-sm font-medium text-slate-700">Güncellenecek Alan</span>}
              rules={[{ required: true, message: 'Alan adı gerekli' }]}
            >
              <Input placeholder="Örn: Status, Priority, AssignedTo" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="fieldValue"
              label={<span className="text-sm font-medium text-slate-700">Yeni Değer</span>}
              rules={[{ required: true, message: 'Alan değeri gerekli' }]}
            >
              <Input placeholder="Yeni değer veya {{Variable}}" className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'SendNotification':
        return (
          <>
            <Form.Item
              name="recipientType"
              label={<span className="text-sm font-medium text-slate-700">Alıcı Tipi</span>}
              initialValue="owner"
              rules={[{ required: true }]}
            >
              <Select className={selectClassName}>
                <Select.Option value="owner">Kayıt Sahibi</Select.Option>
                <Select.Option value="assignedUser">Atanan Kullanıcı</Select.Option>
                <Select.Option value="specificUser">Belirli Kullanıcı</Select.Option>
                <Select.Option value="role">Rol Bazlı</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="message"
              label={<span className="text-sm font-medium text-slate-700">Bildirim Mesajı</span>}
              rules={[{ required: true, message: 'Bildirim mesajı gerekli' }]}
            >
              <TextArea rows={4} placeholder="Bildirim mesajı..." className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'CallWebhook':
        return (
          <>
            <Form.Item
              name="url"
              label={<span className="text-sm font-medium text-slate-700">Webhook URL</span>}
              rules={[
                { required: true, message: 'Webhook URL gerekli' },
                { type: 'url', message: 'Geçerli bir URL girin' },
              ]}
            >
              <Input placeholder="https://api.example.com/webhook" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="method"
              label={<span className="text-sm font-medium text-slate-700">HTTP Method</span>}
              initialValue="POST"
            >
              <Select className={selectClassName}>
                <Select.Option value="POST">POST</Select.Option>
                <Select.Option value="GET">GET</Select.Option>
                <Select.Option value="PUT">PUT</Select.Option>
                <Select.Option value="PATCH">PATCH</Select.Option>
                <Select.Option value="DELETE">DELETE</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="headers"
              label={<span className="text-sm font-medium text-slate-700">Headers (JSON)</span>}
            >
              <TextArea
                rows={4}
                placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                className={inputClassName}
              />
            </Form.Item>

            <Form.Item
              name="body"
              label={<span className="text-sm font-medium text-slate-700">Request Body (JSON)</span>}
            >
              <TextArea rows={6} placeholder='{"recordId": "{{Id}}", "status": "{{Status}}"}' className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'CreateActivity':
        return (
          <>
            <Form.Item
              name="activityType"
              label={<span className="text-sm font-medium text-slate-700">Aktivite Tipi</span>}
              initialValue="Note"
              rules={[{ required: true }]}
            >
              <Select className={selectClassName}>
                <Select.Option value="Note">Not</Select.Option>
                <Select.Option value="Call">Arama</Select.Option>
                <Select.Option value="Meeting">Toplantı</Select.Option>
                <Select.Option value="Email">E-posta</Select.Option>
                <Select.Option value="Task">Görev</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="subject"
              label={<span className="text-sm font-medium text-slate-700">Konu</span>}
              rules={[{ required: true, message: 'Aktivite konusu gerekli' }]}
            >
              <Input placeholder="Aktivite konusu" className={inputClassName} />
            </Form.Item>

            <Form.Item
              name="activityDescription"
              label={<span className="text-sm font-medium text-slate-700">Açıklama</span>}
            >
              <TextArea rows={4} placeholder="Aktivite detayları..." className={inputClassName} />
            </Form.Item>
          </>
        );

      case 'AssignToUser':
        return (
          <>
            <Form.Item
              name="userId"
              label={<span className="text-sm font-medium text-slate-700">Kullanıcı ID</span>}
              rules={[{ required: true, message: 'Kullanıcı ID gerekli' }]}
            >
              <Input placeholder="Atanacak kullanıcının ID'si" className={inputClassName} />
            </Form.Item>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start gap-2">
                <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Dinamik Atama</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {"{{OwnerId}} veya {{AssignedUserId}} gibi değişkenler kullanabilirsiniz"}
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="flex items-start gap-2">
              <InfoCircleOutlined className="text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">Geliştirme Aşamasında</p>
                <p className="text-xs text-amber-600 mt-1">
                  Bu aksiyon tipi için yapılandırma henüz hazır değil
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Drawer
      title={null}
      width={560}
      open={open}
      onClose={handleClose}
      closable={false}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {config && (
              <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                <span style={{ color: config.color }} className="text-lg">
                  {config.icon}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {config?.label || 'Aksiyon'} Yapılandırma
              </h2>
              <p className="text-sm text-slate-500">
                Aksiyon detaylarını yapılandırın
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* General Info Section */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Genel Bilgiler
            </h3>

            <Form.Item
              name="name"
              label={<span className="text-sm font-medium text-slate-700">Aksiyon Adı (Opsiyonel)</span>}
            >
              <Input
                placeholder={`Örn: ${config?.label || ''} - Müşteriye`}
                className="!bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-sm font-medium text-slate-700">Açıklama (Opsiyonel)</span>}
            >
              <TextArea
                rows={2}
                placeholder="Bu aksiyonun ne yaptığını açıklayın"
                className="!bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white"
              />
            </Form.Item>

            <Form.Item
              name="delayMinutes"
              label={<span className="text-sm font-medium text-slate-700">Gecikme (Dakika)</span>}
              initialValue={0}
            >
              <InputNumber
                min={0}
                max={10080}
                className="w-full !bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white"
                addonAfter="dakika sonra çalıştır"
              />
            </Form.Item>
          </div>

          {/* Action Details Section */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Aksiyon Detayları
            </h3>
            {renderActionFields()}
          </div>

          {/* Info Alert */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-2">
              <InfoCircleOutlined className="text-slate-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Dinamik Değişkenler</p>
                <p className="text-xs text-slate-500 mt-1">
                  {"{{FieldName}} formatında değişkenler kullanarak workflow tetikleyen kaydın alanlarını kullanabilirsiniz. Örn: {{Name}}, {{Email}}, {{Status}}"}
                </p>
              </div>
            </div>
          </div>
        </Form>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <CloseOutlined className="text-xs" />
            İptal
          </button>
          <button
            onClick={() => form.submit()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <SaveOutlined className="text-xs" />
            Kaydet
          </button>
        </div>
      </div>
    </Drawer>
  );
}
