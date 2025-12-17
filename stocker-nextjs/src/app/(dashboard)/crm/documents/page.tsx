'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Empty, Tooltip, Modal, Input, Spin } from 'antd';
import {
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';
import { DocumentUpload } from '@/components/crm/shared';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type { DocumentDto, DocumentCategory, AccessLevel } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Search } = Input;

// Document category labels
const categoryLabels: Record<DocumentCategory, { label: string; color: string }> = {
  Contract: { label: 'Sözleşme', color: 'blue' },
  Proposal: { label: 'Teklif', color: 'purple' },
  Invoice: { label: 'Fatura', color: 'green' },
  Report: { label: 'Rapor', color: 'orange' },
  Other: { label: 'Diğer', color: 'default' },
};

// Access level labels
const accessLevelLabels: Record<AccessLevel, { label: string; color: string }> = {
  Private: { label: 'Özel', color: 'red' },
  Team: { label: 'Ekip', color: 'blue' },
  Public: { label: 'Herkese Açık', color: 'green' },
};

// Get file icon based on content type
const getFileIcon = (contentType: string) => {
  if (contentType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
  if (contentType.includes('word') || contentType.includes('document')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
  if (contentType.includes('image')) return <FileImageOutlined style={{ color: '#722ed1' }} />;
  return <FileTextOutlined />;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Stats component
interface DocumentsStatsProps {
  documents: DocumentDto[];
  loading: boolean;
}

const DocumentsStats: React.FC<DocumentsStatsProps> = ({ documents, loading }) => {
  const stats = {
    total: documents.length,
    contracts: documents.filter(d => d.category === 'Contract').length,
    proposals: documents.filter(d => d.category === 'Proposal').length,
    totalSize: documents.reduce((sum, d) => sum + d.size, 0),
  };

  const statCards = [
    {
      title: 'Toplam Belge',
      value: stats.total,
      icon: <FileOutlined className="text-2xl" />,
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
    },
    {
      title: 'Sözleşmeler',
      value: stats.contracts,
      icon: <FileTextOutlined className="text-2xl" />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Teklifler',
      value: stats.proposals,
      icon: <FileMarkdownOutlined className="text-2xl" />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Toplam Boyut',
      value: formatFileSize(stats.totalSize),
      icon: <FilePdfOutlined className="text-2xl" />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-semibold text-slate-900">
                {loading ? <Spin size="small" /> : stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Load all documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getAllDocuments();
      setDocuments(data);
      setLoading(false);
    } catch (error) {
      showApiError(error, 'Dökümanlar yüklenemedi');
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const handleView = async (document: DocumentDto) => {
    try {
      const downloadUrl = await CRMService.getDownloadUrl(document.id, 60, true); // inline=true
      window.open(downloadUrl.url, '_blank');
    } catch (error) {
      showApiError(error, 'Görüntüleme başarısız');
    }
  };

  const handleDownload = async (document: DocumentDto) => {
    try {
      const downloadUrl = await CRMService.getDownloadUrl(document.id, 60, false); // inline=false
      window.open(downloadUrl.url, '_blank');
      showSuccess('Döküman indiriliyor');
    } catch (error) {
      showApiError(error, 'İndirme başarısız');
    }
  };

  const handleDelete = async (document: DocumentDto) => {
    Modal.confirm({
      title: 'Dökümanı Sil',
      content: `"${document.fileName}" dosyasını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await CRMService.deleteDocument(document.id);
          showSuccess('Döküman silindi');
          loadDocuments();
        } catch (error) {
          showApiError(error, 'Silme başarısız');
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
        <Space>
          {getFileIcon(record.contentType)}
          <div style={{ maxWidth: 250, overflow: 'hidden' }}>
            <Tooltip title={text}>
              <div className="font-medium truncate">{text}</div>
            </Tooltip>
            <Tooltip title={record.originalFileName}>
              <div className="text-xs text-slate-500 truncate">{record.originalFileName}</div>
            </Tooltip>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: DocumentCategory) => {
        const config = categoryLabels[category] || { label: category, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: Object.keys(categoryLabels).map(key => ({
        text: categoryLabels[key as DocumentCategory].label,
        value: key,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Varlık',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 110,
      render: (entityType: string) => (
        <Tag>{entityType === 'Customer' ? 'Müşteri' : entityType === 'Lead' ? 'Potansiyel' : entityType}</Tag>
      ),
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size),
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: 'Erişim',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 130,
      render: (level: AccessLevel) => {
        const config = accessLevelLabels[level] || { label: level, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Yükleyen',
      dataIndex: 'uploadedByName',
      key: 'uploadedByName',
      width: 140,
      ellipsis: true,
      render: (name?: string) => name || 'Bilinmiyor',
    },
    {
      title: 'Tarih',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD MMMM YYYY HH:mm')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.uploadedAt).unix() - dayjs(b.uploadedAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Görüntüle">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="İndir">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <DocumentsStats documents={documents} loading={loading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<FileOutlined />}
        iconColor="#0f172a"
        title="Belgeler"
        description="Belgeleri yükleyin ve yönetin"
        itemCount={filteredDocuments.length}
        primaryAction={{
          label: 'Yeni Belge',
          onClick: () => setUploadModalOpen(true),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => loadDocuments()}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Search
          placeholder="Belge ara (ad, açıklama)..."
          allowClear
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Documents Table */}
      {loading && documents.length === 0 ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            loading={loading && documents.length > 0}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <div className="text-slate-500 mb-4">Henüz belge yok</div>
                      <div>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setUploadModalOpen(true)}
                        >
                          İlk Belgeyi Yükle
                        </Button>
                      </div>
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
        </DataTableWrapper>
      )}

      {/* Upload Modal */}
      <Modal
        title="Belge Yükle"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="text-center py-8">
          <FileOutlined className="text-6xl text-slate-300 mb-4" />
          <h4 className="text-lg font-semibold text-slate-900 mb-2">Belge Yükleme</h4>
          <p className="text-slate-500">
            Belge yüklemek için ilgili varlık sayfasını (Müşteri, Lead, vb.) kullanın.
            <br />
            Bu sayfa tüm belgeleri görüntülemek içindir.
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}
