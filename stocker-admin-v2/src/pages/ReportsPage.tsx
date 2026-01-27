import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
    FileText,
    Download,
    Search,
    Filter,
    Calendar,
    PieChart,
    BarChart,
    TrendingUp,
    CreditCard,
    Building2,
    CheckCircle2,
    Clock
} from 'lucide-react';

const ReportsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading] = useState(false);

    // Fallback / Mock until reportService is fully expanded
    const reportResults = [
        { id: '1', name: 'Aylık Gelir Analizi', type: 'Finansal', generatedAt: '2024-01-25T14:30:00', format: 'PDF', size: '2.4 MB', status: 'Completed' },
        { id: '2', name: 'Tenant Büyüme Raporu', type: 'Operasyonel', generatedAt: '2024-01-24T10:15:00', format: 'Excel', size: '1.1 MB', status: 'Completed' },
        { id: '3', name: 'Sistem Performans Özeti', type: 'Sistem', generatedAt: '2024-01-23T09:00:00', format: 'PDF', size: '840 KB', status: 'Completed' },
        { id: '4', name: 'Yıllık Projeksiyonlar', type: 'Finansal', generatedAt: '2024-01-22T16:45:00', format: 'Excel', size: '5.2 MB', status: 'Scheduled' },
    ];

    const columns = [
        {
            header: 'Rapor İsmi',
            accessor: (rpt: any) => (
                <div className="flex items-center gap-4 text-text-main">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{rpt.name}</p>
                        <span className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{rpt.type}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Format & Boyut',
            accessor: (rpt: any) => (
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${rpt.format === 'PDF' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {rpt.format}
                    </span>
                    <span className="text-xs text-text-muted/60">{rpt.size}</span>
                </div>
            )
        },
        {
            header: 'Oluşturulma',
            accessor: (rpt: any) => (
                <div className="flex flex-col">
                    <span className="text-xs text-text-muted font-medium">{new Date(rpt.generatedAt).toLocaleDateString('tr-TR')}</span>
                    <span className="text-[10px] text-text-muted/40 font-bold uppercase tracking-tighter">{new Date(rpt.generatedAt).toLocaleTimeString('tr-TR')}</span>
                </div>
            )
        },
        {
            header: 'Durum',
            accessor: (rpt: any) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${rpt.status === 'Completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                    {rpt.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {rpt.status === 'Completed' ? 'Hazır' : 'Planlandı'}
                </div>
            )
        },
        {
            header: '',
            accessor: () => (
                <div className="flex justify-end">
                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <BarChart className="w-8 h-8 text-indigo-400" />
                        Finansal Raporlar
                    </h2>
                    <p className="text-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Sistem Verimliliği ve Gelir Dokümantasyonu</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Calendar}>Periyot Seç</Button>
                    <Button icon={TrendingUp}>Hızlı Rapor Oluştur</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 space-y-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-border-subtle">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Gelir Analizi</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Yıllık Verimlilik</h3>
                    <p className="text-sm text-text-muted leading-relaxed">Sistem gelirlerinin paket bazlı dağılımını ve yıllık büyüme trendlerini içeren detaylı analiz.</p>
                    <Button variant="outline" className="w-full h-12 group">
                        Analizi İncele <TrendingUp className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                    </Button>
                </Card>

                <Card className="p-8 space-y-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-border-subtle">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Kullanım Özeti</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Tenant Sağlığı</h3>
                    <p className="text-sm text-text-muted leading-relaxed">Aktif organizasyonların sistem kaynaklarını kullanım oranları ve churn risk analizleri.</p>
                    <Button variant="outline" className="w-full h-12 group border-emerald-500/20 hover:bg-emerald-500/5">
                        Raporu Görüntüle <TrendingUp className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                    </Button>
                </Card>

                <Card className="p-8 space-y-6 bg-gradient-to-br from-amber-500/10 to-transparent border-border-subtle">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Fatura Geçmişi</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Ödeme Takibi</h3>
                    <p className="text-sm text-text-muted leading-relaxed">Tahsilat oranları, bekleyen ödemeler ve vergi düzenlemelerine uygun finansal dökümler.</p>
                    <Button variant="outline" className="w-full h-12 group border-amber-500/20 hover:bg-amber-500/5">
                        Dökümleri İndir <TrendingUp className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                    </Button>
                </Card>
            </div>

            <Card noPadding className="overflow-hidden border-border-subtle backdrop-blur-3xl transition-all duration-300">
                <div className="p-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                        <input
                            type="text"
                            placeholder="Rapor ismi veya türü ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3.5 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" icon={Filter}>Kategori</Button>
                        <Button variant="ghost" size="sm" icon={Download}>Tümünü İndir</Button>
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={reportResults.filter(r =>
                        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.type.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    isLoading={isLoading}
                />
            </Card>
        </div>
    );
};

export default ReportsPage;
