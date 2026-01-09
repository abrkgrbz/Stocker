'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Empty,
  Tooltip,
  Modal,
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
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

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { confirm } = Modal;

// Trigger type labels - Synced with backend WorkflowTriggerType enum
const triggerTypeLabels: Record<WorkflowTriggerType, { label: string }> = {
  Manual: { label: 'Manuel' },
  EntityCreated: { label: 'Kayit Olusturuldugunda' },
  EntityUpdated: { label: 'Kayit Guncellendiginde' },
  StatusChanged: { label: 'Durum Degistiginde' },
  DealStageChanged: { label: 'Anlasma Asamasi Degistiginde' },
  Scheduled: { label: 'Zamanlanmis' },
  FieldCondition: { label: 'Alan Kosulu' },
  AmountThreshold: { label: 'Tutar Esigi' },
  DueDateEvent: { label: 'Vade Tarihi' },
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Stats calculations
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.isActive).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0);
  const successRate = totalExecutions > 0
    ? Math.round((workflows.filter(w => w.executionCount > 0).length / workflows.length) * 100) || 0
    : 0;

  // Load all workflows
  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getWorkflows();
      setWorkflows(data);
      setLoading(false);
    } catch (error) {
      showApiError(error, 'Workflows yuklenemedi');
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
      content: 'Bu workflow\'u silmek istediginize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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
      title: 'Workflow Adi',
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
      render: (entityType: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {entityType}
        </span>
      ),
    },
    {
      title: 'Trigger',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 200,
      render: (triggerType: WorkflowTriggerType) => {
        const config = triggerTypeLabels[triggerType] || { label: triggerType };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? (
            <BoltIcon className="w-3.5 h-3.5" />
          ) : (
            <XCircleIcon className="w-3.5 h-3.5" />
          )}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Adimlar',
      dataIndex: 'steps',
      key: 'steps',
      width: 100,
      render: (steps: any[]) => (
        <span className="text-slate-600">{steps?.length || 0} adim</span>
      ),
    },
    {
      title: 'Calistirma',
      dataIndex: 'executionCount',
      key: 'executionCount',
      width: 120,
      render: (count: number, record: WorkflowDto) => (
        <div className="flex flex-col">
          <span className="text-slate-900 font-medium">{count} kez</span>
          {record.lastExecutedAt && (
            <span className="text-xs text-slate-500">
              {dayjs(record.lastExecutedAt).fromNow()}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_: any, record: WorkflowDto) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Detaylari Goruntule">
            <Button
              type="text"
              size="small"
              icon={<EyeIcon className="w-4 h-4" />}
              onClick={() => handleView(record.id)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deaktif Et' : 'Aktif Et'}>
            <Button
              type="text"
              size="small"
              icon={record.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              onClick={() => record.isActive ? handleDeactivate(record.id) : handleActivate(record.id)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              size="small"
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={() => handleDelete(record.id)}
              className="!text-red-500 hover:!text-red-600"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={loading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BoltIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Is Akislari</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Otomasyon is akislarinizi yonetin ve izleyin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => loadWorkflows()}
              disabled={loading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleCreate}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Yeni Is Akisi
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Is Akisi</p>
              <p className="text-2xl font-bold text-slate-900">{totalWorkflows}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{activeWorkflows}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Calistirma Sayisi</p>
              <p className="text-2xl font-bold text-slate-900">{totalExecutions.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Basari Orani</p>
              <p className="text-2xl font-bold text-slate-900">{successRate}%</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={workflows}
            rowKey="id"
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} is akisi`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <BoltIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz is akisi bulunmuyor
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Otomasyonlarinizi olusturmaya baslayin
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Is Akisini Olustur
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </Spin>
    </div>
  );
}
