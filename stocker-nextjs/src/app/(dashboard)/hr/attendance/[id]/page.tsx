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
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAttendanceById } from '@/lib/api/hooks/useHR';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: attendance, isLoading, error } = useAttendanceById(id);

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const getStatusConfig = (status?: AttendanceStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [AttendanceStatus.Present]: { color: 'green', text: 'Mevcut' },
      [AttendanceStatus.Absent]: { color: 'red', text: 'Yok' },
      [AttendanceStatus.Late]: { color: 'orange', text: 'Geç' },
      [AttendanceStatus.HalfDay]: { color: 'blue', text: 'Yarım Gün' },
      [AttendanceStatus.OnLeave]: { color: 'purple', text: 'İzinli' },
      [AttendanceStatus.EarlyDeparture]: { color: 'cyan', text: 'Erken Ayrılış' },
      [AttendanceStatus.Holiday]: { color: 'gold', text: 'Tatil' },
      [AttendanceStatus.Weekend]: { color: 'default', text: 'Hafta Sonu' },
      [AttendanceStatus.RemoteWork]: { color: 'geekblue', text: 'Uzaktan Çalışma' },
      [AttendanceStatus.Overtime]: { color: 'lime', text: 'Fazla Mesai' },
      [AttendanceStatus.Training]: { color: 'magenta', text: 'Eğitim' },
      [AttendanceStatus.FieldWork]: { color: 'volcano', text: 'Saha Çalışması' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className="p-6">
        <Empty description="Yoklama kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/attendance')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(attendance.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/attendance')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Yoklama Detayı
            </Title>
            <Space>
              <Text type="secondary">
                {attendance.employeeName || `Çalışan #${attendance.employeeId}`}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{dayjs(attendance.date).format('DD.MM.YYYY')}</Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            </Space>
          </div>
        </Space>
        <Button icon={<EditOutlined />} onClick={() => router.push(`/hr/attendance/${id}/edit`)}>
          Düzenle
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Giriş Saati"
                  value={formatTime(attendance.checkInTime)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Çıkış Saati"
                  value={formatTime(attendance.checkOutTime)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Çalışma Süresi"
                  value={attendance.workedHours ? `${attendance.workedHours.toFixed(1)} saat` : '-'}
                  valueStyle={{ color: '#7c3aed', fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Fazla Mesai"
                  value={attendance.overtimeHours ? `${attendance.overtimeHours.toFixed(1)} saat` : '-'}
                  valueStyle={{ color: '#faad14', fontSize: 20 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Yoklama Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserOutlined />
                  {attendance.employeeName || `Çalışan #${attendance.employeeId}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tarih">
                <Space>
                  <CalendarOutlined />
                  {dayjs(attendance.date).format('DD MMMM YYYY, dddd')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Vardiya">
                {attendance.shiftName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Giriş Saati">
                {formatTime(attendance.checkInTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Çıkış Saati">
                {formatTime(attendance.checkOutTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Çalışma Süresi">
                {attendance.workedHours ? `${attendance.workedHours.toFixed(1)} saat` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Fazla Mesai">
                {attendance.overtimeHours ? `${attendance.overtimeHours.toFixed(1)} saat` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Notlar">
                {attendance.notes || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
