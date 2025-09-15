import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Dropdown,
  Input,
  Select,
  Badge,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Modal,
  Form,
  DatePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTenantStore } from '../../stores/tenantStore';
import { TenantListDto } from '../../services/api/tenantService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;

const TenantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantListDto | null>(null);
  const [suspendForm] = Form.useForm();

  const {
    tenants,
    loading,
    totalCount,
    pageNumber,
    pageSize,
    searchTerm,
    statusFilter,
    fetchTenants,
    toggleTenantStatus,
    deleteTenant,
    suspendTenant,
    activateTenant,
    setSearchTerm,
    setStatusFilter,
    setPageNumber,
    setPageSize,
  } = useTenantStore();

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleStatusToggle = async (id: string) => {
    const success = await toggleTenantStatus(id);
    if (success) {
      message.success('Tenant durumu güncellendi');
    }
  };

  const handleDelete = async (id: string, hardDelete: boolean = false) => {
    const success = await deleteTenant(id, undefined, hardDelete);
    if (success) {
      message.success(hardDelete ? 'Tenant kalıcı olarak silindi' : 'Tenant pasif duruma alındı');
    }
  };

  const handleSuspend = () => {
    suspendForm.validateFields().then(async (values) => {
      if (selectedTenant) {
        const success = await suspendTenant(
          selectedTenant.id,
          values.reason,
          values.suspendedUntil?.toISOString()
        );
        if (success) {
          setSuspendModalVisible(false);
          suspendForm.resetFields();
          message.success('Tenant askıya alındı');
        }
      }
    });
  };

  const handleActivate = async (id: string) => {
    const success = await activateTenant(id);
    if (success) {
      message.success('Tenant aktif edildi');
    }
  };

  const getStatusTag = (isActive: boolean) => {
    if (isActive) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Aktif
        </Tag>
      );
    }
    return (
      <Tag icon={<CloseCircleOutlined />} color="error">
        Pasif
      </Tag>
    );
  };

  const getPackageTag = (packageName: string) => {
    const colorMap: Record<string, string> = {
      'Starter': 'blue',
      'Professional': 'green',
      'Enterprise': 'gold',
      'Trial': 'orange',
    };
    return <Tag color={colorMap[packageName] || 'default'}>{packageName}</Tag>;
  };

  const columns: ColumnsType<TenantListDto> = [
    {
      title: 'Tenant Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TenantListDto) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.code}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text: string) => (
        <Space>
          <GlobalOutlined />
          <a href={`https://${text}`} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        </Space>
      ),
    },
    {
      title: 'Paket',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text: string) => getPackageTag(text),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      render: (isActive: boolean) => getStatusTag(isActive),
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <Space>
          <UserOutlined />
          <Text>{count}</Text>
        </Space>
      ),
    },
    {
      title: 'Abonelik Bitiş',
      dataIndex: 'subscriptionEndDate',
      key: 'subscriptionEndDate',
      render: (date: string) => {
        if (!date) return '-';
        const endDate = dayjs(date);
        const isExpired = endDate.isBefore(dayjs());
        const daysLeft = endDate.diff(dayjs(), 'day');
        
        return (
          <Tooltip title={endDate.format('DD MMMM YYYY')}>
            <Space>
              <CalendarOutlined />
              <Text type={isExpired ? 'danger' : daysLeft < 30 ? 'warning' : undefined}>
                {isExpired ? 'Süresi Doldu' : `${daysLeft} gün kaldı`}
              </Text>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD MMMM YYYY HH:mm')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: 'İşlemler',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_: any, record: TenantListDto) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EditOutlined />,
            label: 'Detaylar',
            onClick: () => navigate(`/tenants/${record.id}`),
          },
          {
            key: 'toggle',
            icon: record.isActive ? <PauseCircleOutlined /> : <CheckCircleOutlined />,
            label: record.isActive ? 'Pasif Yap' : 'Aktif Yap',
            onClick: () => handleStatusToggle(record.id),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'suspend',
            icon: <ExclamationCircleOutlined />,
            label: 'Askıya Al',
            onClick: () => {
              setSelectedTenant(record);
              setSuspendModalVisible(true);
            },
            disabled: !record.isActive,
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Sil',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Tenant Silinecek',
                content: 'Bu işlem geri alınamaz. Emin misiniz?',
                okText: 'Sil',
                okType: 'danger',
                cancelText: 'İptal',
                onOk: () => handleDelete(record.id, false),
              });
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const statistics = [
    {
      title: 'Toplam Tenant',
      value: totalCount,
      icon: <GlobalOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Aktif Tenant',
      value: tenants.filter(t => t.isActive).length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Pasif Tenant',
      value: tenants.filter(t => !t.isActive).length,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
    },
    {
      title: 'Toplam Kullanıcı',
      value: tenants.reduce((sum, t) => sum + t.userCount, 0),
      icon: <UserOutlined />,
      color: '#722ed1',
    },
  ];

  return (
    <div className="tenants-page">
      <div className="page-header">
        <Title level={2}>Tenant Yönetimi</Title>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Tenant ara..."
              onSearch={setSearchTerm}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">Tümü</Select.Option>
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Pasif</Select.Option>
              <Select.Option value="suspended">Askıda</Select.Option>
            </Select>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchTenants()}>
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/tenants/create')}
            >
              Yeni Tenant
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={tenants}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageNumber,
            pageSize: pageSize,
            total: totalCount,
            onChange: (page, size) => {
              setPageNumber(page);
              if (size) setPageSize(size);
            },
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} tenant`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Tenant Askıya Al"
        open={suspendModalVisible}
        onOk={handleSuspend}
        onCancel={() => {
          setSuspendModalVisible(false);
          suspendForm.resetFields();
        }}
        okText="Askıya Al"
        cancelText="İptal"
      >
        <Form form={suspendForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Askıya Alma Sebebi"
            rules={[{ required: true, message: 'Lütfen bir sebep girin' }]}
          >
            <Input.TextArea rows={4} placeholder="Askıya alma sebebini açıklayın..." />
          </Form.Item>
          <Form.Item
            name="suspendedUntil"
            label="Askıya Alma Bitiş Tarihi (Opsiyonel)"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Tarih seçin"
              disabledDate={(current) => current && current < dayjs()}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantsPage;