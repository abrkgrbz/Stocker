'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  Input,
  Select,
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
  SearchOutlined,
  FilterOutlined,
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
    0: 'Genel',
    1: 'Görev',
    2: 'Toplantı',
    3: 'Takip',
    4: 'Doğum Günü',
    5: 'Sözleşme Yenileme',
    6: 'Ödeme Vadesi',
  };
  return labels[type] || 'Bilinmiyor';
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
    0: 'Beklemede',
    1: 'Ertelendi',
    2: 'Tetiklendi',
    3: 'Tamamlandı',
    4: 'Kapatıldı',
  };
  return labels[status] || 'Bilinmiyor';
};

const getRecurrenceLabel = (recurrenceType: RecurrenceType): string | null => {
  const labels: Record<number, string> = {
    0: null,
    1: 'Günlük',
    2: 'Haftalık',
    3: 'Aylık',
    4: 'Yıllık',
  };
  return labels[recurrenceType] || null;
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | undefined>();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<ReminderType | 'all'>('all');

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
      setTotalCount(response.totalCount);
    } catch (error) {
      message.error('Hatırlatıcılar yüklenemedi');
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
        message.success('Hatırlatıcı başarıyla oluşturuldu');
      } else if (selectedReminder) {
        await remindersApi.updateReminder(selectedReminder.id, data as UpdateReminderRequest);
        message.success('Hatırlatıcı başarıyla güncellendi');
      }
      await loadReminders();
    } catch (error) {
      message.error(`Hatırlatıcı ${drawerMode === 'create' ? 'oluşturulamadı' : 'güncellenemedi'}`);
      throw error;
    }
  };

  const handleSnooze = (reminder: Reminder) => {
    Modal.confirm({
      title: 'Hatırlatıcıyı Ertele',
      content: (
        <div>
          <p>Kaç dakika ertelemek istersiniz?</p>
          <InputNumber
            id="snooze-minutes"
            min={5}
            max={1440}
            defaultValue={30}
            addonAfter="dakika"
            style={{ width: '100%' }}
          />
        </div>
      ),
      okText: 'Ertele',
      cancelText: 'İptal',
      onOk: async () => {
        const input = document.getElementById('snooze-minutes') as HTMLInputElement;
        const minutes = parseInt(input?.value || '30');
        try {
          await remindersApi.snoozeReminder(reminder.id, minutes);
          message.success(`Hatırlatıcı ${minutes} dakika ertelendi`);
          await loadReminders();
        } catch (error) {
          message.error('Hatırlatıcı ertelenemedi');
        }
      },
    });
  };

  const handleComplete = async (reminder: Reminder) => {
    try {
      await remindersApi.completeReminder(reminder.id);
      message.success('Hatırlatıcı tamamlandı');
      await loadReminders();
    } catch (error) {
      message.error('Hatırlatıcı tamamlanamadı');
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Modal.confirm({
      title: 'Hatırlatıcıyı Sil',
      content: 'Bu hatırlatıcıyı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await remindersApi.deleteReminder(reminder.id);
          message.success('Hatırlatıcı silindi');
          await loadReminders();
        } catch (error) {
          message.error('Hatırlatıcı silinemedi');
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
                  label: 'Düzenle',
                  onClick: () => handleEdit(reminder),
                },
                {
                  key: 'snooze',
                  label: 'Ertele',
                  onClick: () => handleSnooze(reminder),
                  disabled: reminder.status === 3 || reminder.status === 4, // Completed or Dismissed
                },
                {
                  key: 'complete',
                  label: 'Tamamla',
                  onClick: () => handleComplete(reminder),
                  disabled: reminder.status === 3, // Already completed
                },
                {
                  key: 'delete',
                  label: 'Sil',
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
        <Space align="start" style={{ width: '100%' }}>
          <Checkbox
            checked={reminder.status === 3}
            disabled={reminder.status === 3}
            onChange={() => handleComplete(reminder)}
            style={{ marginTop: 8 }}
          />
          <div style={{ flex: 1 }}>
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
                  {reminder.relatedEntityType && reminder.relatedEntityId && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      İlgili: {reminder.relatedEntityType} #{reminder.relatedEntityId}
                    </Text>
                  )}
                  {reminder.assignedToUserId && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Atanan: {reminder.assignedToUserId}
                    </Text>
                  )}
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
                        {dayjs(reminder.snoozedUntil).format('HH:mm')} saatine kadar ertelendi
                      </Text>
                    </Space>
                  )}
                  {reminder.dueDate && (
                    <Space>
                      <SnippetsOutlined />
                      <Text type="secondary">Teslim: {dayjs(reminder.dueDate).format('DD MMM YYYY')}</Text>
                    </Space>
                  )}
                  {(reminder.meetingStartTime || reminder.meetingEndTime) && (
                    <Space>
                      <SnippetsOutlined />
                      <Text type="secondary">
                        Toplantı: {dayjs(reminder.meetingStartTime).format('HH:mm')} -{' '}
                        {dayjs(reminder.meetingEndTime).format('HH:mm')}
                      </Text>
                    </Space>
                  )}
                  <Space size="small">
                    {reminder.sendEmail && (
                      <Tag icon={<MailOutlined />} color="blue">
                        E-posta
                      </Tag>
                    )}
                    {reminder.sendPush && (
                      <Tag icon={<MobileOutlined />} color="green">
                        Bildirim
                      </Tag>
                    )}
                    {reminder.sendInApp && (
                      <Tag icon={<BellOutlined />} color="purple">
                        Uygulama
                      </Tag>
                    )}
                  </Space>
                </Space>
              }
            />
          </div>
        </Space>
      </List.Item>
    );
  };

  // Client-side filtering for search and type filter
  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      // Search filter
      const matchesSearch =
        !searchText ||
        reminder.title.toLowerCase().includes(searchText.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(searchText.toLowerCase());

      // Type filter
      const matchesType = filterType === 'all' || reminder.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [reminders, searchText, filterType]);

  // Badge counts - use filtered array length for current tab
  const allCount = activeTab === 'all' ? filteredReminders.length : totalCount;
  const pendingCount = activeTab === 'pending' ? filteredReminders.length : filteredReminders.filter((r) => r.status === 0 || r.status === 1).length;
  const completedCount = activeTab === 'completed' ? filteredReminders.length : filteredReminders.filter((r) => r.status === 3).length;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={2}>
            <BellOutlined /> Hatırlatıcılar
          </Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadReminders} loading={loading}>
              Yenile
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Yeni Hatırlatıcı
            </Button>
          </Space>
        </div>

        <Space style={{ marginBottom: 16, width: '100%' }} size="middle">
          <Input
            placeholder="Hatırlatıcı ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 200 }}
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="all">Tüm Tipler</Select.Option>
            <Select.Option value={0}>Genel</Select.Option>
            <Select.Option value={1}>Görev</Select.Option>
            <Select.Option value={2}>Toplantı</Select.Option>
            <Select.Option value={3}>Takip</Select.Option>
            <Select.Option value={4}>Doğum Günü</Select.Option>
            <Select.Option value={5}>Sözleşme Yenileme</Select.Option>
            <Select.Option value={6}>Ödeme Vadesi</Select.Option>
          </Select>
        </Space>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'all' | 'pending' | 'completed')}
        >
          <Tabs.TabPane
            tab={
              <span>
                Tümü <Badge count={allCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="all"
          >
            <List
              loading={loading}
              dataSource={filteredReminders}
              renderItem={renderReminderItem}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Henüz hatırlatıcı yok"
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                      İlk Hatırlatıcıyı Oluştur
                    </Button>
                  </Empty>
                ),
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                Bekleyenler <Badge count={pendingCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="pending"
          >
            <List
              loading={loading}
              dataSource={filteredReminders}
              renderItem={renderReminderItem}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Bekleyen hatırlatıcı yok"
                  />
                ),
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                Tamamlananlar <Badge count={completedCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="completed"
          >
            <List
              loading={loading}
              dataSource={filteredReminders}
              renderItem={renderReminderItem}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Tamamlanan hatırlatıcı yok"
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
