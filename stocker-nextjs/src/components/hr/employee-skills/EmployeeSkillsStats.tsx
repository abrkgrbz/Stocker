'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  WrenchIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeSkillDto } from '@/lib/api/services/hr.types';

interface EmployeeSkillsStatsProps {
  skills: EmployeeSkillDto[];
  loading?: boolean;
}

export function EmployeeSkillsStats({ skills, loading = false }: EmployeeSkillsStatsProps) {
  const totalSkills = skills.length;
  const verifiedSkills = skills.filter((s) => s.isVerified).length;
  const certifiedSkills = skills.filter((s) => s.isCertified).length;
  const expertSkills = skills.filter((s) => s.proficiencyLevel === 'Expert' || s.proficiencyLevel === 'Master').length;

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
      title: 'Toplam Yetkinlik',
      value: totalSkills,
      subtitle: 'Kayıtlı Yetkinlikler',
      icon: WrenchIcon,
      color: '#7c3aed',
    },
    {
      title: 'Doğrulanmış',
      value: verifiedSkills,
      subtitle: `${totalSkills > 0 ? ((verifiedSkills / totalSkills) * 100).toFixed(0) : 0}% Onaylı`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Sertifikalı',
      value: certifiedSkills,
      subtitle: 'Sertifika Sahibi',
      icon: AcademicCapIcon,
      color: '#3b82f6',
    },
    {
      title: 'Uzman Seviye',
      value: expertSkills,
      subtitle: 'Expert/Master',
      icon: StarIcon,
      color: '#f59e0b',
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
