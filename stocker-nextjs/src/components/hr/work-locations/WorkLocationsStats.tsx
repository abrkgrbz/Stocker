'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  MapPinIcon,
  CheckCircleIcon,
  HomeIcon,
  GlobeAltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';

interface WorkLocationsStatsProps {
  locations: WorkLocationDto[];
  loading?: boolean;
}

export function WorkLocationsStats({ locations, loading = false }: WorkLocationsStatsProps) {
  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const headquarters = locations.filter((l) => l.isHeadquarters).length;
  const remoteLocations = locations.filter((l) => l.isRemote).length;
  const totalEmployees = locations.reduce((sum, l) => sum + (l.employeeCount || 0), 0);

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={8} md={4} key={i}>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  const stats = [
    {
      title: 'Toplam Lokasyon',
      value: totalLocations,
      subtitle: 'Kayıtlı Lokasyonlar',
      icon: MapPinIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif Lokasyon',
      value: activeLocations,
      subtitle: `${totalLocations > 0 ? ((activeLocations / totalLocations) * 100).toFixed(0) : 0}% Aktif`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Merkez Ofis',
      value: headquarters,
      subtitle: 'Genel Merkez',
      icon: HomeIcon,
      color: '#f59e0b',
    },
    {
      title: 'Uzaktan',
      value: remoteLocations,
      subtitle: 'Uzak Lokasyonlar',
      icon: GlobeAltIcon,
      color: '#8b5cf6',
    },
    {
      title: 'Toplam Çalışan',
      value: totalEmployees,
      subtitle: 'Tüm Lokasyonlar',
      icon: UserGroupIcon,
      color: '#3b82f6',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={12} sm={8} md={4} key={index}>
          <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-500 text-xs">{stat.title}</span>}
                  value={stat.value}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.5rem' }}
                />
                <div className="text-xs mt-1" style={{ color: stat.color }}>
                  {stat.subtitle}
                </div>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
