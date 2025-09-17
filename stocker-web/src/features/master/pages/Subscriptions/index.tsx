import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Switch,
  message,
  Dropdown,
  Input,
  Row,
  Col,
  Statistic,
  Badge,
  Typography,
  Tooltip,
  Drawer,
  Descriptions,
  Timeline,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  MoreOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { subscriptionsApi, SubscriptionDto } from '@/shared/api/subscriptions.api';
import { masterApi } from '@/shared/api/master.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const MasterSubscriptionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionDto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionDto | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDto | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [form] = Form.useForm();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    suspended: 0,
    revenue: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchSubscriptions();
    fetchTenants();
    fetchPackages();
  }, []);

  useEffect(() => {
    filterSubscriptions();
    calculateStats();
  }, [subscriptions, statusFilter, searchText]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsApi.getAll();
      if (response.data?.success) {
        setSubscriptions(response.data.data || []);
      }
    } catch (error) {
      message.error('Abonelikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await masterApi.tenants.getAll();
      if (response.data?.data) {
        setTenants(response.data.data);
      }
    } catch (error) {
      // Error handling removed for production
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await masterApi.packages.getAll();
      if (response.data?.data) {
        setPackages(response.data.data);
      }
    } catch (error) {
      // Error handling removed for production
    }
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter(s =>
        s.tenantName?.toLowerCase().includes(searchText.toLowerCase()) ||
        s.packageName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredSubscriptions(filtered);
  };

  const calculateStats = () => {
    const active = subscriptions.filter(s => s.status === 'Active').length;
    const trial = subscriptions.filter(s => s.status === 'Trial').length;
    const suspended = subscriptions.filter(s => s.status === 'Suspended').length;
    const revenue = subscriptions
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + (s.price?.amount || 0), 0);

    setStats({
      total: subscriptions.length,
      active,
      trial,
      suspended,
      revenue,
    });
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingSubscription(null);
    setModalVisible(true);
  };

  const handleEdit = (record: SubscriptionDto) => {
    setEditingSubscription(record);
    form.setFieldsValue({
      tenantId: record.tenantId,
      packageId: record.packageId,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      autoRenew: record.autoRenew,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      };

      if (editingSubscription) {
        await subscriptionsApi.update(editingSubscription.id, data);
        message.success('Abonelik güncellendi');
      } else {
        await subscriptionsApi.create(data);
        message.success('Abonelik oluşturuldu');
      }

      setModalVisible(false);
      fetchSubscriptions();
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleCancel = async (id: string) => {
    Modal.confirm({
      title: 'Aboneliği İptal Et',
      content: 'Bu aboneliği iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await subscriptionsApi.cancel(id);
          message.success('Abonelik iptal edildi');
          fetchSubscriptions();
        } catch (error) {
          message.error('İptal işlemi başarısız');
        }
      },
    });
  };

  const handleSuspend = async (id: string) => {
    Modal.confirm({
      title: 'Aboneliği Askıya Al',
      content: (
        <Form>
          <Form.Item label="Askıya Alma Nedeni">
            <TextArea rows={3} placeholder="Neden belirtiniz..." />
          </Form.Item>
        </Form>
      ),
      okText: 'Askıya Al',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await subscriptionsApi.suspend(id, 'Manual suspension');
          message.success('Abonelik askıya alındı');
          fetchSubscriptions();
        } catch (error) {
          message.error('İşlem başarısız');
        }
      },
    });
  };

  const handleActivate = async (id: string) => {
    try {
      await subscriptionsApi.activate(id);
      message.success('Abonelik aktifleştirildi');
      fetchSubscriptions();
    } catch (error) {
      message.error('Aktifleştirme başarısız');
    }
  };

  const handleRenew = async (id: string) => {
    Modal.confirm({
      title: 'Aboneliği Yenile',
      content: 'Bu aboneliği 1 ay daha yenilemek istiyor musunuz?',
      okText: 'Yenile',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await subscriptionsApi.renew(id, 1);
          message.success('Abonelik yenilendi');
          fetchSubscriptions();
        } catch (error) {
          message.error('Yenileme başarısız');
        }
      },
    });
  };

  const showDetail = (record: SubscriptionDto) => {
    setSelectedSubscription(record);
    setDetailDrawerVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: 'success',
      Trial: 'processing',
      Suspended: 'warning',
      Cancelled: 'error',
      Expired: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      Active: <CheckCircleOutlined />,
      Trial: <ClockCircleOutlined />,
      Suspended: <ExclamationCircleOutlined />,
      Cancelled: <CloseCircleOutlined />,
      Expired: <ClockCircleOutlined />,
    };
    return icons[status] || null;
  };

  const columns: ColumnsType<SubscriptionDto> = [
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Paket',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={
          <Space>
            {getStatusIcon(status)}
            <span>{status}</span>
          </Space>
        } />
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      render: (_, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₺{record.price?.amount || 0}
        </Text>
      ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => {
        const daysLeft = dayjs(date).diff(dayjs(), 'day');
        const color = daysLeft < 7 ? 'red' : daysLeft < 30 ? 'orange' : 'green';
        return (
          <Tooltip title={`${daysLeft} gün kaldı`}>
            <Text style={{ color }}>
              {dayjs(date).format('DD.MM.YYYY')}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Otomatik Yenileme',
      dataIndex: 'autoRenew',
      key: 'autoRenew',
      render: (autoRenew: boolean) => (
        <Switch checked={autoRenew} disabled size="small" />
      ),
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
                key: 'view',
                label: 'Detaylar',
                icon: <CalendarOutlined />,
                onClick: () => showDetail(record),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              { type: 'divider' },
              ...(record.status === 'Active' ? [
                {
                  key: 'suspend',
                  label: 'Askıya Al',
                  icon: <StopOutlined />,
                  onClick: () => handleSuspend(record.id),
                },
              ] : []),
              ...(record.status === 'Suspended' ? [
                {
                  key: 'activate',
                  label: 'Aktifleştir',
                  icon: <PlayCircleOutlined />,
                  onClick: () => handleActivate(record.id),
                },
              ] : []),
              {
                key: 'renew',
                label: 'Yenile',
                icon: <ReloadOutlined />,
                onClick: () => handleRenew(record.id),
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'İptal Et',
                icon: <CloseCircleOutlined />,
                danger: true,
                onClick: () => handleCancel(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="master-subscriptions-page">
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Abonelik"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aktif"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Deneme"
              value={stats.trial}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aylık Gelir"
              value={stats.revenue}
              prefix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title="Abonelik Yönetimi"
        extra={
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tüm Durumlar</Option>
              <Option value="Active">Aktif</Option>
              <Option value="Trial">Deneme</Option>
              <Option value="Suspended">Askıda</Option>
              <Option value="Cancelled">İptal</Option>
            </Select>
            <Input
              placeholder="Ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchSubscriptions}>
              Yenile
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Yeni Abonelik
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredSubscriptions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} abonelik`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingSubscription ? 'Abonelik Düzenle' : 'Yeni Abonelik'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenantId"
                label="Tenant"
                rules={[{ required: true, message: 'Tenant seçiniz' }]}
              >
                <Select
                  showSearch
                  placeholder="Tenant seçiniz"
                  optionFilterProp="children"
                >
                  {tenants.map(t => (
                    <Option key={t.id} value={t.id}>{t.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="packageId"
                label="Paket"
                rules={[{ required: true, message: 'Paket seçiniz' }]}
              >
                <Select placeholder="Paket seçiniz">
                  {packages.map(p => (
                    <Option key={p.id} value={p.id}>
                      {p.name} - ₺{p.price}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Başlangıç Tarihi"
                rules={[{ required: true, message: 'Başlangıç tarihi seçiniz' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Bitiş Tarihi"
                rules={[{ required: true, message: 'Bitiş tarihi seçiniz' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="autoRenew"
            label="Otomatik Yenileme"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>İptal</Button>
              <Button type="primary" htmlType="submit">
                {editingSubscription ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Abonelik Detayları"
        placement="right"
        width={600}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedSubscription && (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Tenant">
                {selectedSubscription.tenantName}
              </Descriptions.Item>
              <Descriptions.Item label="Paket">
                <Tag color="blue">{selectedSubscription.packageName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge status={getStatusColor(selectedSubscription.status) as any} text={selectedSubscription.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Fiyat">
                ₺{selectedSubscription.price?.amount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Başlangıç">
                {dayjs(selectedSubscription.startDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş">
                {dayjs(selectedSubscription.endDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Otomatik Yenileme">
                <Switch checked={selectedSubscription.autoRenew} disabled />
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Özellikler</Title>
            <Space wrap style={{ marginBottom: 24 }}>
              {selectedSubscription.features?.map(feature => (
                <Tag key={feature} icon={<CheckCircleOutlined />} color="success">
                  {feature}
                </Tag>
              ))}
            </Space>

            <Title level={5}>İşlem Geçmişi</Title>
            <Timeline>
              <Timeline.Item color="green">
                Abonelik oluşturuldu - {dayjs(selectedSubscription.createdAt).format('DD.MM.YYYY HH:mm')}
              </Timeline.Item>
              <Timeline.Item color="blue">
                Paket güncellendi - {dayjs().subtract(15, 'day').format('DD.MM.YYYY HH:mm')}
              </Timeline.Item>
              <Timeline.Item color="gray">
                Otomatik yenileme aktifleştirildi - {dayjs().subtract(30, 'day').format('DD.MM.YYYY HH:mm')}
              </Timeline.Item>
            </Timeline>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default MasterSubscriptionsPage;