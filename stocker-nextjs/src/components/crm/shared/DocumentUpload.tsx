'use client';

import React, { useState } from 'react';
import {
  Upload,
  Button,
  Select,
  Input,
  Form,
  Space,
  Modal,
  message,
  Card,
} from 'antd';
import { UploadOutlined, FileOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { motion } from 'framer-motion';
import {
  useUploadDocument,
  useDocumentsByEntity,
  useDeleteDocument,
  useDownloadDocument,
} from '@/lib/api/hooks/useCRM';
import type { DocumentCategory, AccessLevel } from '@/lib/api/services/crm.types';

interface DocumentUploadProps {
  entityId: number | string; // Support both numeric IDs and GUIDs
  entityType: string;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

const documentCategories: { label: string; value: DocumentCategory }[] = [
  { label: 'Genel', value: 'General' },
  { label: 'Sözleşme', value: 'Contract' },
  { label: 'Teklif', value: 'Quote' },
  { label: 'Fatura', value: 'Invoice' },
  { label: 'Ödeme', value: 'Payment' },
  { label: 'Diğer', value: 'Other' },
];

const accessLevels: { label: string; value: AccessLevel }[] = [
  { label: 'Herkese Açık', value: 'Public' },
  { label: 'Dahili', value: 'Internal' },
  { label: 'Gizli', value: 'Confidential' },
  { label: 'Çok Gizli', value: 'Restricted' },
];

export function DocumentUpload({
  entityId,
  entityType,
  maxFileSize = 10,
  allowedFileTypes = [],
}: DocumentUploadProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useUploadDocument();
  const { data: documents, refetch } = useDocumentsByEntity(entityId, entityType);
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  const handleUploadClick = () => {
    if (fileList.length === 0) {
      message.warning('Lütfen bir dosya seçin');
      return;
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedFile) {
        message.error('Dosya seçilmedi');
        return;
      }

      await uploadMutation.mutateAsync({
        file: selectedFile,
        entityId,
        entityType,
        category: values.category,
        metadata: {
          description: values.description,
          tags: values.tags,
          accessLevel: values.accessLevel,
        },
      });

      setIsModalVisible(false);
      setFileList([]);
      setSelectedFile(null);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      // Check file size
      const isLt = file.size / 1024 / 1024 < maxFileSize;
      if (!isLt) {
        message.error(`Dosya boyutu ${maxFileSize}MB'dan küçük olmalıdır`);
        return Upload.LIST_IGNORE;
      }

      // Check file type if specified
      if (allowedFileTypes.length > 0) {
        const fileType = file.type;
        const isAllowed = allowedFileTypes.some(type => fileType.includes(type));
        if (!isAllowed) {
          message.error('Bu dosya türü desteklenmiyor');
          return Upload.LIST_IGNORE;
        }
      }

      setSelectedFile(file);
      setFileList([file as any]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
      setSelectedFile(null);
    },
    fileList,
    maxCount: 1,
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Dokümanı sil',
      content: 'Bu dokümanı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        refetch();
      },
    });
  };

  const handleDownload = (id: number) => {
    downloadMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card title="Doküman Yükle" className="shadow-sm">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Dosya Seç</Button>
          </Upload>
          {fileList.length > 0 && (
            <Button
              type="primary"
              onClick={handleUploadClick}
              loading={uploadMutation.isPending}
            >
              Yükle
            </Button>
          )}
        </Space>
      </Card>

      {/* Documents List */}
      {documents && documents.length > 0 && (
        <Card title="Dokümanlar" className="shadow-sm">
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  size="small"
                  className="hover:shadow-md transition-shadow"
                  extra={
                    <Space>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(doc.id)}
                        loading={downloadMutation.isPending}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(doc.id)}
                        loading={deleteMutation.isPending}
                      />
                    </Space>
                  }
                >
                  <Space>
                    <FileOutlined className="text-blue-500 text-lg" />
                    <div>
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-xs text-gray-500">
                        {doc.category} • {(doc.fileSizeBytes / 1024).toFixed(2)} KB
                        {doc.description && ` • ${doc.description}`}
                      </div>
                    </div>
                  </Space>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Metadata Modal */}
      <Modal
        title="Doküman Bilgileri"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={uploadMutation.isPending}
        okText="Yükle"
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: 'General',
            accessLevel: 'Internal',
          }}
        >
          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori seçiniz' }]}
          >
            <Select options={documentCategories} />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Doküman açıklaması (opsiyonel)" />
          </Form.Item>

          <Form.Item name="tags" label="Etiketler">
            <Input placeholder="Virgülle ayrılmış etiketler (opsiyonel)" />
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="Erişim Seviyesi"
            rules={[{ required: true, message: 'Erişim seviyesi seçiniz' }]}
          >
            <Select options={accessLevels} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
