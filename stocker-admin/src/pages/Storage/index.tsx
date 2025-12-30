import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  Alert,
  Tabs,
  Breadcrumb,
  Upload,
  Input,
  Tooltip,
  Dropdown,
  Empty,
  Progress,
  Image,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FileOutlined,
  ExclamationCircleOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  UploadOutlined,
  DownloadOutlined,
  CopyOutlined,
  PlusOutlined,
  HomeOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  LinkOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { storageService, BucketInfo, StorageObject } from '../../services/api/index';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// System asset types
type SystemAssetType = 'logo' | 'favicon' | 'email-banner';

interface SystemAsset {
  type: SystemAssetType;
  name: string;
  description: string;
  currentFile?: string;
  currentUrl?: string;
  acceptTypes: string;
  maxSize: number;
  dimensions?: string;
}

const SYSTEM_ASSETS: SystemAsset[] = [
  {
    type: 'logo',
    name: 'Logo',
    description: 'Ana uygulama logosu. E-posta şablonlarında ve uygulamada kullanılır.',
    acceptTypes: 'image/png,image/jpeg,image/svg+xml',
    maxSize: 2 * 1024 * 1024, // 2MB
    dimensions: 'Önerilen: 200x60px, PNG veya SVG',
  },
  {
    type: 'favicon',
    name: 'Favicon',
    description: 'Tarayıcı sekmesinde görünen ikon.',
    acceptTypes: 'image/x-icon,image/png,image/svg+xml',
    maxSize: 256 * 1024, // 256KB
    dimensions: 'Önerilen: 32x32px veya 16x16px, ICO veya PNG',
  },
  {
    type: 'email-banner',
    name: 'E-posta Banner',
    description: 'E-posta şablonlarında üst kısımda görünen banner resmi.',
    acceptTypes: 'image/png,image/jpeg',
    maxSize: 1 * 1024 * 1024, // 1MB
    dimensions: 'Önerilen: 600x150px, PNG veya JPG',
  },
];

const SYSTEM_ASSETS_BUCKET = 'system-assets';

interface BucketWithKey extends BucketInfo {
  key: string;
}

interface StorageObjectWithKey extends StorageObject {
  key: string;
}

