'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  UserAddOutlined,
  StarOutlined,
  PhoneOutlined,
  MailOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Lead } from '@/lib/api/services/crm.service';

const { Title } = Typography;
const { TextArea } = Input;

// Mock data - replace with actual API calls
const mockLeads: Lead[] = [];

// Status colors
const statusColors: Record<Lead['status'], string> = {
  New: 'blue',
  Contacted: 'cyan',
  Qualified: 'green',
  Unqualified: 'red',
  Converted: 'purple',
};

// Source colors
const sourceColors: Record<Lead['source'], string> = {
  Website: 'blue',
  Referral: 'green',
  SocialMedia: 'cyan',
  Event: 'orange',
  Other: 'default',
};

export default function LeadsPage() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Calculate statistics
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'New').length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
  };

  const handleCreate = () => {
    setSelectedLead(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    form.setFieldsValue(lead);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Potansiyel Müşteriyi Sil',
      content: 'Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          // TODO: API call to delete lead
          setLeads(leads.filter((l) => l.id !== id));
          message.success('Potansiyel müşteri silindi');
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleConvert = (lead: Lead) => {
    setSelectedLead(lead);
    convertForm.setFieldsValue({
      companyName: lead.company,
      contactPerson: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
    });
    setConvertModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (selectedLead) {
        // TODO: API call to update lead
        setLeads(leads.map((l) => (l.id === selectedLead.id ? { ...l, ...values, updatedAt: new Date().toISOString() } : l)));
        message.success('Potansiyel müşteri güncellendi');
      } else {
        // TODO: API call to create lead
        const newLead: Lead = {
          id: Date.now(),
          ...values,
          score: values.score || 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setLeads([...leads, newLead]);
        message.success('Potansiyel müşteri oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertSubmit = async (values: any) => {
    setLoading(true);
    try {
      // TODO: API call to convert lead to customer
      if (selectedLead) {
        setLeads(leads.map((l) => (l.id === selectedLead.id ? { ...l, status: 'Converted' as const } : l)));
      }
      message.success('Potansiyel müşteri, müşteriye dönüştürüldü');
      setConvertModalOpen(false);
      convertForm.resetFields();
    } catch (error) {
      message.error('Dönüştürme işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Lead> = [
    {
      title: 'İsim',
      key: 'name',
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr'),
      render: (_, record) => (
        <div>
          <div className="font-medium">{`${record.firstName} ${record.lastName}`}</div>
          {record.company && <div className="text-xs text-gray-500">{record.company}</div>}
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div className="text-sm flex items-center gap-1">
            <MailOutlined className="text-gray-400" />
            {record.email}
          </div>
          {record.phone && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <PhoneOutlined className="text-gray-400" />
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      filters: [
        { text: 'Web Sitesi', value: 'Website' },
        { text: 'Referans', value: 'Referral' },
        { text: 'Sosyal Medya', value: 'SocialMedia' },
        { text: 'Etkinlik', value: 'Event' },
        { text: 'Diğer', value: 'Other' },
      ],
      onFilter: (value, record) => record.source === value,
      render: (source: Lead['source']) => <Tag color={sourceColors[source]}>{source}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Yeni', value: 'New' },
        { text: 'İletişime Geçildi', value: 'Contacted' },
        { text: 'Nitelikli', value: 'Qualified' },
        { text: 'Niteliksiz', value: 'Unqualified' },
        { text: 'Dönüştürüldü', value: 'Converted' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: Lead['status']) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Puan',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
      render: (score: number) => (
        <div className="flex items-center gap-1">
          <StarOutlined className={score >= 70 ? 'text-yellow-500' : 'text-gray-400'} />
          <span className={score >= 70 ? 'font-medium' : ''}>{score}</span>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Düzenle',
                onClick: () => handleEdit(record),
              },
              {
                key: 'convert',
                label: 'Müşteriye Dönüştür',
                icon: <SwapOutlined />,
                disabled: record.status === 'Converted',
                onClick: () => handleConvert(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Filter leads based on search
  const filteredLeads = leads.filter((lead) => {
    const searchLower = debouncedSearch.toLowerCase();
    return (
      lead.firstName.toLowerCase().includes(searchLower) ||
      lead.lastName.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower) ||
      ''
    );
  });

  return (
    <div className="p-6">
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div className="flex justify-between items-center">
            <Title level={2} className="!mb-0">
              Potansiyel Müşteriler
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => message.info('Yenileniyor...')}>
                Yenile
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Yeni Potansiyel Müşteri
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Toplam" value={stats.total} prefix={<UserAddOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Yeni" value={stats.new} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Nitelikli" value={stats.qualified} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Ort. Puan" value={stats.avgScore} prefix={<StarOutlined />} suffix="/ 100" />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col flex="auto">
              <Input
                placeholder="Potansiyel müşteri ara..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Button icon={<FilterOutlined />}>Filtrele</Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredLeads}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredLeads.length,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} potansiyel müşteri`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            loading={loading}
          />
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedLead ? 'Potansiyel Müşteri Düzenle' : 'Yeni Potansiyel Müşteri'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ad"
                name="firstName"
                rules={[{ required: true, message: 'Ad gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Soyad"
                name="lastName"
                rules={[{ required: true, message: 'Soyad gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'E-posta gerekli' },
              { type: 'email', message: 'Geçerli bir e-posta girin' },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Telefon" name="phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Firma" name="company">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pozisyon" name="jobTitle">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Kaynak"
                name="source"
                rules={[{ required: true, message: 'Kaynak gerekli' }]}
              >
                <Select>
                  <Select.Option value="Website">Web Sitesi</Select.Option>
                  <Select.Option value="Referral">Referans</Select.Option>
                  <Select.Option value="SocialMedia">Sosyal Medya</Select.Option>
                  <Select.Option value="Event">Etkinlik</Select.Option>
                  <Select.Option value="Other">Diğer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Durum"
                name="status"
                rules={[{ required: true, message: 'Durum gerekli' }]}
              >
                <Select>
                  <Select.Option value="New">Yeni</Select.Option>
                  <Select.Option value="Contacted">İletişime Geçildi</Select.Option>
                  <Select.Option value="Qualified">Nitelikli</Select.Option>
                  <Select.Option value="Unqualified">Niteliksiz</Select.Option>
                  <Select.Option value="Converted">Dönüştürüldü</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Puan (0-100)" name="score" initialValue={50}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Notlar" name="notes">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert to Customer Modal */}
      <Modal
        title="Müşteriye Dönüştür"
        open={convertModalOpen}
        onCancel={() => {
          setConvertModalOpen(false);
          convertForm.resetFields();
        }}
        onOk={() => convertForm.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form form={convertForm} layout="vertical" onFinish={handleConvertSubmit}>
          <Form.Item
            label="Firma Adı"
            name="companyName"
            rules={[{ required: true, message: 'Firma adı gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="İletişim Kişisi" name="contactPerson">
            <Input />
          </Form.Item>

          <Form.Item
            label="E-posta"
            name="email"
            rules={[
              { required: true, message: 'E-posta gerekli' },
              { type: 'email', message: 'Geçerli bir e-posta girin' },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Telefon" name="phone">
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item label="Adres" name="address">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
