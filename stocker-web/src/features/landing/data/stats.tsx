import React from 'react';
import { TeamOutlined, UserOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';

export interface Stat {
  title: string;
  value: number;
  suffix: string;
  prefix: React.ReactNode;
}

export const stats: Stat[] = [
  { title: 'Aktif Firma', value: 12, suffix: '+', prefix: <TeamOutlined /> },
  { title: 'Kullanıcı', value: 248, suffix: '+', prefix: <UserOutlined /> },
  { title: 'İşlem/Gün', value: 1.5, suffix: 'K+', prefix: <SyncOutlined /> },
  { title: 'Çalışma Süresi', value: 99.9, suffix: '%', prefix: <ClockCircleOutlined /> }
];