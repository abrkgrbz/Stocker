'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
} from 'antd';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useAttendanceById } from '@/lib/api/hooks/useHR';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

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
    const statusMap: Record<number, { color: string; text: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }> = {
      [AttendanceStatus.Present]: { color: 'green', text: 'Mevcut', variant: 'success' },
      [AttendanceStatus.Absent]: { color: 'red', text: 'Yok', variant: 'error' },
      [AttendanceStatus.Late]: { color: 'orange', text: 'Gec', variant: 'warning' },
      [AttendanceStatus.HalfDay]: { color: 'blue', text: 'Yarim Gun', variant: 'info' },
      [AttendanceStatus.OnLeave]: { color: 'purple', text: 'Izinli', variant: 'info' },
      [AttendanceStatus.EarlyDeparture]: { color: 'cyan', text: 'Erken Ayrilis', variant: 'warning' },
      [AttendanceStatus.Holiday]: { color: 'gold', text: 'Tatil', variant: 'info' },
      [AttendanceStatus.Weekend]: { color: 'default', text: 'Hafta Sonu', variant: 'neutral' },
      [AttendanceStatus.RemoteWork]: { color: 'geekblue', text: 'Uzaktan Calisma', variant: 'info' },
      [AttendanceStatus.Overtime]: { color: 'lime', text: 'Fazla Mesai', variant: 'warning' },
      [AttendanceStatus.Training]: { color: 'magenta', text: 'Egitim', variant: 'info' },
      [AttendanceStatus.FieldWork]: { color: 'volcano', text: 'Saha Calismasi', variant: 'info' },
    };
    const defaultConfig = { color: 'default', text: '-', variant: 'neutral' as const };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  const statusConfig = attendance ? getStatusConfig(attendance.status) : getStatusConfig();

  return (
    <DetailPageLayout
      title="Yoklama Detayi"
      subtitle={attendance ? `${attendance.employeeName || `Calisan #${attendance.employeeId}`} - ${dayjs(attendance.date).format('DD.MM.YYYY')}` : undefined}
      backPath="/hr/attendance"
      icon={<ClockIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-violet-600"
      statusBadge={attendance ? <Badge variant={statusConfig.variant} dot>{statusConfig.text}</Badge> : undefined}
      actions={
        attendance && (
          <Button
            variant="secondary"
            size="sm"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/attendance/${id}/edit`)}
          >
            Duzenle
          </Button>
        )
      }
      isLoading={isLoading}
      isError={!!error || (!isLoading && !attendance)}
      errorMessage="Yoklama Kaydi Bulunamadi"
      errorDescription="Istenen yoklama kaydi bulunamadi veya bir hata olustu."
    >
      {attendance && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Giris Saati"
                    value={formatTime(attendance.checkInTime)}
                    prefix={<ClockIcon className="w-5 h-5" />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Cikis Saati"
                    value={formatTime(attendance.checkOutTime)}
                    prefix={<ClockIcon className="w-5 h-5" />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Calisma Suresi"
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
                <Descriptions.Item label="Calisan">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {attendance.employeeName || `Calisan #${attendance.employeeId}`}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Tarih">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {dayjs(attendance.date).format('DD MMMM YYYY, dddd')}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Vardiya">
                  {attendance.shiftName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Giris Saati">
                  {formatTime(attendance.checkInTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Cikis Saati">
                  {formatTime(attendance.checkOutTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Calisma Suresi">
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
      )}
    </DetailPageLayout>
  );
}
