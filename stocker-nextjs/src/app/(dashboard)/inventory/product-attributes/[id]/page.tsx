'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Spin,
  message,
  Modal,
  Table,
  Switch,
  Input,
  Empty,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  FunnelIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useProductAttribute,
  useDeleteProductAttribute,
  useAddProductAttributeOption,
  useUpdateProductAttributeOption,
  useDeleteProductAttributeOption,
} from '@/lib/api/hooks/useInventory';
import { AttributeType, type ProductAttributeOptionDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const attributeTypeConfig: Record<AttributeType, { color: string; label: string; bgColor: string; textColor: string }> = {
  [AttributeType.Text]: { color: 'blue', label: 'Metin', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  [AttributeType.Number]: { color: 'cyan', label: 'Sayı', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' },
  [AttributeType.Boolean]: { color: 'green', label: 'Evet/Hayır', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  [AttributeType.Date]: { color: 'purple', label: 'Tarih', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  [AttributeType.Select]: { color: 'orange', label: 'Seçim', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  [AttributeType.MultiSelect]: { color: 'magenta', label: 'Çoklu Seçim', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  [AttributeType.Color]: { color: 'red', label: 'Renk', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  [AttributeType.Size]: { color: 'gold', label: 'Beden', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
};

const typesWithOptions: AttributeType[] = [AttributeType.Select, AttributeType.MultiSelect, AttributeType.Color, AttributeType.Size];

export default function ProductAttributeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attributeId = Number(params.id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [newOptionColorCode, setNewOptionColorCode] = useState('');
  const [editingOption, setEditingOption] = useState<ProductAttributeOptionDto | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editColorCode, setEditColorCode] = useState('');

  const { data: attribute, isLoading } = useProductAttribute(attributeId);
  const deleteAttribute = useDeleteProductAttribute();
  const addOption = useAddProductAttributeOption();
  const updateOption = useUpdateProductAttributeOption();
  const deleteOption = useDeleteProductAttributeOption();

  const handleDelete = async () => {
    try {
      await deleteAttribute.mutateAsync(attributeId);
      router.push('/inventory/product-attributes');
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddOption = async () => {
    if (!newOptionValue.trim()) {
      message.error('Seçenek değeri gerekli');
      return;
    }

    try {
      await addOption.mutateAsync({
        attributeId,
        data: {
          value: newOptionValue.trim(),
          label: newOptionValue.trim(),
          colorCode: attribute?.attributeType === AttributeType.Color ? newOptionColorCode : undefined,
          displayOrder: (attribute?.options?.length || 0) + 1,
        },
      });
      setNewOptionValue('');
      setNewOptionColorCode('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleUpdateOption = async () => {
    if (!editingOption || !editValue.trim()) {
      message.error('Seçenek değeri gerekli');
      return;
    }

    try {
      await updateOption.mutateAsync({
        attributeId,
        optionId: editingOption.id,
        data: {
          value: editValue.trim(),
          label: editValue.trim(),
          colorCode: attribute?.attributeType === AttributeType.Color ? editColorCode : undefined,
          displayOrder: editingOption.displayOrder,
        },
      });
      setEditingOption(null);
      setEditValue('');
      setEditColorCode('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    try {
      await deleteOption.mutateAsync({ attributeId, optionId });
    } catch {
      // Error handled by mutation
    }
  };

  const startEdit = (option: ProductAttributeOptionDto) => {
    setEditingOption(option);
    setEditValue(option.value);
    setEditColorCode(option.colorCode || '');
  };

  const cancelEdit = () => {
    setEditingOption(null);
    setEditValue('');
    setEditColorCode('');
  };

  const hasOptions = attribute && typesWithOptions.includes(attribute.attributeType);

  const optionColumns: ColumnsType<ProductAttributeOptionDto> = [
    {
      title: 'Sıra',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 60,
      align: 'center',
      render: (order) => <span className="text-slate-500">{order}</span>,
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        if (editingOption?.id === record.id) {
          return (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              size="small"
              style={{ width: 200 }}
            />
          );
        }
        return (
          <div className="flex items-center gap-2">
            {attribute?.attributeType === AttributeType.Color && record.colorCode && (
              <div
                className="w-5 h-5 rounded border border-slate-200"
                style={{ backgroundColor: record.colorCode }}
              />
            )}
            <span className="font-medium text-slate-900">{value}</span>
          </div>
        );
      },
    },
    {
      title: 'Renk Kodu',
      dataIndex: 'colorCode',
      key: 'colorCode',
      width: 150,
      render: (colorCode, record) => {
        if (attribute?.attributeType !== 'Color') {
          return <span className="text-slate-400">-</span>;
        }
        if (editingOption?.id === record.id) {
          return (
            <Input
              value={editColorCode}
              onChange={(e) => setEditColorCode(e.target.value)}
              size="small"
              placeholder="#FFFFFF"
              prefix={
                editColorCode && (
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: editColorCode }}
                  />
                )
              }
            />
          );
        }
        return colorCode ? (
          <span className="text-sm text-slate-600">{colorCode}</span>
        ) : (
          <span className="text-slate-400">-</span>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (editingOption?.id === record.id) {
          return (
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<CheckIcon className="w-4 h-4" />}
                onClick={handleUpdateOption}
                loading={updateOption.isPending}
                className="text-emerald-600 hover:text-emerald-700"
              />
              <Button
                type="text"
                size="small"
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-600"
              />
            </Space>
          );
        }
        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => startEdit(record)}
              className="text-slate-400 hover:text-slate-600"
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={() => handleDeleteOption(record.id)}
              loading={deleteOption.isPending}
            />
          </Space>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Özellik bulunamadı" />
      </div>
    );
  }

  const typeConfig = attributeTypeConfig[attribute.attributeType];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{attribute.name}</h1>
                  <Tag className={`border-0 ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                    {typeConfig.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {attribute.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/product-attributes/${attributeId}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${typeConfig.bgColor} flex items-center justify-center`}>
                  <TagIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Özellik Tipi
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900">{typeConfig.label}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <OrderedListOutlined className="text-blue-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Seçenek Sayısı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {attribute.options?.length || 0}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FunnelIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Görüntüleme Sırası
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{attribute.displayOrder}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Grup
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {attribute.groupName || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Attribute Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özellik Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Özellik Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{attribute.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Özellik Adı</p>
                  <p className="text-sm font-medium text-slate-900">{attribute.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tip</p>
                  <Tag className={`border-0 ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                    {typeConfig.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Grup</p>
                  <p className="text-sm font-medium text-slate-900">
                    {attribute.groupName || <span className="text-slate-400">-</span>}
                  </p>
                </div>
                {attribute.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{attribute.description}</p>
                  </div>
                )}
                {attribute.attributeType === AttributeType.Number && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Minimum Değer</p>
                      <p className="text-sm font-medium text-slate-900">
                        {attribute.minValue ?? <span className="text-slate-400">-</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Maximum Değer</p>
                      <p className="text-sm font-medium text-slate-900">
                        {attribute.maxValue ?? <span className="text-slate-400">-</span>}
                      </p>
                    </div>
                  </>
                )}
                {attribute.attributeType === AttributeType.Text && attribute.validationPattern && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Doğrulama Deseni</p>
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                      {attribute.validationPattern}
                    </code>
                  </div>
                )}
                {attribute.defaultValue && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Varsayılan Değer</p>
                    <p className="text-sm font-medium text-slate-900">{attribute.defaultValue}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Ayarlar
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Zorunlu Alan</span>
                  <Tag
                    icon={attribute.isRequired ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      attribute.isRequired
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {attribute.isRequired ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Filtrelenebilir</span>
                  <Tag
                    icon={attribute.isFilterable ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      attribute.isFilterable
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {attribute.isFilterable ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Görünür</span>
                  <Tag
                    icon={attribute.isVisible ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      attribute.isVisible
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {attribute.isVisible ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(attribute.createdAt).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Options Table Section */}
          {hasOptions && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Seçenekler ({attribute.options?.length || 0})
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Yeni seçenek değeri"
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                      style={{ width: 180 }}
                      size="small"
                    />
                    {attribute.attributeType === AttributeType.Color && (
                      <Input
                        placeholder="#FFFFFF"
                        value={newOptionColorCode}
                        onChange={(e) => setNewOptionColorCode(e.target.value)}
                        style={{ width: 100 }}
                        size="small"
                        prefix={
                          newOptionColorCode && (
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: newOptionColorCode }}
                            />
                          )
                        }
                      />
                    )}
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusIcon className="w-4 h-4" />}
                      onClick={handleAddOption}
                      loading={addOption.isPending}
                      style={{ background: '#1e293b', borderColor: '#1e293b' }}
                    >
                      Ekle
                    </Button>
                  </div>
                </div>
                <Table
                  columns={optionColumns}
                  dataSource={attribute.options || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz seçenek eklenmedi' }}
                  className="[&_.ant-table]:border-slate-200 [&_.ant-table-thead_.ant-table-cell]:bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:text-slate-600 [&_.ant-table-thead_.ant-table-cell]:font-medium"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        title="Özelliği Sil"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deleteAttribute.isPending }}
      >
        <p>
          <strong>{attribute.name}</strong> özelliğini silmek istediğinize emin misiniz?
        </p>
        <p className="text-slate-500 text-sm">
          Bu işlem geri alınamaz ve bu özelliği kullanan ürünleri etkileyebilir.
        </p>
      </Modal>
    </div>
  );
}
