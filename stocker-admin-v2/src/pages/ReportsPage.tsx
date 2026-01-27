import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import {
    FileText,
    Download,
    Search,
    Filter,
    PieChart,
    BarChart,
    TrendingUp,
    CreditCard,
    Building2,
    CheckCircle2,
    Clock,
    RefreshCw,
    Play
} from 'lucide-react';
import { reportService, type ReportHistoryDto, type ReportTypeDto } from '@/services/reportService';

const ReportsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [reports, setReports] = useState<ReportHistoryDto[]>([]);
    const [reportTypes, setReportTypes] = useState<ReportTypeDto[]>([]);
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchData();
        fetchTypes();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await reportService.getHistory();
            setReports(data || []);
        } catch (error) {
            toast.error('Rapor geçmişi yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTypes = async () => {
        try {
            const types = await reportService.getTypes();
            setReportTypes(types || []);
        } catch (error) {
            console.error('Rapor türleri alınamadı:', error);
        }
    };

    const handleDownload = async (reportId: string, fileName: string) => {
        try {
            const blob = await reportService.download(reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast.error('Rapor indirilemedi.');
        }
    };

    const handleGenerate = async () => {
        if (!selectedType) return;
        setIsGenerating(true);
        try {
            await reportService.generate(selectedType);
            toast.success('Rapor oluşturma işlemi başlatıldı.');
            setGenerateModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Rapor oluşturulamadı.');
        } finally {
            setIsGenerating(false);
        }
    };

    const columns = [
        {
            header: 'Rapor İsmi',
            accessor: (rpt: ReportHistoryDto) => (
                <div className="flex items-center gap-4 text-text-main">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{reportTypes.find(t => t.id === rpt.type)?.name || rpt.type}</p>
                        <span className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{reportTypes.find(t => t.id === rpt.type)?.category || 'Genel'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Oluşturulma',
            accessor: (rpt: ReportHistoryDto) => (
                <div className="flex flex-col">
                    <span className="text-xs text-text-muted font-medium">{new Date(rpt.generatedAt).toLocaleDateString('tr-TR')}</span>
                    <span className="text-[10px] text-text-muted/40 font-bold uppercase tracking-tighter">{new Date(rpt.generatedAt).toLocaleTimeString('tr-TR')}</span>
                </div>
            )
        },
        {
            header: 'Durum',
            accessor: (rpt: ReportHistoryDto) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${rpt.status === 'Completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                    {rpt.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {rpt.status === 'Completed' ? 'Hazır' : 'İşleniyor'}
                </div>
            )
        },
        {
            header: '',
            accessor: (rpt: ReportHistoryDto) => (
                <div className="flex justify-end">
                    {rpt.status === 'Completed' && (
                        <button
                            onClick={() => handleDownload(rpt.id, `${rpt.type}-${new Date(rpt.generatedAt).toISOString()}.pdf`)}
                            className="p-2 text-text-muted/50 hover:text-indigo-400 transition-colors"
                            title="İndir"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ),
            className: 'text-right'
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <BarChart className="w-8 h-8 text-indigo-400" />
                        Finansal Raporlar
                    </h2>
                    <p className="text-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Sistem Verimliliği ve Gelir Dokümantasyonu</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={RefreshCw} onClick={fetchData}>Yenile</Button>
                    <Button icon={TrendingUp} onClick={() => setGenerateModalOpen(true)}>Hızlı Rapor Oluştur</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 space-y-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-border-subtle group hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Gelir Analizi</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Yıllık Verimlilik</h3>
                    <p className="text-sm text-text-muted leading-relaxed">Sistem gelirlerinin paket bazlı dağılımını ve yıllık büyüme trendlerini içeren detaylı analiz.</p>
                </Card>

                <Card className="p-8 space-y-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-border-subtle group hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Kullanım Özeti</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Tenant Sağlığı</h3>
                    <p className="text-sm text-text-muted leading-relaxed">Aktif organizasyonların sistem kaynaklarını kullanım oranları ve churn risk analizleri.</p>
                </Card>

                <Card className="p-8 space-y-6 bg-gradient-to-br from-amber-500/10 to-transparent border-border-subtle group hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Fatura Geçmişi</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main">Ödeme Takibi</h3>
                    <p className="text-sm text-text-muted leading-relaxed">Tahsilat oranları, bekleyen ödemeler ve vergi düzenlemelerine uygun finansal dökümler.</p>
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
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={reports.filter(r =>
                        (reportTypes.find(t => t.id === r.type)?.name || r.type).toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    isLoading={isLoading}
                />
            </Card>

            <Modal
                isOpen={generateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
                title="Yeni Rapor Oluştur"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Rapor Türü</label>
                        <select
                            className="w-full bg-bg-surface border border-border-subtle rounded-xl p-3 text-text-main focus:outline-none focus:border-indigo-500"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">Seçiniz...</option>
                            {reportTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setGenerateModalOpen(false)}>İptal</Button>
                        <Button
                            variant="primary"
                            icon={Play}
                            onClick={handleGenerate}
                            disabled={!selectedType || isGenerating}
                        >
                            {isGenerating ? 'Oluşturuluyor...' : 'Oluştur'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportsPage;
