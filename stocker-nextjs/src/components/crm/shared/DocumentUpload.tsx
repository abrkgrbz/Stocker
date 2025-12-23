'use client';

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';
import {
  Select,
  Input,
  Form,
  Modal,
  message,
  Progress,
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
  UploadOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  EyeOutlined,
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

const documentCategories: { label: string; value: string }[] = [
  { label: 'Genel', value: 'General' },
  { label: 'Sözleşme', value: 'Contract' },
  { label: 'Teklif', value: 'Quote' },
  { label: 'Fatura', value: 'Invoice' },
  { label: 'Ödeme', value: 'Payment' },
  { label: 'Diğer', value: 'Other' },
];

const accessLevels: { label: string; value: string }[] = [
  { label: 'Herkese Açık', value: 'Public' },
  { label: 'Dahili', value: 'Internal' },
  { label: 'Gizli', value: 'Confidential' },
  { label: 'Çok Gizli', value: 'Restricted' },
];

// File type icon and color mapping - Enterprise Design
const getFileTypeInfo = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return {
        icon: <FilePdfOutlined className="text-red-600 text-lg" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        label: 'PDF',
      };
    case 'doc':
    case 'docx':
      return {
        icon: <FileWordOutlined className="text-blue-600 text-lg" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        label: 'Word',
      };
    case 'xls':
    case 'xlsx':
      return {
        icon: <FileExcelOutlined className="text-green-600 text-lg" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        label: 'Excel',
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return {
        icon: <FileImageOutlined className="text-purple-600 text-lg" />,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        label: 'Image',
      };
    case 'zip':
    case 'rar':
    case '7z':
      return {
        icon: <FileZipOutlined className="text-orange-600 text-lg" />,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        label: 'Archive',
      };
    default:
      return {
        icon: <FileOutlined className="text-slate-500 text-lg" />,
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-500',
        label: 'File',
      };
  }
};

