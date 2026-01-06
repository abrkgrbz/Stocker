'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { DepartmentDto } from '@/lib/api/services/hr.types';

interface DepartmentsStatsProps {
  departments: DepartmentDto[];
  loading?: boolean;
}

export function DepartmentsStats({ departments, loading = false }: DepartmentsStatsProps) {
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.isActive).length;
  const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0);

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2].map((i) => (
          <Col xs={24} sm={8} key={i}>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  const stats = [
    {
      title: 'Toplam Departman',
      value: totalDepartments,
      subtitle: 'Kayıtlı Departmanlar',
      icon: BuildingOfficeIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif Departman',
      value: activeDepartments,
      subtitle: `${totalDepartments > 0 ? ((activeDepartments / totalDepartments) * 100).toFixed(1) : 0}% Aktif Oran`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Toplam Çalışan',
      value: totalEmployees,
      subtitle: 'Departmanlarda Görevli',
      icon: UsersIcon,
      color: '#3b82f6',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={8} key={index}>
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
