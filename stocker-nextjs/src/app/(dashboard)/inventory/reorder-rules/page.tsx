'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Modal, Form, Input, InputNumber, Button, Switch, Dropdown, Tooltip } from 'antd';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  EllipsisHorizontalIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import {
  useReorderRules,
  useProducts,
  useCategories,
  useWarehouses,
  useSuppliers,
  useCreateReorderRule,
  useUpdateReorderRule,
  useDeleteReorderRule,
  useActivateReorderRule,
  usePauseReorderRule,
  useDisableReorderRule,
  useExecuteReorderRule,
} from '@/lib/api/hooks/useInventory';
import type { ReorderRuleDto, CreateReorderRuleDto, ReorderRuleStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const statusConfig: Record<ReorderRuleStatus, { color: string; label: string }> = {
  Active: { color: 'green', label: 'Aktif' },
  Paused: { color: 'orange', label: 'Duraklatıldı' },
  Disabled: { color: 'default', label: 'Devre Dışı' },
};

export default function ReorderRulesPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReorderRuleStatus | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ReorderRuleDto | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: warehouses = [] } = useWarehouses();
  const { data: suppliers = [] } = useSuppliers();
  const { data: rules = [], isLoading, refetch } = useReorderRules(undefined, undefined, selectedWarehouse, selectedStatus);
  const createRule = useCreateReorderRule();
  const updateRule = useUpdateReorderRule();
  const deleteRule = useDeleteReorderRule();
  const activateRule = useActivateReorderRule();
  const pauseRule = usePauseReorderRule();
  const disableRule = useDisableReorderRule();
  const executeRule = useExecuteReorderRule();

  // Stats
  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter(r => r.status === 'Active').length;
    const paused = rules.filter(r => r.status === 'Paused').length;
    const disabled = rules.filter(r => r.status === 'Disabled').length;
    return { total, active, paused, disabled };
  }, [rules]);

  // Handlers
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleEdit = (rule: ReorderRuleDto) => {
    setSelectedRule(rule);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      productId: rule.productId,
      categoryId: rule.categoryId,
      warehouseId: rule.warehouseId,
      supplierId: rule.supplierId,
      triggerBelowQuantity: rule.triggerBelowQuantity,
      triggerBelowDaysOfStock: rule.triggerBelowDaysOfStock,
      triggerOnForecast: rule.triggerOnForecast,
      forecastLeadTimeDays: rule.forecastLeadTimeDays,
      reorderQuantity: rule.reorderQuantity,
      reorderUpToQuantity: rule.reorderUpToQuantity,
      useDynamicQuantity: rule.useDynamicQuantity,
      minReorderQuantity: rule.minReorderQuantity,
      maxReorderQuantity: rule.maxReorderQuantity,
      requiresApproval: rule.requiresApproval,
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (rule: ReorderRuleDto) => {
    const confirmed = await confirmAction(
      'Kuralı Sil',
      `"${rule.name}" kuralını silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteRule.mutateAsync(rule.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleActivate = async (rule: ReorderRuleDto) => {
    try {
      await activateRule.mutateAsync(rule.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePause = async (rule: ReorderRuleDto) => {
    try {
      await pauseRule.mutateAsync(rule.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDisable = async (rule: ReorderRuleDto) => {
    try {
      await disableRule.mutateAsync(rule.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExecute = async (rule: ReorderRuleDto) => {
    const confirmed = await confirmAction(
      'Kuralı Çalıştır',
      `"${rule.name}" kuralını şimdi çalıştırmak istediğinizden emin misiniz?`,
      'Çalıştır'
    );

    if (confirmed) {
      try {
        await executeRule.mutateAsync(rule.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateReorderRuleDto = {
        name: values.name,
        description: values.description,
        productId: values.productId,
        categoryId: values.categoryId,
        warehouseId: values.warehouseId,
        supplierId: values.supplierId,
        triggerBelowQuantity: values.triggerBelowQuantity,
        triggerBelowDaysOfStock: values.triggerBelowDaysOfStock,
        triggerOnForecast: values.triggerOnForecast || false,
        forecastLeadTimeDays: values.forecastLeadTimeDays,
        reorderQuantity: values.reorderQuantity,
        reorderUpToQuantity: values.reorderUpToQuantity,
        useDynamicQuantity: values.useDynamicQuantity || false,
        minReorderQuantity: values.minReorderQuantity,
        maxReorderQuantity: values.maxReorderQuantity,
        requiresApproval: values.requiresApproval || false,
      };
      await createRule.mutateAsync(data);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRule) return;
    try {
      const values = await form.validateFields();
      const data: CreateReorderRuleDto = {
        name: values.name,
        description: values.description,
        productId: values.productId,
        categoryId: values.categoryId,
        warehouseId: values.warehouseId,
        supplierId: values.supplierId,
        triggerBelowQuantity: values.triggerBelowQuantity,
        triggerBelowDaysOfStock: values.triggerBelowDaysOfStock,
        triggerOnForecast: values.triggerOnForecast || false,
        forecastLeadTimeDays: values.forecastLeadTimeDays,
        reorderQuantity: values.reorderQuantity,
        reorderUpToQuantity: values.reorderUpToQuantity,
        useDynamicQuantity: values.useDynamicQuantity || false,
        minReorderQuantity: values.minReorderQuantity,
        maxReorderQuantity: values.maxReorderQuantity,
        requiresApproval: values.requiresApproval || false,
      };
      await updateRule.mutateAsync({ id: selectedRule.id, dto: data });
      setEditModalOpen(false);
      setSelectedRule(null);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  // Table columns
  const columns: ColumnsType<ReorderRuleDto> = [
    {
      title: 'Kural Adı',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <span className="font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Kapsam',
      key: 'scope',
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          {record.productName && (
            <Tag color="blue">{record.productName}</Tag>
          )}
          {record.categoryName && (
            <Tag color="purple">{record.categoryName}</Tag>
          )}
          {record.warehouseName && (
            <Tag color="cyan">{record.warehouseName}</Tag>
          )}
          {!record.productName && !record.categoryName && !record.warehouseName && (
            <span className="text-slate-400">Tümü</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tetikleyici',
      key: 'trigger',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          {record.triggerBelowQuantity && (
            <div>Miktar &lt; {record.triggerBelowQuantity}</div>
          )}
          {record.triggerBelowDaysOfStock && (
            <div>Stok &lt; {record.triggerBelowDaysOfStock} gün</div>
          )}
          {record.triggerOnForecast && (
            <div className="text-orange-600">Tahmine göre</div>
          )}
        </div>
      ),
    },
    {
      title: 'Sipariş Miktarı',
      key: 'reorderQuantity',
      width: 150,
      render: (_, record) => (
        <div className="text-sm">
          {record.useDynamicQuantity ? (
            <div>
              <Tag color="purple">Dinamik</Tag>
              <div className="text-xs text-slate-500 mt-1">
                {record.minReorderQuantity} - {record.maxReorderQuantity}
              </div>
            </div>
          ) : (
            <div>
              {record.reorderQuantity && <div>{record.reorderQuantity} adet</div>}
              {record.reorderUpToQuantity && (
                <div className="text-xs text-slate-500">
                  Hedef: {record.reorderUpToQuantity}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReorderRuleStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Son Çalışma',
      dataIndex: 'lastExecutedAt',
      key: 'lastExecutedAt',
      width: 140,
      render: (date: string | undefined, record) => (
        <div>
          {date ? (
            <div>
              <div className="text-sm">{dayjs(date).format('DD.MM.YYYY')}</div>
              <div className="text-xs text-slate-500">{dayjs(date).format('HH:mm')}</div>
            </div>
          ) : (
            <span className="text-slate-400">Hiç çalışmadı</span>
          )}
          {record.executionCount > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              {record.executionCount} kez
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Onay',
      dataIndex: 'requiresApproval',
      key: 'requiresApproval',
      width: 80,
      render: (requiresApproval: boolean) => (
        requiresApproval ? (
          <Tag color="orange">Gerekli</Tag>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record),
          },
          {
            key: 'execute',
            icon: <BoltIcon className="w-4 h-4" />,
            label: 'Şimdi Çalıştır',
            onClick: () => handleExecute(record),
            disabled: record.status !== 'Active',
          },
        ];

        if (record.status === 'Active') {
          items.push({
            key: 'pause',
            icon: <PauseIcon className="w-4 h-4" />,
            label: 'Duraklat',
            onClick: () => handlePause(record),
            disabled: false,
          });
        }

        if (record.status === 'Paused') {
          items.push({
            key: 'activate',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Aktifleştir',
            onClick: () => handleActivate(record),
            disabled: false,
          });
        }

        if (record.status !== 'Disabled') {
          items.push({
            key: 'disable',
            icon: <StopIcon className="w-4 h-4" />,
            label: 'Devre Dışı Bırak',
            onClick: () => handleDisable(record),
            disabled: false,
          });
        }

        if (record.status === 'Disabled') {
          items.push({
            key: 'activate2',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Aktifleştir',
            onClick: () => handleActivate(record),
            disabled: false,
          });
        }

        items.push({
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record),
          disabled: false,
        } as any);

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
          </Dropdown>
        );
      },
    },
  ];

  // Form content
  const formContent = (
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item
        name="name"
        label="Kural Adı"
        rules={[{ required: true, message: 'Kural adı gerekli' }]}
      >
        <Input placeholder="Düşük stok uyarısı - A kategorisi" />
      </Form.Item>
      <Form.Item name="description" label="Açıklama">
        <Input.TextArea rows={2} placeholder="Kural hakkında açıklama..." />
      </Form.Item>

      <div className="text-sm font-medium text-slate-700 mb-2">Kapsam (Boş bırakılırsa tümüne uygulanır)</div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="productId" label="Ürün">
          <Select placeholder="Ürün seçin" allowClear showSearch optionFilterProp="children">
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="categoryId" label="Kategori">
          <Select placeholder="Kategori seçin" allowClear showSearch optionFilterProp="children">
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="warehouseId" label="Depo">
          <Select placeholder="Depo seçin" allowClear showSearch optionFilterProp="children">
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="supplierId" label="Tedarikçi">
          <Select placeholder="Tedarikçi seçin" allowClear showSearch optionFilterProp="children">
            {suppliers.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">Tetikleyici Koşullar</div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="triggerBelowQuantity" label="Miktar altına düşünce">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="10" />
        </Form.Item>
        <Form.Item name="triggerBelowDaysOfStock" label="Gün cinsinden stok altına düşünce">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="7" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="triggerOnForecast" label="Tahmine göre tetikle" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="forecastLeadTimeDays" label="Tahmin süresi (gün)">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="14" />
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">Sipariş Miktarı</div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="reorderQuantity" label="Sipariş miktarı">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
        </Form.Item>
        <Form.Item name="reorderUpToQuantity" label="Hedef miktar">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="500" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Form.Item name="useDynamicQuantity" label="Dinamik miktar" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="minReorderQuantity" label="Min miktar">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="50" />
        </Form.Item>
        <Form.Item name="maxReorderQuantity" label="Max miktar">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="500" />
        </Form.Item>
      </div>

      <div className="text-sm font-medium text-slate-700 mb-2">Onay</div>
      <Form.Item name="requiresApproval" label="Onay gerekli" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );

  return (
    <PageContainer>
      <ListPageHeader
        icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Yeniden Sipariş Kuralları"
        description="Otomatik stok yenileme kurallarını tanımlayın ve yönetin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Kural',
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
          <div className="text-xs text-slate-500">Toplam Kural</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-slate-500">Aktif</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
          <div className="text-xs text-slate-500">Duraklatıldı</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-400">{stats.disabled}</div>
          <div className="text-xs text-slate-500">Devre Dışı</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Select
            placeholder="Depoya göre filtrele"
            allowClear
            style={{ width: 250 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            showSearch
            optionFilterProp="children"
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
          dataSource={rules}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: rules.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Yeniden Sipariş Kuralı"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createRule.isPending}
        width={700}
      >
        {formContent}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Yeniden Sipariş Kuralı Düzenle"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedRule(null);
          form.resetFields();
        }}
        onOk={handleEditSubmit}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={updateRule.isPending}
        width={700}
      >
        {formContent}
      </Modal>
    </PageContainer>
  );
}
