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
  Row,
  Col,
  Statistic,
  Empty,
  Modal,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import {
  useLeave,
  useDeleteLeave,
  useApproveLeave,
  useRejectLeave,
} from '@/lib/api/hooks/useHR';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function LeaveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: leave, isLoading, error } = useLeave(id);
  const deleteLeave = useDeleteLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const handleDelete = () => {
    if (!leave) return;
    Modal.confirm({
      title: 'İzin Talebini Sil',
      content: 'Bu izin talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLeave.mutateAsync(id);
          router.push('/hr/leaves');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approveLeave.mutateAsync({ id });
      message.success('İzin talebi onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'İzin Talebini Reddet',
      content: 'Bu izin talebini reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectLeave.mutateAsync({ id, data: { reason: 'Reddedildi' } });
          message.success('İzin talebi reddedildi');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status?: LeaveStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [LeaveStatus.Pending]: { color: 'orange', text: 'Beklemede' },
      [LeaveStatus.Approved]: { color: 'green', text: 'Onaylandı' },
      [LeaveStatus.Rejected]: { color: 'red', text: 'Reddedildi' },
      [LeaveStatus.Cancelled]: { color: 'default', text: 'İptal Edildi' },
      [LeaveStatus.Taken]: { color: 'blue', text: 'Kullanıldı' },
      [LeaveStatus.PartiallyTaken]: { color: 'cyan', text: 'Kısmen Kullanıldı' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="p-6">
        <Empty description="İzin talebi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/leaves')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(leave.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/leaves')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              İzin Talebi Detayı
            </Title>
            <Space>
              <Text type="secondary">
                {leave.employeeName || `Çalışan #${leave.employeeId}`}
              </Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            </Space>
          </div>
        </Space>
        <Space>
          {leave.status === LeaveStatus.Pending && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Onayla
              </Button>
              <Button danger icon={<XCircleIcon className="w-4 h-4" />} onClick={handleReject}>
                Reddet
              </Button>
            </>
          )}
          <Button
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/leaves/${id}/edit`)}
            disabled={leave.status !== LeaveStatus.Pending}
          >
            Düzenle
          </Button>
          <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
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
                  title="Başlangıç"
                  value={dayjs(leave.startDate).format('DD.MM.YYYY')}
                  prefix={<CalendarIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#52c41a', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Bitiş"
                  value={dayjs(leave.endDate).format('DD.MM.YYYY')}
                  prefix={<CalendarIcon className="w-5 h-5" />}
                  valueStyle={{ color: '#1890ff', fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Toplam Gün"
                  value={leave.totalDays || 0}
                  suffix="gün"
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="İzin Türü"
                  value={leave.leaveTypeName || '-'}
                  valueStyle={{ color: '#faad14', fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="İzin Talebi Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Çalışan">
                <Space>
                  <UserIcon className="w-4 h-4" />
                  {leave.employeeName || `Çalışan #${leave.employeeId}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="İzin Türü">
                {leave.leaveTypeName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Başlangıç Tarihi">
                {dayjs(leave.startDate).format('DD MMMM YYYY, dddd')}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">
                {dayjs(leave.endDate).format('DD MMMM YYYY, dddd')}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Gün">
                {leave.totalDays || 0} gün
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
              {leave.approvedById && (
                <Descriptions.Item label="Onaylayan">
                  {leave.approvedByName || `Kullanıcı #${leave.approvedById}`}
                </Descriptions.Item>
              )}
              {leave.approvedDate && (
                <Descriptions.Item label="Onay Tarihi">
                  {dayjs(leave.approvedDate).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Reason */}
        {leave.reason && (
          <Col xs={24} lg={16}>
            <Card title="İzin Nedeni">
              <Paragraph>{leave.reason}</Paragraph>
            </Card>
          </Col>
        )}

        {/* Rejection Reason */}
        {leave.rejectionReason && (
          <Col xs={24} lg={16}>
            <Card title="Ret Nedeni">
              <Paragraph type="danger">{leave.rejectionReason}</Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
