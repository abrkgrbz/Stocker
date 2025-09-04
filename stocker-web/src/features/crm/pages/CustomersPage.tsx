import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Dropdown, 
  Input, 
  Select, 
  Row, 
  Col,
  message,
  Tooltip,
  Badge,
  Avatar,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Divider,
  Statistic,
  Tabs,
  List,
  Typography,
  Timeline,
  Rate,
  Progress,
  Drawer,
  Descriptions,
  Empty
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  UploadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  BankOutlined,
  EnvironmentOutlined,
  StarOutlined,
  ContactsOutlined,
  MergeOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { customerService, Customer, CreateCustomerDto, CustomerListParams, Contact, CreateContactDto } from '@/services/crm/customerService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Option } = Select;
const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const CustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [filters, setFilters] = useState<CustomerListParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdDate',
    sortDirection: 'desc'
  });
  
  const [form] = Form.useForm();
  const [contactForm] = Form.useForm();

  // Fetch customers
  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerService.getCustomers(filters)
  });

  // Fetch customer details
  const { data: customerDetail } = useQuery({
    queryKey: ['customer', selectedCustomer?.id],
    queryFn: () => customerService.getCustomerById(selectedCustomer!.id),
    enabled: !!selectedCustomer?.id && isDetailDrawerOpen
  });

  // Fetch customer contacts
  const { data: customerContacts } = useQuery({
    queryKey: ['customerContacts', selectedCustomer?.id],
    queryFn: () => customerService.getCustomerContacts(selectedCustomer!.id),
    enabled: !!selectedCustomer?.id && isDetailDrawerOpen && activeDetailTab === 'contacts'
  });

  // Fetch customer opportunities
  const { data: customerOpportunities } = useQuery({
    queryKey: ['customerOpportunities', selectedCustomer?.id],
    queryFn: () => customerService.getCustomerOpportunities(selectedCustomer!.id),
    enabled: !!selectedCustomer?.id && isDetailDrawerOpen && activeDetailTab === 'opportunities'
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (data: CreateCustomerDto) => customerService.createCustomer(data),
    onSuccess: () => {
      message.success('Müşteri başarıyla oluşturuldu');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      message.error('Müşteri oluşturulurken hata oluştu');
    }
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: (data: CreateContactDto) => customerService.addContact(selectedCustomer!.id, data),
    onSuccess: () => {
      message.success('İletişim kişisi başarıyla eklendi');
      setIsContactModalOpen(false);
      contactForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['customerContacts', selectedCustomer?.id] });
    },
    onError: () => {
      message.error('İletişim kişisi eklenirken hata oluştu');
    }
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: () => {
      message.success('Müşteri başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      message.error('Müşteri silinirken hata oluştu');
    }
  });

  const getSegmentColor = (segment: string) => {
    const segmentColors: Record<string, string> = {
      'Enterprise': 'gold',
      'Premium': 'purple',
      'Standard': 'blue',
      'Basic': 'cyan',
      'Strategic': 'green',
      'Key Account': 'red'
    };
    return segmentColors[segment] || 'default';
  };

  const columns = [
    {
      title: 'Müşteri',
      key: 'customer',
      fixed: 'left',
      width: 300,
      render: (record: Customer) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar 
              icon={<BankOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
              size="large"
            >
              {record.companyName?.[0]}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{record.companyName}</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {record.industry || 'Belirtilmemiş'}
              </div>
              {record.taxNumber && (
                <div style={{ fontSize: 11, color: '#bbb' }}>
                  VKN: {record.taxNumber}
                </div>
              )}
            </div>
          </Space>
        </Space>
      )
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 220,
      render: (record: Customer) => (
        <Space direction="vertical" size={0}>
          <Space>
            <MailOutlined style={{ color: '#999' }} />
            <span style={{ fontSize: 12 }}>{record.email}</span>
          </Space>
          {record.phone && (
            <Space>
              <PhoneOutlined style={{ color: '#999' }} />
              <span style={{ fontSize: 12 }}>{record.phone}</span>
            </Space>
          )}
          {record.website && (
            <Space>
              <GlobalOutlined style={{ color: '#999' }} />
              <span style={{ fontSize: 12 }}>{record.website}</span>
            </Space>
          )}
        </Space>
      )
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      width: 120,
      render: (segment: string) => segment ? (
        <Tag color={getSegmentColor(segment)}>{segment}</Tag>
      ) : null
    },
    {
      title: 'Tip',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 100,
      render: (type: string) => type ? <Tag>{type}</Tag> : null
    },
    {
      title: 'Çalışan',
      dataIndex: 'numberOfEmployees',
      key: 'numberOfEmployees',
      width: 100,
      render: (num: number) => num ? (
        <Space>
          <TeamOutlined style={{ color: '#999' }} />
          <span>{num.toLocaleString('tr-TR')}</span>
        </Space>
      ) : null
    },
    {
      title: 'Gelir',
      dataIndex: 'annualRevenue',
      key: 'annualRevenue',
      width: 140,
      render: (revenue: number) => revenue ? (
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span>₺{(revenue / 1000000).toFixed(1)}M</span>
        </Space>
      ) : null
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: number) => rating ? (
        <Rate disabled value={rating} style={{ fontSize: 14 }} />
      ) : null
    },
    {
      title: 'Konum',
      key: 'location',
      width: 150,
      render: (record: Customer) => record.city ? (
        <Space>
          <EnvironmentOutlined style={{ color: '#999' }} />
          <span style={{ fontSize: 12 }}>
            {record.city}{record.country ? `, ${record.country}` : ''}
          </span>
        </Space>
      ) : null
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? 'success' : 'default'} 
          text={isActive ? 'Aktif' : 'Pasif'}
        />
      )
    },
    {
      title: 'Kayıt',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (record: Customer) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Detaylar',
                onClick: () => {
                  setSelectedCustomer(record);
                  setIsDetailDrawerOpen(true);
                }
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle'
              },
              {
                type: 'divider'
              },
              {
                key: 'contacts',
                icon: <ContactsOutlined />,
                label: 'İletişim Kişileri',
                onClick: () => {
                  setSelectedCustomer(record);
                  setIsDetailDrawerOpen(true);
                  setActiveDetailTab('contacts');
                }
              },
              {
                key: 'opportunities',
                icon: <ShoppingCartOutlined />,
                label: 'Fırsatlar'
              },
              {
                key: 'activities',
                icon: <CalendarOutlined />,
                label: 'Aktiviteler'
              },
              {
                type: 'divider'
              },
              {
                key: 'merge',
                icon: <MergeOutlined />,
                label: 'Birleştir'
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Müşteri Sil',
                    content: 'Bu müşteriyi silmek istediğinize emin misiniz?',
                    okText: 'Sil',
                    okType: 'danger',
                    cancelText: 'İptal',
                    onOk: () => deleteCustomerMutation.mutate(record.id)
                  });
                }
              }
            ]
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setFilters({
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field || 'createdDate',
      sortDirection: sorter.order === 'ascend' ? 'asc' : 'desc'
    });
  };

  return (
    <div>
      <PageHeader
        title="Müşteriler"
        subtitle="Müşteri bilgilerini yönetin ve takip edin"
        extra={[
          <Button key="import" icon={<UploadOutlined />}>
            İçe Aktar
          </Button>,
          <Button key="export" icon={<DownloadOutlined />}>
            Dışa Aktar
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Yeni Müşteri
          </Button>
        ]}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={customersData?.totalCount || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Müşteri"
              value={customersData?.items.filter(c => c.isActive).length || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Gelir"
              value={
                customersData?.items.reduce((sum, c) => sum + (c.annualRevenue || 0), 0) || 0
              }
              prefix={<DollarOutlined />}
              formatter={(value) => `₺${(Number(value) / 1000000).toFixed(1)}M`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ortalama Rating"
              value={
                customersData?.items.length 
                  ? (customersData.items.reduce((sum, c) => sum + (c.rating || 0), 0) / 
                     customersData.items.filter(c => c.rating).length).toFixed(1)
                  : 0
              }
              prefix={<StarOutlined />}
              suffix="/ 5"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="Müşteri ara..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Segment"
              allowClear
              onChange={(value) => setFilters({ ...filters, segment: value })}
            >
              <Option value="Enterprise">Enterprise</Option>
              <Option value="Premium">Premium</Option>
              <Option value="Standard">Standard</Option>
              <Option value="Basic">Basic</Option>
              <Option value="Strategic">Strategic</Option>
              <Option value="Key Account">Key Account</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Sektör"
              allowClear
              onChange={(value) => setFilters({ ...filters, industry: value })}
            >
              <Option value="Technology">Teknoloji</Option>
              <Option value="Finance">Finans</Option>
              <Option value="Healthcare">Sağlık</Option>
              <Option value="Manufacturing">Üretim</Option>
              <Option value="Retail">Perakende</Option>
              <Option value="Education">Eğitim</Option>
              <Option value="Real Estate">Gayrimenkul</Option>
              <Option value="Automotive">Otomotiv</Option>
              <Option value="Other">Diğer</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Tip"
              allowClear
              onChange={(value) => setFilters({ ...filters, customerType: value })}
            >
              <Option value="Corporate">Kurumsal</Option>
              <Option value="SMB">KOBİ</Option>
              <Option value="Startup">Startup</Option>
              <Option value="Individual">Bireysel</Option>
              <Option value="Government">Kamu</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button icon={<SyncOutlined />} onClick={() => refetch()}>
              Yenile
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          columns={columns}
          dataSource={customersData?.items || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: customersData?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} müşteri`
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* Create Customer Modal */}
      <Modal
        title="Yeni Müşteri Oluştur"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createCustomerMutation.mutate(values)}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="companyName"
                label="Şirket Adı"
                rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
              >
                <Input placeholder="Şirket adı" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email zorunludur' },
                  { type: 'email', message: 'Geçerli bir email giriniz' }
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon">
                <Input placeholder="Telefon" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="website" label="Website">
                <Input placeholder="Website" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="industry" label="Sektör">
                <Select placeholder="Sektör seçiniz">
                  <Option value="Technology">Teknoloji</Option>
                  <Option value="Finance">Finans</Option>
                  <Option value="Healthcare">Sağlık</Option>
                  <Option value="Manufacturing">Üretim</Option>
                  <Option value="Retail">Perakende</Option>
                  <Option value="Education">Eğitim</Option>
                  <Option value="Real Estate">Gayrimenkul</Option>
                  <Option value="Automotive">Otomotiv</Option>
                  <Option value="Other">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="taxNumber" label="Vergi No">
                <Input placeholder="Vergi numarası" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxOffice" label="Vergi Dairesi">
                <Input placeholder="Vergi dairesi" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address" label="Adres">
                <Input.TextArea rows={2} placeholder="Adres" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="Şehir">
                <Input placeholder="Şehir" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="İlçe/Eyalet">
                <Input placeholder="İlçe/Eyalet" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="postalCode" label="Posta Kodu">
                <Input placeholder="Posta kodu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="country" label="Ülke">
                <Input placeholder="Ülke" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="customerType" label="Müşteri Tipi">
                <Select placeholder="Tip seçiniz">
                  <Option value="Corporate">Kurumsal</Option>
                  <Option value="SMB">KOBİ</Option>
                  <Option value="Startup">Startup</Option>
                  <Option value="Individual">Bireysel</Option>
                  <Option value="Government">Kamu</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="segment" label="Segment">
                <Select placeholder="Segment seçiniz">
                  <Option value="Enterprise">Enterprise</Option>
                  <Option value="Premium">Premium</Option>
                  <Option value="Standard">Standard</Option>
                  <Option value="Basic">Basic</Option>
                  <Option value="Strategic">Strategic</Option>
                  <Option value="Key Account">Key Account</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="numberOfEmployees" label="Çalışan Sayısı">
                <InputNumber style={{ width: '100%' }} placeholder="Çalışan sayısı" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="annualRevenue" label="Yıllık Gelir">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\₺\s?|(,*)/g, '')}
                  placeholder="Yıllık gelir"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="creditLimit" label="Kredi Limiti">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\₺\s?|(,*)/g, '')}
                  placeholder="Kredi limiti"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paymentTerms" label="Ödeme Vadesi (Gün)">
                <InputNumber style={{ width: '100%' }} placeholder="30" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Müşteri hakkında notlar" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={createCustomerMutation.isPending}>
                Oluştur
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Customer Detail Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar 
              icon={<BankOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
              size="large"
            >
              {customerDetail?.companyName?.[0]}
            </Avatar>
            <div>
              <Title level={5} style={{ marginBottom: 0 }}>{customerDetail?.companyName}</Title>
              <Text type="secondary">{customerDetail?.industry}</Text>
            </div>
          </Space>
        }
        placement="right"
        width={800}
        open={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedCustomer(null);
          setActiveDetailTab('overview');
        }}
      >
        <Tabs activeKey={activeDetailTab} onChange={setActiveDetailTab}>
          <TabPane tab="Genel Bakış" key="overview">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Email">{customerDetail?.email}</Descriptions.Item>
              <Descriptions.Item label="Telefon">{customerDetail?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Website">{customerDetail?.website || '-'}</Descriptions.Item>
              <Descriptions.Item label="Sektör">{customerDetail?.industry || '-'}</Descriptions.Item>
              <Descriptions.Item label="Segment">
                {customerDetail?.segment ? (
                  <Tag color={getSegmentColor(customerDetail.segment)}>{customerDetail.segment}</Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tip">{customerDetail?.customerType || '-'}</Descriptions.Item>
              <Descriptions.Item label="Çalışan Sayısı">
                {customerDetail?.numberOfEmployees?.toLocaleString('tr-TR') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Yıllık Gelir">
                {customerDetail?.annualRevenue ? `₺${(customerDetail.annualRevenue / 1000000).toFixed(1)}M` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                {customerDetail?.rating ? (
                  <Rate disabled value={customerDetail.rating} />
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge 
                  status={customerDetail?.isActive ? 'success' : 'default'} 
                  text={customerDetail?.isActive ? 'Aktif' : 'Pasif'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Vergi No">{customerDetail?.taxNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Vergi Dairesi">{customerDetail?.taxOffice || '-'}</Descriptions.Item>
              <Descriptions.Item label="Adres" span={2}>
                {customerDetail?.address || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Şehir">{customerDetail?.city || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ülke">{customerDetail?.country || '-'}</Descriptions.Item>
              <Descriptions.Item label="Kredi Limiti">
                {customerDetail?.creditLimit ? `₺${customerDetail.creditLimit.toLocaleString('tr-TR')}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Vadesi">
                {customerDetail?.paymentTerms ? `${customerDetail.paymentTerms} gün` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={2}>
                {customerDetail?.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab={`İletişim Kişileri (${customerContacts?.length || 0})`} key="contacts">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ marginBottom: 16 }}
              onClick={() => setIsContactModalOpen(true)}
            >
              Yeni Kişi Ekle
            </Button>
            
            {customerContacts?.length ? (
              <List
                dataSource={customerContacts}
                renderItem={(contact: Contact) => (
                  <Card style={{ marginBottom: 12 }}>
                    <Row>
                      <Col span={6}>
                        <Space>
                          <Avatar icon={<UserOutlined />}>
                            {contact.firstName?.[0]}{contact.lastName?.[0]}
                          </Avatar>
                          <div>
                            <Text strong>{contact.fullName}</Text>
                            {contact.isPrimary && <Tag color="gold" style={{ marginLeft: 8 }}>Birincil</Tag>}
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {contact.jobTitle || 'Pozisyon belirtilmemiş'}
                            </Text>
                          </div>
                        </Space>
                      </Col>
                      <Col span={6}>
                        <Space direction="vertical" size={0}>
                          <Space>
                            <MailOutlined />
                            <Text>{contact.email}</Text>
                          </Space>
                          {contact.phone && (
                            <Space>
                              <PhoneOutlined />
                              <Text>{contact.phone}</Text>
                            </Space>
                          )}
                        </Space>
                      </Col>
                      <Col span={6}>
                        <Text type="secondary">{contact.department || 'Departman belirtilmemiş'}</Text>
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Button.Group>
                          <Button icon={<EditOutlined />} size="small">Düzenle</Button>
                          <Button icon={<DeleteOutlined />} size="small" danger>Sil</Button>
                        </Button.Group>
                      </Col>
                    </Row>
                  </Card>
                )}
              />
            ) : (
              <Empty description="İletişim kişisi bulunmuyor" />
            )}
          </TabPane>

          <TabPane tab={`Fırsatlar (${customerOpportunities?.length || 0})`} key="opportunities">
            {customerOpportunities?.length ? (
              <List
                dataSource={customerOpportunities}
                renderItem={(opportunity: any) => (
                  <Card style={{ marginBottom: 12 }}>
                    <Row>
                      <Col span={12}>
                        <Text strong>{opportunity.name}</Text>
                        <br />
                        <Text type="secondary">
                          Değer: ₺{opportunity.amount?.toLocaleString('tr-TR')}
                        </Text>
                      </Col>
                      <Col span={6}>
                        <Tag color={opportunity.stage?.color || 'blue'}>
                          {opportunity.stage?.name || 'Belirtilmemiş'}
                        </Tag>
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Progress 
                          type="circle" 
                          percent={opportunity.probability} 
                          width={50}
                        />
                      </Col>
                    </Row>
                  </Card>
                )}
              />
            ) : (
              <Empty description="Fırsat bulunmuyor" />
            )}
          </TabPane>

          <TabPane tab="Aktiviteler" key="activities">
            <Timeline>
              <Timeline.Item color="green">
                <p>İlk görüşme yapıldı</p>
                <Text type="secondary">10 Ocak 2024</Text>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <p>Teklif gönderildi</p>
                <Text type="secondary">15 Ocak 2024</Text>
              </Timeline.Item>
              <Timeline.Item>
                <p>Sözleşme müzakeresi</p>
                <Text type="secondary">20 Ocak 2024</Text>
              </Timeline.Item>
            </Timeline>
          </TabPane>

          <TabPane tab="Notlar" key="notes">
            <Empty description="Not bulunmuyor" />
          </TabPane>
        </Tabs>
      </Drawer>

      {/* Add Contact Modal */}
      <Modal
        title="Yeni İletişim Kişisi Ekle"
        open={isContactModalOpen}
        onCancel={() => {
          setIsContactModalOpen(false);
          contactForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={contactForm}
          layout="vertical"
          onFinish={(values) => addContactMutation.mutate(values)}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Ad"
                rules={[{ required: true, message: 'Ad zorunludur' }]}
              >
                <Input placeholder="Ad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Soyad"
                rules={[{ required: true, message: 'Soyad zorunludur' }]}
              >
                <Input placeholder="Soyad" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email zorunludur' },
                  { type: 'email', message: 'Geçerli bir email giriniz' }
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon">
                <Input placeholder="Telefon" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mobilePhone" label="Cep Telefonu">
                <Input placeholder="Cep telefonu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobTitle" label="Pozisyon">
                <Input placeholder="Pozisyon" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Departman">
                <Input placeholder="Departman" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactType" label="Kişi Tipi">
                <Select placeholder="Tip seçiniz">
                  <Option value="Primary">Birincil</Option>
                  <Option value="Secondary">İkincil</Option>
                  <Option value="Technical">Teknik</Option>
                  <Option value="Financial">Mali</Option>
                  <Option value="Executive">Yönetici</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="isPrimary" 
            valuePropName="checked"
          >
            <Space>
              <input type="checkbox" />
              <span>Birincil iletişim kişisi</span>
            </Space>
          </Form.Item>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="Kişi hakkında notlar" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsContactModalOpen(false);
                contactForm.resetFields();
              }}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={addContactMutation.isPending}>
                Ekle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};