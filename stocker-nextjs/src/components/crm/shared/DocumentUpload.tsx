'use client';

import React, { useState, useEffect, useRef } from 'react';
import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';
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
  FileOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  useUploadDocument,
  useDocumentsByEntity,
  useDeleteDocument,
  useDownloadDocument,
} from '@/lib/api/hooks/useCRM';
import type { DocumentCategory, AccessLevel } from '@/lib/api/services/crm.types';

// Disable Dropzone auto-discover
if (typeof window !== 'undefined') {
  Dropzone.autoDiscover = false;
}

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
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dropzoneInstance = useRef<Dropzone | null>(null);

  const uploadMutation = useUploadDocument();
  const { data: documents, refetch } = useDocumentsByEntity(entityId, entityType);
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  useEffect(() => {
    if (!dropzoneRef.current) return;

    // Initialize Dropzone
    const myDropzone = new Dropzone(dropzoneRef.current, {
      url: '/api/placeholder', // Dummy URL (we handle upload manually)
      autoProcessQueue: false,
      maxFilesize: maxFileSize,
      maxFiles: multiple ? null : 1,
      acceptedFiles: allowedFileTypes.length > 0 ? allowedFileTypes.join(',') : undefined,
      addRemoveLinks: true,
      dictDefaultMessage: '📁 Dosyaları buraya sürükleyin veya tıklayın',
      dictFallbackMessage: 'Tarayıcınız drag & drop desteklemiyor.',
      dictFileTooBig: `Dosya çok büyük ({{filesize}}MB). Maksimum: ${maxFileSize}MB.`,
      dictInvalidFileType: 'Bu dosya türü desteklenmiyor.',
      dictRemoveFile: 'Kaldır',
      dictCancelUpload: 'İptal',
      dictMaxFilesExceeded: multiple ? 'Çok fazla dosya.' : 'Sadece bir dosya yükleyebilirsiniz.',
    });

    // Handle file added
    myDropzone.on('addedfile', (file) => {
      setSelectedFiles((prev) => [...prev, file as File]);
    });

    // Handle file removed
    myDropzone.on('removedfile', (file) => {
      setSelectedFiles((prev) => prev.filter((f) => f !== file));
    });

    dropzoneInstance.current = myDropzone;

    return () => {
      if (dropzoneInstance.current) {
        dropzoneInstance.current.destroy();
      }
    };
  }, [maxFileSize, multiple, allowedFileTypes]);

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

      // Clear dropzone
      if (dropzoneInstance.current) {
        dropzoneInstance.current.removeAllFiles();
      }

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
      {/* Dropzone Upload Section */}
      <Card title="📁 Doküman Yükle" className="shadow-lg">
        <div className="space-y-4">
          {/* Dropzone Container */}
          <div ref={dropzoneRef} className="dropzone-custom">
            <div className="dz-message needsclick">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📥</div>
                <p className="text-lg font-semibold mb-2">
                  Dosyaları sürükleyip bırakın veya tıklayın
                </p>
                <p className="text-gray-500 text-sm">
                  Maksimum dosya boyutu: {maxFileSize}MB
                  {multiple && ' • Birden fazla dosya seçebilirsiniz'}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="flex justify-end">
              <Button
                type="primary"
                size="large"
                onClick={handleUploadClick}
                loading={uploadMutation.isPending}
              >
                {selectedFiles.length} Dosya Yükle
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Documents List - Modern Grid Layout */}
      {documents && documents.length > 0 && (
        <Card
          title={
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <FileOutlined className="text-white text-lg" />
              </div>
              <div>
                <div className="text-lg font-semibold">Yüklü Dokümanlar</div>
                <div className="text-sm text-gray-500">{documents.length} dosya</div>
              </div>
            </div>
          }
          className="shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
              >
                <Card
                  className="h-full hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Header with Icon */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.fileName)}
                      </div>
                      <Space>
                        <Tooltip title="İndir">
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(doc.id)}
                            loading={downloadMutation.isPending}
                            className="hover:text-blue-500 hover:bg-blue-50 transition-all"
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip title="Sil">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(doc.id)}
                            loading={deleteMutation.isPending}
                            className="hover:bg-red-50 transition-all"
                            size="small"
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* File Name */}
                    <Tooltip title={doc.fileName}>
                      <div className="font-semibold text-gray-800 truncate text-base">
                        {doc.fileName}
                      </div>
                    </Tooltip>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <Tag
                        color="blue"
                        className="rounded-full px-3 py-1"
                      >
                        {doc.category}
                      </Tag>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      </div>
                    </div>

                    {/* Upload Date */}
                    {doc.uploadedAt && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(doc.uploadedAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {doc.description && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {doc.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hover Gradient Border Effect */}
                  <div
                    className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-lg transition-all duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box'
                    }}
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Metadata Modal */}
      <Modal
        title="📋 Doküman Bilgileri"
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
            <Input placeholder="Virgülle ayrılmış etiketler (opsiyonel)" />
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
                  ? `${Math.round((uploadProgress / 100) * selectedFiles.length)} / ${selectedFiles.length} dosya yüklendi`
                  : 'Yükleniyor...'}
              </p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Dropzone Custom Styles */}
      <style jsx global>{`
        .dropzone-custom {
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          background: #fafafa;
          transition: all 0.3s;
        }

        .dropzone-custom:hover {
          border-color: #1890ff;
          background: #f0f7ff;
        }

        .dropzone-custom.dz-drag-hover {
          border-color: #1890ff;
          background: #e6f4ff;
          transform: scale(1.02);
        }

        .dropzone-custom .dz-preview {
          margin: 16px;
        }

        .dropzone-custom .dz-preview .dz-image {
          border-radius: 8px;
        }

        .dropzone-custom .dz-preview .dz-remove {
          color: #ff4d4f;
          font-size: 12px;
        }

        .dropzone-custom .dz-preview .dz-remove:hover {
          text-decoration: none;
          color: #ff7875;
        }

        .dropzone-custom .dz-message {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
