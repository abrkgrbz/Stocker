import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Layout,
    PenTool,
    Users,
    Files,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { cmsService } from '../services/cms.service';

export const CMSPage: React.FC = () => {
    const navigate = useNavigate();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['cms-stats'],
        queryFn: cmsService.getStats
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Layout className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Toplam Sayfa</p>
                            <h3 className="text-2xl font-bold text-white">{stats?.totalPages.count || 0}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                        <span className={`${(stats?.totalPages.change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'} font - medium`}>
                            {(stats?.totalPages.change || 0) >= 0 ? '+' : ''}{stats?.totalPages.change || 0}
                        </span>
                        {stats?.totalPages.period}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Blog Yazısı</p>
                            <h3 className="text-2xl font-bold text-white">{stats?.totalPosts.count || 0}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                        <span className={`${(stats?.totalPosts.change || 0) >= 0 ? 'text-purple-400' : 'text-rose-400'} font - medium`}>
                            {(stats?.totalPosts.change || 0) >= 0 ? '+' : ''}{stats?.totalPosts.change || 0}
                        </span>
                        {stats?.totalPosts.period}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Ziyaretçi</p>
                            <h3 className="text-2xl font-bold text-white">{stats?.totalVisitors.count.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                        <span className={`${(stats?.totalVisitors.changePercentage || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'} font - medium`}>
                            %{stats?.totalVisitors.changePercentage || 0}
                        </span>
                        {stats?.totalVisitors.period}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Files className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Medya Dosyası</p>
                            <h3 className="text-2xl font-bold text-white">{stats?.storage.fileCount.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted">
                        {(stats ? (stats.storage.usedBytes / 1024 / 1024 / 1024).toFixed(2) : '0')} GB kullanılan alan
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <h3 className="text-lg font-bold text-white mb-4">Hızlı İşlemler</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/cms/blog/new')}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <PenTool className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-text-main group-hover:text-white">Yeni Blog Yazısı</h4>
                                <p className="text-xs text-text-muted">Bir makale veya duyuru yayınlayın.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate('/cms/pages/new')}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Layout className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-text-main group-hover:text-white">Yeni Sayfa Oluştur</h4>
                                <p className="text-xs text-text-muted">Yeni bir statik sayfa ekleyin.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <h3 className="text-lg font-bold text-white mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                        {stats?.recentActivity?.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border-subtle last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                <div className="text-sm text-text-main">
                                    <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="text-indigo-400">{activity.target}</span>
                                    <p className="text-xs text-text-muted mt-1">
                                        {new Date(activity.timestamp).toLocaleString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                            <div className="text-text-muted text-sm text-center py-4">Henüz bir aktivite yok.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSPage;
