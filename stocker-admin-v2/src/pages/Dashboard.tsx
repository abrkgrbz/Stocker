import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    TrendingUp,
    Users,
    ShieldCheck,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Plus
} from 'lucide-react';

import { useDashboard } from '@/hooks/useDashboard';

const Dashboard: React.FC = () => {
    const { data: stats, isLoading } = useDashboard();
    console.log('Dashboard stats:', stats);

    const statCards = [
        { label: 'Toplam Gelir', value: `₺${stats?.totalRevenue?.toLocaleString() || '0'}`, change: stats?.revenueChange || '0%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Aktif Tanent', value: stats?.activeTenants?.toLocaleString() || '0', change: stats?.tenantsChange || '0%', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Sistem Yükü', value: `${stats?.systemLoad || 0}%`, change: stats?.loadChange || '0%', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Yeni Kullanıcı', value: stats?.newUsers?.toLocaleString() || '0', change: stats?.usersChange || '0%', icon: Users, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];
    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Hoş Geldin, Admin</h2>
                    <p className="text-text-muted mt-1">Sistem bugün %99.9 çalışma oranıyla stabil durumda.</p>
                </div>
                <Button icon={Plus}>Yeni Rapor Oluştur</Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="group hover:border-border-subtle transition-colors">
                        {isLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-10 w-10 bg-indigo-500/5 rounded-2xl" />
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-indigo-500/5 rounded" />
                                    <div className="h-8 w-32 bg-indigo-500/5 rounded" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {stat.change}
                                        {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1 tracking-tight text-text-main">{stat.value}</p>
                                </div>
                            </>
                        )}
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Chart Placeholder */}
                <Card title="Gelir Dağılımı" subtitle="Son 30 günlük veriler" className="xl:col-span-2 min-h-[400px]">
                    <div className="h-64 w-full bg-indigo-500/5 border border-dashed border-border-subtle rounded-3xl flex items-center justify-center">
                        <p className="text-text-muted font-medium italic">Chart Bileşeni Hazırlanıyor...</p>
                    </div>
                </Card>

                {/* Live Activity Feed */}
                <Card title="Son Aktiviteler" subtitle="Sistem genelinde canlı" className="flex flex-col">
                    <div className="space-y-6">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-indigo-500/5 rounded" />
                                        <div className="h-2 w-1/2 bg-indigo-500/5 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            stats?.recentActivities?.map((activity, index) => (
                                <div key={activity.id || index} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/5 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/10 transition-colors">
                                        <ShieldCheck className="w-4 h-4 text-indigo-400 opacity-40 group-hover:opacity-100" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-text-main">{activity.title}</p>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{activity.description} • {activity.time}</p>
                                    </div>
                                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <Button variant="ghost" className="mt-8 w-full">Tümünü Gör</Button>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
