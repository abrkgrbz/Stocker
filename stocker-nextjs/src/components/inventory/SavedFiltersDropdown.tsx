'use client';

import React, { useState } from 'react';
import {
  Dropdown,
  Button,
  Space,
  Divider,
  Input,
  Modal,
  Form,
  Checkbox,
  Empty,
  Tooltip,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  FilterOutlined,
  SaveOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  HistoryOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
} from '@ant-design/icons';
import {
  useSavedFilters,
  type FilterEntityType,
  type SavedFilter,
  type FilterTemplate,
} from '@/hooks/useSavedFilters';

const { Text } = Typography;

interface SavedFiltersDropdownProps {
  entityType: FilterEntityType;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
  onClearFilter?: () => void;
  disabled?: boolean;
}

export default function SavedFiltersDropdown({
  entityType,
  currentFilters,
  onApplyFilter,
  onClearFilter,
  disabled = false,
}: SavedFiltersDropdownProps) {
  const {
    savedFilters,
    activeFilter,
    templates,
    saveFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter,
    applyTemplate,
    clearActiveFilter,
    filterExists,
  } = useSavedFilters(entityType);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [form] = Form.useForm();

  // Check if current filters are empty
  const hasCurrentFilters = Object.values(currentFilters).some(
    (v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
  );

  // Handle save filter
  const handleSaveFilter = () => {
    form.validateFields().then((values) => {
      if (editingFilter) {
        // Update existing filter
        updateFilter(editingFilter.id, {
          name: values.name,
          filters: currentFilters,
          isDefault: values.isDefault,
        });
        message.success('Filtre güncellendi');
      } else {
        // Create new filter
        if (filterExists(values.name)) {
          form.setFields([{ name: 'name', errors: ['Bu isimde bir filtre zaten var'] }]);
          return;
        }
        saveFilter(values.name, currentFilters, values.isDefault);
        message.success('Filtre kaydedildi');
      }
      setSaveModalOpen(false);
      setEditingFilter(null);
      form.resetFields();
    });
  };

  // Handle apply saved filter
  const handleApplyFilter = (filter: SavedFilter) => {
    setActiveFilter(filter);
    onApplyFilter(filter.filters);
  };

  // Handle apply template
  const handleApplyTemplate = (template: FilterTemplate) => {
    const tempFilter = applyTemplate(template.id);
    if (tempFilter) {
      onApplyFilter(tempFilter.filters);
    }
  };

  // Handle delete filter
  const handleDeleteFilter = (filter: SavedFilter, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Filtreyi Sil',
      content: `"${filter.name}" filtresini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        deleteFilter(filter.id);
        message.success('Filtre silindi');
      },
    });
  };

  // Handle set default
  const handleSetDefault = (filter: SavedFilter, e: React.MouseEvent) => {
    e.stopPropagation();
    updateFilter(filter.id, { isDefault: !filter.isDefault });
    message.success(filter.isDefault ? 'Varsayılan kaldırıldı' : 'Varsayılan olarak ayarlandı');
  };

  // Handle edit filter
  const handleEditFilter = (filter: SavedFilter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFilter(filter);
    form.setFieldsValue({
      name: filter.name,
      isDefault: filter.isDefault,
    });
    setSaveModalOpen(true);
  };

  // Handle clear filter
  const handleClearFilter = () => {
    clearActiveFilter();
    onClearFilter?.();
  };

  // Open save modal
  const openSaveModal = () => {
    setEditingFilter(null);
    form.resetFields();
    setSaveModalOpen(true);
  };

  // Render saved filter item
  const renderFilterItem = (filter: SavedFilter) => (
    <div
      key={filter.id}
      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
      onClick={() => handleApplyFilter(filter)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {filter.isDefault ? (
          <StarFilled className="text-yellow-500 flex-shrink-0" />
        ) : (
          <FilterOutlined className="text-gray-400 flex-shrink-0" />
        )}
        <span className="truncate">{filter.name}</span>
        {activeFilter?.id === filter.id && (
          <Tag color="blue" className="ml-1">
            Aktif
          </Tag>
        )}
      </div>
      <Space size={4} className="flex-shrink-0">
        <Tooltip title={filter.isDefault ? 'Varsayılanı Kaldır' : 'Varsayılan Yap'}>
          <Button
            type="text"
            size="small"
            icon={filter.isDefault ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
            onClick={(e) => handleSetDefault(filter, e)}
          />
        </Tooltip>
        <Tooltip title="Düzenle">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => handleEditFilter(filter, e)}
          />
        </Tooltip>
        <Tooltip title="Sil">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => handleDeleteFilter(filter, e)}
          />
        </Tooltip>
      </Space>
    </div>
  );

  // Render template item
  const renderTemplateItem = (template: FilterTemplate) => (
    <div
      key={template.id}
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
      onClick={() => handleApplyTemplate(template)}
    >
      <span className="flex-shrink-0">{template.icon || '📋'}</span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{template.name}</div>
        <Text type="secondary" className="text-xs truncate block">
          {template.description}
        </Text>
      </div>
    </div>
  );

  // Dropdown content
  const dropdownContent = (
    <div className="w-72 max-h-96 overflow-y-auto">
      {/* Save current filter button */}
      {hasCurrentFilters && (
        <>
          <div className="p-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={openSaveModal}
              block
              ghost
            >
              Mevcut Filtreyi Kaydet
            </Button>
          </div>
          <Divider className="my-1" />
        </>
      )}

      {/* Active filter indicator */}
      {activeFilter && (
        <>
          <div className="px-3 py-2 bg-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckOutlined className="text-blue-500" />
              <span className="font-medium text-blue-700">{activeFilter.name}</span>
            </div>
            <Tooltip title="Filtreyi Temizle">
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleClearFilter}
              />
            </Tooltip>
          </div>
          <Divider className="my-1" />
        </>
      )}

      {/* Saved filters section */}
      {savedFilters.length > 0 && (
        <>
          <div className="px-3 py-1">
            <Text type="secondary" className="text-xs uppercase tracking-wider">
              Kayıtlı Filtreler
            </Text>
          </div>
          {savedFilters.map(renderFilterItem)}
          <Divider className="my-1" />
        </>
      )}

      {/* Templates section */}
      {templates.length > 0 && (
        <>
          <div className="px-3 py-1">
            <Text type="secondary" className="text-xs uppercase tracking-wider">
              Hızlı Filtreler
            </Text>
          </div>
          {templates.map(renderTemplateItem)}
        </>
      )}

      {/* Empty state */}
      {savedFilters.length === 0 && templates.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Kayıtlı filtre yok"
          className="py-4"
        />
      )}
    </div>
  );

  return (
    <>
      <Dropdown
        dropdownRender={() => (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            {dropdownContent}
          </div>
        )}
        trigger={['click']}
        disabled={disabled}
      >
        <Button icon={<FilterOutlined />}>
          <Space>
            {activeFilter ? activeFilter.name : 'Filtreler'}
            {activeFilter && <Tag color="blue" className="ml-1 mr-0">{Object.keys(activeFilter.filters).length}</Tag>}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      {/* Save Filter Modal */}
      <Modal
        title={editingFilter ? 'Filtreyi Düzenle' : 'Filtreyi Kaydet'}
        open={saveModalOpen}
        onOk={handleSaveFilter}
        onCancel={() => {
          setSaveModalOpen(false);
          setEditingFilter(null);
          form.resetFields();
        }}
        okText={editingFilter ? 'Güncelle' : 'Kaydet'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Filtre Adı"
            rules={[
              { required: true, message: 'Filtre adı gerekli' },
              { min: 2, message: 'En az 2 karakter olmalı' },
              { max: 50, message: 'En fazla 50 karakter olabilir' },
            ]}
          >
            <Input placeholder="Örn: Son 7 gün satışları" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Varsayılan filtre olarak ayarla</Checkbox>
          </Form.Item>
          <div className="bg-gray-50 p-3 rounded-lg">
            <Text type="secondary" className="text-xs">
              Kaydedilecek filtre değerleri:
            </Text>
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(currentFilters)
                .filter(([, v]) => v !== undefined && v !== null && v !== '')
                .map(([key, value]) => (
                  <Tag key={key}>
                    {key}: {String(value)}
                  </Tag>
                ))}
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
}
