'use client';

/**
 * HR Dashboard Page
 * Monochrome design system following inventory page patterns
 */

import React, { useMemo } from 'react';
import { Table, List, Empty, Spin, Tooltip, Progress } from 'antd';
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
  DocumentTextIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  BanknotesIcon,
  ScaleIcon,
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

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// Format currency
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0 TL';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Empty State Component
const EmptyChart = ({ icon: Icon, message }: { icon: React.ComponentType<any>; message: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
    <Icon className="w-10 h-10 mb-3" />
    <span className="text-sm">{message}</span>
  </div>
);

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
      const deptName = e.departmentName || 'Belirtilmemis';
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
      FullTime: 'Tam Zamanli',
      PartTime: 'Yari Zamanli',
      Contract: 'Sozlesmeli',
      Intern: 'Stajyer',
      Temporary: 'Gecici',
    };
    employees.forEach((e: any) => {
      const type = typeLabels[e.employmentType] || e.employmentType || 'Belirtilmemis';
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
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text: string, record: any) => (
        <Link href={`/hr/leaves/${record.id}`}>
          <span className="text-sm font-medium text-slate-900 hover:text-slate-700">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Izin Turu',
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
        const statusStyles: Record<string, string> = {
          Pending: 'bg-slate-100 text-slate-700',
          Approved: 'bg-slate-900 text-white',
          Rejected: 'bg-slate-200 text-slate-600',
          Cancelled: 'bg-slate-50 text-slate-400',
        };
        const statusLabels: Record<string, string> = {
          Pending: 'Beklemede',
          Approved: 'Onaylandi',
          Rejected: 'Reddedildi',
          Cancelled: 'Iptal',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
            {statusLabels[status] || status}
          </span>
        );
      },
    },
  ];

  // Today's attendance columns
  const attendanceColumns: ColumnsType<any> = [
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text: string) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Giris',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => <span className="text-sm text-slate-600">{time ? time.substring(0, 5) : '-'}</span>,
    },
    {
      title: 'Cikis',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => <span className="text-sm text-slate-600">{time ? time.substring(0, 5) : '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusStyles: Record<string, string> = {
          Present: 'bg-slate-900 text-white',
          Absent: 'bg-slate-200 text-slate-600',
          Late: 'bg-slate-100 text-slate-700',
          HalfDay: 'bg-slate-100 text-slate-600',
          OnLeave: 'bg-slate-50 text-slate-500',
        };
        const statusLabels: Record<string, string> = {
          Present: 'Mevcut',
          Absent: 'Yok',
          Late: 'Gec',
          HalfDay: 'Yarim Gun',
          OnLeave: 'Izinli',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
            {statusLabels[status] || status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <IdentificationIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Insan Kaynaklari</h1>
            <p className="text-sm text-slate-500">IK yonetim paneli ve genel bakis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchEmployees()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/hr/employees">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              <UserGroupIcon className="w-4 h-4" />
              Calisanlar
            </button>
          </Link>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Toplam Calisan</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{employeesLoading ? '-' : totalEmployees}</span>
              <span className="text-sm text-slate-400">{activeEmployees} aktif</span>
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Departmanlar</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{departmentsLoading ? '-' : totalDepartments}</span>
              <span className="text-sm text-slate-400">{activeDepartments} aktif</span>
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pozisyonlar</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{positionsLoading ? '-' : positions.length}</span>
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bu Ay Bordro</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{payrollsLoading ? '-' : formatCurrency(totalPayrollAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-4">
          <Link href="/hr/leaves?status=Pending">
            <div className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer ${
              pendingLeaves > 0 ? 'border-slate-300' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  pendingLeaves > 0 ? 'bg-slate-900' : 'bg-slate-100'
                }`}>
                  <CalendarIcon className={`w-5 h-5 ${pendingLeaves > 0 ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-900">{pendingLeaves}</div>
                  <div className="text-sm text-slate-500">Bekleyen Izin Talebi</div>
                </div>
                {pendingLeaves > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                    Onay Bekliyor
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
        <div className="col-span-4">
          <Link href="/hr/trainings">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activeTrainings > 0 ? 'bg-slate-700' : 'bg-slate-100'
                }`}>
                  <BookOpenIcon className={`w-5 h-5 ${activeTrainings > 0 ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-900">{activeTrainings}</div>
                  <div className="text-sm text-slate-500">Aktif Egitim</div>
                </div>
                {activeTrainings > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                    Devam Ediyor
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
        <div className="col-span-4">
          <Link href="/hr/announcements">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activeAnnouncements > 0 ? 'bg-slate-500' : 'bg-slate-100'
                }`}>
                  <BellIcon className={`w-5 h-5 ${activeAnnouncements > 0 ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-900">{activeAnnouncements}</div>
                  <div className="text-sm text-slate-500">Aktif Duyuru</div>
                </div>
                {pinnedAnnouncements.length > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                    {pinnedAnnouncements.length} Sabitlenmis
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Attendance Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bugunku Yoklama Ozeti</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <CheckCircleIcon className="w-5 h-5 text-slate-700 mx-auto mb-2" />
            <div className="text-xl font-bold text-slate-900">{presentToday}</div>
            <div className="text-xs text-slate-500">Mevcut</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-slate-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-slate-900">{absentToday}</div>
            <div className="text-xs text-slate-500">Yok</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <ClockIcon className="w-5 h-5 text-slate-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-slate-900">{lateToday}</div>
            <div className="text-xs text-slate-500">Gec Kalan</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <UserGroupIcon className="w-5 h-5 text-slate-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-slate-900">
              {activeEmployees > 0 ? ((presentToday + lateToday) / activeEmployees * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-slate-500">Katilim Orani</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Department Distribution */}
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingLibraryIcon className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departman Dagilimi</p>
            </div>
            {departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentDistribution} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Calisan Sayisi" fill="#1e293b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={BuildingLibraryIcon} message="Veri yok" />
            )}
          </div>
        </div>

        {/* Employment Type Distribution */}
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calisma Turu Dagilimi</p>
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
                      <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={UserIcon} message="Veri yok" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Pending Leaves */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Son Izin Talepleri</p>
              </div>
              <Link href="/hr/leaves" className="text-xs text-slate-500 hover:text-slate-900">
                Tumunu Gor
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
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            ) : (
              <EmptyChart icon={CalendarIcon} message="Izin talebi yok" />
            )}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bugunku Yoklama</p>
              </div>
              <Link href="/hr/attendance" className="text-xs text-slate-500 hover:text-slate-900">
                Tumunu Gor
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
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            ) : (
              <EmptyChart icon={ClockIcon} message="Bugun yoklama kaydi yok" />
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <GiftIcon className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yaklasan Tatiller</p>
              </div>
              <Link href="/hr/holidays" className="text-xs text-slate-500 hover:text-slate-900">
                Tumunu Gor
              </Link>
            </div>
            {upcomingHolidays.length > 0 ? (
              <List
                dataSource={upcomingHolidays}
                loading={holidaysLoading}
                renderItem={(holiday: any) => {
                  const daysUntil = dayjs(holiday.date).diff(dayjs(), 'day');
                  return (
                    <List.Item className="!px-0 !py-3 !border-b !border-slate-100 last:!border-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                            <GiftIcon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{holiday.name}</div>
                            <div className="text-xs text-slate-500">{dayjs(holiday.date).format('DD MMMM YYYY')}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          daysUntil <= 7 ? 'bg-slate-900 text-white' :
                          daysUntil <= 30 ? 'bg-slate-200 text-slate-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {daysUntil} gun
                        </span>
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <EmptyChart icon={GiftIcon} message="Yaklasan tatil yok" />
            )}
          </div>
        </div>
      </div>

      {/* Türkiye Mevzuatı - Hızlı Erişim Kartları */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <ScaleIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Türkiye Mevzuatı</p>
            <p className="text-sm text-white/80">İş Kanunu, SGK ve KVKK Uyumlu İşlemler</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Kıdem Tazminatı Hesaplama */}
          <Link href="/hr/severance-calculator">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <CalculatorIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Kıdem & İhbar</h3>
                  <p className="text-xs text-white/60">Tazminat Hesaplama</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">4857 İş Kanunu</span>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Güncel</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">2025/1 Tavan</span>
                  <span className="text-white font-medium">₺41.828,42</span>
                </div>
              </div>
            </div>
          </Link>

          {/* SGK Bildirgeleri */}
          <Link href="/hr/sgk-declarations">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">SGK Bildirgeleri</h3>
                  <p className="text-xs text-white/60">APHB & Eksik Gün</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">5510 Sayılı Kanun</span>
                <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Bildirim</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">SGK Prim İşveren</span>
                  <span className="text-white font-medium">%22,5</span>
                </div>
              </div>
            </div>
          </Link>

          {/* KVKK Uyumu */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">KVKK Uyumu</h3>
                <p className="text-xs text-white/60">Veri Koruma</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">6698 Sayılı Kanun</span>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Uyumlu</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs text-white/60 mb-1">Veri Koruma Seviyesi</div>
              <Progress percent={85} size="small" strokeColor="#10b981" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
            </div>
          </div>

          {/* PDKS Bildirimi */}
          <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <DocumentChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">PDKS Bildirimi</h3>
                <p className="text-xs text-white/60">GİB Raporlama</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">SGK Mevzuatı</span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">10+ Çalışan</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Aylık Bildirim</span>
                <span className="text-white font-medium">XML Format</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span>✓ 4857 İş Kanunu Uyumlu</span>
            <span>✓ 5510 SGK Uyumlu</span>
            <span>✓ 6698 KVKK Uyumlu</span>
            <span>✓ GİB Entegrasyonu</span>
          </div>
          <Tooltip title="Tüm hesaplamalar güncel mevzuata göre yapılmaktadır">
            <span className="text-xs text-white/40 cursor-help">Son güncelleme: Ocak 2025</span>
          </Tooltip>
        </div>
      </div>

      {/* Bordro ve Yasal Kesintiler Özeti */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BanknotesIcon className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">2024 Yasal Kesinti Oranları</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">SGK İşçi Payı</span>
                  <p className="text-xs text-slate-500">Sigorta + İşsizlik</p>
                </div>
                <span className="text-lg font-bold text-slate-900">%15</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">SGK İşveren Payı</span>
                  <p className="text-xs text-slate-500">Sigorta + İşsizlik + 5 Puan İndirim</p>
                </div>
                <span className="text-lg font-bold text-slate-900">%22,5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">Gelir Vergisi</span>
                  <p className="text-xs text-slate-500">Artan oranlı (5 dilim)</p>
                </div>
                <span className="text-lg font-bold text-slate-900">%15-40</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">Damga Vergisi</span>
                  <p className="text-xs text-slate-500">Ücret ve tazminatlar</p>
                </div>
                <span className="text-lg font-bold text-slate-900">‰7,59</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">2025 Asgari Ücret Bilgileri</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-lg">
                <div>
                  <span className="text-sm font-medium">Brüt Asgari Ücret</span>
                  <p className="text-xs text-white/60">2025 Yılı</p>
                </div>
                <span className="text-lg font-bold">₺22.104,67</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">Net Asgari Ücret</span>
                  <p className="text-xs text-slate-500">Bekar, çocuksuz</p>
                </div>
                <span className="text-lg font-bold text-slate-900">₺22.104,67</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">SGK Tavan</span>
                  <p className="text-xs text-slate-500">Prime esas kazanç üst sınırı</p>
                </div>
                <span className="text-lg font-bold text-slate-900">₺165.784,50</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-900">Kıdem Tavanı</span>
                  <p className="text-xs text-slate-500">2025/1 Dönemi</p>
                </div>
                <span className="text-lg font-bold text-slate-900">₺41.828,42</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <BellIcon className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sabitlenmis Duyurular</p>
          </div>
          <List
            dataSource={pinnedAnnouncements}
            loading={announcementsLoading}
            renderItem={(announcement: any) => {
              const priorityStyles: Record<string, string> = {
                Low: 'bg-slate-50 text-slate-500',
                Normal: 'bg-slate-100 text-slate-600',
                High: 'bg-slate-200 text-slate-700',
                Urgent: 'bg-slate-900 text-white',
              };
              return (
                <List.Item className="!px-0 !py-4 !border-b !border-slate-100 last:!border-0">
                  <div className="flex items-start gap-4 w-full">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 shrink-0">
                      <BellIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/hr/announcements/${announcement.id}`}>
                        <div className="text-sm font-medium text-slate-900 hover:text-slate-700">{announcement.title}</div>
                      </Link>
                      <div className="text-sm text-slate-500 line-clamp-2 mt-1">
                        {announcement.content?.substring(0, 150)}...
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityStyles[announcement.priority] || 'bg-slate-100 text-slate-600'}`}>
                          {announcement.priority}
                        </span>
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
        </div>
      )}
    </div>
  );
}
