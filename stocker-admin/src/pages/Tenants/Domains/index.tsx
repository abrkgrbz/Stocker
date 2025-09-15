import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Divider,
  Tooltip,
  Badge,
  Steps,
  List,
  Timeline,
  Progress,
  Empty,
  Dropdown,
  Descriptions
} from 'antd';
import {
  GlobalOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyCertificateOutlined,
  CloudOutlined,
  LinkOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  CopyOutlined,
  CheckOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface Domain {
  id: string;
  domain: string;
  subdomain?: string;
  type: 'primary' | 'secondary' | 'alias' | 'redirect';
  status: 'active' | 'pending' | 'failed' | 'suspended';
  sslStatus: 'active' | 'pending' | 'expired' | 'none';
  sslExpiry?: string;
  provider: string;
  dnsStatus: 'verified' | 'pending' | 'failed';
  createdAt: string;
  lastVerified?: string;
  isDefault: boolean;
  redirectTo?: string;
  cdnEnabled: boolean;
  wafEnabled: boolean;
  records: DNSRecord[];
}

interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: 'active' | 'pending' | 'failed';
  verified: boolean;
}

interface SSLCertificate {
  id: string;
  domain: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  fingerprint: string;
  type: 'DV' | 'OV' | 'EV' | 'Wildcard';
  autoRenew: boolean;
}

