import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Badge,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  CloudQueue as CloudIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  DataUsage as DataUsageIcon,
  Timer as TimerIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BackupItem {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  location: 'local' | 'cloud' | 'external';
  databases: string[];
  encrypted: boolean;
  compressed: boolean;
  retention: number;
  description?: string;
  error?: string;
}

interface BackupSchedule {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  backupType: 'full' | 'incremental' | 'differential';
  retention: number;
  databases: string[];
  notifications: boolean;
}

interface RestorePoint {
  id: string;
  backupId: string;
  name: string;
  timestamp: string;
  databases: string[];
  status: 'available' | 'restoring' | 'restored';
  size: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BackupManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [backupForm, setBackupForm] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental' | 'differential',
    databases: [] as string[],
    location: 'local' as 'local' | 'cloud' | 'external',
    encrypted: true,
    compressed: true,
    retention: 30,
    description: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    time: '02:00',
    enabled: true,
    backupType: 'full' as 'full' | 'incremental' | 'differential',
    retention: 30,
    databases: [] as string[],
    notifications: true
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    compressionLevel: 'medium',
    encryptionMethod: 'AES-256',
    maxBackupSize: 10,
    cloudProvider: 'azure',
    notificationEmail: 'admin@stocker.com',
    retentionPolicy: 'tiered'
  });

  useEffect(() => {
    loadBackups();
    loadSchedules();
    loadRestorePoints();
  }, []);

  const loadBackups = () => {
    setLoading(true);
    const mockBackups: BackupItem[] = [
      {
        id: '1',
        name: 'Full Backup - 2024-01-15',
        createdAt: '2024-01-15T03:00:00Z',
        size: 2147483648,
        type: 'full',
        status: 'completed',
        location: 'cloud',
        databases: ['master', 'tenant_db_1', 'tenant_db_2'],
        encrypted: true,
        compressed: true,
        retention: 30,
        description: 'Scheduled full backup'
      },
      {
        id: '2',
        name: 'Incremental Backup - 2024-01-14',
        createdAt: '2024-01-14T15:30:00Z',
        size: 536870912,
        type: 'incremental',
        status: 'completed',
        location: 'local',
        databases: ['master'],
        encrypted: true,
        compressed: true,
        retention: 7
      },
      {
        id: '3',
        name: 'Emergency Backup',
        createdAt: '2024-01-14T10:00:00Z',
        size: 1073741824,
        type: 'full',
        status: 'failed',
        location: 'external',
        databases: ['tenant_db_3'],
        encrypted: false,
        compressed: true,
        retention: 90,
        error: 'Storage connection timeout'
      }
    ];
    setBackups(mockBackups);
    setLoading(false);
  };

  const loadSchedules = () => {
    const mockSchedules: BackupSchedule[] = [
      {
        id: '1',
        name: 'Daily Full Backup',
        type: 'daily',
        time: '02:00',
        enabled: true,
        lastRun: '2024-01-14T02:00:00Z',
        nextRun: '2024-01-15T02:00:00Z',
        backupType: 'full',
        retention: 30,
        databases: ['master', 'all_tenants'],
        notifications: true
      },
      {
        id: '2',
        name: 'Weekly Incremental',
        type: 'weekly',
        time: '03:00',
        enabled: true,
        nextRun: '2024-01-21T03:00:00Z',
        backupType: 'incremental',
        retention: 14,
        databases: ['master'],
        notifications: false
      }
    ];
    setSchedules(mockSchedules);
  };

  const loadRestorePoints = () => {
    const mockRestorePoints: RestorePoint[] = [
      {
        id: '1',
        backupId: '1',
        name: 'Restore Point - 2024-01-15',
        timestamp: '2024-01-15T03:00:00Z',
        databases: ['master', 'tenant_db_1'],
        status: 'available',
        size: 2147483648
      },
      {
        id: '2',
        backupId: '2',
        name: 'Restore Point - 2024-01-14',
        timestamp: '2024-01-14T15:30:00Z',
        databases: ['master'],
        status: 'available',
        size: 536870912
      }
    ];
    setRestorePoints(mockRestorePoints);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateBackup = () => {
    setBackupInProgress(true);
    setTimeout(() => {
      setBackupInProgress(false);
      setOpenBackupDialog(false);
      loadBackups();
    }, 3000);
  };

  const handleRestore = (backup: BackupItem) => {
    setSelectedBackup(backup);
    setOpenRestoreDialog(true);
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'available':
      case 'restored':
        return 'success';
      case 'in_progress':
      case 'restoring':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'cloud':
        return <CloudIcon />;
      case 'local':
        return <StorageIcon />;
      case 'external':
        return <FolderIcon />;
      default:
        return <StorageIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Backup ve Restore Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettingsDialog(true)}
          >
            Ayarlar
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setOpenBackupDialog(true)}
            disabled={backupInProgress}
          >
            Yeni Backup
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6">Toplam Backup</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {backups.length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {backups.filter(b => b.status === 'completed').length} başarılı
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DataUsageIcon sx={{ mr: 2, color: theme.palette.warning.main }} />
                  <Typography variant="h6">Toplam Boyut</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {formatFileSize(backups.reduce((acc, b) => acc + b.size, 0))}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {backups.filter(b => b.location === 'cloud').length} bulutta
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 2, color: theme.palette.success.main }} />
                  <Typography variant="h6">Zamanlanmış</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {schedules.filter(s => s.enabled).length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {schedules.length} toplam zamanlama
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RestoreIcon sx={{ mr: 2, color: theme.palette.info.main }} />
                  <Typography variant="h6">Restore Point</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {restorePoints.length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {restorePoints.filter(r => r.status === 'available').length} kullanılabilir
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<BackupIcon />} label="Backup Listesi" />
          <Tab icon={<ScheduleIcon />} label="Zamanlamalar" />
          <Tab icon={<RestoreIcon />} label="Restore Points" />
          <Tab icon={<HistoryIcon />} label="Geçmiş" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Backup Adı</TableCell>
                      <TableCell>Tür</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Boyut</TableCell>
                      <TableCell>Konum</TableCell>
                      <TableCell>Oluşturulma</TableCell>
                      <TableCell>Özellikler</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {backups
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BackupIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="body1">{backup.name}</Typography>
                                {backup.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {backup.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={backup.type}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={backup.status}
                              color={getStatusColor(backup.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatFileSize(backup.size)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getLocationIcon(backup.location)}
                              <Typography sx={{ ml: 1 }} variant="body2">
                                {backup.location}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(backup.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {backup.encrypted && (
                                <Tooltip title="Şifrelenmiş">
                                  <SecurityIcon fontSize="small" color="success" />
                                </Tooltip>
                              )}
                              {backup.compressed && (
                                <Tooltip title="Sıkıştırılmış">
                                  <DataUsageIcon fontSize="small" color="primary" />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleRestore(backup)}
                              disabled={backup.status !== 'completed'}
                            >
                              <RestoreIcon />
                            </IconButton>
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBackup(backup.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={backups.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setOpenScheduleDialog(true)}
            >
              Yeni Zamanlama
            </Button>
          </Box>
          <List>
            {schedules.map((schedule) => (
              <ListItem key={schedule.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{schedule.name}</Typography>
                      <Chip
                        label={schedule.type}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={schedule.backupType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Saat: {schedule.time} | Sonraki: {format(parseISO(schedule.nextRun), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </Typography>
                      {schedule.lastRun && (
                        <Typography variant="caption" color="text.secondary">
                          Son çalışma: {format(parseISO(schedule.lastRun), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={schedule.enabled}
                    onChange={() => {}}
                  />
                  <IconButton size="small">
                    <PlayIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {restorePoints.map((point) => (
              <ListItem key={point.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  <RestoreIcon />
                </ListItemIcon>
                <ListItemText
                  primary={point.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(point.timestamp), 'dd MMM yyyy HH:mm', { locale: tr })} | {formatFileSize(point.size)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {point.databases.map(db => (
                          <Chip key={db} label={db} size="small" />
                        ))}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={point.status}
                    color={getStatusColor(point.status) as any}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RestoreIcon />}
                    disabled={point.status !== 'available'}
                  >
                    Restore Et
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1" color="text.secondary">
            Backup ve restore geçmişi burada görüntülenecek...
          </Typography>
        </TabPanel>
      </Paper>

      {/* Backup Dialog */}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Backup Oluştur</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Backup Adı"
                value={backupForm.name}
                onChange={(e) => setBackupForm({ ...backupForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Türü</InputLabel>
                <Select
                  value={backupForm.type}
                  label="Backup Türü"
                  onChange={(e: SelectChangeEvent) => setBackupForm({ ...backupForm, type: e.target.value as any })}
                >
                  <MenuItem value="full">Full Backup</MenuItem>
                  <MenuItem value="incremental">Incremental</MenuItem>
                  <MenuItem value="differential">Differential</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Konum</InputLabel>
                <Select
                  value={backupForm.location}
                  label="Konum"
                  onChange={(e: SelectChangeEvent) => setBackupForm({ ...backupForm, location: e.target.value as any })}
                >
                  <MenuItem value="local">Yerel</MenuItem>
                  <MenuItem value="cloud">Bulut</MenuItem>
                  <MenuItem value="external">Harici</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Veritabanları</InputLabel>
                <Select
                  multiple
                  value={backupForm.databases}
                  label="Veritabanları"
                  onChange={(e: SelectChangeEvent<string[]>) => setBackupForm({ ...backupForm, databases: e.target.value as string[] })}
                >
                  <MenuItem value="master">Master DB</MenuItem>
                  <MenuItem value="tenant_db_1">Tenant DB 1</MenuItem>
                  <MenuItem value="tenant_db_2">Tenant DB 2</MenuItem>
                  <MenuItem value="all_tenants">Tüm Tenant DB'ler</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={backupForm.encrypted}
                    onChange={(e) => setBackupForm({ ...backupForm, encrypted: e.target.checked })}
                  />
                }
                label="Şifreleme"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={backupForm.compressed}
                    onChange={(e) => setBackupForm({ ...backupForm, compressed: e.target.checked })}
                  />
                }
                label="Sıkıştırma"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={3}
                value={backupForm.description}
                onChange={(e) => setBackupForm({ ...backupForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleCreateBackup}
            startIcon={backupInProgress ? <CircularProgress size={20} /> : <BackupIcon />}
            disabled={backupInProgress}
          >
            {backupInProgress ? 'Oluşturuluyor...' : 'Backup Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Restore İşlemi</DialogTitle>
        <DialogContent>
          {selectedBackup && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Bu işlem mevcut verilerin üzerine yazacaktır. Devam etmeden önce mevcut verileri yedeklediğinizden emin olun.
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Backup:</strong> {selectedBackup.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Tarih:</strong> {format(parseISO(selectedBackup.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Boyut:</strong> {formatFileSize(selectedBackup.size)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Veritabanları:</strong> {selectedBackup.databases.join(', ')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)}>İptal</Button>
          <Button variant="contained" color="warning" startIcon={<RestoreIcon />}>
            Restore Başlat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Zamanlama</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Zamanlama Adı"
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Periyot</InputLabel>
                <Select
                  value={scheduleForm.type}
                  label="Periyot"
                  onChange={(e: SelectChangeEvent) => setScheduleForm({ ...scheduleForm, type: e.target.value as any })}
                >
                  <MenuItem value="daily">Günlük</MenuItem>
                  <MenuItem value="weekly">Haftalık</MenuItem>
                  <MenuItem value="monthly">Aylık</MenuItem>
                  <MenuItem value="custom">Özel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Saat"
                type="time"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Backup Türü</InputLabel>
                <Select
                  value={scheduleForm.backupType}
                  label="Backup Türü"
                  onChange={(e: SelectChangeEvent) => setScheduleForm({ ...scheduleForm, backupType: e.target.value as any })}
                >
                  <MenuItem value="full">Full Backup</MenuItem>
                  <MenuItem value="incremental">Incremental</MenuItem>
                  <MenuItem value="differential">Differential</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={scheduleForm.enabled}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, enabled: e.target.checked })}
                  />
                }
                label="Aktif"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={scheduleForm.notifications}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notifications: e.target.checked })}
                  />
                }
                label="Bildirimler"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>İptal</Button>
          <Button variant="contained" startIcon={<ScheduleIcon />}>
            Zamanlama Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Backup Ayarları</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={backupSettings.autoBackup}
                    onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                  />
                }
                label="Otomatik Backup"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Sıkıştırma Seviyesi</InputLabel>
                <Select
                  value={backupSettings.compressionLevel}
                  label="Sıkıştırma Seviyesi"
                  onChange={(e: SelectChangeEvent) => setBackupSettings({ ...backupSettings, compressionLevel: e.target.value })}
                >
                  <MenuItem value="none">Yok</MenuItem>
                  <MenuItem value="low">Düşük</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="high">Yüksek</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Şifreleme Metodu</InputLabel>
                <Select
                  value={backupSettings.encryptionMethod}
                  label="Şifreleme Metodu"
                  onChange={(e: SelectChangeEvent) => setBackupSettings({ ...backupSettings, encryptionMethod: e.target.value })}
                >
                  <MenuItem value="none">Yok</MenuItem>
                  <MenuItem value="AES-128">AES-128</MenuItem>
                  <MenuItem value="AES-256">AES-256</MenuItem>
                  <MenuItem value="RSA">RSA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Backup Boyutu (GB)"
                type="number"
                value={backupSettings.maxBackupSize}
                onChange={(e) => setBackupSettings({ ...backupSettings, maxBackupSize: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Bulut Sağlayıcı</InputLabel>
                <Select
                  value={backupSettings.cloudProvider}
                  label="Bulut Sağlayıcı"
                  onChange={(e: SelectChangeEvent) => setBackupSettings({ ...backupSettings, cloudProvider: e.target.value })}
                >
                  <MenuItem value="azure">Azure</MenuItem>
                  <MenuItem value="aws">AWS S3</MenuItem>
                  <MenuItem value="gcp">Google Cloud</MenuItem>
                  <MenuItem value="local">Yerel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bildirim Email"
                type="email"
                value={backupSettings.notificationEmail}
                onChange={(e) => setBackupSettings({ ...backupSettings, notificationEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Saklama Politikası</InputLabel>
                <Select
                  value={backupSettings.retentionPolicy}
                  label="Saklama Politikası"
                  onChange={(e: SelectChangeEvent) => setBackupSettings({ ...backupSettings, retentionPolicy: e.target.value })}
                >
                  <MenuItem value="tiered">Kademeli</MenuItem>
                  <MenuItem value="fixed">Sabit</MenuItem>
                  <MenuItem value="custom">Özel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>İptal</Button>
          <Button variant="contained" startIcon={<SettingsIcon />}>
            Ayarları Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Export both the old and new versions
export default BackupManagement;
export { default as ProfessionalBackup } from './ProfessionalBackup';