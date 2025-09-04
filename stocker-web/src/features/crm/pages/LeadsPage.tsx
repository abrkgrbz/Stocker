import React, { useState, useEffect } from 'react';
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
  Statistic
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
  StarOutlined,
  StarFilled,
  MoreOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { leadService, Lead, CreateLeadDto, LeadListParams } from '@/services/crm/leadService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Option } = Select;
const { Search } = Input;

export const LeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadListParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdDate',
    sortDirection: 'desc'
  });
  
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();

  // Fetch leads
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadService.getLeads(filters)
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (data: CreateLeadDto) => leadService.createLead(data),
    onSuccess: () => {
      message.success('Lead başarıyla oluşturuldu');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      message.error('Lead oluşturulurken hata oluştu');
    }
  });

  // Convert lead mutation
  const convertLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => leadService.convertLead(id, data),
    onSuccess: () => {
      message.success('Lead başarıyla dönüştürüldü');
      setIsConvertModalOpen(false);
      convertForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      message.error('Lead dönüştürülürken hata oluştu');
    }
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (id: number) => leadService.deleteLead(id),
    onSuccess: () => {
      message.success('Lead başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      message.error('Lead silinirken hata oluştu');
    }
  });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'New': 'blue',
      'Contacted': 'cyan',
      'Qualified': 'green',
      'Unqualified': 'red',
      'Working': 'orange',
      'Converted': 'success'
    };
    return statusColors[status] || 'default';
  };

  const getRatingIcon = (rating: string) => {
    const ratings: Record<string, { icon: React.ReactNode; color: string }> = {
      'Hot': { icon: <StarFilled />, color: '#ff4d4f' },
      'Warm': { icon: <StarFilled />, color: '#fa8c16' },
      'Cold': { icon: <StarOutlined />, color: '#1890ff' }
    };
    return ratings[rating] || { icon: <StarOutlined />, color: '#d9d9d9' };
  };

  const columns = [
    {
      title: 'Lead',
      key: 'lead',
      fixed: 'left',
      width: 250,
      render: (record: Lead) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
              {record.firstName?.[0]}{record.lastName?.[0]}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{record.fullName}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{record.companyName}</div>
            </div>
          </Space>
        </Space>
      )
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (record: Lead) => (
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
        </Space>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating: string) => {
        const ratingInfo = getRatingIcon(rating);
        return (
          <Space>
            <span style={{ color: ratingInfo.color }}>{ratingInfo.icon}</span>
            <span>{rating}</span>
          </Space>
        );
      }
    },
    {
      title: 'Skor',
      dataIndex: 'leadScore',
      key: 'leadScore',
      width: 100,
      render: (score: number) => (
        <Badge 
          count={score} 
          style={{ 
            backgroundColor: score >= 70 ? '#52c41a' : score >= 40 ? '#fa8c16' : '#f5222d' 
          }}
          overflowCount={999}
        />
      )
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => <Tag>{source || 'Direct'}</Tag>
    },
    {
      title: 'Sektör',
      dataIndex: 'industry',
      key: 'industry',
      width: 150
    },
    {
      title: 'Pozisyon',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      width: 150
    },
    {
      title: 'Oluşturma',
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
      render: (record: Lead) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <UserOutlined />,
                label: 'Görüntüle'
              },
              {
                key: 'edit',
                icon: <UserOutlined />,
                label: 'Düzenle'
              },
              {
                type: 'divider'
              },
              {
                key: 'convert',
                icon: <SwapOutlined />,
                label: 'Müşteriye Dönüştür',
                onClick: () => {
                  setSelectedLead(record);
                  setIsConvertModalOpen(true);
                }
              },
              {
                key: 'qualify',
                icon: <CheckCircleOutlined />,
                label: 'Qualify',
                disabled: record.status === 'Qualified'
              },
              {
                key: 'disqualify',
                icon: <CloseCircleOutlined />,
                label: 'Disqualify',
                disabled: record.status === 'Unqualified'
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                icon: <CloseCircleOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Lead Sil',
                    content: 'Bu lead\'i silmek istediğinize emin misiniz?',
                    okText: 'Sil',
                    okType: 'danger',
                    cancelText: 'İptal',
                    onOk: () => deleteLeadMutation.mutate(record.id)
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
        title="Leads"
        subtitle="Potansiyel müşterilerinizi yönetin ve takip edin"
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
            Yeni Lead
          </Button>
        ]}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Lead"
              value={leadsData?.totalCount || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Qualified Leads"
              value={leadsData?.items.filter(l => l.status === 'Qualified').length || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ortalama Skor"
              value={
                leadsData?.items.length 
                  ? Math.round(leadsData.items.reduce((acc, l) => acc + l.leadScore, 0) / leadsData.items.length)
                  : 0
              }
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Dönüşüm Oranı"
              value={
                leadsData?.items.length
                  ? Math.round((leadsData.items.filter(l => l.isConverted).length / leadsData.items.length) * 100)
                  : 0
              }
              suffix="%"
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="Lead ara..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Durum"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="New">New</Option>
              <Option value="Contacted">Contacted</Option>
              <Option value="Qualified">Qualified</Option>
              <Option value="Unqualified">Unqualified</Option>
              <Option value="Working">Working</Option>
              <Option value="Converted">Converted</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Rating"
              allowClear
              onChange={(value) => setFilters({ ...filters, rating: value })}
            >
              <Option value="Hot">Hot</Option>
              <Option value="Warm">Warm</Option>
              <Option value="Cold">Cold</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Kaynak"
              allowClear
              onChange={(value) => setFilters({ ...filters, source: value })}
            >
              <Option value="Website">Website</Option>
              <Option value="Email">Email</Option>
              <Option value="Phone">Phone</Option>
              <Option value="Social Media">Social Media</Option>
              <Option value="Referral">Referral</Option>
              <Option value="Direct">Direct</Option>
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
          dataSource={leadsData?.items || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: leadsData?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} lead`
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* Create Lead Modal */}
      <Modal
        title="Yeni Lead Oluştur"
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
          onFinish={(values) => createLeadMutation.mutate(values)}
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
              <Form.Item name="companyName" label="Şirket">
                <Input placeholder="Şirket Adı" />
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
              <Form.Item name="industry" label="Sektör">
                <Select placeholder="Sektör seçiniz">
                  <Option value="Technology">Teknoloji</Option>
                  <Option value="Finance">Finans</Option>
                  <Option value="Healthcare">Sağlık</Option>
                  <Option value="Manufacturing">Üretim</Option>
                  <Option value="Retail">Perakende</Option>
                  <Option value="Education">Eğitim</Option>
                  <Option value="Other">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="Kaynak">
                <Select placeholder="Kaynak seçiniz">
                  <Option value="Website">Website</Option>
                  <Option value="Email">Email</Option>
                  <Option value="Phone">Phone</Option>
                  <Option value="Social Media">Social Media</Option>
                  <Option value="Referral">Referral</Option>
                  <Option value="Direct">Direct</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="numberOfEmployees" label="Çalışan Sayısı">
                <InputNumber style={{ width: '100%' }} placeholder="Çalışan sayısı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annualRevenue" label="Yıllık Gelir">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\₺\s?|(,*)/g, '')}
                  placeholder="Yıllık gelir"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Açıklama" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={createLeadMutation.isPending}>
                Oluştur
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert Lead Modal */}
      <Modal
        title="Lead'i Müşteriye Dönüştür"
        open={isConvertModalOpen}
        onCancel={() => {
          setIsConvertModalOpen(false);
          convertForm.resetFields();
          setSelectedLead(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={convertForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedLead) {
              convertLeadMutation.mutate({ id: selectedLead.id, data: values });
            }
          }}
        >
          <Form.Item
            name="createOpportunity"
            valuePropName="checked"
            initialValue={true}
          >
            <Space>
              <input type="checkbox" />
              <span>Fırsat oluştur</span>
            </Space>
          </Form.Item>

          <Form.Item
            name="opportunityName"
            label="Fırsat Adı"
            rules={[{ required: true, message: 'Fırsat adı zorunludur' }]}
          >
            <Input placeholder="Fırsat adı" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="opportunityAmount"
                label="Tahmini Değer"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\₺\s?|(,*)/g, '')}
                  placeholder="Tahmini değer"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="opportunityExpectedCloseDate"
                label="Tahmini Kapanış"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Tarih seçiniz" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item
            name="createTask"
            valuePropName="checked"
          >
            <Space>
              <input type="checkbox" />
              <span>Takip görevi oluştur</span>
            </Space>
          </Form.Item>

          <Form.Item
            name="taskSubject"
            label="Görev Konusu"
          >
            <Input placeholder="Görev konusu" />
          </Form.Item>

          <Form.Item
            name="taskDueDate"
            label="Görev Tarihi"
          >
            <DatePicker style={{ width: '100%' }} placeholder="Tarih seçiniz" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsConvertModalOpen(false);
                convertForm.resetFields();
                setSelectedLead(null);
              }}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={convertLeadMutation.isPending}>
                Dönüştür
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};