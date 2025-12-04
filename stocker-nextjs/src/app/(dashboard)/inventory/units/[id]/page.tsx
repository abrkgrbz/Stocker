'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Spin,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useUnit, useUnits } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = Number(params.id);

  const { data: unit, isLoading } = useUnit(unitId);
  const { data: allUnits = [] } = useUnits();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Birim bulunamadı" />
      </div>
    );
  }

  // Find base unit if this unit has a conversion
  const baseUnit = unit.baseUnitId ? allUnits.find((u) => u.id === unit.baseUnitId) : null;

  // Find derived units (units that use this as base)
  const derivedUnits = allUnits.filter((u) => u.baseUnitId === unitId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                <CalculatorOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{unit.name}</h1>
                  <Tag
                    icon={unit.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={unit.isActive ? 'success' : 'default'}
                  >
                    {unit.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">
                  Kod: {unit.code} | Sembol: {unit.symbol}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/units/${unitId}/edit`)}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Birim Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Birim Kodu">{unit.code}</Descriptions.Item>
              <Descriptions.Item label="Birim Adı">{unit.name}</Descriptions.Item>
              <Descriptions.Item label="Sembol">
                <Tag color="blue">{unit.symbol}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={unit.isActive ? 'success' : 'default'}>
                  {unit.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Conversion Info */}
          {baseUnit && (
            <Card title="Dönüşüm Bilgileri" className="mb-6">
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    1 {unit.symbol}
                  </div>
                  <div className="text-gray-500">=</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">
                    {unit.conversionFactor} {baseUnit.symbol}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Temel Birim: {baseUnit.name}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Derived Units */}
          {derivedUnits.length > 0 && (
            <Card title={`Türetilmiş Birimler (${derivedUnits.length})`}>
              <div className="space-y-2">
                {derivedUnits.map((derived) => (
                  <div
                    key={derived.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/inventory/units/${derived.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Tag color="purple">{derived.symbol}</Tag>
                      <div>
                        <Text strong>{derived.name}</Text>
                        <Text type="secondary" className="ml-2">
                          ({derived.code})
                        </Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text type="secondary">
                        1 {derived.symbol} = {derived.conversionFactor} {unit.symbol}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Quick Info */}
          <Card title="Hızlı Bilgi" className="mb-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Text type="secondary" className="block text-xs mb-1">
                  Sembol
                </Text>
                <div className="text-3xl font-bold text-purple-600">{unit.symbol}</div>
              </div>
              {unit.conversionFactor && unit.conversionFactor !== 1 && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Text type="secondary" className="block text-xs mb-1">
                    Dönüşüm Faktörü
                  </Text>
                  <div className="text-2xl font-bold text-green-600">{unit.conversionFactor}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Timestamps */}
          <Card title="Kayıt Bilgileri">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Oluşturulma</Text>
                <Text>{dayjs(unit.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              {unit.updatedAt && (
                <div className="flex justify-between">
                  <Text type="secondary">Güncelleme</Text>
                  <Text>{dayjs(unit.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
