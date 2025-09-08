import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  Chip,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  useTheme,
  FormGroup,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Api as ApiIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
  Extension as IntegrationsIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Public as WebsiteIcon,
  Image as ImageIcon,
  Build as MaintenanceIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  VpnKey as PasswordIcon,
  Fingerprint as TwoFactorIcon,
  NetworkLock as CorsIcon,
  HttpsLock as SslIcon,
  Send as SendIcon,
  Test as TestIcon,
  Template as TemplateIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as CurrencyIcon,
  Receipt as TaxIcon,
  Description as InvoiceIcon,
  AutoMode as AutoBillIcon,
  SpeedIcon,
  Code as CodeIcon,
  Webhook as WebhookIcon,
  DeveloperMode as DevModeIcon,
  Cloud as CloudIcon,
  Restore as RestoreIcon,
  Timer as TimerIcon,
  Sms as SmsIcon,
  MobileFriendly as PushIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Support as SupportIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  logoUrl: string;
  defaultLanguage: string;
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface SecuritySettings {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiration: number;
  twoFactorRequired: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  ipBlacklist: string[];
  sslRequired: boolean;
  corsEnabled: boolean;
  corsOrigins: string[];
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: string;
  fromAddress: string;
  fromName: string;
  emailFooter: string;
}

interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  defaultCurrency: string;
  taxRate: number;
  autoBilling: boolean;
  invoiceTemplate: string;
}

interface ApiSettings {
  rateLimitEnabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  apiKeysEnabled: boolean;
  webhooksEnabled: boolean;
  developerMode: boolean;
  apiDocumentationUrl: string;
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: string;
  backupRetention: number;
  backupDestination: string;
  awsAccessKey: string;
  awsSecretKey: string;
  awsBucket: string;
  localBackupPath: string;
}

