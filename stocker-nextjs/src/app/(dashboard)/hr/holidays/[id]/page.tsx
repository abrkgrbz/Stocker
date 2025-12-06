'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  DeleteOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useHoliday, useDeleteHoliday } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function HolidayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: holiday, isLoading, error } = useHoliday(id);
  const deleteHoliday = useDeleteHoliday();

  const handleDelete = () => {
    if (!holiday) return;
    Modal.confirm({
      title: 'Tatil Gününü Sil',
      content: `"${holiday.name}" tatil gününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteHoliday.mutateAsync(id);
          router.push('/hr/holidays');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !holiday) {
    return (
      <div className="p-6">
        <Empty description="Tatil günü bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/holidays')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const isPassed = dayjs(holiday.date).isBefore(dayjs(), 'day');
  const isToday = dayjs(holiday.date).isSame(dayjs(), 'day');
  const daysUntil = dayjs(holiday.date).diff(dayjs(), 'day');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/holidays')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {holiday.name}
            </Title>
            <Space>
              <Text type="secondary">{dayjs(holiday.date).format('DD MMMM YYYY, dddd')}</Text>
              <Tag color={isToday ? 'green' : isPassed ? 'default' : 'blue'}>
                {isToday ? 'Bugün' : isPassed ? 'Geçti' : 'Yaklaşan'}
              </Tag>
              {holiday.isRecurring && <Tag color="purple">Yıllık</Tag>}
            </Space>
          </div>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => router.push(`/hr/holidays/${id}/edit`)}>
            Düzenle
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Card size="small">
                <Statistic
                  title="Tarih"
                  value={dayjs(holiday.date).format('DD.MM.YYYY')}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card size="small">
                <Statistic
                  title="Gün"
                  value={dayjs(holiday.date).format('dddd')}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card size="small">
                <Statistic
                  title={isPassed ? 'Geçen Gün' : 'Kalan Gün'}
                  value={isPassed ? Math.abs(daysUntil) : daysUntil}
                  suffix="gün"
                  valueStyle={{ color: isPassed ? '#8c8c8c' : '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Tatil Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tatil Adı">{holiday.name}</Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {dayjs(holiday.date).format('DD MMMM YYYY, dddd')}
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama">{holiday.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tür">
                <Tag color={holiday.isRecurring ? 'purple' : 'default'}>
                  {holiday.isRecurring ? 'Yıllık Tekrarlayan' : 'Tek Seferlik'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={isToday ? 'green' : isPassed ? 'default' : 'blue'}>
                  {isToday ? 'Bugün' : isPassed ? 'Geçti' : `${daysUntil} gün kaldı`}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
