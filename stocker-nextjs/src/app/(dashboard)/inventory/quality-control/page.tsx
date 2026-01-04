'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Modal, Form, Input, InputNumber, Button, Space, Dropdown, DatePicker, Radio } from 'antd';
import {
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import {
  useQualityControls,
  useProducts,
  useLotBatches,
  useCreateQualityControl,
  useApproveQualityControl,
  useRejectQualityControl,
} from '@/lib/api/hooks/useInventory';
import type { QualityControlDto, QualityControlStatus, CreateQualityControlDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const statusConfig: Record<QualityControlStatus, { color: string; label: string }> = {
  Pending: { color: 'gold', label: 'Beklemede' },
  InProgress: { color: 'blue', label: 'Devam Ediyor' },
  Passed: { color: 'green', label: 'Başarılı' },
  Failed: { color: 'red', label: 'Başarısız' },
  OnHold: { color: 'orange', label: 'Bekletiliyor' },
};

export default function QualityControlPage() {
  const [selectedStatus, setSelectedStatus] = useState<QualityControlStatus | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState<QualityControlDto | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: lotBatches = [] } = useLotBatches({});
  const { data: qualityControls = [], isLoading, refetch } = useQualityControls({ status: selectedStatus });
  const createQC = useCreateQualityControl();
  const approveQC = useApproveQualityControl();
  const rejectQC = useRejectQualityControl();

  // Stats
  const stats = useMemo(() => {
    const total = qualityControls.length;
    const pending = qualityControls.filter(q => q.status === 'Pending').length;
    const inProgress = qualityControls.filter(q => q.status === 'InProgress').length;
    const passed = qualityControls.filter(q => q.status === 'Passed').length;
    const failed = qualityControls.filter(q => q.status === 'Failed').length;
    return { total, pending, inProgress, passed, failed };
  }, [qualityControls]);

  // Handlers
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleViewDetail = (qc: QualityControlDto) => {
    setSelectedQC(qc);
    setDetailModalOpen(true);
  };

  const handleApprove = async (qc: QualityControlDto) => {
    const confirmed = await confirmAction(
      'Kalite Kontrol Onayla',
      `Bu kalite kontrol kaydını onaylamak istediğinizden emin misiniz?`,
      'Onayla'
    );
    if (confirmed) {
      try {
        await approveQC.mutateAsync({ id: qc.id, notes: 'Onaylandı' });
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleReject = async (qc: QualityControlDto) => {
    const confirmed = await confirmAction(
      'Kalite Kontrol Reddet',
      `Bu kalite kontrol kaydını reddetmek istediğinizden emin misiniz?`,
      'Reddet'
    );
    if (confirmed) {
      try {
        await rejectQC.mutateAsync({ id: qc.id, reason: 'Kalite standartlarını karşılamıyor' });
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateQualityControlDto = {
        productId: values.productId,
        lotBatchId: values.lotBatchId,
        inspectionType: values.inspectionType,
        sampleSize: values.sampleSize,
        notes: values.notes,
      };
      await createQC.mutateAsync(data);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  // Table columns
  const columns: ColumnsType<QualityControlDto> = [
    {
      title: 'Kontrol No',
      dataIndex: 'controlNumber',
      key: 'controlNumber',
      width: 130,
      render: (text: string) => <span className="font-mono font-semibold text-slate-900">{text}</span>,
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Lot/Parti',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 130,
      render: (text: string) => text ? <Tag>{text}</Tag> : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: QualityControlStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Denetim Tarihi',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 130,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Denetçi',
      dataIndex: 'inspectorName',
      key: 'inspectorName',
      width: 150,
      render: (text: string) => text || '-',
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

        if (record.status === 'Pending' || record.status === 'InProgress') {
          items.push(
            {
              key: 'approve',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleApprove(record),
            },
            {
              key: 'reject',
              icon: <XCircleIcon className="w-4 h-4" />,
              label: 'Reddet',
              onClick: () => handleReject(record),
            }
          );
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
        icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Kalite Kontrol"
        description="Ürün kalite kontrollerini yönetin ve takip edin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Kontrol',
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Toplam Kontrol</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-slate-500">Beklemede</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-slate-500">Devam Ediyor</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-xs text-slate-500">Başarılı</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-xs text-slate-500">Başarısız</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
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
          dataSource={qualityControls}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: qualityControls.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Kalite Kontrol"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createQC.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="productId"
            label="Ürün"
            rules={[{ required: true, message: 'Ürün seçimi gerekli' }]}
          >
            <Select placeholder="Ürün seçin" showSearch optionFilterProp="children">
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="lotBatchId" label="Lot/Parti (Opsiyonel)">
            <Select placeholder="Lot seçin" allowClear showSearch optionFilterProp="children">
              {lotBatches.map((l) => (
                <Select.Option key={l.id} value={l.id}>
                  {l.lotNumber} - {l.productName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="inspectionType"
              label="Denetim Türü"
              rules={[{ required: true, message: 'Denetim türü gerekli' }]}
            >
              <Select placeholder="Seçin">
                <Select.Option value="Incoming">Giriş Denetimi</Select.Option>
                <Select.Option value="InProcess">Süreç Denetimi</Select.Option>
                <Select.Option value="Final">Final Denetimi</Select.Option>
                <Select.Option value="Random">Rastgele Denetim</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="sampleSize" label="Numune Boyutu">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="10" />
            </Form.Item>
          </div>
          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="Kalite kontrol hakkında notlar..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Kalite Kontrol Detayı: ${selectedQC?.controlNumber || ''}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedQC(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>,
        ]}
        width={600}
      >
        {selectedQC && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Kontrol No</p>
                <p className="font-semibold">{selectedQC.controlNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Durum</p>
                <Tag color={statusConfig[selectedQC.status].color}>
                  {statusConfig[selectedQC.status].label}
                </Tag>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Ürün</p>
                <p className="font-medium">{selectedQC.productName}</p>
                <p className="text-sm text-slate-500">{selectedQC.productCode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Lot/Parti</p>
                <p>{selectedQC.lotNumber || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Denetim Tarihi</p>
                <p>{selectedQC.inspectionDate ? dayjs(selectedQC.inspectionDate).format('DD.MM.YYYY HH:mm') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Denetçi</p>
                <p>{selectedQC.inspectorName || '-'}</p>
              </div>
            </div>
            {selectedQC.notes && (
              <div>
                <p className="text-xs text-slate-500 uppercase">Notlar</p>
                <p className="text-slate-700">{selectedQC.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
