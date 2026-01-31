import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
    Key,
    Plus,
    Search,
    Lock,
    ShieldAlert,
    Eye,
    EyeOff,
    Copy,
    Trash2,
    ExternalLink,
    ShieldCheck,
    RefreshCw
} from 'lucide-react';
import { type SecretDto } from '@/services/secretsService';
import { useSecrets } from '@/hooks/useSecrets';

const SecretsPage: React.FC = () => {
    const { secrets, isLoading, deleteMultipleSecrets } = useSecrets();
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [showValues, setShowValues] = useState<Record<string, boolean>>({});

    const toggleValue = (id: string) => {
        setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const columns = [
        {
            header: 'Anahtar / İsim',
            accessor: (sec: SecretDto) => (
                <div className="flex items-center gap-4 text-text-main">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{sec.name}</p>
                        <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{sec.tenantShortId || 'Global'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Tür',
            accessor: (sec: SecretDto) => (
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/5 text-[10px] font-bold text-text-muted uppercase tracking-widest border border-border-subtle">
                        {sec.secretType}
                    </span>
                </div>
            )
        },
        {
            header: 'Durum',
            accessor: (sec: SecretDto) => (
                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${sec.enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-text-muted bg-indigo-500/5'}`}>
                        {sec.enabled ? 'Aktif' : 'Pasif'}
                    </div>
                    <button
                        onClick={() => toggleValue(sec.name)}
                        className="p-2 text-text-muted/20 hover:text-text-main transition-colors"
                    >
                        {showValues[sec.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            )
        },
        {
            header: 'Oluşturma',
            accessor: (sec: SecretDto) => (
                <div className="flex flex-col">
                    <span className="text-xs text-text-muted font-medium">
                        {sec.createdOn ? new Date(sec.createdOn).toLocaleDateString('tr-TR') : '-'}
                    </span>
                    <span className="text-[10px] text-text-muted/40 font-bold uppercase tracking-tighter">Azure Key Vault Managed</span>
                </div>
            )
        },
        {
            header: '',
            accessor: () => (
                <div className="flex justify-end gap-2">
                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted/20 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    const [selectedSecretIds, setSelectedSecretIds] = useState<(string | number)[]>([]);

    const handleBulkDelete = async () => {
        if (!selectedSecretIds.length) return;

        if (!confirm(`${selectedSecretIds.length} adet hassas veri silinecek. Bu işlem geri alınamaz! Emin misiniz?`)) return;

        try {
            await deleteMultipleSecrets(selectedSecretIds.map(id => id.toString()));
            setSelectedSecretIds([]);
        } catch (error) {
            // Error is handled in useSecrets hook toast
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        Güvenlik Kasası (Vault)
                    </h2>
                    <p className="text-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Platform Hassas Veri ve Kimlik Bilgisi Yönetimi</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={RefreshCw}>Eşitle</Button>
                    <Button icon={Plus}>Hassas Veri Ekle</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-indigo-500/5 border-indigo-500/20 group hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aktif Şifreleme</p>
                            <p className="text-2xl font-bold text-text-main">AES-256</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20 group hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Bağlı Vault</p>
                            <p className="text-2xl font-bold text-text-main">Production</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-rose-500/5 border-rose-500/20 group hover:border-rose-500/40 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Kritik Uyarılar</p>
                            <p className="text-2xl font-bold text-text-main">0</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card noPadding className="overflow-hidden border-border-subtle backdrop-blur-3xl transition-all duration-300">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                        <input
                            type="text"
                            placeholder="Anahtar veya kategori ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedSecretIds.length > 0 && (
                            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>
                                Seçilenleri Sil ({selectedSecretIds.length})
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" icon={ExternalLink}>Azure Logs</Button>
                    </div>
                </div>
                <Table
                    columns={columns as any}
                    data={(Array.isArray(secrets) ? secrets : [])
                        .filter(s =>
                            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.tenantShortId || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(s => ({ ...s, id: s.name }))
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    }
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        pageSize,
                        totalCount: (Array.isArray(secrets) ? secrets : []).length,
                        totalPages: Math.ceil((Array.isArray(secrets) ? secrets : []).length / pageSize),
                        onPageChange: setCurrentPage
                    }}
                    selectedIds={selectedSecretIds}
                    onSelectionChange={setSelectedSecretIds}
                    idField="name"
                />
            </Card>
        </div>
    );
};

export default SecretsPage;
