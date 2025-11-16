'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Space,
  Checkbox,
  InputNumber,
  Row,
  Col,
  Divider,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  ReminderType,
  RecurrenceType,
  type Reminder,
  type CreateReminderRequest,
  type UpdateReminderRequest,
  type RecurrencePattern,
} from '@/types/reminder';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface ReminderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReminderRequest | UpdateReminderRequest) => Promise<void>;
  reminder?: Reminder;
  mode: 'create' | 'edit';
}

const weekDayOptions = [
  { label: 'Pazar', value: 0 },
  { label: 'Pazartesi', value: 1 },
  { label: 'Salı', value: 2 },
  { label: 'Çarşamba', value: 3 },
  { label: 'Perşembe', value: 4 },
  { label: 'Cuma', value: 5 },
  { label: 'Cumartesi', value: 6 },
];

export const ReminderDrawer: React.FC<ReminderDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  reminder,
  mode,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(RecurrenceType.None);
  const [reminderType, setReminderType] = useState<ReminderType>(ReminderType.General);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && reminder) {
        // Parse recurrence pattern
        let recurrencePattern: RecurrencePattern | undefined;
        if (reminder.recurrencePattern) {
          try {
            recurrencePattern = JSON.parse(reminder.recurrencePattern);
          } catch (e) {
            console.error('Failed to parse recurrence pattern:', e);
          }
        }

        form.setFieldsValue({
          title: reminder.title,
          description: reminder.description,
          type: reminder.type,
          remindAt: reminder.remindAt ? dayjs(reminder.remindAt) : undefined,
          sendEmail: reminder.sendEmail,
          sendPush: reminder.sendPush,
          sendInApp: reminder.sendInApp,
          recurrenceType: reminder.recurrenceType,
          recurrenceEndDate: reminder.recurrenceEndDate ? dayjs(reminder.recurrenceEndDate) : undefined,
          recurrenceInterval: recurrencePattern?.interval || 1,
          weekDays: recurrencePattern?.weekDays || [],
          dayOfMonth: recurrencePattern?.dayOfMonth || 1,
          dueDate: reminder.dueDate ? dayjs(reminder.dueDate) : undefined,
          meetingStartTime: reminder.meetingStartTime ? dayjs(reminder.meetingStartTime) : undefined,
          meetingEndTime: reminder.meetingEndTime ? dayjs(reminder.meetingEndTime) : undefined,
        });
        setRecurrenceType(reminder.recurrenceType);
        setReminderType(reminder.type);
      } else {
        form.resetFields();
        setRecurrenceType(RecurrenceType.None);
        setReminderType(ReminderType.General);
      }
    }
  }, [open, mode, reminder, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Build recurrence pattern
      let recurrencePattern: string | undefined;
      if (values.recurrenceType !== RecurrenceType.None) {
        const pattern: RecurrencePattern = {
          interval: values.recurrenceInterval || 1,
        };

        if (values.recurrenceType === RecurrenceType.Weekly && values.weekDays) {
          pattern.weekDays = values.weekDays;
        }

        if (values.recurrenceType === RecurrenceType.Monthly && values.dayOfMonth) {
          pattern.dayOfMonth = values.dayOfMonth;
        }

        recurrencePattern = JSON.stringify(pattern);
      }

      const data: CreateReminderRequest | UpdateReminderRequest = {
        title: values.title,
        description: values.description,
        type: values.type,
        remindAt: values.remindAt.toISOString(),
        sendEmail: values.sendEmail || false,
        sendPush: values.sendPush ?? true,
        sendInApp: values.sendInApp ?? true,
        recurrenceType: values.recurrenceType || RecurrenceType.None,
        recurrencePattern,
        recurrenceEndDate: values.recurrenceEndDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        meetingStartTime: values.meetingStartTime?.toISOString(),
        meetingEndTime: values.meetingEndTime?.toISOString(),
      };

      await onSubmit(data);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Failed to submit reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecurrenceFields = () => {
    if (recurrenceType === RecurrenceType.None) return null;

    return (
      <>
        <Form.Item
          label="Tekrar Aralığı"
          name="recurrenceInterval"
          rules={[{ required: true, message: 'Lütfen aralık giriniz' }]}
          initialValue={1}
        >
          <InputNumber
            min={1}
            max={100}
            addonAfter={
              recurrenceType === RecurrenceType.Daily
                ? 'gün'
                : recurrenceType === RecurrenceType.Weekly
                ? 'hafta'
                : recurrenceType === RecurrenceType.Monthly
                ? 'ay'
                : 'yıl'
            }
            style={{ width: '100%' }}
          />
        </Form.Item>

        {recurrenceType === RecurrenceType.Weekly && (
          <Form.Item
            label="Tekrar Günleri"
            name="weekDays"
            rules={[{ required: true, message: 'Lütfen en az bir gün seçiniz' }]}
          >
            <Checkbox.Group options={weekDayOptions} />
          </Form.Item>
        )}

        {recurrenceType === RecurrenceType.Monthly && (
          <Form.Item
            label="Ayın Günü"
            name="dayOfMonth"
            rules={[{ required: true, message: 'Lütfen gün seçiniz' }]}
            initialValue={1}
          >
            <InputNumber min={1} max={31} style={{ width: '100%' }} />
          </Form.Item>
        )}

        <Form.Item label="Bitiş Tarihi" name="recurrenceEndDate">
          <DatePicker style={{ width: '100%' }} showTime placeholder="Bitiş tarihi seçiniz" />
        </Form.Item>
      </>
    );
  };

  const renderTypeSpecificFields = () => {
    if (reminderType === ReminderType.Task) {
      return (
        <Form.Item label="Teslim Tarihi" name="dueDate">
          <DatePicker style={{ width: '100%' }} showTime placeholder="Teslim tarihi seçiniz" />
        </Form.Item>
      );
    }

    if (reminderType === ReminderType.Meeting) {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Toplantı Başlangıç"
                name="meetingStartTime"
                rules={[{ required: true, message: 'Lütfen başlangıç saati seçiniz' }]}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" placeholder="Başlangıç" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Toplantı Bitiş"
                name="meetingEndTime"
                rules={[{ required: true, message: 'Lütfen bitiş saati seçiniz' }]}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" placeholder="Bitiş" />
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    }

    return null;
  };

  return (
    <Drawer
      title={mode === 'create' ? 'Hatırlatıcı Oluştur' : 'Hatırlatıcı Düzenle'}
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>İptal</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {mode === 'create' ? 'Oluştur' : 'Güncelle'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Başlık"
          name="title"
          rules={[{ required: true, message: 'Lütfen başlık giriniz' }]}
        >
          <Input placeholder="Hatırlatıcı başlığı giriniz" />
        </Form.Item>

        <Form.Item label="Açıklama" name="description">
          <TextArea rows={3} placeholder="Açıklama giriniz (isteğe bağlı)" />
        </Form.Item>

        <Form.Item
          label="Tür"
          name="type"
          rules={[{ required: true, message: 'Lütfen tür seçiniz' }]}
          initialValue={ReminderType.General}
        >
          <Select onChange={(value) => setReminderType(value)} placeholder="Tür seçiniz">
            <Option value={ReminderType.General}>Genel</Option>
            <Option value={ReminderType.Task}>Görev</Option>
            <Option value={ReminderType.Meeting}>Toplantı</Option>
            <Option value={ReminderType.FollowUp}>Takip</Option>
            <Option value={ReminderType.Birthday}>Doğum Günü</Option>
            <Option value={ReminderType.ContractRenewal}>Sözleşme Yenileme</Option>
            <Option value={ReminderType.PaymentDue}>Ödeme Vadesi</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Hatırlatma Zamanı"
          name="remindAt"
          rules={[{ required: true, message: 'Lütfen hatırlatma zamanı seçiniz' }]}
        >
          <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" placeholder="Tarih ve saat seçiniz" />
        </Form.Item>

        {renderTypeSpecificFields()}

        <Divider>Tekrarlama Ayarları</Divider>

        <Form.Item
          label="Tekrarlama"
          name="recurrenceType"
          initialValue={RecurrenceType.None}
        >
          <Select onChange={(value) => setRecurrenceType(value)} placeholder="Tekrarlama seçiniz">
            <Option value={RecurrenceType.None}>Yok (Tek seferlik)</Option>
            <Option value={RecurrenceType.Daily}>Günlük</Option>
            <Option value={RecurrenceType.Weekly}>Haftalık</Option>
            <Option value={RecurrenceType.Monthly}>Aylık</Option>
            <Option value={RecurrenceType.Yearly}>Yıllık</Option>
          </Select>
        </Form.Item>

        {renderRecurrenceFields()}

        <Divider>Bildirim Ayarları</Divider>

        <Form.Item name="sendEmail" valuePropName="checked">
          <Checkbox>E-posta Gönder</Checkbox>
        </Form.Item>

        <Form.Item name="sendPush" valuePropName="checked" initialValue={true}>
          <Checkbox>Mobil Bildirim Gönder</Checkbox>
        </Form.Item>

        <Form.Item name="sendInApp" valuePropName="checked" initialValue={true}>
          <Checkbox>Uygulama İçi Bildirim Gönder</Checkbox>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
