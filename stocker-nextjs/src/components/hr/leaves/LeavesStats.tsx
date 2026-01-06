'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { LeaveDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';

interface LeavesStatsProps {
  leaves: LeaveDto[];
  loading?: boolean;
}

export function LeavesStats({ leaves, loading = false }: LeavesStatsProps) {
  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter((l) => l.status === LeaveStatus.Pending).length;
  const approvedLeaves = leaves.filter((l) => l.status === LeaveStatus.Approved).length;
  const rejectedLeaves = leaves.filter((l) => l.status === LeaveStatus.Rejected).length;

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
      title: 'Toplam Talep',
      value: totalLeaves,
      subtitle: 'Kayıtlı İzin Talepleri',
      icon: CalendarIcon,
      color: '#7c3aed',
    },
    {
      title: 'Beklemede',
      value: pendingLeaves,
      subtitle: 'Onay Bekleyen',
      icon: ClockIcon,
      color: '#faad14',
    },
    {
      title: 'Onaylanan',
      value: approvedLeaves,
      subtitle: `${totalLeaves > 0 ? ((approvedLeaves / totalLeaves) * 100).toFixed(1) : 0}% Onay Oranı`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Reddedilen',
      value: rejectedLeaves,
      subtitle: 'Red Edilen Talepler',
      icon: XCircleIcon,
      color: '#ef4444',
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
