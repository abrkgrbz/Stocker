import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  DatePicker, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Tabs, 
  Statistic, 
  Progress, 
  Alert, 
  Modal, 
  Form, 
  Input, 
  Radio, 
  Checkbox, 
  Divider, 
  List, 
  Badge, 
  Tooltip, 
  Dropdown, 
  Menu,
  Timeline,
  Result,
  Empty,
  Spin,
  message 
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  CalendarOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  ScheduleOutlined,
  SaveOutlined,
  ShareAltOutlined,
  FolderOutlined,
  StarOutlined,
  ReloadOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area, DualAxes } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'usage' | 'performance' | 'tenant' | 'audit' | 'custom';
  category: string;
  description: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastGenerated?: string;
  nextGeneration?: string;
  size?: string;
  status: 'ready' | 'generating' | 'scheduled' | 'failed';
  createdBy: string;
  createdAt: string;
  tags: string[];
  recipients?: string[];
  starred?: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  filters: any[];
  charts: string[];
  isPublic: boolean;
  usageCount: number;
}

interface ScheduledReport {
  id: string;
  reportId: string;
  reportName: string;
  schedule: string;
  nextRun: string;
  lastRun?: string;
  recipients: string[];
  format: string;
  enabled: boolean;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [createForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Aylık Finansal Özet',
      type: 'financial',
      category: 'Finans',
      description: 'Aylık gelir, gider ve kar analizi',
      format: 'pdf',
      schedule: 'monthly',
      lastGenerated: '2024-01-01 09:00',
      nextGeneration: '2024-02-01 09:00',
      size: '2.4 MB',
      status: 'ready',
      createdBy: 'Admin',
      createdAt: '2023-12-01',
      tags: ['finans', 'aylık', 'özet'],
      recipients: ['admin@example.com', 'finance@example.com'],
      starred: true
    },
    {
      id: '2',
      name: 'Tenant Kullanım Raporu',
      type: 'usage',
      category: 'Kullanım',
      description: 'Tenant bazlı detaylı kullanım istatistikleri',
      format: 'excel',
      schedule: 'weekly',
      lastGenerated: '2024-01-14 10:00',
      nextGeneration: '2024-01-21 10:00',
      size: '5.8 MB',
      status: 'ready',
      createdBy: 'System',
      createdAt: '2023-11-15',
      tags: ['tenant', 'kullanım', 'haftalık']
    },
    {
      id: '3',
      name: 'Performans Metrikleri',
      type: 'performance',
      category: 'Performans',
      description: 'Sistem performans ve yanıt süreleri analizi',
      format: 'pdf',
      lastGenerated: '2024-01-15 14:30',
      size: '1.2 MB',
      status: 'generating',
      createdBy: 'DevOps',
      createdAt: '2024-01-10',
      tags: ['performans', 'metrik', 'sistem']
    },
    {
      id: '4',
      name: 'Denetim Günlüğü Raporu',
      type: 'audit',
      category: 'Güvenlik',
      description: 'Güvenlik ve denetim olayları özeti',
      format: 'csv',
      schedule: 'daily',
      lastGenerated: '2024-01-15 00:00',
      nextGeneration: '2024-01-16 00:00',
      size: '890 KB',
      status: 'ready',
      createdBy: 'Security',
      createdAt: '2023-10-20',
      tags: ['güvenlik', 'denetim', 'günlük'],
      recipients: ['security@example.com']
    }
  ]);

  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Finansal Özet Şablonu',
      description: 'Standart finansal raporlama şablonu',
      category: 'Finans',
      fields: ['revenue', 'expenses', 'profit', 'tax'],
      filters: ['date_range', 'tenant', 'product'],
      charts: ['line', 'bar', 'pie'],
      isPublic: true,
      usageCount: 156
    },
    {
      id: '2',
      name: 'Kullanıcı Aktivite Şablonu',
      description: 'Kullanıcı davranış ve aktivite analizi',
      category: 'Kullanım',
      fields: ['logins', 'actions', 'duration', 'pages'],
      filters: ['date_range', 'user_type', 'tenant'],
      charts: ['area', 'heatmap'],
      isPublic: true,
      usageCount: 89
    },
    {
      id: '3',
      name: 'SLA Performans Şablonu',
      description: 'Servis seviyesi anlaşması performansı',
      category: 'Performans',
      fields: ['uptime', 'response_time', 'error_rate'],
      filters: ['date_range', 'service', 'severity'],
      charts: ['gauge', 'line'],
      isPublic: false,
      usageCount: 45
    }
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      reportId: '1',
      reportName: 'Aylık Finansal Özet',
      schedule: 'Her ayın 1\'i saat 09:00',
      nextRun: '2024-02-01 09:00',
      lastRun: '2024-01-01 09:00',
      recipients: ['admin@example.com', 'finance@example.com'],
      format: 'PDF',
      enabled: true
    },
    {
      id: '2',
      reportId: '2',
      reportName: 'Tenant Kullanım Raporu',
      schedule: 'Her Pazartesi saat 10:00',
      nextRun: '2024-01-22 10:00',
      lastRun: '2024-01-15 10:00',
      recipients: ['admin@example.com'],
      format: 'Excel',
      enabled: true
    },
    {
      id: '3',
      reportId: '4',
      reportName: 'Denetim Günlüğü Raporu',
      schedule: 'Her gün saat 00:00',
      nextRun: '2024-01-16 00:00',
      lastRun: '2024-01-15 00:00',
      recipients: ['security@example.com'],
      format: 'CSV',
      enabled: false
    }
  ]);

  // Sample chart data
  const revenueData = [
    { month: 'Oca', value: 125000, type: 'Gelir' },
    { month: 'Şub', value: 135000, type: 'Gelir' },
    { month: 'Mar', value: 145000, type: 'Gelir' },
    { month: 'Nis', value: 155000, type: 'Gelir' },
    { month: 'May', value: 165000, type: 'Gelir' },
    { month: 'Haz', value: 175000, type: 'Gelir' },
    { month: 'Oca', value: 85000, type: 'Gider' },
    { month: 'Şub', value: 90000, type: 'Gider' },
    { month: 'Mar', value: 95000, type: 'Gider' },
    { month: 'Nis', value: 92000, type: 'Gider' },
    { month: 'May', value: 98000, type: 'Gider' },
    { month: 'Haz', value: 102000, type: 'Gider' }
  ];

  const usageData = [
    { tenant: 'Tenant A', usage: 450, limit: 500 },
    { tenant: 'Tenant B', usage: 380, limit: 500 },
    { tenant: 'Tenant C', usage: 290, limit: 300 },
    { tenant: 'Tenant D', usage: 520, limit: 600 },
    { tenant: 'Tenant E', usage: 180, limit: 200 }
  ];

  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62 },
    { time: '04:00', cpu: 38, memory: 58 },
    { time: '08:00', cpu: 72, memory: 78 },
    { time: '12:00', cpu: 85, memory: 82 },
    { time: '16:00', cpu: 78, memory: 75 },
    { time: '20:00', cpu: 65, memory: 70 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'green';
      case 'generating': return 'blue';
      case 'scheduled': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarOutlined />;
      case 'usage': return <BarChartOutlined />;
      case 'performance': return <LineChartOutlined />;
      case 'tenant': return <TeamOutlined />;
      case 'audit': return <FileTextOutlined />;
      default: return <PieChartOutlined />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'excel': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'csv': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'json': return <FileTextOutlined style={{ color: '#722ed1' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const handleGenerateReport = (report: Report) => {
    setLoading(true);
    message.loading('Rapor oluşturuluyor...');
    setTimeout(() => {
      setLoading(false);
      message.success('Rapor başarıyla oluşturuldu');
      setReports(prev => prev.map(r => 
        r.id === report.id 
          ? { ...r, status: 'ready', lastGenerated: dayjs().format('YYYY-MM-DD HH:mm') }
          : r
      ));
    }, 2000);
  };

  const handleCreateReport = () => {
    createForm.validateFields().then(values => {
      const newReport: Report = {
        id: Date.now().toString(),
        ...values,
        status: 'scheduled',
        createdBy: 'Current User',
        createdAt: dayjs().format('YYYY-MM-DD'),
        tags: values.tags || []
      };
      setReports([...reports, newReport]);
      message.success('Rapor başarıyla oluşturuldu');
      setCreateModalVisible(false);
      createForm.resetFields();
    });
  };

  const handleScheduleReport = () => {
    scheduleForm.validateFields().then(values => {
      const newSchedule: ScheduledReport = {
        id: Date.now().toString(),
        ...values,
        enabled: true,
        nextRun: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm')
      };
      setScheduledReports([...scheduledReports, newSchedule]);
      message.success('Rapor zamanlaması oluşturuldu');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
    });
  };

  const reportColumns = [
    {
      title: 'Rapor Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Report) => (
        <Space>
          {record.starred && <StarOutlined style={{ color: '#faad14' }} />}
          {getTypeIcon(record.type)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => getFormatIcon(format)
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'ready' ? 'success' : 
                 status === 'generating' ? 'processing' : 
                 status === 'scheduled' ? 'warning' : 'error'}
          text={status === 'ready' ? 'Hazır' :
               status === 'generating' ? 'Oluşturuluyor' :
               status === 'scheduled' ? 'Zamanlandı' : 'Başarısız'}
        />
      )
    },
    {
      title: 'Son Oluşturma',
      dataIndex: 'lastGenerated',
      key: 'lastGenerated',
      render: (date?: string) => date ? dayjs(date).fromNow() : '-'
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
      render: (size?: string) => size || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: Report) => (
        <Space>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="generate" icon={<ReloadOutlined />} 
                  onClick={() => handleGenerateReport(record)}>
                  Yeniden Oluştur
                </Menu.Item>
                <Menu.Item key="preview" icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedReport(record);
                    setPreviewModalVisible(true);
                  }}>
                  Önizle
                </Menu.Item>
                <Menu.Item key="download" icon={<DownloadOutlined />}>
                  İndir
                </Menu.Item>
                <Menu.Item key="email" icon={<MailOutlined />}>
                  E-posta Gönder
                </Menu.Item>
                <Menu.Item key="schedule" icon={<ScheduleOutlined />}
                  onClick={() => setScheduleModalVisible(true)}>
                  Zamanla
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="edit" icon={<EditOutlined />}>
                  Düzenle
                </Menu.Item>
                <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                  Sil
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<SettingOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const scheduledColumns = [
    {
      title: 'Rapor',
      dataIndex: 'reportName',
      key: 'reportName',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Zamanlama',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{schedule}</Text>
        </Space>
      )
    },
    {
      title: 'Sonraki Çalışma',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format('DD.MM.YYYY HH:mm')}</Text>
      )
    },
    {
      title: 'Alıcılar',
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients: string[]) => (
        <Space>
          <MailOutlined />
          <Text>{recipients.length} kişi</Text>
        </Space>
      )
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => <Tag>{format}</Tag>
    },
    {
      title: 'Durum',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge status={enabled ? 'success' : 'default'} 
               text={enabled ? 'Aktif' : 'Pasif'} />
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
          <Button size="small" icon={<DeleteOutlined />} danger>Sil</Button>
        </Space>
      )
    }
  ];

  const lineConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const columnConfig = {
    data: usageData,
    xField: 'tenant',
    yField: 'usage',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
  };

  const dualAxesConfig = {
    data: [performanceData, performanceData],
    xField: 'time',
    yField: ['cpu', 'memory'],
    geometryOptions: [
      {
        geometry: 'line',
        smooth: true,
        color: '#5B8FF9',
      },
      {
        geometry: 'line',
        smooth: true,
        color: '#5AD8A6',
      },
    ],
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <FileTextOutlined /> Raporlar
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="DD.MM.YYYY"
              />
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button type="primary" icon={<PlusOutlined />} 
                onClick={() => setCreateModalVisible(true)}>
                Yeni Rapor
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Rapor"
              value={reports.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Hazır Raporlar"
              value={reports.filter(r => r.status === 'ready').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Zamanlanmış"
              value={scheduledReports.filter(s => s.enabled).length}
              prefix={<ScheduleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Bu Ay Oluşturulan"
              value={42}
              prefix={<CalendarOutlined />}
              suffix={<Tag color="green">+12%</Tag>}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tüm Raporlar" key="all">
            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Kategori" style={{ width: 150 }}>
                <Option value="all">Tümü</Option>
                <Option value="financial">Finans</Option>
                <Option value="usage">Kullanım</Option>
                <Option value="performance">Performans</Option>
                <Option value="audit">Denetim</Option>
              </Select>
              <Select placeholder="Format" style={{ width: 120 }}>
                <Option value="all">Tümü</Option>
                <Option value="pdf">PDF</Option>
                <Option value="excel">Excel</Option>
                <Option value="csv">CSV</Option>
              </Select>
              <Input.Search placeholder="Rapor ara..." style={{ width: 250 }} />
            </Space>

            <Table
              columns={reportColumns}
              dataSource={reports}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Zamanlanmış Raporlar" key="scheduled">
            <Alert
              message="Otomatik Rapor Üretimi"
              description="Belirlediğiniz zaman aralıklarında otomatik olarak rapor oluşturulur ve belirtilen alıcılara gönderilir."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={scheduledColumns}
              dataSource={scheduledReports}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Rapor Şablonları" key="templates">
            <Row gutter={[16, 16]}>
              {templates.map(template => (
                <Col span={8} key={template.id}>
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="Kullan">
                        <PlayCircleOutlined key="use" />
                      </Tooltip>,
                      <Tooltip title="Düzenle">
                        <EditOutlined key="edit" />
                      </Tooltip>,
                      <Tooltip title="Kopyala">
                        <CopyOutlined key="copy" />
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          {template.name}
                          {template.isPublic && <Tag color="blue">Herkese Açık</Tag>}
                        </Space>
                      }
                      description={template.description}
                    />
                    <Divider />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Kullanım"
                          value={template.usageCount}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Alan Sayısı"
                          value={template.fields.length}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                    </Row>
                    <Space wrap style={{ marginTop: 16 }}>
                      {template.charts.map(chart => (
                        <Tag key={chart} icon={<PieChartOutlined />}>
                          {chart}
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Rapor Analizi" key="analytics">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Gelir/Gider Analizi" size="small">
                  <Line {...lineConfig} height={250} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Tenant Kullanım Durumu" size="small">
                  <Column {...columnConfig} height={250} />
                </Card>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={24}>
                <Card title="Sistem Performans Metrikleri" size="small">
                  <DualAxes {...dualAxesConfig} height={250} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Rapor Geçmişi" key="history">
            <Timeline mode="left">
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <Text strong>Aylık Finansal Özet</Text>
                  <Text type="secondary">admin@example.com tarafından oluşturuldu</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    15.01.2024 14:30
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Space direction="vertical" size={0}>
                  <Text strong>Tenant Kullanım Raporu</Text>
                  <Text type="secondary">Otomatik oluşturuldu</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    15.01.2024 10:00
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Space direction="vertical" size={0}>
                  <Text strong>Performans Metrikleri</Text>
                  <Text type="secondary">Zamanlandı</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    16.01.2024 09:00
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="red">
                <Space direction="vertical" size={0}>
                  <Text strong>Denetim Raporu</Text>
                  <Text type="secondary">Oluşturma başarısız</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    14.01.2024 23:59
                  </Text>
                </Space>
              </Timeline.Item>
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Report Modal */}
      <Modal
        title="Yeni Rapor Oluştur"
        visible={createModalVisible}
        onOk={handleCreateReport}
        onCancel={() => setCreateModalVisible(false)}
        width={700}
      >
        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Rapor Adı"
                rules={[{ required: true, message: 'Rapor adı gereklidir' }]}
              >
                <Input placeholder="Örn: Aylık Satış Raporu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Rapor Tipi"
                rules={[{ required: true, message: 'Rapor tipi seçiniz' }]}
              >
                <Select placeholder="Tip seçiniz">
                  <Option value="financial">Finansal</Option>
                  <Option value="usage">Kullanım</Option>
                  <Option value="performance">Performans</Option>
                  <Option value="tenant">Tenant</Option>
                  <Option value="audit">Denetim</Option>
                  <Option value="custom">Özel</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Açıklama"
          >
            <TextArea rows={3} placeholder="Rapor açıklaması" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori gereklidir' }]}
              >
                <Input placeholder="Örn: Finans, Satış, vb." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="format"
                label="Çıktı Formatı"
                rules={[{ required: true, message: 'Format seçiniz' }]}
              >
                <Select placeholder="Format seçiniz">
                  <Option value="pdf">PDF</Option>
                  <Option value="excel">Excel</Option>
                  <Option value="csv">CSV</Option>
                  <Option value="json">JSON</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tags"
            label="Etiketler"
          >
            <Select mode="tags" placeholder="Etiket ekleyin">
              <Option value="günlük">Günlük</Option>
              <Option value="haftalık">Haftalık</Option>
              <Option value="aylık">Aylık</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="schedule"
            label="Otomatik Oluşturma"
          >
            <Radio.Group>
              <Radio value="none">Yok</Radio>
              <Radio value="daily">Günlük</Radio>
              <Radio value="weekly">Haftalık</Radio>
              <Radio value="monthly">Aylık</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        title="Rapor Zamanla"
        visible={scheduleModalVisible}
        onOk={handleScheduleReport}
        onCancel={() => setScheduleModalVisible(false)}
        width={600}
      >
        <Form form={scheduleForm} layout="vertical">
          <Form.Item
            name="reportId"
            label="Rapor"
            rules={[{ required: true, message: 'Rapor seçiniz' }]}
          >
            <Select placeholder="Rapor seçiniz">
              {reports.map(report => (
                <Option key={report.id} value={report.id}>
                  {report.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="schedule"
            label="Zamanlama"
            rules={[{ required: true, message: 'Zamanlama gereklidir' }]}
          >
            <Select placeholder="Zamanlama seçiniz">
              <Option value="daily">Her gün</Option>
              <Option value="weekly">Her hafta</Option>
              <Option value="monthly">Her ay</Option>
              <Option value="quarterly">Her çeyrek</Option>
              <Option value="yearly">Her yıl</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="recipients"
            label="Alıcılar"
            rules={[{ required: true, message: 'En az bir alıcı ekleyin' }]}
          >
            <Select mode="tags" placeholder="E-posta adresleri">
              <Option value="admin@example.com">admin@example.com</Option>
              <Option value="finance@example.com">finance@example.com</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="format"
            label="Format"
            rules={[{ required: true, message: 'Format seçiniz' }]}
          >
            <Select placeholder="Format seçiniz">
              <Option value="PDF">PDF</Option>
              <Option value="Excel">Excel</Option>
              <Option value="CSV">CSV</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={selectedReport?.name}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={900}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            İndir
          </Button>,
          <Button key="print" icon={<PrinterOutlined />}>
            Yazdır
          </Button>,
          <Button key="email" icon={<MailOutlined />}>
            E-posta Gönder
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedReport && (
          <div>
            <Result
              icon={getFormatIcon(selectedReport.format)}
              title={selectedReport.name}
              subTitle={selectedReport.description}
              extra={[
                <Text key="date">
                  Oluşturulma: {dayjs(selectedReport.lastGenerated).format('DD.MM.YYYY HH:mm')}
                </Text>
              ]}
            />
            <Divider />
            <Alert
              message="Rapor Önizlemesi"
              description="Tam rapor içeriği burada görüntülenecek."
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;