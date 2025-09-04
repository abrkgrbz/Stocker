import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, message, Drawer, Form, InputNumber, Row, Col, Statistic } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Opportunity {
  id: number;
  name: string;
  customerId: number;
  customerName: string;
  value: number;
  probability: number;
  expectedRevenue: number;
  stage: string;
  status: string;
  closeDate: string;
  owner: string;
  source: string;
  description: string;
  createdDate: string;
  lastActivity: string;
}

const stages = [
  { value: 'qualification', label: 'Kalifikasyon', color: 'blue' },
  { value: 'needs_analysis', label: 'İhtiyaç Analizi', color: 'cyan' },
  { value: 'proposal', label: 'Teklif', color: 'orange' },
  { value: 'negotiation', label: 'Müzakere', color: 'purple' },
  { value: 'closed_won', label: 'Kazanıldı', color: 'green' },
  { value: 'closed_lost', label: 'Kaybedildi', color: 'red' },
];

const mockData: Opportunity[] = [
  {
    id: 1,
    name: 'ERP Yazılımı Satışı',
    customerId: 1,
    customerName: 'ABC Teknoloji A.Ş.',
    value: 150000,
    probability: 75,
    expectedRevenue: 112500,
    stage: 'proposal',
    status: 'active',
    closeDate: '2024-02-15',
    owner: 'Ahmet Yılmaz',
    source: 'Website',
    description: 'Kurumsal ERP çözümü için görüşmeler devam ediyor',
    createdDate: '2024-01-10',
    lastActivity: '2024-01-25',
  },
  {
    id: 2,
    name: 'CRM Modülü Entegrasyonu',
    customerId: 2,
    customerName: 'XYZ Holding',
    value: 85000,
    probability: 60,
    expectedRevenue: 51000,
    stage: 'needs_analysis',
    status: 'active',
    closeDate: '2024-03-01',
    owner: 'Mehmet Demir',
    source: 'Referral',
    description: 'Mevcut sistemlerine CRM modülü entegrasyonu',
    createdDate: '2024-01-15',
    lastActivity: '2024-01-28',
  },
];

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterStage, setFilterStage] = useState<string | undefined>();
  const [form] = Form.useForm();

  const columns: ColumnsType<Opportunity> = [
    {
      title: 'Fırsat Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <a style={{ fontWeight: 500 }}>{text}</a>
          <small style={{ color: '#8c8c8c' }}>{record.customerName}</small>
        </Space>
      ),
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 500 }}>
          ₺{value.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Olasılık',
      dataIndex: 'probability',
      key: 'probability',
      align: 'center',
      render: (probability) => (
        <Tag color={probability >= 70 ? 'green' : probability >= 40 ? 'orange' : 'red'}>
          %{probability}
        </Tag>
      ),
    },
    {
      title: 'Beklenen Gelir',
      dataIndex: 'expectedRevenue',
      key: 'expectedRevenue',
      align: 'right',
      render: (value) => `₺${value.toLocaleString('tr-TR')}`,
    },
    {
      title: 'Aşama',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage) => {
        const stageInfo = stages.find(s => s.value === stage);
        return <Tag color={stageInfo?.color}>{stageInfo?.label}</Tag>;
      },
    },
    {
      title: 'Kapanış Tarihi',
      dataIndex: 'closeDate',
      key: 'closeDate',
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Sorumlu',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => (
        <Space size={4}>
          <UserOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
          <span>{owner}</span>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    form.setFieldsValue({
      ...opportunity,
      closeDate: dayjs(opportunity.closeDate),
    });
    setDrawerVisible(true);
  };

  const handleDelete = (id: number) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
    message.success('Fırsat silindi');
  };

  const handleSubmit = (values: any) => {
    const formData = {
      ...values,
      closeDate: values.closeDate.format('YYYY-MM-DD'),
      expectedRevenue: values.value * (values.probability / 100),
    };

    if (editingOpportunity) {
      setOpportunities(prev => 
        prev.map(o => o.id === editingOpportunity.id ? { ...o, ...formData } : o)
      );
      message.success('Fırsat güncellendi');
    } else {
      const newOpportunity = {
        ...formData,
        id: opportunities.length + 1,
        createdDate: dayjs().format('YYYY-MM-DD'),
        lastActivity: dayjs().format('YYYY-MM-DD'),
        status: 'active',
      };
      setOpportunities(prev => [...prev, newOpportunity]);
      message.success('Yeni fırsat eklendi');
    }

    setDrawerVisible(false);
    form.resetFields();
    setEditingOpportunity(null);
  };

  const filteredData = opportunities.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         o.customerName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStage = !filterStage || o.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalValue = filteredData.reduce((sum, o) => sum + o.value, 0);
  const totalExpected = filteredData.reduce((sum, o) => sum + o.expectedRevenue, 0);
  const avgProbability = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, o) => sum + o.probability, 0) / filteredData.length)
    : 0;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={totalValue}
              prefix="₺"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Beklenen Gelir"
              value={totalExpected}
              prefix="₺"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ortalama Olasılık"
              value={avgProbability}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Fırsatlar"
              value={filteredData.length}
              suffix="adet"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Aşama Filtrele"
              allowClear
              style={{ width: 180 }}
              value={filterStage}
              onChange={setFilterStage}
              options={stages}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingOpportunity(null);
              form.resetFields();
              setDrawerVisible(true);
            }}
          >
            Yeni Fırsat
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} fırsat`,
          }}
        />
      </Card>

      <Drawer
        title={editingOpportunity ? 'Fırsatı Düzenle' : 'Yeni Fırsat'}
        width={600}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingOpportunity(null);
        }}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)}>İptal</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingOpportunity ? 'Güncelle' : 'Ekle'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Fırsat Adı"
            rules={[{ required: true, message: 'Fırsat adı gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerName"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stage"
                label="Aşama"
                rules={[{ required: true, message: 'Aşama gerekli' }]}
              >
                <Select options={stages} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Değer (₺)"
                rules={[{ required: true, message: 'Değer gerekli' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="probability"
                label="Olasılık (%)"
                rules={[{ required: true, message: 'Olasılık gerekli' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value!.replace('%', '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="closeDate"
                label="Tahmini Kapanış"
                rules={[{ required: true, message: 'Kapanış tarihi gerekli' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="owner"
                label="Sorumlu"
                rules={[{ required: true, message: 'Sorumlu gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="source"
            label="Kaynak"
          >
            <Select>
              <Select.Option value="Website">Website</Select.Option>
              <Select.Option value="Referral">Referans</Select.Option>
              <Select.Option value="Cold Call">Soğuk Arama</Select.Option>
              <Select.Option value="Partner">İş Ortağı</Select.Option>
              <Select.Option value="Campaign">Kampanya</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};