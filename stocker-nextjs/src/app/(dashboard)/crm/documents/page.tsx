'use client';

import React, { useState } from 'react';
import { Table, Button, Empty, Tooltip, Modal, Input, Spin } from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentIcon,
  DocumentTextIcon,
  EyeIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  FolderIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type { DocumentDto, DocumentCategory, AccessLevel } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Search } = Input;

// Document category labels
const categoryLabels: Record<DocumentCategory, { label: string }> = {
  Contract: { label: 'Sozlesme' },
  Proposal: { label: 'Teklif' },
  Invoice: { label: 'Fatura' },
  Report: { label: 'Rapor' },
  Other: { label: 'Diger' },
};

// Access level labels
const accessLevelLabels: Record<AccessLevel, { label: string }> = {
  Private: { label: 'Ozel' },
  Team: { label: 'Ekip' },
  Public: { label: 'Herkese Acik' },
};

// Get file icon based on content type
const getFileIcon = (contentType: string) => {
  if (contentType.includes('pdf')) return <DocumentTextIcon className="w-5 h-5 text-slate-600" />;
  if (contentType.includes('word') || contentType.includes('document')) return <DocumentTextIcon className="w-5 h-5 text-slate-600" />;
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return <DocumentTextIcon className="w-5 h-5 text-slate-600" />;
  if (contentType.includes('image')) return <PhotoIcon className="w-5 h-5 text-slate-600" />;
  return <DocumentIcon className="w-5 h-5 text-slate-600" />;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Stats calculations
  const totalDocuments = documents.length;
  const contractsCount = documents.filter(d => d.category === 'Contract').length;
  const proposalsCount = documents.filter(d => d.category === 'Proposal').length;
  const totalSize = documents.reduce((sum, d) => sum + d.size, 0);

  // Load all documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getAllDocuments();
      setDocuments(data);
      setLoading(false);
    } catch (error) {
      showApiError(error, 'Dokumanlar yuklenemedi');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const handleView = async (document: DocumentDto) => {
    try {
      const downloadUrl = await CRMService.getDownloadUrl(document.id, 60, true);
      window.open(downloadUrl.url, '_blank');
    } catch (error) {
      showApiError(error, 'Goruntuleme basarisiz');
    }
  };

  const handleDownload = async (document: DocumentDto) => {
    try {
      const downloadUrl = await CRMService.getDownloadUrl(document.id, 60, false);
      window.open(downloadUrl.url, '_blank');
      showSuccess('Dokuman indiriliyor');
    } catch (error) {
      showApiError(error, 'Indirme basarisiz');
    }
  };

  const handleDelete = async (document: DocumentDto) => {
    Modal.confirm({
      title: 'Dokumani Sil',
      content: `"${document.fileName}" dosyasini silmek istediginizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await CRMService.deleteDocument(document.id);
          showSuccess('Dokuman silindi');
          loadDocuments();
        } catch (error) {
          showApiError(error, 'Silme basarisiz');
        }
      },
    });
  };

  const columns: ColumnsType<DocumentDto> = [
    {
      title: 'Dosya',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 300,
      ellipsis: true,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            {getFileIcon(record.contentType)}
          </div>
          <div style={{ maxWidth: 220, overflow: 'hidden' }}>
            <Tooltip title={text}>
              <div className="font-medium text-slate-900 truncate">{text}</div>
            </Tooltip>
            <Tooltip title={record.originalFileName}>
              <div className="text-xs text-slate-500 truncate">{record.originalFileName}</div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: DocumentCategory) => {
        const config = categoryLabels[category] || { label: category };
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {config.label}
          </span>
        );
      },
      filters: Object.keys(categoryLabels).map(key => ({
        text: categoryLabels[key as DocumentCategory].label,
        value: key,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Varlik',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 110,
      render: (entityType: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {entityType === 'Customer' ? 'Musteri' : entityType === 'Lead' ? 'Potansiyel' : entityType}
        </span>
      ),
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => <span className="text-slate-600">{formatFileSize(size)}</span>,
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: 'Erisim',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 130,
      render: (level: AccessLevel) => {
        const config = accessLevelLabels[level] || { label: level };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            level === 'Private' ? 'bg-slate-900 text-white' :
            level === 'Team' ? 'bg-slate-200 text-slate-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Yukleyen',
      dataIndex: 'uploadedByName',
      key: 'uploadedByName',
      width: 140,
      ellipsis: true,
      render: (name?: string) => <span className="text-slate-600">{name || 'Bilinmiyor'}</span>,
    },
    {
      title: 'Tarih',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD MMMM YYYY HH:mm')}>
          <span className="text-slate-600">{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.uploadedAt).unix() - dayjs(b.uploadedAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Islemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Goruntule">
            <Button
              type="text"
              size="small"
              icon={<EyeIcon className="w-4 h-4" />}
              onClick={() => handleView(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title="Indir">
            <Button
              type="text"
              size="small"
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
              onClick={() => handleDownload(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              size="small"
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={() => handleDelete(record)}
              className="!text-red-500 hover:!text-red-600"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Filter documents by search text
  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchText.toLowerCase()) ||
    doc.originalFileName.toLowerCase().includes(searchText.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={loading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Belgeler</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Belgelerinizi yukleyin ve yonetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => loadDocuments()}
              disabled={loading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Yeni Belge
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DocumentIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Belge</p>
              <p className="text-2xl font-bold text-slate-900">{totalDocuments}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sozlesmeler</p>
              <p className="text-2xl font-bold text-slate-900">{contractsCount}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FolderIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Teklifler</p>
              <p className="text-2xl font-bold text-slate-900">{proposalsCount}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CloudArrowUpIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Boyut</p>
              <p className="text-2xl font-bold text-slate-900">{formatFileSize(totalSize)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <Search
            placeholder="Belge ara (ad, aciklama)..."
            allowClear
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Documents Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            loading={loading && documents.length > 0}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            locale={{
              emptyText: (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <DocumentIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz belge yok
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Belgelerinizi yuklemek icin ilgili varlik sayfasini kullanin
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={() => setUploadModalOpen(true)}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Belgeyi Yukle
                      </Button>
                    </div>
                  }
                />
              ),
            }}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Toplam ${total} belge`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      </Spin>

      {/* Upload Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CloudArrowUpIcon className="w-5 h-5 text-slate-600" />
            <span className="text-lg font-semibold text-slate-900">Belge Yukle</span>
          </div>
        }
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900 mb-2">Belge Yukleme</h4>
          <p className="text-slate-500">
            Belge yuklemek icin ilgili varlik sayfasini (Musteri, Lead, vb.) kullanin.
            <br />
            Bu sayfa tum belgeleri goruntulemek icindir.
          </p>
        </div>
      </Modal>
    </div>
  );
}
