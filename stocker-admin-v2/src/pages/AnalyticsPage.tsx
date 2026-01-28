import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Calendar,
    Download,
    Filter
} from 'lucide-react';
import { analyticsService, type DashboardStatsDto } from '@/services/analyticsService';

const AnalyticsPage: React.FC = () => {
    const [statsData, setStatsData] = useState<DashboardStatsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await analyticsService.getDashboardStats();
            setStatsData(data);
        } catch (error) {
            console.error('Analitik verileri yüklenemedi:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { label: 'Yıllık Gelir (ARR)', value: statsData ? `$${statsData.totalRevenue.toLocaleString()}` : '$0', change: '+12.5%', isUp: true, icon: DollarSign, color: 'text-emerald-400' },
        { label: 'Aktif Kullanıcı', value: statsData?.activeUsers?.toString() || '0', change: '+8.2%', isUp: true, icon: Users, color: 'text-indigo-400' },
        { label: 'Büyüme Oranı', value: statsData ? `%${statsData.growthRate}` : '%0', change: '+2.1%', isUp: true, icon: TrendingUp, color: 'text-amber-400' },
        { label: 'Sistem Sağlığı', value: statsData?.systemHealth || 'Unknown', change: 'Stabil', isUp: true, icon: Activity, color: 'text-blue-400' },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Sistem Analitiği</h2>
                    <p className="text-text-muted mt-1">Platformun büyüme, performans ve finansal metriklerini derinlemesine inceleyin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Calendar}>Son 30 Gün</Button>
                    <Button variant="outline" icon={Filter}>Filtrele</Button>
                    <Button icon={Download}>Rapor Al</Button>
                </div>
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-indigo-500/5 border-border-subtle relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <stat.icon className="w-12 h-12" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold text-text-main">{stat.value}</p>
                                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Charts Hub */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Card className="lg:col-span-2 p-8 space-y-8 min-h-[400px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-text-main">Gelir Trendi</h3>
                            <p className="text-sm text-text-muted">Aylık bazda platform gelir değişimi.</p>
                        </div>
                        <div className="flex bg-indigo-500/5 p-1 rounded-lg">
                            <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-text-main rounded-md">Gelir</button>
                            <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Kâr</button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 h-64 mt-10">
                        {statsData?.monthlyRevenue?.map((val, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-indigo-500 text-text-main text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${val.toFixed(1)}k
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-indigo-500/20 to-indigo-500 rounded-t-lg transition-all cursor-pointer hover:brightness-125"
                                    style={{ height: `${(val / (Math.max(...(statsData.monthlyRevenue || [100])) || 100)) * 100}%` }}
                                />
                            </div>
                        )) || []}
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-text-muted/40 uppercase tracking-widest px-2">
                        {['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'].map(m => <span key={m}>{m}</span>)}
                    </div>
                </Card>

                <Card className="p-8 space-y-8">
                    <h3 className="text-xl font-bold text-text-main">Paket Dağılımı</h3>
                    <div className="space-y-6">
                        {statsData?.packageDistribution?.map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-text-muted">{item.label}</span>
                                    <span className="text-text-main">{item.value}</span>
                                </div>
                                <div className="h-2 bg-indigo-500/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / (statsData.activeUsers || 1)) * 100}%` }} />
                                </div>
                            </div>
                        )) || []}
                    </div>

                    <div className="pt-6 border-t border-border-subtle">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                <p className="text-xs font-bold text-text-main">Dönüşüm Oranı</p>
                            </div>
                            <span className="text-lg font-bold text-indigo-400">%8.4</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
