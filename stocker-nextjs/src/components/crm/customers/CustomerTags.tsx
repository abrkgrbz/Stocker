'use client';

import React, { useState } from 'react';
import { Tag, Input, Button, Modal, Form, Popover } from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import {
  useCustomerTags,
  useAddCustomerTag,
  useRemoveCustomerTag,
  useAllTags,
} from '@/lib/api/hooks/useCRM';
import type { Guid } from '@/lib/api/services/crm.types';

interface CustomerTagsProps {
  customerId: Guid;
  editable?: boolean;
  size?: 'small' | 'default' | 'large';
}

const predefinedColors = [
  { name: 'Kırmızı', value: '#ef4444' },
  { name: 'Turuncu', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yeşil', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Mavi', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Mor', value: '#a855f7' },
  { name: 'Pembe', value: '#ec4899' },
  { name: 'Gri', value: '#6b7280' },
];

export function CustomerTags({ customerId, editable = false, size = 'default' }: CustomerTagsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [form] = Form.useForm();

  const { data: tags, isLoading } = useCustomerTags(customerId);
  const { data: allTags } = useAllTags();
  const addTagMutation = useAddCustomerTag();
  const removeTagMutation = useRemoveCustomerTag();

  const handleAddTag = async () => {
    if (!tagName.trim()) return;

    try {
      await addTagMutation.mutateAsync({
        customerId,
        tagName: tagName.trim(),
        color: selectedColor,
      });
      setIsModalVisible(false);
      setTagName('');
      setSelectedColor('#3b82f6');
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tagId: Guid) => {
    Modal.confirm({
      title: 'Etiketi Kaldır',
      content: 'Bu etiketi müşteriden kaldırmak istediğinizden emin misiniz?',
      okText: 'Kaldır',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        await removeTagMutation.mutateAsync({ id: tagId, customerId });
      },
    });
  };

  const handleQuickAdd = async (existingTagName: string) => {
    try {
      await addTagMutation.mutateAsync({
        customerId,
        tagName: existingTagName,
        color: '#3b82f6',
      });
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="animate-pulse bg-slate-200 h-6 w-16 rounded-md"></div>
        <div className="animate-pulse bg-slate-200 h-6 w-20 rounded-md"></div>
      </div>
    );
  }

  // Filter out already added tags from suggestions
  const existingTagNames = tags?.map(t => t.tagName) || [];
  const suggestedTags = allTags?.filter(t => !existingTagNames.includes(t)).slice(0, 5) || [];

  return (
    <div className="space-y-3">
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 items-center">
        {tags?.length === 0 && !editable && (
          <span className="text-sm text-slate-400">Etiket yok</span>
        )}

        {tags?.map((tag) => (
          <Tag
            key={tag.id}
            color={tag.color || 'blue'}
            closable={editable}
            onClose={(e) => {
              e.preventDefault();
              handleRemoveTag(tag.id);
            }}
            className="m-0 px-3 py-1 text-sm rounded-md border-0"
            style={{
              backgroundColor: tag.color ? `${tag.color}20` : undefined,
              color: tag.color || undefined,
            }}
          >
            {tag.tagName}
          </Tag>
        ))}

        {editable && (
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md px-3 h-7"
          >
            Ekle
          </Button>
        )}
      </div>

      {/* Quick Add from Existing Tags */}
      {editable && suggestedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400">Önerilen:</span>
          {suggestedTags.map((tagName) => (
            <button
              key={tagName}
              onClick={() => handleQuickAdd(tagName)}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              + {tagName}
            </button>
          ))}
        </div>
      )}

      {/* Add Tag Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <PlusOutlined className="text-slate-600" />
            </div>
            <span>Yeni Etiket Ekle</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleAddTag}
        onCancel={() => {
          setIsModalVisible(false);
          setTagName('');
          setSelectedColor('#3b82f6');
        }}
        confirmLoading={addTagMutation.isPending}
        okText="Ekle"
        cancelText="İptal"
        centered
        width={400}
      >
        <div className="py-4 space-y-4">
          {/* Tag Name Input */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Etiket Adı
            </label>
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Örn: VIP Müşteri"
              size="large"
              className="rounded-lg"
              onPressEnter={handleAddTag}
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
              Renk
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    selectedColor === color.value
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <CheckOutlined className="text-white text-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {tagName && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Önizleme
              </label>
              <Tag
                className="m-0 px-3 py-1 text-sm rounded-md border-0"
                style={{
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                {tagName}
              </Tag>
            </div>
          )}

          {/* Existing Tags Suggestions */}
          {allTags && allTags.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Mevcut Etiketler
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagName(tag)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      tagName === tag
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

// Simplified version for display only (e.g., in tables)
export function CustomerTagList({ customerId }: { customerId: Guid }) {
  const { data: tags, isLoading } = useCustomerTags(customerId);

  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 h-5 w-20 rounded"></div>;
  }

  if (!tags || tags.length === 0) {
    return <span className="text-slate-400 text-sm">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <Tag
          key={tag.id}
          className="m-0 px-2 py-0.5 text-xs rounded border-0"
          style={{
            backgroundColor: tag.color ? `${tag.color}20` : '#e2e8f0',
            color: tag.color || '#64748b',
          }}
        >
          {tag.tagName}
        </Tag>
      ))}
      {tags.length > 3 && (
        <span className="text-xs text-slate-400">+{tags.length - 3}</span>
      )}
    </div>
  );
}
