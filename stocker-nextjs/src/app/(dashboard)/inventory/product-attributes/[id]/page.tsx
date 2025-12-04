'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  message,
  Modal,
  Table,
  Switch,
  Input,
  InputNumber,
  Empty,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  useProductAttribute,
  useDeleteProductAttribute,
  useAddProductAttributeOption,
  useUpdateProductAttributeOption,
  useDeleteProductAttributeOption,
} from '@/lib/api/hooks/useInventory';
import { AttributeType, type ProductAttributeOptionDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const attributeTypeConfig: Record<AttributeType, { color: string; label: string }> = {
  [AttributeType.Text]: { color: 'blue', label: 'Metin' },
  [AttributeType.Number]: { color: 'cyan', label: 'Sayı' },
  [AttributeType.Boolean]: { color: 'green', label: 'Evet/Hayır' },
  [AttributeType.Date]: { color: 'purple', label: 'Tarih' },
  [AttributeType.Select]: { color: 'orange', label: 'Seçim' },
  [AttributeType.MultiSelect]: { color: 'magenta', label: 'Çoklu Seçim' },
  [AttributeType.Color]: { color: 'red', label: 'Renk' },
  [AttributeType.Size]: { color: 'gold', label: 'Beden' },
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
          colorCode: attribute?.attributeType === AttributeType.Color ? newOptionColorCode : undefined,
          displayOrder: (attribute?.options?.length || 0) + 1,
          isDefault: false,
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
          colorCode: attribute?.attributeType === AttributeType.Color ? editColorCode : undefined,
          displayOrder: editingOption.displayOrder,
          isDefault: editingOption.isDefault,
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

  const handleSetDefault = async (option: ProductAttributeOptionDto) => {
    try {
      await updateOption.mutateAsync({
        attributeId,
        optionId: option.id,
        data: {
          value: option.value,
          colorCode: option.colorCode,
          displayOrder: option.displayOrder,
          isDefault: true,
        },
      });
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
                className="w-5 h-5 rounded border"
                style={{ backgroundColor: record.colorCode }}
              />
            )}
            <span>{value}</span>
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
          return <Text type="secondary">-</Text>;
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
        return colorCode || <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      align: 'center',
      render: (isDefault, record) => (
        <Switch
          size="small"
          checked={isDefault}
          onChange={() => handleSetDefault(record)}
          disabled={isDefault}
        />
      ),
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
                icon={<CheckOutlined />}
                onClick={handleUpdateOption}
                loading={updateOption.isPending}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={cancelEdit}
              />
            </Space>
          );
        }
        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => startEdit(record)}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
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
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Özellik bulunamadı" />
      </div>
    );
  }

  const typeConfig = attributeTypeConfig[attribute.attributeType];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                <TagsOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{attribute.name}</h1>
                  <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {attribute.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/product-attributes/${attributeId}/edit`)}
            >
              Düzenle
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalOpen(true)}>
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card title="Özellik Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Kod">{attribute.code}</Descriptions.Item>
              <Descriptions.Item label="Ad">{attribute.name}</Descriptions.Item>
              <Descriptions.Item label="Tip">
                <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Grup">
                {attribute.groupName || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={2}>
                {attribute.description || <Text type="secondary">Açıklama yok</Text>}
              </Descriptions.Item>
              {attribute.attributeType === AttributeType.Number && (
                <>
                  <Descriptions.Item label="Minimum Değer">
                    {attribute.minValue ?? <Text type="secondary">-</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Maximum Değer">
                    {attribute.maxValue ?? <Text type="secondary">-</Text>}
                  </Descriptions.Item>
                </>
              )}
              {attribute.attributeType === AttributeType.Text && attribute.validationPattern && (
                <Descriptions.Item label="Doğrulama Deseni" span={2}>
                  <code>{attribute.validationPattern}</code>
                </Descriptions.Item>
              )}
              {attribute.defaultValue && (
                <Descriptions.Item label="Varsayılan Değer" span={2}>
                  {attribute.defaultValue}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Options */}
          {hasOptions && (
            <Card
              title={`Seçenekler (${attribute.options?.length || 0})`}
              extra={
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
                    icon={<PlusOutlined />}
                    onClick={handleAddOption}
                    loading={addOption.isPending}
                    style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
                  >
                    Ekle
                  </Button>
                </div>
              }
            >
              <Table
                columns={optionColumns}
                dataSource={attribute.options || []}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Henüz seçenek eklenmedi' }}
              />
            </Card>
          )}
        </div>

        {/* Settings */}
        <div>
          <Card title="Ayarlar" className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>Zorunlu Alan</Text>
                <Switch checked={attribute.isRequired} disabled />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text>Filtrelenebilir</Text>
                <Switch checked={attribute.isFilterable} disabled />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text>Görünür</Text>
                <Switch checked={attribute.isVisible} disabled />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text>Görüntüleme Sırası</Text>
                <Text strong>{attribute.displayOrder}</Text>
              </div>
            </div>
          </Card>

          <Card title="Kullanım İstatistikleri">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">Kullanan Ürün Sayısı</Text>
                <Text strong>-</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">Kullanan Varyant Sayısı</Text>
                <Text strong>-</Text>
              </div>
            </div>
          </Card>
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
        <p className="text-gray-500 text-sm">
          Bu işlem geri alınamaz ve bu özelliği kullanan ürünleri etkileyebilir.
        </p>
      </Modal>
    </div>
  );
}
