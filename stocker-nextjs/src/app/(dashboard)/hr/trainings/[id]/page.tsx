'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tag, Modal, Row, Col, Card, Statistic, Descriptions, Progress } from 'antd';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useTraining, useDeleteTraining } from '@/lib/api/hooks/useHR';
import { TrainingStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: training, isLoading, error } = useTraining(id);
  const deleteTraining = useDeleteTraining();

  const handleDelete = () => {
    if (!training) return;
    Modal.confirm({
      title: 'Egitimi Sil',
      content: `"${training.title}" egitimini silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await deleteTraining.mutateAsync(id);
          router.push('/hr/trainings');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: TrainingStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [TrainingStatus.Scheduled]: { color: 'blue', text: 'Planlandi' },
      [TrainingStatus.InProgress]: { color: 'green', text: 'Devam Ediyor' },
      [TrainingStatus.Completed]: { color: 'default', text: 'Tamamlandi' },
      [TrainingStatus.Cancelled]: { color: 'red', text: 'Iptal Edildi' },
      [TrainingStatus.Postponed]: { color: 'orange', text: 'Ertelendi' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  const statusConfig = getStatusConfig(training?.status);

  return (
    <DetailPageLayout
      title={training?.title || 'Egitim'}
      subtitle={`${training?.code || ''} ${training?.provider ? `- ${training.provider}` : ''}`}
      backPath="/hr/trainings"
      icon={<BookOpenIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-blue-600"
      statusBadge={
        training && (
          <>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
            {training.isMandatory && <Tag color="red">Zorunlu</Tag>}
            {training.isOnline && <Tag color="purple">Online</Tag>}
          </>
        )
      }
      actions={
        <>
          <Button
            variant="secondary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/trainings/${id}/edit`)}
          >
            Duzenle
          </Button>
          <Button
            variant="danger"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Sil
          </Button>
        </>
      }
      isLoading={isLoading}
      isError={!!error || (!isLoading && !training)}
      errorMessage="Egitim Bulunamadi"
      errorDescription="Istenen egitim bulunamadi veya bir hata olustu."
    >
      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Katilimci"
                  value={training?.currentParticipants || 0}
                  suffix={`/ ${training?.maxParticipants || '-'}`}
                  prefix={<UserGroupIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Sure"
                  value={training?.durationHours || 0}
                  suffix="saat"
                  prefix={<ClockIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#52c41a', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Baslangic"
                  value={training?.startDate ? dayjs(training.startDate).format('DD.MM.YYYY') : '-'}
                  prefix={<CalendarIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Maliyet"
                  value={training?.cost || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#faad14', fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Egitim Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Egitim Kodu">{training?.code}</Descriptions.Item>
              <Descriptions.Item label="Egitim Adi">{training?.title}</Descriptions.Item>
              <Descriptions.Item label="Egitim Turu">{training?.trainingType || '-'}</Descriptions.Item>
              <Descriptions.Item label="Saglayici">{training?.provider || '-'}</Descriptions.Item>
              <Descriptions.Item label="Egitmen">{training?.instructor || '-'}</Descriptions.Item>
              <Descriptions.Item label="Aciklama">{training?.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Baslangic Tarihi">
                {training?.startDate ? dayjs(training.startDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitis Tarihi">
                {training?.endDate ? dayjs(training.endDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Sure">{training?.durationHours} saat</Descriptions.Item>
              <Descriptions.Item label="Konum">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  {training?.isOnline ? (
                    <a href={training.onlineUrl} target="_blank" rel="noopener noreferrer">
                      {training.onlineUrl || 'Online'}
                    </a>
                  ) : (
                    training?.location || '-'
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Maksimum Katilimci">
                {training?.maxParticipants || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mevcut Katilimci">
                {training?.currentParticipants || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Maliyet">
                {formatCurrency(training?.cost)} {training?.currency || 'TRY'}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Certification Info */}
        <Col xs={24} lg={8}>
          <Card title="Sertifikasyon">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Sertifika">
                {training?.hasCertification ? (
                  <Tag color="green">Var</Tag>
                ) : (
                  <Tag color="default">Yok</Tag>
                )}
              </Descriptions.Item>
              {training?.hasCertification && (
                <>
                  <Descriptions.Item label="Gecerlilik">
                    {training.certificationValidityMonths
                      ? `${training.certificationValidityMonths} ay`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gecme Puani">
                    {training.passingScore || '-'}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Zorunlu">
                {training?.isMandatory ? (
                  <Tag color="red">Evet</Tag>
                ) : (
                  <Tag color="default">Hayir</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Prerequisites & Materials */}
        {(training?.prerequisites || training?.materials) && (
          <Col xs={24}>
            <Card title="Ek Bilgiler">
              {training.prerequisites && (
                <>
                  <p className="font-medium text-slate-900 mb-2">On Kosullar:</p>
                  <p className="text-slate-600 mb-4">{training.prerequisites}</p>
                </>
              )}
              {training.materials && (
                <>
                  <p className="font-medium text-slate-900 mb-2">Materyaller:</p>
                  <p className="text-slate-600">{training.materials}</p>
                </>
              )}
            </Card>
          </Col>
        )}

        {/* Notes */}
        {training?.notes && (
          <Col xs={24}>
            <Card title="Notlar">
              <p className="text-slate-600">{training.notes}</p>
            </Card>
          </Col>
        )}
      </Row>
    </DetailPageLayout>
  );
}
