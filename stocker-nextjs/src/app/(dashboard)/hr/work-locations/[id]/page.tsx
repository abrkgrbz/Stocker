'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
} from 'antd';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  StopCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useWorkLocation, useDeleteWorkLocation, useActivateWorkLocation, useDeactivateWorkLocation } from '@/lib/api/hooks/useHR';
import { DetailPageLayout } from '@/components/patterns';
import dayjs from 'dayjs';

export default function WorkLocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: location, isLoading, isError } = useWorkLocation(id);
  const deleteLocation = useDeleteWorkLocation();
  const activateLocation = useActivateWorkLocation();
  const deactivateLocation = useDeactivateWorkLocation();

  const handleDelete = () => {
    if (!location) return;
    Modal.confirm({
      title: 'Lokasyonu Sil',
      content: `"${location.name}" lokasyonunu silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await deleteLocation.mutateAsync(id);
          router.push('/hr/work-locations');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!location) return;
    try {
      if (location.isActive) {
        await deactivateLocation.mutateAsync(id);
      } else {
        await activateLocation.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <DetailPageLayout
      title={location?.name || 'Lokasyon Detayi'}
      subtitle={location?.code}
      backPath="/hr/work-locations"
      icon={<MapPinIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-rose-600"
      statusBadge={
        location && (
          <div className="flex items-center gap-2">
            <Tag color={location.isActive ? 'green' : 'default'}>
              {location.isActive ? 'Aktif' : 'Pasif'}
            </Tag>
            {location.isHeadquarters && <Tag color="gold">Merkez</Tag>}
            {location.isRemote && <Tag color="purple">Uzaktan</Tag>}
          </div>
        )
      }
      isLoading={isLoading}
      isError={isError || !location}
      errorMessage="Lokasyon Bulunamadi"
      errorDescription="Istenen lokasyon kaydi bulunamadi veya bir hata olustu."
      actions={
        location && (
          <>
            <Button
              icon={location.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
              loading={activateLocation.isPending || deactivateLocation.isPending}
            >
              {location.isActive ? 'Pasiflestir' : 'Aktiflestir'}
            </Button>
            <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/work-locations/${id}/edit`)}>
              Duzenle
            </Button>
            <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
              Sil
            </Button>
          </>
        )
      }
    >
      {location && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Calisan Sayisi"
                    value={location.employeeCount || 0}
                    prefix={<UserGroupIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Kapasite"
                    value={location.capacity || '-'}
                    valueStyle={{ color: '#7c3aed' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tur"
                    value={location.isHeadquarters ? 'Merkez' : location.isRemote ? 'Uzaktan' : 'Sube'}
                    prefix={location.isHeadquarters ? <HomeIcon className="w-4 h-4" /> : location.isRemote ? <GlobeAltIcon className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />}
                    valueStyle={{ color: location.isHeadquarters ? '#faad14' : location.isRemote ? '#722ed1' : '#52c41a', fontSize: 16 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Durum"
                    value={location.isActive ? 'Aktif' : 'Pasif'}
                    prefix={location.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <StopCircleIcon className="w-4 h-4" />}
                    valueStyle={{ color: location.isActive ? '#52c41a' : '#8c8c8c', fontSize: 16 }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Details */}
          <Col xs={24} lg={16}>
            <Card title="Lokasyon Bilgileri">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Lokasyon Adi">{location.name}</Descriptions.Item>
                <Descriptions.Item label="Kod">{location.code || '-'}</Descriptions.Item>
                <Descriptions.Item label="Aciklama">{location.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Adres">{location.street || '-'}</Descriptions.Item>
                <Descriptions.Item label="Sehir">{location.city || '-'}</Descriptions.Item>
                <Descriptions.Item label="Eyalet/Il">{location.state || '-'}</Descriptions.Item>
                <Descriptions.Item label="Posta Kodu">{location.postalCode || '-'}</Descriptions.Item>
                <Descriptions.Item label="Ulke">{location.country || '-'}</Descriptions.Item>
                <Descriptions.Item label="Enlem">{location.latitude || '-'}</Descriptions.Item>
                <Descriptions.Item label="Boylam">{location.longitude || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact & Settings */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Contact Info */}
              <Card title="Iletisim Bilgileri">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={<><PhoneIcon className="w-4 h-4" /> Telefon</>}>
                    {location.phone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><EnvelopeIcon className="w-4 h-4" /> E-posta</>}>
                    {location.email || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Settings */}
              <Card title="Ayarlar">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Merkez Ofis">
                    {location.isHeadquarters ? (
                      <Tag color="gold">Evet</Tag>
                    ) : (
                      <Tag>Hayir</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Uzaktan Calisma">
                    {location.isRemote ? (
                      <Tag color="purple">Evet</Tag>
                    ) : (
                      <Tag>Hayir</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kapasite">
                    {location.capacity || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* System Info */}
              <Card title="Sistem Bilgileri" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Olusturulma">
                    {dayjs(location.createdAt).format('DD.MM.YYYY HH:mm')}
                  </Descriptions.Item>
                  {location.updatedAt && (
                    <Descriptions.Item label="Guncelleme">
                      {dayjs(location.updatedAt).format('DD.MM.YYYY HH:mm')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Space>
          </Col>
        </Row>
      )}
    </DetailPageLayout>
  );
}