// Category labels in Turkish
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'General': 'Genel',
    'Contract': 'Sözleşme',
    'Quote': 'Teklif',
    'Invoice': 'Fatura',
    'Payment': 'Ödeme',
    'Other': 'Diğer',
  };
  return labels[category] || category;
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
  const [isDragging, setIsDragging] = useState(false);
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
      addRemoveLinks: false,
      clickable: '.upload-trigger', // Only trigger on button click
      previewsContainer: false, // Disable preview UI
      dictDefaultMessage: '',
      dictFallbackMessage: 'Tarayıcınız drag & drop desteklemiyor.',
      dictFileTooBig: `Dosya çok büyük ({{filesize}}MB). Maksimum: ${maxFileSize}MB.`,
      dictInvalidFileType: 'Bu dosya türü desteklenmiyor.',
    });

    // Handle file added
    myDropzone.on('addedfile', (file: any) => {
      setSelectedFiles((prev) => [...prev, file as File]);
      setIsDragging(false);
      // Auto open modal when file is added
      setIsModalVisible(true);
    });

    // Handle drag events
    myDropzone.on('dragenter', () => setIsDragging(true));
    myDropzone.on('dragleave', () => setIsDragging(false));
    myDropzone.on('drop', () => setIsDragging(false));

    dropzoneInstance.current = myDropzone;

    return () => {
      if (dropzoneInstance.current) {
        dropzoneInstance.current.destroy();
      }
    };
  }, [maxFileSize, multiple, allowedFileTypes]);

  const handleNewDocumentClick = () => {
    // Trigger file selection dialog
    if (dropzoneInstance.current) {
      const fileInput = dropzoneRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
      fileInput?.click();
    }
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

      // Clear dropzone and selected files
      if (dropzoneInstance.current) {
        dropzoneInstance.current.removeAllFiles();
      }
      setSelectedFiles([]);

      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Yükleme sırasında hata oluştu');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setUploadProgress(0);
    setSelectedFiles([]);
    form.resetFields();

    // Clear dropzone
    if (dropzoneInstance.current) {
      dropzoneInstance.current.removeAllFiles();
    }
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
    <div className="relative">
      {/* Header - Enterprise Design */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50">
            <FileOutlined className="text-emerald-600 text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-900 m-0">Dokümanlar</h3>
              {documents && documents.length > 0 && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {documents.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 m-0">Firmaya ait dokümanlar ve belgeler</p>
          </div>
        </div>
        <button
          onClick={handleNewDocumentClick}
          className="upload-trigger inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
        >
          <UploadOutlined />
          Yeni Doküman
        </button>
      </div>

      {/* Dropzone Container */}
      <div ref={dropzoneRef} className="dropzone-modern relative">
        {/* Drag Overlay - Enterprise Design */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-emerald-50/90 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CloudUploadOutlined className="text-emerald-600 text-3xl" />
              </div>
              <p className="text-lg font-medium text-emerald-700 mb-1">
                Yüklemek için buraya bırakın
              </p>
              <p className="text-sm text-emerald-600">
                Maksimum dosya boyutu: {maxFileSize}MB
              </p>
            </div>
          </div>
        )}

        {/* Documents List or Empty State */}
        {documents && documents.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {documents.map((doc, index) => {
              const fileInfo = getFileTypeInfo(doc.fileName);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* File Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${fileInfo.bgColor}`}>
                        {fileInfo.icon}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Tooltip title={doc.fileName}>
                            <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                              {doc.fileName}
                            </span>
                          </Tooltip>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${fileInfo.bgColor} ${fileInfo.textColor}`}>
                            {fileInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {getCategoryLabel(doc.category)}
                          </span>
                          <span>{formatFileSize(doc.fileSize || 0)}</span>
                          {doc.uploadedAt && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}</span>
                            </>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-500 mt-1 truncate max-w-md">{doc.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4">
                      <Tooltip title="İndir">
                        <button
                          onClick={() => handleDownload(doc.id)}
                          disabled={downloadMutation.isPending}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                        >
                          <DownloadOutlined />
                        </button>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        >
                          <DeleteOutlined />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State - Enterprise Design */
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <FileOutlined className="text-xl" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">Doküman bulunmuyor</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm">
              Dokümanları sürükleyip bırakın veya yükle butonuna tıklayın
            </p>
            <button
              onClick={handleNewDocumentClick}
              className="upload-trigger inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <UploadOutlined />
              İlk Dokümanı Yükle
            </button>
          </div>
        )}
      </div>

      {/* Upload Metadata Modal - Enterprise Design */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        centered
        className="enterprise-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <UploadOutlined className="text-emerald-600 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 m-0">Doküman Yükle</h2>
            <p className="text-sm text-slate-500 m-0">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} dosya seçildi`
                : 'Doküman bilgilerini girin'}
            </p>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
                <FileOutlined className="text-slate-500 text-xs" />
              </div>
              <span className="text-sm font-medium text-slate-700">Seçilen Dosyalar</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              {selectedFiles.map((file, index) => {
                const fileInfo = getFileTypeInfo(file.name);
                return (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-md p-2 border border-slate-200">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${fileInfo.bgColor}`}>
                      {fileInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: 'General',
            accessLevel: 'Internal',
          }}
          className="mt-6"
        >
          {/* Category Section */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
              <FileOutlined className="text-slate-500 text-xs" />
            </div>
            <span className="text-sm font-medium text-slate-700">Doküman Bilgileri</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label={<span className="text-sm text-slate-600">Kategori</span>}
              rules={[{ required: true, message: 'Kategori seçiniz' }]}
              className="mb-4"
            >
              <Select
                options={documentCategories}
                className="w-full"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="accessLevel"
              label={<span className="text-sm text-slate-600">Erişim Seviyesi</span>}
              rules={[{ required: true, message: 'Erişim seviyesi seçiniz' }]}
              className="mb-4"
            >
              <Select
                options={accessLevels}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="text-sm text-slate-600">Açıklama</span>}
            className="mb-4"
          >
            <Input.TextArea
              rows={3}
              placeholder="Doküman açıklaması (opsiyonel)"
              showCount
              maxLength={500}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label={<span className="text-sm text-slate-600">Etiketler</span>}
            className="mb-6"
          >
            <Input
              placeholder="Virgülle ayrılmış etiketler (opsiyonel)"
              className="rounded-lg"
            />
          </Form.Item>

          {/* Progress Bar */}
          {uploadMutation.isPending && uploadProgress > 0 && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
              <Progress
                percent={Math.round(uploadProgress)}
                status="active"
                strokeColor={{
                  '0%': '#10b981',
                  '100%': '#059669',
                }}
              />
              <p className="text-center text-sm text-emerald-700 mt-2">
                {selectedFiles.length > 1
                  ? `${Math.round((uploadProgress / 100) * selectedFiles.length)} / ${selectedFiles.length} dosya yüklendi`
                  : 'Yükleniyor...'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleModalCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleModalOk}
              disabled={uploadMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <UploadOutlined />
                  Yükle
                </>
              )}
            </button>
          </div>
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
