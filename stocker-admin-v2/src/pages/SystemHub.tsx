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
    HardDrive,
    Layers,
    Server,
    Cpu,
    AlertOctagon
} from 'lucide-react';
import { systemService, type DockerStats } from '@/services/systemService';
import { systemMonitoringService, type SystemMetricsDto, type SystemAlertDto, type SystemServiceStatusDto } from '@/services/systemMonitoringService';
import { toast } from '@/components/ui/Toast';

const SystemHub: React.FC = () => {
    const [dockerStats, setDockerStats] = useState<DockerStats | null>(null);
    const [metrics, setMetrics] = useState<SystemMetricsDto | null>(null);
    const [alerts, setAlerts] = useState<SystemAlertDto[]>([]);
    const [services, setServices] = useState<SystemServiceStatusDto[]>([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [dockerData, metricsData, alertsData, servicesData] = await Promise.all([
                systemService.getDockerStats(),
                systemMonitoringService.getMetrics(),
                systemMonitoringService.getAlerts(),
                systemMonitoringService.getServices()
            ]);

            setDockerStats(dockerData);
            setMetrics(metricsData);
            setAlerts(alertsData || []);
            setServices(servicesData || []);
        } catch (error) {
            console.error('Sistem verileri alınamadı:', error);
            // Non-blocking error
        }
    };

    const handleClean = async () => {
        if (confirm('Tüm Docker kaynaklarını temizleyip yer açmak istediğinize emin misiniz?')) {
            try {
                await systemService.cleanAllDocker();
                toast.success('Docker temizliği başlatıldı.');
                fetchData();
            } catch (error) {
                toast.error('Temizlik işlemi başarısız.');
            }
        }
    };

    const handleAcknowledgeAlert = async (id: string) => {
        try {
            await systemMonitoringService.acknowledgeAlert(id);
            toast.success('Uyarı onaylandı.');
            fetchData();
        } catch (error) {
            toast.error('İşlem başarısız.');
        }
    };

    return (
        <div className="space-y-10 text-text-main animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Sistem Merkezi</h2>
                    <p className="text-text-muted mt-1">Docker altyapısını, sunucu sağlığını ve kritik servisleri izleyin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Terminal}>Terminali Aç</Button>
                    <Button variant="outline" className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10" icon={Trash2} onClick={handleClean}>Tümünü Temizle</Button>
                </div>
            </div>

            {/* Critical Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* CPU */}
                <Card className="p-6 relative overflow-hidden group border-indigo-500/20 bg-indigo-500/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase text-indigo-400">CPU Kullanımı</p>
                            <h3 className="text-3xl font-bold mt-2 text-text-main">{metrics?.cpu.usage || 0}%</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <Cpu className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-indigo-500/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${metrics?.cpu.usage || 0}%` }} />
                    </div>
                </Card>

                {/* RAM */}
                <Card className="p-6 relative overflow-hidden group border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase text-emerald-400">RAM Kullanımı</p>
                            <h3 className="text-3xl font-bold mt-2 text-text-main">{((metrics?.memory.used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-text-muted/60 mb-1">
                        <span>Used</span>
                        <span>{((metrics?.memory.total || 0) / 1024 / 1024 / 1024).toFixed(1)} GB Total</span>
                    </div>
                    <div className="h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${((metrics?.memory.used || 0) / (metrics?.memory.total || 1)) * 100}%` }} />
                    </div>
                </Card>

                {/* Disk */}
                <Card className="p-6 relative overflow-hidden group border-amber-500/20 bg-amber-500/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase text-amber-400">Disk Alanı</p>
                            <h3 className="text-3xl font-bold mt-2 text-text-main">{((metrics?.disk.used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB</h3>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                            <HardDrive className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-amber-500/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${((metrics?.disk.used || 0) / (metrics?.disk.total || 1)) * 100}%` }} />
                    </div>
                </Card>

                {/* Alerts */}
                <Card className="p-6 relative overflow-hidden group border-rose-500/20 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase text-rose-400">Aktif Uyarılar</p>
                            <h3 className="text-3xl font-bold mt-2 text-text-main">{alerts.length}</h3>
                        </div>
                        <div className="p-3 bg-rose-500/20 rounded-xl text-rose-500 animate-pulse">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-xs text-rose-400/60 mt-4 font-medium">Critical system events needing attention.</p>
                </Card>
            </div>

            {/* Docker & Services Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Docker Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 border-blue-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                <Box className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Konteynerler</h4>
                                <p className="text-xs text-blue-400 font-bold uppercase">Docker Status</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-sm font-medium">Çalışan</span>
                                <span className="text-lg font-bold text-emerald-400">{dockerStats?.containers.running || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-sm font-medium">Durdurulmuş</span>
                                <span className="text-lg font-bold text-text-muted">{dockerStats?.containers.stopped || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-sm font-medium">Toplam</span>
                                <span className="text-lg font-bold text-text-main">{dockerStats?.containers.total || 0}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-indigo-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">İmajlar</h4>
                                <p className="text-xs text-indigo-400 font-bold uppercase">Storage Usage</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-sm font-medium">Toplam İmaj</span>
                                <span className="text-lg font-bold text-text-main">{dockerStats?.images.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-sm font-medium">Boyut</span>
                                <span className="text-lg font-bold text-indigo-400">{dockerStats?.images.size || '0 GB'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Service Status */}
                <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Server className="w-5 h-5 text-indigo-400" />
                            Servis Durumları
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            System Healthy
                        </span>
                    </div>
                    <div className="space-y-3">
                        {services.length > 0 ? services.map((service) => (
                            <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${service.status === 'running' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                    <span className="font-medium text-text-main">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-text-muted font-mono">{Math.floor(service.uptime / 3600)}h uptime</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${service.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-text-muted text-center py-4">Servis bilgisi yükleniyor...</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* System Alerts */}
            <Card className="p-8 overflow-hidden">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <AlertOctagon className="w-5 h-5 text-rose-400" />
                    Sistem Uyarıları & Olaylar
                </h3>
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-text-muted/40">
                        <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                        <p>Sistemde aktif uyarı bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 group hover:border-rose-500/20 transition-colors">
                                <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-text-main">{alert.message}</p>
                                        <span className="text-[10px] text-text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${alert.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {alert.severity}
                                        </span>
                                        {!alert.acknowledged && (
                                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAcknowledgeAlert(alert.id)}>
                                                Onayla (Acknowledge)
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SystemHub;
