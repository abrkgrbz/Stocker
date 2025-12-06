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
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useWorkSchedule, useDeleteWorkSchedule } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function WorkScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: schedule, isLoading, error } = useWorkSchedule(id);
  const deleteSchedule = useDeleteWorkSchedule();

  const handleDelete = () => {
    if (!schedule) return;
    Modal.confirm({
      title: 'Çalışma Programını Sil',
      content: `Bu çalışma programı kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteSchedule.mutateAsync(id);
          router.push('/hr/work-schedules');
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

  if (error || !schedule) {
    return (
      <div className="p-6">
        <Empty description="Çalışma programı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/work-schedules')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/work-schedules')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Çalışma Programı Detayı
            </Title>
            <Space>
              <Text type="secondary">{schedule.employeeName}</Text>
              <Text type="secondary">-</Text>
              <Text type="secondary">{dayjs(schedule.date).format('DD.MM.YYYY')}</Text>
              {schedule.isWorkDay ? (
                <Tag color="green">Çalışma Günü</Tag>
              ) : (
                <Tag color="default">İzin Günü</Tag>
              )}
              {schedule.isHoliday && <Tag color="red">Tatil</Tag>}
            </Space>
          </div>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => router.push(`/hr/work-schedules/${id}/edit`)}>
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
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Çalışan"
                  value={schedule.employeeName}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tarih"
                  value={dayjs(schedule.date).format('DD.MM.YYYY')}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#7c3aed', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Vardiya"
                  value={schedule.shiftName || '-'}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#8b5cf6', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Durum"
                  value={schedule.isWorkDay ? 'Çalışma Günü' : 'İzin'}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{
                    color: schedule.isWorkDay ? '#52c41a' : '#8c8c8c',
                    fontSize: 16,
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Program Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Çalışan">{schedule.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Tarih">{dayjs(schedule.date).format('DD.MM.YYYY dddd')}</Descriptions.Item>
              <Descriptions.Item label="Vardiya">{schedule.shiftName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Çalışma Günü">
                <Tag color={schedule.isWorkDay ? 'green' : 'default'}>
                  {schedule.isWorkDay ? 'Evet' : 'Hayır'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tatil">
                {schedule.isHoliday ? (
                  <Tag color="red">{schedule.holidayName || 'Tatil'}</Tag>
                ) : (
                  <Tag color="default">Hayır</Tag>
                )}
              </Descriptions.Item>
              {schedule.customStartTime && (
                <Descriptions.Item label="Özel Başlangıç Saati">
                  {schedule.customStartTime.substring(0, 5)}
                </Descriptions.Item>
              )}
              {schedule.customEndTime && (
                <Descriptions.Item label="Özel Bitiş Saati">
                  {schedule.customEndTime.substring(0, 5)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Notlar">{schedule.notes || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* System Info */}
        <Col xs={24} lg={8}>
          <Card title="Sistem Bilgileri" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Oluşturulma">
                {dayjs(schedule.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
