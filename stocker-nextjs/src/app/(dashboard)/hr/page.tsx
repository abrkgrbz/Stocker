'use client';

/**
 * HR Dashboard Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useMemo } from 'react';
import { Table, Tag, List, Empty, Spin } from 'antd';
import {
  ArrowPathIcon,
  BellIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  IdentificationIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useEmployees,
  useDepartments,
  usePositions,
  useAttendance,
  useLeaves,
  usePayrolls,
  useTrainings,
  useAnnouncements,
  useHolidays,
} from '@/lib/api/hooks/useHR';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  PageContainer,
  ListPageHeader,
  Card,
} from '@/components/ui/enterprise-page';

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Format currency
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Status configs
const leaveStatusConfig: Record<string, { color: string; label: string }> = {
  Pending: { color: 'processing', label: 'Beklemede' },
  Approved: { color: 'green', label: 'Onaylandı' },
  Rejected: { color: 'red', label: 'Reddedildi' },
  Cancelled: { color: 'default', label: 'İptal' },
};

const attendanceStatusConfig: Record<string, { color: string; label: string }> = {
  Present: { color: 'green', label: 'Mevcut' },
  Absent: { color: 'red', label: 'Yok' },
  Late: { color: 'orange', label: 'Geç' },
  HalfDay: { color: 'blue', label: 'Yarım Gün' },
  OnLeave: { color: 'purple', label: 'İzinli' },
};

export default function HRDashboardPage() {
  // Fetch HR data
  const { data: employees = [], isLoading: employeesLoading, refetch: refetchEmployees } = useEmployees();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: positions = [], isLoading: positionsLoading } = usePositions();
  const { data: attendances = [], isLoading: attendancesLoading } = useAttendance();
  const { data: leaves = [], isLoading: leavesLoading } = useLeaves();
  const { data: payrolls = [], isLoading: payrollsLoading } = usePayrolls();
  const { data: trainings = [] } = useTrainings();
  const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements();
  const { data: holidays = [], isLoading: holidaysLoading } = useHolidays();

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: any) => e.isActive).length;
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d: any) => d.isActive).length;

  // Pending leaves count
  const pendingLeaves = leaves.filter((l: any) => l.status === 'Pending').length;

  // Today's attendance
  const today = dayjs().format('YYYY-MM-DD');
  const todayAttendances = attendances.filter((a: any) =>
    dayjs(a.date).format('YYYY-MM-DD') === today
  );
  const presentToday = todayAttendances.filter((a: any) => a.status === 'Present').length;
  const absentToday = todayAttendances.filter((a: any) => a.status === 'Absent').length;
  const lateToday = todayAttendances.filter((a: any) => a.status === 'Late').length;

  // Upcoming holidays
  const upcomingHolidays = holidays
    .filter((h: any) => dayjs(h.date).isAfter(dayjs()))
    .sort((a: any, b: any) => dayjs(a.date).diff(dayjs(b.date)))
    .slice(0, 5);

  // Active trainings
  const activeTrainings = trainings.filter((t: any) => t.isActive).length;

  // Active announcements (pinned or recent)
  const activeAnnouncements = announcements.filter((a: any) => a.isActive).length;
  const pinnedAnnouncements = announcements.filter((a: any) => a.isPinned && a.isActive);

  // Calculate total payroll for current month
  const currentMonth = dayjs().format('YYYY-MM');
  const currentMonthPayrolls = payrolls.filter((p: any) =>
    dayjs(p.periodStart).format('YYYY-MM') === currentMonth ||
    dayjs(p.periodEnd).format('YYYY-MM') === currentMonth
  );
  const totalPayrollAmount = currentMonthPayrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);

  // Department distribution
  const departmentDistribution = useMemo(() => {
    const deptMap = new Map<string, number>();
    employees.forEach((e: any) => {
      const deptName = e.departmentName || 'Belirtilmemiş';
      deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
    });
    return Array.from(deptMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [employees]);

  // Employment type distribution
  const employmentTypeDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();
    const typeLabels: Record<string, string> = {
      FullTime: 'Tam Zamanlı',
      PartTime: 'Yarı Zamanlı',
      Contract: 'Sözleşmeli',
      Intern: 'Stajyer',
      Temporary: 'Geçici',
    };
    employees.forEach((e: any) => {
      const type = typeLabels[e.employmentType] || e.employmentType || 'Belirtilmemiş';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // Recent leaves
  const recentLeaves = [...leaves]
    .sort((a: any, b: any) => dayjs(b.createdAt || b.startDate).diff(dayjs(a.createdAt || a.startDate)))
    .slice(0, 5);

  // Combined loading state
  const isLoading = employeesLoading || departmentsLoading;

  // Pending leaves columns
  const pendingLeavesColumns: ColumnsType<any> = [
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text: string, record: any) => (
        <Link href={`/hr/leaves/${record.id}`}>
          <span className="text-sm font-medium text-slate-900 hover:text-violet-600">{text}</span>
        </Link>
      ),
    },
    {
      title: 'İzin Türü',
      dataIndex: 'leaveTypeName',
      key: 'leaveTypeName',
      render: (text: string) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'Tarih',
      key: 'dates',
      render: (_: any, record: any) => (
        <span className="text-sm text-slate-500">
          {dayjs(record.startDate).format('DD.MM')} - {dayjs(record.endDate).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = leaveStatusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  // Today's attendance columns
  const attendanceColumns: ColumnsType<any> = [
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text: string) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Giriş',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => <span className="text-sm text-slate-600">{time ? time.substring(0, 5) : '-'}</span>,
    },
    {
      title: 'Çıkış',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => <span className="text-sm text-slate-600">{time ? time.substring(0, 5) : '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = attendanceStatusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <ListPageHeader
        icon={<IdentificationIcon className="w-4 h-4" />}
        iconColor="#7c3aed"
        title="İnsan Kaynakları"
        description="İK yönetim paneli ve genel bakış"
        secondaryActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetchEmployees()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4" className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Link href="/hr/employees">
              <button className="px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4" />
                Çalışanlar
              </button>
            </Link>
          </div>
        }
      />

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Çalışan</span>
              <div className="text-2xl font-semibold text-slate-900">{employeesLoading ? '-' : totalEmployees}</div>
              <span className="text-xs text-slate-400">{activeEmployees} aktif</span>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <UserGroupIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Departmanlar</span>
              <div className="text-2xl font-semibold text-slate-900">{departmentsLoading ? '-' : totalDepartments}</div>
              <span className="text-xs text-slate-400">{activeDepartments} aktif</span>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <BuildingLibraryIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Pozisyonlar</span>
              <div className="text-2xl font-semibold text-slate-900">{positionsLoading ? '-' : positions.length}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <IdentificationIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Bu Ay Bordro</span>
              <div className="text-2xl font-semibold text-slate-900">{payrollsLoading ? '-' : formatCurrency(totalPayrollAmount)}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <CurrencyDollarIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/hr/leaves?status=Pending">
          <div className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer ${pendingLeaves > 0 ? 'border-orange-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pendingLeaves > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
                  <CalendarIcon className="w-4 h-4" className={pendingLeaves > 0 ? 'text-orange-500' : 'text-slate-400'} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{pendingLeaves}</div>
                  <div className="text-sm text-slate-500">Bekleyen İzin Talebi</div>
                </div>
              </div>
              {pendingLeaves > 0 && <Tag color="orange">Onay Bekliyor</Tag>}
            </div>
          </div>
        </Link>
        <Link href="/hr/trainings">
          <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTrainings > 0 ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  <BookOpenIcon className="w-4 h-4" className={activeTrainings > 0 ? 'text-blue-500' : 'text-slate-400'} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{activeTrainings}</div>
                  <div className="text-sm text-slate-500">Aktif Eğitim</div>
                </div>
              </div>
              {activeTrainings > 0 && <Tag color="blue">Devam Ediyor</Tag>}
            </div>
          </div>
        </Link>
        <Link href="/hr/announcements">
          <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeAnnouncements > 0 ? 'bg-purple-50' : 'bg-slate-50'}`}>
                  <BellIcon className="w-4 h-4" className={activeAnnouncements > 0 ? 'text-purple-500' : 'text-slate-400'} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{activeAnnouncements}</div>
                  <div className="text-sm text-slate-500">Aktif Duyuru</div>
                </div>
              </div>
              {pinnedAnnouncements.length > 0 && <Tag color="purple">{pinnedAnnouncements.length} Sabitlenmiş</Tag>}
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Attendance Summary */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
            <ClockIcon className="w-4 h-4" style={{ color: '#10b981' }} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Bugünkü Yoklama Özeti</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <CheckCircleIcon className="w-4 h-4" className="text-green-500 text-lg mb-1" />
            <div className="text-xl font-semibold text-slate-900">{presentToday}</div>
            <div className="text-xs text-slate-500">Mevcut</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <ExclamationTriangleIcon className="w-4 h-4" className="text-red-500 text-lg mb-1" />
            <div className="text-xl font-semibold text-slate-900">{absentToday}</div>
            <div className="text-xs text-slate-500">Yok</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <ClockIcon className="w-4 h-4" className="text-orange-500 text-lg mb-1" />
            <div className="text-xl font-semibold text-slate-900">{lateToday}</div>
            <div className="text-xs text-slate-500">Geç Kalan</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <UserGroupIcon className="w-4 h-4" className="text-blue-500 text-lg mb-1" />
            <div className="text-xl font-semibold text-slate-900">
              {activeEmployees > 0 ? ((presentToday + lateToday) / activeEmployees * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-slate-500">Katılım Oranı</div>
          </div>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Distribution */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <BuildingLibraryIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Departman Dağılımı</h3>
          </div>
          {departmentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip />
                <Bar dataKey="value" name="Çalışan Sayısı" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Veri yok" />
          )}
        </Card>

        {/* Employment Type Distribution */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <UserIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Çalışma Türü Dağılımı</h3>
          </div>
          {employmentTypeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={employmentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(props: any) => `${props.name}: ${props.value}`}
                >
                  {employmentTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Veri yok" />
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leaves */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
                <CalendarIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Son İzin Talepleri</h3>
            </div>
            <Link href="/hr/leaves" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              Tümünü Gör →
            </Link>
          </div>
          {recentLeaves.length > 0 ? (
            <Table
              columns={pendingLeavesColumns}
              dataSource={recentLeaves}
              rowKey="id"
              pagination={false}
              size="small"
              loading={leavesLoading}
              className="enterprise-table"
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="İzin talebi yok" />
          )}
        </Card>

        {/* Today's Attendance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
                <ClockIcon className="w-4 h-4" style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Bugünkü Yoklama</h3>
            </div>
            <Link href="/hr/attendance" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              Tümünü Gör →
            </Link>
          </div>
          {todayAttendances.length > 0 ? (
            <Table
              columns={attendanceColumns}
              dataSource={todayAttendances.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
              loading={attendancesLoading}
              className="enterprise-table"
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bugün yoklama kaydı yok" />
          )}
        </Card>

        {/* Upcoming Holidays */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444415' }}>
                <GiftIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Yaklaşan Tatiller</h3>
            </div>
            <Link href="/hr/holidays" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
              Tümünü Gör →
            </Link>
          </div>
          {upcomingHolidays.length > 0 ? (
            <List
              dataSource={upcomingHolidays}
              loading={holidaysLoading}
              renderItem={(holiday: any) => {
                const daysUntil = dayjs(holiday.date).diff(dayjs(), 'day');
                return (
                  <List.Item className="!px-0 !py-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
                          <GiftIcon className="w-4 h-4" className="text-red-500 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{holiday.name}</div>
                          <div className="text-xs text-slate-500">{dayjs(holiday.date).format('DD MMMM YYYY')}</div>
                        </div>
                      </div>
                      <Tag color={daysUntil <= 7 ? 'red' : daysUntil <= 30 ? 'orange' : 'blue'}>
                        {daysUntil} gün
                      </Tag>
                    </div>
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Yaklaşan tatil yok" />
          )}
        </Card>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <BellIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Sabitlenmiş Duyurular</h3>
          </div>
          <List
            dataSource={pinnedAnnouncements}
            loading={announcementsLoading}
            renderItem={(announcement: any) => {
              const priorityColors: Record<string, string> = {
                Low: 'default',
                Normal: 'blue',
                High: 'orange',
                Urgent: 'red',
              };
              return (
                <List.Item className="!px-0">
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 shrink-0">
                      <BellIcon className="w-4 h-4" className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/hr/announcements/${announcement.id}`}>
                        <div className="text-sm font-medium text-slate-900 hover:text-violet-600">{announcement.title}</div>
                      </Link>
                      <div className="text-sm text-slate-500 line-clamp-2 mt-1">
                        {announcement.content?.substring(0, 150)}...
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Tag color={priorityColors[announcement.priority] || 'default'}>
                          {announcement.priority}
                        </Tag>
                        <span className="text-xs text-slate-400">
                          {dayjs(announcement.publishDate).format('DD.MM.YYYY')}
                        </span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>
      )}
    </PageContainer>
  );
}