interface NotificationSettings {
  systemNotifications: boolean;
  emailNotifications: boolean;
  smsEnabled: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  pushNotifications: boolean;
  fcmServerKey: string;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, any>;
  description: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Settings states
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'Stocker Admin',
    siteUrl: 'https://admin.stocker.com',
    logoUrl: '',
    defaultLanguage: 'tr',
    defaultTimezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24',
    maintenanceMode: false,
    maintenanceMessage: 'Sistem bakımda. Lütfen daha sonra tekrar deneyiniz.',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiration: 90,
    twoFactorRequired: false,
    sessionTimeout: 30,
    ipWhitelist: [],
    ipBlacklist: [],
    sslRequired: true,
    corsEnabled: true,
    corsOrigins: ['https://stocker.com', 'https://app.stocker.com'],
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'TLS',
    fromAddress: 'noreply@stocker.com',
    fromName: 'Stocker',
    emailFooter: 'Bu e-posta Stocker tarafından gönderilmiştir.',
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: true,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalClientSecret: '',
    defaultCurrency: 'TRY',
    taxRate: 20,
    autoBilling: true,
    invoiceTemplate: 'default',
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    rateLimitEnabled: true,
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    apiKeysEnabled: true,
    webhooksEnabled: true,
    developerMode: false,
    apiDocumentationUrl: 'https://docs.stocker.com/api',
  });

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupDestination: 's3',
    awsAccessKey: '',
    awsSecretKey: '',
    awsBucket: 'stocker-backups',
    localBackupPath: '/backups',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    systemNotifications: true,
    emailNotifications: true,
    smsEnabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    pushNotifications: false,
    fcmServerKey: '',
  });

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Google Analytics',
      type: 'analytics',
      enabled: false,
      config: { trackingId: '' },
      description: 'Web sitesi trafiği ve kullanıcı davranışlarını analiz edin',
      icon: <GoogleIcon />,
    },
    {
      id: '2',
      name: 'Stripe',
      type: 'payment',
      enabled: true,
      config: { webhookUrl: 'https://api.stocker.com/webhooks/stripe' },
      description: 'Kredi kartı ödemeleri ve abonelikleri',
      icon: <CreditCardIcon />,
    },
    {
      id: '3',
      name: 'Twilio SMS',
      type: 'sms',
      enabled: false,
      config: { accountSid: '', authToken: '' },
      description: 'SMS bildirimleri ve iki faktörlü doğrulama',
      icon: <SmsIcon />,
    },
    {
      id: '4',
      name: 'GitHub OAuth',
      type: 'oauth',
      enabled: true,
      config: { clientId: '', clientSecret: '' },
      description: 'GitHub ile giriş yapmayı etkinleştir',
      icon: <GitHubIcon />,
    },
  ]);

  // Dialog states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // Form states
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newCorsOrigin, setNewCorsOrigin] = useState('');

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSnackbar(`${section} ayarları başarıyla kaydedildi`, 'success');
    } catch (error) {
      showSnackbar(`${section} ayarları kaydedilemedi`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSnackbar('Test e-postası başarıyla gönderildi', 'success');
      setTestEmailDialogOpen(false);
    } catch (error) {
      showSnackbar('Test e-postası gönderilemedi', 'error');
    }
  };

  const handleAddIpAddress = (type: 'whitelist' | 'blacklist') => {
    if (!newIpAddress.trim()) return;
    
    if (type === 'whitelist') {
      setSecuritySettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIpAddress.trim()]
      }));
    } else {
      setSecuritySettings(prev => ({
        ...prev,
        ipBlacklist: [...prev.ipBlacklist, newIpAddress.trim()]
      }));
    }
    setNewIpAddress('');
  };

  const handleRemoveIpAddress = (ip: string, type: 'whitelist' | 'blacklist') => {
    if (type === 'whitelist') {
      setSecuritySettings(prev => ({
        ...prev,
        ipWhitelist: prev.ipWhitelist.filter(item => item !== ip)
      }));
    } else {
      setSecuritySettings(prev => ({
        ...prev,
        ipBlacklist: prev.ipBlacklist.filter(item => item !== ip)
      }));
    }
  };

  const handleAddCorsOrigin = () => {
    if (!newCorsOrigin.trim()) return;
    setSecuritySettings(prev => ({
      ...prev,
      corsOrigins: [...prev.corsOrigins, newCorsOrigin.trim()]
    }));
    setNewCorsOrigin('');
  };

  const handleRemoveCorsOrigin = (origin: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      corsOrigins: prev.corsOrigins.filter(item => item !== origin)
    }));
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      showSnackbar('Yedekleme işlemi başlatıldı', 'success');
      setBackupDialogOpen(false);
    } catch (error) {
      showSnackbar('Yedekleme işlemi başlatılamadı', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, enabled }
          : integration
      )
    );
    showSnackbar(`Entegrasyon ${enabled ? 'aktif edildi' : 'devre dışı bırakıldı'}`, 'info');
  };

  const tabConfigs = [
    { label: 'Genel Ayarlar', icon: <SettingsIcon /> },
    { label: 'Güvenlik Ayarları', icon: <SecurityIcon /> },
    { label: 'E-posta Ayarları', icon: <EmailIcon /> },
    { label: 'Ödeme Ayarları', icon: <PaymentIcon /> },
    { label: 'API Ayarları', icon: <ApiIcon /> },
    { label: 'Yedekleme Ayarları', icon: <BackupIcon /> },
    { label: 'Bildirim Ayarları', icon: <NotificationsIcon /> },
    { label: 'Entegrasyonlar', icon: <IntegrationsIcon /> },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/admin">
            Yönetim Paneli
          </Link>
          <Typography color="text.primary">Sistem Ayarları</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Sistem Ayarları
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tüm sistem ayarlarını buradan yönetin ve yapılandırın
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 72 }}
          >
            {tabConfigs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{ minHeight: 72, textTransform: 'none' }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {/* Genel Ayarlar */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <WebsiteIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Site Bilgileri</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Site Adı"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Site URL"
                        value={generalSettings.siteUrl}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Logo URL"
                        value={generalSettings.logoUrl}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ImageIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LanguageIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Bölgesel Ayarlar</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Varsayılan Dil</InputLabel>
                        <Select
                          value={generalSettings.defaultLanguage}
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                        >
                          <MenuItem value="tr">Türkçe</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="de">Deutsch</MenuItem>
                          <MenuItem value="fr">Français</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Saat Dilimi</InputLabel>
                        <Select
                          value={generalSettings.defaultTimezone}
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultTimezone: e.target.value }))}
                        >
                          <MenuItem value="Europe/Istanbul">İstanbul (UTC+3)</MenuItem>
                          <MenuItem value="UTC">UTC (UTC+0)</MenuItem>
                          <MenuItem value="America/New_York">New York (UTC-5)</MenuItem>
                          <MenuItem value="Europe/London">Londra (UTC+0)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tarih Formatı</InputLabel>
                        <Select
                          value={generalSettings.dateFormat}
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                        >
                          <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Saat Formatı</InputLabel>
                        <Select
                          value={generalSettings.timeFormat}
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
                        >
                          <MenuItem value="24">24 Saat</MenuItem>
                          <MenuItem value="12">12 Saat (AM/PM)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MaintenanceIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Bakım Modu</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      />
                    }
                    label="Bakım modunu aktif et"
                  />
                  {generalSettings.maintenanceMode && (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Bakım Mesajı"
                      value={generalSettings.maintenanceMessage}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      sx={{ mt: 2 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('Genel')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Güvenlik Ayarları */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PasswordIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Şifre Politikaları</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Minimum Şifre Uzunluğu"
                        value={securitySettings.minPasswordLength}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, minPasswordLength: parseInt(e.target.value) }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.requireUppercase}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                            />
                          }
                          label="Büyük harf zorunlu"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.requireLowercase}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                            />
                          }
                          label="Küçük harf zorunlu"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.requireNumbers}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                            />
                          }
                          label="Rakam zorunlu"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.requireSpecialChars}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                            />
                          }
                          label="Özel karakter zorunlu"
                        />
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Şifre Geçerlilik Süresi (gün)"
                        value={securitySettings.passwordExpiration}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiration: parseInt(e.target.value) }))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TwoFactorIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">İki Faktörlü Doğrulama</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.twoFactorRequired}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: e.target.checked }))}
                      />
                    }
                    label="Tüm kullanıcılar için 2FA zorunlu"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Oturum Zaman Aşımı (dakika)"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ShieldIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">IP Beyaz Listesi</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="IP Adresi Ekle"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleAddIpAddress('whitelist')}>
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <List dense>
                    {securitySettings.ipWhitelist.map((ip, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={ip} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveIpAddress(ip, 'whitelist')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LockIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">IP Kara Listesi</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="IP Adresi Ekle"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleAddIpAddress('blacklist')}>
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <List dense>
                    {securitySettings.ipBlacklist.map((ip, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={ip} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveIpAddress(ip, 'blacklist')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SslIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">SSL/TLS ve CORS Ayarları</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.sslRequired}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sslRequired: e.target.checked }))}
                          />
                        }
                        label="SSL/HTTPS zorunlu"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.corsEnabled}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, corsEnabled: e.target.checked }))}
                          />
                        }
                        label="CORS aktif"
                      />
                    </Grid>
                    {securitySettings.corsEnabled && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="CORS Origin Ekle"
                          value={newCorsOrigin}
                          onChange={(e) => setNewCorsOrigin(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleAddCorsOrigin}>
                                  <AddIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Box sx={{ mt: 1 }}>
                          {securitySettings.corsOrigins.map((origin, index) => (
                            <Chip
                              key={index}
                              label={origin}
                              onDelete={() => handleRemoveCorsOrigin(origin)}
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('Güvenlik')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* E-posta Ayarları */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EmailIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">SMTP Konfigürasyonu</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="SMTP Port"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Kullanıcı Adı"
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type={showSmtpPassword ? 'text' : 'password'}
                        label="Şifre"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                              >
                                {showSmtpPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Şifreleme</InputLabel>
                        <Select
                          value={emailSettings.smtpEncryption}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpEncryption: e.target.value }))}
                        >
                          <MenuItem value="TLS">TLS</MenuItem>
                          <MenuItem value="SSL">SSL</MenuItem>
                          <MenuItem value="NONE">Yok</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Gönderen Adresi"
                        type="email"
                        value={emailSettings.fromAddress}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromAddress: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Gönderen Adı"
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="E-posta Alt Bilgisi"
                        value={emailSettings.emailFooter}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFooter: e.target.value }))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TestIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Test ve Şablonlar</Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={() => setTestEmailDialogOpen(true)}
                    sx={{ mb: 2 }}
                  >
                    Test E-postası Gönder
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TemplateIcon />}
                  >
                    E-posta Şablonları
                  </Button>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bağlantı Durumu
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography variant="body2" color="success.main">
                      SMTP bağlantısı aktif
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Son test: {format(new Date(), 'dd.MM.yyyy HH:mm', { locale: tr })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<TestIcon />}
                  onClick={() => setTestEmailDialogOpen(true)}
                >
                  Bağlantıyı Test Et
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('E-posta')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Ödeme Ayarları */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CreditCardIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Stripe Ayarları</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.stripeEnabled}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: e.target.checked }))}
                      />
                    }
                    label="Stripe'ı aktif et"
                    sx={{ mb: 2 }}
                  />
                  {paymentSettings.stripeEnabled && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Publishable Key"
                          value={paymentSettings.stripePublishableKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Secret Key"
                          type="password"
                          value={paymentSettings.stripeSecretKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PaymentIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">PayPal Ayarları</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.paypalEnabled}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalEnabled: e.target.checked }))}
                      />
                    }
                    label="PayPal'ı aktif et"
                    sx={{ mb: 2 }}
                  />
                  {paymentSettings.paypalEnabled && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Client ID"
                          value={paymentSettings.paypalClientId}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Client Secret"
                          type="password"
                          value={paymentSettings.paypalClientSecret}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientSecret: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CurrencyIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Para Birimi ve Vergi</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Varsayılan Para Birimi</InputLabel>
                        <Select
                          value={paymentSettings.defaultCurrency}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                        >
                          <MenuItem value="TRY">Türk Lirası (₺)</MenuItem>
                          <MenuItem value="USD">US Dollar ($)</MenuItem>
                          <MenuItem value="EUR">Euro (€)</MenuItem>
                          <MenuItem value="GBP">British Pound (£)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Vergi Oranı (%)"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TaxIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <InvoiceIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Fatura ve Otomatik Ödeme</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Fatura Şablonu</InputLabel>
                        <Select
                          value={paymentSettings.invoiceTemplate}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, invoiceTemplate: e.target.value }))}
                        >
                          <MenuItem value="default">Varsayılan</MenuItem>
                          <MenuItem value="modern">Modern</MenuItem>
                          <MenuItem value="classic">Klasik</MenuItem>
                          <MenuItem value="minimal">Minimal</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={paymentSettings.autoBilling}
                            onChange={(e) => setPaymentSettings(prev => ({ ...prev, autoBilling: e.target.checked }))}
                          />
                        }
                        label="Otomatik faturalandırmayı aktif et"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('Ödeme')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Ayarları */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SpeedIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Rate Limiting</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apiSettings.rateLimitEnabled}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, rateLimitEnabled: e.target.checked }))}
                      />
                    }
                    label="Rate limiting'i aktif et"
                    sx={{ mb: 2 }}
                  />
                  {apiSettings.rateLimitEnabled && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Dakika Başına İstek Sayısı"
                          value={apiSettings.requestsPerMinute}
                          onChange={(e) => setApiSettings(prev => ({ ...prev, requestsPerMinute: parseInt(e.target.value) }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Saat Başına İstek Sayısı"
                          value={apiSettings.requestsPerHour}
                          onChange={(e) => setApiSettings(prev => ({ ...prev, requestsPerHour: parseInt(e.target.value) }))}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <KeyIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">API Key Yönetimi</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apiSettings.apiKeysEnabled}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, apiKeysEnabled: e.target.checked }))}
                      />
                    }
                    label="API key kullanımını aktif et"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<KeyIcon />}
                    onClick={() => setApiKeyDialogOpen(true)}
                  >
                    API Key'leri Yönet
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <WebhookIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Webhook Ayarları</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apiSettings.webhooksEnabled}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, webhooksEnabled: e.target.checked }))}
                      />
                    }
                    label="Webhook'ları aktif et"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<WebhookIcon />}
                  >
                    Webhook'ları Yönet
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <DevModeIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Geliştirici Modu</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={apiSettings.developerMode}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, developerMode: e.target.checked }))}
                      />
                    }
                    label="Geliştirici modunu aktif et"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="API Dokümantasyon URL"
                    value={apiSettings.apiDocumentationUrl}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, apiDocumentationUrl: e.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CodeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('API')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Yedekleme Ayarları */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ScheduleIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Otomatik Yedekleme</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backupSettings.autoBackupEnabled}
                        onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackupEnabled: e.target.checked }))}
                      />
                    }
                    label="Otomatik yedeklemeyi aktif et"
                    sx={{ mb: 2 }}
                  />
                  {backupSettings.autoBackupEnabled && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Yedekleme Sıklığı</InputLabel>
                          <Select
                            value={backupSettings.backupFrequency}
                            onChange={(e) => setBackupSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                          >
                            <MenuItem value="hourly">Saatlik</MenuItem>
                            <MenuItem value="daily">Günlük</MenuItem>
                            <MenuItem value="weekly">Haftalık</MenuItem>
                            <MenuItem value="monthly">Aylık</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Yedek Saklama Süresi (gün)"
                          value={backupSettings.backupRetention}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CloudIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Yedekleme Hedefi</Typography>
                  </Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Yedekleme Konumu</InputLabel>
                    <Select
                      value={backupSettings.backupDestination}
                      onChange={(e) => setBackupSettings(prev => ({ ...prev, backupDestination: e.target.value }))}
                    >
                      <MenuItem value="local">Yerel Sunucu</MenuItem>
                      <MenuItem value="s3">Amazon S3</MenuItem>
                      <MenuItem value="gcp">Google Cloud Storage</MenuItem>
                      <MenuItem value="azure">Azure Blob Storage</MenuItem>
                    </Select>
                  </FormControl>

                  {backupSettings.backupDestination === 's3' && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="AWS Access Key"
                          value={backupSettings.awsAccessKey}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, awsAccessKey: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="AWS Secret Key"
                          type="password"
                          value={backupSettings.awsSecretKey}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, awsSecretKey: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="S3 Bucket Adı"
                          value={backupSettings.awsBucket}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, awsBucket: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {backupSettings.backupDestination === 'local' && (
                    <TextField
                      fullWidth
                      label="Yerel Yedekleme Yolu"
                      value={backupSettings.localBackupPath}
                      onChange={(e) => setBackupSettings(prev => ({ ...prev, localBackupPath: e.target.value }))}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BackupIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Manuel Yedekleme ve Geri Yükleme</Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<BackupIcon />}
                        onClick={() => setBackupDialogOpen(true)}
                      >
                        Şimdi Yedekle
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                      >
                        Geri Yükle
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                      >
                        Yedekleri Listele
                      </Button>
                    </Grid>
                  </Grid>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Son yedekleme: {format(new Date(), 'dd.MM.yyyy HH:mm', { locale: tr })}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('Yedekleme')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Bildirim Ayarları */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <NotificationsIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Sistem Bildirimleri</Typography>
                  </Box>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.systemNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemNotifications: e.target.checked }))}
                        />
                      }
                      label="Sistem bildirimlerini aktif et"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        />
                      }
                      label="E-posta bildirimlerini aktif et"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SmsIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">SMS Ayarları (Twilio)</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.smsEnabled}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                      />
                    }
                    label="SMS bildirimlerini aktif et"
                    sx={{ mb: 2 }}
                  />
                  {notificationSettings.smsEnabled && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Twilio Account SID"
                          value={notificationSettings.twilioAccountSid}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, twilioAccountSid: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Twilio Auth Token"
                          type="password"
                          value={notificationSettings.twilioAuthToken}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, twilioAuthToken: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Twilio Telefon Numarası"
                          value={notificationSettings.twilioPhoneNumber}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PushIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Push Bildirimleri</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      />
                    }
                    label="Push bildirimlerini aktif et"
                    sx={{ mb: 2 }}
                  />
                  {notificationSettings.pushNotifications && (
                    <TextField
                      fullWidth
                      label="FCM Server Key"
                      type="password"
                      value={notificationSettings.fcmServerKey}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, fcmServerKey: e.target.value }))}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSaveSettings('Bildirim')}
                  disabled={loading}
                >
                  Kaydet
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Entegrasyonlar */}
        <TabPanel value={tabValue} index={7}>
          <Grid container spacing={3}>
            {integrations.map((integration) => (
              <Grid item xs={12} md={6} key={integration.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {integration.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {integration.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {integration.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={integration.enabled}
                        onChange={(e) => handleToggleIntegration(integration.id, e.target.checked)}
                      />
                    </Box>
                    <Chip
                      label={integration.type}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setIntegrationDialogOpen(true);
                        }}
                      >
                        Yapılandır
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TestIcon />}
                      >
                        Test Et
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  border: '2px dashed',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Yeni Entegrasyon Ekle
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Üçüncü taraf servislerle entegrasyonlar ekleyin
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={() => setTestEmailDialogOpen(false)}>
        <DialogTitle>Test E-postası Gönder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="email"
            label="E-posta Adresi"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleTestEmail}>
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Yedekleme İşlemi</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Sistem verilerinizi yedeklemek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bu işlem birkaç dakika sürebilir ve sistem performansını etkileyebilir.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleBackupNow} disabled={loading}>
            {loading ? 'Yedekleniyor...' : 'Yedekle'}
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
    </Box>
  );
};

export default SettingsPage;