import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  MoreVert as MoreIcon,
  ArrowForward as ArrowIcon,
  Notifications as NotificationIcon,
  Assessment as AssessmentIcon,
  Computer as ComputerIcon,
  NetworkCheck as NetworkIcon,
  Receipt as ReceiptIcon,
  PersonOutline as OnlineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  LineChart,
  Line,
  Area,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

const DashboardPage: React.FC = () => {
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 2845,
    serverLoad: 68,
    memoryUsage: 72,
    diskUsage: 45,
    networkLatency: 12,
  });

  // Mock data for charts
  const revenueData = [
    { month: 'Oca', revenue: 185000, users: 1200, tenants: 120 },
    { month: 'Şub', revenue: 195000, users: 1350, tenants: 125 },
    { month: 'Mar', revenue: 220000, users: 1450, tenants: 135 },
    { month: 'Nis', revenue: 198000, users: 1380, tenants: 130 },
    { month: 'May', revenue: 235000, users: 1520, tenants: 142 },
    { month: 'Haz', revenue: 245680, users: 1680, tenants: 156 },
  ];

  const userGrowthData = [
    { month: 'Oca', newUsers: 150, activeUsers: 1200, churnRate: 2.1 },
    { month: 'Şub', newUsers: 180, activeUsers: 1350, churnRate: 1.8 },
    { month: 'Mar', newUsers: 220, activeUsers: 1450, churnRate: 2.3 },
    { month: 'Nis', newUsers: 165, activeUsers: 1380, churnRate: 2.7 },
    { month: 'May', newUsers: 280, activeUsers: 1520, churnRate: 1.5 },
    { month: 'Haz', newUsers: 320, activeUsers: 1680, churnRate: 1.2 },
  ];

  const tenantDistribution = [
    { name: 'Starter', value: 45, color: '#8884d8' },
    { name: 'Professional', value: 68, color: '#82ca9d' },
    { name: 'Enterprise', value: 43, color: '#ffc658' },
  ];

  const recentActivities = [
    { id: 1, type: 'tenant_created', user: 'ABC Teknoloji', time: '2 dakika önce', icon: <BusinessIcon /> },
    { id: 2, type: 'user_registered', user: '15 yeni kullanıcı', time: '5 dakika önce', icon: <PeopleIcon /> },
    { id: 3, type: 'payment_received', user: '₺12,500 ödeme', time: '8 dakika önce', icon: <MoneyIcon /> },
    { id: 4, type: 'system_update', user: 'Sistem güncellemesi', time: '15 dakika önce', icon: <ComputerIcon /> },
    { id: 5, type: 'backup_completed', user: 'Otomatik yedekleme', time: '1 saat önce', icon: <CloudIcon /> },
  ];

  const recentTransactions = [
    { id: '#TXN-001', company: 'ABC Teknoloji', plan: 'Enterprise', amount: '₺5,500', date: '2024-06-15', status: 'completed' },
    { id: '#TXN-002', company: 'XYZ Danışmanlık', plan: 'Professional', amount: '₺2,200', date: '2024-06-15', status: 'completed' },
    { id: '#TXN-003', company: 'Demo Şirketi', plan: 'Starter', amount: '₺650', date: '2024-06-14', status: 'pending' },
    { id: '#TXN-004', company: 'Test Organizasyon', plan: 'Professional', amount: '₺2,200', date: '2024-06-14', status: 'failed' },
  ];

  const performanceMetrics = [
    { name: 'CPU Kullanımı', value: 68, color: '#8884d8', unit: '%' },
    { name: 'RAM Kullanımı', value: 72, color: '#82ca9d', unit: '%' },
    { name: 'Disk Kullanımı', value: 45, color: '#ffc658', unit: '%' },
    { name: 'Ağ Gecikme', value: 12, color: '#ff7c7c', unit: 'ms' },
  ];

  const stats: StatCard[] = [
    {
      title: 'Toplam Kiracı',
      value: '156',
      change: 12.5,
      changeType: 'increase',
      icon: <BusinessIcon />,
      color: '#667eea',
    },
    {
      title: 'Aktif Kullanıcı',
      value: realTimeStats.activeUsers.toLocaleString(),
      change: 8.2,
      changeType: 'increase',
      icon: <OnlineIcon />,
      color: '#48c774',
    },
    {
      title: 'Aylık Gelir',
      value: '₺245,680',
      change: 15.3,
      changeType: 'increase',
      icon: <MoneyIcon />,
      color: '#f6ab2e',
    },
    {
      title: 'Depolama Kullanımı',
      value: '68%',
      change: 3.1,
      changeType: 'decrease',
      icon: <StorageIcon />,
      color: '#ee5a52',
    },
    {
      title: 'Son İşlemler',
      value: '1,247',
      change: 25.8,
      changeType: 'increase',
      icon: <ReceiptIcon />,
      color: '#9c88ff',
    },
    {
      title: 'Sistem Yükü',
      value: `${realTimeStats.serverLoad}%`,
      change: 5.2,
      changeType: 'decrease',
      icon: <SpeedIcon />,
      color: '#ff6b6b',
    },
  ];

  const recentTenants = [
    { id: 1, name: 'ABC Teknoloji', plan: 'Enterprise', users: 45, status: 'active' },
    { id: 2, name: 'XYZ Danışmanlık', plan: 'Professional', users: 23, status: 'active' },
    { id: 3, name: 'Demo Şirketi', plan: 'Starter', users: 8, status: 'trial' },
    { id: 4, name: 'Test Organizasyon', plan: 'Professional', users: 15, status: 'suspended' },
  ];

  const systemStatus = [
    { name: 'API Sunucusu', status: 'operational', uptime: '99.9%', response: '45ms' },
    { name: 'Veritabanı', status: 'operational', uptime: '99.8%', response: '12ms' },
    { name: 'Redis Cache', status: 'operational', uptime: '100%', response: '2ms' },
    { name: 'Yedekleme Servisi', status: 'warning', uptime: '98.5%', response: '120ms' },
  ];

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        serverLoad: Math.max(40, Math.min(90, prev.serverLoad + Math.floor(Math.random() * 6 - 3))),
        memoryUsage: Math.max(50, Math.min(85, prev.memoryUsage + Math.floor(Math.random() * 6 - 3))),
        diskUsage: Math.max(40, Math.min(80, prev.diskUsage + Math.floor(Math.random() * 2 - 1))),
        networkLatency: Math.max(8, Math.min(25, prev.networkLatency + Math.floor(Math.random() * 4 - 2))),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return 'success';
      case 'trial':
      case 'warning':
        return 'warning';
      case 'suspended':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckIcon sx={{ fontSize: 16 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Hoş Geldiniz, Admin!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
        </Typography>
      </Box>

      {/* Enhanced Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 3, mb: 4 }}>
        {stats.map((stat, index) => (
          <Box key={index}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'visible',
                height: 160,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${stat.color}dd 0%, ${stat.color}99 100%)`,
                  borderRadius: 'inherit',
                },
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  {stat.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUpIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 16 }} />
                  )}
                  <Typography variant="caption">
                    {stat.changeType === 'increase' ? '+' : '-'}{stat.change}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Revenue Chart */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Gelir Grafikleri - Aylık Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₺${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Gelir' : name === 'tenants' ? 'Kiracılar' : 'Kullanıcılar'
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#revenueGradient)"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Bar yAxisId="right" dataKey="tenants" fill="#82ca9d" />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Tenant Distribution Pie Chart */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Kiracı Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tenantDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {tenantDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Kiracı']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

      </Box>
      
      {/* User Growth Chart */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Kullanıcı Büyüme Trendi
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  name="Yeni Kullanıcılar"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  name="Aktif Kullanıcılar"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="churnRate"
                  stroke="#ff7c7c"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Churn Oranı (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* System Performance Metrics */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Sistem Performansı
            </Typography>
            <Box sx={{ mb: 3 }}>
              {performanceMetrics.map((metric, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {metric.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.name === 'Ağ Gecikme' ? realTimeStats.networkLatency : metric.value}{metric.unit}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.name === 'Ağ Gecikme' ? (realTimeStats.networkLatency / 50) * 100 : metric.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}99 100%)`,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
            
            {/* Real-time Active Users */}
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Badge badgeContent="CANLI" color="success">
                <OnlineIcon color="primary" sx={{ fontSize: 32 }} />
              </Badge>
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                {realTimeStats.activeUsers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Şu Anda Aktif Kullanıcı
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Second Row - Activities and Transactions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Real-time Activity Feed */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Badge badgeContent="5" color="error">
                <NotificationIcon color="primary" />
              </Badge>
              <Typography variant="h6" fontWeight="600" sx={{ ml: 2 }}>
                Son Aktiviteler
              </Typography>
            </Box>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.user}
                    secondary={activity.time}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Tüm Aktiviteleri Gör
            </Button>
          </Paper>
        </Box>

        {/* Recent Transactions Table */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Son İşlemler
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Şirket</TableCell>
                    <TableCell>Tutar</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {transaction.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {transaction.company}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.plan}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" color="success.main">
                          {transaction.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={getStatusColor(transaction.status) as any}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Recent Tenants */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Son Eklenen Kiracılar
              </Typography>
              <Button
                variant="text"
                endIcon={<ArrowIcon />}
                sx={{ textTransform: 'none' }}
              >
                Tümünü Gör
              </Button>
            </Box>
            <List>
              {recentTenants.map((tenant) => (
                <ListItem
                  key={tenant.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      {tenant.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={tenant.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={tenant.plan} size="small" variant="outlined" />
                        <Chip
                          label={`${tenant.users} kullanıcı`}
                          size="small"
                          icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={tenant.status}
                      color={getStatusColor(tenant.status) as any}
                      size="small"
                    />
                    <IconButton edge="end" size="small">
                      <MoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Enhanced System Status with Health Monitoring */}
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Sunucu Sağlık İzleme
            </Typography>
            <List>
              {systemStatus.map((system, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    {getStatusIcon(system.status)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={system.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption">
                          Uptime: {system.uptime}
                        </Typography>
                        <Typography variant="caption">
                          Yanıt: {system.response}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={system.status}
                    color={getStatusColor(system.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
            
            {/* Storage Usage Gauge */}
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                Depolama Kullanımı
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  1.2 TB / 2.0 TB kullanılıyor
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  68%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={68}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #ff7c7c 0%, #ff9999 100%)',
                  },
                }}
              />
            </Box>

            {/* Overall System Health */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckIcon color="success" />
                <Typography variant="subtitle2" fontWeight="600">
                  Genel Sistem Sağlığı
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                98.5%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tüm sistemler normal çalışıyor
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Quick Actions - Enhanced */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
            Hızlı İşlemler
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2 }}>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BusinessIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                Yeni Kiracı Ekle
              </Button>
            </Box>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PeopleIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                Kullanıcı Yönet
              </Button>
            </Box>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                Yedekleme Başlat
              </Button>
            </Box>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SecurityIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                Güvenlik Tarama
              </Button>
            </Box>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssessmentIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                Raporlar
              </Button>
            </Box>
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<NetworkIcon />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
              >
                Ağ İzleme
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;