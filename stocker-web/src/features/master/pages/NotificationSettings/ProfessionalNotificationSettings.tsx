import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Avatar,
  LinearProgress,
  CircularProgress,
  Fade,
  Zoom,
  Slide,
  alpha,
  useTheme,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhonelinkRing as PushIcon,
  Webhook as WebhookIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
  DeviceHub as DeviceHubIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Replay as RetryIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  AccessTime as PendingIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as InactiveIcon,
  Message as MessageIcon,
  Campaign as CampaignIcon,
  Tune as TuneIcon,
  Rule as RuleIcon,
  Timeline as TimelineIcon,
  Integration as IntegrationIcon,
  AutoAwesome as TemplateIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Test as TestIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import './professional-notification-settings.css';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack';
  enabled: boolean;
  configuration: {
    [key: string]: any;
  };
  lastUsed: string;
  totalSent: number;
  successRate: number;
  status: 'active' | 'inactive' | 'error';
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  channels: string[];
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  subject?: string;
  content: string;
  variables: string[];
  usageCount: number;
  status: 'active' | 'draft';
  createdAt: string;
  lastModified: string;
}

interface NotificationHistory {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string;
  subject?: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  deliveredAt?: string;
  error?: string;
  channel: string;
  templateId?: string;
}

const ProfessionalNotificationSettings: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [openChannelDialog, setOpenChannelDialog] = useState(false);
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data
  const stats = [
    {
      title: 'Toplam Bildirim',
      value: '12.5K',
      change: 15.2,
      icon: <NotificationsIcon />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Teslim Oranı',
      value: '94.8%',
      change: 2.3,
      icon: <SuccessIcon />,
      color: '#48c774',
      gradient: 'linear-gradient(135deg, #48c774 0%, #3ec46d 100%)'
    },
    {
      title: 'Başarısız',
      value: '164',
      change: -8.1,
      icon: <ErrorIcon />,
      color: '#ee5a52',
      gradient: 'linear-gradient(135deg, #ee5a52 0%, #f47068 100%)'
    },
    {
      title: 'Bekleyen',
      value: '23',
      change: 0,
      icon: <PendingIcon />,
      color: '#f6ab2e',
      gradient: 'linear-gradient(135deg, #f6ab2e 0%, #f79e1b 100%)'
    }
  ];

  const channels: NotificationChannel[] = [
    {
      id: '1',
      name: 'E-posta Kanalı',
      type: 'email',
      enabled: true,
      configuration: {
        smtp: 'smtp.gmail.com',
        port: 587,
        username: 'notifications@stocker.com'
      },
      lastUsed: '2024-01-20T10:30:00Z',
      totalSent: 8432,
      successRate: 96.7,
      status: 'active'
    },
    {
      id: '2',
      name: 'SMS Kanalı',
      type: 'sms',
      enabled: true,
      configuration: {
        provider: 'Twilio',
        phoneNumber: '+90-555-123-4567'
      },
      lastUsed: '2024-01-20T09:45:00Z',
      totalSent: 1234,
      successRate: 98.2,
      status: 'active'
    },
    {
      id: '3',
      name: 'Push Bildirimleri',
      type: 'push',
      enabled: false,
      configuration: {
        firebaseKey: 'AAAA...',
        apnsKey: 'MIIEvg...'
      },
      lastUsed: '2024-01-19T15:20:00Z',
      totalSent: 5678,
      successRate: 87.3,
      status: 'inactive'
    },
    {
      id: '4',
      name: 'Webhook Entegrasyonu',
      type: 'webhook',
      enabled: true,
      configuration: {
        url: 'https://api.example.com/webhook',
        secret: 'wh_secret_123'
      },
      lastUsed: '2024-01-20T11:15:00Z',
      totalSent: 2456,
      successRate: 94.1,
      status: 'active'
    }
  ];

  const alertRules: AlertRule[] = [
    {
      id: '1',
      name: 'Sistem Hatası Uyarısı',
      description: 'Sistemde kritik hata oluştuğunda bildirim gönder',
      condition: 'error_level = "critical"',
      channels: ['1', '2'],
      enabled: true,
      priority: 'critical',
      lastTriggered: '2024-01-20T08:30:00Z',
      triggerCount: 5,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Yüksek CPU Kullanımı',
      description: 'CPU kullanımı %90\'ı geçtiğinde uyar',
      condition: 'cpu_usage > 90',
      channels: ['1', '4'],
      enabled: true,
      priority: 'high',
      lastTriggered: '2024-01-19T14:22:00Z',
      triggerCount: 12,
      createdAt: '2024-01-10T09:30:00Z'
    },
    {
      id: '3',
      name: 'Yeni Kullanıcı Kaydı',
      description: 'Yeni kullanıcı kaydı gerçekleştiğinde bilgilendirme',
      condition: 'event_type = "user_registered"',
      channels: ['1'],
      enabled: false,
      priority: 'low',
      triggerCount: 234,
      createdAt: '2024-01-12T16:45:00Z'
    }
  ];

  const templates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Sistem Bakım Bildirimi',
      type: 'email',
      subject: 'Planlı Bakım Bildirimi - {{maintenance_date}}',
      content: 'Sayın {{user_name}}, sistemimizde planlı bakım çalışması yapılacaktır...',
      variables: ['user_name', 'maintenance_date', 'duration'],
      usageCount: 156,
      status: 'active',
      createdAt: '2024-01-10T10:00:00Z',
      lastModified: '2024-01-18T14:30:00Z'
    },
    {
      id: '2',
      name: 'Güvenlik Uyarısı',
      type: 'sms',
      content: 'UYARI: Hesabınızda {{event_time}} tarihinde şüpheli aktivite tespit edildi. {{security_link}}',
      variables: ['event_time', 'security_link'],
      usageCount: 89,
      status: 'active',
      createdAt: '2024-01-08T11:20:00Z',
      lastModified: '2024-01-15T09:45:00Z'
    },
    {
      id: '3',
      name: 'Yeni Özellik Duyurusu',
      type: 'push',
      content: 'Stocker\'da yeni özellik: {{feature_name}}! Hemen keşfedin.',
      variables: ['feature_name', 'feature_url'],
      usageCount: 0,
      status: 'draft',
      createdAt: '2024-01-20T16:00:00Z',
      lastModified: '2024-01-20T16:00:00Z'
    }
  ];

  const notificationHistory: NotificationHistory[] = [
    {
      id: '1',
      type: 'email',
      recipient: 'admin@stocker.com',
      subject: 'Sistem Performans Raporu',
      status: 'delivered',
      sentAt: '2024-01-20T10:30:00Z',
      deliveredAt: '2024-01-20T10:31:23Z',
      channel: 'E-posta Kanalı',
      templateId: '1'
    },
    {
      id: '2',
      type: 'sms',
      recipient: '+90-555-123-4567',
      status: 'sent',
      sentAt: '2024-01-20T10:25:00Z',
      channel: 'SMS Kanalı'
    },
    {
      id: '3',
      type: 'webhook',
      recipient: 'https://api.example.com/webhook',
      status: 'failed',
      sentAt: '2024-01-20T10:20:00Z',
      error: 'Connection timeout',
      channel: 'Webhook Entegrasyonu'
    },
    {
      id: '4',
      type: 'push',
      recipient: 'device-token-abc123',
      status: 'pending',
      sentAt: '2024-01-20T10:15:00Z',
      channel: 'Push Bildirimleri'
    }
  ];

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon />;
      case 'sms':
        return <SmsIcon />;
      case 'push':
        return <PushIcon />;
      case 'webhook':
        return <WebhookIcon />;
      case 'slack':
        return <MessageIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <SuccessIcon sx={{ fontSize: 16, color: '#4CAF50' }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16, color: '#f44336' }} />;
      case 'pending':
        return <CircularProgress size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const handleTestNotification = () => {
    setOpenTestDialog(true);
  };

  const simulateTest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpenTestDialog(false);
      // Show success message
    }, 2000);
  };

  return (
    <Box className="professional-notification-settings">
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth={false}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" className="hero-title">
                Bildirim Yönetimi
              </Typography>
              <Typography variant="body1" className="hero-subtitle">
                Bildirim kanallarını yönetin, kurallar oluşturun ve teslim oranlarını optimize edin
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  className="primary-button"
                  onClick={() => setOpenChannelDialog(true)}
                >
                  Yeni Kanal
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RuleIcon />}
                  className="outlined-button"
                  onClick={() => setOpenRuleDialog(true)}
                >
                  Kural Ekle
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<TestIcon />}
                  className="outlined-button"
                  onClick={handleTestNotification}
                >
                  Test Gönder
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="hero-visual">
                <Box className="floating-card card-1">
                  <EmailIcon className="card-icon" />
                  <Typography variant="h6">E-posta</Typography>
                  <Typography variant="body2">96.7% başarı</Typography>
                </Box>
                <Box className="floating-card card-2">
                  <SmsIcon className="card-icon" />
                  <Typography variant="h6">SMS</Typography>
                  <Typography variant="body2">98.2% başarı</Typography>
                </Box>
                <Box className="floating-card card-3">
                  <WebhookIcon className="card-icon" />
                  <Typography variant="h6">Webhook</Typography>
                  <Typography variant="body2">94.1% başarı</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth={false} className="main-container">
        {/* Statistics Cards */}
        <Grid container spacing={3} className="stats-section">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in timeout={300 + index * 100}>
                <Card className="stat-card">
                  <CardContent>
                    <Box className="stat-icon" sx={{ background: stat.gradient }}>
                      {stat.icon}
                    </Box>
                    <Box className="stat-content">
                      <Typography variant="h4" className="stat-value">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" className="stat-title">
                        {stat.title}
                      </Typography>
                      {stat.change !== 0 && (
                        <Box className="stat-change">
                          <Chip
                            label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                            size="small"
                            className={stat.change > 0 ? 'chip-success' : 'chip-danger'}
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Notification Channels */}
        <Grid container spacing={3} className="channels-section">
          <Grid item xs={12}>
            <Typography variant="h5" className="section-title">
              Bildirim Kanalları
            </Typography>
          </Grid>
          {channels.map((channel, index) => (
            <Grid item xs={12} md={6} lg={3} key={channel.id}>
              <Fade in timeout={400 + index * 100}>
                <Card className="channel-card">
                  <CardContent>
                    <Box className="channel-header">
                      <Box className="channel-icon" sx={{ backgroundColor: alpha(channel.status === 'active' ? '#10b981' : '#6b7280', 0.1) }}>
                        {getChannelIcon(channel.type)}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="h6">{channel.name}</Typography>
                        <Chip
                          label={channel.status === 'active' ? 'Aktif' : 'Pasif'}
                          size="small"
                          color={channel.status === 'active' ? 'success' : 'default'}
                          icon={channel.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                        />
                      </Box>
                      <Switch checked={channel.enabled} />
                    </Box>
                    <Box className="channel-stats">
                      <Box className="stat-item">
                        <Typography variant="caption">Gönderilen</Typography>
                        <Typography variant="h6">{channel.totalSent.toLocaleString()}</Typography>
                      </Box>
                      <Box className="stat-item">
                        <Typography variant="caption">Başarı Oranı</Typography>
                        <Typography variant="h6">{channel.successRate}%</Typography>
                      </Box>
                      <Box className="stat-item">
                        <Typography variant="caption">Son Kullanım</Typography>
                        <Typography variant="body2">
                          {formatDistanceToNow(parseISO(channel.lastUsed), { locale: tr, addSuffix: true })}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="channel-progress">
                      <LinearProgress
                        variant="determinate"
                        value={channel.successRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha('#667eea', 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#667eea',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                    <Box className="channel-actions">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <SettingsIcon />
                      </IconButton>
                      <IconButton size="small">
                        <TestIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Paper className="content-paper" elevation={0}>
          <Box className="content-header">
            <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} className="content-tabs">
              <Tab label="Uyarı Kuralları" icon={<RuleIcon />} iconPosition="start" />
              <Tab label="Şablonlar" icon={<TemplateIcon />} iconPosition="start" />
              <Tab label="Geçmiş" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Entegrasyonlar" icon={<IntegrationIcon />} iconPosition="start" />
            </Tabs>
            <Box className="header-actions">
              <TextField
                placeholder="Ara..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                className="search-field"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                </Select>
              </FormControl>
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Tab Content */}
          {selectedTab === 0 && (
            <Box className="tab-content">
              <Box className="content-actions">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenRuleDialog(true)}
                  className="add-button"
                >
                  Yeni Kural
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {alertRules.map((rule, index) => (
                  <Grid item xs={12} md={6} key={rule.id}>
                    <Slide direction="up" in timeout={300 + index * 100}>
                      <Card className="rule-card">
                        <CardContent>
                          <Box className="rule-header">
                            <Box className="rule-info">
                              <Typography variant="h6" className="rule-name">
                                {rule.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {rule.description}
                              </Typography>
                            </Box>
                            <Box className="rule-status">
                              <Chip
                                label={rule.priority}
                                size="small"
                                sx={{ 
                                  backgroundColor: alpha(getPriorityColor(rule.priority), 0.1),
                                  color: getPriorityColor(rule.priority),
                                  fontWeight: 600
                                }}
                              />
                              <Switch checked={rule.enabled} />
                            </Box>
                          </Box>
                          
                          <Box className="rule-condition">
                            <Typography variant="caption" color="text.secondary">
                              Koşul:
                            </Typography>
                            <Typography variant="body2" className="condition-text">
                              {rule.condition}
                            </Typography>
                          </Box>

                          <Box className="rule-channels">
                            <Typography variant="caption" color="text.secondary">
                              Kanallar:
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              {rule.channels.map((channelId) => {
                                const channel = channels.find(c => c.id === channelId);
                                return channel ? (
                                  <Chip
                                    key={channelId}
                                    label={channel.name}
                                    size="small"
                                    icon={getChannelIcon(channel.type)}
                                    variant="outlined"
                                  />
                                ) : null;
                              })}
                            </Stack>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Grid container spacing={2} className="rule-stats">
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Tetiklenme
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {rule.triggerCount} kez
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Son Tetikleme
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {rule.lastTriggered 
                                  ? formatDistanceToNow(parseISO(rule.lastTriggered), { locale: tr, addSuffix: true })
                                  : 'Hiç'
                                }
                              </Typography>
                            </Grid>
                          </Grid>

                          <Box className="rule-actions">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                            <IconButton size="small">
                              <TestIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Slide>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box className="tab-content">
              <Box className="content-actions">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenTemplateDialog(true)}
                  className="add-button"
                >
                  Yeni Şablon
                </Button>
              </Box>

              <Grid container spacing={3}>
                {templates.map((template, index) => (
                  <Grid item xs={12} md={6} key={template.id}>
                    <Fade in timeout={300 + index * 100}>
                      <Card className="template-card">
                        <CardContent>
                          <Box className="template-header">
                            <Box className="template-info">
                              <Typography variant="h6" className="template-name">
                                {template.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                <Chip
                                  label={template.type}
                                  size="small"
                                  icon={getChannelIcon(template.type)}
                                  variant="outlined"
                                />
                                <Chip
                                  label={template.status === 'active' ? 'Aktif' : 'Taslak'}
                                  size="small"
                                  color={template.status === 'active' ? 'success' : 'default'}
                                />
                              </Stack>
                            </Box>
                            <Box className="template-actions">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>

                          {template.subject && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Konu:
                              </Typography>
                              <Typography variant="body2" className="template-subject">
                                {template.subject}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              İçerik Önizlemesi:
                            </Typography>
                            <Typography variant="body2" className="template-content">
                              {template.content.substring(0, 100)}...
                            </Typography>
                          </Box>

                          <Box className="template-variables">
                            <Typography variant="caption" color="text.secondary">
                              Değişkenler:
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                              {template.variables.map((variable) => (
                                <Chip
                                  key={variable}
                                  label={`{{${variable}}}`}
                                  size="small"
                                  className="variable-chip"
                                />
                              ))}
                            </Stack>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Kullanım
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {template.usageCount} kez
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Son Değişiklik
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {format(parseISO(template.lastModified), 'dd MMM', { locale: tr })}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedTab === 2 && (
            <Box className="tab-content">
              <Timeline className="notification-timeline">
                {notificationHistory.map((notification, index) => (
                  <TimelineItem key={notification.id}>
                    <TimelineOppositeContent className="timeline-time">
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(notification.sentAt), 'dd MMM yyyy', { locale: tr })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(parseISO(notification.sentAt), 'HH:mm', { locale: tr })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot className={`timeline-dot ${notification.status}`}>
                        {getStatusIcon(notification.status)}
                      </TimelineDot>
                      {index < notificationHistory.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Slide direction="left" in timeout={300 + index * 100}>
                        <Card className="history-card">
                          <CardContent>
                            <Box className="history-header">
                              <Box className="history-info">
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                  {getChannelIcon(notification.type)}
                                  <Typography variant="h6">
                                    {notification.type.toUpperCase()}
                                  </Typography>
                                  <Chip
                                    label={notification.status}
                                    size="small"
                                    color={getStatusColor(notification.status) as any}
                                    icon={getStatusIcon(notification.status)}
                                  />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  Alıcı: {notification.recipient}
                                </Typography>
                                {notification.subject && (
                                  <Typography variant="body2" color="text.secondary">
                                    Konu: {notification.subject}
                                  </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                  Kanal: {notification.channel}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {notification.error && (
                              <Alert severity="error" sx={{ mt: 2 }}>
                                <AlertTitle>Hata</AlertTitle>
                                {notification.error}
                              </Alert>
                            )}

                            <Box className="history-details">
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Gönderim
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {format(parseISO(notification.sentAt), 'HH:mm:ss', { locale: tr })}
                                  </Typography>
                                </Grid>
                                {notification.deliveredAt && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                      Teslim
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                      {format(parseISO(notification.deliveredAt), 'HH:mm:ss', { locale: tr })}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </CardContent>
                        </Card>
                      </Slide>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Box>
          )}

          {selectedTab === 3 && (
            <Box className="tab-content">
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card className="integration-card">
                    <CardContent>
                      <Box className="integration-header">
                        <MessageIcon className="integration-icon slack" />
                        <Typography variant="h6">Slack</Typography>
                        <Switch />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Slack kanallarına bildirim gönder
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                        Yapılandır
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card className="integration-card">
                    <CardContent>
                      <Box className="integration-header">
                        <WebhookIcon className="integration-icon webhook" />
                        <Typography variant="h6">Discord</Typography>
                        <Switch />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Discord sunucularına webhook gönder
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                        Yapılandır
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card className="integration-card">
                    <CardContent>
                      <Box className="integration-header">
                        <PushIcon className="integration-icon firebase" />
                        <Typography variant="h6">Firebase</Typography>
                        <Switch />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Firebase push notification servis
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                        Yapılandır
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Test Notification Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Test Bildirimi Gönder</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Kanal</InputLabel>
              <Select defaultValue="">
                {channels.map((channel) => (
                  <MenuItem key={channel.id} value={channel.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getChannelIcon(channel.type)}
                      {channel.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Alıcı"
              placeholder="E-posta, telefon veya webhook URL"
            />
            <TextField
              fullWidth
              label="Konu (E-posta için)"
              placeholder="Test bildirimi"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="İçerik"
              placeholder="Bu bir test bildirimidir."
            />
          </Stack>
          {loading && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Bildirim gönderiliyor...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={simulateTest} disabled={loading} startIcon={<SendIcon />}>
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessionalNotificationSettings;