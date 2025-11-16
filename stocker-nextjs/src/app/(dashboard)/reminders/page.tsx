'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Space,
  Typography,
  Badge,
  Tabs,
  Empty,
  Dropdown,
  message,
  Modal,
  InputNumber,
} from 'antd';
import {
  ClockCircleOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  SnippetsOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { remindersApi } from '@/lib/api/reminders';
import { ReminderDrawer } from '@/components/reminders/ReminderDrawer';
import type {
  Reminder,
  ReminderType,
  ReminderStatus,
  RecurrenceType,
  CreateReminderRequest,
  UpdateReminderRequest,
} from '@/types/reminder';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;

const getReminderTypeColor = (type: ReminderType): string => {
  const colors: Record<number, string> = {
    0: 'default', // General
    1: 'blue', // Task
    2: 'purple', // Meeting
    3: 'cyan', // FollowUp
    4: 'magenta', // Birthday
    5: 'orange', // ContractRenewal
    6: 'red', // PaymentDue
  };
  return colors[type] || 'default';
};

const getReminderTypeLabel = (type: ReminderType): string => {
  const labels: Record<number, string> = {
    0: 'General',
    1: 'Task',
    2: 'Meeting',
    3: 'Follow Up',
    4: 'Birthday',
    5: 'Contract Renewal',
    6: 'Payment Due',
  };
  return labels[type] || 'Unknown';
};

const getReminderStatusColor = (status: ReminderStatus): string => {
  const colors: Record<number, string> = {
    0: 'processing', // Pending
    1: 'warning', // Snoozed
    2: 'error', // Triggered
    3: 'success', // Completed
    4: 'default', // Dismissed
  };
  return colors[status] || 'default';
};

const getReminderStatusLabel = (status: ReminderStatus): string => {
  const labels: Record<number, string> = {
    0: 'Pending',
    1: 'Snoozed',
    2: 'Triggered',
    3: 'Completed',
    4: 'Dismissed',
  };
  return labels[status] || 'Unknown';
};

const getRecurrenceLabel = (recurrenceType: RecurrenceType): string | null => {
  const labels: Record<number, string> = {
    0: null,
    1: 'Daily',
    2: 'Weekly',
    3: 'Monthly',
    4: 'Yearly',
  };
  return labels[recurrenceType] || null;
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | undefined>();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadReminders();
  }, [activeTab]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const pendingOnly = activeTab === 'pending' ? true : activeTab === 'completed' ? false : undefined;
      const response = await remindersApi.getReminders({ pendingOnly });

      // Filter by status for completed tab
      let filteredReminders = response.reminders;
      if (activeTab === 'completed') {
        filteredReminders = response.reminders.filter((r) => r.status === 3); // Completed
      }

      setReminders(filteredReminders);
    } catch (error) {
      message.error('Failed to load reminders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setDrawerMode('create');
    setSelectedReminder(undefined);
    setDrawerOpen(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setDrawerMode('edit');
    setSelectedReminder(reminder);
    setDrawerOpen(true);
  };

  const handleSubmit = async (data: CreateReminderRequest | UpdateReminderRequest) => {
    try {
      if (drawerMode === 'create') {
        await remindersApi.createReminder(data as CreateReminderRequest);
        message.success('Reminder created successfully');
      } else if (selectedReminder) {
        await remindersApi.updateReminder(selectedReminder.id, data as UpdateReminderRequest);
        message.success('Reminder updated successfully');
      }
      await loadReminders();
    } catch (error) {
      message.error(`Failed to ${drawerMode} reminder`);
      throw error;
    }
  };

  const handleSnooze = (reminder: Reminder) => {
    Modal.confirm({
      title: 'Snooze Reminder',
      content: (
        <div>
          <p>Snooze for how many minutes?</p>
          <InputNumber
            id="snooze-minutes"
            min={5}
            max={1440}
            defaultValue={30}
            addonAfter="minutes"
            style={{ width: '100%' }}
          />
        </div>
      ),
      onOk: async () => {
        const input = document.getElementById('snooze-minutes') as HTMLInputElement;
        const minutes = parseInt(input?.value || '30');
        try {
          await remindersApi.snoozeReminder(reminder.id, minutes);
          message.success(`Reminder snoozed for ${minutes} minutes`);
          await loadReminders();
        } catch (error) {
          message.error('Failed to snooze reminder');
        }
      },
    });
  };

  const handleComplete = async (reminder: Reminder) => {
    try {
      await remindersApi.completeReminder(reminder.id);
      message.success('Reminder completed');
      await loadReminders();
    } catch (error) {
      message.error('Failed to complete reminder');
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Modal.confirm({
      title: 'Delete Reminder',
      content: 'Are you sure you want to delete this reminder?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await remindersApi.deleteReminder(reminder.id);
          message.success('Reminder deleted');
          await loadReminders();
        } catch (error) {
          message.error('Failed to delete reminder');
        }
      },
    });
  };

  const renderReminderItem = (reminder: Reminder) => {
    const isPast = dayjs(reminder.remindAt).isBefore(dayjs());
    const recurrenceLabel = getRecurrenceLabel(reminder.recurrenceType);

    return (
      <List.Item
        key={reminder.id}
        actions={[
          <Dropdown
            key="actions"
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  onClick: () => handleEdit(reminder),
                },
                {
                  key: 'snooze',
                  label: 'Snooze',
                  onClick: () => handleSnooze(reminder),
                  disabled: reminder.status === 3 || reminder.status === 4, // Completed or Dismissed
                },
                {
                  key: 'complete',
                  label: 'Complete',
                  onClick: () => handleComplete(reminder),
                  disabled: reminder.status === 3, // Already completed
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  danger: true,
                  onClick: () => handleDelete(reminder),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Badge dot={isPast && reminder.status === 0} status="error">
              <ClockCircleOutlined style={{ fontSize: 24, color: isPast ? '#ff4d4f' : '#1890ff' }} />
            </Badge>
          }
          title={
            <Space>
              <Text strong>{reminder.title}</Text>
              <Tag color={getReminderTypeColor(reminder.type)}>
                {getReminderTypeLabel(reminder.type)}
              </Tag>
              <Tag color={getReminderStatusColor(reminder.status)}>
                {getReminderStatusLabel(reminder.status)}
              </Tag>
              {recurrenceLabel && (
                <Tag icon={<SyncOutlined />} color="blue">
                  {recurrenceLabel}
                </Tag>
              )}
            </Space>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {reminder.description && <Text type="secondary">{reminder.description}</Text>}
              <Space>
                <ClockCircleOutlined />
                <Text type={isPast ? 'danger' : 'secondary'}>
                  {dayjs(reminder.remindAt).format('DD MMM YYYY HH:mm')}
                  <Text type="secondary"> ({dayjs(reminder.remindAt).fromNow()})</Text>
                </Text>
              </Space>
              {reminder.status === 1 && reminder.snoozedUntil && (
                <Space>
                  <ClockCircleOutlined />
                  <Text type="warning">
                    Snoozed until {dayjs(reminder.snoozedUntil).format('HH:mm')}
                  </Text>
                </Space>
              )}
              {reminder.dueDate && (
                <Space>
                  <SnippetsOutlined />
                  <Text type="secondary">Due: {dayjs(reminder.dueDate).format('DD MMM YYYY')}</Text>
                </Space>
              )}
              {(reminder.meetingStartTime || reminder.meetingEndTime) && (
                <Space>
                  <SnippetsOutlined />
                  <Text type="secondary">
                    Meeting: {dayjs(reminder.meetingStartTime).format('HH:mm')} -{' '}
                    {dayjs(reminder.meetingEndTime).format('HH:mm')}
                  </Text>
                </Space>
              )}
              <Space size="small">
                {reminder.sendEmail && (
                  <Tag icon={<MailOutlined />} color="blue">
                    Email
                  </Tag>
                )}
                {reminder.sendPush && (
                  <Tag icon={<MobileOutlined />} color="green">
                    Push
                  </Tag>
                )}
                {reminder.sendInApp && (
                  <Tag icon={<BellOutlined />} color="purple">
                    In-App
                  </Tag>
                )}
              </Space>
            </Space>
          }
        />
      </List.Item>
    );
  };

  const pendingCount = reminders.filter((r) => r.status === 0 || r.status === 1).length;
  const completedCount = reminders.filter((r) => r.status === 3).length;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={2}>
            <BellOutlined /> Reminders
          </Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadReminders} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              New Reminder
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'all' | 'pending' | 'completed')}
        >
          <Tabs.TabPane
            tab={
              <span>
                All <Badge count={reminders.length} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="all"
          >
            <List
              loading={loading}
              dataSource={reminders}
              renderItem={renderReminderItem}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No reminders yet"
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                      Create First Reminder
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                Pending <Badge count={pendingCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="pending"
          >
            <List
              loading={loading}
              dataSource={reminders}
              renderItem={renderReminderItem}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No pending reminders"
                  />
                ),
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                Completed <Badge count={completedCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="completed"
          >
            <List
              loading={loading}
              dataSource={reminders}
              renderItem={renderReminderItem}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No completed reminders"
                  />
                ),
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <ReminderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        reminder={selectedReminder}
        mode={drawerMode}
      />
    </div>
  );
}
