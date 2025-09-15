import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Badge, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Alert, 
  Timeline, 
  Tabs, 
  List, 
  Statistic, 
  Divider, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Upload, 
  Checkbox, 
  Radio, 
  Switch, 
  Tooltip, 
  Popconfirm, 
  Collapse, 
  Result, 
  Steps, 
  message, 
  notification 
} from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FileProtectOutlined,
  AuditOutlined,
  SecurityScanOutlined,
  ShieldOutlined,
  LockOutlined,
  KeyOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  BankOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  ContainerOutlined,
  ReconciliationOutlined,
  SolutionOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  InsuranceOutlined,
  PropertySafetyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  RightOutlined,
  CheckOutlined,
  CloseOutlined,
  SyncOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  FolderOpenOutlined,
  VerifiedOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Gauge, Line, Column, Pie, Radar } from '@ant-design/plots';
import moment from 'moment';

const { Title, Text, Paragraph, Link } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface ComplianceStandard {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  score: number;
  lastAudit?: string;
  nextAudit?: string;
  requirements: number;
  fulfilled: number;
  controls: ComplianceControl[];
}

interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'not-implemented' | 'planned';
  evidence?: string[];
  responsible?: string;
  dueDate?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ComplianceAudit {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'certification';
  auditor: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  findings: number;
  criticalFindings: number;
  score?: number;
  report?: string;
  nextReview?: string;
}

interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'expired';
  owner: string;
  lastUpdated: string;
  expiryDate?: string;
  size: string;
  tags: string[];
}

interface ComplianceRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  impact: 'severe' | 'major' | 'moderate' | 'minor' | 'negligible';
  status: 'identified' | 'assessing' | 'mitigating' | 'accepted' | 'closed';
  mitigation?: string;
  owner: string;
  identifiedDate: string;
  dueDate?: string;
}

interface ComplianceTraining {
  id: string;
  title: string;
  description: string;
  type: 'mandatory' | 'optional';
  category: string;
  duration: number;
  completionRate: number;
  totalUsers: number;
  completedUsers: number;
  deadline?: string;
  status: 'active' | 'upcoming' | 'completed' | 'overdue';
}

