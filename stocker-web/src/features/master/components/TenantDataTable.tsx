import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Typography,
  Input,
  Select,
  DatePicker,
  Dropdown,
  Modal,
  Badge,
  Tooltip,
  Checkbox,
  Row,
  Col,
  message,
  Popconfirm,
} from 'antd';
import type { TableProps, ColumnsType, TableRowSelection } from 'antd/es/table';
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  LoginOutlined,
  EyeOutlined,
  MailOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  CrownOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'Başlangıç' | 'Profesyonel' | 'Kurumsal';
  status: 'active' | 'suspended' | 'pending' | 'expired';
  users: number;
  maxUsers: number;
  storage: number;
  maxStorage: number;
  createdAt: string;
  expiresAt: string;
  lastLogin: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  revenue: number;
  modules: string[];
}

interface TenantDataTableProps {
  data: Tenant[];
  loading: boolean;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenantIds: string[]) => void;
  onToggleStatus?: (tenantId: string) => void;
  onLoginAs?: (tenantId: string) => void;
  onView?: (tenant: Tenant) => void;
  onRefresh?: () => void;
  onExport?: (selectedIds?: string[]) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  pagination?: TableProps<Tenant>['pagination'];
  onChange?: TableProps<Tenant>['onChange'];
}

export const TenantDataTable: React.FC<TenantDataTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onLoginAs,
  onView,
  onRefresh,
  onExport,
  onSearch,
  onFilter,
  pagination,
  onChange,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const searchInputRef = useRef<any>(null);

  // Plan renkleri
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Başlangıç': return 'green';
      case 'Profesyonel': return 'blue';
      case 'Kurumsal': return 'gold';
      default: return 'default';
    }
  };

  // Durum renkleri ve ikonları
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'success', text: 'Aktif', icon: '🟢' };
      case 'suspended':
        return { color: 'error', text: 'Askıda', icon: '🔴' };
      case 'pending':
        return { color: 'warning', text: 'Onay Bekliyor', icon: '🟡' };
      case 'expired':
        return { color: 'default', text: 'Süresi Dolmuş', icon: '⚫' };
      default:
        return { color: 'default', text: status, icon: '⚪' };
    }
  };

  // Toplu işlem menüsü
  const bulkActionMenu = useMemo(() => ({
    items: [
      {
        key: 'activate',
        label: 'Aktif Et',
        icon: <UnlockOutlined />,
        onClick: () => {
          message.success(`${selectedRowKeys.length} tenant aktif edildi`);
          setSelectedRowKeys([]);
        }
      },
      {
        key: 'suspend',
        label: 'Askıya Al',
        icon: <LockOutlined />,
        danger: true,
        onClick: () => {
          message.warning(`${selectedRowKeys.length} tenant askıya alındı`);
          setSelectedRowKeys([]);
        }
      },
      { type: 'divider' },
      {
        key: 'export',
        label: 'Dışa Aktar',
        icon: <ExportOutlined />,
        onClick: () => onExport?.(selectedRowKeys)
      },
      {
        key: 'delete',
        label: 'Sil',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Tenantları Sil',
            content: `${selectedRowKeys.length} tenant kalıcı olarak silinecek. Emin misiniz?`,
            okText: 'Sil',
            cancelText: 'İptal',
            okButtonProps: { danger: true },
            onOk: () => {
              onDelete?.(selectedRowKeys);
              setSelectedRowKeys([]);
            }
          });
        }
      }
    ]
  }), [selectedRowKeys, onExport, onDelete]);

  // Tablo kolonları
  const columns: ColumnsType<Tenant> = [
    {
      title: 'Tenant',
      key: 'tenant',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar 
            size={40} 
            style={{ backgroundColor: getPlanColor(record.plan) }}
          >
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.subdomain}.stocker.app
            </Text>
          </div>
        </Space>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInputRef}
            placeholder="Tenant ara..."
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Ara
            </Button>
            <Button onClick={() => clearFilters?.()} size="small" style={{ width: 90 }}>
              Temizle
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => 
        record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.subdomain.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: 'Sahip',
      key: 'owner',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.owner.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <MailOutlined /> {record.owner.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      filters: [
        { text: 'Başlangıç', value: 'Başlangıç' },
        { text: 'Profesyonel', value: 'Profesyonel' },
        { text: 'Kurumsal', value: 'Kurumsal' },
      ],
      render: (plan: string) => (
        <Tag color={getPlanColor(plan)} icon={<CrownOutlined />}>
          {plan}
        </Tag>
      ),
      onFilter: (value, record) => record.plan === value,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'Askıda', value: 'suspended' },
        { text: 'Onay Bekliyor', value: 'pending' },
        { text: 'Süresi Dolmuş', value: 'expired' },
      ],
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Badge status={config.color as any} text={config.text} />
        );
      },
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Kullanım',
      key: 'usage',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Kullanıcı: {record.users}/{record.maxUsers}
            </Text>
            <Tooltip title={`${record.users} / ${record.maxUsers} kullanıcı`}>
              <div style={{ marginTop: 2 }}>
                <div style={{
                  width: '100%',
                  height: 4,
                  background: '#f0f0f0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(record.users / record.maxUsers) * 100}%`,
                    height: '100%',
                    background: record.users >= record.maxUsers ? '#ff4d4f' : '#52c41a',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            </Tooltip>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Depolama: {record.storage}GB/{record.maxStorage}GB
            </Text>
            <Tooltip title={`${record.storage}GB / ${record.maxStorage}GB depolama`}>
              <div style={{ marginTop: 2 }}>
                <div style={{
                  width: '100%',
                  height: 4,
                  background: '#f0f0f0',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(record.storage / record.maxStorage) * 100}%`,
                    height: '100%',
                    background: record.storage >= record.maxStorage * 0.9 ? '#faad14' : '#1890ff',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      sorter: (a, b) => a.revenue - b.revenue,
      render: (revenue: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          <DollarOutlined /> {revenue.toLocaleString('tr-TR')}
        </Text>
      ),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD MMMM YYYY HH:mm')}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).fromNow()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 120,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD MMMM YYYY HH:mm')}>
          <Text type={dayjs().diff(dayjs(date), 'day') > 7 ? 'warning' : 'secondary'} style={{ fontSize: 12 }}>
            {dayjs(date).fromNow()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Görüntüle">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'login',
                  label: 'Tenant Olarak Giriş',
                  icon: <LoginOutlined />,
                  onClick: () => onLoginAs?.(record.id),
                },
                {
                  key: 'toggle',
                  label: record.status === 'active' ? 'Askıya Al' : 'Aktif Et',
                  icon: record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />,
                  onClick: () => onToggleStatus?.(record.id),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: 'Tenant Sil',
                      content: `${record.name} kalıcı olarak silinecek. Emin misiniz?`,
                      okText: 'Sil',
                      cancelText: 'İptal',
                      okButtonProps: { danger: true },
                      onOk: () => onDelete?.([record.id]),
                    });
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Satır seçimi
  const rowSelection: TableRowSelection<Tenant> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys as string[]),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  // Genişletilebilir satır içeriği
  const expandedRowRender = (record: Tenant) => (
    <div style={{ padding: '16px 48px' }}>
      <Row gutter={[24, 16]}>
        <Col span={8}>
          <Text type="secondary">Modüller</Text>
          <div style={{ marginTop: 8 }}>
            {record.modules.map(module => (
              <Tag key={module} style={{ marginBottom: 4 }}>{module}</Tag>
            ))}
          </div>
        </Col>
        <Col span={8}>
          <Text type="secondary">Abonelik Bitiş</Text>
          <div style={{ marginTop: 8 }}>
            <Text>{dayjs(record.expiresAt).format('DD MMMM YYYY')}</Text>
            <br />
            <Text type={dayjs().isAfter(record.expiresAt) ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
              {dayjs(record.expiresAt).fromNow()}
            </Text>
          </div>
        </Col>
        <Col span={8}>
          <Text type="secondary">İletişim</Text>
          <div style={{ marginTop: 8 }}>
            <Text>{record.owner.phone || 'Telefon yok'}</Text>
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="tenant-data-table">
      {/* Üst Toolbar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Space wrap>
          {selectedRowKeys.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge count={selectedRowKeys.length} offset={[-5, 5]}>
                  <Dropdown menu={bulkActionMenu} trigger={['click']}>
                    <Button>
                      Toplu İşlem <MoreOutlined />
                    </Button>
                  </Dropdown>
                </Badge>
              </motion.div>
            </AnimatePresence>
          )}
          <Input
            placeholder="Tenant ara..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onSearch?.(e.target.value);
            }}
            allowClear
          />
          <Select
            placeholder="Plan Filtrele"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              setFilters({ ...filters, plan: value });
              onFilter?.({ ...filters, plan: value });
            }}
          >
            <Select.Option value="Başlangıç">Başlangıç</Select.Option>
            <Select.Option value="Profesyonel">Profesyonel</Select.Option>
            <Select.Option value="Kurumsal">Kurumsal</Select.Option>
          </Select>
          <Select
            placeholder="Durum Filtrele"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              setFilters({ ...filters, status: value });
              onFilter?.({ ...filters, status: value });
            }}
          >
            <Select.Option value="active">Aktif</Select.Option>
            <Select.Option value="suspended">Askıda</Select.Option>
            <Select.Option value="pending">Onay Bekliyor</Select.Option>
            <Select.Option value="expired">Süresi Dolmuş</Select.Option>
          </Select>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Yenile
          </Button>
          <Button icon={<ExportOutlined />} onClick={() => onExport?.()}>
            Dışa Aktar
          </Button>
        </Space>
      </div>

      {/* Tablo */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={onChange}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: setExpandedRowKeys,
          expandRowByClick: false,
        }}
        scroll={{ x: 1500 }}
        size="middle"
        className="custom-table"
      />
    </div>
  );
};

export default TenantDataTable;