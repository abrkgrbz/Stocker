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

// File type icon and color mapping
const getFileTypeInfo = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return {
        icon: <FilePdfOutlined className="text-white text-2xl" />,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    case 'doc':
    case 'docx':
      return {
        icon: <FileWordOutlined className="text-white text-2xl" />,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    case 'xls':
    case 'xlsx':
      return {
        icon: <FileExcelOutlined className="text-white text-2xl" />,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return {
        icon: <FileImageOutlined className="text-white text-2xl" />,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      };
    case 'zip':
    case 'rar':
    case '7z':
      return {
        icon: <FileZipOutlined className="text-white text-2xl" />,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    default:
      return {
        icon: <FileOutlined className="text-white text-2xl" />,
        color: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
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

      {/* Documents List - Colorful Compact Layout */}
      {documents && documents.length > 0 && (
        <Card
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileOutlined className="text-xl" />
                <span className="font-semibold">Dokümanlar</span>
                <span className="text-sm text-gray-500">({documents.length})</span>
              </div>
            </div>
          }
          className="shadow-lg"
        >
          <div className="space-y-3">
            {documents.map((doc, index) => {
              const fileInfo = getFileTypeInfo(doc.fileName);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${fileInfo.borderColor} ${fileInfo.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                  >
                    {/* Icon Section */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br ${fileInfo.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      {fileInfo.icon}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      {/* File Name */}
                      <Tooltip title={doc.fileName}>
                        <h3 className="font-semibold text-gray-900 truncate text-lg mb-1">
                          {doc.fileName}
                        </h3>
                      </Tooltip>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Tag color="blue" className="m-0">
                          {doc.category}
                        </Tag>
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                          {formatFileSize(doc.fileSize)}
                        </span>
                        {doc.uploadedAt && (
                          <span className="text-xs text-gray-500">
                            📅 {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {doc.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <Tooltip title="İndir">
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(doc.id)}
                          loading={downloadMutation.isPending}
                          className="shadow-sm"
                          size="large"
                        />
                      </Tooltip>
                      <Tooltip title="Sil">
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(doc.id)}
                          loading={deleteMutation.isPending}
                          size="large"
                        />
                      </Tooltip>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