const TenantCompliance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [riskModalVisible, setRiskModalVisible] = useState(false);
  const [auditForm] = Form.useForm();
  const [documentForm] = Form.useForm();
  const [riskForm] = Form.useForm();

  const [overallCompliance, setOverallCompliance] = useState({
    score: 87,
    trend: 'up',
    standards: 12,
    compliant: 8,
    partial: 3,
    nonCompliant: 1
  });

  const [standards, setStandards] = useState<ComplianceStandard[]>([
    {
      id: '1',
      name: 'KVKK',
      code: 'TR-KVKK',
      description: 'Kişisel Verilerin Korunması Kanunu',
      category: 'Veri Koruma',
      status: 'compliant',
      score: 95,
      lastAudit: '2024-01-01',
      nextAudit: '2024-07-01',
      requirements: 45,
      fulfilled: 43,
      controls: [
        {
          id: '1',
          name: 'Veri İşleme Envanteri',
          description: 'Tüm veri işleme faaliyetlerinin kayıt altına alınması',
          status: 'implemented',
          evidence: ['kvkk-inventory.pdf'],
          responsible: 'DPO',
          priority: 'critical'
        },
        {
          id: '2',
          name: 'Aydınlatma Metni',
          description: 'Veri sahiplerine yönelik aydınlatma metinleri',
          status: 'implemented',
          evidence: ['privacy-notice.pdf'],
          responsible: 'Legal',
          priority: 'high'
        }
      ]
    },
    {
      id: '2',
      name: 'ISO 27001',
      code: 'ISO-27001:2013',
      description: 'Bilgi Güvenliği Yönetim Sistemi',
      category: 'Bilgi Güvenliği',
      status: 'partial',
      score: 78,
      lastAudit: '2023-12-15',
      nextAudit: '2024-06-15',
      requirements: 114,
      fulfilled: 89,
      controls: []
    },
    {
      id: '3',
      name: 'PCI DSS',
      code: 'PCI-DSS-v4',
      description: 'Ödeme Kartı Endüstrisi Veri Güvenliği Standardı',
      category: 'Ödeme Güvenliği',
      status: 'compliant',
      score: 92,
      lastAudit: '2024-01-10',
      nextAudit: '2024-04-10',
      requirements: 12,
      fulfilled: 11,
      controls: []
    },
    {
      id: '4',
      name: 'GDPR',
      code: 'EU-GDPR',
      description: 'Genel Veri Koruma Yönetmeliği',
      category: 'Veri Koruma',
      status: 'partial',
      score: 82,
      lastAudit: '2023-11-20',
      nextAudit: '2024-05-20',
      requirements: 99,
      fulfilled: 81,
      controls: []
    }
  ]);

  const [audits, setAudits] = useState<ComplianceAudit[]>([
    {
      id: '1',
      title: 'KVKK Yıllık Denetimi',
      type: 'internal',
      auditor: 'İç Denetim Ekibi',
      date: '2024-01-01',
      status: 'completed',
      findings: 5,
      criticalFindings: 0,
      score: 95,
      report: 'kvkk-audit-2024.pdf'
    },
    {
      id: '2',
      title: 'ISO 27001 Sertifikasyon Denetimi',
      type: 'certification',
      auditor: 'BSI Group',
      date: '2024-06-15',
      status: 'scheduled',
      findings: 0,
      criticalFindings: 0
    },
    {
      id: '3',
      title: 'PCI DSS Uyumluluk Taraması',
      type: 'external',
      auditor: 'QSA Auditor',
      date: '2024-01-10',
      status: 'completed',
      findings: 2,
      criticalFindings: 0,
      score: 92,
      report: 'pci-dss-scan-2024.pdf'
    }
  ]);

  const [documents, setDocuments] = useState<ComplianceDocument[]>([
    {
      id: '1',
      name: 'Gizlilik Politikası',
      type: 'policy',
      category: 'Veri Koruma',
      version: '2.3',
      status: 'approved',
      owner: 'Legal Team',
      lastUpdated: '2024-01-05',
      expiryDate: '2025-01-05',
      size: '245 KB',
      tags: ['KVKK', 'GDPR', 'Gizlilik']
    },
    {
      id: '2',
      name: 'Bilgi Güvenliği Politikası',
      type: 'policy',
      category: 'Güvenlik',
      version: '3.1',
      status: 'approved',
      owner: 'CISO',
      lastUpdated: '2023-12-20',
      expiryDate: '2024-12-20',
      size: '512 KB',
      tags: ['ISO 27001', 'Güvenlik']
    },
    {
      id: '3',
      name: 'Veri Saklama ve İmha Politikası',
      type: 'procedure',
      category: 'Veri Yönetimi',
      version: '1.5',
      status: 'review',
      owner: 'DPO',
      lastUpdated: '2024-01-10',
      size: '189 KB',
      tags: ['KVKK', 'Veri Yönetimi']
    }
  ]);

  const [risks, setRisks] = useState<ComplianceRisk[]>([
    {
      id: '1',
      title: 'Veri İhlali Riski',
      description: 'Yetkisiz erişim nedeniyle kişisel veri ihlali riski',
      category: 'Veri Güvenliği',
      severity: 'high',
      likelihood: 'medium',
      impact: 'major',
      status: 'mitigating',
      mitigation: 'Gelişmiş erişim kontrolleri ve şifreleme uygulanıyor',
      owner: 'CISO',
      identifiedDate: '2024-01-05',
      dueDate: '2024-02-01'
    },
    {
      id: '2',
      title: 'Üçüncü Taraf Uyumsuzluğu',
      description: 'Tedarikçilerin KVKK gereksinimlerini karşılamaması',
      category: 'Tedarikçi Yönetimi',
      severity: 'medium',
      likelihood: 'high',
      impact: 'moderate',
      status: 'assessing',
      owner: 'Procurement',
      identifiedDate: '2024-01-10'
    },
    {
      id: '3',
      title: 'Denetim Bulguları',
      description: 'Son denetimde tespit edilen eksiklikler',
      category: 'Denetim',
      severity: 'low',
      likelihood: 'low',
      impact: 'minor',
      status: 'accepted',
      owner: 'Compliance Officer',
      identifiedDate: '2024-01-01'
    }
  ]);

  const [trainings, setTrainings] = useState<ComplianceTraining[]>([
    {
      id: '1',
      title: 'KVKK Farkındalık Eğitimi',
      description: 'Tüm çalışanlar için zorunlu KVKK eğitimi',
      type: 'mandatory',
      category: 'Veri Koruma',
      duration: 120,
      completionRate: 87,
      totalUsers: 150,
      completedUsers: 131,
      deadline: '2024-02-01',
      status: 'active'
    },
    {
      id: '2',
      title: 'Bilgi Güvenliği Temelleri',
      description: 'Yıllık bilgi güvenliği eğitimi',
      type: 'mandatory',
      category: 'Güvenlik',
      duration: 90,
      completionRate: 92,
      totalUsers: 150,
      completedUsers: 138,
      deadline: '2024-03-01',
      status: 'active'
    },
    {
      id: '3',
      title: 'Sosyal Mühendislik Farkındalığı',
      description: 'Phishing ve sosyal mühendislik saldırılarına karşı eğitim',
      type: 'optional',
      category: 'Güvenlik',
      duration: 45,
      completionRate: 62,
      totalUsers: 150,
      completedUsers: 93,
      status: 'active'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
      case 'completed':
      case 'approved':
      case 'closed':
        return '#52c41a';
      case 'partial':
      case 'in-progress':
      case 'review':
      case 'mitigating':
        return '#faad14';
      case 'non-compliant':
      case 'not-implemented':
      case 'failed':
      case 'expired':
      case 'identified':
        return '#ff4d4f';
      case 'not-applicable':
      case 'planned':
      case 'scheduled':
      case 'draft':
      case 'assessing':
        return '#d9d9d9';
      default:
        return '#1890ff';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
      case 'completed':
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'partial':
      case 'in-progress':
      case 'review':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'non-compliant':
      case 'not-implemented':
      case 'failed':
      case 'expired':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'purple';
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getRiskScore = (severity: string, likelihood: string) => {
    const severityScores: any = { critical: 4, high: 3, medium: 2, low: 1 };
    const likelihoodScores: any = { 'very-high': 5, high: 4, medium: 3, low: 2, 'very-low': 1 };
    return severityScores[severity] * likelihoodScores[likelihood];
  };

  const complianceGaugeConfig = {
    percent: overallCompliance.score / 100,
    range: {
      color: ['#ff4d4f', '#faad14', '#52c41a'],
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      title: {
        formatter: () => 'Uyumluluk Skoru',
        style: {
          fontSize: '14px',
        },
      },
      content: {
        formatter: () => `${overallCompliance.score}%`,
        style: {
          fontSize: '24px',
        },
      },
    },
  };

  const standardsData = standards.map(s => ({
    standard: s.code,
    score: s.score,
    requirements: s.requirements,
  }));

  const radarConfig = {
    data: standardsData.map(s => [
      { name: 'Skor', standard: s.standard, value: s.score },
    ]).flat(),
    xField: 'standard',
    yField: 'value',
    seriesField: 'name',
    meta: {
      value: {
        alias: 'Uyumluluk %',
        min: 0,
        max: 100,
      },
    },
    xAxis: {
      line: null,
      tickLine: null,
    },
    yAxis: {
      label: false,
      grid: {
        alternateColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
    point: {
      size: 3,
    },
    area: {},
  };

  const handleCreateAudit = () => {
    auditForm.validateFields().then(values => {
      const newAudit: ComplianceAudit = {
        id: Date.now().toString(),
        ...values,
        status: 'scheduled',
        findings: 0,
        criticalFindings: 0
      };
      setAudits([...audits, newAudit]);
      message.success('Denetim planlandı');
      setAuditModalVisible(false);
      auditForm.resetFields();
    });
  };

  const handleUploadDocument = () => {
    documentForm.validateFields().then(values => {
      const newDocument: ComplianceDocument = {
        id: Date.now().toString(),
        ...values,
        status: 'draft',
        lastUpdated: dayjs().format('YYYY-MM-DD'),
        size: '0 KB',
        tags: values.tags || []
      };
      setDocuments([...documents, newDocument]);
      message.success('Doküman yüklendi');
      setDocumentModalVisible(false);
      documentForm.resetFields();
    });
  };

  const handleCreateRisk = () => {
    riskForm.validateFields().then(values => {
      const newRisk: ComplianceRisk = {
        id: Date.now().toString(),
        ...values,
        status: 'identified',
        identifiedDate: dayjs().format('YYYY-MM-DD')
      };
      setRisks([...risks, newRisk]);
      message.success('Risk kaydedildi');
      setRiskModalVisible(false);
      riskForm.resetFields();
    });
  };

  const standardColumns = [
    {
      title: 'Standart',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ComplianceStandard) => (
        <Space direction="vertical" size={0}>
          <Space>
            {getStatusIcon(record.status)}
            <Text strong>{text}</Text>
            <Tag>{record.code}</Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Uyumluluk',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          status={score >= 90 ? 'success' : score >= 70 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: 'Gereksinimler',
      key: 'requirements',
      render: (_, record: ComplianceStandard) => (
        <Text>{record.fulfilled} / {record.requirements}</Text>
      )
    },
    {
      title: 'Son Denetim',
      dataIndex: 'lastAudit',
      key: 'lastAudit',
      render: (date?: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-'
    },
    {
      title: 'Sonraki Denetim',
      dataIndex: 'nextAudit',
      key: 'nextAudit',
      render: (date?: string) => date ? (
        <Space>
          <CalendarOutlined />
          <Text type={dayjs(date).isBefore(dayjs().add(30, 'days')) ? 'warning' : undefined}>
            {dayjs(date).format('DD.MM.YYYY')}
          </Text>
        </Space>
      ) : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: ComplianceStandard) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>Detay</Button>
          <Button size="small" icon={<FileSearchOutlined />}>Kontroller</Button>
        </Space>
      )
    }
  ];

  const auditColumns = [
    {
      title: 'Denetim',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ComplianceAudit) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Space>
            <Tag color={record.type === 'internal' ? 'blue' : 
                       record.type === 'external' ? 'green' : 'purple'}>
              {record.type === 'internal' ? 'İç Denetim' :
               record.type === 'external' ? 'Dış Denetim' : 'Sertifikasyon'}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.auditor}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'completed' ? 'success' :
                 status === 'in-progress' ? 'processing' :
                 status === 'scheduled' ? 'default' : 'error'}
          text={status === 'completed' ? 'Tamamlandı' :
               status === 'in-progress' ? 'Devam Ediyor' :
               status === 'scheduled' ? 'Planlandı' : 'Başarısız'}
        />
      )
    },
    {
      title: 'Bulgular',
      key: 'findings',
      render: (_, record: ComplianceAudit) => (
        <Space>
          <Tag color={record.criticalFindings > 0 ? 'red' : 'green'}>
            {record.criticalFindings} Kritik
          </Tag>
          <Tag>{record.findings} Toplam</Tag>
        </Space>
      )
    },
    {
      title: 'Skor',
      dataIndex: 'score',
      key: 'score',
      render: (score?: number) => score ? (
        <Progress
          type="circle"
          percent={score}
          width={50}
          status={score >= 90 ? 'success' : score >= 70 ? 'normal' : 'exception'}
        />
      ) : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: ComplianceAudit) => (
        <Space>
          {record.report && (
            <Button size="small" icon={<DownloadOutlined />}>Rapor</Button>
          )}
          <Button size="small" icon={<EyeOutlined />}>Detay</Button>
        </Space>
      )
    }
  ];

  const riskColumns = [
    {
      title: 'Risk',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ComplianceRisk) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
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
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Risk Skoru',
      key: 'riskScore',
      render: (_, record: ComplianceRisk) => {
        const score = getRiskScore(record.severity, record.likelihood);
        return (
          <Badge
            count={score}
            style={{
              backgroundColor: score > 12 ? '#ff4d4f' :
                             score > 6 ? '#faad14' : '#52c41a'
            }}
          />
        );
      }
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'closed' ? 'success' :
                 status === 'mitigating' ? 'processing' :
                 status === 'assessing' ? 'warning' :
                 status === 'accepted' ? 'default' : 'error'}
          text={status === 'closed' ? 'Kapatıldı' :
               status === 'mitigating' ? 'Azaltılıyor' :
               status === 'assessing' ? 'Değerlendiriliyor' :
               status === 'accepted' ? 'Kabul Edildi' : 'Tespit Edildi'}
        />
      )
    },
    {
      title: 'Sorumlu',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner: string) => <Tag icon={<UserOutlined />}>{owner}</Tag>
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
          <Button size="small" icon={<FileTextOutlined />}>Aksiyon</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <SafetyOutlined /> Uyumluluk ve Regülasyon
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button icon={<FileSearchOutlined />}>Denetim Raporu</Button>
              <Button type="primary" icon={<SafetyCertificateOutlined />}>
                Uyumluluk Taraması
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Overall Compliance Score */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Gauge {...complianceGaugeConfig} height={200} />
            <Divider />
            <Row gutter={16}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Statistic
                  value={overallCompliance.compliant}
                  valueStyle={{ color: '#52c41a', fontSize: 20 }}
                  prefix={<CheckCircleOutlined />}
                />
                <Text type="secondary">Uyumlu</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Statistic
                  value={overallCompliance.partial}
                  valueStyle={{ color: '#faad14', fontSize: 20 }}
                  prefix={<ExclamationCircleOutlined />}
                />
                <Text type="secondary">Kısmi</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <Statistic
                  value={overallCompliance.nonCompliant}
                  valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                  prefix={<CloseCircleOutlined />}
                />
                <Text type="secondary">Uyumsuz</Text>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} title="Standart Dağılımı">
            <Radar {...radarConfig} height={250} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} title="Yaklaşan Denetimler">
            <Timeline>
              {audits
                .filter(a => a.status === 'scheduled')
                .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
                .slice(0, 4)
                .map(audit => (
                  <Timeline.Item
                    key={audit.id}
                    color={dayjs(audit.date).isBefore(dayjs().add(30, 'days')) ? 'orange' : 'blue'}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{audit.title}</Text>
                      <Text type="secondary">{dayjs(audit.date).format('DD MMMM YYYY')}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(audit.date).fromNow()}
                      </Text>
                    </Space>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Standartlar" key="standards">
            <Alert
              message="Uyumluluk Standartları"
              description="Kuruluşunuzun tabi olduğu tüm uyumluluk standartları ve gereksinimleri"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={standardColumns}
              dataSource={standards}
              rowKey="id"
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: 16 }}>
                    <Title level={5}>Kontrol Noktaları</Title>
                    <List
                      dataSource={record.controls}
                      renderItem={control => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={getStatusIcon(control.status)}
                            title={control.name}
                            description={control.description}
                          />
                          <Space direction="vertical" align="end">
                            <Tag color={getSeverityColor(control.priority)}>
                              {control.priority.toUpperCase()} Öncelik
                            </Tag>
                            {control.responsible && (
                              <Text type="secondary">Sorumlu: {control.responsible}</Text>
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                )
              }}
            />
          </TabPane>

          <TabPane tab="Denetimler" key="audits">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAuditModalVisible(true)}>
                Denetim Planla
              </Button>
              <Button icon={<CalendarOutlined />}>Denetim Takvimi</Button>
            </Space>

            <Table
              columns={auditColumns}
              dataSource={audits}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Dokümanlar" key="documents">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setDocumentModalVisible(true)}>
                Doküman Yükle
              </Button>
              <Select placeholder="Kategori" style={{ width: 150 }}>
                <Option value="all">Tümü</Option>
                <Option value="policy">Politikalar</Option>
                <Option value="procedure">Prosedürler</Option>
                <Option value="report">Raporlar</Option>
              </Select>
              <Input.Search placeholder="Doküman ara..." style={{ width: 250 }} />
            </Space>

            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={documents}
              renderItem={doc => (
                <List.Item>
                  <Card
                    size="small"
                    actions={[
                      <Tooltip title="Görüntüle">
                        <EyeOutlined key="view" />
                      </Tooltip>,
                      <Tooltip title="İndir">
                        <DownloadOutlined key="download" />
                      </Tooltip>,
                      <Tooltip title="Düzenle">
                        <EditOutlined key="edit" />
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      avatar={<FileProtectOutlined style={{ fontSize: 24 }} />}
                      title={doc.name}
                      description={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            v{doc.version} • {doc.size}
                          </Text>
                          <Tag color={
                            doc.status === 'approved' ? 'green' :
                            doc.status === 'review' ? 'orange' :
                            doc.status === 'expired' ? 'red' : 'default'
                          }>
                            {doc.status === 'approved' ? 'Onaylı' :
                             doc.status === 'review' ? 'İncelemede' :
                             doc.status === 'expired' ? 'Süresi Dolmuş' : 'Taslak'}
                          </Tag>
                          {doc.expiryDate && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Son geçerlilik: {dayjs(doc.expiryDate).format('DD.MM.YYYY')}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Risk Yönetimi" key="risks">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setRiskModalVisible(true)}>
                Risk Ekle
              </Button>
              <Button icon={<WarningOutlined />}>Risk Matrisi</Button>
            </Space>

            <Table
              columns={riskColumns}
              dataSource={risks}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Eğitimler" key="trainings">
            <Row gutter={16}>
              {trainings.map(training => (
                <Col span={8} key={training.id}>
                  <Card
                    title={training.title}
                    extra={
                      <Tag color={training.type === 'mandatory' ? 'red' : 'blue'}>
                        {training.type === 'mandatory' ? 'Zorunlu' : 'Opsiyonel'}
                      </Tag>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {training.description}
                      </Paragraph>
                      <Progress
                        percent={training.completionRate}
                        status={training.completionRate === 100 ? 'success' : 'active'}
                      />
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Tamamlayan"
                            value={training.completedUsers}
                            suffix={`/ ${training.totalUsers}`}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Süre"
                            value={training.duration}
                            suffix="dk"
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                      </Row>
                      {training.deadline && (
                        <Alert
                          message={`Son tarih: ${dayjs(training.deadline).format('DD.MM.YYYY')}`}
                          type={dayjs(training.deadline).isBefore(dayjs().add(7, 'days')) ? 'warning' : 'info'}
                        />
                      )}
                      <Button type="primary" block icon={<PlayCircleOutlined />}>
                        Eğitime Başla
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Audit Modal */}
      <Modal
        title="Yeni Denetim Planla"
        visible={auditModalVisible}
        onOk={handleCreateAudit}
        onCancel={() => setAuditModalVisible(false)}
        width={600}
      >
        <Form form={auditForm} layout="vertical">
          <Form.Item
            name="title"
            label="Denetim Adı"
            rules={[{ required: true, message: 'Denetim adı gereklidir' }]}
          >
            <Input placeholder="Örn: ISO 27001 Yıllık Denetimi" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Denetim Tipi"
                rules={[{ required: true, message: 'Denetim tipi seçiniz' }]}
              >
                <Select placeholder="Tip seçiniz">
                  <Option value="internal">İç Denetim</Option>
                  <Option value="external">Dış Denetim</Option>
                  <Option value="certification">Sertifikasyon</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Planlanan Tarih"
                rules={[{ required: true, message: 'Tarih seçiniz' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="auditor"
            label="Denetçi/Kurum"
            rules={[{ required: true, message: 'Denetçi gereklidir' }]}
          >
            <Input placeholder="Örn: BSI Group" />
          </Form.Item>
          <Form.Item
            name="scope"
            label="Kapsam"
          >
            <TextArea rows={3} placeholder="Denetim kapsamı ve odak alanları" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Document Modal */}
      <Modal
        title="Doküman Yükle"
        visible={documentModalVisible}
        onOk={handleUploadDocument}
        onCancel={() => setDocumentModalVisible(false)}
        width={600}
      >
        <Form form={documentForm} layout="vertical">
          <Form.Item
            name="name"
            label="Doküman Adı"
            rules={[{ required: true, message: 'Doküman adı gereklidir' }]}
          >
            <Input placeholder="Örn: Gizlilik Politikası" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Doküman Tipi"
                rules={[{ required: true, message: 'Tip seçiniz' }]}
              >
                <Select placeholder="Tip seçiniz">
                  <Option value="policy">Politika</Option>
                  <Option value="procedure">Prosedür</Option>
                  <Option value="report">Rapor</Option>
                  <Option value="certificate">Sertifika</Option>
                  <Option value="other">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori seçiniz' }]}
              >
                <Select placeholder="Kategori seçiniz">
                  <Option value="data-protection">Veri Koruma</Option>
                  <Option value="security">Güvenlik</Option>
                  <Option value="compliance">Uyumluluk</Option>
                  <Option value="audit">Denetim</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="version"
            label="Versiyon"
            rules={[{ required: true, message: 'Versiyon gereklidir' }]}
          >
            <Input placeholder="Örn: 1.0" />
          </Form.Item>
          <Form.Item
            name="owner"
            label="Sorumlu"
            rules={[{ required: true, message: 'Sorumlu gereklidir' }]}
          >
            <Input placeholder="Örn: Legal Team" />
          </Form.Item>
          <Form.Item
            name="file"
            label="Dosya"
          >
            <Dragger>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">Dosyayı buraya sürükleyin veya tıklayın</p>
              <p className="ant-upload-hint">PDF, DOC, DOCX formatları desteklenir</p>
            </Dragger>
          </Form.Item>
          <Form.Item
            name="tags"
            label="Etiketler"
          >
            <Select mode="tags" placeholder="Etiket ekleyin">
              <Option value="KVKK">KVKK</Option>
              <Option value="GDPR">GDPR</Option>
              <Option value="ISO27001">ISO 27001</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Risk Modal */}
      <Modal
        title="Yeni Risk Kaydı"
        visible={riskModalVisible}
        onOk={handleCreateRisk}
        onCancel={() => setRiskModalVisible(false)}
        width={700}
      >
        <Form form={riskForm} layout="vertical">
          <Form.Item
            name="title"
            label="Risk Başlığı"
            rules={[{ required: true, message: 'Risk başlığı gereklidir' }]}
          >
            <Input placeholder="Örn: Veri İhlali Riski" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama gereklidir' }]}
          >
            <TextArea rows={3} placeholder="Risk detayları" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori seçiniz' }]}
              >
                <Select placeholder="Kategori">
                  <Option value="data-security">Veri Güvenliği</Option>
                  <Option value="compliance">Uyumluluk</Option>
                  <Option value="operational">Operasyonel</Option>
                  <Option value="financial">Finansal</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="severity"
                label="Önem Derecesi"
                rules={[{ required: true, message: 'Önem seçiniz' }]}
              >
                <Select placeholder="Önem">
                  <Option value="critical">Kritik</Option>
                  <Option value="high">Yüksek</Option>
                  <Option value="medium">Orta</Option>
                  <Option value="low">Düşük</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="likelihood"
                label="Olasılık"
                rules={[{ required: true, message: 'Olasılık seçiniz' }]}
              >
                <Select placeholder="Olasılık">
                  <Option value="very-high">Çok Yüksek</Option>
                  <Option value="high">Yüksek</Option>
                  <Option value="medium">Orta</Option>
                  <Option value="low">Düşük</Option>
                  <Option value="very-low">Çok Düşük</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="impact"
            label="Etki"
            rules={[{ required: true, message: 'Etki seçiniz' }]}
          >
            <Radio.Group>
              <Radio value="severe">Ciddi</Radio>
              <Radio value="major">Büyük</Radio>
              <Radio value="moderate">Orta</Radio>
              <Radio value="minor">Küçük</Radio>
              <Radio value="negligible">Önemsiz</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="owner"
            label="Sorumlu"
            rules={[{ required: true, message: 'Sorumlu gereklidir' }]}
          >
            <Input placeholder="Örn: CISO" />
          </Form.Item>
          <Form.Item
            name="mitigation"
            label="Azaltma Stratejisi"
          >
            <TextArea rows={3} placeholder="Risk azaltma planı" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantCompliance;