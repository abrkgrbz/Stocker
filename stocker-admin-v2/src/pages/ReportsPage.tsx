import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import {
    FileText,
    Download,
    BarChart,
    Building2,
    CreditCard,
    Shield,
    Calendar
} from 'lucide-react';
import { reportService, type ReportTypeDto } from '@/services/reportService';

const ReportsPage: React.FC = () => {
    const [reportTypes, setReportTypes] = useState<ReportTypeDto[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportTypeDto | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
    // Simple date range state
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        setReportTypes(reportService.getAvailableReports());
    }, []);

    const handleExport = async () => {
        if (!selectedReport) return;
        setIsExporting(true);
        try {
            const blob = await reportService.exportReport(selectedReport.id, selectedFormat, dateRange);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedReport.id}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Rapor başarıyla indirildi.');
                setSelectedReport(null);
            } else {
                toast.error('Rapor verisi boş.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Rapor indirilemedi veya henüz desteklenmiyor.');
        } finally {
            setIsExporting(false);
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'Finance': return CreditCard;
            case 'Security': return Shield;
            case 'Usage': return Building2;
            default: return FileText;
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <BarChart className="w-8 h-8 text-indigo-400" />
                        Sistem Raporları
                    </h2>
                    <p className="text-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Veri Dışa Aktarım Merkezi</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reportTypes.map((report) => {
                    const Icon = getIcon(report.category);
                    return (
                        <Card key={report.id} className="p-8 space-y-6 bg-gradient-to-br from-indigo-500/5 to-transparent border-border-subtle group hover:border-indigo-500/30 transition-all hover:-translate-y-1 duration-300">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold text-indigo-400/50 group-hover:text-indigo-400 uppercase tracking-widest transition-colors">{report.category}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main">{report.name}</h3>
                                <p className="text-sm text-text-muted mt-2 leading-relaxed min-h-[40px]">{report.description}</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full justify-between group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5"
                                onClick={() => setSelectedReport(report)}
                            >
                                <span>Dışa Aktar</span>
                                <Download className="w-4 h-4 text-text-muted group-hover:text-indigo-400 transition-colors" />
                            </Button>
                        </Card>
                    );
                })}
            </div>

            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title={`${selectedReport?.name} - Dışa Aktar`}
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Format</label>
                        <div className="flex gap-3">
                            {selectedReport?.supportedFormats.map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setSelectedFormat(fmt)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${selectedFormat === fmt
                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                        : 'bg-transparent border-border-subtle text-text-muted hover:border-text-muted'
                                        }`}
                                >
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Başlangıç</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="date"
                                    className="w-full bg-bg-surface border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bitiş</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="date"
                                    className="w-full bg-bg-surface border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setSelectedReport(null)}>İptal</Button>
                        <Button
                            variant="primary"
                            icon={Download}
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? 'İndiriliyor...' : 'İndir'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReportsPage;
