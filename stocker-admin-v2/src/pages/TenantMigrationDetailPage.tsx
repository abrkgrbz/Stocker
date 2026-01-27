import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { migrationService } from '@/services/migrationService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Clock, CheckCircle2, Database, ShieldCheck } from 'lucide-react';

const TenantMigrationDetailPage: React.FC = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();

    const { data: history, isLoading, error } = useQuery({
        queryKey: ['migration-history', tenantId],
        queryFn: () => migrationService.getMigrationHistory(tenantId!),
        enabled: !!tenantId
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-indigo-400">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !history) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-text-main">Geçmiş bilgisi alınamadı</h2>
                <Button variant="ghost" onClick={() => navigate(-1)} icon={ArrowLeft}>
                    Geri Dön
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 flex items-center justify-center" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main">
                        {history.tenantName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-text-muted">
                        <span className="font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold">
                            {history.tenantCode}
                        </span>
                        <span>&bull;</span>
                        <span className="text-sm">Migration Geçmişi</span>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Toplam Uygulanan</p>
                            <p className="text-2xl font-bold text-text-main mt-0.5">{history.totalMigrations}</p>
                        </div>
                    </div>
                </Card>
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Son İşlem</p>
                            <p className="text-sm font-bold text-text-main mt-0.5">Bugün</p>
                        </div>
                    </div>
                </Card>
                <Card noPadding className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Şema Versiyonu</p>
                            <p className="text-sm font-bold text-text-main mt-0.5">v{history.totalMigrations}.0.2</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Timeline View */}
            <Card title="Uygulama Geçmişi" subtitle="Bu tenant üzerinde gerçekleştirilen veritabanı şema değişiklikleri.">
                <div className="relative border-l-2 border-border-subtle ml-4 space-y-8 py-4">
                    {history.appliedMigrations.length > 0 ? (
                        history.appliedMigrations.slice().reverse().map((migration, index) => (
                            <div key={index} className="relative pl-8 group">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-indigo-500 bg-bg-surface group-hover:scale-125 transition-transform duration-300" />

                                <div className="p-4 rounded-2xl bg-indigo-500/[0.02] border border-border-subtle group-hover:border-indigo-500/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                        <h4 className="text-sm font-bold text-indigo-400 font-mono break-all">{migration}</h4>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg self-start md:self-auto">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Başarılı
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                        <Clock className="w-3 h-3" />
                                        <span>Otomatik uygulandı</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pl-8 text-text-muted italic text-sm">
                            Henüz uygulanmış bir migration bulunmuyor.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

// Missing imports patch for AlertCircle if it wasn't imported
import { AlertCircle } from 'lucide-react';

export default TenantMigrationDetailPage;
