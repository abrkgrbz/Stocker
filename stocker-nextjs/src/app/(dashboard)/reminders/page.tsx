'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
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
  Divider,
} from 'antd';
import {
  ClockCircleOutlined,
  PlusOutlined,
  MoreOutlined,
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  SnippetsOutlined,
  ReloadOutlined,
  SyncOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  LinkOutlined,
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

const { Title, Text, Paragraph } = Typography;

const getReminderTypeColor = (type: ReminderType): string => {
  const colors: Record<number, string> = {
    0: 'default',
    1: 'blue',
    2: 'purple',
    3: 'cyan',
    4: 'magenta',
    5: 'orange',
    6: 'red',
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
    0: 'processing',
    1: 'warning',
    2: 'error',
    3: 'success',
    4: 'default',
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

      let filteredReminders = response.reminders;
      if (activeTab === 'completed') {
        filteredReminders = response.reminders.filter((r) => r.status === 3);
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

  const renderReminderCard = (reminder: Reminder) => {
    const isPast = dayjs(reminder.remindAt).isBefore(dayjs());
    const recurrenceLabel = getRecurrenceLabel(reminder.recurrenceType);
    const isCompleted = reminder.status === 3;

    return (
      <Col xs={24} sm={24} md={12} lg={8} xl={6} key={reminder.id}>
        <Card
          hoverable
          style={{
            marginBottom: 16,
            opacity: isCompleted ? 0.7 : 1,
            borderColor: isPast && !isCompleted ? '#ff4d4f' : undefined,
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Checkbox
              checked={isCompleted}
              disabled={isCompleted}
              onChange={() => handleComplete(reminder)}
              style={{ marginRight: 12 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 16, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                  {reminder.title}
                </Text>
                <Dropdown
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
                        disabled: isCompleted || reminder.status === 4,
                      },
                      {
                        key: 'complete',
                        label: 'Tamamla',
                        onClick: () => handleComplete(reminder),
                        disabled: isCompleted,
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
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
              </div>

              <Space size={4} wrap style={{ marginBottom: 8 }}>
                <Tag color={getReminderTypeColor(reminder.type)}>{getReminderTypeLabel(reminder.type)}</Tag>
                <Tag color={getReminderStatusColor(reminder.status)}>{getReminderStatusLabel(reminder.status)}</Tag>
                {recurrenceLabel && (
                  <Tag icon={<SyncOutlined />} color="blue">
                    {recurrenceLabel}
                  </Tag>
                )}
              </Space>

              {reminder.description && (
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  type="secondary"
                  style={{ marginBottom: 8, fontSize: 13 }}
                >
                  {reminder.description}
                </Paragraph>
              )}

              <Divider style={{ margin: '8px 0' }} />

              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ marginRight: 6, color: isPast ? '#ff4d4f' : '#1890ff' }} />
                  <Text type={isPast && !isCompleted ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                    {dayjs(reminder.remindAt).format('DD MMM YYYY HH:mm')}
                    <Text type="secondary"> ({dayjs(reminder.remindAt).fromNow()})</Text>
                  </Text>
                </div>

                {reminder.relatedEntityType && reminder.relatedEntityId && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LinkOutlined style={{ marginRight: 6 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {reminder.relatedEntityType} #{reminder.relatedEntityId}
                    </Text>
                  </div>
                )}

                {reminder.assignedToUserId && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: 6 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {reminder.assignedToUserId}
                    </Text>
                  </div>
                )}

                {reminder.status === 1 && reminder.snoozedUntil && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    <Text type="warning" style={{ fontSize: 12 }}>
                      {dayjs(reminder.snoozedUntil).format('HH:mm')} saatine kadar ertelendi
                    </Text>
                  </div>
                )}

                {reminder.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SnippetsOutlined style={{ marginRight: 6 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Teslim: {dayjs(reminder.dueDate).format('DD MMM YYYY')}
                    </Text>
                  </div>
                )}

                {(reminder.meetingStartTime || reminder.meetingEndTime) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SnippetsOutlined style={{ marginRight: 6 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(reminder.meetingStartTime).format('HH:mm')} - {dayjs(reminder.meetingEndTime).format('HH:mm')}
                    </Text>
                  </div>
                )}
              </Space>

              {(reminder.sendEmail || reminder.sendPush || reminder.sendInApp) && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space size={4} wrap>
                    {reminder.sendEmail && <Tag icon={<MailOutlined />} color="blue">E-posta</Tag>}
                    {reminder.sendPush && <Tag icon={<MobileOutlined />} color="green">Bildirim</Tag>}
                    {reminder.sendInApp && <Tag icon={<BellOutlined />} color="purple">Uygulama</Tag>}
                  </Space>
                </>
              )}
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const matchesSearch =
        !searchText ||
        reminder.title.toLowerCase().includes(searchText.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(searchText.toLowerCase());

      const matchesType = filterType === 'all' || reminder.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [reminders, searchText, filterType]);

  const allCount = activeTab === 'all' ? filteredReminders.length : totalCount;
  const pendingCount = activeTab === 'pending' ? filteredReminders.length : filteredReminders.filter((r) => r.status === 0 || r.status === 1).length;
  const completedCount = activeTab === 'completed' ? filteredReminders.length : filteredReminders.filter((r) => r.status === 3).length;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
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

        <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }} size="middle">
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <ReloadOutlined spin style={{ fontSize: 32 }} />
              </div>
            ) : filteredReminders.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Henüz hatırlatıcı yok"
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  İlk Hatırlatıcıyı Oluştur
                </Button>
              </Empty>
            ) : (
              <Row gutter={[16, 0]}>
                {filteredReminders.map(renderReminderCard)}
              </Row>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                Bekleyenler <Badge count={pendingCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="pending"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <ReloadOutlined spin style={{ fontSize: 32 }} />
              </div>
            ) : filteredReminders.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Bekleyen hatırlatıcı yok"
              />
            ) : (
              <Row gutter={[16, 0]}>
                {filteredReminders.map(renderReminderCard)}
              </Row>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                Tamamlananlar <Badge count={completedCount} showZero style={{ marginLeft: 8 }} />
              </span>
            }
            key="completed"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <ReloadOutlined spin style={{ fontSize: 32 }} />
              </div>
            ) : filteredReminders.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Tamamlanan hatırlatıcı yok"
              />
            ) : (
              <Row gutter={[16, 0]}>
                {filteredReminders.map(renderReminderCard)}
              </Row>
            )}
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
