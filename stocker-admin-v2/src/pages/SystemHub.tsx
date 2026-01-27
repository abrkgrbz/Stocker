import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Activity,
    Box,
    Terminal,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Zap,
    HardDrive,
    Layers
} from 'lucide-react';
import { systemService, type DockerStats } from '@/services/systemService';

const SystemHub: React.FC = () => {
    const [stats, setStats] = useState<DockerStats | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await systemService.getDockerStats();
            setStats(data);
        } catch (error) {
            console.error('Sistem verileri alınamadı:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClean = async () => {
        if (confirm('Tüm Docker kaynaklarını temizleyip yer açmak istediğinize emin misiniz?')) {
            await systemService.cleanAllDocker();
            fetchData();
        }
    };

    return (
        <div className="space-y-10 text-text-main">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Sistem Merkezi</h2>
                    <p className="text-text-muted mt-1">Docker altyapısını, sunucu sağlığını ve sistem kaynaklarını izleyin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Terminal}>Terminali Aç</Button>
                    <Button variant="outline" className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10" icon={Trash2} onClick={handleClean}>Tümünü Temizle</Button>
                </div>
            </div>

            {/* Docker Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:bg-blue-500/20 transition-all">
                            <Box className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Konteynerler</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold">{stats?.containers.running || 0}</span>
                                <span className="text-sm font-bold text-emerald-500">Çalışıyor</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-text-muted">Kapasite Kullanımı</span>
                            <span className="text-text-main">64%</span>
                        </div>
                        <div className="h-1.5 bg-indigo-500/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full w-[64%]" />
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500/20 transition-all">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">İmajlar (Docker Images)</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold">{stats?.images.total || 0}</span>
                                <span className="text-sm font-bold text-indigo-400">{stats?.images.size || '0 GB'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-border-subtle">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase text-text-muted">Build Cache Temiz</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]">İncele</Button>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl group-hover:bg-amber-500/20 transition-all">
                            <HardDrive className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Disk Birimleri (Volumes)</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold">{stats?.volumes.total || 0}</span>
                                <span className="text-sm font-bold text-amber-400">{stats?.volumes.size || '0 GB'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                        <AlertTriangle className="w-4 h-4 animate-pulse" />
                        <span>2 Kullanılmayan Volume Bulundu</span>
                    </div>
                </Card>
            </div>

            {/* Real-time Performance Hub */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">CPU & Bellek Kullanımı</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-xs font-bold text-text-muted">CPU</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-text-muted">RAM</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-48 flex items-end justify-between gap-2">
                        {[40, 65, 30, 85, 45, 90, 25, 70, 50, 75, 40, 60].map((val, i) => (
                            <div key={i} className="flex-1 space-y-1">
                                <div className="w-full bg-indigo-500/10 rounded-t-lg transition-all hover:bg-indigo-500/30" style={{ height: `${val}%` }} />
                                <div className="w-full bg-emerald-500/10 rounded-b-lg transition-all hover:bg-emerald-500/30" style={{ height: `${val * 0.7}%` }} />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-text-muted/40 px-1">
                        <span>Son 60 Dakika</span>
                        <div className="flex items-center gap-2 text-text-muted/20 uppercase tracking-widest">
                            <Activity className="w-3 h-3" />
                            Real-time Monitoring Active
                        </div>
                    </div>
                </Card>

                <Card className="p-8 space-y-6">
                    <h3 className="text-xl font-bold">Sistem Hataları & Loglar</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-4">
                        {[
                            { time: '14:22:15', type: 'error', source: 'Auth Service', msg: 'JWT token validation failed for tenant-12' },
                            { time: '14:20:04', type: 'warning', source: 'Storage', msg: 'Disk space reaching 90% on volume-4' },
                            { time: '14:18:32', type: 'info', source: 'System', msg: 'Automatic backup completed successfully' },
                            { time: '14:15:10', type: 'error', source: 'Database', msg: 'Connection timeout on cluster-A node-2' },
                            { time: '14:10:55', type: 'info', source: 'Module', msg: 'Retail Inventory module updated to v1.2.4' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-xl bg-indigo-500/5 border border-border-subtle group hover:bg-indigo-500/10 transition-all">
                                <div className={`w-1 font-bold rounded-full ${log.type === 'error' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-text-muted/40">{log.time} — {log.source}</span>
                                        <Zap className={`w-3 h-3 ${log.type === 'error' ? 'text-rose-500' : 'text-text-muted/10'}`} />
                                    </div>
                                    <p className="text-sm font-medium text-text-muted mt-0.5">{log.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full">Tüm Logları İncele</Button>
                </Card>
            </div>
        </div>
    );
};

export default SystemHub;
