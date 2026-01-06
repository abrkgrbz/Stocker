'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  UsersIcon,
  CheckCircleIcon,
  CalendarIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeSummaryDto } from '@/lib/api/services/hr.types';
import { EmployeeStatus } from '@/lib/api/services/hr.types';

interface EmployeesStatsProps {
  employees: EmployeeSummaryDto[];
  loading?: boolean;
}

export function EmployeesStats({ employees, loading = false }: EmployeesStatsProps) {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === EmployeeStatus.Active).length;
  const onLeaveEmployees = employees.filter((e) => e.status === EmployeeStatus.OnLeave).length;
  const departmentCount = new Set(employees.map((e) => e.departmentName).filter(Boolean)).size;

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
      title: 'Toplam Çalışan',
      value: totalEmployees,
      subtitle: 'Kayıtlı Çalışanlar',
      icon: UsersIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif Çalışan',
      value: activeEmployees,
      subtitle: `${totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}% Aktif Oran`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'İzinde',
      value: onLeaveEmployees,
      subtitle: 'Şu an izinde olan',
      icon: CalendarIcon,
      color: '#3b82f6',
    },
    {
      title: 'Departman',
      value: departmentCount,
      subtitle: 'Aktif Departman',
      icon: IdentificationIcon,
      color: '#8b5cf6',
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
