'use client';

import React, { useMemo } from 'react';
import { Typography, Space, Button, Row, Col, Card, Statistic, Table, Tag, List, Empty, Progress, Spin, Alert } from 'antd';
import {
  TeamOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  BookOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UserOutlined,
  BankOutlined,
  FieldTimeOutlined,
  GiftOutlined,
  SyncOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  useEmployees,
  useDepartments,
  usePositions,
  useAttendances,
  useLeaves,
  usePayrolls,
  useTrainings,
  useAnnouncements,
  useHolidays,
  usePerformanceReviews,
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
  Legend,
} from 'recharts';

const { Title, Text } = Typography;

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
  const { data: attendances = [], isLoading: attendancesLoading } = useAttendances();
  const { data: leaves = [], isLoading: leavesLoading } = useLeaves();
  const { data: payrolls = [], isLoading: payrollsLoading } = usePayrolls();
  const { data: trainings = [], isLoading: trainingsLoading } = useTrainings();
  const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements();
  const { data: holidays = [], isLoading: holidaysLoading } = useHolidays();
  const { data: performanceReviews = [], isLoading: performanceLoading } = usePerformanceReviews();

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

  // Refresh data
  const handleRefresh = () => {
    refetchEmployees();
  };

  // Pending leaves columns
  const pendingLeavesColumns: ColumnsType<any> = [
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text: string, record: any) => (
        <Link href={`/hr/leaves/${record.id}`}>
          <span className="text-blue-600 hover:text-blue-800">{text}</span>
        </Link>
      ),
    },
    {
      title: 'İzin Türü',
      dataIndex: 'leaveTypeName',
      key: 'leaveTypeName',
    },
    {
      title: 'Tarih',
      key: 'dates',
      render: (_: any, record: any) => (
        <span>
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
    },
    {
      title: 'Giriş',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => time ? time.substring(0, 5) : '-',
    },
    {
      title: 'Çıkış',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => time ? time.substring(0, 5) : '-',
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <IdcardOutlined className="mr-2" />
            İnsan Kaynakları
          </Title>
          <Text type="secondary">İK yönetim paneli</Text>
        </div>
        <Space wrap>
          <Button
            icon={<SyncOutlined spin={isLoading} />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Yenile
          </Button>
          <Link href="/hr/employees">
            <Button type="primary" icon={<TeamOutlined />}>Çalışanlar</Button>
          </Link>
          <Link href="/hr/departments">
            <Button icon={<BankOutlined />}>Departmanlar</Button>
          </Link>
          <Link href="/hr/attendance">
            <Button icon={<FieldTimeOutlined />}>Yoklama</Button>
          </Link>
        </Space>
      </div>

      {/* Main Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Toplam Çalışan"
              value={totalEmployees}
              prefix={<TeamOutlined className="text-blue-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {activeEmployees} aktif</Text>}
              loading={employeesLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Departmanlar"
              value={totalDepartments}
              prefix={<BankOutlined className="text-green-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {activeDepartments} aktif</Text>}
              loading={departmentsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Pozisyonlar"
              value={positions.length}
              prefix={<IdcardOutlined className="text-purple-500" />}
              loading={positionsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Bu Ay Bordro"
              value={totalPayrollAmount}
              prefix={<DollarOutlined className="text-orange-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              loading={payrollsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className={`h-full ${pendingLeaves > 0 ? 'border-orange-200 bg-orange-50' : ''}`} hoverable>
            <Link href="/hr/leaves?status=Pending">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${pendingLeaves > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <CalendarOutlined className={`text-2xl ${pendingLeaves > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{pendingLeaves}</Text>
                    <div className="text-gray-500">Bekleyen İzin Talebi</div>
                  </div>
                </div>
                {pendingLeaves > 0 && <Tag color="orange">Onay Bekliyor</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="h-full" hoverable>
            <Link href="/hr/trainings">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${activeTrainings > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <BookOutlined className={`text-2xl ${activeTrainings > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{activeTrainings}</Text>
                    <div className="text-gray-500">Aktif Eğitim</div>
                  </div>
                </div>
                {activeTrainings > 0 && <Tag color="blue">Devam Ediyor</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="h-full" hoverable>
            <Link href="/hr/announcements">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${activeAnnouncements > 0 ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <NotificationOutlined className={`text-2xl ${activeAnnouncements > 0 ? 'text-purple-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{activeAnnouncements}</Text>
                    <div className="text-gray-500">Aktif Duyuru</div>
                  </div>
                </div>
                {pinnedAnnouncements.length > 0 && <Tag color="purple">{pinnedAnnouncements.length} Sabitlenmiş</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Today's Attendance Summary */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card title={<><FieldTimeOutlined className="text-green-500 mr-2" />Bugünkü Yoklama Özeti</>}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Mevcut"
                  value={presentToday}
                  valueStyle={{ color: '#10b981' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Yok"
                  value={absentToday}
                  valueStyle={{ color: '#ef4444' }}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Geç Kalan"
                  value={lateToday}
                  valueStyle={{ color: '#f59e0b' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Katılım Oranı"
                  value={activeEmployees > 0 ? ((presentToday + lateToday) / activeEmployees * 100).toFixed(1) : 0}
                  suffix="%"
                  valueStyle={{ color: '#3b82f6' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Department Distribution */}
        <Col xs={24} lg={12}>
          <Card title={<><BankOutlined className="text-blue-500 mr-2" />Departman Dağılımı</>}>
            {departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentDistribution} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Çalışan Sayısı" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Veri yok" />
            )}
          </Card>
        </Col>

        {/* Employment Type Distribution */}
        <Col xs={24} lg={12}>
          <Card title={<><UserOutlined className="text-purple-500 mr-2" />Çalışma Türü Dağılımı</>}>
            {employmentTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={employmentTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (%${(percent * 100).toFixed(0)})`}
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
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        {/* Pending Leaves */}
        <Col xs={24} lg={8}>
          <Card
            title={<><CalendarOutlined className="text-orange-500 mr-2" />Son İzin Talepleri</>}
            extra={<Link href="/hr/leaves"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {recentLeaves.length > 0 ? (
              <Table
                columns={pendingLeavesColumns}
                dataSource={recentLeaves}
                rowKey="id"
                pagination={false}
                size="small"
                loading={leavesLoading}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="İzin talebi yok" />
            )}
          </Card>
        </Col>

        {/* Today's Attendance */}
        <Col xs={24} lg={8}>
          <Card
            title={<><FieldTimeOutlined className="text-green-500 mr-2" />Bugünkü Yoklama</>}
            extra={<Link href="/hr/attendance"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {todayAttendances.length > 0 ? (
              <Table
                columns={attendanceColumns}
                dataSource={todayAttendances.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                loading={attendancesLoading}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bugün yoklama kaydı yok" />
            )}
          </Card>
        </Col>

        {/* Upcoming Holidays */}
        <Col xs={24} lg={8}>
          <Card
            title={<><GiftOutlined className="text-red-500 mr-2" />Yaklaşan Tatiller</>}
            extra={<Link href="/hr/holidays"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {upcomingHolidays.length > 0 ? (
              <List
                dataSource={upcomingHolidays}
                loading={holidaysLoading}
                renderItem={(holiday: any) => {
                  const daysUntil = dayjs(holiday.date).diff(dayjs(), 'day');
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div className="p-2 rounded-full bg-red-100">
                            <GiftOutlined className="text-red-500" />
                          </div>
                        }
                        title={holiday.name}
                        description={dayjs(holiday.date).format('DD MMMM YYYY')}
                      />
                      <Tag color={daysUntil <= 7 ? 'red' : daysUntil <= 30 ? 'orange' : 'blue'}>
                        {daysUntil} gün
                      </Tag>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Yaklaşan tatil yok" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Card
              title={<><NotificationOutlined className="text-purple-500 mr-2" />Sabitlenmiş Duyurular</>}
            >
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
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div className="p-2 rounded-full bg-purple-100">
                            <NotificationOutlined className="text-purple-500" />
                          </div>
                        }
                        title={
                          <Link href={`/hr/announcements/${announcement.id}`}>
                            <span className="text-blue-600 hover:text-blue-800">{announcement.title}</span>
                          </Link>
                        }
                        description={
                          <div>
                            <Text type="secondary" className="line-clamp-2">
                              {announcement.content?.substring(0, 150)}...
                            </Text>
                            <div className="mt-1">
                              <Tag color={priorityColors[announcement.priority] || 'default'}>
                                {announcement.priority}
                              </Tag>
                              <Text type="secondary" className="text-xs ml-2">
                                {dayjs(announcement.publishDate).format('DD.MM.YYYY')}
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
