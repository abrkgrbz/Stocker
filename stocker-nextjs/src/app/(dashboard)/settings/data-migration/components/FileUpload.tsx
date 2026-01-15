'use client';

/**
 * File Upload Step
 * Upload Excel/CSV files with chunking support
 */

import { useState, useCallback, useRef } from 'react';
import { Spinner } from '@/components/primitives';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Trash2,
  HelpCircle,
  Table,
  FileText,
} from 'lucide-react';
import {
  useUploadChunk,
  useDownloadTemplate,
  useCompleteUpload,
  entityTypeLabels,
} from '@/lib/api/hooks/useMigration';
import type {
  MigrationSessionDto,
  MigrationEntityType,
} from '@/lib/api/services/migration.service';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  sessionId: string;
  session: MigrationSessionDto | undefined;
  onNext: () => void;
  onBack: () => void;
}

interface UploadedFile {
  entityType: MigrationEntityType;
  fileName: string;
  recordCount: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
  data?: Record<string, any>[];
}

const CHUNK_SIZE = 500; // Records per chunk

export default function FileUpload({ sessionId, session, onNext, onBack }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<MigrationEntityType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadChunk = useUploadChunk();
  const downloadTemplate = useDownloadTemplate();
  const completeUpload = useCompleteUpload();

  // Parse Excel/CSV file
  const parseFile = async (file: File, entityType: MigrationEntityType): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          resolve(jsonData as Record<string, any>[]);
        } catch (error) {
          reject(new Error('Dosya okunamadı'));
        }
      };

      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsBinaryString(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null, entityType: MigrationEntityType) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Update state with pending file
    const uploadedFile: UploadedFile = {
      entityType,
      fileName: file.name,
      recordCount: 0,
      status: 'pending',
    };

    setUploadedFiles(prev => {
      // Remove existing file for this entity type
      const filtered = prev.filter(f => f.entityType !== entityType);
      return [...filtered, uploadedFile];
    });

    try {
      // Parse file
      const data = await parseFile(file, entityType);

      if (data.length === 0) {
        throw new Error('Dosyada veri bulunamadı');
      }

      // Update with parsed data
      setUploadedFiles(prev =>
        prev.map(f =>
          f.entityType === entityType
            ? { ...f, recordCount: data.length, data, status: 'uploading' as const }
            : f
        )
      );

      // Upload in chunks
      const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const chunkData = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

        await uploadChunk.mutateAsync({
          sessionId,
          entityType,
          chunkIndex: i,
          totalChunks,
          data: chunkData,
        });
      }

      // Mark as uploaded
      setUploadedFiles(prev =>
        prev.map(f =>
          f.entityType === entityType
            ? { ...f, status: 'uploaded' as const }
            : f
        )
      );
    } catch (error) {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.entityType === entityType
            ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
            : f
        )
      );
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, entityType: MigrationEntityType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files, entityType);
    }
  }, [sessionId]);

  // Handle template download
  const handleDownloadTemplate = async (entityType: MigrationEntityType) => {
    try {
      await downloadTemplate.mutateAsync(entityType);
    } catch {
      // Error handled by mutation
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (entityType: MigrationEntityType) => {
    setUploadedFiles(prev => prev.filter(f => f.entityType !== entityType));
  };

  // Check if all required entities have files uploaded
  const allEntitiesUploaded = session?.entities.every(entity =>
    uploadedFiles.some(f => f.entityType === entity && f.status === 'uploaded')
  );

  const hasAnyUploads = uploadedFiles.some(f => f.status === 'uploaded');
  const [isCompletingUpload, setIsCompletingUpload] = useState(false);

  // Handle next step - complete upload first
  const handleNext = async () => {
    try {
      setIsCompletingUpload(true);
      // Complete the upload before moving to mapping step
      await completeUpload.mutateAsync(sessionId);
      onNext();
    } catch (error) {
      console.error('Failed to complete upload:', error);
    } finally {
      setIsCompletingUpload(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex gap-3">
          <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-900 mb-1">Dosya Yükleme</p>
            <p>
              Her veri türü için bir Excel (.xlsx) veya CSV dosyası yükleyin.
              İsterseniz önce şablon dosyasını indirip verilerinizi bu şablona aktarabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Entity Upload Cards */}
      <div className="space-y-4">
        {session?.entities.map((entityType) => {
          const uploadedFile = uploadedFiles.find(f => f.entityType === entityType);
          const isUploading = uploadedFile?.status === 'uploading';
          const isUploaded = uploadedFile?.status === 'uploaded';
          const hasError = uploadedFile?.status === 'error';

          return (
            <div
              key={entityType}
              className={`border-2 rounded-lg transition-all ${
                dragActive && selectedEntity === entityType
                  ? 'border-blue-400 bg-blue-50'
                  : isUploaded
                    ? 'border-emerald-200 bg-emerald-50'
                    : hasError
                      ? 'border-red-200 bg-red-50'
                      : 'border-slate-200 bg-white'
              }`}
              onDragEnter={(e) => {
                handleDrag(e);
                setSelectedEntity(entityType as MigrationEntityType);
              }}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, entityType as MigrationEntityType)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isUploaded ? 'bg-emerald-100' : hasError ? 'bg-red-100' : 'bg-slate-100'
                    }`}>
                      {isUploaded ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : hasError ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <FileSpreadsheet className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{entityTypeLabels[entityType as MigrationEntityType]}</p>
                      {uploadedFile && (
                        <p className="text-xs text-slate-500">
                          {uploadedFile.fileName} • {uploadedFile.recordCount} kayıt
                        </p>
                      )}
                      {hasError && (
                        <p className="text-xs text-red-600">{uploadedFile?.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadTemplate(entityType as MigrationEntityType)}
                      disabled={downloadTemplate.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Şablon
                    </button>

                    {isUploaded && (
                      <button
                        onClick={() => handleRemoveFile(entityType as MigrationEntityType)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload Area */}
                {!isUploaded && (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileSelect(e.target.files, entityType as MigrationEntityType)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive && selectedEntity === entityType
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size="sm" />
                          <span className="text-sm text-slate-600">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">
                            Dosyayı sürükleyin veya <span className="text-blue-600 font-medium">seçin</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Excel (.xlsx, .xls) veya CSV dosyası
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview for uploaded file */}
                {isUploaded && uploadedFile?.data && uploadedFile.data.length > 0 && (
                  <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                      <Table className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">Önizleme (ilk 3 kayıt)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                          <tr>
                            {Object.keys(uploadedFile.data[0]).slice(0, 5).map((key) => (
                              <th
                                key={key}
                                className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                            {Object.keys(uploadedFile.data[0]).length > 5 && (
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                                ...
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {uploadedFile.data.slice(0, 3).map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).slice(0, 5).map((value, i) => (
                                <td
                                  key={i}
                                  className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap max-w-[150px] truncate"
                                >
                                  {String(value)}
                                </td>
                              ))}
                              {Object.keys(row).length > 5 && (
                                <td className="px-3 py-2 text-xs text-slate-400">...</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Summary */}
      {uploadedFiles.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Yükleme Özeti
              </p>
              <p className="text-xs text-slate-500">
                {uploadedFiles.filter(f => f.status === 'uploaded').length} / {session?.entities.length} veri türü yüklendi
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {uploadedFiles.reduce((sum, f) => sum + (f.status === 'uploaded' ? f.recordCount : 0), 0).toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-slate-500">toplam kayıt</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Geri
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnyUploads || isCompletingUpload}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCompletingUpload ? (
            <>
              <Spinner size="sm" />
              Yükleme Tamamlanıyor...
            </>
          ) : (
            <>
              Alan Eşlemeye Devam Et
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