const TenantDomains: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [sslCertificates, setSslCertificates] = useState<SSLCertificate[]>([]);
  
  // Modals
  const [domainModalVisible, setDomainModalVisible] = useState(false);
  const [dnsModalVisible, setDnsModalVisible] = useState(false);
  const [sslModalVisible, setSslModalVisible] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [dnsForm] = Form.useForm();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchDomains();
    fetchSSLCertificates();
  }, [id]);

  const fetchDomains = async () => {
    setLoading(true);
    // Simulated data
    setTimeout(() => {
      setDomains([
        {
          id: '1',
          domain: 'example.com',
          type: 'primary',
          status: 'active',
          sslStatus: 'active',
          sslExpiry: '2024-12-31T23:59:59',
          provider: 'Cloudflare',
          dnsStatus: 'verified',
          createdAt: '2023-01-15T10:00:00',
          lastVerified: '2024-01-15T10:00:00',
          isDefault: true,
          cdnEnabled: true,
          wafEnabled: true,
          records: [
            {
              id: '1',
              type: 'A',
              name: '@',
              value: '192.168.1.1',
              ttl: 3600,
              status: 'active',
              verified: true
            },
            {
              id: '2',
              type: 'CNAME',
              name: 'www',
              value: 'example.com',
              ttl: 3600,
              status: 'active',
              verified: true
            }
          ]
        },
        {
          id: '2',
          domain: 'app.example.com',
          subdomain: 'app',
          type: 'secondary',
          status: 'active',
          sslStatus: 'active',
          sslExpiry: '2024-11-30T23:59:59',
          provider: 'Route53',
          dnsStatus: 'verified',
          createdAt: '2023-02-20T11:00:00',
          lastVerified: '2024-01-14T15:30:00',
          isDefault: false,
          cdnEnabled: true,
          wafEnabled: false,
          records: []
        },
        {
          id: '3',
          domain: 'example.net',
          type: 'alias',
          status: 'pending',
          sslStatus: 'pending',
          provider: 'Namecheap',
          dnsStatus: 'pending',
          createdAt: '2024-01-10T14:00:00',
          isDefault: false,
          redirectTo: 'example.com',
          cdnEnabled: false,
          wafEnabled: false,
          records: []
        },
        {
          id: '4',
          domain: 'old-domain.com',
          type: 'redirect',
          status: 'active',
          sslStatus: 'expired',
          sslExpiry: '2023-12-31T23:59:59',
          provider: 'GoDaddy',
          dnsStatus: 'verified',
          createdAt: '2022-06-15T09:00:00',
          lastVerified: '2024-01-01T00:00:00',
          isDefault: false,
          redirectTo: 'example.com',
          cdnEnabled: false,
          wafEnabled: false,
          records: []
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const fetchSSLCertificates = async () => {
    // Simulated data
    setSslCertificates([
      {
        id: '1',
        domain: 'example.com',
        issuer: 'Let\'s Encrypt',
        issuedAt: '2024-01-01T00:00:00',
        expiresAt: '2024-12-31T23:59:59',
        fingerprint: 'SHA256:1234567890ABCDEF',
        type: 'DV',
        autoRenew: true
      },
      {
        id: '2',
        domain: '*.example.com',
        issuer: 'DigiCert',
        issuedAt: '2023-11-01T00:00:00',
        expiresAt: '2024-11-30T23:59:59',
        fingerprint: 'SHA256:FEDCBA0987654321',
        type: 'Wildcard',
        autoRenew: true
      }
    ]);
  };

  const handleCreateDomain = () => {
    form.resetFields();
    setSelectedDomain(null);
    setDomainModalVisible(true);
  };

  const handleEditDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    form.setFieldsValue(domain);
    setDomainModalVisible(true);
  };

  const handleSaveDomain = async (values: any) => {
    setLoading(true);
    try {
      // API call would go here
      message.success(selectedDomain ? 'Domain güncellendi' : 'Domain eklendi');
      setDomainModalVisible(false);
      fetchDomains();
    } catch (error) {
      message.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = (domainId: string) => {
    Modal.confirm({
      title: 'Domain Sil',
      content: 'Bu domaini silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('Domain silindi');
          fetchDomains();
        } catch (error) {
          message.error('Silme işlemi başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleVerifyDomain = async (domainId: string) => {
    setLoading(true);
    try {
      // API call would go here
      message.success('Domain doğrulama başlatıldı');
      fetchDomains();
    } catch (error) {
      message.error('Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSSL = async (domainId: string) => {
    Modal.confirm({
      title: 'SSL Sertifikası Yenile',
      content: 'SSL sertifikasını yenilemek istediğinizden emin misiniz?',
      okText: 'Yenile',
      cancelText: 'İptal',
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('SSL sertifikası yenileme başlatıldı');
        } catch (error) {
          message.error('Yenileme başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      active: { color: 'success', text: 'Aktif', icon: <CheckCircleOutlined /> },
      pending: { color: 'warning', text: 'Beklemede', icon: <ClockCircleOutlined /> },
      failed: { color: 'error', text: 'Başarısız', icon: <CloseCircleOutlined /> },
      suspended: { color: 'default', text: 'Askıda', icon: <ExclamationCircleOutlined /> }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getSSLStatusTag = (status: string, expiry?: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      active: { color: 'success', text: 'Aktif', icon: <SafetyCertificateOutlined /> },
      pending: { color: 'warning', text: 'Beklemede', icon: <LoadingOutlined /> },
      expired: { color: 'error', text: 'Süresi Dolmuş', icon: <WarningOutlined /> },
      none: { color: 'default', text: 'SSL Yok', icon: <CloseCircleOutlined /> }
    };

    const config = statusConfig[status];
    const daysUntilExpiry = expiry ? dayjs(expiry).diff(dayjs(), 'days') : 0;

    return (
      <Space>
        <Tag color={config.color} icon={config.icon}>
          {config.text}
        </Tag>
        {status === 'active' && daysUntilExpiry < 30 && (
          <Tag color="orange">{daysUntilExpiry} gün kaldı</Tag>
        )}
      </Space>
    );
  };

  const getDomainTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      primary: { color: 'blue', text: 'Birincil' },
      secondary: { color: 'green', text: 'İkincil' },
      alias: { color: 'orange', text: 'Takma Ad' },
      redirect: { color: 'purple', text: 'Yönlendirme' }
    };

    const config = typeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<Domain> = [
    {
      title: 'Domain',
      key: 'domain',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <GlobalOutlined style={{ color: '#667eea' }} />
            <Text strong>{record.domain}</Text>
            {record.isDefault && <Tag color="gold">Varsayılan</Tag>}
          </Space>
          {record.redirectTo && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              → {record.redirectTo}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getDomainTypeTag(type)
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'SSL',
      key: 'ssl',
      width: 180,
      render: (_, record) => getSSLStatusTag(record.sslStatus, record.sslExpiry)
    },
    {
      title: 'DNS',
      dataIndex: 'dnsStatus',
      key: 'dnsStatus',
      width: 120,
      render: (status) => (
        <Tag 
          color={status === 'verified' ? 'success' : status === 'pending' ? 'warning' : 'error'}
          icon={status === 'verified' ? <CheckCircleOutlined /> : status === 'pending' ? <SyncOutlined spin /> : <CloseCircleOutlined />}
        >
          {status === 'verified' ? 'Doğrulandı' : status === 'pending' ? 'Beklemede' : 'Başarısız'}
        </Tag>
      )
    },
    {
      title: 'Sağlayıcı',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider) => (
        <Tag icon={<CloudOutlined />}>{provider}</Tag>
      )
    },
    {
      title: 'Özellikler',
      key: 'features',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="CDN">
            <Tag color={record.cdnEnabled ? 'success' : 'default'}>
              CDN
            </Tag>
          </Tooltip>
          <Tooltip title="Web Application Firewall">
            <Tag color={record.wafEnabled ? 'success' : 'default'}>
              WAF
            </Tag>
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Son Doğrulama',
      dataIndex: 'lastVerified',
      key: 'lastVerified',
      width: 150,
      render: (date) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEditDomain(record)
              },
              {
                key: 'dns',
                label: 'DNS Kayıtları',
                icon: <ApiOutlined />,
                onClick: () => {
                  setSelectedDomain(record);
                  setDnsRecords(record.records);
                  setDnsModalVisible(true);
                }
              },
              {
                key: 'verify',
                label: 'Doğrula',
                icon: <CheckCircleOutlined />,
                onClick: () => handleVerifyDomain(record.id),
                disabled: record.dnsStatus === 'verified'
              },
              {
                key: 'ssl',
                label: 'SSL Yenile',
                icon: <SafetyCertificateOutlined />,
                onClick: () => handleRenewSSL(record.id),
                disabled: record.sslStatus !== 'expired'
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDeleteDomain(record.id),
                disabled: record.isDefault
              }
            ]
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const dnsColumns: ColumnsType<DNSRecord> = [
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true
    },
    {
      title: 'TTL',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 80,
      render: (ttl) => `${ttl}s`
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => priority || '-'
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.verified ? 'success' : 'warning'}>
          {record.verified ? 'Doğrulandı' : 'Beklemede'}
        </Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      )
    }
  ];

  const filteredDomains = domains.filter(domain => {
    const matchesStatus = statusFilter === 'all' || domain.status === statusFilter;
    const matchesType = typeFilter === 'all' || domain.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: domains.length,
    active: domains.filter(d => d.status === 'active').length,
    pending: domains.filter(d => d.status === 'pending').length,
    sslActive: domains.filter(d => d.sslStatus === 'active').length,
    sslExpiring: domains.filter(d => {
      if (d.sslExpiry) {
        const daysUntilExpiry = dayjs(d.sslExpiry).diff(dayjs(), 'days');
        return daysUntilExpiry < 30 && daysUntilExpiry > 0;
      }
      return false;
    }).length
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <GlobalOutlined /> Domain Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchDomains}>
                Yenile
              </Button>
              <Button icon={<SafetyCertificateOutlined />} onClick={() => setSslModalVisible(true)}>
                SSL Sertifikaları
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateDomain}>
                Yeni Domain
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Statistics */}
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="Toplam Domain"
              value={stats.total}
              prefix={<GlobalOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Aktif"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Beklemede"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="SSL Aktif"
              value={stats.sslActive}
              valueStyle={{ color: '#52c41a' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="SSL Yenilenecek"
              value={stats.sslExpiring}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Col>
          <Col span={4}>
            <Progress 
              type="circle" 
              percent={Math.round((stats.active / stats.total) * 100)} 
              width={60}
              format={(percent) => `${percent}%`}
            />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Text type="secondary">Aktif Oran</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* SSL Expiry Warnings */}
      {stats.sslExpiring > 0 && (
        <Alert
          message="SSL Sertifikası Uyarısı"
          description={`${stats.sslExpiring} domain'in SSL sertifikası 30 gün içinde sona erecek.`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={() => setSslModalVisible(true)}>
              Sertifikaları Görüntüle
            </Button>
          }
        />
      )}

      <Card bordered={false}>
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="Durum"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tüm Durumlar</Option>
              <Option value="active">Aktif</Option>
              <Option value="pending">Beklemede</Option>
              <Option value="failed">Başarısız</Option>
              <Option value="suspended">Askıda</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Tür"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="all">Tüm Türler</Option>
              <Option value="primary">Birincil</Option>
              <Option value="secondary">İkincil</Option>
              <Option value="alias">Takma Ad</Option>
              <Option value="redirect">Yönlendirme</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredDomains}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: filteredDomains.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} domain`
          }}
        />
      </Card>

      {/* Domain Modal */}
      <Modal
        title={selectedDomain ? 'Domain Düzenle' : 'Yeni Domain'}
        open={domainModalVisible}
        onCancel={() => setDomainModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveDomain}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="domain"
                label="Domain Adı"
                rules={[
                  { required: true, message: 'Domain adı gerekli' },
                  { 
                    pattern: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
                    message: 'Geçerli bir domain adı giriniz'
                  }
                ]}
              >
                <Input prefix={<GlobalOutlined />} placeholder="example.com" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Tür"
                rules={[{ required: true, message: 'Tür seçimi gerekli' }]}
                initialValue="secondary"
              >
                <Select>
                  <Option value="primary">Birincil</Option>
                  <Option value="secondary">İkincil</Option>
                  <Option value="alias">Takma Ad</Option>
                  <Option value="redirect">Yönlendirme</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              (getFieldValue('type') === 'redirect' || getFieldValue('type') === 'alias') && (
                <Form.Item
                  name="redirectTo"
                  label="Yönlendirilecek Domain"
                  rules={[{ required: true, message: 'Hedef domain gerekli' }]}
                >
                  <Input prefix={<LinkOutlined />} placeholder="target.com" />
                </Form.Item>
              )
            }
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="provider"
                label="DNS Sağlayıcı"
                rules={[{ required: true, message: 'Sağlayıcı seçimi gerekli' }]}
              >
                <Select>
                  <Option value="Cloudflare">Cloudflare</Option>
                  <Option value="Route53">AWS Route53</Option>
                  <Option value="Namecheap">Namecheap</Option>
                  <Option value="GoDaddy">GoDaddy</Option>
                  <Option value="Other">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isDefault"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Varsayılan" unCheckedChildren="Normal" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cdnEnabled"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="CDN Aktif" unCheckedChildren="CDN Pasif" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="wafEnabled"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="WAF Aktif" unCheckedChildren="WAF Pasif" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* DNS Records Modal */}
      <Modal
        title={`DNS Kayıtları - ${selectedDomain?.domain}`}
        open={dnsModalVisible}
        onCancel={() => setDnsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDnsModalVisible(false)}>
            Kapat
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Yeni Kayıt
          </Button>
        ]}
      >
        <Alert
          message="DNS Yapılandırması"
          description="Aşağıdaki DNS kayıtlarını domain sağlayıcınızda yapılandırmanız gerekmektedir."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Table
          columns={dnsColumns}
          dataSource={dnsRecords}
          rowKey="id"
          size="small"
          pagination={false}
        />

        <Divider />

        <Title level={5}>Doğrulama Adımları</Title>
        <Steps
          current={1}
          items={[
            {
              title: 'DNS Kayıtları',
              description: 'Kayıtları ekleyin',
              status: 'finish'
            },
            {
              title: 'Propagasyon',
              description: 'DNS yayılımı bekleniyor',
              status: 'process'
            },
            {
              title: 'Doğrulama',
              description: 'Domain doğrulanacak',
              status: 'wait'
            }
          ]}
        />
      </Modal>

      {/* SSL Certificates Modal */}
      <Modal
        title="SSL Sertifikaları"
        open={sslModalVisible}
        onCancel={() => setSslModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setSslModalVisible(false)}>
            Kapat
          </Button>,
          <Button key="renew" type="primary" icon={<ReloadOutlined />}>
            Toplu Yenile
          </Button>
        ]}
      >
        <List
          dataSource={sslCertificates}
          renderItem={cert => (
            <List.Item
              actions={[
                <Button size="small" icon={<ReloadOutlined />}>Yenile</Button>,
                <Button size="small" icon={<DownloadOutlined />}>İndir</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<SafetyCertificateOutlined style={{ fontSize: 32, color: '#52c41a' }} />}
                title={
                  <Space>
                    <Text strong>{cert.domain}</Text>
                    <Tag color="blue">{cert.type}</Tag>
                    {cert.autoRenew && <Tag color="green">Otomatik Yenileme</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Sağlayıcı: {cert.issuer}</Text>
                    <Text type="secondary">
                      Geçerlilik: {dayjs(cert.issuedAt).format('DD.MM.YYYY')} - {dayjs(cert.expiresAt).format('DD.MM.YYYY')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Parmak İzi: {cert.fingerprint}
                    </Text>
                  </Space>
                }
              />
              <div>
                <Progress
                  percent={Math.round(
                    ((dayjs().diff(dayjs(cert.issuedAt), 'days')) / 
                    (dayjs(cert.expiresAt).diff(dayjs(cert.issuedAt), 'days'))) * 100
                  )}
                  status={
                    dayjs(cert.expiresAt).diff(dayjs(), 'days') < 30 ? 'exception' :
                    dayjs(cert.expiresAt).diff(dayjs(), 'days') < 60 ? 'normal' : 'success'
                  }
                  format={(percent) => {
                    const daysLeft = dayjs(cert.expiresAt).diff(dayjs(), 'days');
                    return `${daysLeft} gün`;
                  }}
                />
              </div>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default TenantDomains;