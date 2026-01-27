import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Activity,
    ShieldCheck,
    Zap,
    Clock,
    RefreshCw,
    Server
} from 'lucide-react';

const APIStatusPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const endpoints = [
        { name: 'Identity Service', status: 'Healthy', latency: '45ms', uptime: '99.99%', load: '12%' },
        { name: 'Tenant Management', status: 'Healthy', latency: '62ms', uptime: '99.95%', load: '24%' },
        { name: 'Billing Engine', status: 'Healthy', latency: '120ms', uptime: '99.98%', load: '8%' },
        { name: 'Notification Hub', status: 'Degraded', latency: '850ms', uptime: '98.50%', load: '92%' },
        { name: 'Analytics API', status: 'Healthy', latency: '150ms', uptime: '99.90%', load: '45%' },
        { name: 'Storage Provider', status: 'Healthy', latency: '35ms', uptime: '100.00%', load: '5%' },
    ];

    const fetchData = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
    };

    return (
        <div className="space-y-10 text-text-main">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-400" />
                        API Durumu & Sağlık
                    </h2>
                    <p className="text-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Sistem Servislerinin Canlı Performans İzlemesi</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={RefreshCw} onClick={fetchData} className={isLoading ? 'animate-spin' : ''}>Yenile</Button>
                </div>
            </div>

            {/* Global Status Banner */}
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Tüm Sistemler Çalışıyor</h3>
                            <p className="text-text-muted mt-1 font-medium italic">Son 24 saat içinde herhangi bir kesinti yaşanmadı.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40">Ortalama Uptime</p>
                        <p className="text-3xl font-bold text-emerald-400">99.98%</p>
                    </div>
                </div>
            </Card>

            {/* Endpoint Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endpoints.map((ep, i) => (
                    <Card key={i} className="group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${ep.status === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                                <h4 className="font-bold text-text-main">{ep.name}</h4>
                            </div>
                            <Server className="w-4 h-4 text-text-muted/20" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-indigo-500/5 border border-border-subtle">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Clock className="w-3 h-3 text-text-muted" />
                                    <span className="text-[10px] font-bold uppercase text-text-muted/40 tracking-wider">Gecikme</span>
                                </div>
                                <p className="text-sm font-bold text-text-main">{ep.latency}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-500/5 border border-border-subtle">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Zap className="w-3 h-3 text-text-muted" />
                                    <span className="text-[10px] font-bold uppercase text-text-muted/40 tracking-wider">Yük</span>
                                </div>
                                <p className="text-sm font-bold text-text-main">{ep.load}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border-subtle">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Çalışma Süresi</span>
                            <span className="text-xs font-bold text-emerald-500">{ep.uptime}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Performance Chart Placeholder */}
            <Card title="Global Response Time" subtitle="Son 60 dakikanın ortalaması">
                <div className="h-64 flex items-end justify-between gap-1 px-4">
                    {[30, 45, 35, 50, 40, 60, 55, 45, 30, 25, 40, 50, 45, 35, 30, 45, 60, 55, 50, 40].map((val, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-indigo-500/20 rounded-t-sm hover:bg-indigo-500/40 transition-all cursor-crosshair"
                            style={{ height: `${val}%` }}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default APIStatusPage;
