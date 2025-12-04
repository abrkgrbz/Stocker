'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Space,
  Tag,
  Select,
  DatePicker,
  Input,
  Statistic,
  Empty,
  Spin,
  Tooltip,
  Modal,
  Descriptions,
  Timeline,
  Badge,
  Tabs,
  List,
  Avatar,
} from 'antd';
import {
  AuditOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  useAuditLogs,
  useAuditDashboard,
  useAuditEntityTypes,
  useAuditActionTypes,
  useEntityHistory,
} from '@/lib/api/hooks/useInventory';
import type {
  InventoryAuditFilterDto,
  InventoryAuditLogDto,
  FieldChangeDto,
  AuditSummaryByEntityDto,
  AuditSummaryByUserDto,
  AuditActivityByDateDto,
} from '@/lib/api/services/inventory.types';
import {
  InventoryEntityTypeLabels,
  InventoryAuditActionLabels,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Action colors for tags
const actionColors: Record<string, string> = {
  Created: 'green',
  Updated: 'blue',
  Deleted: 'red',
  Activated: 'cyan',
  Deactivated: 'orange',
  StatusChanged: 'purple',
  QuantityAdjusted: 'geekblue',
  PriceChanged: 'gold',
  Transferred: 'lime',
  Reserved: 'volcano',
  Released: 'magenta',
  Counted: 'processing',
  Approved: 'success',
  Rejected: 'error',
  Received: 'green',
  Shipped: 'blue',
  Completed: 'success',
  Cancelled: 'default',
};

// Action icons
const actionIcons: Record<string, React.ReactNode> = {
  Created: <PlusCircleOutlined />,
  Updated: <EditOutlined />,
  Deleted: <DeleteOutlined />,
  Activated: <CheckCircleOutlined />,
  Deactivated: <WarningOutlined />,
};

export default function AuditTrailPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState<InventoryAuditFilterDto>({
    pageNumber: 1,
    pageSize: 20,
  });
  const [selectedLog, setSelectedLog] = useState<InventoryAuditLogDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyEntity, setHistoryEntity] = useState<{ type: string; id: string } | null>(null);
  const [dashboardDays, setDashboardDays] = useState(30);

  // Queries
  const { data: auditLogsData, isLoading: logsLoading } = useAuditLogs(filter);
  const { data: dashboardData, isLoading: dashboardLoading } = useAuditDashboard(dashboardDays);
  const { data: entityTypes } = useAuditEntityTypes();
  const { data: actionTypes } = useAuditActionTypes();
  const { data: entityHistoryData, isLoading: historyLoading } = useEntityHistory(
    historyEntity?.type || '',
    historyEntity?.id || ''
  );

  // Handle filter changes
  const handleFilterChange = (key: keyof InventoryAuditFilterDto, value: unknown) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: 1, // Reset to first page on filter change
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setFilter((prev) => ({
      ...prev,
      fromDate: dates?.[0]?.toISOString(),
      toDate: dates?.[1]?.toISOString(),
      pageNumber: 1,
    }));
  };

  // Open detail modal
  const openDetailModal = (log: InventoryAuditLogDto) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  // Open history modal
  const openHistoryModal = (entityType: string, entityId: string) => {
    setHistoryEntity({ type: entityType, id: entityId });
    setHistoryModalVisible(true);
  };

  // Table columns for audit logs
  const columns: ColumnsType<InventoryAuditLogDto> = [
    {
      title: 'Tarih',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')}>
          <Space direction="vertical" size={0}>
            <Text strong>{dayjs(timestamp).format('DD.MM.YYYY')}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(timestamp).format('HH:mm:ss')}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Varlık',
      key: 'entity',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">
            {InventoryEntityTypeLabels[record.entityType as keyof typeof InventoryEntityTypeLabels] || record.entityType}
          </Tag>
          <Text style={{ fontSize: 13 }}>{record.entityName}</Text>
        </Space>
      ),
    },
    {
      title: 'Eylem',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (action: string, record) => (
        <Tag
          icon={actionIcons[action]}
          color={actionColors[action] || 'default'}
        >
          {record.actionLabel || action}
        </Tag>
      ),
    },
    {
      title: 'Kullanici',
      key: 'user',
      width: 160,
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text>{record.userName}</Text>
            {record.userEmail && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.userEmail}
              </Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Degisiklikler',
      key: 'changes',
      width: 200,
      render: (_, record) => {
        if (!record.changes || record.changes.length === 0) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            {record.changes.slice(0, 2).map((change, idx) => (
              <Text key={idx} style={{ fontSize: 12 }}>
                <strong>{change.fieldLabel}</strong>: {change.oldValue || '-'} → {change.newValue || '-'}
              </Text>
            ))}
            {record.changes.length > 2 && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                +{record.changes.length - 2} daha...
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Detay">
            <a onClick={() => openDetailModal(record)}>
              <EyeOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Gecmis">
            <a onClick={() => openHistoryModal(record.entityType, record.entityId)}>
              <HistoryOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render dashboard tab
  const renderDashboard = () => {
    if (dashboardLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!dashboardData) {
      return <Empty description="Veri bulunamadi" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Period selector */}
        <Card size="small">
          <Space>
            <Text>Zaman Araligi:</Text>
            <Select
              value={dashboardDays}
              onChange={setDashboardDays}
              style={{ width: 150 }}
              options={[
                { value: 7, label: 'Son 7 Gun' },
                { value: 14, label: 'Son 14 Gun' },
                { value: 30, label: 'Son 30 Gun' },
                { value: 60, label: 'Son 60 Gun' },
                { value: 90, label: 'Son 90 Gun' },
              ]}
            />
          </Space>
        </Card>

        {/* KPI Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Toplam Log"
                value={dashboardData.totalAuditLogs}
                prefix={<AuditOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Bugun"
                value={dashboardData.todayCount}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Bu Hafta"
                value={dashboardData.thisWeekCount}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Bu Ay"
                value={dashboardData.thisMonthCount}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* By Entity Type */}
          <Col xs={24} lg={12}>
            <Card title={<Space><FilterOutlined /> Varlik Tipine Gore</Space>} size="small">
              <Table
                dataSource={dashboardData.byEntityType}
                columns={[
                  {
                    title: 'Varlik Tipi',
                    dataIndex: 'entityTypeLabel',
                    key: 'entityTypeLabel',
                  },
                  {
                    title: 'Toplam',
                    dataIndex: 'totalCount',
                    key: 'totalCount',
                    align: 'center',
                  },
                  {
                    title: 'Olusturma',
                    dataIndex: 'createdCount',
                    key: 'createdCount',
                    align: 'center',
                    render: (v) => <Tag color="green">{v}</Tag>,
                  },
                  {
                    title: 'Guncelleme',
                    dataIndex: 'updatedCount',
                    key: 'updatedCount',
                    align: 'center',
                    render: (v) => <Tag color="blue">{v}</Tag>,
                  },
                  {
                    title: 'Silme',
                    dataIndex: 'deletedCount',
                    key: 'deletedCount',
                    align: 'center',
                    render: (v) => <Tag color="red">{v}</Tag>,
                  },
                ]}
                rowKey="entityType"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>

          {/* Top Users */}
          <Col xs={24} lg={12}>
            <Card title={<Space><TeamOutlined /> En Aktif Kullanicilar</Space>} size="small">
              <List
                dataSource={dashboardData.topUsers}
                renderItem={(user: AuditSummaryByUserDto, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: index < 3 ? '#1890ff' : '#d9d9d9',
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      }
                      title={user.userName}
                      description={
                        <Space>
                          <Badge count={user.totalActions} showZero style={{ backgroundColor: '#52c41a' }} />
                          <Text type="secondary">islem</Text>
                          {user.lastActivityDate && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              - Son: {dayjs(user.lastActivityDate).fromNow()}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Activities */}
        <Card title={<Space><HistoryOutlined /> Son Aktiviteler</Space>} size="small">
          <Timeline
            items={dashboardData.recentActivities.slice(0, 10).map((activity) => ({
              color: actionColors[activity.action] === 'red' ? 'red' :
                     actionColors[activity.action] === 'green' ? 'green' :
                     actionColors[activity.action] === 'blue' ? 'blue' : 'gray',
              children: (
                <Space direction="vertical" size={0}>
                  <Space>
                    <Tag
                      color={actionColors[activity.action] || 'default'}
                      style={{ fontSize: 11 }}
                    >
                      {activity.actionLabel}
                    </Tag>
                    <Text strong>
                      {InventoryEntityTypeLabels[activity.entityType as keyof typeof InventoryEntityTypeLabels] || activity.entityType}
                    </Text>
                    <Text>- {activity.entityName}</Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {activity.userName} - {dayjs(activity.timestamp).fromNow()}
                  </Text>
                </Space>
              ),
            }))}
          />
        </Card>
      </Space>
    );
  };

  // Render logs tab
  const renderLogs = () => {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Filters */}
        <Card size="small">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Varlik Tipi"
                allowClear
                style={{ width: '100%' }}
                value={filter.entityType}
                onChange={(value) => handleFilterChange('entityType', value)}
                options={Object.entries(entityTypes || InventoryEntityTypeLabels).map(([key, label]) => ({
                  value: key,
                  label: label,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Eylem"
                allowClear
                style={{ width: '100%' }}
                value={filter.action}
                onChange={(value) => handleFilterChange('action', value)}
                options={Object.entries(actionTypes || InventoryAuditActionLabels).map(([key, label]) => ({
                  value: key,
                  label: label,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Varlik ID"
                allowClear
                value={filter.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Baslangic', 'Bitis']}
                onChange={handleDateRangeChange}
                format="DD.MM.YYYY"
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={auditLogsData?.items || []}
            rowKey="id"
            loading={logsLoading}
            pagination={{
              current: filter.pageNumber,
              pageSize: filter.pageSize,
              total: auditLogsData?.totalCount || 0,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayit`,
              onChange: (page, pageSize) => {
                setFilter((prev) => ({
                  ...prev,
                  pageNumber: page,
                  pageSize: pageSize,
                }));
              },
            }}
            scroll={{ x: 1100 }}
            size="small"
          />
        </Card>
      </Space>
    );
  };

  // Detail modal content
  const renderDetailModal = () => {
    if (!selectedLog) return null;

    return (
      <Modal
        title={
          <Space>
            <AuditOutlined />
            Log Detayi
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="Tarih">
              {dayjs(selectedLog.timestamp).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Varlik Tipi">
              <Tag color="blue">
                {InventoryEntityTypeLabels[selectedLog.entityType as keyof typeof InventoryEntityTypeLabels] || selectedLog.entityType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Varlik ID">{selectedLog.entityId}</Descriptions.Item>
            <Descriptions.Item label="Varlik Adi" span={2}>{selectedLog.entityName}</Descriptions.Item>
            <Descriptions.Item label="Eylem">
              <Tag color={actionColors[selectedLog.action] || 'default'}>
                {selectedLog.actionLabel || selectedLog.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kullanici">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                {selectedLog.userName}
              </Space>
            </Descriptions.Item>
            {selectedLog.userEmail && (
              <Descriptions.Item label="E-posta" span={2}>{selectedLog.userEmail}</Descriptions.Item>
            )}
            {selectedLog.ipAddress && (
              <Descriptions.Item label="IP Adresi">{selectedLog.ipAddress}</Descriptions.Item>
            )}
          </Descriptions>

          {selectedLog.changes && selectedLog.changes.length > 0 && (
            <Card title="Degisiklikler" size="small">
              <Table
                dataSource={selectedLog.changes}
                columns={[
                  {
                    title: 'Alan',
                    dataIndex: 'fieldLabel',
                    key: 'fieldLabel',
                    width: 150,
                  },
                  {
                    title: 'Eski Deger',
                    dataIndex: 'oldValue',
                    key: 'oldValue',
                    render: (v) => v || <Text type="secondary">-</Text>,
                  },
                  {
                    title: 'Yeni Deger',
                    dataIndex: 'newValue',
                    key: 'newValue',
                    render: (v) => v || <Text type="secondary">-</Text>,
                  },
                ]}
                rowKey="fieldName"
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {selectedLog.oldValues && (
            <Card title="Eski Degerler (JSON)" size="small">
              <pre style={{ fontSize: 11, maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
              </pre>
            </Card>
          )}

          {selectedLog.newValues && (
            <Card title="Yeni Degerler (JSON)" size="small">
              <pre style={{ fontSize: 11, maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
              </pre>
            </Card>
          )}
        </Space>
      </Modal>
    );
  };

  // History modal content
  const renderHistoryModal = () => {
    return (
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Varlik Gecmisi
          </Space>
        }
        open={historyModalVisible}
        onCancel={() => {
          setHistoryModalVisible(false);
          setHistoryEntity(null);
        }}
        footer={null}
        width={800}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : entityHistoryData ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Varlik Tipi">
                <Tag color="blue">
                  {InventoryEntityTypeLabels[entityHistoryData.entityType as keyof typeof InventoryEntityTypeLabels] || entityHistoryData.entityType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Varlik ID">{entityHistoryData.entityId}</Descriptions.Item>
              <Descriptions.Item label="Varlik Adi" span={2}>{entityHistoryData.entityName}</Descriptions.Item>
              <Descriptions.Item label="Olusturulma">
                {dayjs(entityHistoryData.createdAt).format('DD.MM.YYYY HH:mm')} - {entityHistoryData.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Son Guncelleme">
                {entityHistoryData.lastModifiedAt
                  ? `${dayjs(entityHistoryData.lastModifiedAt).format('DD.MM.YYYY HH:mm')} - ${entityHistoryData.lastModifiedBy}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Degisiklik" span={2}>
                <Badge count={entityHistoryData.totalChanges} showZero style={{ backgroundColor: '#1890ff' }} />
              </Descriptions.Item>
            </Descriptions>

            <Card title="Degisiklik Gecmisi" size="small">
              <Timeline
                items={entityHistoryData.changes.map((change) => ({
                  color: actionColors[change.action] === 'red' ? 'red' :
                         actionColors[change.action] === 'green' ? 'green' :
                         actionColors[change.action] === 'blue' ? 'blue' : 'gray',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Tag color={actionColors[change.action] || 'default'}>
                          {change.actionLabel}
                        </Tag>
                        <Text type="secondary">
                          {dayjs(change.timestamp).format('DD.MM.YYYY HH:mm:ss')}
                        </Text>
                      </Space>
                      <Text>{change.userName}</Text>
                      {change.changes && change.changes.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {change.changes.map((c, idx) => (
                            <div key={idx} style={{ fontSize: 12 }}>
                              <Text type="secondary">{c.fieldLabel}:</Text>{' '}
                              <Text delete>{c.oldValue || '-'}</Text>{' '}
                              → <Text strong>{c.newValue || '-'}</Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </Space>
                  ),
                }))}
              />
            </Card>
          </Space>
        ) : (
          <Empty description="Gecmis bulunamadi" />
        )}
      </Modal>
    );
  };

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <Space>
          <BarChartOutlined />
          Dashboard
        </Space>
      ),
      children: renderDashboard(),
    },
    {
      key: 'logs',
      label: (
        <Space>
          <AuditOutlined />
          Log Kayitlari
        </Space>
      ),
      children: renderLogs(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            <AuditOutlined /> Envanter Denetim Izi
          </Title>
          <Paragraph type="secondary">
            Envanter sistemindeki tum degisiklikleri, kullanici aktivitelerini ve gecmis kayitlari goruntuleyebilirsiniz.
          </Paragraph>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>
      </Space>

      {/* Modals */}
      {renderDetailModal()}
      {renderHistoryModal()}
    </div>
  );
}
