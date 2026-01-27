import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Box,
    Search,
    Settings,
    CheckCircle2,
    XCircle,
    Zap,
    Package,
    Layers,
    ArrowRight
} from 'lucide-react';
import { useModules } from '@/hooks/useModules';

const ModuleMarketPage: React.FC = () => {
    const { modules, isLoading } = useModules();
    const [searchTerm, setSearchTerm] = useState('');

    const categories = Array.from(new Set((Array.isArray(modules) ? modules : []).map(m => m.category)));

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Modül Marketi</h2>
                    <p className="text-text-muted mt-1">Platform özelliklerini genişletin ve tenantlar için modül dağıtımını yönetin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Layers}>Kategorileri Yönet</Button>
                    <Button icon={Package}>Yeni Modül Kaydet</Button>
                </div>
            </div>

            <Card className="bg-indigo-500/5 border-border-subtle">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                        <input
                            type="text"
                            placeholder="Modül adı veya açıklama ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                    <div className="flex bg-indigo-500/5 p-1 rounded-xl">
                        {['Hepsi', ...categories].map((cat) => (
                            <button key={cat} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${cat === 'Hepsi' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-text-muted hover:text-text-main'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="animate-pulse space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-indigo-500/5 rounded-2xl" />
                                <div className="w-16 h-6 bg-indigo-500/5 rounded-full" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 bg-indigo-500/5 rounded" />
                                <div className="h-4 w-1/2 bg-indigo-500/5 rounded" />
                            </div>
                            <div className="pt-6 border-t border-border-subtle flex justify-between">
                                <div className="w-20 h-4 bg-indigo-500/5 rounded" />
                                <div className="w-16 h-8 bg-indigo-500/5 rounded" />
                            </div>
                        </Card>
                    ))
                ) : (
                    (Array.isArray(modules) ? modules : []).filter(m =>
                        (m.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((mod) => (
                        <Card key={mod.id} className="group relative overflow-hidden border-border-subtle hover:border-indigo-500/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Box className="w-16 h-16 text-indigo-400" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${mod.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-text-muted bg-indigo-500/5'}`}>
                                        {mod.isActive ? 'Aktif' : 'Pasif'}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-text-main group-hover:text-indigo-400 transition-colors">{mod.displayName}</h3>
                                    <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-[0.2em] mt-1">{mod.category}</p>
                                </div>

                                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed h-10">
                                    {mod.description || 'Bu modül platform yeteneklerini belirtilen kategoride genişletir.'}
                                </p>

                                <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button className="text-text-muted/20 hover:text-text-main transition-colors">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        <button className={`transition-colors ${mod.isActive ? 'text-rose-500/40 hover:text-rose-500' : 'text-emerald-500/40 hover:text-emerald-500'}`}>
                                            {mod.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <Button variant="ghost" size="sm" className="group/btn h-8 transition-all">
                                        Detaylar <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ModuleMarketPage;
