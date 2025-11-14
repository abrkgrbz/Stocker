'use client';

import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Row, Col, Empty, Tooltip, Modal, Input } from 'antd';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DocumentUpload } from '@/components/crm/shared';
import { showSuccess, showError, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type { DocumentDto, DocumentCategory, AccessLevel } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text } = Typography;
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

  const handleDownload = async (document: DocumentDto) => {
    try {
      const downloadUrl = await CRMService.getDownloadUrl(document.id);
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
      render: (text, record) => (
        <Space>
          {getFileIcon(record.contentType)}
          <div>
            <div className="font-medium">{text}</div>
            <Text className="text-xs text-gray-500">{record.originalFileName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
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
      render: (entityType: string) => (
        <Tag>{entityType === 'Customer' ? 'Müşteri' : entityType === 'Lead' ? 'Potansiyel' : entityType}</Tag>
      ),
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size),
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: 'Erişim',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      render: (level: AccessLevel) => {
        const config = accessLevelLabels[level] || { label: level, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Yükleyen',
      dataIndex: 'uploadedByName',
      key: 'uploadedByName',
      render: (name?: string) => name || 'Bilinmiyor',
    },
    {
      title: 'Tarih',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
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
              onClick={() => handleDownload(record)}
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Dökümanlar
            </Title>
            <Text className="text-gray-500 text-base">
              CRM dökümanlarını merkezi olarak yönetin
            </Text>
          </div>
          <Space size="middle">
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={loadDocuments}
              loading={loading}
            >
              Yenile
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setUploadModalOpen(true)}
            >
              Döküman Yükle
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileOutlined className="text-2xl text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Toplam Döküman</div>
                  <div className="text-2xl font-bold">{documents.length}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FilePdfOutlined className="text-2xl text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">PDF Dökümanlar</div>
                  <div className="text-2xl font-bold">
                    {documents.filter(d => d.contentType.includes('pdf')).length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileImageOutlined className="text-2xl text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Görseller</div>
                  <div className="text-2xl font-bold">
                    {documents.filter(d => d.contentType.includes('image')).length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileTextOutlined className="text-2xl text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Toplam Boyut</div>
                  <div className="text-2xl font-bold">
                    {formatFileSize(documents.reduce((sum, d) => sum + d.size, 0))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <Search
          placeholder="Döküman ara (ad, açıklama)..."
          allowClear
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Documents Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text className="text-gray-500">Henüz döküman yok</Text>
                    <div className="mt-4">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setUploadModalOpen(true)}
                      >
                        İlk Dökümanı Yükle
                      </Button>
                    </div>
                  </div>
                }
              />
            ),
          }}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `Toplam ${total} döküman`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Upload Modal - Placeholder (needs entity selection) */}
      <Modal
        title="Döküman Yükle"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="text-center py-8">
          <FileOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={4}>Döküman Yükleme</Title>
          <Text className="text-gray-500">
            Döküman yüklemek için ilgili varlık sayfasını (Müşteri, Lead, vb.) kullanın.
            <br />
            Bu sayfa tüm dökümanları görüntülemek içindir.
          </Text>
        </div>
      </Modal>
    </div>
  );
}