const StoragePage: React.FC = () => {
  // Bucket state
  const [buckets, setBuckets] = useState<BucketWithKey[]>([]);
  const [bucketsLoading, setBucketsLoading] = useState(true);
  const [deletingBucket, setDeletingBucket] = useState<string | null>(null);
  const [selectedBucketKeys, setSelectedBucketKeys] = useState<React.Key[]>([]);
  const [bulkDeletingBuckets, setBulkDeletingBuckets] = useState(false);
  const [bucketStats, setBucketStats] = useState({
    totalCount: 0,
    totalUsedBytes: 0,
    totalUsedGB: 0,
    totalObjects: 0,
  });
  const [createBucketModal, setCreateBucketModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [creatingBucket, setCreatingBucket] = useState(false);

  // File browser state
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [objects, setObjects] = useState<StorageObjectWithKey[]>([]);
  const [objectsLoading, setObjectsLoading] = useState(false);
  const [selectedObjectKeys, setSelectedObjectKeys] = useState<React.Key[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('buckets');
  const [objectStats, setObjectStats] = useState({
    totalCount: 0,
    totalSize: 0,
    folderCount: 0,
    fileCount: 0,
  });

  // System assets state
  const [systemAssets, setSystemAssets] = useState<Record<SystemAssetType, { file?: string; url?: string }>>({
    'logo': {},
    'favicon': {},
    'email-banner': {},
  });
  const [systemAssetsLoading, setSystemAssetsLoading] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<SystemAssetType | null>(null);

  // Fetch buckets
  const fetchBuckets = async () => {
    setBucketsLoading(true);
    try {
      const response = await storageService.getAllBuckets();
      if (response.success) {
        setBuckets(response.data.map(b => ({ ...b, key: b.name })));
        setBucketStats({
          totalCount: response.totalCount,
          totalUsedBytes: response.totalUsedBytes,
          totalUsedGB: response.totalUsedGB,
          totalObjects: response.totalObjects,
        });
      } else {
        message.error('Bucket listesi alınamadı');
      }
    } catch (error: any) {
      message.error(error.message || 'Bucket listesi alınırken hata oluştu');
    } finally {
      setBucketsLoading(false);
    }
  };

  // Fetch objects in bucket
  const fetchObjects = useCallback(async (bucketName: string, prefix?: string) => {
    setObjectsLoading(true);
    try {
      const response = await storageService.listObjects(bucketName, prefix);
      if (response.success) {
        setObjects(response.data.map(o => ({ ...o, key: o.key })));
        setObjectStats({
          totalCount: response.totalCount,
          totalSize: response.totalSize,
          folderCount: response.folderCount,
          fileCount: response.fileCount,
        });
      } else {
        message.error('Dosya listesi alınamadı');
      }
    } catch (error: any) {
      message.error(error.message || 'Dosya listesi alınırken hata oluştu');
    } finally {
      setObjectsLoading(false);
    }
  }, []);

  // Fetch system assets
  const fetchSystemAssets = useCallback(async () => {
    setSystemAssetsLoading(true);
    try {
      // First ensure the system-assets bucket exists
      const bucketsResponse = await storageService.getAllBuckets();
      const systemBucketExists = bucketsResponse.data.some(b => b.name === SYSTEM_ASSETS_BUCKET);

      if (!systemBucketExists) {
        // Create the system-assets bucket (ignore 409 if already exists)
        try {
          await storageService.createBucket(SYSTEM_ASSETS_BUCKET);
        } catch (createError: any) {
          // Ignore 409 Conflict - bucket already exists
          if (createError.response?.status !== 409) {
            console.log('System assets bucket creation error:', createError);
          }
        }
      }

      // List objects in system-assets bucket
      const response = await storageService.listObjects(SYSTEM_ASSETS_BUCKET);
      if (response.success) {
        const assets: Record<SystemAssetType, { file?: string; url?: string }> = {
          'logo': {},
          'favicon': {},
          'email-banner': {},
        };

        // Find existing assets
        for (const obj of response.data) {
          if (!obj.isFolder) {
            for (const assetType of ['logo', 'favicon', 'email-banner'] as SystemAssetType[]) {
              if (obj.key.startsWith(`${assetType}.`) || obj.key.startsWith(`${assetType}/`)) {
                try {
                  const urlResponse = await storageService.getPresignedUrl(SYSTEM_ASSETS_BUCKET, obj.key);
                  if (urlResponse.success) {
                    assets[assetType] = { file: obj.key, url: urlResponse.url };
                  }
                } catch (e) {
                  // Ignore URL fetch errors
                }
              }
            }
          }
        }

        setSystemAssets(assets);
      }
    } catch (error: any) {
      // Silent fail - bucket might not exist yet
      console.log('System assets load error:', error);
    } finally {
      setSystemAssetsLoading(false);
    }
  }, []);

  const handleUploadSystemAsset = async (assetType: SystemAssetType, file: File) => {
    setUploadingAsset(assetType);
    try {
      // Get file extension and create proper object name
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const objectName = `${assetType}.${ext}`;

      // Delete existing asset if any (with different extension)
      if (systemAssets[assetType]?.file && systemAssets[assetType].file !== objectName) {
        try {
          await storageService.deleteObject(SYSTEM_ASSETS_BUCKET, systemAssets[assetType].file!);
        } catch (e) {
          // Ignore delete errors
        }
      }

      // Create a renamed file with the proper asset name
      const renamedFile = new File([file], objectName, { type: file.type });

      // Upload with correct name directly
      const response = await storageService.uploadFiles(SYSTEM_ASSETS_BUCKET, [renamedFile]);

      if (response.success && response.results[0]?.success) {
        message.success(`${SYSTEM_ASSETS.find(a => a.type === assetType)?.name} güncellendi`);
        fetchSystemAssets();
      } else {
        message.error('Yükleme başarısız');
      }
    } catch (error: any) {
      message.error(error.message || 'Yükleme hatası');
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleDeleteSystemAsset = async (assetType: SystemAssetType) => {
    if (!systemAssets[assetType]?.file) return;

    Modal.confirm({
      title: 'Silme Onayı',
      icon: <ExclamationCircleOutlined />,
      content: `${SYSTEM_ASSETS.find(a => a.type === assetType)?.name} silinecek. Emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await storageService.deleteObject(SYSTEM_ASSETS_BUCKET, systemAssets[assetType].file!);
          message.success('Silindi');
          fetchSystemAssets();
        } catch (error: any) {
          message.error(error.message || 'Silme hatası');
        }
      },
    });
  };

  const copyAssetUrl = async (assetType: SystemAssetType) => {
    const asset = systemAssets[assetType];
    if (!asset?.url) {
      message.warning('URL bulunamadı');
      return;
    }

    try {
      // Get a fresh presigned URL for copying
      const response = await storageService.getPresignedUrl(SYSTEM_ASSETS_BUCKET, asset.file!, 24 * 7); // 7 days
      if (response.success) {
        await navigator.clipboard.writeText(response.url);
        message.success('URL kopyalandı (7 gün geçerli)');
      }
    } catch (error) {
      message.error('URL kopyalanamadı');
    }
  };

  useEffect(() => {
    fetchBuckets();
    fetchSystemAssets();
  }, [fetchSystemAssets]);

  useEffect(() => {
    if (selectedBucket) {
      fetchObjects(selectedBucket, currentPath);
    }
  }, [selectedBucket, currentPath, fetchObjects]);

  // Bucket operations
  const handleDeleteBucket = async (bucketName: string) => {
    setDeletingBucket(bucketName);
    try {
      const response = await storageService.deleteBucket(bucketName);
      if (response.success) {
        message.success(`'${bucketName}' bucket'ı silindi`);
        fetchBuckets();
        if (selectedBucket === bucketName) {
          setSelectedBucket(null);
          setCurrentPath('');
          setObjects([]);
        }
      } else {
        message.error(response.message || 'Silme işlemi başarısız');
      }
    } catch (error: any) {
      message.error(error.message || 'Silme işlemi sırasında hata oluştu');
    } finally {
      setDeletingBucket(null);
    }
  };

  const handleBulkDeleteBuckets = async () => {
    if (selectedBucketKeys.length === 0) {
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
            description={`${selectedBucketKeys.length} adet bucket ve içindeki tüm dosyalar kalıcı olarak silinecektir.`}
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text strong>Silinecek bucket'lar:</Text>
          <ul style={{ maxHeight: 200, overflow: 'auto' }}>
            {selectedBucketKeys.map(key => (
              <li key={key.toString()}>{key.toString()}</li>
            ))}
          </ul>
        </div>
      ),
      okText: 'Evet, Hepsini Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        setBulkDeletingBuckets(true);
        try {
          const response = await storageService.deleteMultipleBuckets(
            selectedBucketKeys.map(k => k.toString())
          );

          if (response.success) {
            message.success(`${response.successCount} bucket başarıyla silindi`);
          } else {
            message.warning(response.message);
          }

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

          setSelectedBucketKeys([]);
          fetchBuckets();
        } catch (error: any) {
          message.error(error.message || 'Toplu silme işlemi başarısız');
        } finally {
          setBulkDeletingBuckets(false);
        }
      },
    });
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      message.warning('Bucket adı gerekli');
      return;
    }

    setCreatingBucket(true);
    try {
      const response = await storageService.createBucket(newBucketName.toLowerCase().trim());
      if (response.success) {
        message.success(response.message);
        setCreateBucketModal(false);
        setNewBucketName('');
        fetchBuckets();
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.message || 'Bucket oluşturulamadı');
    } finally {
      setCreatingBucket(false);
    }
  };

  // File browser operations
  const handleBucketSelect = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setCurrentPath('');
    setPathHistory([]);
    setSelectedObjectKeys([]);
    setActiveTab('files'); // Switch to file browser tab
  };

  const handleFolderOpen = (folderKey: string) => {
    setPathHistory([...pathHistory, currentPath]);
    setCurrentPath(folderKey);
    setSelectedObjectKeys([]);
  };

  const handleNavigateBack = () => {
    if (pathHistory.length > 0) {
      const newHistory = [...pathHistory];
      const previousPath = newHistory.pop() || '';
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
      setSelectedObjectKeys([]);
    }
  };

  const handleNavigateToPath = (pathIndex: number) => {
    const pathParts = currentPath.split('/').filter(p => p);
    const newPath = pathParts.slice(0, pathIndex + 1).join('/');
    setCurrentPath(newPath ? newPath + '/' : '');
    setPathHistory(pathHistory.slice(0, pathIndex));
    setSelectedObjectKeys([]);
  };

  const handleUpload = async () => {
    if (fileList.length === 0 || !selectedBucket) {
      message.warning('Lütfen dosya seçin');
      return;
    }

    setUploading(true);
    try {
      const files = fileList.map(f => f.originFileObj as File);
      const response = await storageService.uploadFiles(selectedBucket, files, currentPath || undefined);

      if (response.success) {
        message.success(response.message);
        setUploadModalVisible(false);
        setFileList([]);
        fetchObjects(selectedBucket, currentPath);
      } else {
        message.warning(response.message);
      }
    } catch (error: any) {
      message.error(error.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (objectName: string, fileName: string) => {
    if (!selectedBucket) return;

    try {
      const blob = await storageService.downloadFile(selectedBucket, objectName);
      storageService.triggerDownload(blob, fileName);
      message.success('İndirme başladı');
    } catch (error: any) {
      message.error(error.message || 'İndirme başarısız');
    }
  };

  const handleCopyUrl = async (objectName: string) => {
    if (!selectedBucket) return;

    try {
      const response = await storageService.getPresignedUrl(selectedBucket, objectName);
      if (response.success) {
        await navigator.clipboard.writeText(response.url);
        message.success('URL kopyalandı');
      } else {
        message.error('URL alınamadı');
      }
    } catch (error: any) {
      message.error(error.message || 'URL kopyalanamadı');
    }
  };

  const handlePreviewImage = async (objectName: string) => {
    if (!selectedBucket) return;

    try {
      const response = await storageService.getPresignedUrl(selectedBucket, objectName);
      if (response.success) {
        setPreviewImage(response.url);
      }
    } catch (error: any) {
      message.error('Önizleme yüklenemedi');
    }
  };

  const handleDeleteObject = async (objectName: string) => {
    if (!selectedBucket) return;

    try {
      const response = await storageService.deleteObject(selectedBucket, objectName);
      if (response.success) {
        message.success('Dosya silindi');
        fetchObjects(selectedBucket, currentPath);
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.message || 'Silme başarısız');
    }
  };

  const handleDeleteSelectedObjects = async () => {
    if (selectedObjectKeys.length === 0 || !selectedBucket) {
      message.warning('Lütfen silinecek dosyaları seçin');
      return;
    }

    Modal.confirm({
      title: 'Silme Onayı',
      icon: <ExclamationCircleOutlined />,
      content: `${selectedObjectKeys.length} dosya/klasör silinecek. Bu işlem geri alınamaz!`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          const response = await storageService.deleteObjects(
            selectedBucket,
            selectedObjectKeys.map(k => k.toString())
          );
          if (response.success) {
            message.success(`${response.deletedCount} öğe silindi`);
            setSelectedObjectKeys([]);
            fetchObjects(selectedBucket, currentPath);
          } else {
            message.error(response.message);
          }
        } catch (error: any) {
          message.error(error.message || 'Silme başarısız');
        }
      },
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedBucket) {
      message.warning('Klasör adı gerekli');
      return;
    }

    setCreatingFolder(true);
    try {
      const folderPath = currentPath
        ? `${currentPath}${newFolderName.trim()}`
        : newFolderName.trim();

      const response = await storageService.createFolder(selectedBucket, folderPath);
      if (response.success) {
        message.success('Klasör oluşturuldu');
        setCreateFolderModal(false);
        setNewFolderName('');
        fetchObjects(selectedBucket, currentPath);
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      message.error(error.message || 'Klasör oluşturulamadı');
    } finally {
      setCreatingFolder(false);
    }
  };

  // Get icon for file type
  const getFileIcon = (contentType: string, isFolder: boolean) => {
    if (isFolder) return <FolderOutlined style={{ color: '#faad14', fontSize: 20 }} />;
    if (contentType.startsWith('image/')) return <FileImageOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
    if (contentType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />;
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 20 }} />;
    if (contentType.includes('word') || contentType.includes('document')) return <FileWordOutlined style={{ color: '#1890ff', fontSize: 20 }} />;
    if (contentType.includes('zip') || contentType.includes('rar')) return <FileZipOutlined style={{ color: '#722ed1', fontSize: 20 }} />;
    if (contentType.startsWith('video/')) return <PlayCircleOutlined style={{ color: '#eb2f96', fontSize: 20 }} />;
    if (contentType.startsWith('text/')) return <FileTextOutlined style={{ color: '#8c8c8c', fontSize: 20 }} />;
    return <FileOutlined style={{ color: '#8c8c8c', fontSize: 20 }} />;
  };

  // Bucket columns
  const bucketColumns: ColumnsType<BucketWithKey> = [
    {
      title: 'Bucket Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <Button type="link" onClick={() => handleBucketSelect(name)} style={{ padding: 0 }}>
            <Text strong>{name}</Text>
          </Button>
          {name.startsWith('tenant-') && <Tag color="blue">Tenant</Tag>}
          {name === 'system-assets' && <Tag color="green">Sistem</Tag>}
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
      render: (bytes: number) => (
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
      width: 150,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            icon={<FolderOpenOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleBucketSelect(record.name);
            }}
          >
            Aç
          </Button>
          <Popconfirm
            title="Bucket'ı Sil"
            description={`'${record.name}' bucket'ı ve içindeki ${record.objectCount} dosya silinecek!`}
            onConfirm={() => handleDeleteBucket(record.name)}
            okText="Sil"
            okType="danger"
            cancelText="İptal"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingBucket === record.name}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Object columns
  const objectColumns: ColumnsType<StorageObjectWithKey> = [
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      },
      render: (name: string, record) => (
        <Space>
          {getFileIcon(record.contentType, record.isFolder)}
          {record.isFolder ? (
            <Button type="link" onClick={() => handleFolderOpen(record.key)} style={{ padding: 0 }}>
              <Text strong>{name}</Text>
            </Button>
          ) : (
            <Text>{name}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      sorter: (a, b) => a.size - b.size,
      render: (size: number, record) => record.isFolder ? '-' : storageService.formatBytes(size),
    },
    {
      title: 'Son Değişiklik',
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 180,
      sorter: (a, b) => new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime(),
      render: (date: string) => new Date(date).toLocaleString('tr-TR'),
    },
    {
      title: 'Tür',
      dataIndex: 'contentType',
      key: 'contentType',
      width: 150,
      render: (contentType: string, record) => record.isFolder ? 'Klasör' : contentType.split('/').pop(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        if (record.isFolder) {
          return (
            <Button
              type="link"
              icon={<FolderOpenOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleFolderOpen(record.key);
              }}
            >
              Aç
            </Button>
          );
        }

        const isImage = record.contentType.startsWith('image/');

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'download',
                    icon: <DownloadOutlined />,
                    label: 'İndir',
                    onClick: () => handleDownload(record.key, record.name),
                  },
                  {
                    key: 'copyUrl',
                    icon: <LinkOutlined />,
                    label: 'URL Kopyala',
                    onClick: () => handleCopyUrl(record.key),
                  },
                  ...(isImage ? [{
                    key: 'preview',
                    icon: <EyeOutlined />,
                    label: 'Önizle',
                    onClick: () => handlePreviewImage(record.key),
                  }] : []),
                  { type: 'divider' as const },
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: 'Sil',
                    danger: true,
                    onClick: () => {
                      Modal.confirm({
                        title: 'Dosyayı Sil',
                        content: `'${record.name}' dosyası silinecek. Emin misiniz?`,
                        okText: 'Sil',
                        okType: 'danger',
                        cancelText: 'İptal',
                        onOk: () => handleDeleteObject(record.key),
                      });
                    },
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  // Breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      {
        title: (
          <Button
            type="link"
            icon={<HomeOutlined />}
            onClick={() => {
              setCurrentPath('');
              setPathHistory([]);
            }}
            style={{ padding: 0 }}
          >
            {selectedBucket}
          </Button>
        ),
      },
    ];

    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.forEach((part, index) => {
      items.push({
        title: (
          <Button
            type="link"
            onClick={() => handleNavigateToPath(index)}
            style={{ padding: 0 }}
          >
            {part}
          </Button>
        ),
      });
    });

    return items;
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CloudServerOutlined style={{ marginRight: 8 }} />
          Depolama Yönetimi
        </Title>
        <Text type="secondary">
          MinIO bucket ve dosya yönetimi
        </Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Buckets Tab */}
        <TabPane tab={<span><DatabaseOutlined /> Bucket'lar</span>} key="buckets">
          {/* Stats Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Toplam Bucket"
                  value={bucketStats.totalCount}
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Toplam Kullanım"
                  value={bucketStats.totalUsedGB}
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
                  value={bucketStats.totalObjects}
                  prefix={<FileOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Seçili Bucket"
                  value={selectedBucketKeys.length}
                  valueStyle={{ color: selectedBucketKeys.length > 0 ? '#cf1322' : undefined }}
                />
              </Card>
            </Col>
          </Row>

          {/* Actions */}
          <Card style={{ marginBottom: 24 }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateBucketModal(true)}
              >
                Yeni Bucket
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchBuckets}
                loading={bucketsLoading}
              >
                Yenile
              </Button>
              {selectedBucketKeys.length > 0 && (
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDeleteBuckets}
                  loading={bulkDeletingBuckets}
                >
                  Seçilenleri Sil ({selectedBucketKeys.length})
                </Button>
              )}
            </Space>
          </Card>

          {/* Bucket Table */}
          <Card>
            <Table
              rowSelection={{
                selectedRowKeys: selectedBucketKeys,
                onChange: setSelectedBucketKeys,
              }}
              columns={bucketColumns}
              dataSource={buckets}
              loading={bucketsLoading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bucket`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        {/* File Browser Tab */}
        <TabPane tab={<span><FolderOutlined /> Dosya Gezgini</span>} key="files">
          {!selectedBucket ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Dosyaları görüntülemek için bir bucket seçin"
              >
                <Button type="primary" onClick={() => {
                  if (buckets.length > 0) {
                    handleBucketSelect(buckets[0].name);
                  }
                }}>
                  İlk Bucket'ı Aç
                </Button>
              </Empty>
            </Card>
          ) : (
            <>
              {/* File Browser Header */}
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space>
                        <DatabaseOutlined />
                        <Text strong>Bucket:</Text>
                        <Tag color="blue">{selectedBucket}</Tag>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setSelectedBucket(null);
                            setCurrentPath('');
                            setObjects([]);
                          }}
                        >
                          Değiştir
                        </Button>
                      </Space>
                      <Breadcrumb items={getBreadcrumbItems()} />
                    </Space>
                  </Col>
                  <Col>
                    <Space size={4}>
                      <Text type="secondary">
                        {objectStats.folderCount} klasör, {objectStats.fileCount} dosya ({storageService.formatBytes(objectStats.totalSize)})
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* File Browser Actions */}
              <Card style={{ marginBottom: 16 }}>
                <Space wrap>
                  {currentPath && (
                    <Button icon={<HomeOutlined />} onClick={handleNavigateBack}>
                      Geri
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => setUploadModalVisible(true)}
                  >
                    Dosya Yükle
                  </Button>
                  <Button
                    icon={<FolderOutlined />}
                    onClick={() => setCreateFolderModal(true)}
                  >
                    Yeni Klasör
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchObjects(selectedBucket, currentPath)}
                    loading={objectsLoading}
                  >
                    Yenile
                  </Button>
                  {selectedObjectKeys.length > 0 && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteSelectedObjects}
                    >
                      Seçilenleri Sil ({selectedObjectKeys.length})
                    </Button>
                  )}
                </Space>
              </Card>

              {/* File Table */}
              <Card>
                <Table
                  rowSelection={{
                    selectedRowKeys: selectedObjectKeys,
                    onChange: setSelectedObjectKeys,
                  }}
                  columns={objectColumns}
                  dataSource={objects}
                  loading={objectsLoading}
                  pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} öğe`,
                  }}
                  scroll={{ x: 800 }}
                  locale={{
                    emptyText: <Empty description="Bu klasör boş" />,
                  }}
                />
              </Card>
            </>
          )}
        </TabPane>

        {/* System Assets Tab */}
        <TabPane tab={<span><FileImageOutlined /> Sistem Görselleri</span>} key="assets">
          <Alert
            message="Sistem Görselleri"
            description="Bu bölümde uygulama genelinde kullanılan logo, favicon ve e-posta banner'ı gibi görselleri yönetebilirsiniz. Yüklenen görseller otomatik olarak e-posta şablonlarında ve uygulama arayüzünde kullanılır."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={[24, 24]}>
            {SYSTEM_ASSETS.map(asset => (
              <Col xs={24} md={8} key={asset.type}>
                <Card
                  title={
                    <Space>
                      {asset.type === 'logo' && <FileImageOutlined />}
                      {asset.type === 'favicon' && <FileImageOutlined />}
                      {asset.type === 'email-banner' && <FileImageOutlined />}
                      {asset.name}
                    </Space>
                  }
                  extra={
                    systemAssets[asset.type]?.url && (
                      <Space>
                        <Tooltip title="URL Kopyala">
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyAssetUrl(asset.type)}
                          />
                        </Tooltip>
                        <Tooltip title="Sil">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteSystemAsset(asset.type)}
                          />
                        </Tooltip>
                      </Space>
                    )
                  }
                  loading={systemAssetsLoading}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Preview */}
                    <div
                      style={{
                        width: '100%',
                        height: 120,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fafafa',
                        overflow: 'hidden',
                      }}
                    >
                      {systemAssets[asset.type]?.url ? (
                        <img
                          src={systemAssets[asset.type].url}
                          alt={asset.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Space direction="vertical" align="center">
                          <FileImageOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                          <Text type="secondary">Görsel yok</Text>
                        </Space>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {asset.description}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {asset.dimensions}
                      </Text>
                    </div>

                    {/* Upload */}
                    <Upload
                      accept={asset.acceptTypes}
                      maxCount={1}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        if (file.size > asset.maxSize) {
                          message.error(`Dosya boyutu ${storageService.formatBytes(asset.maxSize)} altında olmalıdır`);
                          return false;
                        }
                        handleUploadSystemAsset(asset.type, file);
                        return false;
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={uploadingAsset === asset.type}
                        block
                      >
                        {systemAssets[asset.type]?.url ? 'Değiştir' : 'Yükle'}
                      </Button>
                    </Upload>

                    {/* Current file info */}
                    {systemAssets[asset.type]?.file && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Mevcut: {systemAssets[asset.type].file}
                      </Text>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Refresh button */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSystemAssets}
              loading={systemAssetsLoading}
            >
              Görselleri Yenile
            </Button>
          </div>
        </TabPane>
      </Tabs>

      {/* Create Bucket Modal */}
      <Modal
        title="Yeni Bucket Oluştur"
        open={createBucketModal}
        onOk={handleCreateBucket}
        onCancel={() => {
          setCreateBucketModal(false);
          setNewBucketName('');
        }}
        confirmLoading={creatingBucket}
        okText="Oluştur"
        cancelText="İptal"
      >
        <Input
          placeholder="Bucket adı (küçük harf, 3-63 karakter)"
          value={newBucketName}
          onChange={e => setNewBucketName(e.target.value.toLowerCase())}
          onPressEnter={handleCreateBucket}
        />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
          Bucket adları küçük harf olmalı ve 3-63 karakter arasında olmalıdır.
        </Text>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        title="Yeni Klasör Oluştur"
        open={createFolderModal}
        onOk={handleCreateFolder}
        onCancel={() => {
          setCreateFolderModal(false);
          setNewFolderName('');
        }}
        confirmLoading={creatingFolder}
        okText="Oluştur"
        cancelText="İptal"
      >
        <Input
          placeholder="Klasör adı"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolder}
        />
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Dosya Yükle"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setUploadModalVisible(false);
          setFileList([]);
        }}
        confirmLoading={uploading}
        okText="Yükle"
        cancelText="İptal"
        width={600}
      >
        <Alert
          message={`Yükleme konumu: ${selectedBucket}/${currentPath || '(kök dizin)'}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Dragger
          multiple
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Dosyaları buraya sürükleyin veya tıklayarak seçin</p>
          <p className="ant-upload-hint">Birden fazla dosya yükleyebilirsiniz</p>
        </Dragger>
      </Modal>

      {/* Image Preview */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: !!previewImage,
          src: previewImage || '',
          onVisibleChange: visible => {
            if (!visible) setPreviewImage(null);
          },
        }}
      />
    </div>
  );
};

export default StoragePage;
