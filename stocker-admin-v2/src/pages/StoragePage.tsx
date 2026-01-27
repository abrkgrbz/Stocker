import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import {
    Search,
    Upload,
    Download,
    Trash2,
    File as FileIcon,
    Folder,
    MoreVertical,
    Plus,
    RefreshCw,
    ChevronRight,
    Database,
    ArrowLeft,
    FolderOpen,
    FileText,
    Image as ImageIcon,
    FileCode,
    Settings,
    Copy,
    ExternalLink
} from 'lucide-react';
import { type StorageDto as BucketInfo, storageService } from '@/services/storageService';
import { useStorage } from '@/hooks/useStorage';

// System Asset Types matches Legacy
type SystemAssetType = 'logo' | 'favicon' | 'email-banner';

interface SystemAsset {
    type: SystemAssetType;
    name: string;
    description: string;
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

const StoragePage: React.FC = () => {
    // Bucket Data
    const { data: bucketsResponse, isLoading: isLoadingBuckets, refetch: refetchBuckets } = useStorage();

    // UI State
    const [activeTab, setActiveTab] = useState('browser');
    const [viewMode, setViewMode] = useState<'buckets' | 'files'>('buckets');
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [selectedBucketIds, setSelectedBucketIds] = useState<(string | number)[]>([]);

    // File Browser Component State
    const [objects, setObjects] = useState<any[]>([]);
    const [isLoadingObjects, setIsLoadingObjects] = useState(false);
    const [pathHistory, setPathHistory] = useState<string[]>([]);
    const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // System Assets State
    const [systemAssets, setSystemAssets] = useState<Record<SystemAssetType, { file?: string; url?: string }>>({
        'logo': {},
        'favicon': {},
        'email-banner': {},
    });
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);

    // Fetch Objects
    const fetchObjects = useCallback(async (bucket: string, prefix: string) => {
        setIsLoadingObjects(true);
        try {
            const response = await storageService.listObjects(bucket, prefix);
            if (response.success) {
                setObjects(response.data);
            } else {
                toast.error('Dosya listesi alınamadı.');
            }
        } catch (error) {
            toast.error('Dosya listesi alınırken hata oluştu.');
        } finally {
            setIsLoadingObjects(false);
        }
    }, []);

