'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
} from 'antd';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useWorkSchedule, useDeleteWorkSchedule } from '@/lib/api/hooks/useHR';
import { DetailPageLayout } from '@/components/patterns';
import dayjs from 'dayjs';

export default function WorkScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: schedule, isLoading, isError } = useWorkSchedule(id);
  const deleteSchedule = useDeleteWorkSchedule();

  const handleDelete = () => {
    if (!schedule) return;
    Modal.confirm({
      title: 'Calisma Programini Sil',
      content: `Bu calisma programi kaydini silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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

  return (
    <DetailPageLayout
      title="Calisma Programi Detayi"
      subtitle={schedule ? `${schedule.employeeName} - ${dayjs(schedule.date).format('DD.MM.YYYY')}` : undefined}
      backPath="/hr/work-schedules"
      icon={<CalendarIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-indigo-600"
      statusBadge={
        schedule && (
          <div className="flex items-center gap-2">
            {schedule.isWorkDay ? (
              <Tag color="green">Calisma Gunu</Tag>
            ) : (
              <Tag color="default">Izin Gunu</Tag>
            )}
            {schedule.isHoliday && <Tag color="red">Tatil</Tag>}
          </div>
        )
      }
      isLoading={isLoading}
      isError={isError || !schedule}
      errorMessage="Calisma Programi Bulunamadi"
      errorDescription="Istenen calisma programi kaydi bulunamadi veya bir hata olustu."
      actions={
        <>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/work-schedules/${id}/edit`)}>
            Duzenle
          </Button>
          <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
            Sil
          </Button>
        </>
      }
    >
      {schedule && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Calisan"
                    value={schedule.employeeName}
                    prefix={<UserIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#1890ff', fontSize: 16 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tarih"
                    value={dayjs(schedule.date).format('DD.MM.YYYY')}
                    prefix={<CalendarIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#7c3aed', fontSize: 16 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Vardiya"
                    value={schedule.shiftName || '-'}
                    prefix={<ClockIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#8b5cf6', fontSize: 16 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Durum"
                    value={schedule.isWorkDay ? 'Calisma Gunu' : 'Izin'}
                    prefix={<CheckCircleIcon className="w-4 h-4" />}
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
                <Descriptions.Item label="Calisan">{schedule.employeeName}</Descriptions.Item>
                <Descriptions.Item label="Tarih">{dayjs(schedule.date).format('DD.MM.YYYY dddd')}</Descriptions.Item>
                <Descriptions.Item label="Vardiya">{schedule.shiftName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Calisma Gunu">
                  <Tag color={schedule.isWorkDay ? 'green' : 'default'}>
                    {schedule.isWorkDay ? 'Evet' : 'Hayir'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tatil">
                  {schedule.isHoliday ? (
                    <Tag color="red">{schedule.holidayName || 'Tatil'}</Tag>
                  ) : (
                    <Tag color="default">Hayir</Tag>
                  )}
                </Descriptions.Item>
                {schedule.customStartTime && (
                  <Descriptions.Item label="Ozel Baslangic Saati">
                    {schedule.customStartTime.substring(0, 5)}
                  </Descriptions.Item>
                )}
                {schedule.customEndTime && (
                  <Descriptions.Item label="Ozel Bitis Saati">
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
                <Descriptions.Item label="Olusturulma">
                  {dayjs(schedule.createdAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      )}
    </DetailPageLayout>
  );
}
