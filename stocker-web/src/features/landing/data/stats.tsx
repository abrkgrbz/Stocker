import React from 'react';
import { TeamOutlined, UserOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';

export interface Stat {
  title: string;
  value: number;
  suffix: string;
  prefix: React.ReactNode;
  description: string;
}

export const stats: Stat[] = [
  { 
    title: 'Aktif Müşteri', 
    value: 2500, 
    suffix: '+', 
    prefix: <TeamOutlined />,
    description: 'Güvenle kullanıyor'
  },
  { 
    title: 'Toplam Kullanıcı', 
    value: 15000, 
    suffix: '+', 
    prefix: <UserOutlined />,
    description: 'Her gün artıyor'
  },
  { 
    title: 'Günlük İşlem', 
    value: 50, 
    suffix: 'K+', 
    prefix: <SyncOutlined />,
    description: 'Kesintisiz hizmet'
  },
  { 
    title: 'Çalışma Süresi', 
    value: 99.9, 
    suffix: '%', 
    prefix: <ClockCircleOutlined />,
    description: 'Yüksek erişilebilirlik'
  }
];