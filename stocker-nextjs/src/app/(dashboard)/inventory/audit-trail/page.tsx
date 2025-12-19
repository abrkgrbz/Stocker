'use client';

import React, { useState } from 'react';
import {
  Table,
  Space,
  Tag,
  Select,
  DatePicker,
  Input,
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
  Button,
} from 'antd';
import {
  AuditOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined,
  EyeOutlined,
  SyncOutlined,
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
  AuditSummaryByUserDto,
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

const { RangePicker } = DatePicker;

// Action colors for tags (monochrome)
const actionColors: Record<string, string> = {
  Created: 'default',
  Updated: 'processing',
  Deleted: 'error',
  Activated: 'success',
  Deactivated: 'warning',
  StatusChanged: 'processing',
  QuantityAdjusted: 'processing',
  PriceChanged: 'warning',
  Transferred: 'processing',
  Reserved: 'warning',
  Released: 'success',
  Counted: 'processing',
  Approved: 'success',
  Rejected: 'error',
  Received: 'success',
  Shipped: 'processing',
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
  const { data: auditLogsData, isLoading: logsLoading, refetch: refetchLogs } = useAuditLogs(filter);
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useAuditDashboard(dashboardDays);
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
      pageNumber: 1,
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
            <span className="font-medium text-slate-900">{dayjs(timestamp).format('DD.MM.YYYY')}</span>
            <span className="text-xs text-slate-500">{dayjs(timestamp).format('HH:mm:ss')}</span>
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
          <Tag className="!bg-slate-100 !text-slate-700 !border-slate-200">
            {InventoryEntityTypeLabels[record.entityType as keyof typeof InventoryEntityTypeLabels] || record.entityType}
          </Tag>
          <span className="text-sm text-slate-600">{record.entityName}</span>
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
      title: 'Kullanıcı',
      key: 'user',
      width: 160,
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} className="!bg-slate-200" />
          <Space direction="vertical" size={0}>
            <span className="text-slate-900">{record.userName}</span>
            {record.userEmail && (
              <span className="text-xs text-slate-500">{record.userEmail}</span>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Değişiklikler',
      key: 'changes',
      width: 200,
      render: (_, record) => {
        if (!record.changes || record.changes.length === 0) {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <Space direction="vertical" size={0}>
            {record.changes.slice(0, 2).map((change, idx) => (
              <span key={idx} className="text-xs text-slate-600">
                <strong>{change.fieldLabel}</strong>: {change.oldValue || '-'} → {change.newValue || '-'}
              </span>
            ))}
            {record.changes.length > 2 && (
              <span className="text-xs text-slate-400">+{record.changes.length - 2} daha...</span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Detay">
            <a onClick={() => openDetailModal(record)} className="text-slate-600 hover:text-slate-900">
              <EyeOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Geçmiş">
            <a onClick={() => openHistoryModal(record.entityType, record.entityId)} className="text-slate-600 hover:text-slate-900">
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
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      );
    }

    if (!dashboardData) {
      return <Empty description="Veri bulunamadı" />;
    }

    return (
      <div className="space-y-6">
        {/* Period selector */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <Space>
            <span className="text-sm text-slate-600">Zaman Aralığı:</span>
            <Select
              value={dashboardDays}
              onChange={setDashboardDays}
              style={{ width: 150 }}
              className="[&_.ant-select-selector]:!border-slate-300"
              options={[
                { value: 7, label: 'Son 7 Gün' },
                { value: 14, label: 'Son 14 Gün' },
                { value: 30, label: 'Son 30 Gün' },
                { value: 60, label: 'Son 60 Gün' },
                { value: 90, label: 'Son 90 Gün' },
              ]}
            />
          </Space>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <AuditOutlined className="mr-2" />
                Toplam Log
              </p>
              <div className="text-3xl font-bold text-slate-900">
                {dashboardData.totalAuditLogs.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <CalendarOutlined className="mr-2" />
                Bugün
              </p>
              <div className="text-3xl font-bold text-slate-900">
                {dashboardData.todayCount.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <BarChartOutlined className="mr-2" />
                Bu Hafta
              </p>
              <div className="text-3xl font-bold text-slate-900">
                {dashboardData.thisWeekCount.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <GlobalOutlined className="mr-2" />
                Bu Ay
              </p>
              <div className="text-3xl font-bold text-slate-900">
                {dashboardData.thisMonthCount.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* By Entity Type */}
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FilterOutlined className="text-slate-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Varlık Tipine Göre
                </p>
              </div>
              <Table
                dataSource={dashboardData.byEntityType}
                columns={[
                  {
                    title: 'Varlık Tipi',
                    dataIndex: 'entityTypeLabel',
                    key: 'entityTypeLabel',
                  },
                  {
                    title: 'Toplam',
                    dataIndex: 'totalCount',
                    key: 'totalCount',
                    align: 'center' as const,
                  },
                  {
                    title: 'Oluşturma',
                    dataIndex: 'createdCount',
                    key: 'createdCount',
                    align: 'center' as const,
                    render: (v: number) => <Tag className="!bg-slate-100 !text-slate-700 !border-slate-200">{v}</Tag>,
                  },
                  {
                    title: 'Güncelleme',
                    dataIndex: 'updatedCount',
                    key: 'updatedCount',
                    align: 'center' as const,
                    render: (v: number) => <Tag className="!bg-slate-200 !text-slate-800 !border-slate-300">{v}</Tag>,
                  },
                  {
                    title: 'Silme',
                    dataIndex: 'deletedCount',
                    key: 'deletedCount',
                    align: 'center' as const,
                    render: (v: number) => <Tag className="!bg-slate-900 !text-white !border-slate-900">{v}</Tag>,
                  },
                ]}
                rowKey="entityType"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </div>
          </div>

          {/* Top Users */}
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TeamOutlined className="text-slate-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  En Aktif Kullanıcılar
                </p>
              </div>
              <List
                dataSource={dashboardData.topUsers}
                renderItem={(user: AuditSummaryByUserDto, index) => (
                  <List.Item className="!border-slate-100">
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          className={index < 3 ? '!bg-slate-900' : '!bg-slate-300'}
                        >
                          {index + 1}
                        </Avatar>
                      }
                      title={<span className="text-slate-900">{user.userName}</span>}
                      description={
                        <Space>
                          <Badge count={user.totalActions} showZero className="[&_.ant-badge-count]:!bg-slate-900" />
                          <span className="text-slate-500">işlem</span>
                          {user.lastActivityDate && (
                            <span className="text-xs text-slate-400">
                              - Son: {dayjs(user.lastActivityDate).fromNow()}
                            </span>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HistoryOutlined className="text-slate-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Son Aktiviteler
            </p>
          </div>
          <Timeline
            items={dashboardData.recentActivities.slice(0, 10).map((activity) => ({
              color: actionColors[activity.action] === 'error' ? 'red' :
                     actionColors[activity.action] === 'success' ? 'green' :
                     actionColors[activity.action] === 'processing' ? 'blue' : 'gray',
              children: (
                <Space direction="vertical" size={0}>
                  <Space>
                    <Tag
                      color={actionColors[activity.action] || 'default'}
                      style={{ fontSize: 11 }}
                    >
                      {activity.actionLabel}
                    </Tag>
                    <span className="font-medium text-slate-900">
                      {InventoryEntityTypeLabels[activity.entityType as keyof typeof InventoryEntityTypeLabels] || activity.entityType}
                    </span>
                    <span className="text-slate-600">- {activity.entityName}</span>
                  </Space>
                  <span className="text-xs text-slate-500">
                    {activity.userName} - {dayjs(activity.timestamp).fromNow()}
                  </span>
                </Space>
              ),
            }))}
          />
        </div>
      </div>
    );
  };

  // Render logs tab
  const renderLogs = () => {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <Select
                placeholder="Varlık Tipi"
                allowClear
                style={{ width: '100%' }}
                value={filter.entityType}
                onChange={(value) => handleFilterChange('entityType', value)}
                options={Object.entries(entityTypes || InventoryEntityTypeLabels).map(([key, label]) => ({
                  value: key,
                  label: label,
                }))}
                className="[&_.ant-select-selector]:!border-slate-300"
              />
            </div>
            <div className="col-span-3">
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
                className="[&_.ant-select-selector]:!border-slate-300"
              />
            </div>
            <div className="col-span-3">
              <Input
                placeholder="Varlık ID"
                allowClear
                value={filter.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                prefix={<SearchOutlined className="text-slate-400" />}
                className="[&_.ant-input]:!border-slate-300"
              />
            </div>
            <div className="col-span-3">
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Başlangıç', 'Bitiş']}
                onChange={handleDateRangeChange}
                format="DD.MM.YYYY"
                className="[&_.ant-picker-input_input]:!text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
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
              showTotal: (total) => `Toplam ${total} kayıt`,
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
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
          />
        </div>
      </div>
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
            Log Detayı
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
            <Descriptions.Item label="Varlık Tipi">
              <Tag className="!bg-slate-100 !text-slate-700 !border-slate-200">
                {InventoryEntityTypeLabels[selectedLog.entityType as keyof typeof InventoryEntityTypeLabels] || selectedLog.entityType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Varlık ID">{selectedLog.entityId}</Descriptions.Item>
            <Descriptions.Item label="Varlık Adı" span={2}>{selectedLog.entityName}</Descriptions.Item>
            <Descriptions.Item label="Eylem">
              <Tag color={actionColors[selectedLog.action] || 'default'}>
                {selectedLog.actionLabel || selectedLog.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kullanıcı">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} className="!bg-slate-200" />
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
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Değişiklikler</p>
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
                    title: 'Eski Değer',
                    dataIndex: 'oldValue',
                    key: 'oldValue',
                    render: (v) => v || <span className="text-slate-400">-</span>,
                  },
                  {
                    title: 'Yeni Değer',
                    dataIndex: 'newValue',
                    key: 'newValue',
                    render: (v) => v || <span className="text-slate-400">-</span>,
                  },
                ]}
                rowKey="fieldName"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </div>
          )}

          {selectedLog.oldValues && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Eski Değerler (JSON)</p>
              <pre className="text-xs max-h-48 overflow-auto bg-slate-50 p-3 rounded-lg">
                {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
              </pre>
            </div>
          )}

          {selectedLog.newValues && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Yeni Değerler (JSON)</p>
              <pre className="text-xs max-h-48 overflow-auto bg-slate-50 p-3 rounded-lg">
                {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
              </pre>
            </div>
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
            Varlık Geçmişi
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
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : entityHistoryData ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Varlık Tipi">
                <Tag className="!bg-slate-100 !text-slate-700 !border-slate-200">
                  {InventoryEntityTypeLabels[entityHistoryData.entityType as keyof typeof InventoryEntityTypeLabels] || entityHistoryData.entityType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Varlık ID">{entityHistoryData.entityId}</Descriptions.Item>
              <Descriptions.Item label="Varlık Adı" span={2}>{entityHistoryData.entityName}</Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(entityHistoryData.createdAt).format('DD.MM.YYYY HH:mm')} - {entityHistoryData.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {entityHistoryData.lastModifiedAt
                  ? `${dayjs(entityHistoryData.lastModifiedAt).format('DD.MM.YYYY HH:mm')} - ${entityHistoryData.lastModifiedBy}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Değişiklik" span={2}>
                <Badge count={entityHistoryData.totalChanges} showZero className="[&_.ant-badge-count]:!bg-slate-900" />
              </Descriptions.Item>
            </Descriptions>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Değişiklik Geçmişi</p>
              <Timeline
                items={entityHistoryData.changes.map((change) => ({
                  color: actionColors[change.action] === 'error' ? 'red' :
                         actionColors[change.action] === 'success' ? 'green' :
                         actionColors[change.action] === 'processing' ? 'blue' : 'gray',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Tag color={actionColors[change.action] || 'default'}>
                          {change.actionLabel}
                        </Tag>
                        <span className="text-slate-500">
                          {dayjs(change.timestamp).format('DD.MM.YYYY HH:mm:ss')}
                        </span>
                      </Space>
                      <span className="text-slate-900">{change.userName}</span>
                      {change.changes && change.changes.length > 0 && (
                        <div className="mt-1">
                          {change.changes.map((c, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="text-slate-500">{c.fieldLabel}:</span>{' '}
                              <span className="line-through text-slate-400">{c.oldValue || '-'}</span>{' '}
                              → <span className="font-medium text-slate-900">{c.newValue || '-'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Space>
                  ),
                }))}
              />
            </div>
          </Space>
        ) : (
          <Empty description="Geçmiş bulunamadı" />
        )}
      </Modal>
    );
  };

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span>
          <BarChartOutlined /> Dashboard
        </span>
      ),
      children: renderDashboard(),
    },
    {
      key: 'logs',
      label: (
        <span>
          <AuditOutlined /> Log Kayıtları
        </span>
      ),
      children: renderLogs(),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            <AuditOutlined className="mr-3" />
            Envanter Denetim İzi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Envanter sistemindeki tüm değişiklikleri, kullanıcı aktivitelerini ve geçmiş kayıtları görüntüleyebilirsiniz.
          </p>
        </div>
        <Space>
          <Button
            icon={<SyncOutlined spin={logsLoading || dashboardLoading} />}
            onClick={() => {
              refetchLogs();
              refetchDashboard();
            }}
            className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
          >
            Yenile
          </Button>
        </Space>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />
      </div>

      {/* Modals */}
      {renderDetailModal()}
      {renderHistoryModal()}
    </div>
  );
}
