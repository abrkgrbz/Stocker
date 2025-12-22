'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Empty,
  Tooltip,
  Modal,
  Spin,
} from 'antd';
import {
  ThunderboltOutlined,
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type {
  WorkflowDto,
  WorkflowTriggerType,
  WorkflowActionType,
} from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { useRouter } from 'next/navigation';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { confirm } = Modal;

// Trigger type labels - Synced with backend WorkflowTriggerType enum
const triggerTypeLabels: Record<WorkflowTriggerType, { label: string; color: string }> = {
  Manual: { label: 'Manuel', color: 'default' },
  EntityCreated: { label: 'Kayıt Oluşturulduğunda', color: 'blue' },
  EntityUpdated: { label: 'Kayıt Güncellendiğinde', color: 'cyan' },
  StatusChanged: { label: 'Durum Değiştiğinde', color: 'purple' },
  DealStageChanged: { label: 'Anlaşma Aşaması Değiştiğinde', color: 'geekblue' },
  Scheduled: { label: 'Zamanlanmış', color: 'orange' },
  FieldCondition: { label: 'Alan Koşulu', color: 'volcano' },
  AmountThreshold: { label: 'Tutar Eşiği', color: 'gold' },
  DueDateEvent: { label: 'Vade Tarihi', color: 'magenta' },
};

// Action type labels
const actionTypeLabels: Record<WorkflowActionType, string> = {
  SendEmail: 'E-posta Gönder',
  SendSMS: 'SMS Gönder',
  CreateTask: 'Görev Oluştur',
  UpdateField: 'Alan Güncelle',
  SendNotification: 'Bildirim Gönder',
  CallWebhook: 'Webhook Çağır',
  CreateActivity: 'Aktivite Oluştur',
  AssignToUser: 'Kullanıcıya Ata',
};

// Workflows stats component
interface WorkflowsStatsProps {
  workflows: WorkflowDto[];
  loading: boolean;
}

function WorkflowsStats({ workflows, loading }: WorkflowsStatsProps) {
  const stats = React.useMemo(() => {
    const total = workflows.length;
    const active = workflows.filter(w => w.isActive).length;
    const totalExecutions = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0);
    const successRate = totalExecutions > 0
      ? Math.round((workflows.filter(w => w.executionCount > 0).length / workflows.length) * 100)
      : 0;

    return { total, active, totalExecutions, successRate };
  }, [workflows]);

  const statCards = [
    {
      title: 'Toplam İş Akışı',
      value: stats.total,
      icon: <ThunderboltOutlined className="text-xl" />,
      color: 'bg-slate-50 text-slate-700',
    },
    {
      title: 'Aktif',
      value: stats.active,
      icon: <CheckCircleOutlined className="text-xl" />,
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Çalıştırma Sayısı',
      value: stats.totalExecutions,
      icon: <ClockCircleOutlined className="text-xl" />,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Başarı Oranı',
      value: `${stats.successRate}%`,
      icon: <PercentageOutlined className="text-xl" />,
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">{stat.title}</span>
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all workflows
  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getWorkflows();
      setWorkflows(data);
      setLoading(false);
    } catch (error) {
      showApiError(error, 'Workflows yüklenemedi');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWorkflows();
  }, []);

  // Handle activate workflow
  const handleActivate = async (id: number) => {
    try {
      await CRMService.activateWorkflow(id);
      showSuccess('Workflow aktif edildi');
      loadWorkflows();
    } catch (error) {
      showApiError(error, 'Workflow aktif edilemedi');
    }
  };

  // Handle deactivate workflow
  const handleDeactivate = async (id: number) => {
    try {
      await CRMService.deactivateWorkflow(id);
      showSuccess('Workflow deaktif edildi');
      loadWorkflows();
    } catch (error) {
      showApiError(error, 'Workflow deaktif edilemedi');
    }
  };

  // Handle delete workflow
  const handleDelete = (id: number) => {
    confirm({
      title: 'Workflow Sil',
      content: 'Bu workflow\'u silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      async onOk() {
        try {
          await CRMService.deleteWorkflow(id);
          showSuccess('Workflow silindi');
          loadWorkflows();
        } catch (error) {
          showApiError(error, 'Workflow silinemedi');
        }
      },
    });
  };

  // Handle view workflow details
  const handleView = (id: number) => {
    router.push(`/crm/workflows/${id}`);
  };

  // Navigation handlers
  const handleCreate = () => {
    router.push('/crm/workflows/new');
  };

  // Table columns
  const columns: ColumnsType<WorkflowDto> = [
    {
      title: 'Workflow Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: WorkflowDto) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{name}</span>
          {record.description && (
            <span className="text-xs text-slate-500">
              {record.description}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Entity Tipi',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (entityType: string) => <Tag color="blue">{entityType}</Tag>,
    },
    {
      title: 'Trigger',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 180,
      render: (triggerType: WorkflowTriggerType) => {
        const config = triggerTypeLabels[triggerType] || { label: triggerType, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'} icon={isActive ? <ThunderboltOutlined /> : undefined}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Adımlar',
      dataIndex: 'steps',
      key: 'steps',
      width: 100,
      render: (steps: any[]) => (
        <span className="text-slate-600">{steps?.length || 0} adım</span>
      ),
    },
    {
      title: 'Çalıştırma',
      dataIndex: 'executionCount',
      key: 'executionCount',
      width: 120,
      render: (count: number, record: WorkflowDto) => (
        <div className="flex flex-col">
          <span className="text-slate-900">{count} kez</span>
          {record.lastExecutedAt && (
            <span className="text-xs text-slate-500">
              {dayjs(record.lastExecutedAt).fromNow()}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_: any, record: WorkflowDto) => (
        <Space size="small">
          <Tooltip title="Detayları Görüntüle">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deaktif Et' : 'Aktif Et'}>
            <Button
              type="text"
              size="small"
              icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => record.isActive ? handleDeactivate(record.id) : handleActivate(record.id)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <WorkflowsStats workflows={workflows} loading={loading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ThunderboltOutlined />}
        iconColor="#0f172a"
        title="İş Akışları"
        description="Otomasyon iş akışlarınızı yönetin"
        itemCount={workflows.length}
        primaryAction={{
          label: 'Yeni İş Akışı',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => loadWorkflows()}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Table */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={workflows}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} iş akışı`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Henüz iş akışı bulunmuyor"
                >
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    İlk İş Akışını Oluştur
                  </Button>
                </Empty>
              ),
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
