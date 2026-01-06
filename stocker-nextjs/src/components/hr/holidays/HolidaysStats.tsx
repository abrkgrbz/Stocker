'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarIcon,
  GiftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface HolidaysStatsProps {
  holidays: HolidayDto[];
  loading?: boolean;
}

export function HolidaysStats({ holidays, loading = false }: HolidaysStatsProps) {
  const totalHolidays = holidays.length;
  const upcomingHolidays = holidays.filter((h) => dayjs(h.date).isAfter(dayjs())).length;
  const passedHolidays = holidays.filter((h) => dayjs(h.date).isBefore(dayjs())).length;

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
      title: 'Toplam Tatil',
      value: totalHolidays,
      subtitle: 'Kayıtlı Tatil Günleri',
      icon: CalendarIcon,
      color: '#7c3aed',
    },
    {
      title: 'Yaklaşan',
      value: upcomingHolidays,
      subtitle: 'Gelecek Tatiller',
      icon: GiftIcon,
      color: '#10b981',
    },
    {
      title: 'Geçen',
      value: passedHolidays,
      subtitle: 'Tamamlanan Tatiller',
      icon: ClockIcon,
      color: '#6b7280',
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
