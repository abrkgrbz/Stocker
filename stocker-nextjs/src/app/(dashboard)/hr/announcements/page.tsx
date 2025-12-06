'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Dropdown,
  Modal,
  Input,
  Select,
} from 'antd';
import {
  PlusOutlined,
  NotificationOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAnnouncements, useDeleteAnnouncement } from '@/lib/api/hooks/useHR';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

export default function AnnouncementsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: announcements = [], isLoading } = useAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();

  // Filter announcements by search text
  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchText.toLowerCase()) ||
      a.content?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalAnnouncements = announcements.length;
  const publishedAnnouncements = announcements.filter((a) => a.isPublished).length;
  const pinnedAnnouncements = announcements.filter((a) => a.isPinned).length;

  const handleDelete = (announcement: AnnouncementDto) => {
    Modal.confirm({
      title: 'Duyuruyu Sil',
      content: `"${announcement.title}" duyurusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteAnnouncement.mutateAsync(announcement.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getPriorityConfig = (priority?: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      Low: { color: 'default', text: 'Düşük' },
      Normal: { color: 'blue', text: 'Normal' },
      High: { color: 'orange', text: 'Yüksek' },
      Urgent: { color: 'red', text: 'Acil' },
    };
    return priorityMap[priority || ''] || { color: 'default', text: priority || '-' };
  };

  const columns: ColumnsType<AnnouncementDto> = [
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title: string, record: AnnouncementDto) => (
        <Space>
          {record.isPinned && <PushpinOutlined style={{ color: '#faad14' }} />}
          <NotificationOutlined style={{ color: '#8b5cf6' }} />
          <a onClick={() => router.push(`/hr/announcements/${record.id}`)}>{title}</a>
        </Space>
      ),
    },
    {
      title: 'İçerik',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0 }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const config = getPriorityConfig(priority);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'publishDate',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.publishDate).unix() - dayjs(b.publishDate).unix(),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Durum',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'default'}>{isPublished ? 'Yayında' : 'Taslak'}</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: AnnouncementDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/announcements/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/announcements/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <NotificationOutlined className="mr-2" />
          Duyurular
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/announcements/new')}>
          Yeni Duyuru
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Duyuru"
              value={totalAnnouncements}
              prefix={<NotificationOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Yayında"
              value={publishedAnnouncements}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Sabitlenmiş"
              value={pinnedAnnouncements}
              prefix={<PushpinOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Duyuru ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAnnouncements}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} duyuru`,
          }}
        />
      </Card>
    </div>
  );
}
