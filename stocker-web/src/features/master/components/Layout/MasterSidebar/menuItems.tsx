import React from 'react';
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ApiOutlined,
  DollarOutlined,
  GiftOutlined,
  CloudDownloadOutlined,
  MailOutlined,
  CrownOutlined,
  MonitorOutlined,
  SyncOutlined,
  ControlOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
  type?: 'divider';
  badge?: number;
}

export const menuItems: MenuItem[] = [
  {
    key: '/master',
    icon: <DashboardOutlined />,
    label: 'Kontrol Paneli',
  },
  {
    key: 'divider-1',
    type: 'divider',
  },
  {
    key: 'apps',
    icon: <AppstoreOutlined />,
    label: 'Uygulamalar',
    children: [
      {
        key: '/master/tenants',
        icon: <TeamOutlined />,
        label: 'Kiracılar',
        badge: 23,
      },
      {
        key: '/master/packages',
        icon: <GiftOutlined />,
        label: 'Paketler',
      },
      {
        key: '/master/users',
        icon: <UserOutlined />,
        label: 'Sistem Kullanıcıları',
        badge: 5,
      },
      {
        key: '/master/modules',
        icon: <ControlOutlined />,
        label: 'Modüller',
      },
    ],
  },
  {
    key: 'finance',
    icon: <DollarOutlined />,
    label: 'Finans',
    children: [
      {
        key: '/master/subscriptions',
        icon: <CrownOutlined />,
        label: 'Abonelikler',
      },
      {
        key: '/master/invoices',
        icon: <FileTextOutlined />,
        label: 'Faturalar',
        badge: 12,
      },
      {
        key: '/master/payments',
        icon: <ShoppingCartOutlined />,
        label: 'Ödemeler',
      },
      {
        key: '/master/billing',
        icon: <DollarOutlined />,
        label: 'Faturalama Yönetimi',
      },
    ],
  },
  {
    key: 'monitoring',
    icon: <BarChartOutlined />,
    label: 'İzleme',
    children: [
      {
        key: '/master/monitoring',
        icon: <MonitorOutlined />,
        label: 'Sistem İzleme',
      },
      {
        key: '/master/reports',
        icon: <BarChartOutlined />,
        label: 'Raporlar',
      },
      {
        key: '/master/analytics',
        icon: <BarChartOutlined />,
        label: 'Analitik',
      },
      {
        key: '/master/performance',
        icon: <ThunderboltOutlined />,
        label: 'Performans',
      },
      {
        key: '/master/audit-logs',
        icon: <FileTextOutlined />,
        label: 'Denetim Günlükleri',
      },
      {
        key: '/master/api-management',
        icon: <ApiOutlined />,
        label: 'API Yönetimi',
      },
    ],
  },
  {
    key: '/master/migrations',
    icon: <SyncOutlined />,
    label: 'Migration Yönetimi',
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: 'Sistem',
    children: [
      {
        key: '/master/settings',
        icon: <SettingOutlined />,
        label: 'Sistem Ayarları',
      },
      {
        key: '/master/notification-settings',
        icon: <BellOutlined />,
        label: 'Bildirim Ayarları',
      },
      {
        key: '/master/backup',
        icon: <CloudDownloadOutlined />,
        label: 'Yedekleme',
      },
      {
        key: '/master/email-templates',
        icon: <MailOutlined />,
        label: 'E-posta Şablonları',
      },
    ],
  },
];