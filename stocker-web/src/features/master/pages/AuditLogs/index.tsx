import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Timeline,
  Avatar,
  Tooltip,
  Badge,
  Dropdown,
  Checkbox,
  Modal,
  Typography,
  Divider,
  message,
  Tabs,
  Statistic,
  Progress,
  Empty,
  Alert
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  UserOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  SafetyOutlined,
  ApiOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  KeyOutlined,
  MailOutlined,
  BellOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeData } from '@/features/master/hooks/useRealtimeData';
import './auditLogs.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  action: string;
  category: 'auth' | 'user' | 'tenant' | 'system' | 'api' | 'data' | 'security' | 'billing';
  severity: 'info' | 'warning' | 'error' | 'critical';
  resource?: {
    type: string;
    id: string;
    name: string;
  };
  details?: Record<string, any>;
  ip: string;
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet';
  location?: {
    country: string;
    city: string;
  };
  duration?: number;
  status: 'success' | 'failed' | 'pending';
}

const mockLogs: AuditLog[] = Array.from({ length: 100 }, (_, i) => {
  const categories = ['auth', 'user', 'tenant', 'system', 'api', 'data', 'security', 'billing'] as const;
  const severities = ['info', 'warning', 'error', 'critical'] as const;
  const devices = ['desktop', 'mobile', 'tablet'] as const;
  const statuses = ['success', 'failed', 'pending'] as const;
  
  return {
    id: `LOG-${1000 + i}`,
    timestamp: dayjs().subtract(Math.floor(Math.random() * 30), 'day').subtract(Math.floor(Math.random() * 24), 'hour').toISOString(),
    user: {
      id: `USER-${Math.floor(Math.random() * 10) + 1}`,
      name: ['Ahmet Yılmaz', 'Mehmet Demir', 'Ayşe Kara', 'Fatma Şahin', 'Ali Öztürk'][Math.floor(Math.random() * 5)],
      email: `user${Math.floor(Math.random() * 10) + 1}@example.com`,
      avatar: Math.random() > 0.3 ? `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}` : undefined,
      role: ['Admin', 'Manager', 'User', 'Developer'][Math.floor(Math.random() * 4)]
    },
    tenant: Math.random() > 0.3 ? {
      id: `TENANT-${Math.floor(Math.random() * 5) + 1}`,
      name: ['Teknoloji A.Ş.', 'Üretim Ltd.', 'Satış Tic.', 'Hizmet Ltd.'][Math.floor(Math.random() * 4)]
    } : undefined,
    action: [
      'User Login', 'User Logout', 'Password Changed', 'Profile Updated',
      'Tenant Created', 'Tenant Updated', 'Tenant Deleted',
      'API Key Generated', 'API Key Revoked', 'API Call',
      'Data Export', 'Data Import', 'Backup Created',
      'Settings Changed', 'Role Assigned', 'Permission Updated'
    ][Math.floor(Math.random() * 16)],
    category: categories[Math.floor(Math.random() * categories.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    resource: Math.random() > 0.5 ? {
      type: ['User', 'Tenant', 'Product', 'Order', 'Invoice'][Math.floor(Math.random() * 5)],
      id: `RES-${Math.floor(Math.random() * 100) + 1}`,
      name: `Resource ${Math.floor(Math.random() * 100) + 1}`
    } : undefined,
    details: Math.random() > 0.7 ? {
      oldValue: 'Old Value',
      newValue: 'New Value',
      reason: 'User requested change'
    } : undefined,
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device: devices[Math.floor(Math.random() * devices.length)],
    location: Math.random() > 0.4 ? {
      country: ['Türkiye', 'USA', 'Germany', 'UK'][Math.floor(Math.random() * 4)],
      city: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'][Math.floor(Math.random() * 4)]
    } : undefined,
    duration: Math.random() > 0.6 ? Math.floor(Math.random() * 5000) + 100 : undefined,
    status: statuses[Math.floor(Math.random() * statuses.length)]
  };
});

const AuditLogs: React.FC = () => {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    severity: 'all',
    status: 'all',
    user: 'all',
    tenant: 'all',
    dateRange: [null, null] as [dayjs.Dayjs | null, dayjs.Dayjs | null]
  });
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [detailsModal, setDetailsModal] = useState<{ visible: boolean; log: AuditLog | null }>({ 
    visible: false, 
    log: null 
  });
  const [exportModal, setExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'json',
    includeDetails: true,
    dateRange: true
  });

  const { data: logs, loading, refresh } = useRealtimeData(
    async () => mockLogs,
    { interval: 30000 }
  );

  const categoryIcons = {
    auth: <KeyOutlined />,
    user: <UserOutlined />,
    tenant: <TeamOutlined />,
    system: <SettingOutlined />,
    api: <ApiOutlined />,
    data: <DatabaseOutlined />,
    security: <SafetyOutlined />,
    billing: <FileTextOutlined />
  };

  const severityColors = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    critical: 'red'
  };

  const statusIcons = {
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    failed: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    pending: <ClockCircleOutlined style={{ color: '#faad14' }} />
  };

  const deviceIcons = {
    desktop: <DesktopOutlined />,
    mobile: <MobileOutlined />,
    tablet: <TabletOutlined />
  };

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      if (filters.search && !log.action.toLowerCase().includes(filters.search.toLowerCase()) &&
          !log.user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !log.user.email.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category !== 'all' && log.category !== filters.category) return false;
      if (filters.severity !== 'all' && log.severity !== filters.severity) return false;
      if (filters.status !== 'all' && log.status !== filters.status) return false;
      if (filters.user !== 'all' && log.user.id !== filters.user) return false;
      if (filters.tenant !== 'all' && log.tenant?.id !== filters.tenant) return false;
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const logDate = dayjs(log.timestamp);
        if (!logDate.isAfter(filters.dateRange[0]) || !logDate.isBefore(filters.dateRange[1])) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filters]);

  const statistics = useMemo(() => {
    if (!filteredLogs) return null;
    
    const total = filteredLogs.length;
    const byCategory = filteredLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = filteredLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const failedCount = filteredLogs.filter(log => log.status === 'failed').length;
    const successRate = total > 0 ? ((total - failedCount) / total * 100).toFixed(1) : 0;
    
    return { total, byCategory, bySeverity, failedCount, successRate };
  }, [filteredLogs]);

  const handleExport = useCallback(() => {
    const dataToExport = selectedLogs.length > 0 
      ? filteredLogs.filter(log => selectedLogs.includes(log.id))
      : filteredLogs;
    
    let content = '';
    const filename = `audit-logs-${dayjs().format('YYYY-MM-DD-HHmmss')}`;
    
    if (exportOptions.format === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
    } else if (exportOptions.format === 'csv') {
      const headers = ['ID', 'Timestamp', 'User', 'Action', 'Category', 'Severity', 'Status', 'IP', 'Device'];
      const rows = dataToExport.map(log => [
        log.id,
        log.timestamp,
        log.user.name,
        log.action,
        log.category,
        log.severity,
        log.status,
        log.ip,
        log.device
      ]);
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${exportOptions.format}`;
    link.click();
    URL.revokeObjectURL(url);
    
    message.success(`${dataToExport.length} logs exported successfully`);
    setExportModal(false);
  }, [filteredLogs, selectedLogs, exportOptions]);

  const columns: ColumnsType<AuditLog> = [
    {
      title: () => (
        <Checkbox
          indeterminate={selectedLogs.length > 0 && selectedLogs.length < filteredLogs.length}
          checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
          onChange={e => {
            setSelectedLogs(e.target.checked ? filteredLogs.map(log => log.id) : []);
          }}
        />
      ),
      key: 'select',
      width: 50,
      fixed: 'left',
      render: (_, record) => (
        <Checkbox
          checked={selectedLogs.includes(record.id)}
          onChange={e => {
            setSelectedLogs(prev => 
              e.target.checked 
                ? [...prev, record.id]
                : prev.filter(id => id !== record.id)
            );
          }}
        />
      )
    },
    {
      title: 'Timestamp',
      key: 'timestamp',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(record.timestamp).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.timestamp).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix()
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.user.avatar} icon={<UserOutlined />} size="small" />
          <Space direction="vertical" size={0}>
            <Text strong>{record.user.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.user.role}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            {categoryIcons[record.category]}
            <Text strong>{record.action}</Text>
          </Space>
          {record.resource && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.resource.type}: {record.resource.name}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Category',
      key: 'category',
      width: 120,
      render: (_, record) => (
        <Tag color={severityColors[record.severity]}>
          {record.category.toUpperCase()}
        </Tag>
      ),
      filters: ['auth', 'user', 'tenant', 'system', 'api', 'data', 'security', 'billing'].map(cat => ({
        text: cat.toUpperCase(),
        value: cat
      })),
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Severity',
      key: 'severity',
      width: 100,
      render: (_, record) => {
        const icons = {
          info: <InfoCircleOutlined />,
          warning: <WarningOutlined />,
          error: <CloseCircleOutlined />,
          critical: <CloseCircleOutlined />
        };
        return (
          <Tag icon={icons[record.severity]} color={severityColors[record.severity]}>
            {record.severity.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Space>
          {statusIcons[record.status]}
          <Text>{record.status}</Text>
        </Space>
      )
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <Space>
          {deviceIcons[record.device]}
          {record.location ? (
            <Tooltip title={`${record.location.city}, ${record.location.country}`}>
              <Space size={4}>
                <GlobalOutlined />
                <Text type="secondary">{record.location.city}</Text>
              </Space>
            </Tooltip>
          ) : (
            <Text type="secondary">{record.ip}</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setDetailsModal({ visible: true, log: record })}
            />
          </Tooltip>
          {record.details && (
            <Tooltip title="Has Additional Data">
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  const renderTimeline = () => {
    const groupedLogs = filteredLogs.reduce((acc, log) => {
      const date = dayjs(log.timestamp).format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {} as Record<string, AuditLog[]>);

    return (
      <div className="audit-timeline">
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date} className="timeline-section">
            <Title level={5} style={{ marginBottom: 16 }}>
              {dayjs(date).format('DD MMMM YYYY')}
            </Title>
            <Timeline mode="left">
              {logs.map(log => (
                <Timeline.Item
                  key={log.id}
                  dot={statusIcons[log.status]}
                  color={severityColors[log.severity]}
                >
                  <Card 
                    size="small" 
                    className="timeline-card"
                    onClick={() => setDetailsModal({ visible: true, log })}
                    hoverable
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <Avatar src={log.user.avatar} icon={<UserOutlined />} size="small" />
                          <Text strong>{log.user.name}</Text>
                        </Space>
                        <Text type="secondary">{dayjs(log.timestamp).format('HH:mm:ss')}</Text>
                      </Space>
                      <Space>
                        {categoryIcons[log.category]}
                        <Text>{log.action}</Text>
                      </Space>
                      {log.resource && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {log.resource.type}: {log.resource.name}
                        </Text>
                      )}
                      <Space>
                        <Tag color={severityColors[log.severity]} style={{ margin: 0 }}>
                          {log.severity.toUpperCase()}
                        </Tag>
                        {log.tenant && (
                          <Tag color="blue" style={{ margin: 0 }}>
                            {log.tenant.name}
                          </Tag>
                        )}
                      </Space>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="audit-logs-page">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="stats-card">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Logs"
                  value={statistics?.total || 0}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Failed Actions"
                  value={statistics?.failedCount || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Success Rate"
                  value={statistics?.successRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="category-distribution">
                  <Text type="secondary">Category Distribution</Text>
                  <div style={{ marginTop: 8 }}>
                    {statistics?.byCategory && Object.entries(statistics.byCategory).map(([cat, count]) => (
                      <Tag key={cat} style={{ marginBottom: 4 }}>
                        {cat}: {count}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
              <Space wrap>
                <Search
                  placeholder="Search logs..."
                  style={{ width: 250 }}
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  prefix={<SearchOutlined />}
                  allowClear
                />
                <Select
                  style={{ width: 150 }}
                  value={filters.category}
                  onChange={value => setFilters(prev => ({ ...prev, category: value }))}
                  placeholder="Category"
                >
                  <Option value="all">All Categories</Option>
                  {['auth', 'user', 'tenant', 'system', 'api', 'data', 'security', 'billing'].map(cat => (
                    <Option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 130 }}
                  value={filters.severity}
                  onChange={value => setFilters(prev => ({ ...prev, severity: value }))}
                  placeholder="Severity"
                >
                  <Option value="all">All Severity</Option>
                  {['info', 'warning', 'error', 'critical'].map(sev => (
                    <Option key={sev} value={sev}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 120 }}
                  value={filters.status}
                  onChange={value => setFilters(prev => ({ ...prev, status: value }))}
                  placeholder="Status"
                >
                  <Option value="all">All Status</Option>
                  <Option value="success">Success</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="pending">Pending</Option>
                </Select>
                <RangePicker
                  value={filters.dateRange}
                  onChange={dates => setFilters(prev => ({ ...prev, dateRange: dates as any }))}
                  format="DD/MM/YYYY"
                />
              </Space>
              <Space>
                <Button.Group>
                  <Button
                    type={viewMode === 'table' ? 'primary' : 'default'}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                  <Button
                    type={viewMode === 'timeline' ? 'primary' : 'default'}
                    onClick={() => setViewMode('timeline')}
                  >
                    Timeline
                  </Button>
                </Button.Group>
                {selectedLogs.length > 0 && (
                  <Badge count={selectedLogs.length} offset={[-5, 5]}>
                    <Button icon={<DeleteOutlined />} danger>
                      Delete Selected
                    </Button>
                  </Badge>
                )}
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => setExportModal(true)}
                >
                  Export
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Space>

            <AnimatePresence mode="wait">
              {viewMode === 'table' ? (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Table
                    columns={columns}
                    dataSource={filteredLogs}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1500 }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `Total ${total} logs`,
                      defaultPageSize: 20
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {renderTimeline()}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Log Details"
        visible={detailsModal.visible}
        onCancel={() => setDetailsModal({ visible: false, log: null })}
        footer={null}
        width={700}
      >
        {detailsModal.log && (
          <div className="log-details">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Log ID" span={2}>
                <Text copyable>{detailsModal.log.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp" span={2}>
                {dayjs(detailsModal.log.timestamp).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="User">
                <Space>
                  <Avatar src={detailsModal.log.user.avatar} icon={<UserOutlined />} />
                  {detailsModal.log.user.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {detailsModal.log.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {detailsModal.log.user.role}
              </Descriptions.Item>
              <Descriptions.Item label="Tenant">
                {detailsModal.log.tenant?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Action" span={2}>
                <Space>
                  {categoryIcons[detailsModal.log.category]}
                  {detailsModal.log.action}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color={severityColors[detailsModal.log.severity]}>
                  {detailsModal.log.category.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <Tag color={severityColors[detailsModal.log.severity]}>
                  {detailsModal.log.severity.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Space>
                  {statusIcons[detailsModal.log.status]}
                  {detailsModal.log.status}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {detailsModal.log.duration ? `${detailsModal.log.duration}ms` : 'N/A'}
              </Descriptions.Item>
              {detailsModal.log.resource && (
                <>
                  <Descriptions.Item label="Resource Type">
                    {detailsModal.log.resource.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="Resource ID">
                    {detailsModal.log.resource.id}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="IP Address">
                {detailsModal.log.ip}
              </Descriptions.Item>
              <Descriptions.Item label="Device">
                <Space>
                  {deviceIcons[detailsModal.log.device]}
                  {detailsModal.log.device}
                </Space>
              </Descriptions.Item>
              {detailsModal.log.location && (
                <Descriptions.Item label="Location" span={2}>
                  <Space>
                    <GlobalOutlined />
                    {detailsModal.log.location.city}, {detailsModal.log.location.country}
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="User Agent" span={2}>
                <Text style={{ fontSize: 12 }}>{detailsModal.log.userAgent}</Text>
              </Descriptions.Item>
            </Descriptions>
            
            {detailsModal.log.details && (
              <>
                <Divider>Additional Details</Divider>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {JSON.stringify(detailsModal.log.details, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Export Logs"
        visible={exportModal}
        onOk={handleExport}
        onCancel={() => setExportModal(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Export Format:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={exportOptions.format}
              onChange={value => setExportOptions(prev => ({ ...prev, format: value }))}
            >
              <Option value="json">JSON</Option>
              <Option value="csv">CSV</Option>
            </Select>
          </div>
          <div>
            <Checkbox
              checked={exportOptions.includeDetails}
              onChange={e => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
            >
              Include detailed information
            </Checkbox>
          </div>
          <div>
            <Checkbox
              checked={exportOptions.dateRange}
              onChange={e => setExportOptions(prev => ({ ...prev, dateRange: e.target.checked }))}
            >
              Apply current date range filter
            </Checkbox>
          </div>
          {selectedLogs.length > 0 && (
            <Alert
              message={`${selectedLogs.length} logs selected for export`}
              type="info"
              showIcon
            />
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default AuditLogs;