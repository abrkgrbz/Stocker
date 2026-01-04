'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Modal, Form, Input, Button, Dropdown, DatePicker, Progress } from 'antd';
import {
  ArrowPathIcon,
  CalculatorIcon,
  PlusIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  useCycleCounts,
  useWarehouses,
  useCreateCycleCount,
  useStartCycleCount,
  useCompleteCycleCount,
} from '@/lib/api/hooks/useInventory';
import type { CycleCountDto, CycleCountStatus, CreateCycleCountDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const statusConfig: Record<CycleCountStatus, { color: string; label: string }> = {
  Scheduled: { color: 'default', label: 'Planlandı' },
  InProgress: { color: 'blue', label: 'Devam Ediyor' },
  Completed: { color: 'green', label: 'Tamamlandı' },
  Cancelled: { color: 'red', label: 'İptal Edildi' },
};

export default function CycleCountsPage() {
  const [selectedStatus, setSelectedStatus] = useState<CycleCountStatus | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState<CycleCountDto | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: cycleCounts = [], isLoading, refetch } = useCycleCounts({ status: selectedStatus, warehouseId: selectedWarehouse });
  const createCount = useCreateCycleCount();
  const startCount = useStartCycleCount();
  const completeCount = useCompleteCycleCount();

  // Stats
  const stats = useMemo(() => {
    const total = cycleCounts.length;
    const scheduled = cycleCounts.filter(c => c.status === 'Scheduled').length;
    const inProgress = cycleCounts.filter(c => c.status === 'InProgress').length;
    const completed = cycleCounts.filter(c => c.status === 'Completed').length;
    return { total, scheduled, inProgress, completed };
  }, [cycleCounts]);

  // Handlers
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleViewDetail = (count: CycleCountDto) => {
    setSelectedCount(count);
    setDetailModalOpen(true);
  };

  const handleStart = async (count: CycleCountDto) => {
    const confirmed = await confirmAction(
      'Sayımı Başlat',
      `"${count.countNumber}" sayımını başlatmak istediğinizden emin misiniz?`,
      'Başlat'
    );
    if (confirmed) {
      try {
        await startCount.mutateAsync(count.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleComplete = async (count: CycleCountDto) => {
    const confirmed = await confirmAction(
      'Sayımı Tamamla',
      `"${count.countNumber}" sayımını tamamlamak istediğinizden emin misiniz?`,
      'Tamamla'
    );
    if (confirmed) {
      try {
        await completeCount.mutateAsync(count.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateCycleCountDto = {
        warehouseId: values.warehouseId,
        scheduledDate: values.scheduledDate?.toISOString(),
        description: values.description,
        countType: values.countType,
      };
      await createCount.mutateAsync(data);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  // Table columns
  const columns: ColumnsType<CycleCountDto> = [
    {
      title: 'Sayım No',
      dataIndex: 'countNumber',
      key: 'countNumber',
      width: 130,
      render: (text: string) => <span className="font-mono font-semibold text-slate-900">{text}</span>,
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: CycleCountStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Sayım Türü',
      dataIndex: 'countType',
      key: 'countType',
      width: 130,
      render: (text: string) => text || '-',
    },
    {
      title: 'Planlanan Tarih',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 130,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        if (!record.totalItems) return '-';
        const percent = Math.round((record.countedItems || 0) / record.totalItems * 100);
        return (
          <div>
            <Progress percent={percent} size="small" />
            <div className="text-xs text-slate-500">{record.countedItems || 0} / {record.totalItems}</div>
          </div>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Detay',
            onClick: () => handleViewDetail(record),
          },
        ];

        if (record.status === 'Scheduled') {
          items.push({
            key: 'start',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Başlat',
            onClick: () => handleStart(record),
          });
        }

        if (record.status === 'InProgress') {
          items.push({
            key: 'complete',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Tamamla',
            onClick: () => handleComplete(record),
          });
        }

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ListPageHeader
        icon={<CalculatorIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Dönemsel Sayımlar"
        description="Planlı envanter sayımlarını yönetin ve takip edin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Sayım',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Toplam Sayım</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-600">{stats.scheduled}</div>
          <div className="text-xs text-slate-500">Planlandı</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-slate-500">Devam Ediyor</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-slate-500">Tamamlandı</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Select
            placeholder="Depo seçin"
            allowClear
            style={{ width: 200 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Duruma göre filtrele"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <Select.Option key={key} value={key}>
                <Tag color={config.color}>{config.label}</Tag>
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={cycleCounts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: cycleCounts.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Dönemsel Sayım"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createCount.isPending}
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="warehouseId"
            label="Depo"
            rules={[{ required: true, message: 'Depo seçimi gerekli' }]}
          >
            <Select placeholder="Depo seçin" showSearch optionFilterProp="children">
              {warehouses.map((w) => (
                <Select.Option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="scheduledDate"
              label="Planlanan Tarih"
              rules={[{ required: true, message: 'Tarih gerekli' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item name="countType" label="Sayım Türü">
              <Select placeholder="Seçin">
                <Select.Option value="Full">Tam Sayım</Select.Option>
                <Select.Option value="Partial">Kısmi Sayım</Select.Option>
                <Select.Option value="ABC">ABC Analizi</Select.Option>
                <Select.Option value="Random">Rastgele</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Sayım hakkında notlar..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Sayım Detayı: ${selectedCount?.countNumber || ''}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedCount(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>,
        ]}
        width={500}
      >
        {selectedCount && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Sayım No</p>
                <p className="font-semibold">{selectedCount.countNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Durum</p>
                <Tag color={statusConfig[selectedCount.status].color}>
                  {statusConfig[selectedCount.status].label}
                </Tag>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Depo</p>
                <p>{selectedCount.warehouseName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Sayım Türü</p>
                <p>{selectedCount.countType || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Planlanan Tarih</p>
                <p>{selectedCount.scheduledDate ? dayjs(selectedCount.scheduledDate).format('DD.MM.YYYY') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">İlerleme</p>
                <p>{selectedCount.countedItems || 0} / {selectedCount.totalItems || 0}</p>
              </div>
            </div>
            {selectedCount.description && (
              <div>
                <p className="text-xs text-slate-500 uppercase">Açıklama</p>
                <p className="text-slate-700">{selectedCount.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
