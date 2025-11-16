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
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
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
          label="Repeat Interval"
          name="recurrenceInterval"
          rules={[{ required: true, message: 'Please enter interval' }]}
          initialValue={1}
        >
          <InputNumber
            min={1}
            max={100}
            addonAfter={
              recurrenceType === RecurrenceType.Daily
                ? 'day(s)'
                : recurrenceType === RecurrenceType.Weekly
                ? 'week(s)'
                : recurrenceType === RecurrenceType.Monthly
                ? 'month(s)'
                : 'year(s)'
            }
            style={{ width: '100%' }}
          />
        </Form.Item>

        {recurrenceType === RecurrenceType.Weekly && (
          <Form.Item
            label="Repeat On"
            name="weekDays"
            rules={[{ required: true, message: 'Please select at least one day' }]}
          >
            <Checkbox.Group options={weekDayOptions} />
          </Form.Item>
        )}

        {recurrenceType === RecurrenceType.Monthly && (
          <Form.Item
            label="Day of Month"
            name="dayOfMonth"
            rules={[{ required: true, message: 'Please select day' }]}
            initialValue={1}
          >
            <InputNumber min={1} max={31} style={{ width: '100%' }} />
          </Form.Item>
        )}

        <Form.Item label="End Date" name="recurrenceEndDate">
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      </>
    );
  };

  const renderTypeSpecificFields = () => {
    if (reminderType === ReminderType.Task) {
      return (
        <Form.Item label="Due Date" name="dueDate">
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      );
    }

    if (reminderType === ReminderType.Meeting) {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Meeting Start"
                name="meetingStartTime"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Meeting End"
                name="meetingEndTime"
                rules={[{ required: true, message: 'Please select end time' }]}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
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
      title={mode === 'create' ? 'Create Reminder' : 'Edit Reminder'}
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="Enter reminder title" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Enter description (optional)" />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select type' }]}
          initialValue={ReminderType.General}
        >
          <Select onChange={(value) => setReminderType(value)}>
            <Option value={ReminderType.General}>General</Option>
            <Option value={ReminderType.Task}>Task</Option>
            <Option value={ReminderType.Meeting}>Meeting</Option>
            <Option value={ReminderType.FollowUp}>Follow Up</Option>
            <Option value={ReminderType.Birthday}>Birthday</Option>
            <Option value={ReminderType.ContractRenewal}>Contract Renewal</Option>
            <Option value={ReminderType.PaymentDue}>Payment Due</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Remind At"
          name="remindAt"
          rules={[{ required: true, message: 'Please select remind time' }]}
        >
          <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        {renderTypeSpecificFields()}

        <Divider>Recurrence Settings</Divider>

        <Form.Item
          label="Recurrence"
          name="recurrenceType"
          initialValue={RecurrenceType.None}
        >
          <Select onChange={(value) => setRecurrenceType(value)}>
            <Option value={RecurrenceType.None}>None (One-time)</Option>
            <Option value={RecurrenceType.Daily}>Daily</Option>
            <Option value={RecurrenceType.Weekly}>Weekly</Option>
            <Option value={RecurrenceType.Monthly}>Monthly</Option>
            <Option value={RecurrenceType.Yearly}>Yearly</Option>
          </Select>
        </Form.Item>

        {renderRecurrenceFields()}

        <Divider>Notification Settings</Divider>

        <Form.Item name="sendEmail" valuePropName="checked">
          <Checkbox>Send Email</Checkbox>
        </Form.Item>

        <Form.Item name="sendPush" valuePropName="checked" initialValue={true}>
          <Checkbox>Send Push Notification</Checkbox>
        </Form.Item>

        <Form.Item name="sendInApp" valuePropName="checked" initialValue={true}>
          <Checkbox>Send In-App Notification</Checkbox>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
