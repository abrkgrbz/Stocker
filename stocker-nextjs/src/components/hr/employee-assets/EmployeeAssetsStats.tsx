'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ComputerDesktopIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeAssetDto } from '@/lib/api/services/hr.types';

interface EmployeeAssetsStatsProps {
  assets: EmployeeAssetDto[];
  loading?: boolean;
}

export function EmployeeAssetsStats({ assets, loading = false }: EmployeeAssetsStatsProps) {
  const totalAssets = assets.length;
  const assignedAssets = assets.filter((a) => a.status === 'Assigned').length;
  const availableAssets = assets.filter((a) => a.status === 'Available').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'UnderMaintenance' || a.status === 'Lost' || a.status === 'Damaged').length;

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={12} sm={6} key={i}>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  const stats = [
    {
      title: 'Toplam Varlık',
      value: totalAssets,
      subtitle: 'Kayıtlı Varlıklar',
      icon: ComputerDesktopIcon,
      color: '#7c3aed',
    },
    {
      title: 'Atanmış',
      value: assignedAssets,
      subtitle: 'Kullanımda',
      icon: CheckCircleIcon,
      color: '#3b82f6',
    },
    {
      title: 'Müsait',
      value: availableAssets,
      subtitle: 'Atanabilir',
      icon: ComputerDesktopIcon,
      color: '#10b981',
    },
    {
      title: 'Bakım/Sorunlu',
      value: maintenanceAssets,
      subtitle: 'Dikkat Gerekli',
      icon: maintenanceAssets > 0 ? ExclamationTriangleIcon : WrenchScrewdriverIcon,
      color: maintenanceAssets > 0 ? '#ef4444' : '#f59e0b',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={12} sm={6} key={index}>
          <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-500 text-sm">{stat.title}</span>}
                  value={stat.value}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.75rem' }}
                />
                <div className="text-xs mt-1" style={{ color: stat.color }}>
                  {stat.subtitle}
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
