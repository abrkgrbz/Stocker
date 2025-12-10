import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Popconfirm,
  Tag,
  Statistic,
  Row,
  Col,
  Progress,
  Tooltip,
  Modal,
  Alert,
  Spin,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FileOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { storageService, BucketInfo } from '../../services/api/index';

const { Title, Text } = Typography;

interface BucketWithKey extends BucketInfo {
  key: string;
}

const StoragePage: React.FC = () => {
  const [buckets, setBuckets] = useState<BucketWithKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalUsedBytes: 0,
    totalUsedGB: 0,
    totalObjects: 0,
  });

  const fetchBuckets = async () => {
    setLoading(true);
    try {
      const response = await storageService.getAllBuckets();
      console.log('Storage API Response:', response);
      if (response.success) {
        console.log('Buckets data:', response.data);
        setBuckets(response.data.map(b => ({ ...b, key: b.name })));
        setStats({
          totalCount: response.totalCount,
          totalUsedBytes: response.totalUsedBytes,
          totalUsedGB: response.totalUsedGB,
          totalObjects: response.totalObjects,
        });
      } else {
        console.error('API returned success: false', response);
        message.error('Bucket listesi alınamadı');
      }
    } catch (error: any) {
      console.error('Storage API Error:', error);
      message.error(error.message || 'Bucket listesi alınırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const handleDelete = async (bucketName: string) => {
    setDeleting(bucketName);
    try {
      const response = await storageService.deleteBucket(bucketName);
      if (response.success) {
        message.success(`'${bucketName}' bucket'ı silindi`);
        fetchBuckets();
      } else {
        message.error(response.message || 'Silme işlemi başarısız');
      }
    } catch (error: any) {
      message.error(error.message || 'Silme işlemi sırasında hata oluştu');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Lütfen silinecek bucket\'ları seçin');
      return;
    }

    Modal.confirm({
      title: 'Toplu Silme Onayı',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Alert
            type="error"
            message="Bu işlem geri alınamaz!"
            description={`${selectedRowKeys.length} adet bucket ve içindeki tüm dosyalar kalıcı olarak silinecektir.`}
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text strong>Silinecek bucket'lar:</Text>
          <ul style={{ maxHeight: 200, overflow: 'auto' }}>
            {selectedRowKeys.map(key => (
              <li key={key.toString()}>{key.toString()}</li>
            ))}
          </ul>
        </div>
      ),
      okText: 'Evet, Hepsini Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        setBulkDeleting(true);
        try {
          const response = await storageService.deleteMultipleBuckets(
            selectedRowKeys.map(k => k.toString())
          );

          if (response.success) {
            message.success(`${response.successCount} bucket başarıyla silindi`);
          } else {
            message.warning(response.message);
          }

          // Show detailed results
          if (response.failCount > 0) {
            const failed = response.results.filter(r => !r.success);
            Modal.error({
              title: 'Bazı bucket\'lar silinemedi',
              content: (
                <ul>
                  {failed.map(f => (
                    <li key={f.bucketName}>
                      <Text type="danger">{f.bucketName}: {f.error}</Text>
                    </li>
                  ))}
                </ul>
              ),
            });
          }

          setSelectedRowKeys([]);
          fetchBuckets();
        } catch (error: any) {
          message.error(error.message || 'Toplu silme işlemi başarısız');
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  };

  const columns: ColumnsType<BucketWithKey> = [
    {
      title: 'Bucket Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <Text strong copyable>{name}</Text>
          {name.startsWith('tenant-') && (
            <Tag color="blue">Tenant</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: (a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime(),
      render: (date: string) => new Date(date).toLocaleString('tr-TR'),
    },
    {
      title: 'Kullanım',
      dataIndex: 'usedBytes',
      key: 'usedBytes',
      sorter: (a, b) => a.usedBytes - b.usedBytes,
      render: (bytes: number, record: BucketWithKey) => (
        <Tooltip title={`${bytes.toLocaleString()} bytes`}>
          <span>{storageService.formatBytes(bytes)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Nesne Sayısı',
      dataIndex: 'objectCount',
      key: 'objectCount',
      sorter: (a, b) => a.objectCount - b.objectCount,
      render: (count: number) => (
        <Space>
          <FileOutlined />
          <span>{count.toLocaleString()}</span>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Bucket'ı Sil"
          description={
            <div>
              <Text type="danger">
                '{record.name}' bucket'ı ve içindeki {record.objectCount} dosya kalıcı olarak silinecek!
              </Text>
              <br />
              <Text type="secondary">Bu işlem geri alınamaz.</Text>
            </div>
          }
          onConfirm={() => handleDelete(record.name)}
          okText="Sil"
          okType="danger"
          cancelText="İptal"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleting === record.name}
          >
            Sil
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CloudServerOutlined style={{ marginRight: 8 }} />
          MinIO Storage Yönetimi
        </Title>
        <Text type="secondary">
          Tüm MinIO bucket'larını görüntüleyin ve yönetin
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Bucket"
              value={stats.totalCount}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Kullanım"
              value={stats.totalUsedGB}
              suffix="GB"
              precision={2}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Dosya"
              value={stats.totalObjects}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Seçili Bucket"
              value={selectedRowKeys.length}
              valueStyle={{ color: selectedRowKeys.length > 0 ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchBuckets}
            loading={loading}
          >
            Yenile
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              loading={bulkDeleting}
            >
              Seçilenleri Sil ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </Card>

      {/* Bucket Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={buckets}
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bucket`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default StoragePage;
