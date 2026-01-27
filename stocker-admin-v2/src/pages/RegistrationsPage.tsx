import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
    UserPlus,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    Mail,
    Building2,
    MoreVertical,
    ExternalLink,
    Search
} from 'lucide-react';
import type { TenantRegistrationDto } from '@/services/tenantRegistrationService';

import { useRegistrations } from '@/hooks/useRegistrations';

const RegistrationsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { registrations, isLoading, approveRegistration } = useRegistrations();

    const handleApprove = (id: string) => {
        if (confirm('Bu organizasyonu onaylamak ve tenant oluşturmak istediğinize emin misiniz?')) {
            approveRegistration(id);
        }
    };

    const columns = [
        {
            header: 'Organizasyon',
            accessor: (reg: TenantRegistrationDto) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center text-indigo-400">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-main">{reg.companyName}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{reg.companyCode}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Yönetici & İletişim',
            accessor: (reg: TenantRegistrationDto) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Mail className="w-3 h-3" />
                        <span>{reg.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400/60 uppercase">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Paket: {reg.packageName}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Kayıt Tarihi',
            accessor: (reg: TenantRegistrationDto) => (
                <div className="flex flex-col">
                    <span className="text-xs text-text-muted">{new Date(reg.registrationDate).toLocaleDateString('tr-TR')}</span>
                    <span className="text-[10px] text-text-muted/50">{new Date(reg.registrationDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: 'Durum',
            accessor: (reg: TenantRegistrationDto) => {
                const colors: any = {
                    'Pending': 'text-amber-500 bg-amber-500/10',
                    'Approved': 'text-emerald-500 bg-emerald-500/10',
                    'Rejected': 'text-rose-500 bg-rose-500/10',
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${colors[reg.status] || 'bg-indigo-500/5 text-text-muted'}`}>
                        {reg.status === 'Pending' ? 'Beklemede' : reg.status}
                    </span>
                );
            }
        },
        {
            header: '',
            accessor: (reg: TenantRegistrationDto) => (
                <div className="flex justify-end gap-2">
                    {reg.status === 'Pending' && (
                        <>
                            <button
                                onClick={() => handleApprove(reg.id)}
                                className="p-2 text-emerald-500/40 hover:text-emerald-500 transition-colors"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Kayıt Onayları</h2>
                    <p className="text-text-muted mt-1">Sisteme yeni katılan organizasyon başvurularını inceleyin ve onaylayın.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={ExternalLink}>Başvuru Formunu Gör</Button>
                    <Button icon={UserPlus}>Manuel Kayıt Ekle</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-indigo-500/5 border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Bekleyen Başvuru</p>
                            <p className="text-2xl font-bold text-text-main">{(registrations || []).filter(r => r.status === 'Pending').length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card noPadding className="overflow-hidden">
                <div className="p-4 border-b border-border-subtle flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Organizasyon veya e-posta ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={(Array.isArray(registrations) ? registrations : []).filter(r =>
                        r.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    isLoading={isLoading}
                />
            </Card>
        </div>
    );
};

export default RegistrationsPage;
