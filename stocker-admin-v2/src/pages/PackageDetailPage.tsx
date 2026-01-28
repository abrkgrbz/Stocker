import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { packageService, type PackageDto } from '@/services/packageService';
import { toast } from '@/components/ui/Toast';
import {
    ArrowLeft,
    Box,
    CheckCircle2,
    Database,
    Tag,
    Edit,
    Trash2,
    Users,
    HardDrive,
    Layers,
    Clock
} from 'lucide-react';

const PackageDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState<PackageDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchPackage(id);
        }
    }, [id]);

    const fetchPackage = async (packageId: string) => {
        setIsLoading(true);
        try {
            const data = await packageService.getById(packageId);
            setPkg(data);
        } catch (error) {
            console.error('Paket detayları alınamadı:', error);
            toast.error('Paket blgileri yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!pkg || !confirm('Bu paketi silmek istediğinize emin misiniz?')) return;

        try {
            await packageService.delete(pkg.id);
            toast.success('Paket başarıyla silindi.');
            navigate('/billing');
        } catch (error) {
            toast.error('Paket silinirken hata oluştu veya paket kullanımda.');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-text-muted">Yükleniyor...</div>;
    }

    if (!pkg) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Box className="w-12 h-12 text-text-muted" />
                <h2 className="text-xl font-bold text-text-main">Paket Bulunamadı</h2>
                <Button variant="outline" onClick={() => navigate('/billing')}>Geri Dön</Button>
            </div>
        );
    }

    const formatLimit = (value: number | undefined, type: 'users' | 'storage' | 'projects') => {
        if (value === undefined) return '-';
        if (value >= 2147483647) return 'Sınırsız';
        if (type === 'storage') return `${value} GB`;
        return value.toString();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" className="mt-1" icon={ArrowLeft} onClick={() => navigate('/billing')}>Geri</Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight text-text-main">{pkg.name}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${pkg.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {pkg.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                            {pkg.isPublic && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-500/10 text-blue-400">
                                    Public
                                </span>
                            )}
                        </div>
                        <p className="text-text-muted mt-2 text-lg">{pkg.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                    <Button variant="outline" icon={Edit} onClick={() => alert('Düzenleme henüz aktif değil')}>Düzenle</Button>
                    <Button variant="outline" className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10" icon={Trash2} onClick={handleDelete}>Sil</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Basic Info */}
                <div className="space-y-8 lg:col-span-1">
                    <Card className="p-6 border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold uppercase text-indigo-400">Paket Fiyatı</p>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <h3 className="text-4xl font-bold text-text-main">
                                        {pkg.basePrice?.amount?.toLocaleString('tr-TR')}
                                    </h3>
                                    <span className="text-sm font-bold text-text-muted">{pkg.basePrice?.currency}</span>
                                </div>
                                <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">{pkg.billingCycle}</p>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Tag className="w-6 h-6" />
                            </div>
                        </div>
                        {pkg.trialDays && pkg.trialDays > 0 && (
                            <div className="flex items-center gap-2 text-sm text-text-muted pt-4 border-t border-indigo-500/10">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span>{pkg.trialDays} Gün Deneme Süresi</span>
                            </div>
                        )}
                    </Card>

                    <Card title="Limitler & Kotalar">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm text-text-muted">Kullanıcı Limiti</span>
                                </div>
                                <span className="font-bold text-text-main">{formatLimit(pkg.maxUsers, 'users')}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <HardDrive className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-text-muted">Depolama</span>
                                </div>
                                <span className="font-bold text-text-main">{formatLimit(pkg.maxStorage, 'storage')}</span>
                            </div>
                            {/* Example logic for checking object limits if they exist in generic fields or future metadata */}
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Database className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm text-text-muted">Max Proje</span>
                                </div>
                                {/* Assuming we might not have this field directly on DTO yet based on interface, creating placeholder or checking if mapped */}
                                <span className="font-bold text-text-main">Sınırsız</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Meta Bilgiler">
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-text-muted">ID</span>
                                <span className="font-mono text-xs text-text-main">{pkg.id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-text-muted">Oluşturulma</span>
                                <span className="text-text-main">{new Date(pkg.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-text-muted">Tip</span>
                                <span className="text-text-main">{pkg.type || 'Standard'}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-text-muted">Görüntüleme Sırası</span>
                                <span className="text-text-main">{pkg.displayOrder}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Features & Modules */}
                <div className="space-y-8 lg:col-span-2">
                    <Card title="Özellikler (Features)" className="min-h-[200px]">
                        {pkg.features && pkg.features.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pkg.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className={`mt-0.5 p-1 rounded-full ${feature.isEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-text-muted/20 text-text-muted'}`}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-text-main">{feature.featureName}</h4>
                                            <p className="text-xs text-text-muted font-mono mt-1 opacity-60">{feature.featureCode}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-center py-6">Bu pakete tanımlı özellik bulunmamaktadır.</p>
                        )}
                    </Card>

                    <Card title="Dahil Olan Modüller" className="min-h-[200px]">
                        {pkg.modules && pkg.modules.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pkg.modules.map((module, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                        <Layers className="w-5 h-5 text-indigo-400" />
                                        <div>
                                            <h4 className="text-sm font-bold text-text-main">{module.moduleName}</h4>
                                            <p className="text-xs text-text-muted font-mono mt-0.5 opacity-60">{module.moduleCode}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-center py-6">Bu pakete tanımlı modül bulunmamaktadır.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PackageDetailPage;
