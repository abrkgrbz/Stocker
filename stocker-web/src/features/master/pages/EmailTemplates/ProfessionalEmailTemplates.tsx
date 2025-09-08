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
  Fade,
  Zoom,
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
  Tabs
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Send as SendIcon,
  CheckCircle as ActiveIcon,
  Warning as DraftIcon,
  Archive as ArchiveIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Palette as PaletteIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  Campaign as CampaignIcon,
  Receipt as TransactionIcon,
  Notifications as NotificationIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import './professional-email-templates.css';

interface Template {
  id: string;
  name: string;
  subject: string;
  category: 'system' | 'marketing' | 'transaction' | 'notification';
  status: 'active' | 'draft' | 'archived';
  language: string;
  usageCount: number;
  lastUsed: string;
  openRate: number;
  clickRate: number;
  thumbnail?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const ProfessionalEmailTemplates: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data
  const templates: Template[] = [
    {
      id: '1',
      name: 'Hoş Geldiniz E-postası',
      subject: 'Stocker\'a Hoş Geldiniz! 🎉',
      category: 'system',
      status: 'active',
      language: 'TR',
      usageCount: 1234,
      lastUsed: '2 saat önce',
      openRate: 78.5,
      clickRate: 45.2,
      tags: ['onboarding', 'welcome'],
      createdBy: 'Admin',
      createdAt: '2024-01-15',
      thumbnail: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Welcome'
    },
    {
      id: '2',
      name: 'Aylık Bülten',
      subject: 'Aylık Haberler ve Güncellemeler',
      category: 'marketing',
      status: 'active',
      language: 'TR',
      usageCount: 856,
      lastUsed: '1 gün önce',
      openRate: 65.3,
      clickRate: 32.8,
      tags: ['newsletter', 'monthly'],
      createdBy: 'Marketing',
      createdAt: '2024-01-10',
      thumbnail: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Newsletter'
    },
    {
      id: '3',
      name: 'Fatura Bildirimi',
      subject: 'Faturanız Hazır #{{invoice_number}}',
      category: 'transaction',
      status: 'active',
      language: 'TR',
      usageCount: 3421,
      lastUsed: '30 dakika önce',
      openRate: 92.1,
      clickRate: 67.4,
      tags: ['invoice', 'billing'],
      createdBy: 'System',
      createdAt: '2024-01-05',
      thumbnail: 'https://via.placeholder.com/300x200/4caf50/ffffff?text=Invoice'
    },
    {
      id: '4',
      name: 'Şifre Sıfırlama',
      subject: 'Şifre Sıfırlama Talebi',
      category: 'system',
      status: 'active',
      language: 'TR',
      usageCount: 432,
      lastUsed: '3 saat önce',
      openRate: 95.2,
      clickRate: 78.9,
      tags: ['security', 'password'],
      createdBy: 'Security',
      createdAt: '2024-01-08',
      thumbnail: 'https://via.placeholder.com/300x200/ff9800/ffffff?text=Security'
    },
    {
      id: '5',
      name: 'Özel Kampanya',
      subject: '🎁 Size Özel %30 İndirim!',
      category: 'marketing',
      status: 'draft',
      language: 'TR',
      usageCount: 0,
      lastUsed: '-',
      openRate: 0,
      clickRate: 0,
      tags: ['campaign', 'discount'],
      createdBy: 'Marketing',
      createdAt: '2024-01-20',
      thumbnail: 'https://via.placeholder.com/300x200/e91e63/ffffff?text=Campaign'
    },
    {
      id: '6',
      name: 'Sistem Bildirimi',
      subject: 'Önemli Sistem Güncellemesi',
      category: 'notification',
      status: 'active',
      language: 'TR',
      usageCount: 156,
      lastUsed: '1 hafta önce',
      openRate: 72.3,
      clickRate: 23.5,
      tags: ['system', 'update'],
      createdBy: 'DevOps',
      createdAt: '2024-01-12',
      thumbnail: 'https://via.placeholder.com/300x200/2196f3/ffffff?text=Notification'
    }
  ];

  const stats: StatCard[] = [
    {
      title: 'Toplam Şablon',
      value: '24',
      change: 12,
      icon: <EmailIcon />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Gönderilen',
      value: '15.2K',
      change: 8.5,
      icon: <SendIcon />,
      color: '#48c774',
      gradient: 'linear-gradient(135deg, #48c774 0%, #3ec46d 100%)'
    },
    {
      title: 'Açılma Oranı',
      value: '78.5%',
      change: 5.2,
      icon: <TrendingUpIcon />,
      color: '#f6ab2e',
      gradient: 'linear-gradient(135deg, #f6ab2e 0%, #f79e1b 100%)'
    },
    {
      title: 'Tıklama Oranı',
      value: '45.3%',
      change: -2.1,
      icon: <AnalyticsIcon />,
      color: '#ee5a52',
      gradient: 'linear-gradient(135deg, #ee5a52 0%, #f47068 100%)'
    }
  ];

