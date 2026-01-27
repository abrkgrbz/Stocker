import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
    Users,
    ShieldCheck,
    Search,
    Plus,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Filter,
    Mail,
    Phone,
    TrendingUp
} from 'lucide-react';
import type { TenantListDto } from '@/services/tenantService';
import { useTenants } from '@/hooks/useTenants';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';

const TenantsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const {
        tenants,
        totalCount,
        isLoadingTenants,
        stats,
        isLoadingStats,
        toggleStatus,
        deleteTenant
    } = useTenants({ searchTerm, pageNumber: currentPage, pageSize });

    const toast = useToast();

    const handleToggleStatus = (id: string) => {
        toggleStatus(id);
    };

    const handleDeleteTenant = (id: string) => {
        if (confirm('Bu tenantı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            // @ts-ignore
            deleteTenant({ id });
        }
    };

    const columns = [
        {
            header: 'Tenant / Organizasyon',
            accessor: (tenant: TenantListDto) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                        {tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-text-main font-bold">{tenant.name}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{tenant.code}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'İletişim',
            accessor: (tenant: TenantListDto) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-text-muted">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-xs">{tenant.contactEmail}</span>
                    </div>
                    {tenant.contactPhone && (
                        <div className="flex items-center gap-2 text-text-muted">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-xs">{tenant.contactPhone}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Paket',
            accessor: (tenant: TenantListDto) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tenant.packageName === 'Enterprise' ? 'bg-amber-500/10 text-amber-500' :
                    tenant.packageName === 'Professional' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-indigo-500/5 text-text-muted'
                    }`}>
                    {tenant.packageName || 'Standart'}
                </span>
            )
        },
        {
            header: 'Durum',
            accessor: (tenant: TenantListDto) => (
                <button
                    onClick={() => handleToggleStatus(tenant.id)}
                    className="flex items-center gap-2 group cursor-pointer"
                >
                    {tenant.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold group-hover:brightness-125 transition-all">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aktif
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold group-hover:brightness-125 transition-all">
                            <XCircle className="w-3.5 h-3.5" />
                            Pasif
                        </div>
                    )}
                </button>
            )
        },
        {
            header: 'Kullanıcılar',
            accessor: (tenant: TenantListDto) => (
                <div className="flex items-center gap-2 text-text-muted">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{tenant.userCount}</span>
                </div>
            )
        },
        {
            header: 'Oluşturulma',
            accessor: (tenant: TenantListDto) => (
                <div className="text-xs text-text-muted">
                    {new Date(tenant.createdAt).toLocaleDateString('tr-TR')}
                </div>
            )
        },
        {
            header: 'İşlemler',
            accessor: (tenant: TenantListDto) => (
                <div className="flex items-center justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="p-2 hover:text-rose-500 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:text-text-main transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Tenant Yönetimi</h2>
                    <p className="text-text-muted mt-1">Sistemdeki tüm alt organizasyonları ve abonelikleri yönetin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Tenant ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-6 text-sm placeholder:text-text-muted focus:outline-none focus:border-indigo-500/30 transition-all text-text-main"
                        />
                    </div>
                    <Button variant="outline" icon={Filter} className="hidden lg:flex">Filtrele</Button>
                    <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Yeni Tenant</Button>
                </div>
            </div>

            {/* Add Tenant Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Yeni Tenant Oluştur"
            >
                <form className="space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    // TODO: Implement create logic here using tenantService.create
                    toast.show('Yeni tenant özelliği henüz yapım aşamasında', 'info');
                    setIsAddModalOpen(false);
                }}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Organizasyon Adı" placeholder="Örn: ABC Lojistik" required />
                        <Input label="Organizasyon Kodu" placeholder="Örn: ABC-01" required />
                    </div>
                    {/* <Input label="Domain" placeholder="abc.stocker.app" required /> */}
                    <Input label="Yönetici E-posta" type="email" placeholder="admin@abc.com" required />
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>İptal</Button>
                        <Button type="submit">Kaydet ve Başlat</Button>
                    </div>
                </form>
            </Modal>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Toplam Tenant</p>
                            <p className="text-2xl font-bold text-text-main mt-0.5">
                                {isLoadingStats ? '...' : (stats?.totalTenants || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aktif</p>
                            <p className="text-2xl font-bold text-text-main mt-0.5">
                                {isLoadingStats ? '...' : (stats?.activeTenants || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Askıda/Pasif</p>
                            <p className="text-2xl font-bold text-text-main mt-0.5">
                                {isLoadingStats ? '...' : (stats?.suspendedTenants || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Bu Ay Yeni</p>
                            <p className="text-2xl font-bold text-text-main mt-0.5">
                                {isLoadingStats ? '...' : (stats?.newTenantsThisMonth || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table */}
            <Card noPadding className="border-border-subtle overflow-hidden">
                <Table
                    columns={columns}
                    data={tenants || []}
                    isLoading={isLoadingTenants}
                    onRowClick={(tenant: TenantListDto) => navigate(`/tenants/${tenant.id}`)}
                    pagination={{
                        currentPage,
                        pageSize,
                        totalCount: totalCount || (tenants || []).length,
                        totalPages: Math.ceil((totalCount || 0) / pageSize),
                        onPageChange: setCurrentPage
                    }}
                />
            </Card>
        </div>
    );
};

export default TenantsPage;