    // Fetch System Assets
    const fetchSystemAssets = useCallback(async () => {
        setIsLoadingAssets(true);
        try {
            // 1. Check if bucket exists, create if not
            try {
                // Normalize buckets data to handle both array and object responses
                // @ts-ignore
                const bucketsData = Array.isArray(bucketsResponse) ? bucketsResponse : (bucketsResponse?.data || []);

                // Only proceed if buckets are loaded
                if (bucketsData.length > 0) {
                    const exists = bucketsData.some((b: any) => b.name === SYSTEM_ASSETS_BUCKET);
                    if (!exists) {
                        await storageService.createBucket(SYSTEM_ASSETS_BUCKET);
                    }
                }
            } catch (e) {
                // Ignore if already exists or permission issue, assume it might exist
            }

            const response = await storageService.listObjects(SYSTEM_ASSETS_BUCKET);
            if (response.success) {
                const assets: Record<SystemAssetType, { file?: string; url?: string }> = {
                    'logo': {},
                    'favicon': {},
                    'email-banner': {},
                };

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
                                    console.error('Failed to get presigned url', e);
                                }
                            }
                        }
                    }
                }
                setSystemAssets(assets);
            }
        } catch (error) {
            console.error('System assets load error:', error);
            // Don't toast here to avoid spamming if bucket is truly missing and can't be created
        } finally {
            setIsLoadingAssets(false);
        }
    }, [bucketsResponse]);

    // Effects
    useEffect(() => {
        if (selectedBucket && viewMode === 'files') {
            fetchObjects(selectedBucket, currentPath);
        }
    }, [selectedBucket, currentPath, viewMode, fetchObjects]);

    useEffect(() => {
        if (activeTab === 'system-images') {
            fetchSystemAssets();
        }
    }, [activeTab, fetchSystemAssets]);

    // Navigation Handlers
    const handleOpenBucket = (bucketName: string) => {
        setSelectedBucket(bucketName);
        setCurrentPath('');
        setPathHistory([]);
        setViewMode('files');
        setCurrentPage(1);
    };

    const handleBackToBuckets = () => {
        setViewMode('buckets');
        setSelectedBucket(null);
        setCurrentPath('');
        setObjects([]);
    };

    const handleOpenFolder = (folderName: string) => {
        setPathHistory(prev => [...prev, currentPath]);
        setCurrentPath(folderName);
        setCurrentPage(1);
    };

    const handleBackDirectory = () => {
        if (pathHistory.length === 0) {
            handleBackToBuckets();
            return;
        }
        const newHistory = [...pathHistory];
        const prevPath = newHistory.pop() || '';
        setPathHistory(newHistory);
        setCurrentPath(prevPath);
        setCurrentPage(1);
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setPathHistory([]);
            setCurrentPath('');
            setCurrentPage(1);
            return;
        }
        const parts = currentPath.split('/').filter(p => p);
        if (index < parts.length - 1) {
            const newPath = parts.slice(0, index + 1).join('/') + '/';
            setCurrentPath(newPath);
            setPathHistory([]); // Reset history on jump for simplicity
            setCurrentPage(1);
        }
    };

    // Actions
    const handleCreateFolder = async () => {
        if (!selectedBucket || !newFolderName) return;
        try {
            const folderPath = currentPath ? `${currentPath}${newFolderName}/` : `${newFolderName}/`;
            await storageService.createFolder(selectedBucket, folderPath);
            toast.success('Klasör oluşturuldu.');
            setCreateFolderModalOpen(false);
            setNewFolderName('');
            fetchObjects(selectedBucket, currentPath);
        } catch (error) {
            toast.error('Klasör oluşturulamadı.');
        }
    };

    const handleUploadAsset = async (assetType: SystemAssetType, file: File) => {
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
            const objectName = `${assetType}.${ext}`;

            // Delete old file if name is different (e.g. extension change)
            if (systemAssets[assetType]?.file && systemAssets[assetType].file !== objectName) {
                await storageService.deleteObject(SYSTEM_ASSETS_BUCKET, systemAssets[assetType].file!);
            }

            // Rename file
            const renamedFile = new File([file], objectName, { type: file.type });

            // Upload
            const response = await storageService.uploadFiles(SYSTEM_ASSETS_BUCKET, [renamedFile]);
            if (response.success || (response.results && response.results[0]?.success)) {
                toast.success(`${SYSTEM_ASSETS.find(a => a.type === assetType)?.name} güncellendi.`);
                fetchSystemAssets();
            } else {
                toast.error('Yükleme başarısız.');
            }

        } catch (error) {
            toast.error('Yükleme sırasında hata oluştu.');
        }
    };

    const handleDeleteAsset = async (assetType: SystemAssetType) => {
        if (!systemAssets[assetType]?.file) return;
        if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;

        try {
            await storageService.deleteObject(SYSTEM_ASSETS_BUCKET, systemAssets[assetType].file!);
            toast.success('Görsel silindi.');
            fetchSystemAssets();
        } catch (error) {
            toast.error('Silme işlemi başarısız.');
        }
    };

    const handleCopyAssetUrl = async (assetType: SystemAssetType) => {
        const asset = systemAssets[assetType];
        if (!asset?.url) return;
        try {
            // Get fresh long-lived url
            const response = await storageService.getPresignedUrl(SYSTEM_ASSETS_BUCKET, asset.file!, 24 * 7); // 7 days (in hours)
            if (response.success) {
                await navigator.clipboard.writeText(response.url);
                toast.success('URL kopyalandı.');
            }
        } catch (e) {
            toast.error('URL kopyalanamadı.');
        }
    };

    const handleBulkDeleteBuckets = async () => {
        if (!selectedBucketIds.length) return;

        if (!confirm(`${selectedBucketIds.length} bucket silinecek. Emin misiniz?`)) return;

        try {
            const response = await storageService.deleteMultipleBuckets(selectedBucketIds.map(id => id.toString()));
            if (response.success) {
                toast.success(`${response.successCount} bucket silindi.`);
                setSelectedBucketIds([]);
                refetchBuckets();
            } else {
                toast.error(response.message || 'Bazı bucketlar silinemedi.');
            }
        } catch (error) {
            toast.error('Silme işlemi başarısız.');
        }
    };

    const getFileIcon = (contentType: string, isFolder: boolean) => {
        if (isFolder) return <Folder className="w-5 h-5 text-amber-400" />;
        if (contentType.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-400" />;
        if (contentType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-400" />;
        if (contentType.includes('json') || contentType.includes('javascript')) return <FileCode className="w-5 h-5 text-yellow-400" />;
        return <FileIcon className="w-5 h-5 text-indigo-400" />;
    };

    // Columns
    const bucketColumns = [
        {
            header: 'Bucket Adı',
            accessor: (f: BucketInfo) => (
                <div className="flex items-center gap-4 text-text-main cursor-pointer group" onClick={() => handleOpenBucket(f.name)}>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{f.name}</p>
                        <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{f.tenantId || (f.name === SYSTEM_ASSETS_BUCKET ? 'Sistem' : 'Genel')}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Nesne Sayısı',
            accessor: (f: BucketInfo) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted font-medium">{f.objectCount} Nesne</span>
                </div>
            )
        },
        {
            header: 'Kullanım',
            accessor: (f: BucketInfo) => (
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">
                        <span>{f.usedGB > 0 ? f.usedGB.toFixed(2) : f.usedMB.toFixed(1)} {f.usedGB > 0 ? 'GB' : 'MB'}</span>
                        <span>%{(f.usedMB / 10).toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-indigo-500/5 rounded-full overflow-hidden border border-border-subtle">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(100, (f.usedMB / 10))}%` }} />
                    </div>
                </div>
            )
        },
        {
            header: 'Oluşturulma',
            accessor: (f: BucketInfo) => <span className="text-xs text-text-muted font-medium">{new Date(f.creationDate).toLocaleDateString('tr-TR')}</span>
        },
        {
            header: '',
            accessor: (f: BucketInfo) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" icon={FolderOpen} onClick={() => handleOpenBucket(f.name)}>Aç</Button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    const fileColumns = [
        {
            header: 'Ad',
            accessor: (file: any) => (
                <div className={`flex items-center gap-3 ${file.isFolder ? 'cursor-pointer hover:text-indigo-400 text-text-main' : 'text-text-muted'}`} onClick={() => file.isFolder && handleOpenFolder(file.key)}>
                    {getFileIcon(file.contentType, file.isFolder)}
                    <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                </div>
            )
        },
        {
            header: 'Boyut',
            accessor: (file: any) => <span className="text-xs font-mono text-text-muted">{file.isFolder ? '-' : storageService.formatBytes(file.size)}</span>
        },
        {
            header: 'Son Değişiklik',
            accessor: (file: any) => <span className="text-xs text-text-muted">{new Date(file.lastModified).toLocaleDateString('tr-TR')}</span>
        },
        {
            header: '',
            accessor: (file: any) => (
                <div className="flex justify-end gap-2">
                    <button className="p-2 text-text-muted/20 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    const tabs = [
        { id: 'browser', label: 'Dosya Gezgini', icon: Database },
        { id: 'system-images', label: 'Sistem Görselleri', icon: ImageIcon },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <Database className="w-8 h-8 text-indigo-400" />
                        Depolama
                    </h2>
                    <p className="text-text-muted mt-1">Platform depolama alanlarını ve sistem varlıklarını yönetin.</p>
                </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* TAB: FILE BROWSER */}
            {activeTab === 'browser' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    {/* Browser Header */}
                    <div className="flex items-center justify-between gap-4 bg-indigo-500/5 p-4 rounded-2xl border border-border-subtle">
                        <div className="flex items-center gap-4">
                            {viewMode === 'files' && (
                                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 flex items-center justify-center -ml-2" onClick={handleBackDirectory}>
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                                    {viewMode === 'buckets' ? 'Bucket Listesi' : selectedBucket}
                                </h3>
                                {viewMode === 'files' && (
                                    <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                                        <span className="font-bold text-indigo-400 cursor-pointer hover:underline" onClick={() => { setCurrentPath(''); setPathHistory([]); setCurrentPage(1); }}>root</span>
                                        {currentPath.split('/').filter(p => p).map((part, i) => (
                                            <React.Fragment key={i}>
                                                <ChevronRight className="w-3 h-3" />
                                                <span className="cursor-pointer hover:underline hover:text-text-main" onClick={() => handleBreadcrumbClick(i)}>{part}</span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedBucketIds.length > 0 && viewMode === 'buckets' && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    icon={Trash2}
                                    onClick={handleBulkDeleteBuckets}
                                >
                                    Seçilenleri Sil ({selectedBucketIds.length})
                                </Button>
                            )}
                            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => viewMode === 'buckets' ? refetchBuckets() : fetchObjects(selectedBucket!, currentPath)}>
                                Yenile
                            </Button>
                            {viewMode === 'files' && (
                                <Button size="sm" variant="outline" icon={Plus} onClick={() => setCreateFolderModalOpen(true)}>Klasör</Button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                            <input
                                type="text"
                                placeholder={viewMode === 'buckets' ? "Bucket ara..." : "Dosya veya klasör ara..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-indigo-500/5 border border-border-subtle rounded-xl py-3 pl-11 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                            />
                        </div>

                        <Card noPadding className="overflow-hidden min-h-[400px]">
                            {viewMode === 'buckets' ? (
                                <Table
                                    columns={bucketColumns as any}
                                    data={(Array.isArray(bucketsResponse) ? bucketsResponse : (bucketsResponse as any)?.data || [])
                                        .filter((f: any) => (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((f: any) => ({ ...f, id: f.name }))
                                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                    }
                                    isLoading={isLoadingBuckets}
                                    selectedIds={selectedBucketIds}
                                    onSelectionChange={setSelectedBucketIds}
                                    idField="name"
                                />
                            ) : (
                                <Table
                                    columns={fileColumns as any}
                                    data={objects
                                        .filter((f: any) => (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((f: any, i) => ({ ...f, id: f.key || i }))
                                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                    }
                                    isLoading={isLoadingObjects}
                                />
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB: SYSTEM IMAGES */}
            {activeTab === 'system-images' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {SYSTEM_ASSETS.map((asset) => (
                        <Card key={asset.type} className="relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-text-main">{asset.name}</h3>
                                    <p className="text-sm text-text-muted mt-1">{asset.description}</p>
                                </div>
                                <div className="p-2 bg-indigo-500/5 rounded-lg text-indigo-400">
                                    <Settings className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="aspect-video bg-black/20 rounded-xl border-2 border-dashed border-border-subtle flex items-center justify-center relative overflow-hidden group-hover:border-indigo-500/30 transition-colors">
                                {isLoadingAssets ? (
                                    <RefreshCw className="w-6 h-6 animate-spin text-text-muted" />
                                ) : systemAssets[asset.type]?.url ? (
                                    <img src={systemAssets[asset.type].url} alt={asset.name} className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="w-10 h-10 text-text-muted/20 mx-auto mb-2" />
                                        <p className="text-xs text-text-muted">Görsel yüklenmedi</p>
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    {systemAssets[asset.type]?.url && (
                                        <>
                                            <a
                                                href={systemAssets[asset.type].url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-white/10 rounded-lg text-white hover:bg-indigo-500 transition-colors"
                                                title="Görüntüle"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                            <button
                                                className="p-2 bg-white/10 rounded-lg text-white hover:bg-indigo-500 transition-colors"
                                                onClick={() => handleCopyAssetUrl(asset.type)}
                                                title="URL Kopyala"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 bg-white/10 rounded-lg text-white hover:bg-rose-500 transition-colors"
                                                onClick={() => handleDeleteAsset(asset.type)}
                                                title="Sil"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <span>Maks: {storageService.formatBytes(asset.maxSize)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>{asset.dimensions}</span>
                                </div>

                                <div className="mt-2">
                                    <input
                                        type="file"
                                        accept={asset.acceptTypes}
                                        id={`upload-${asset.type}`}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadAsset(asset.type, file);
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        icon={Upload}
                                        onClick={() => document.getElementById(`upload-${asset.type}`)?.click()}
                                    >
                                        Görsel Yükle/Değiştir
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Folder Modal */}
            <Modal
                isOpen={createFolderModalOpen}
                onClose={() => setCreateFolderModalOpen(false)}
                title="Yeni Klasör Oluştur"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Klasör Adı</label>
                        <input
                            autoFocus
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full bg-bg-surface border border-border-subtle rounded-xl p-3 text-text-main focus:outline-none focus:border-indigo-500"
                            placeholder="Örn: assets"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setCreateFolderModalOpen(false)}>İptal</Button>
                        <Button variant="primary" onClick={handleCreateFolder}>Oluştur</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StoragePage;
