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
  Checkbox,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Breadcrumbs,
  Link,
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
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as ActiveIcon,
  Pause as InactiveIcon,
  Block as SuspendedIcon,
  Schedule as PendingIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  VpnKey as PasswordIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  RemoveRedEye as ViewerIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  FileCopy as CopyIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Computer as ComputerIcon,
  Smartphone as MobileIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  VerifiedUser as VerifiedIcon,
  ReportProblem as ProblemIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareIcon,
  ExitToApp as ImpersonateIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type {
  User,
  UserStatus,
  UserRole,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  UserActivity,
  UserSession,
  UserLoginHistory,
  Permission,
} from '../../types/user';
import userService from '../../services/userService';

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const UsersPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<UserFilters>({});
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [bulkActionsMenuAnchor, setBulkActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuUser, setContextMenuUser] = useState<User | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<CreateUserRequest>>({});
  const [editUser, setEditUser] = useState<Partial<UpdateUserRequest>>({});
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [userLoginHistory, setUserLoginHistory] = useState<UserLoginHistory[]>([]);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Available permissions
  const availablePermissions: Permission[] = [
    'users.read',
    'users.write', 
    'users.delete',
    'settings.read',
    'settings.write',
    'reports.read',
    'reports.write',
    'billing.read',
    'billing.write'
  ];

  // Permission labels
  const permissionLabels: Record<Permission, string> = {
    'users.read': 'Kullanıcıları Görüntüleme',
    'users.write': 'Kullanıcı Düzenleme',
    'users.delete': 'Kullanıcı Silme',
    'settings.read': 'Ayarları Görüntüleme',
    'settings.write': 'Ayar Düzenleme',
    'reports.read': 'Rapor Görüntüleme',
    'reports.write': 'Rapor Oluşturma',
    'billing.read': 'Faturalama Görüntüleme',
    'billing.write': 'Faturalama Düzenleme',
  };

  // Mock tenant data
  const mockTenants = [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'TechStart Inc' },
    { id: '3', name: 'Global Systems' },
    { id: '4', name: 'Innovation Labs' },
  ];

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(currentPage + 1, pageSize, filters);
      setUsers(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      showSnackbar('Kullanıcı listesi yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Load user statistics
  const loadUserStats = useCallback(async () => {
    try {
      const stats = await userService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }, []);

  // Load user activities
  const loadUserActivities = useCallback(async (userId: string) => {
    try {
      const response = await userService.getUserActivities(userId);
      setUserActivities(response.data);
    } catch (error) {
      console.error('Failed to load user activities:', error);
    }
  }, []);

  // Load user sessions
  const loadUserSessions = useCallback(async (userId: string) => {
    try {
      const sessions = await userService.getUserSessions(userId);
      setUserSessions(sessions);
    } catch (error) {
      console.error('Failed to load user sessions:', error);
    }
  }, []);

  // Load user login history
  const loadUserLoginHistory = useCallback(async (userId: string) => {
    try {
      const response = await userService.getUserLoginHistory(userId);
      setUserLoginHistory(response.data);
    } catch (error) {
      console.error('Failed to load user login history:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      case 'pending_verification': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'active': return <ActiveIcon />;
      case 'inactive': return <InactiveIcon />;
      case 'suspended': return <SuspendedIcon />;
      case 'pending_verification': return <PendingIcon />;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'manager': return <ManagerIcon />;
      case 'user': return <UserIcon />;
      case 'viewer': return <ViewerIcon />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return '#f44336';
      case 'manager': return '#ff9800';
      case 'user': return '#2196f3';
      case 'viewer': return '#4caf50';
    }
  };

  const formatPermissions = (permissions: Permission[]) => {
    return permissions.map(p => permissionLabels[p] || p).join(', ');
  };

  const getDeviceIcon = (session: UserSession) => {
    return session.deviceInfo.isMobile ? <MobileIcon /> : <ComputerIcon />;
  };

  // DataGrid columns
  const columns = [
    {
      field: 'user',
      headerName: 'Kullanıcı',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.profile.firstName[0]}{params.row.profile.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {params.row.profile.firstName} {params.row.profile.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Kiracı',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getRoleIcon(params.value)}
          label={
            params.value === 'admin' ? 'Yönetici' :
            params.value === 'manager' ? 'Müdür' :
            params.value === 'user' ? 'Kullanıcı' :
            'Görüntüleyici'
          }
          sx={{
            bgcolor: getRoleColor(params.value) + '20',
            color: getRoleColor(params.value),
          }}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={
            params.value === 'active' ? 'Aktif' :
            params.value === 'inactive' ? 'Pasif' :
            params.value === 'suspended' ? 'Askıya Alındı' :
            'Doğrulama Bekliyor'
          }
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'profile',
      headerName: 'Departman',
      width: 120,
      valueGetter: (params: GridValueGetterParams) => params.row.profile.department,
    },
    {
      field: 'security',
      headerName: '2FA',
      width: 80,
      renderCell: (params) => (
        <Chip
          icon={<ShieldIcon />}
          label={params.row.security.twoFactorEnabled ? 'Aktif' : 'Pasif'}
          color={params.row.security.twoFactorEnabled ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'lastLoginAt',
      headerName: 'Son Giriş',
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption">
          {params.value ? format(new Date(params.value), 'dd.MM.yyyy', { locale: tr }) : 'Hiç'}
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
      getActions: (params: any) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Detayları Görüntüle"
          onClick={() => handleViewUser(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Düzenle"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          icon={<MoreVertIcon />}
          label="Daha Fazla"
          onClick={(event) => {
            setContextMenuAnchor(event.currentTarget as HTMLElement);
            setContextMenuUser(params.row);
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

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
    setDetailsTabValue(0);
    loadUserActivities(user.id);
    loadUserSessions(user.id);
    loadUserLoginHistory(user.id);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      profile: user.profile,
      security: {
        twoFactorEnabled: user.security.twoFactorEnabled,
        emailVerified: user.security.emailVerified,
      },
    });
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      await userService.createUser(newUser as CreateUserRequest);
      showSnackbar('Kullanıcı başarıyla oluşturuldu', 'success');
      setCreateDialogOpen(false);
      setNewUser({});
      loadUsers();
    } catch (error) {
      showSnackbar('Kullanıcı oluşturulamadı', 'error');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUser(selectedUser.id, editUser);
      showSnackbar('Kullanıcı başarıyla güncellendi', 'success');
      setEditDialogOpen(false);
      setEditUser({});
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      showSnackbar('Kullanıcı güncellenemedi', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.deleteUser(selectedUser.id);
      showSnackbar('Kullanıcı başarıyla silindi', 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      showSnackbar('Kullanıcı silinemedi', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      const result = await userService.resetUserPassword({
        userId: selectedUser.id,
        sendEmail: true,
        requireImmedateChange: true,
      });
      showSnackbar('Şifre sıfırlama e-postası gönderildi', 'success');
      setPasswordResetDialogOpen(false);
    } catch (error) {
      showSnackbar('Şifre sıfırlanamadı', 'error');
    }
  };

  const handleToggleTwoFactor = async (userId: string, enable: boolean) => {
    try {
      await userService.setupTwoFactor({
        userId,
        enable,
        method: 'totp',
      });
      showSnackbar(`İki faktörlü doğrulama ${enable ? 'aktif edildi' : 'devre dışı bırakıldı'}`, 'success');
      loadUsers();
    } catch (error) {
      showSnackbar('İki faktörlü doğrulama ayarı değiştirilemedi', 'error');
    }
  };

  const handleLockUser = async (userId: string) => {
    try {
      await userService.lockUser(userId, 'Yönetici tarafından kilitlendi');
      showSnackbar('Kullanıcı hesabı kilitlendi', 'success');
      loadUsers();
    } catch (error) {
      showSnackbar('Kullanıcı hesabı kilitlenemedi', 'error');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await userService.unlockUser(userId);
      showSnackbar('Kullanıcı hesabı kilidi açıldı', 'success');
      loadUsers();
    } catch (error) {
      showSnackbar('Kullanıcı hesabı kilidi açılamadı', 'error');
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      await userService.verifyUserEmail(userId);
      showSnackbar('E-posta adresi doğrulandı', 'success');
      loadUsers();
    } catch (error) {
      showSnackbar('E-posta adresi doğrulanamadı', 'error');
    }
  };

  const handleRevokeSession = async (userId: string, sessionId: string) => {
    try {
      await userService.revokeUserSession(userId, sessionId);
      showSnackbar('Oturum sonlandırıldı', 'success');
      loadUserSessions(userId);
    } catch (error) {
      showSnackbar('Oturum sonlandırılamadı', 'error');
    }
  };

  const handleRevokeAllSessions = async (userId: string) => {
    try {
      await userService.revokeAllUserSessions(userId);
      showSnackbar('Tüm oturumlar sonlandırıldı', 'success');
      loadUserSessions(userId);
    } catch (error) {
      showSnackbar('Oturumlar sonlandırılamadı', 'error');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      await userService.bulkAction({
        action: action as any,
        userIds: selectedUsers as string[],
      });
      showSnackbar(`${selectedUsers.length} kullanıcı için toplu işlem gerçekleştirildi`, 'success');
      setBulkActionsMenuAnchor(null);
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      showSnackbar('Toplu işlem gerçekleştirilemedi', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await userService.exportUsers({
        format: 'csv',
        fields: ['email', 'role', 'status', 'tenantName', 'profile', 'createdAt'],
        userIds: selectedUsers.length > 0 ? selectedUsers as string[] : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSnackbar('Kullanıcı listesi dışa aktarıldı', 'success');
    } catch (error) {
      showSnackbar('Dışa aktarma işlemi başarısız', 'error');
    }
  };

  const handlePaginationModelChange = (model: any) => {
    setCurrentPage(model.page);
    setPageSize(model.pageSize);
  };

  const statsCards = userStats ? [
    {
      title: 'Toplam Kullanıcı',
      value: userStats.totalUsers.toLocaleString(),
      change: 0,
      icon: <PeopleIcon />,
      color: '#667eea',
    },
    {
      title: 'Aktif Kullanıcı',
      value: userStats.activeUsers.toLocaleString(),
      change: 0,
      icon: <ActiveIcon />,
      color: '#48c774',
    },
    {
      title: 'Askıya Alınmış',
      value: userStats.suspendedUsers.toLocaleString(),
      change: 0,
      icon: <SuspendedIcon />,
      color: '#f39c12',
    },
    {
      title: '2FA Aktif',
      value: userStats.usersWithTwoFactor.toLocaleString(),
      change: 0,
      icon: <ShieldIcon />,
      color: '#e74c3c',
    },
    {
      title: 'Doğrulama Bekleyen',
      value: userStats.pendingVerificationUsers.toLocaleString(),
      change: 0,
      icon: <PendingIcon />,
      color: '#9b59b6',
    },
    {
      title: 'Ort. Giriş Sayısı',
      value: userStats.averageLoginsPerUser.toString(),
      change: 0,
      icon: <LoginIcon />,
      color: '#3498db',
    },
  ] : [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/admin">
            Yönetim Paneli
          </Link>
          <Typography color="text.primary">Kullanıcı Yönetimi</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Kullanıcı Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tüm kiracılardaki kullanıcıları yönetin, rollerini düzenleyin ve güvenlik ayarlarını kontrol edin
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Kullanıcı ara..."
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
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setFilterDialogOpen(true)}
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
                  disabled={selectedUsers.length === 0}
                  onClick={(e) => setBulkActionsMenuAnchor(e.currentTarget)}
                >
                  Toplu İşlemler ({selectedUsers.length})
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Kullanıcı Ekle
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Data Grid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            paginationModel={{ page: currentPage, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={totalCount}
            paginationMode="server"
            loading={loading}
            checkboxSelection
            rowSelectionModel={selectedUsers}
            onRowSelectionModelChange={setSelectedUsers}
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

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon />
            Yeni Kullanıcı Ekle
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                value={newUser.profile?.firstName || ''}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, firstName: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                value={newUser.profile?.lastName || ''}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, lastName: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={newUser.email || ''}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kiracı</InputLabel>
                <Select
                  value={newUser.tenantId || ''}
                  onChange={(e) => setNewUser(prev => ({ ...prev, tenantId: e.target.value }))}
                >
                  {mockTenants.map(tenant => (
                    <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={newUser.role || ''}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <MenuItem value="admin">Yönetici</MenuItem>
                  <MenuItem value="manager">Müdür</MenuItem>
                  <MenuItem value="user">Kullanıcı</MenuItem>
                  <MenuItem value="viewer">Görüntüleyici</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={newUser.profile?.phone || ''}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, phone: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departman"
                value={newUser.profile?.department || ''}
                onChange={(e) => setNewUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, department: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>İzinler</InputLabel>
                <Select
                  multiple
                  value={newUser.permissions || []}
                  onChange={(e) => setNewUser(prev => ({ ...prev, permissions: e.target.value as Permission[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={permissionLabels[value]} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availablePermissions.map((permission) => (
                    <MenuItem key={permission} value={permission}>
                      <Checkbox checked={(newUser.permissions || []).includes(permission)} />
                      <ListItemText primary={permissionLabels[permission]} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleCreateUser}>
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Kullanıcı Düzenle
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                value={editUser.profile?.firstName || ''}
                onChange={(e) => setEditUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, firstName: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                value={editUser.profile?.lastName || ''}
                onChange={(e) => setEditUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, lastName: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={editUser.role || ''}
                  onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <MenuItem value="admin">Yönetici</MenuItem>
                  <MenuItem value="manager">Müdür</MenuItem>
                  <MenuItem value="user">Kullanıcı</MenuItem>
                  <MenuItem value="viewer">Görüntüleyici</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={editUser.status || ''}
                  onChange={(e) => setEditUser(prev => ({ ...prev, status: e.target.value as UserStatus }))}
                >
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                  <MenuItem value="suspended">Askıya Alındı</MenuItem>
                  <MenuItem value="pending_verification">Doğrulama Bekliyor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={editUser.profile?.phone || ''}
                onChange={(e) => setEditUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, phone: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departman"
                value={editUser.profile?.department || ''}
                onChange={(e) => setEditUser(prev => ({
                  ...prev,
                  profile: { ...prev.profile, department: e.target.value } as any
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editUser.security?.twoFactorEnabled || false}
                      onChange={(e) => setEditUser(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorEnabled: e.target.checked } as any
                      }))}
                    />
                  }
                  label="İki Faktörlü Doğrulama"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editUser.security?.emailVerified || false}
                      onChange={(e) => setEditUser(prev => ({
                        ...prev,
                        security: { ...prev.security, emailVerified: e.target.checked } as any
                      }))}
                    />
                  }
                  label="E-posta Doğrulandı"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleUpdateUser}>
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 48, height: 48 }}>
                {selectedUser?.profile.firstName[0]}{selectedUser?.profile.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedUser?.profile.firstName} {selectedUser?.profile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser?.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    icon={getRoleIcon(selectedUser?.role!)}
                    label={
                      selectedUser?.role === 'admin' ? 'Yönetici' :
                      selectedUser?.role === 'manager' ? 'Müdür' :
                      selectedUser?.role === 'user' ? 'Kullanıcı' :
                      'Görüntüleyici'
                    }
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(selectedUser?.role!) + '20',
                      color: getRoleColor(selectedUser?.role!),
                    }}
                  />
                  <Chip
                    icon={getStatusIcon(selectedUser?.status!)}
                    label={
                      selectedUser?.status === 'active' ? 'Aktif' :
                      selectedUser?.status === 'inactive' ? 'Pasif' :
                      selectedUser?.status === 'suspended' ? 'Askıya Alındı' :
                      'Doğrulama Bekliyor'
                    }
                    color={getStatusColor(selectedUser?.status!) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={detailsTabValue}
              onChange={(_, newValue) => setDetailsTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Genel Bilgiler" icon={<InfoIcon />} />
              <Tab label="İzinler" icon={<KeyIcon />} />
              <Tab label="Güvenlik" icon={<SecurityIcon />} />
              <Tab label="Oturumlar" icon={<ComputerIcon />} />
              <Tab label="Giriş Geçmişi" icon={<LoginIcon />} />
              <Tab label="Aktivite Günlüğü" icon={<HistoryIcon />} />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TabPanel value={detailsTabValue} index={0}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Kişisel Bilgiler
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Ad Soyad
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.profile.firstName} {selectedUser?.profile.lastName}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                E-posta
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Telefon
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.profile.phone || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Kiracı
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.tenantName}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          İş Bilgileri
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Departman
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.profile.department || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Pozisyon
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.profile.position || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Konum
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.profile.location || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LanguageIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Dil
                              </Typography>
                              <Typography variant="body1">
                                {selectedUser?.profile.language === 'tr' ? 'Türkçe' : selectedUser?.profile.language}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          İstatistikler
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary.main">
                                {selectedUser?.stats.totalLogins}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Toplam Giriş
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="error.main">
                                {selectedUser?.stats.failedLoginAttempts}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Başarısız Giriş
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="warning.main">
                                {selectedUser?.stats.dataExportsCount}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Veri Dışa Aktarma
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="info.main">
                                {selectedUser?.stats.averageSessionDuration}m
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Ort. Oturum Süresi
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Kullanıcı İzinleri
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setPermissionsDialogOpen(true)}
                  >
                    İzinleri Düzenle
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {selectedUser?.permissions.map((permission) => (
                    <Grid item xs={12} sm={6} md={4} key={permission}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <KeyIcon color="primary" />
                            <Typography variant="body2">
                              {permissionLabels[permission] || permission}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={detailsTabValue} index={2}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Güvenlik Ayarları
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          İki Faktörlü Doğrulama
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body2">
                            {selectedUser?.security.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                          </Typography>
                          <Switch
                            checked={selectedUser?.security.twoFactorEnabled}
                            onChange={(e) => handleToggleTwoFactor(selectedUser?.id!, e.target.checked)}
                          />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>
                          E-posta Doğrulama
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {selectedUser?.security.emailVerified ? (
                              <>
                                <VerifiedIcon color="success" />
                                <Typography variant="body2" color="success.main">
                                  Doğrulandı
                                </Typography>
                              </>
                            ) : (
                              <>
                                <ProblemIcon color="error" />
                                <Typography variant="body2" color="error.main">
                                  Doğrulanmadı
                                </Typography>
                              </>
                            )}
                          </Box>
                          {!selectedUser?.security.emailVerified && (
                            <Button
                              size="small"
                              onClick={() => handleVerifyEmail(selectedUser?.id!)}
                            >
                              Doğrula
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Şifre Güvenliği
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Son Değişiklik
                          </Typography>
                          <Typography variant="body1">
                            {selectedUser ? format(new Date(selectedUser.security.lastPasswordChange), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Şifre Gücü
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={selectedUser?.stats.lastPasswordStrength || 0}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">
                              {selectedUser?.stats.lastPasswordStrength}%
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<PasswordIcon />}
                          onClick={() => setPasswordResetDialogOpen(true)}
                          fullWidth
                        >
                          Şifre Sıfırla
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={detailsTabValue} index={3}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Aktif Oturumlar ({userSessions.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={() => handleRevokeAllSessions(selectedUser?.id!)}
                    disabled={userSessions.length === 0}
                  >
                    Tüm Oturumları Sonlandır
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {userSessions.map((session) => (
                    <Grid item xs={12} key={session.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {getDeviceIcon(session)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  {session.deviceInfo.browser} - {session.deviceInfo.os}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {session.deviceInfo.device} • {session.ipAddress}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Başlangıç: {format(new Date(session.createdAt), 'dd.MM.yyyy HH:mm', { locale: tr })}
                                  {' • '}
                                  Son Aktivite: {format(new Date(session.lastActivity), 'dd.MM.yyyy HH:mm', { locale: tr })}
                                </Typography>
                                {session.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                    <LocationIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {session.location}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                              <Chip
                                label={session.isActive ? 'Aktif' : 'Pasif'}
                                color={session.isActive ? 'success' : 'default'}
                                size="small"
                              />
                              <Button
                                size="small"
                                color="error"
                                startIcon={<LogoutIcon />}
                                onClick={() => handleRevokeSession(selectedUser?.id!, session.id)}
                              >
                                Sonlandır
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  {userSessions.length === 0 && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                          <ComputerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            Aktif oturum yok
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Kullanıcının şu anda aktif bir oturumu bulunmuyor.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={detailsTabValue} index={4}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Giriş Geçmişi
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Durum</TableCell>
                        <TableCell>IP Adresi</TableCell>
                        <TableCell>Konum</TableCell>
                        <TableCell>Cihaz</TableCell>
                        <TableCell>Tarih</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userLoginHistory.slice(0, 20).map((login) => (
                        <TableRow key={login.id}>
                          <TableCell>
                            <Chip
                              icon={login.success ? <ActiveIcon /> : <ProblemIcon />}
                              label={login.success ? 'Başarılı' : 'Başarısız'}
                              color={login.success ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{login.ipAddress}</TableCell>
                          <TableCell>{login.location || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {login.userAgent.split(' ')[0]}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {format(new Date(login.timestamp), 'dd.MM.yyyy HH:mm', { locale: tr })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </TabPanel>

            <TabPanel value={detailsTabValue} index={5}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Aktivite Günlüğü
                </Typography>
                <List>
                  {userActivities.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <HistoryIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm', { locale: tr })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              IP: {activity.ipAddress} • {activity.location}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {userActivities.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Aktivite kaydı bulunamadı"
                        secondary="Bu kullanıcı için henüz bir aktivite kaydı bulunmuyor."
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </TabPanel>
          </Box>
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
            Kullanıcıyı Sil
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Bu işlem geri alınamaz! Kullanıcı ve tüm verileri kalıcı olarak silinecektir.
          </Alert>
          <Typography>
            <strong>{selectedUser?.profile.firstName} {selectedUser?.profile.lastName}</strong> kullanıcısını silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog
        open={passwordResetDialogOpen}
        onClose={() => setPasswordResetDialogOpen(false)}
      >
        <DialogTitle>Şifre Sıfırla</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            <strong>{selectedUser?.profile.firstName} {selectedUser?.profile.lastName}</strong> kullanıcısının şifresini sıfırlamak istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kullanıcıya şifre sıfırlama bağlantısı içeren bir e-posta gönderilecektir.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordResetDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleResetPassword}>
            Şifre Sıfırla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
      >
        <MenuItem onClick={() => { handleViewUser(contextMenuUser!); setContextMenuAnchor(null); }}>
          <ListItemIcon><ViewIcon /></ListItemIcon>
          <ListItemText>Detayları Görüntüle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleEditUser(contextMenuUser!); setContextMenuAnchor(null); }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setPasswordResetDialogOpen(true); setContextMenuAnchor(null); }}>
          <ListItemIcon><PasswordIcon /></ListItemIcon>
          <ListItemText>Şifre Sıfırla</ListItemText>
        </MenuItem>
        {contextMenuUser?.status !== 'suspended' ? (
          <MenuItem onClick={() => { handleLockUser(contextMenuUser?.id!); setContextMenuAnchor(null); }}>
            <ListItemIcon><LockIcon color="warning" /></ListItemIcon>
            <ListItemText>Hesabı Kilitle</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { handleUnlockUser(contextMenuUser?.id!); setContextMenuAnchor(null); }}>
            <ListItemIcon><UnlockIcon color="success" /></ListItemIcon>
            <ListItemText>Hesap Kilidini Aç</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { handleDeleteUser(contextMenuUser!); setContextMenuAnchor(null); }}>
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
        <MenuItem onClick={() => handleBulkAction('suspend')}>
          <ListItemIcon><SuspendedIcon color="error" /></ListItemIcon>
          <ListItemText>Askıya Al</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleBulkAction('reset_password')}>
          <ListItemIcon><PasswordIcon color="warning" /></ListItemIcon>
          <ListItemText>Şifre Sıfırla</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('export')}>
          <ListItemIcon><DownloadIcon /></ListItemIcon>
          <ListItemText>Dışa Aktar</ListItemText>
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

export default UsersPage;