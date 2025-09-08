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
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridActionsCellItem,
  GridToolbar,
  GridRowParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as ActiveIcon,
  Pause as SuspendedIcon,
  Schedule as TrialIcon,
  Cancel as ExpiredIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  AttachMoney as MoneyIcon,
  Assessment as StatsIcon,
  VpnKey as ApiKeyIcon,
  Domain as DomainIcon,
  History as ActivityIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  FileCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Tenant,
  TenantStatus,
  TenantPlan,
  TenantFilters,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantStats,
  TenantActivity,
  TenantApiKey,
} from '../../types/tenant';
import tenantService from '../../services/tenantService';

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
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const TenantsPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<GridRowSelectionModel>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<TenantFilters>({});
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionsMenuAnchor, setBulkActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuTenant, setContextMenuTenant] = useState<Tenant | null>(null);
  
  // Form states
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState<Partial<CreateTenantRequest>>({});
  const [editTenant, setEditTenant] = useState<Partial<UpdateTenantRequest>>({});
  const [tenantActivities, setTenantActivities] = useState<TenantActivity[]>([]);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Load tenants
  const loadTenants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tenantService.getTenants(currentPage + 1, pageSize, filters);
      setTenants(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      showSnackbar('Kiracı listesi yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Load tenant statistics
  const loadTenantStats = useCallback(async () => {
    try {
      const stats = await tenantService.getTenantStats();
      setTenantStats(stats);
    } catch (error) {
      console.error('Failed to load tenant stats:', error);
    }
  }, []);

  // Load tenant activities
  const loadTenantActivities = useCallback(async (tenantId: string) => {
    try {
      const response = await tenantService.getTenantActivities(tenantId);
      setTenantActivities(response.data);
    } catch (error) {
      console.error('Failed to load tenant activities:', error);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  useEffect(() => {
    loadTenantStats();
  }, [loadTenantStats]);

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'suspended': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: TenantStatus) => {
    switch (status) {
      case 'active': return <ActiveIcon />;
      case 'trial': return <TrialIcon />;
      case 'suspended': return <SuspendedIcon />;
      case 'expired': return <ExpiredIcon />;
    }
  };

  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case 'starter': return '#2196f3';
      case 'professional': return '#ff9800';
      case 'enterprise': return '#4caf50';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Kiracı Adı',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: getPlanColor(params.row.plan),
            }}
          >
            {params.row.name[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.slug}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'ownerEmail',
      headerName: 'Sahip',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.row.ownerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
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
            params.value === 'trial' ? 'Deneme' :
            params.value === 'suspended' ? 'Askıya Alındı' :
            'Süresi Doldu'
          }
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'plan',
      headerName: 'Plan',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={
            params.value === 'starter' ? 'Başlangıç' :
            params.value === 'professional' ? 'Profesyonel' :
            'Kurumsal'
          }
          sx={{
            bgcolor: getPlanColor(params.value) + '20',
            color: getPlanColor(params.value),
          }}
          size="small"
        />
      ),
    },
    {
      field: 'stats',
      headerName: 'Kullanıcılar',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" fontWeight="500">
            {params.value.activeUsers}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            / {params.row.limits.maxUsers}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'storageUsage',
      headerName: 'Depolama',
      width: 150,
      renderCell: (params) => {
        const used = params.row.limits.currentStorageGB;
        const total = params.row.limits.storageQuotaGB;
        const percentage = (used / total) * 100;
        
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">
                {formatBytes(used * 1024 * 1024 * 1024)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {percentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  bgcolor: percentage > 80 ? 'error.main' : 'primary.main',
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'revenue',
      headerName: 'Gelir',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500" color="success.main">
          ₺{params.row.stats.revenue.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Oluşturulma',
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption">
          {format(new Date(params.value), 'dd.MM.yyyy', { locale: tr })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Detayları Görüntüle"
          onClick={() => handleViewTenant(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Düzenle"
          onClick={() => handleEditTenant(params.row)}
        />,
        <GridActionsCellItem
          icon={<MoreVertIcon />}
          label="Daha Fazla"
          onClick={(event) => {
            setContextMenuAnchor(event.currentTarget as HTMLElement);
            setContextMenuTenant(params.row);
          }}
        />,
      ],
    },
  ];

  // Event handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setFilters(prev => ({ ...prev, search: event.target.value || undefined }));
  };

  const handleStatusFilter = (statuses: TenantStatus[]) => {
    setFilters(prev => ({ ...prev, status: statuses.length > 0 ? statuses : undefined }));
  };

  const handlePlanFilter = (plans: TenantPlan[]) => {
    setFilters(prev => ({ ...prev, plan: plans.length > 0 ? plans : undefined }));
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDetailsDialogOpen(true);
    setDetailsTabValue(0);
    if (tenant.id) {
      loadTenantActivities(tenant.id);
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditTenant({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status,
      plan: tenant.plan,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleCreateTenant = async () => {
    try {
      await tenantService.createTenant(newTenant as CreateTenantRequest);
      showSnackbar('Kiracı başarıyla oluşturuldu', 'success');
      setCreateDialogOpen(false);
      setNewTenant({});
      loadTenants();
    } catch (error) {
      showSnackbar('Kiracı oluşturulamadı', 'error');
    }
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      await tenantService.updateTenant(selectedTenant.id, editTenant);
      showSnackbar('Kiracı başarıyla güncellendi', 'success');
      setEditDialogOpen(false);
      setEditTenant({});
      setSelectedTenant(null);
      loadTenants();
    } catch (error) {
      showSnackbar('Kiracı güncellenemedi', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTenant) return;
    
    try {
      await tenantService.deleteTenant(selectedTenant.id);
      showSnackbar('Kiracı başarıyla silindi', 'success');
      setDeleteDialogOpen(false);
      setSelectedTenant(null);
      loadTenants();
    } catch (error) {
      showSnackbar('Kiracı silinemedi', 'error');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTenants.length === 0) return;

    try {
      await tenantService.bulkAction({
        action: action as any,
        tenantIds: selectedTenants as string[],
      });
      showSnackbar(`${selectedTenants.length} kiracı için toplu işlem gerçekleştirildi`, 'success');
      setBulkActionsMenuAnchor(null);
      setSelectedTenants([]);
      loadTenants();
    } catch (error) {
      showSnackbar('Toplu işlem gerçekleştirilemedi', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await tenantService.exportTenants(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tenants-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSnackbar('Kiracı listesi dışa aktarıldı', 'success');
    } catch (error) {
      showSnackbar('Dışa aktarma işlemi başarısız', 'error');
    }
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setCurrentPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleCreateApiKey = async (tenantId: string, keyData: { name: string; permissions: string[] }) => {
    try {
      await tenantService.createApiKey(tenantId, keyData);
      showSnackbar('API anahtarı oluşturuldu', 'success');
      if (selectedTenant?.id === tenantId) {
        const updatedTenant = await tenantService.getTenant(tenantId);
        setSelectedTenant(updatedTenant);
      }
    } catch (error) {
      showSnackbar('API anahtarı oluşturulamadı', 'error');
    }
  };

  const statsCards = tenantStats ? [
    {
      title: 'Toplam Kiracı',
      value: tenantStats.totalTenants.toLocaleString(),
      change: 0,
      icon: <BusinessIcon />,
      color: '#667eea',
    },
    {
      title: 'Aktif Kiracı',
      value: tenantStats.activeTenants.toLocaleString(),
      change: 0,
      icon: <ActiveIcon />,
      color: '#48c774',
    },
    {
      title: 'Deneme Sürümü',
      value: tenantStats.trialTenants.toLocaleString(),
      change: 0,
      icon: <TrialIcon />,
      color: '#3498db',
    },
    {
      title: 'Askıya Alındı',
      value: tenantStats.suspendedTenants.toLocaleString(),
      change: 0,
      icon: <SuspendedIcon />,
      color: '#f39c12',
    },
    {
      title: 'Toplam Gelir',
      value: `₺${tenantStats.totalRevenue.toLocaleString()}`,
      change: 0,
      icon: <MoneyIcon />,
      color: '#e74c3c',
    },
    {
      title: 'Ort. Kullanıcı',
      value: tenantStats.averageUsersPerTenant.toFixed(1),
      change: 0,
      icon: <PeopleIcon />,
      color: '#9b59b6',
    },
  ] : [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Kiracı Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tüm kiracıları yönetin, planlarını düzenleyin ve performanslarını takip edin
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
                placeholder="Kiracı ara..."
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
                  startIcon={<MoreVertIcon />}
                  disabled={selectedTenants.length === 0}
                  onClick={(e) => setBulkActionsMenuAnchor(e.currentTarget)}
                >
                  Toplu İşlemler ({selectedTenants.length})
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Kiracı Ekle
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Data Grid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={tenants}
            columns={columns}
            paginationModel={{ page: currentPage, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={totalCount}
            paginationMode="server"
            loading={loading}
            checkboxSelection
            rowSelectionModel={selectedTenants}
            onRowSelectionModelChange={setSelectedTenants}
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
      </Paper>

      {/* Create Tenant Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon />
            Yeni Kiracı Ekle
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Kiracı Adı"
              value={newTenant.name || ''}
              onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Slug (URL)"
              value={newTenant.slug || ''}
              onChange={(e) => setNewTenant(prev => ({ ...prev, slug: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Sahip Adı"
              value={newTenant.ownerName || ''}
              onChange={(e) => setNewTenant(prev => ({ ...prev, ownerName: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Sahip E-posta"
              type="email"
              value={newTenant.ownerEmail || ''}
              onChange={(e) => setNewTenant(prev => ({ ...prev, ownerEmail: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Telefon"
              value={newTenant.phone || ''}
              onChange={(e) => setNewTenant(prev => ({ ...prev, phone: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={newTenant.plan || ''}
                onChange={(e) => setNewTenant(prev => ({ ...prev, plan: e.target.value as TenantPlan }))}
              >
                <MenuItem value="starter">Başlangıç</MenuItem>
                <MenuItem value="professional">Profesyonel</MenuItem>
                <MenuItem value="enterprise">Kurumsal</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleCreateTenant}>
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Kiracı Düzenle
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Kiracı Adı"
              value={editTenant.name || ''}
              onChange={(e) => setEditTenant(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={editTenant.email || ''}
              onChange={(e) => setEditTenant(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Telefon"
              value={editTenant.phone || ''}
              onChange={(e) => setEditTenant(prev => ({ ...prev, phone: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={editTenant.status || ''}
                onChange={(e) => setEditTenant(prev => ({ ...prev, status: e.target.value as TenantStatus }))}
              >
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="trial">Deneme</MenuItem>
                <MenuItem value="suspended">Askıya Alındı</MenuItem>
                <MenuItem value="expired">Süresi Doldu</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={editTenant.plan || ''}
                onChange={(e) => setEditTenant(prev => ({ ...prev, plan: e.target.value as TenantPlan }))}
              >
                <MenuItem value="starter">Başlangıç</MenuItem>
                <MenuItem value="professional">Profesyonel</MenuItem>
                <MenuItem value="enterprise">Kurumsal</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleUpdateTenant}>
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: selectedTenant ? getPlanColor(selectedTenant.plan) : 'primary.main',
                  width: 40,
                  height: 40,
                }}
              >
                {selectedTenant?.name[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedTenant?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTenant?.ownerEmail}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={detailsTabValue}
              onChange={(_, newValue) => setDetailsTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Genel Bilgiler" icon={<InfoIcon />} />
              <Tab label="Kullanıcılar" icon={<PeopleIcon />} />
              <Tab label="Depolama" icon={<StorageIcon />} />
              <Tab label="Faturalama" icon={<MoneyIcon />} />
              <Tab label="API Anahtarları" icon={<ApiKeyIcon />} />
              <Tab label="Aktivite Günlüğü" icon={<ActivityIcon />} />
              <Tab label="Ayarlar" icon={<SettingsIcon />} />
            </Tabs>
          </Box>

          <TabPanel value={detailsTabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Temel Bilgiler
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Kiracı ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedTenant?.id}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Slug
                          </Typography>
                          <Typography variant="body1">
                            {selectedTenant?.slug}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Durum
                          </Typography>
                          <Chip
                            icon={selectedTenant ? getStatusIcon(selectedTenant.status) : undefined}
                            label={
                              selectedTenant?.status === 'active' ? 'Aktif' :
                              selectedTenant?.status === 'trial' ? 'Deneme' :
                              selectedTenant?.status === 'suspended' ? 'Askıya Alındı' :
                              'Süresi Doldu'
                            }
                            color={selectedTenant ? getStatusColor(selectedTenant.status) as any : 'default'}
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Plan
                          </Typography>
                          <Chip
                            label={
                              selectedTenant?.plan === 'starter' ? 'Başlangıç' :
                              selectedTenant?.plan === 'professional' ? 'Profesyonel' :
                              'Kurumsal'
                            }
                            sx={{
                              bgcolor: selectedTenant ? getPlanColor(selectedTenant.plan) + '20' : 'primary.main',
                              color: selectedTenant ? getPlanColor(selectedTenant.plan) : 'white',
                            }}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        İstatistikler
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main">
                              {selectedTenant?.stats.totalUsers}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Toplam Kullanıcı
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                              {selectedTenant?.stats.activeUsers}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Aktif Kullanıcı
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                              {selectedTenant ? formatBytes(selectedTenant.stats.storageUsed * 1024 * 1024 * 1024) : '0 GB'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Kullanılan Depolama
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                              {selectedTenant?.stats.apiCallsThisMonth.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Bu Ay API Çağrısı
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={detailsTabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kullanıcı Yönetimi
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4">
                      {selectedTenant?.limits.currentUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mevcut Kullanıcılar
                    </Typography>
                    <Typography variant="caption">
                      / {selectedTenant?.limits.maxUsers} limit
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <ActiveIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4">
                      {selectedTenant?.stats.activeUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aktif Kullanıcılar
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'info.main' }}>
                      {selectedTenant ? Math.round((selectedTenant.limits.currentUsers / selectedTenant.limits.maxUsers) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kullanım Oranı
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedTenant ? (selectedTenant.limits.currentUsers / selectedTenant.limits.maxUsers) * 100 : 0}
                      sx={{ mt: 1 }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={detailsTabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Depolama Yönetimi
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4">
                      {selectedTenant ? formatBytes(selectedTenant.limits.currentStorageGB * 1024 * 1024 * 1024) : '0 GB'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kullanılan Depolama
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                      {selectedTenant ? formatBytes(selectedTenant.limits.storageQuotaGB * 1024 * 1024 * 1024) : '0 GB'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Depolama Kotası
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                      {selectedTenant ? Math.round((selectedTenant.limits.currentStorageGB / selectedTenant.limits.storageQuotaGB) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kullanım Oranı
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedTenant ? (selectedTenant.limits.currentStorageGB / selectedTenant.limits.storageQuotaGB) * 100 : 0}
                      sx={{ mt: 1 }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={detailsTabValue} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Faturalama Bilgileri
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Abonelik Detayları
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Abonelik ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedTenant?.billing.subscriptionId}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Sonraki Faturalama Tarihi
                          </Typography>
                          <Typography variant="body1">
                            {selectedTenant ? format(new Date(selectedTenant.billing.nextBillingDate), 'dd.MM.yyyy', { locale: tr }) : '-'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Son Ödeme
                          </Typography>
                          <Typography variant="body1">
                            {selectedTenant?.billing.lastPaymentDate ? 
                              `₺${selectedTenant.billing.lastPaymentAmount?.toLocaleString()} - ${format(new Date(selectedTenant.billing.lastPaymentDate), 'dd.MM.yyyy', { locale: tr })}` : 
                              'Henüz ödeme yok'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Fatura Adresi
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2">
                          {selectedTenant?.billing.billingAddress.company}
                        </Typography>
                        <Typography variant="body2">
                          {selectedTenant?.billing.billingAddress.address}
                        </Typography>
                        <Typography variant="body2">
                          {selectedTenant?.billing.billingAddress.city}, {selectedTenant?.billing.billingAddress.postalCode}
                        </Typography>
                        <Typography variant="body2">
                          {selectedTenant?.billing.billingAddress.country}
                        </Typography>
                        {selectedTenant?.billing.billingAddress.taxNumber && (
                          <Typography variant="body2" color="text.secondary">
                            Vergi No: {selectedTenant.billing.billingAddress.taxNumber}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={detailsTabValue} index={4}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  API Anahtarları
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    // Handle create API key
                  }}
                >
                  Yeni Anahtar Oluştur
                </Button>
              </Box>
              <Grid container spacing={2}>
                {selectedTenant?.apiKeys.map((apiKey) => (
                  <Grid item xs={12} key={apiKey.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {apiKey.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <TextField
                                size="small"
                                value={`${apiKey.key.substring(0, 20)}...`}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton size="small">
                                        <CopyIcon />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ minWidth: 300 }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {apiKey.permissions.map((permission) => (
                                <Chip key={permission} label={permission} size="small" />
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Oluşturulma: {format(new Date(apiKey.createdAt), 'dd.MM.yyyy HH:mm', { locale: tr })}
                              {apiKey.lastUsed && (
                                <> • Son kullanım: {format(new Date(apiKey.lastUsed), 'dd.MM.yyyy HH:mm', { locale: tr })}</>
                              )}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip
                              label={apiKey.isActive ? 'Aktif' : 'Pasif'}
                              color={apiKey.isActive ? 'success' : 'default'}
                              size="small"
                            />
                            <Box>
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={detailsTabValue} index={5}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aktivite Günlüğü
              </Typography>
              <List>
                {tenantActivities.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ActivityIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm', { locale: tr })}
                            {activity.userName && ` • ${activity.userName}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={detailsTabValue} index={6}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kiracı Ayarları
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Domain Ayarları
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Özel Domain"
                        value={selectedTenant?.settings.customDomain || ''}
                        sx={{ mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch checked={!!selectedTenant?.settings.customDomain} />}
                        label="Özel Domain Kullan"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Tema Ayarları
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Ana Renk"
                        value={selectedTenant?.settings.customTheme?.primaryColor || ''}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="İkincil Renk"
                        value={selectedTenant?.settings.customTheme?.secondaryColor || ''}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            Kiracıyı Sil
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz! Kiracı ve tüm verileri kalıcı olarak silinecektir.
          </Alert>
          <Typography>
            <strong>{selectedTenant?.name}</strong> kiracısını silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
      >
        <MenuItem onClick={() => { handleViewTenant(contextMenuTenant!); setContextMenuAnchor(null); }}>
          <ListItemIcon><ViewIcon /></ListItemIcon>
          <ListItemText>Detayları Görüntüle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEditTenant(contextMenuTenant!); setContextMenuAnchor(null); }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleDeleteTenant(contextMenuTenant!); setContextMenuAnchor(null); }}>
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
        <MenuItem onClick={() => handleBulkAction('suspend')}>
          <ListItemIcon><SuspendedIcon color="warning" /></ListItemIcon>
          <ListItemText>Askıya Al</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleBulkAction('delete')}>
          <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>

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
    </Box>
  );
};

export default TenantsPage;