  const categories = [
    { id: 'all', label: 'Tümü', icon: <EmailIcon />, count: templates.length },
    { id: 'system', label: 'Sistem', icon: <SettingsIcon />, count: 8 },
    { id: 'marketing', label: 'Pazarlama', icon: <CampaignIcon />, count: 6 },
    { id: 'transaction', label: 'İşlem', icon: <TransactionIcon />, count: 5 },
    { id: 'notification', label: 'Bildirim', icon: <NotificationIcon />, count: 5 }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon sx={{ fontSize: 16 }} />;
      case 'draft':
        return <DraftIcon sx={{ fontSize: 16 }} />;
      case 'archived':
        return <ArchiveIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box className="professional-email-templates">
      {/* Header Section */}
      <Box className="page-header">
        <Container maxWidth={false}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" className="page-title">
                E-posta Şablonları
              </Typography>
              <Typography variant="body2" className="page-subtitle">
                Profesyonel e-posta şablonlarını yönetin ve özelleştirin
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<CodeIcon />}
                  className="outlined-button"
                >
                  HTML İçe Aktar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="primary-button"
                  size="large"
                >
                  Yeni Şablon
                </Button>
              </Stack>
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
                      <Box className="stat-change">
                        <Chip
                          label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                          size="small"
                          className={stat.change > 0 ? 'chip-success' : 'chip-danger'}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Filters and Actions */}
        <Paper className="filter-section" elevation={0}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Şablon ara..."
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
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <FormControl size="small" className="filter-select">
                  <InputLabel>Dil</InputLabel>
                  <Select value="all" label="Dil">
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="tr">Türkçe</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" className="filter-select">
                  <InputLabel>Durum</InputLabel>
                  <Select value="all" label="Durum">
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="draft">Taslak</MenuItem>
                    <MenuItem value="archived">Arşiv</MenuItem>
                  </Select>
                </FormControl>
                <IconButton className="icon-button">
                  <FilterIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Main Content Area */}
        <Grid container spacing={3}>
          {/* Categories Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper className="categories-sidebar" elevation={0}>
              <Typography variant="h6" className="sidebar-title">
                Kategoriler
              </Typography>
              <List>
                {categories.map((category) => (
                  <ListItemButton
                    key={category.id}
                    selected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="category-item"
                  >
                    <ListItemIcon className="category-icon">
                      {category.icon}
                    </ListItemIcon>
                    <ListItemText primary={category.label} />
                    <Chip label={category.count} size="small" className="category-count" />
                  </ListItemButton>
                ))}
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" className="sidebar-title">
                Hızlı İstatistikler
              </Typography>
              <Box className="quick-stats">
                <Box className="quick-stat-item">
                  <Typography variant="body2" color="text.secondary">
                    Bu Hafta Gönderilen
                  </Typography>
                  <Typography variant="h6">2,845</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    className="stat-progress"
                  />
                </Box>
                <Box className="quick-stat-item">
                  <Typography variant="body2" color="text.secondary">
                    Ortalama Açılma Süresi
                  </Typography>
                  <Typography variant="h6">2.3 saat</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    className="stat-progress"
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Templates Grid */}
          <Grid item xs={12} md={9}>
            <Box className="templates-header">
              <Typography variant="h6">
                {filteredTemplates.length} şablon bulundu
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'active' : ''}
                >
                  <AutoAwesomeIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'active' : ''}
                >
                  <FilterIcon />
                </IconButton>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              {filteredTemplates.map((template, index) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Fade in timeout={300 + index * 100}>
                    <Card className="template-card">
                      <Box className="template-thumbnail">
                        <img src={template.thumbnail} alt={template.name} />
                        <Box className="template-overlay">
                          <Stack direction="row" spacing={1}>
                            <IconButton className="overlay-action">
                              <PreviewIcon />
                            </IconButton>
                            <IconButton className="overlay-action">
                              <EditIcon />
                            </IconButton>
                            <IconButton className="overlay-action">
                              <DuplicateIcon />
                            </IconButton>
                          </Stack>
                        </Box>
                        <Chip
                          label={template.status}
                          size="small"
                          icon={getStatusIcon(template.status)}
                          color={getStatusColor(template.status) as any}
                          className="status-badge"
                        />
                      </Box>
                      <CardContent className="template-content">
                        <Typography variant="h6" className="template-name">
                          {template.name}
                        </Typography>
                        <Typography variant="body2" className="template-subject">
                          {template.subject}
                        </Typography>
                        
                        <Box className="template-stats">
                          <Box className="stat-item">
                            <Typography variant="caption">Açılma</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {template.openRate}%
                            </Typography>
                          </Box>
                          <Box className="stat-item">
                            <Typography variant="caption">Tıklama</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {template.clickRate}%
                            </Typography>
                          </Box>
                          <Box className="stat-item">
                            <Typography variant="caption">Kullanım</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {template.usageCount}
                            </Typography>
                          </Box>
                        </Box>

                        <Box className="template-footer">
                          <Stack direction="row" spacing={1}>
                            {template.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                className="template-tag"
                              />
                            ))}
                          </Stack>
                          <Typography variant="caption" className="template-date">
                            {template.lastUsed}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfessionalEmailTemplates;