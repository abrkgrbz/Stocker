import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
    Search,
    Filter,
    Download,
    User,
    Monitor,
    Globe,
    MoreVertical,
    Activity,
    CheckCircle2,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { type AuditLogDto } from '@/services/auditLogService';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const AuditLogsPage: React.FC = () => {
    const { data: logsResponse, isLoading } = useAuditLogs();
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;
    const [searchTerm, setSearchTerm] = useState('');

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'timestamp', direction: 'desc' });

    const columns = [
        {
            header: 'Zaman',
            key: 'timestamp',
            sortable: true,
            accessor: (log: AuditLogDto) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main">{new Date(log.timestamp).toLocaleDateString('tr-TR')}</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: 'Olay',
            key: 'action',
            sortable: true,
            accessor: (log: AuditLogDto) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        <span className="text-sm font-bold text-text-main">{log.action || log.event}</span>
                    </div>
                    {log.entityType && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted/60 uppercase tracking-widest pl-5">
                            <span>{log.entityType}</span>
                            {log.entityId && <span className="text-text-muted/30">#{log.entityId.substring(0, 8)}</span>}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Kullanıcı',
            key: 'userName',
            sortable: true,
            accessor: (log: AuditLogDto) => (
                <div className="flex items-center gap-3 text-text-main">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{log.email || log.userName || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{log.ipAddress || '0.0.0.0'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Tenant',
            key: 'tenantName',
            sortable: true,
            accessor: (log: AuditLogDto) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main">{log.tenantCode || log.tenantName || '-'}</span>
                    {log.tenantId && <span className="text-[10px] text-text-muted/50 font-mono">{log.tenantId.substring(0, 8)}...</span>}
                </div>
            )
        },
        {
            header: 'Risk',
            key: 'riskLevel',
            sortable: true,
            accessor: (log: AuditLogDto) => {
                const level = (log.riskLevel || 'LOW').toLowerCase();
                const colors: any = {
                    'critical': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                    'high': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
                    'medium': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                    'low': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                    'info': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                };
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border w-fit ${colors[level] || colors['low']}`}>
                            {log.riskLevel || 'Low'}
                        </span>
                        {log.riskScore !== undefined && (
                            <span className="text-[9px] text-text-muted font-mono">Skor: {log.riskScore}</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Durum',
            key: 'success',
            sortable: true,
            accessor: (log: AuditLogDto) => {
                // Legacy logic: blocked vs allowed (or success/failure)
                const isBlocked = log.blocked === true;
                const isSuccess = log.success === true;

                // If blocked field exists, prioritize it for security context
                if (log.blocked !== undefined) {
                    return (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isBlocked ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'}`}>
                            {isBlocked ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isBlocked ? 'Engellendi' : 'İzin Verildi'}
                        </div>
                    );
                }

                // Fallback to success/failure
                const statusStr = isSuccess ? 'Success' : 'Failure';
                const colors: any = {
                    'Success': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                    'Failure': 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                };
                return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[statusStr] || 'bg-indigo-500/5 text-text-muted border-transparent'}`}>
                        {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {isSuccess ? 'Başarılı' : 'Hata'}
                    </div>
                );
            }
        },
        {
            header: '',
            accessor: () => (
                <div className="flex justify-end gap-2">
                    <button className="p-2 text-text-muted hover:text-indigo-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    const sortedData = React.useMemo(() => {
        let data = (Array.isArray(logsResponse?.logs || logsResponse?.data) ? (logsResponse?.logs || logsResponse?.data)! : []);

        // Basic Filtering
        data = data.filter(log =>
            (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.ipAddress || '').includes(searchTerm)
        );

        // Sorting
        if (sortConfig) {
            data = [...data].sort((a: any, b: any) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [logsResponse, searchTerm, sortConfig]);

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Audit Logları</h2>
                    <p className="text-text-muted mt-1">Sistemdeki tüm yönetici aksiyonlarını ve kritik logları tarihsel olarak izleyin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Filter}>Derin Filtrele</Button>
                    <Button icon={Download}>Dışa Aktar (.XLSX)</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Toplam İşlem', value: '1.2k', icon: Activity, color: 'text-blue-400' },
                    { label: 'Hatalı Giriş', value: '12', icon: AlertCircle, color: 'text-rose-400' },
                    { label: 'Aktif Cihaz', value: '4', icon: Monitor, color: 'text-indigo-400' },
                    { label: 'Küresel Erişim', value: '8', icon: Globe, color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-indigo-500/5">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{stat.label}</p>
                                <p className="text-xl font-bold text-text-main">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card noPadding className="overflow-hidden border-border-subtle">
                <div className="p-4 border-b border-border-subtle flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="İşlem, kullanıcı veya IP ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    isLoading={isLoading}
                    sortColumn={sortConfig?.key}
                    sortDirection={sortConfig?.direction}
                    onSort={handleSort}
                    pagination={{
                        currentPage,
                        pageSize,
                        totalCount: sortedData.length,
                        totalPages: Math.ceil(sortedData.length / pageSize),
                        onPageChange: setCurrentPage
                    }}
                />
            </Card>
        </div>
    );
};

export default AuditLogsPage;
