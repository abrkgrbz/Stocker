import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Badge,
  Stack,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as DeprecatedIcon,
  Star as PopularIcon,
  Recommend as RecommendIcon,
  Visibility as ViewIcon,
  Assessment as StatsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Business as BusinessIcon,
  Compare as CompareIcon,
  SwapHoriz as MigrateIcon,
  Timeline as AnalyticsIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type {
  Package,
  PackageType,
  PackageStatus,
  PackageFilters,
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageStats,
  PackageFeature,
  PackageModule,
  PackageComparison,
  BillingCycle,
} from '../../types/package';
import packageService from '../../services/packageService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`package-tabpanel-${index}`}
      aria-labelledby={`package-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PackagesPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<PackageFilters>({});
  const [packageStats, setPackageStats] = useState<PackageStats | null>(null);
  const [currentView, setCurrentView] = useState<'grid' | 'table' | 'comparison'>('grid');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [bulkActionsMenuAnchor, setBulkActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuPackage, setContextMenuPackage] = useState<Package | null>(null);
  
  // Form states
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [newPackage, setNewPackage] = useState<Partial<CreatePackageRequest>>({
    pricing: { monthly: 0, yearly: 0, currency: 'TRY' },
    limits: { maxUsers: 1, storageGB: 1, apiRequestsPerMonth: 1000, supportLevel: 'basic' },
    settings: { isPopular: false, isRecommended: false, displayOrder: 0, trialDays: 14, allowDowngrade: true, allowUpgrade: true, requiresApproval: false },
    features: [],
    modules: [],
  });
  const [editPackage, setEditPackage] = useState<Partial<UpdatePackageRequest>>({});
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [comparisonPackages, setComparisonPackages] = useState<Package[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Load packages
  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await packageService.getPackages(currentPage + 1, pageSize, filters);
      setPackages(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      showSnackbar('Paket listesi yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Load package statistics
  const loadPackageStats = useCallback(async () => {
    try {
      const stats = await packageService.getPackageStats();
      setPackageStats(stats);
    } catch (error) {
      console.error('Failed to load package stats:', error);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    loadPackageStats();
  }, [loadPackageStats]);

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'deprecated': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case 'active': return <ActiveIcon />;
      case 'inactive': return <InactiveIcon />;
      case 'deprecated': return <DeprecatedIcon />;
    }
  };

  const getTypeColor = (type: PackageType) => {
    switch (type) {
      case 'starter': return '#2196f3';
      case 'professional': return '#ff9800';
      case 'enterprise': return '#4caf50';
      case 'custom': return '#9c27b0';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatLimit = (limit: number | 'unlimited') => {
    return limit === 'unlimited' ? 'Sınırsız' : limit.toLocaleString();
  };

  // Event handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setFilters(prev => ({ ...prev, search: event.target.value || undefined }));
  };

  const handleViewPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDetailsDialogOpen(true);
    setDetailsTabValue(0);
  };

  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditPackage({
      name: pkg.name,
      description: pkg.description,
      shortDescription: pkg.shortDescription,
      status: pkg.status,
      pricing: pkg.pricing,
      limits: pkg.limits,
      settings: pkg.settings,
    });
    setEditDialogOpen(true);
  };

  const handleDeletePackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const handleCreatePackage = async () => {
    try {
      await packageService.createPackage(newPackage as CreatePackageRequest);
      showSnackbar('Paket başarıyla oluşturuldu', 'success');
      setCreateDialogOpen(false);
      setNewPackage({
        pricing: { monthly: 0, yearly: 0, currency: 'TRY' },
        limits: { maxUsers: 1, storageGB: 1, apiRequestsPerMonth: 1000, supportLevel: 'basic' },
        settings: { isPopular: false, isRecommended: false, displayOrder: 0, trialDays: 14, allowDowngrade: true, allowUpgrade: true, requiresApproval: false },
        features: [],
        modules: [],
      });
      loadPackages();
    } catch (error) {
      showSnackbar('Paket oluşturulamadı', 'error');
    }
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;
    
    try {
      await packageService.updatePackage(selectedPackage.id, editPackage);
      showSnackbar('Paket başarıyla güncellendi', 'success');
      setEditDialogOpen(false);
      setEditPackage({});
      setSelectedPackage(null);
      loadPackages();
    } catch (error) {
      showSnackbar('Paket güncellenemedi', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPackage) return;
    
    try {
      await packageService.deletePackage(selectedPackage.id);
      showSnackbar('Paket başarıyla silindi', 'success');
      setDeleteDialogOpen(false);
      setSelectedPackage(null);
      loadPackages();
    } catch (error) {
      showSnackbar('Paket silinemedi', 'error');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPackages.length === 0) return;

    try {
      await packageService.bulkAction({
        action: action as any,
        packageIds: selectedPackages as string[],
      });
      showSnackbar(`${selectedPackages.length} paket için toplu işlem gerçekleştirildi`, 'success');
      setBulkActionsMenuAnchor(null);
      setSelectedPackages([]);
      loadPackages();
    } catch (error) {
      showSnackbar('Toplu işlem gerçekleştirilemedi', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await packageService.exportPackages(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packages-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSnackbar('Paket listesi dışa aktarıldı', 'success');
    } catch (error) {
      showSnackbar('Dışa aktarma işlemi başarısız', 'error');
    }
  };

  const handleClonePackage = async (pkg: Package) => {
    try {
      const clonedName = `${pkg.name} (Kopya)`;
      await packageService.clonePackage(pkg.id, clonedName);
      showSnackbar('Paket başarıyla kopyalandı', 'success');
      loadPackages();
    } catch (error) {
      showSnackbar('Paket kopyalanamadı', 'error');
    }
  };

  const handleComparePackages = () => {
    if (selectedPackages.length < 2) {
      showSnackbar('Karşılaştırma için en az 2 paket seçin', 'warning');
      return;
    }
    const packagesToCompare = packages.filter(pkg => selectedPackages.includes(pkg.id));
    setComparisonPackages(packagesToCompare);
    setComparisonDialogOpen(true);
  };

  const handlePaginationModelChange = (model: any) => {
    setCurrentPage(model.page);
    setPageSize(model.pageSize);
  };

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Paket Adı',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: getTypeColor(params.row.type),
            }}
          >
            {params.row.name[0].toUpperCase()}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" fontWeight="500">
                {params.value}
              </Typography>
              {params.row.settings.isPopular && (
                <Chip icon={<PopularIcon />} label="Popüler" size="small" color="warning" />
              )}
              {params.row.settings.isRecommended && (
                <Chip icon={<RecommendIcon />} label="Önerilen" size="small" color="success" />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {params.row.shortDescription || params.row.description.substring(0, 50)}...
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Tip',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.value === 'starter' ? 'Başlangıç' :
            params.value === 'professional' ? 'Profesyonel' :
            params.value === 'enterprise' ? 'Kurumsal' :
            'Özel'
          }
          sx={{
            bgcolor: getTypeColor(params.value) + '20',
            color: getTypeColor(params.value),
          }}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={
            params.value === 'active' ? 'Aktif' :
            params.value === 'inactive' ? 'Pasif' :
            'Kullanımdan Kaldırıldı'
          }
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'pricing',
      headerName: 'Fiyatlandırma',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {formatCurrency(params.value.monthly)}/ay
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatCurrency(params.value.yearly)}/yıl
          </Typography>
        </Box>
      ),
    },
    {
      field: 'limits',
      headerName: 'Limitler',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Kullanıcı: {formatLimit(params.value.maxUsers)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Depolama: {formatLimit(params.value.storageGB)} GB
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            API: {formatLimit(params.value.apiRequestsPerMonth)}/ay
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stats',
      headerName: 'Aboneler',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" fontWeight="500">
            {params.value.totalSubscribers}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            toplam
          </Typography>
        </Box>
      ),
    },
    {
      field: 'revenue',
      headerName: 'Aylık Gelir',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500" color="success.main">
          {formatCurrency(params.row.stats.monthlyRevenue)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 120,
      getActions: (params: any) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Detayları Görüntüle"
          onClick={() => handleViewPackage(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Düzenle"
          onClick={() => handleEditPackage(params.row)}
        />,
        <GridActionsCellItem
          icon={<MoreVertIcon />}
          label="Daha Fazla"
          onClick={(event) => {
            setContextMenuAnchor(event.currentTarget as HTMLElement);
            setContextMenuPackage(params.row);
          }}
        />,
      ],
    },
  ];

  // Statistics cards data
  const statsCards = packageStats ? [
    {
      title: 'Toplam Paket',
      value: packages.length.toLocaleString(),
      icon: <BusinessIcon />,
      color: '#667eea',
    },
    {
      title: 'Aktif Aboneler',
      value: packageStats.activeSubscribers.toLocaleString(),
      icon: <PeopleIcon />,
      color: '#48c774',
    },
    {
      title: 'Aylık Gelir',
      value: formatCurrency(packageStats.monthlyRevenue),
      icon: <MoneyIcon />,
      color: '#3498db',
    },
    {
      title: 'Yıllık Gelir',
      value: formatCurrency(packageStats.yearlyRevenue),
      icon: <TrendingUpIcon />,
      color: '#e74c3c',
    },
    {
      title: 'Ortalama LTV',
      value: formatCurrency(packageStats.averageLifetimeValue),
      icon: <StatsIcon />,
      color: '#f39c12',
    },
    {
      title: 'Dönüşüm Oranı',
      value: `${packageStats.conversionRate.toFixed(1)}%`,
      icon: <TrendingUpIcon />,
      color: '#9b59b6',
    },
  ] : [];

  // Package cards for grid view
  const renderPackageCard = (pkg: Package) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          '&:hover': { 
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        {pkg.settings.isPopular && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: 16,
              bgcolor: 'warning.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: '0 0 8px 8px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1,
            }}
          >
            POPÜLER
          </Box>
        )}
        
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: getTypeColor(pkg.type),
                }}
              >
                {pkg.name[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {pkg.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pkg.type === 'starter' ? 'Başlangıç' :
                   pkg.type === 'professional' ? 'Profesyonel' :
                   pkg.type === 'enterprise' ? 'Kurumsal' : 'Özel'}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={getStatusIcon(pkg.status)}
              label={
                pkg.status === 'active' ? 'Aktif' :
                pkg.status === 'inactive' ? 'Pasif' :
                'Kullanımdan Kaldırıldı'
              }
              color={getStatusColor(pkg.status) as any}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {pkg.shortDescription || pkg.description}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {formatCurrency(pkg.pricing.monthly)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                /ay
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(pkg.pricing.yearly)}/yıl (tasarruf: {Math.round(((pkg.pricing.monthly * 12 - pkg.pricing.yearly) / (pkg.pricing.monthly * 12)) * 100)}%)
            </Typography>
            {pkg.settings.trialDays > 0 && (
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                {pkg.settings.trialDays} gün ücretsiz deneme
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Temel Özellikler:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption">
                👥 {formatLimit(pkg.limits.maxUsers)} kullanıcı
              </Typography>
              <Typography variant="caption">
                💾 {formatLimit(pkg.limits.storageGB)} GB depolama
              </Typography>
              <Typography variant="caption">
                🔌 {formatLimit(pkg.limits.apiRequestsPerMonth)} API çağrısı/ay
              </Typography>
              <Typography variant="caption">
                🎧 {pkg.limits.supportLevel === 'basic' ? 'Temel' :
                     pkg.limits.supportLevel === 'standard' ? 'Standart' :
                     pkg.limits.supportLevel === 'premium' ? 'Premium' : 'Kurumsal'} destek
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Aktif Aboneler: {pkg.stats.activeSubscribers}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Aylık Gelir: {formatCurrency(pkg.stats.monthlyRevenue)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ViewIcon />}
              onClick={() => handleViewPackage(pkg)}
              fullWidth
            >
              Detay
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleEditPackage(pkg)}
              fullWidth
            >
              Düzenle
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  // Comparison table
  const renderComparisonTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Özellik</TableCell>
            {comparisonPackages.map((pkg) => (
              <TableCell key={pkg.id} align="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {pkg.name}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {formatCurrency(pkg.pricing.monthly)}/ay
                  </Typography>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">Kullanıcı Limiti</TableCell>
            {comparisonPackages.map((pkg) => (
              <TableCell key={pkg.id} align="center">
                {formatLimit(pkg.limits.maxUsers)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Depolama</TableCell>
            {comparisonPackages.map((pkg) => (
              <TableCell key={pkg.id} align="center">
                {formatLimit(pkg.limits.storageGB)} GB
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">API Çağrısı/Ay</TableCell>
            {comparisonPackages.map((pkg) => (
              <TableCell key={pkg.id} align="center">
                {formatLimit(pkg.limits.apiRequestsPerMonth)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Destek Seviyesi</TableCell>
            {comparisonPackages.map((pkg) => (
              <TableCell key={pkg.id} align="center">
                {pkg.limits.supportLevel === 'basic' ? 'Temel' :
                 pkg.limits.supportLevel === 'standard' ? 'Standart' :
                 pkg.limits.supportLevel === 'premium' ? 'Premium' : 'Kurumsal'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">Deneme Süresi</TableCell>
            {comparisonPackages.map((pkg) => (
              <TableCell key={pkg.id} align="center">
                {pkg.settings.trialDays} gün
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Paket Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Abonelik paketlerini yönetin, fiyatlandırma yapın ve özellik setlerini düzenleyin
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 3, mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Box key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${stat.color}dd 0%, ${stat.color}99 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'visible',
                height: 120,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
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
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Main Content */}
      <Paper sx={{ mb: 3 }}>
        {/* Toolbar */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2, alignItems: 'center' }}>
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Paket ara..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tabs
                  value={currentView}
                  onChange={(_, newValue) => setCurrentView(newValue)}
                  sx={{ minHeight: 'auto' }}
                >
                  <Tab label="Kartlar" value="grid" />
                  <Tab label="Tablo" value="table" />
                  <Tab label="Karşılaştırma" value="comparison" />
                </Tabs>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {/* Handle filter dialog */}}
                >
                  Filtrele
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Dışa Aktar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  disabled={selectedPackages.length < 2}
                  onClick={handleComparePackages}
                >
                  Karşılaştır ({selectedPackages.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MoreVertIcon />}
                  disabled={selectedPackages.length === 0}
                  onClick={(e) => setBulkActionsMenuAnchor(e.currentTarget)}
                >
                  Toplu İşlemler ({selectedPackages.length})
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Paket Ekle
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Content based on current view */}
        {currentView === 'grid' && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {packages.map(renderPackageCard)}
            </Grid>
          </Box>
        )}

        {currentView === 'table' && (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={packages}
              columns={columns}
              paginationModel={{ page: currentPage, pageSize }}
              onPaginationModelChange={handlePaginationModelChange}
              rowCount={totalCount}
              paginationMode="server"
              loading={loading}
              checkboxSelection
              rowSelectionModel={selectedPackages}
              onRowSelectionModelChange={setSelectedPackages}
              disableRowSelectionOnClick
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={{
                '& .MuiDataGrid-row:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            />
          </Box>
        )}

        {currentView === 'comparison' && (
          <Box sx={{ p: 3 }}>
            {comparisonPackages.length > 0 ? (
              renderComparisonTable()
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CompareIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Karşılaştırma için paket seçin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En az 2 paket seçerek karşılaştırma yapabilirsiniz
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Create Package Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            Yeni Paket Oluştur
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Temel Bilgiler
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Paket Adı"
                value={newPackage.name || ''}
                onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Slug (URL)"
                value={newPackage.slug || ''}
                onChange={(e) => setNewPackage(prev => ({ ...prev, slug: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Paket Tipi</InputLabel>
                <Select
                  value={newPackage.type || ''}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, type: e.target.value as PackageType }))}
                >
                  <MenuItem value="starter">Başlangıç</MenuItem>
                  <MenuItem value="professional">Profesyonel</MenuItem>
                  <MenuItem value="enterprise">Kurumsal</MenuItem>
                  <MenuItem value="custom">Özel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Açıklama"
                value={newPackage.description || ''}
                onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Fiyatlandırma
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Aylık Fiyat (₺)"
                value={newPackage.pricing?.monthly || 0}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing!, monthly: Number(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Yıllık Fiyat (₺)"
                value={newPackage.pricing?.yearly || 0}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing!, yearly: Number(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Kurulum Ücreti (₺)"
                value={newPackage.pricing?.setupFee || 0}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing!, setupFee: Number(e.target.value) }
                }))}
              />
            </Grid>

            {/* Limits */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Limitler
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Maksimum Kullanıcı"
                value={newPackage.limits?.maxUsers || 1}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  limits: { ...prev.limits!, maxUsers: Number(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Depolama (GB)"
                value={newPackage.limits?.storageGB || 1}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  limits: { ...prev.limits!, storageGB: Number(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="API Çağrısı/Ay"
                value={newPackage.limits?.apiRequestsPerMonth || 1000}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  limits: { ...prev.limits!, apiRequestsPerMonth: Number(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Destek Seviyesi</InputLabel>
                <Select
                  value={newPackage.limits?.supportLevel || 'basic'}
                  onChange={(e) => setNewPackage(prev => ({
                    ...prev,
                    limits: { ...prev.limits!, supportLevel: e.target.value as any }
                  }))}
                >
                  <MenuItem value="basic">Temel</MenuItem>
                  <MenuItem value="standard">Standart</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="enterprise">Kurumsal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Paket Ayarları
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPackage.settings?.isPopular || false}
                      onChange={(e) => setNewPackage(prev => ({
                        ...prev,
                        settings: { ...prev.settings!, isPopular: e.target.checked }
                      }))}
                    />
                  }
                  label="Popüler Paket"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPackage.settings?.isRecommended || false}
                      onChange={(e) => setNewPackage(prev => ({
                        ...prev,
                        settings: { ...prev.settings!, isRecommended: e.target.checked }
                      }))}
                    />
                  }
                  label="Önerilen Paket"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Deneme Süresi (Gün)"
                value={newPackage.settings?.trialDays || 14}
                onChange={(e) => setNewPackage(prev => ({
                  ...prev,
                  settings: { ...prev.settings!, trialDays: Number(e.target.value) }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleCreatePackage}>
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
      >
        <MenuItem onClick={() => { handleViewPackage(contextMenuPackage!); setContextMenuAnchor(null); }}>
          <ListItemIcon><ViewIcon /></ListItemIcon>
          <ListItemText>Detayları Görüntüle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEditPackage(contextMenuPackage!); setContextMenuAnchor(null); }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleClonePackage(contextMenuPackage!); setContextMenuAnchor(null); }}>
          <ListItemIcon><CopyIcon /></ListItemIcon>
          <ListItemText>Kopyala</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleDeletePackage(contextMenuPackage!); setContextMenuAnchor(null); }}>
          <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkActionsMenuAnchor}
        open={Boolean(bulkActionsMenuAnchor)}
        onClose={() => setBulkActionsMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction('activate')}>
          <ListItemIcon><ActiveIcon color="success" /></ListItemIcon>
          <ListItemText>Aktif Yap</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('deactivate')}>
          <ListItemIcon><InactiveIcon /></ListItemIcon>
          <ListItemText>Pasif Yap</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleBulkAction('delete')}>
          <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>

      {/* Comparison Dialog */}
      <Dialog
        open={comparisonDialogOpen}
        onClose={() => setComparisonDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CompareIcon />
              Paket Karşılaştırması
            </Box>
            <IconButton onClick={() => setComparisonDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderComparisonTable()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Paketi Sil
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz! Paket ve tüm abonelikleri kalıcı olarak silinecektir.
          </Alert>
          <Typography>
            <strong>{selectedPackage?.name}</strong> paketini silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default PackagesPage;