import React, { useState } from 'react';
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
  message,
  Tooltip,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Popconfirm,
  Timeline,
  Descriptions,
  Switch,
  Tabs,
  List,
  Avatar,
  Empty,
  Result,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  GlobalOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyCertificateOutlined,
  CloudOutlined,
  LinkOutlined,
  ApiOutlined,
  SettingOutlined,
  ReloadOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Domain {
  id: string;
  domain: string;
  subdomain: string;
  tenant: string;
  type: 'primary' | 'custom' | 'alias';
  status: 'active' | 'pending' | 'inactive' | 'error';
  ssl: 'active' | 'pending' | 'expired' | 'none';
  sslExpiry?: string;
  dnsStatus: 'verified' | 'pending' | 'error';
  createdAt: string;
  lastChecked: string;
  cdn: boolean;
  ipAddress?: string;
  cname?: string;
}

const DomainsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const mockDomains: Domain[] = [
    {
      id: '1',
      domain: 'abc-corp.stocker.app',
      subdomain: 'abc-corp',
      tenant: 'ABC Corporation',
      type: 'primary',
      status: 'active',
      ssl: 'active',
      sslExpiry: '2025-03-15',
      dnsStatus: 'verified',
      createdAt: '2024-01-15',
      lastChecked: '5 dakika önce',
      cdn: true,
      ipAddress: '104.21.85.212',
    },
    {
      id: '2',
      domain: 'app.abc-corp.com',
      subdomain: '-',
      tenant: 'ABC Corporation',
      type: 'custom',
      status: 'active',
      ssl: 'active',
      sslExpiry: '2025-06-20',
      dnsStatus: 'verified',
      createdAt: '2024-02-10',
      lastChecked: '10 dakika önce',
      cdn: true,
      cname: 'custom.stocker.app',
    },
    {
      id: '3',
      domain: 'tech-startup.stocker.app',
      subdomain: 'tech-startup',
      tenant: 'Tech Startup Ltd.',
      type: 'primary',
      status: 'active',
      ssl: 'pending',
      dnsStatus: 'verified',
      createdAt: '2024-03-20',
      lastChecked: '1 saat önce',
      cdn: false,
      ipAddress: '104.21.85.213',
    },
    {
      id: '4',
      domain: 'demo.example.com',
      subdomain: '-',
      tenant: 'Example Company',
      type: 'custom',
      status: 'pending',
      ssl: 'none',
      dnsStatus: 'pending',
      createdAt: '2024-12-01',
      lastChecked: '2 saat önce',
      cdn: false,
      cname: 'custom.stocker.app',
    },
  ];

  const statusColors = {
    active: 'success',
    pending: 'warning',
    inactive: 'default',
    error: 'error',
  };

  const sslColors = {
    active: 'success',
    pending: 'processing',
    expired: 'error',
    none: 'default',
  };

  const columns: ProColumns<Domain>[] = [
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (_, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#667eea' }} />
          <div>
            <Text strong>{record.domain}</Text>
            {record.type === 'primary' && (
              <Tag color="blue" style={{ marginLeft: 8 }}>Primary</Tag>
            )}
            {record.type === 'custom' && (
              <Tag color="orange" style={{ marginLeft: 8 }}>Custom</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      filters: true,
      onFilter: true,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={statusColors[status as keyof typeof statusColors]}
          text={
            status === 'active' ? 'Aktif' :
            status === 'pending' ? 'Beklemede' :
            status === 'inactive' ? 'İnaktif' : 'Hata'
          }
        />
      ),
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'Beklemede', value: 'pending' },
        { text: 'İnaktif', value: 'inactive' },
        { text: 'Hata', value: 'error' },
      ],
    },
    {
      title: 'SSL',
      dataIndex: 'ssl',
      key: 'ssl',
      render: (ssl: string, record) => (
        <Space>
          {ssl === 'active' ? (
            <Tooltip title={`Geçerlilik: ${record.sslExpiry}`}>
              <Tag icon={<SafetyCertificateOutlined />} color="success">
                Aktif
              </Tag>
            </Tooltip>
          ) : ssl === 'pending' ? (
            <Tag icon={<SyncOutlined spin />} color="processing">
              Beklemede
            </Tag>
          ) : ssl === 'expired' ? (
            <Tag icon={<WarningOutlined />} color="error">
              Süresi Dolmuş
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">
              Yok
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'DNS',
      dataIndex: 'dnsStatus',
      key: 'dnsStatus',
      render: (status: string) => (
        <Space>
          {status === 'verified' ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Doğrulandı
            </Tag>
          ) : status === 'pending' ? (
            <Tag icon={<ClockCircleOutlined />} color="warning">
              Beklemede
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">
              Hata
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'CDN',
      dataIndex: 'cdn',
      key: 'cdn',
      render: (cdn: boolean) => (
        <Switch
          checked={cdn}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
          onChange={(checked) => handleCDNToggle(checked)}
        />
      ),
    },
    {
      title: 'Son Kontrol',
      dataIndex: 'lastChecked',
      key: 'lastChecked',
      render: (text: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">{text}</Text>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="DNS Kontrolü">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => handleDNSCheck(record)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu domaini silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCDNToggle = (checked: boolean) => {
    message.info(`CDN ${checked ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`);
  };

  const handleDNSCheck = async (domain: Domain) => {
    message.loading('DNS kontrolü yapılıyor...');
    setTimeout(() => {
      message.success(`${domain.domain} için DNS kontrolü tamamlandı`);
    }, 2000);
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    form.setFieldsValue(domain);
    setIsModalVisible(true);
  };

  const handleDelete = async (domain: Domain) => {
    await Swal.fire({
      icon: 'success',
      title: 'Domain Silindi',
      text: `${domain.domain} başarıyla silindi.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      setTimeout(async () => {
        if (editingDomain) {
          await Swal.fire({
            icon: 'success',
            title: 'Domain Güncellendi',
            text: 'Domain bilgileri başarıyla güncellendi.',
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Domain Eklendi',
            text: 'Yeni domain başarıyla eklendi.',
            timer: 1500,
            showConfirmButton: false,
          });
        }
        
        setIsModalVisible(false);
        form.resetFields();
        setEditingDomain(null);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const DomainSetupGuide = () => (
    <Card title="Domain Kurulum Rehberi" style={{ marginBottom: 24 }}>
      <Timeline>
        <Timeline.Item dot={<GlobalOutlined />} color="blue">
          <Text strong>1. Domain Ekleyin</Text>
          <br />
          <Text type="secondary">Özel domaininizi sisteme ekleyin</Text>
        </Timeline.Item>
        <Timeline.Item dot={<ApiOutlined />} color="blue">
          <Text strong>2. DNS Kayıtlarını Yapılandırın</Text>
          <br />
          <Text type="secondary">CNAME kaydını custom.stocker.app'e yönlendirin</Text>
        </Timeline.Item>
        <Timeline.Item dot={<SafetyCertificateOutlined />} color="blue">
          <Text strong>3. SSL Sertifikası</Text>
          <br />
          <Text type="secondary">SSL sertifikası otomatik olarak oluşturulacak</Text>
        </Timeline.Item>
        <Timeline.Item dot={<CheckCircleOutlined />} color="green">
          <Text strong>4. Doğrulama</Text>
          <br />
          <Text type="secondary">DNS propagasyonu tamamlandıktan sonra domain aktif olacak</Text>
        </Timeline.Item>
      </Timeline>
    </Card>
  );

  return (
    <PageContainer
      header={{
        title: 'Domain Yönetimi',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Tenants' },
            { title: 'Domains' },
          ],
        },
      }}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Domain"
              value={mockDomains.length}
              prefix={<GlobalOutlined style={{ color: '#667eea' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Domain"
              value={mockDomains.filter(d => d.status === 'active').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SSL Aktif"
              value={mockDomains.filter(d => d.ssl === 'active').length}
              prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen DNS"
              value={mockDomains.filter(d => d.dnsStatus === 'pending').length}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="domains">
        <TabPane tab="Domain Listesi" key="domains">
          <ProTable<Domain>
            columns={columns}
            dataSource={mockDomains}
            rowKey="id"
            search={{
              labelWidth: 120,
            }}
            pagination={{
              pageSize: 10,
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            toolBarRender={() => [
              <Button
                key="refresh"
                icon={<ReloadOutlined />}
                onClick={() => message.info('Liste yenilendi')}
              >
                Yenile
              </Button>,
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingDomain(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Yeni Domain
              </Button>,
            ]}
          />
        </TabPane>

        <TabPane tab="Kurulum Rehberi" key="guide">
          <DomainSetupGuide />
          
          <Card title="DNS Kayıt Örnekleri">
            <Alert
              message="Önemli Not"
              description="DNS değişikliklerinin yayılması 24-48 saat sürebilir."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="A Kaydı (Alternatif)">
                <Text code>104.21.85.212</Text>
              </Descriptions.Item>
              <Descriptions.Item label="CNAME Kaydı (Önerilen)">
                <Text code>custom.stocker.app</Text>
              </Descriptions.Item>
              <Descriptions.Item label="TXT Kaydı (Doğrulama)">
                <Text code>stocker-verification=abc123xyz789</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="SSL Sertifikaları" key="ssl">
          <List
            dataSource={mockDomains.filter(d => d.ssl === 'active')}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<ReloadOutlined />}>Yenile</Button>,
                  <Button type="link" icon={<DownloadOutlined />}>İndir</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                  title={item.domain}
                  description={
                    <Space direction="vertical">
                      <Text>Geçerlilik: {item.sslExpiry || 'Bilgi yok'}</Text>
                      <Text type="secondary">Let's Encrypt tarafından sağlanmıştır</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal
        title={editingDomain ? 'Domain Düzenle' : 'Yeni Domain Ekle'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingDomain(null);
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="domain"
            label="Domain Adresi"
            rules={[
              { required: true, message: 'Domain adresi zorunludur' },
              { 
                pattern: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
                message: 'Geçerli bir domain adresi giriniz'
              }
            ]}
          >
            <Input
              prefix={<GlobalOutlined />}
              placeholder="app.example.com"
            />
          </Form.Item>

          <Form.Item
            name="tenant"
            label="Tenant"
            rules={[{ required: true, message: 'Tenant seçimi zorunludur' }]}
          >
            <Select placeholder="Tenant seçin">
              <Option value="ABC Corporation">ABC Corporation</Option>
              <Option value="Tech Startup Ltd.">Tech Startup Ltd.</Option>
              <Option value="Example Company">Example Company</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Domain Tipi"
            rules={[{ required: true, message: 'Domain tipi zorunludur' }]}
          >
            <Select>
              <Option value="custom">Özel Domain</Option>
              <Option value="alias">Alias</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cdn"
            label="CDN"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>

          <Alert
            message="Domain eklendikten sonra DNS ayarlarını yapmanız gerekecek."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DomainsPage;