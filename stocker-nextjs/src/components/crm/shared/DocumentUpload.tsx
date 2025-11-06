'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Select,
  Input,
  Form,
  Space,
  Modal,
  message,
  Card,
  Progress,
  Tag,
  Tooltip,
} from 'antd';
import {
  CloudUploadOutlined,
  FileOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  InboxOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useUploadDocument,
  useDocumentsByEntity,
  useDeleteDocument,
  useDownloadDocument,
} from '@/lib/api/hooks/useCRM';
import type { DocumentCategory, AccessLevel } from '@/lib/api/services/crm.types';

interface DocumentUploadProps {
  entityId: number | string;
  entityType: string;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  multiple?: boolean;
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

// File type icon mapping
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FilePdfOutlined className="text-red-500 text-2xl" />;
    case 'doc':
    case 'docx':
      return <FileWordOutlined className="text-blue-500 text-2xl" />;
    case 'xls':
    case 'xlsx':
      return <FileExcelOutlined className="text-green-500 text-2xl" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <FileImageOutlined className="text-purple-500 text-2xl" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileZipOutlined className="text-orange-500 text-2xl" />;
    default:
      return <FileOutlined className="text-gray-500 text-2xl" />;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export function DocumentUpload({
  entityId,
  entityType,
  maxFileSize = 50,
  allowedFileTypes = [],
  multiple = false,
}: DocumentUploadProps) {
  const [form] = Form.useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadDocument();
  const { data: documents, refetch } = useDocumentsByEntity(entityId, entityType);
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check file size
    const oversizedFiles = acceptedFiles.filter(
      (file) => file.size / 1024 / 1024 > maxFileSize
    );

    if (oversizedFiles.length > 0) {
      message.error(`Bazı dosyalar ${maxFileSize}MB limitini aşıyor`);
      return;
    }

    if (multiple) {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    } else {
      setSelectedFiles(acceptedFiles.slice(0, 1));
    }

    message.success(
      `${acceptedFiles.length} dosya seçildi. Yüklemek için bilgileri doldurun.`
    );
  }, [maxFileSize, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedFileTypes.length > 0
      ? allowedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
    multiple,
    maxSize: maxFileSize * 1024 * 1024,
  });

  const handleUploadClick = () => {
    if (selectedFiles.length === 0) {
      message.warning('Lütfen dosya seçin');
      return;
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (selectedFiles.length === 0) {
        message.error('Dosya seçilmedi');
        return;
      }

      setUploadProgress(0);

      // Upload files sequentially with progress
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        await uploadMutation.mutateAsync({
          file,
          entityId,
          entityType,
          category: values.category,
          metadata: {
            description: values.description,
            tags: values.tags,
            accessLevel: values.accessLevel,
          },
        });

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      message.success(`${selectedFiles.length} dosya başarıyla yüklendi`);
      setIsModalVisible(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Yükleme sırasında hata oluştu');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setUploadProgress(0);
    form.resetFields();
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
        message.success('Doküman silindi');
        refetch();
      },
    });
  };

  const handleDownload = (id: number) => {
    downloadMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Modern Dropzone Upload Section */}
      <Card title="📁 Doküman Yükle" className="shadow-lg">
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <InboxOutlined className="text-6xl text-blue-500 mb-4" />
              {isDragActive ? (
                <p className="text-xl font-semibold text-blue-600">
                  Dosyaları buraya bırakın...
                </p>
              ) : (
                <div>
                  <p className="text-lg font-semibold mb-2">
                    Dosyaları sürükleyip bırakın veya tıklayın
                  </p>
                  <p className="text-gray-500 text-sm">
                    Maksimum dosya boyutu: {maxFileSize}MB
                    {multiple && ' • Birden fazla dosya seçebilirsiniz'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Selected Files Preview */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">
                    Seçili Dosyalar ({selectedFiles.length})
                  </span>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    onClick={handleUploadClick}
                    loading={uploadMutation.isPending}
                  >
                    Yükle
                  </Button>
                </div>

                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeFile(index)}
                      size="small"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Documents List */}
      {documents && documents.length > 0 && (
        <Card
          title={
            <div className="flex items-center space-x-2">
              <FileOutlined />
              <span>Yüklü Dokümanlar ({documents.length})</span>
            </div>
          }
          className="shadow-lg"
        >
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  size="small"
                  className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500"
                  extra={
                    <Space>
                      <Tooltip title="İndir">
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(doc.id)}
                          loading={downloadMutation.isPending}
                          className="hover:text-blue-500"
                        />
                      </Tooltip>
                      <Tooltip title="Sil">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(doc.id)}
                          loading={deleteMutation.isPending}
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <div className="flex items-start space-x-3">
                    {getFileIcon(doc.fileName)}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{doc.fileName}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag color="blue">{doc.category}</Tag>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.fileSizeBytes)}
                        </span>
                        {doc.uploadedBy && (
                          <span className="text-xs text-gray-500">
                            • {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Metadata Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <CloudUploadOutlined className="text-blue-500" />
            <span>Doküman Bilgileri</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={uploadMutation.isPending}
        okText={uploadMutation.isPending ? 'Yükleniyor...' : 'Yükle'}
        cancelText="İptal"
        width={600}
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
            <Select options={documentCategories} size="large" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea
              rows={3}
              placeholder="Doküman açıklaması (opsiyonel)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item name="tags" label="Etiketler">
            <Input
              placeholder="Virgülle ayrılmış etiketler (opsiyonel)"
              prefix={<Tag />}
            />
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="Erişim Seviyesi"
            rules={[{ required: true, message: 'Erişim seviyesi seçiniz' }]}
          >
            <Select options={accessLevels} size="large" />
          </Form.Item>

          {/* Progress Bar */}
          {uploadMutation.isPending && uploadProgress > 0 && (
            <div className="mt-4">
              <Progress
                percent={Math.round(uploadProgress)}
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <p className="text-center text-sm text-gray-500 mt-2">
                {selectedFiles.length > 1
                  ? `${Math.round(uploadProgress / 100 * selectedFiles.length)} / ${selectedFiles.length} dosya yüklendi`
                  : 'Yükleniyor...'
                }
              </p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
