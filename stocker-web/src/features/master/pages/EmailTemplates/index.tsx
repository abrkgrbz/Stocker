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
  Paper,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  History as HistoryIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddIcon,
  ColorLens as ColorLensIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Lock as LockIcon,
  NotificationsActive as NotificationIcon,
  Campaign as CampaignIcon,
  Badge as BadgeIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import Editor from '@monaco-editor/react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'system' | 'marketing' | 'transaction' | 'notification';
  type: 'welcome' | 'password_reset' | 'verification' | 'invoice' | 'payment' | 'subscription' | 'notification' | 'custom';
  status: 'active' | 'draft' | 'archived';
  language: 'tr' | 'en' | 'de' | 'fr';
  htmlContent: string;
  textContent: string;
  variables: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsed?: string;
  tags: string[];
}

interface EmailVariable {
  name: string;
  description: string;
  defaultValue: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'boolean' | 'url' | 'email';
}

interface EmailHistory {
  id: string;
  templateId: string;
  sentTo: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  openedAt?: string;
  clickedAt?: string;
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

const EmailTemplateManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'text' | 'split'>('split');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    category: 'notification' as 'system' | 'marketing' | 'transaction' | 'notification',
    type: 'custom' as any,
    status: 'draft' as 'active' | 'draft' | 'archived',
    language: 'tr' as 'tr' | 'en' | 'de' | 'fr',
    htmlContent: '',
    textContent: '',
    variables: [] as string[],
    tags: [] as string[]
  });

  const [testForm, setTestForm] = useState({
    recipientEmail: '',
    variables: {} as Record<string, string>
  });

  const availableVariables: EmailVariable[] = [
    { name: 'userName', description: 'Kullanıcı adı', defaultValue: 'Kullanıcı', required: true, type: 'text' },
    { name: 'userEmail', description: 'Kullanıcı e-postası', defaultValue: 'user@example.com', required: true, type: 'email' },
    { name: 'companyName', description: 'Şirket adı', defaultValue: 'Stocker', required: false, type: 'text' },
    { name: 'activationLink', description: 'Aktivasyon linki', defaultValue: 'https://...', required: false, type: 'url' },
    { name: 'invoiceNumber', description: 'Fatura numarası', defaultValue: 'INV-001', required: false, type: 'text' },
    { name: 'amount', description: 'Tutar', defaultValue: '100.00', required: false, type: 'number' },
    { name: 'date', description: 'Tarih', defaultValue: '2024-01-15', required: false, type: 'date' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setLoading(true);
    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Hoş Geldin E-postası',
        subject: 'Stocker\'a Hoş Geldiniz!',
        category: 'system',
        type: 'welcome',
        status: 'active',
        language: 'tr',
        htmlContent: '<h1>Hoş Geldiniz {{userName}}!</h1><p>Stocker ailesine katıldığınız için teşekkür ederiz.</p>',
        textContent: 'Hoş Geldiniz {{userName}}! Stocker ailesine katıldığınız için teşekkür ederiz.',
        variables: ['userName', 'companyName', 'activationLink'],
        attachments: [],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-14T15:30:00Z',
        usageCount: 245,
        lastUsed: '2024-01-15T09:00:00Z',
        tags: ['welcome', 'onboarding', 'activation']
      },
      {
        id: '2',
        name: 'Şifre Sıfırlama',
        subject: 'Şifre Sıfırlama Talebi',
        category: 'system',
        type: 'password_reset',
        status: 'active',
        language: 'tr',
        htmlContent: '<h2>Şifre Sıfırlama</h2><p>Merhaba {{userName}},</p><p>Şifrenizi sıfırlamak için <a href="{{resetLink}}">buraya tıklayın</a>.</p>',
        textContent: 'Merhaba {{userName}}, Şifrenizi sıfırlamak için linke tıklayın: {{resetLink}}',
        variables: ['userName', 'resetLink'],
        attachments: [],
        createdAt: '2024-01-08T10:00:00Z',
        updatedAt: '2024-01-12T11:00:00Z',
        usageCount: 89,
        lastUsed: '2024-01-15T08:30:00Z',
        tags: ['security', 'password', 'reset']
      },
      {
        id: '3',
        name: 'Fatura Bildirimi',
        subject: 'Faturanız Hazır - {{invoiceNumber}}',
        category: 'transaction',
        type: 'invoice',
        status: 'active',
        language: 'tr',
        htmlContent: '<h2>Fatura Detayları</h2><p>Sayın {{userName}},</p><p>{{invoiceNumber}} numaralı faturanız hazırlanmıştır. Tutar: {{amount}} TL</p>',
        textContent: 'Sayın {{userName}}, {{invoiceNumber}} numaralı faturanız hazırlanmıştır. Tutar: {{amount}} TL',
        variables: ['userName', 'invoiceNumber', 'amount', 'date'],
        attachments: ['invoice.pdf'],
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-13T14:00:00Z',
        usageCount: 567,
        lastUsed: '2024-01-15T10:00:00Z',
        tags: ['billing', 'invoice', 'payment']
      },
      {
        id: '4',
        name: 'Kampanya Duyurusu',
        subject: '🎉 Özel Kampanya - %30 İndirim!',
        category: 'marketing',
        type: 'custom',
        status: 'draft',
        language: 'tr',
        htmlContent: '<div style="text-align:center;"><h1>Özel Kampanya!</h1><p>Tüm paketlerde %30 indirim...</p></div>',
        textContent: 'Özel Kampanya! Tüm paketlerde %30 indirim...',
        variables: ['userName', 'discountCode'],
        attachments: [],
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-14T16:00:00Z',
        usageCount: 0,
        tags: ['marketing', 'campaign', 'discount']
      }
    ];
    setTemplates(mockTemplates);
    setLoading(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateTemplate = () => {
    setEditMode(false);
    setTemplateForm({
      name: '',
      subject: '',
      category: 'notification',
      type: 'custom',
      status: 'draft',
      language: 'tr',
      htmlContent: '',
      textContent: '',
      variables: [],
      tags: []
    });
    setOpenTemplateDialog(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditMode(true);
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      category: template.category,
      type: template.type,
      status: template.status,
      language: template.language,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
      tags: template.tags
    });
    setOpenTemplateDialog(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setOpenPreviewDialog(true);
  };

  const handleTestTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTestForm({
      recipientEmail: '',
      variables: template.variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {})
    });
    setOpenTestDialog(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Kopya)`,
      status: 'draft' as const,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <SettingsIcon />;
      case 'marketing':
        return <CampaignIcon />;
      case 'transaction':
        return <ReceiptIcon />;
      case 'notification':
        return <NotificationIcon />;
      default:
        return <EmailIcon />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <CelebrationIcon />;
      case 'password_reset':
        return <LockIcon />;
      case 'verification':
        return <CheckIcon />;
      case 'invoice':
        return <ReceiptIcon />;
      case 'payment':
        return <ShoppingCartIcon />;
      case 'subscription':
        return <BadgeIcon />;
      case 'notification':
        return <NotificationIcon />;
      default:
        return <EmailIcon />;
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

  const filteredTemplates = templates.filter(template => {
    if (filterCategory !== 'all' && template.category !== filterCategory) return false;
    if (filterStatus !== 'all' && template.status !== filterStatus) return false;
    return true;
  });

  const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f5f5f5; }
        .footer { padding: 10px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
        </div>
        <div class="content">
            <p>Merhaba {{userName}},</p>
            <p>İçerik buraya gelecek...</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Stocker. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>`;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          E-posta Şablon Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          Yeni Şablon
        </Button>
      </Box>

      <Paper elevation={0} sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6">Toplam Şablon</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {templates.length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {templates.filter(t => t.status === 'active').length} aktif
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SendIcon sx={{ mr: 2, color: theme.palette.success.main }} />
                  <Typography variant="h6">Gönderimler</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {templates.reduce((acc, t) => acc + t.usageCount, 0)}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Toplam gönderim
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LanguageIcon sx={{ mr: 2, color: theme.palette.warning.main }} />
                  <Typography variant="h6">Diller</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  4
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  TR, EN, DE, FR
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon sx={{ mr: 2, color: theme.palette.info.main }} />
                  <Typography variant="h6">Son Güncelleme</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  Bugün
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  3 şablon güncellendi
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={filterCategory}
              label="Kategori"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="system">Sistem</MenuItem>
              <MenuItem value="marketing">Pazarlama</MenuItem>
              <MenuItem value="transaction">İşlem</MenuItem>
              <MenuItem value="notification">Bildirim</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filterStatus}
              label="Durum"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="draft">Taslak</MenuItem>
              <MenuItem value="archived">Arşivlenmiş</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Şablon Adı</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Dil</TableCell>
                <TableCell>Kullanım</TableCell>
                <TableCell>Son Kullanım</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(template.type)}
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="body1">{template.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.subject}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getCategoryIcon(template.category)}
                        label={template.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.status}
                        color={getStatusColor(template.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={template.language.toUpperCase()} size="small" />
                    </TableCell>
                    <TableCell>{template.usageCount}</TableCell>
                    <TableCell>
                      {template.lastUsed
                        ? format(parseISO(template.lastUsed), 'dd MMM HH:mm', { locale: tr })
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Önizle">
                        <IconButton size="small" onClick={() => handlePreviewTemplate(template)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleEditTemplate(template)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Test Et">
                        <IconButton size="small" onClick={() => handleTestTemplate(template)}>
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleDuplicateTemplate(template)}>
                          <FileCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" onClick={() => handleDeleteTemplate(template.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTemplates.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Template Dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editMode ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Şablon Adı"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Konu"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                helperText="Değişken kullanabilirsiniz: {{variable}}"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={templateForm.category}
                  label="Kategori"
                  onChange={(e: SelectChangeEvent) => setTemplateForm({ ...templateForm, category: e.target.value as any })}
                >
                  <MenuItem value="system">Sistem</MenuItem>
                  <MenuItem value="marketing">Pazarlama</MenuItem>
                  <MenuItem value="transaction">İşlem</MenuItem>
                  <MenuItem value="notification">Bildirim</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tür</InputLabel>
                <Select
                  value={templateForm.type}
                  label="Tür"
                  onChange={(e: SelectChangeEvent) => setTemplateForm({ ...templateForm, type: e.target.value as any })}
                >
                  <MenuItem value="welcome">Hoş Geldin</MenuItem>
                  <MenuItem value="password_reset">Şifre Sıfırlama</MenuItem>
                  <MenuItem value="verification">Doğrulama</MenuItem>
                  <MenuItem value="invoice">Fatura</MenuItem>
                  <MenuItem value="payment">Ödeme</MenuItem>
                  <MenuItem value="subscription">Abonelik</MenuItem>
                  <MenuItem value="notification">Bildirim</MenuItem>
                  <MenuItem value="custom">Özel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={templateForm.status}
                  label="Durum"
                  onChange={(e: SelectChangeEvent) => setTemplateForm({ ...templateForm, status: e.target.value as any })}
                >
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="draft">Taslak</MenuItem>
                  <MenuItem value="archived">Arşivlenmiş</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Dil</InputLabel>
                <Select
                  value={templateForm.language}
                  label="Dil"
                  onChange={(e: SelectChangeEvent) => setTemplateForm({ ...templateForm, language: e.target.value as any })}
                >
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Kullanılabilir Değişkenler:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {availableVariables.map((variable) => (
                    <Chip
                      key={variable.name}
                      label={`{{${variable.name}}}`}
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${variable.name}}}`);
                      }}
                      title={variable.description}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                  >
                    <ToggleButton value="html">HTML</ToggleButton>
                    <ToggleButton value="text">Text</ToggleButton>
                    <ToggleButton value="split">Bölünmüş</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box sx={{ display: 'flex', height: 400 }}>
                  {(viewMode === 'html' || viewMode === 'split') && (
                    <Box sx={{ flex: viewMode === 'split' ? 1 : '1 1 100%', borderRight: viewMode === 'split' ? 1 : 0, borderColor: 'divider' }}>
                      <Editor
                        height="100%"
                        defaultLanguage="html"
                        value={templateForm.htmlContent || defaultHtmlTemplate}
                        onChange={(value) => setTemplateForm({ ...templateForm, htmlContent: value || '' })}
                        theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on'
                        }}
                      />
                    </Box>
                  )}
                  {(viewMode === 'text' || viewMode === 'split') && (
                    <Box sx={{ flex: viewMode === 'split' ? 1 : '1 1 100%' }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={16}
                        value={templateForm.textContent}
                        onChange={(e) => setTemplateForm({ ...templateForm, textContent: e.target.value })}
                        placeholder="Düz metin versiyonu..."
                        sx={{ '& .MuiInputBase-root': { height: '100%' } }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Etiketler"
                placeholder="Virgülle ayırın: etiket1, etiket2"
                value={templateForm.tags.join(', ')}
                onChange={(e) => setTemplateForm({ 
                  ...templateForm, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>İptal</Button>
          <Button variant="contained" startIcon={editMode ? <EditIcon /> : <AddIcon />}>
            {editMode ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Şablon Önizleme</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Tabs value={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="HTML Önizleme" />
                <Tab label="Metin Önizleme" />
              </Tabs>
              <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'white' }}>
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>E-posta Test Gönderimi</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alıcı E-posta"
                type="email"
                value={testForm.recipientEmail}
                onChange={(e) => setTestForm({ ...testForm, recipientEmail: e.target.value })}
              />
            </Grid>
            {selectedTemplate?.variables.map((variable) => (
              <Grid item xs={12} key={variable}>
                <TextField
                  fullWidth
                  label={variable}
                  value={testForm.variables[variable] || ''}
                  onChange={(e) => setTestForm({
                    ...testForm,
                    variables: { ...testForm.variables, [variable]: e.target.value }
                  })}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>İptal</Button>
          <Button variant="contained" startIcon={<SendIcon />}>
            Test E-postası Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Export both the old and new versions
export default EmailTemplateManagement;
export { default as ProfessionalEmailTemplates } from './ProfessionalEmailTemplates';