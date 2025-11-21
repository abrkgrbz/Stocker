'use client';

import React, { useState } from 'react';
import { Tag, Input, Button, Space, Tooltip, Modal, Form, ColorPicker, message } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
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
  '#f50', '#2db7f5', '#87d068', '#108ee9', '#ff6b6b',
  '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe',
  '#fd79a8', '#fdcb6e', '#e17055', '#00b894', '#0984e3'
];

export function CustomerTags({ customerId, editable = false, size = 'default' }: CustomerTagsProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: tags, isLoading } = useCustomerTags(customerId);
  const { data: allTags } = useAllTags();
  const addTagMutation = useAddCustomerTag();
  const removeTagMutation = useRemoveCustomerTag();

  const handleAddTag = async () => {
    try {
      const values = await form.validateFields();
      await addTagMutation.mutateAsync({
        customerId,
        tagName: values.tagName,
        color: values.color?.toHexString?.() || values.color || '#108ee9',
      });
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tagId: Guid) => {
    Modal.confirm({
      title: 'Etiketi kaldır',
      content: 'Bu etiketi müşteriden kaldırmak istediğinizden emin misiniz?',
      okText: 'Kaldır',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await removeTagMutation.mutateAsync({ id: tagId, customerId });
      },
    });
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <AnimatePresence mode="popLayout">
        {tags?.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.05 }}
          >
            <Tag
              color={tag.color || 'blue'}
              closable={editable}
              onClose={() => handleRemoveTag(tag.id)}
              style={{
                fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                padding: size === 'small' ? '2px 8px' : size === 'large' ? '6px 12px' : '4px 10px',
              }}
            >
              {tag.tagName}
            </Tag>
          </motion.div>
        ))}
      </AnimatePresence>

      {editable && (
        <Tooltip title="Etiket ekle">
          <Button
            type="dashed"
            size={size as any}
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Etiket Ekle
          </Button>
        </Tooltip>
      )}

      <Modal
        title="Yeni Etiket Ekle"
        open={isModalVisible}
        onOk={handleAddTag}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={addTagMutation.isPending}
        okText="Ekle"
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            color: '#108ee9',
          }}
        >
          <Form.Item
            name="tagName"
            label="Etiket Adı"
            rules={[
              { required: true, message: 'Etiket adı gerekli' },
              { min: 2, message: 'En az 2 karakter olmalı' },
              { max: 50, message: 'En fazla 50 karakter olabilir' },
            ]}
          >
            <Input
              placeholder="Örn: VIP Müşteri, Yeni, Potansiyel"
              autoFocus
              list="existing-tags"
            />
            {allTags && allTags.length > 0 && (
              <datalist id="existing-tags">
                {allTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            )}
          </Form.Item>

          <Form.Item name="color" label="Renk">
            <ColorPicker
              presets={[
                {
                  label: 'Önerilenler',
                  colors: predefinedColors,
                },
              ]}
              showText
            />
          </Form.Item>

          {allTags && allTags.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Mevcut etiketler:</div>
              <Space wrap>
                {allTags.slice(0, 10).map((tag) => (
                  <Tag
                    key={tag}
                    style={{ cursor: 'pointer' }}
                    onClick={() => form.setFieldsValue({ tagName: tag })}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}

// Simplified version for display only (e.g., in tables)
export function CustomerTagList({ customerId }: { customerId: Guid }) {
  const { data: tags, isLoading } = useCustomerTags(customerId);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>;
  }

  if (!tags || tags.length === 0) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  return (
    <Space wrap size={4}>
      {tags.map((tag) => (
        <Tag key={tag.id} color={tag.color || 'blue'} style={{ margin: 0 }}>
          {tag.tagName}
        </Tag>
      ))}
    </Space>
  );
}
