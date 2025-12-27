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
  ArrowLeftIcon,
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
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function WorkLocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: location, isLoading, error } = useWorkLocation(id);
  const deleteLocation = useDeleteWorkLocation();
  const activateLocation = useActivateWorkLocation();
  const deactivateLocation = useDeactivateWorkLocation();

  const handleDelete = () => {
    if (!location) return;
    Modal.confirm({
      title: 'Lokasyonu Sil',
      content: `"${location.name}" lokasyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="p-6">
        <Empty description="Lokasyon bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/work-locations')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/work-locations')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <MapPinIcon className="w-4 h-4" className="mr-2" />
              {location.name}
            </Title>
            <Space className="mt-1">
              {location.code && <Text type="secondary">{location.code}</Text>}
              <Tag color={location.isActive ? 'green' : 'default'}>
                {location.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
              {location.isHeadquarters && <Tag color="gold">Merkez</Tag>}
              {location.isRemote && <Tag color="purple">Uzaktan</Tag>}
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={location.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleToggleActive}
            loading={activateLocation.isPending || deactivateLocation.isPending}
          >
            {location.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Button>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/work-locations/${id}/edit`)}>
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
                  title="Çalışan Sayısı"
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
                  title="Tür"
                  value={location.isHeadquarters ? 'Merkez' : location.isRemote ? 'Uzaktan' : 'Şube'}
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
              <Descriptions.Item label="Lokasyon Adı">{location.name}</Descriptions.Item>
              <Descriptions.Item label="Kod">{location.code || '-'}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{location.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Adres">{location.street || '-'}</Descriptions.Item>
              <Descriptions.Item label="Şehir">{location.city || '-'}</Descriptions.Item>
              <Descriptions.Item label="Eyalet/İl">{location.state || '-'}</Descriptions.Item>
              <Descriptions.Item label="Posta Kodu">{location.postalCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ülke">{location.country || '-'}</Descriptions.Item>
              <Descriptions.Item label="Enlem">{location.latitude || '-'}</Descriptions.Item>
              <Descriptions.Item label="Boylam">{location.longitude || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Contact & Settings */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Contact Info */}
            <Card title="İletişim Bilgileri">
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
                    <Tag>Hayır</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Uzaktan Çalışma">
                  {location.isRemote ? (
                    <Tag color="purple">Evet</Tag>
                  ) : (
                    <Tag>Hayır</Tag>
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
                <Descriptions.Item label="Oluşturulma">
                  {dayjs(location.createdAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
                {location.updatedAt && (
                  <Descriptions.Item label="Güncelleme">
                    {dayjs(location.updatedAt).format('DD.MM.YYYY HH:mm')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
