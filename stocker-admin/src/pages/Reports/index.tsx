import React, { useState, useEffect } from 'react';
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
  Alert,
  Modal,
  Form,
  Input,
  Radio,
  Badge,
  Tooltip,
  Dropdown,
  Menu,
  Timeline,
  Result,
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
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ScheduleOutlined,
  StarOutlined,
  ReloadOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { Line, Column, DualAxes } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { reportService, ReportDto, ReportType, ReportStatus } from '../../services/api/reportService';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

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
  const [selectedReport, setSelectedReport] = useState<ReportDto | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [createForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  // API State
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Placeholder data for templates and scheduled reports (to be replaced with API later)
  const [templates] = useState<ReportTemplate[]>([]);
  const [scheduledReports] = useState<ScheduledReport[]>([]);

  // Sample chart data (to be replaced with API data)
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

  // Load reports from API
  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getAll({ pageNumber, pageSize });
      setReports(response.data || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      message.error('Raporlar yüklenirken hata oluştu');
      console.error('Failed to load reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [pageNumber, pageSize]);

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case ReportType.Financial:
        return <DollarOutlined />;
      case ReportType.Users:
        return <TeamOutlined />;
      case ReportType.Subscriptions:
        return <BarChartOutlined />;
      case ReportType.Performance:
        return <LineChartOutlined />;
      case ReportType.Custom:
        return <PieChartOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'excel':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'csv':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'json':
        return <FileTextOutlined style={{ color: '#722ed1' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const handleGenerateReport = async (report: ReportDto) => {
    setLoading(true);
    try {
      await reportService.generate({
        reportId: report.id,
        format: 'pdf'
      });
      message.success('Rapor başarıyla oluşturuldu');
      await loadReports();
    } catch (error) {
      message.error('Rapor oluşturulurken hata oluştu');
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    createForm.validateFields().then(async values => {
      try {
        // Note: Create API endpoint not available in reportService yet
        // This would need to be added to the service
        message.info('Rapor oluşturma API entegrasyonu bekleniyor');
        setCreateModalVisible(false);
        createForm.resetFields();
      } catch (error) {
        message.error('Rapor oluşturulurken hata oluştu');
        console.error('Failed to create report:', error);
      }
    });
  };

  const handleScheduleReport = () => {
    scheduleForm.validateFields().then(async values => {
      try {
        await reportService.schedule(values.reportId, {
          frequency: values.schedule,
          time: '09:00',
          enabled: true
        });
        message.success('Rapor zamanlaması oluşturuldu');
        setScheduleModalVisible(false);
        scheduleForm.resetFields();
        await loadReports();
      } catch (error) {
        message.error('Zamanlama oluşturulurken hata oluştu');
        console.error('Failed to schedule report:', error);
      }
    });
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      // Note: Delete API endpoint not available in reportService yet
      // This would need to be added to the service
      message.info('Rapor silme API entegrasyonu bekleniyor');
      await loadReports();
    } catch (error) {
      message.error('Rapor silinirken hata oluştu');
      console.error('Failed to delete report:', error);
    }
  };

  const reportColumns = [
    {
      title: 'Rapor Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ReportDto) => (
        <Space>
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
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: ReportType) => (
        <Tag color={reportService.getTypeColor(type)}>{type}</Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReportStatus) => (
        <Badge
          status={status === ReportStatus.Completed ? 'success' :
                 status === ReportStatus.Running ? 'processing' :
                 status === ReportStatus.Scheduled ? 'warning' :
                 status === ReportStatus.Failed ? 'error' : 'default'}
          text={status === ReportStatus.Completed ? 'Tamamlandı' :
               status === ReportStatus.Running ? 'Çalışıyor' :
               status === ReportStatus.Scheduled ? 'Zamanlandı' :
               status === ReportStatus.Failed ? 'Başarısız' : 'Bekliyor'}
        />
      )
    },
    {
      title: 'Son Çalışma',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date?: string) => date ? dayjs(date).fromNow() : '-'
    },
    {
      title: 'Oluşturan',
      dataIndex: 'createdBy',
      key: 'createdBy'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: ReportDto) => (
        <Space>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="generate"
                  icon={<ReloadOutlined />}
                  onClick={() => handleGenerateReport(record)}
                >
                  Yeniden Oluştur
                </Menu.Item>
                <Menu.Item
                  key="preview"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedReport(record);
                    setPreviewModalVisible(true);
                  }}
                >
                  Önizle
                </Menu.Item>
                <Menu.Item key="download" icon={<DownloadOutlined />}>
                  İndir
                </Menu.Item>
                <Menu.Item key="email" icon={<MailOutlined />}>
                  E-posta Gönder
                </Menu.Item>
                <Menu.Item
                  key="schedule"
                  icon={<ScheduleOutlined />}
                  onClick={() => setScheduleModalVisible(true)}
                >
                  Zamanla
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="edit" icon={<EditOutlined />}>
                  Düzenle
                </Menu.Item>
                <Menu.Item
                  key="delete"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDeleteReport(record.id)}
                >
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
          <Text>{recipients?.length || 0} kişi</Text>
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
              value={totalCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Tamamlanan Raporlar"
              value={reports.filter(r => r.status === ReportStatus.Completed).length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Zamanlanmış"
              value={reports.filter(r => r.status === ReportStatus.Scheduled).length}
              prefix={<ScheduleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Bu Ay Oluşturulan"
              value={reports.filter(r => dayjs(r.createdAt).isAfter(dayjs().startOf('month'))).length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Card bordered={false}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Tüm Raporlar" key="all">
              <Space style={{ marginBottom: 16 }}>
                <Select placeholder="Kategori" style={{ width: 150 }}>
                  <Option value="all">Tümü</Option>
                  <Option value="Financial">Finans</Option>
                  <Option value="Users">Kullanıcılar</Option>
                  <Option value="Subscriptions">Abonelikler</Option>
                  <Option value="Performance">Performans</Option>
                </Select>
                <Select placeholder="Durum" style={{ width: 120 }}>
                  <Option value="all">Tümü</Option>
                  <Option value="Pending">Bekliyor</Option>
                  <Option value="Running">Çalışıyor</Option>
                  <Option value="Completed">Tamamlandı</Option>
                  <Option value="Failed">Başarısız</Option>
                </Select>
                <Input.Search placeholder="Rapor ara..." style={{ width: 250 }} />
              </Space>

              <Table
                columns={reportColumns}
                dataSource={reports}
                rowKey="id"
                pagination={{
                  current: pageNumber,
                  pageSize: pageSize,
                  total: totalCount,
                  onChange: (page, size) => {
                    setPageNumber(page);
                    setPageSize(size || 10);
                  }
                }}
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
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card title="Sistem Performans Metrikleri" size="small">
                    <DualAxes {...dualAxesConfig} height={250} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Rapor Geçmişi" key="history">
              <Timeline mode="left">
                {reports.slice(0, 5).map((report, index) => (
                  <Timeline.Item
                    key={report.id}
                    color={report.status === ReportStatus.Completed ? 'green' :
                           report.status === ReportStatus.Running ? 'blue' :
                           report.status === ReportStatus.Failed ? 'red' : 'orange'}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{report.name}</Text>
                      <Text type="secondary">{report.createdBy} tarafından oluşturuldu</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(report.createdAt).format('DD.MM.YYYY HH:mm')}
                      </Text>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        </Card>
      </Spin>

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
                  <Option value="Financial">Finansal</Option>
                  <Option value="Users">Kullanıcılar</Option>
                  <Option value="Subscriptions">Abonelikler</Option>
                  <Option value="Performance">Performans</Option>
                  <Option value="Custom">Özel</Option>
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
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
              <Option value="Daily">Her gün</Option>
              <Option value="Weekly">Her hafta</Option>
              <Option value="Monthly">Her ay</Option>
              <Option value="Yearly">Her yıl</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="recipients"
            label="Alıcılar"
          >
            <Select mode="tags" placeholder="E-posta adresleri">
              <Option value="admin@example.com">admin@example.com</Option>
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
              icon={getTypeIcon(selectedReport.type)}
              title={selectedReport.name}
              subTitle={selectedReport.description}
              extra={[
                <Text key="date">
                  Oluşturulma: {dayjs(selectedReport.createdAt).format('DD.MM.YYYY HH:mm')}
                </Text>
              ]}
            />
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
