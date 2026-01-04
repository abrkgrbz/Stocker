'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Modal, Form, Input, InputNumber, Button, Switch, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  QrCodeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  useBarcodeDefinitions,
  useProducts,
  useCreateBarcodeDefinition,
  useUpdateBarcodeDefinition,
  useDeleteBarcodeDefinition,
} from '@/lib/api/hooks/useInventory';
import type { BarcodeDefinitionDto, CreateBarcodeDefinitionDto, UpdateBarcodeDefinitionDto, BarcodeType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const barcodeTypeConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'EAN-13', color: 'blue' },
  2: { label: 'EAN-8', color: 'cyan' },
  3: { label: 'UPC-A', color: 'purple' },
  4: { label: 'UPC-E', color: 'magenta' },
  5: { label: 'Code 128', color: 'green' },
  6: { label: 'Code 39', color: 'lime' },
  7: { label: 'QR Code', color: 'orange' },
  8: { label: 'Data Matrix', color: 'gold' },
  9: { label: 'PDF417', color: 'volcano' },
  10: { label: 'ITF-14', color: 'geekblue' },
  11: { label: 'Custom', color: 'default' },
};

export default function BarcodeDefinitionsPage() {
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [searchText, setSearchText] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<BarcodeDefinitionDto | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: barcodes = [], isLoading, refetch } = useBarcodeDefinitions(selectedProduct);
  const createBarcode = useCreateBarcodeDefinition();
  const updateBarcode = useUpdateBarcodeDefinition();
  const deleteBarcode = useDeleteBarcodeDefinition();

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchText) return barcodes;
    const search = searchText.toLowerCase();
    return barcodes.filter(
      (item) =>
        item.barcode.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search) ||
        item.productCode?.toLowerCase().includes(search)
    );
  }, [barcodes, searchText]);

  // Stats
  const stats = useMemo(() => {
    const total = barcodes.length;
    const primary = barcodes.filter(b => b.isPrimary).length;
    const active = barcodes.filter(b => b.isActive).length;
    const manufacturer = barcodes.filter(b => b.isManufacturerBarcode).length;
    return { total, primary, active, manufacturer };
  }, [barcodes]);

  // Handlers
  const handleCreate = () => {
    form.resetFields();
    setCreateModalOpen(true);
  };

  const handleEdit = (barcode: BarcodeDefinitionDto) => {
    setSelectedBarcode(barcode);
    form.setFieldsValue({
      productId: barcode.productId,
      barcode: barcode.barcode,
      barcodeType: barcode.barcodeType,
      isPrimary: barcode.isPrimary,
      quantityPerUnit: barcode.quantityPerUnit,
      isManufacturerBarcode: barcode.isManufacturerBarcode,
      manufacturerCode: barcode.manufacturerCode,
      gtin: barcode.gtin,
      description: barcode.description,
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (barcode: BarcodeDefinitionDto) => {
    const confirmed = await confirmAction(
      'Barkodu Sil',
      `"${barcode.barcode}" barkodunu silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteBarcode.mutateAsync(barcode.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateBarcodeDefinitionDto = {
        productId: values.productId,
        barcode: values.barcode,
        barcodeType: values.barcodeType,
        isPrimary: values.isPrimary,
        quantityPerUnit: values.quantityPerUnit,
        isManufacturerBarcode: values.isManufacturerBarcode,
        manufacturerCode: values.manufacturerCode,
        gtin: values.gtin,
        description: values.description,
      };
      await createBarcode.mutateAsync(data);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedBarcode) return;
    try {
      const values = await form.validateFields();
      const data: UpdateBarcodeDefinitionDto = {
        barcodeType: values.barcodeType,
        isPrimary: values.isPrimary,
        quantityPerUnit: values.quantityPerUnit,
        isManufacturerBarcode: values.isManufacturerBarcode,
        manufacturerCode: values.manufacturerCode,
        gtin: values.gtin,
        description: values.description,
      };
      await updateBarcode.mutateAsync({ id: selectedBarcode.id, dto: data });
      setEditModalOpen(false);
      setSelectedBarcode(null);
      form.resetFields();
    } catch (error) {
      // Validation error
    }
  };

  // Table columns
  const columns: ColumnsType<BarcodeDefinitionDto> = [
    {
      title: 'Barkod',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 180,
      render: (text: string, record) => (
        <div>
          <span className="font-mono font-semibold text-slate-900">{text}</span>
          {record.isPrimary && <Tag color="green" className="ml-2">Birincil</Tag>}
        </div>
      ),
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
      title: 'Barkod Tipi',
      dataIndex: 'barcodeType',
      key: 'barcodeType',
      width: 120,
      render: (type: BarcodeType) => {
        const config = barcodeTypeConfig[type] || { label: 'Bilinmiyor', color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Birim Miktar',
      dataIndex: 'quantityPerUnit',
      key: 'quantityPerUnit',
      width: 100,
      render: (value: number) => value || 1,
    },
    {
      title: 'Üretici',
      key: 'manufacturer',
      width: 120,
      render: (_, record) => (
        record.isManufacturerBarcode ? (
          <div>
            <Tag color="purple">Üretici</Tag>
            {record.manufacturerCode && (
              <div className="text-xs text-slate-500 mt-1">{record.manufacturerCode}</div>
            )}
          </div>
        ) : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'GTIN',
      dataIndex: 'gtin',
      key: 'gtin',
      width: 150,
      render: (text: string) => text ? <span className="font-mono text-xs">{text}</span> : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  // Form content
  const formContent = (isEdit: boolean = false) => (
    <Form form={form} layout="vertical" className="mt-4">
      {!isEdit && (
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
      )}
      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <Form.Item
            name="barcode"
            label="Barkod"
            rules={[{ required: true, message: 'Barkod gerekli' }]}
          >
            <Input placeholder="8690123456789" />
          </Form.Item>
        )}
        <Form.Item
          name="barcodeType"
          label="Barkod Tipi"
          rules={[{ required: true, message: 'Barkod tipi gerekli' }]}
        >
          <Select placeholder="Seçin">
            {Object.entries(barcodeTypeConfig).map(([key, config]) => (
              <Select.Option key={key} value={parseInt(key)}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="quantityPerUnit" label="Birim Miktar">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="isPrimary" label="Birincil Barkod" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="isManufacturerBarcode" label="Üretici Barkodu" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="manufacturerCode" label="Üretici Kodu">
          <Input placeholder="MFR-001" />
        </Form.Item>
        <Form.Item name="gtin" label="GTIN">
          <Input placeholder="00012345678905" />
        </Form.Item>
      </div>
      <Form.Item name="description" label="Açıklama">
        <Input.TextArea rows={2} placeholder="Barkod hakkında notlar..." />
      </Form.Item>
    </Form>
  );

  return (
    <PageContainer>
      <ListPageHeader
        icon={<QrCodeIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Barkod Tanımları"
        description="Ürünlere ait barkod tanımlarını yönetin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Barkod',
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
          <div className="text-xs text-slate-500">Toplam Barkod</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.primary}</div>
          <div className="text-xs text-slate-500">Birincil Barkod</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          <div className="text-xs text-slate-500">Aktif Barkod</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.manufacturer}</div>
          <div className="text-xs text-slate-500">Üretici Barkodu</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Input
            placeholder="Barkod veya ürün ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64"
          />
          <Select
            placeholder="Ürüne göre filtrele"
            allowClear
            style={{ width: 250 }}
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Yeni Barkod Tanımı"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSubmit}
        okText="Oluştur"
        cancelText="İptal"
        confirmLoading={createBarcode.isPending}
        width={600}
      >
        {formContent(false)}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Barkod Tanımı Düzenle"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedBarcode(null);
          form.resetFields();
        }}
        onOk={handleEditSubmit}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={updateBarcode.isPending}
        width={600}
      >
        {formContent(true)}
      </Modal>
    </PageContainer>
  );
}
