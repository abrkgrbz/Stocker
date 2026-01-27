import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import {
    Mail,
    Plus,
    Search,
    Edit3,
    Eye,
    Copy,
    Trash2,
    CheckCircle2,
    XCircle,
    FileCode,
    Globe,
    Code,
    Info,
    FileJson,
    RefreshCw
} from 'lucide-react';
import {
    type EmailTemplateDto,
    emailTemplateService,
    type EmailTemplatePreviewDto,
    type CreateEmailTemplateDto
} from '@/services/emailTemplateService';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';

// Category Labels mapping (matching Legacy)
const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
    Authentication: { label: 'Kimlik Doğrulama', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    UserManagement: { label: 'Kullanıcı Yönetimi', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Notification: { label: 'Bildirim', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    Transaction: { label: 'İşlem', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    Marketing: { label: 'Pazarlama', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    CRM: { label: 'CRM', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    System: { label: 'Sistem', color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

const EmailTemplatesPage: React.FC = () => {
    const { data: templateResponse, isLoading, refetch } = useEmailTemplates();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [searchTerm, setSearchTerm] = useState('');

    // Values for filters/dropdowns
    const [categories, setCategories] = useState<string[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplateDto | null>(null);
    const [activeModalTab, setActiveModalTab] = useState('info');

    // Form State
    const initialFormState: CreateEmailTemplateDto = {
        name: '',
        description: '',
        templateKey: '',
        subject: '',
        htmlBody: '',
        plainTextBody: '',
        category: 'Authentication',
        language: 'tr',
        variables: [],
        sampleData: ''
    };
    const [formData, setFormData] = useState<CreateEmailTemplateDto>(initialFormState);
    const [variablesString, setVariablesString] = useState('');

    // Preview states
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<EmailTemplatePreviewDto | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await emailTemplateService.getCategories();
            setCategories(cats);
        } catch (e) {
            console.error('Failed to load categories', e);
        }
    };

    // Handlers
    const handleOpenModal = (template?: EmailTemplateDto) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name,
                description: template.description || '',
                templateKey: template.templateKey,
                subject: template.subject,
                htmlBody: template.htmlBody,
                plainTextBody: template.plainTextBody || '',
                category: template.category,
                language: template.language,
                variables: template.variables,
                sampleData: template.sampleData || ''
            });
            setVariablesString(template.variables?.join(', ') || '');
        } else {
            setEditingTemplate(null);
            setFormData(initialFormState);
            setVariablesString('');
        }
        setActiveModalTab('info');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            // Basic Validation
            if (!formData.name || !formData.templateKey || !formData.subject || !formData.htmlBody) {
                toast.error('Lütfen zorunlu alanları doldurun (Ad, Anahtar, Konu, HTML İçerik).');
                return;
            }

            const dataToSave = {
                ...formData,
                variables: variablesString.split(',').map(v => v.trim()).filter(Boolean)
            };

            if (editingTemplate) {
                await emailTemplateService.update(editingTemplate.id, dataToSave);
                toast.success('Şablon güncellendi.');
            } else {
                await emailTemplateService.create(dataToSave);
                toast.success('Şablon oluşturuldu.');
            }
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error('Kaydetme işlemi başarısız.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
        try {
            await emailTemplateService.delete(id);
            toast.success('Şablon silindi.');
            refetch();
        } catch (error) {
            toast.error('Silme işlemi başarısız.');
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            await emailTemplateService.toggleActive(id);
            toast.success('Durum değiştirildi.');
            refetch();
        } catch (error) {
            toast.error('Durum değiştirilemedi.');
        }
    };

    const handlePreview = async (template: EmailTemplateDto) => {
        setIsLoadingPreview(true);
        setIsPreviewOpen(true);
        setPreviewData(null);
        try {
            const data = await emailTemplateService.preview(template.id, template.sampleData);
            setPreviewData(data);
        } catch (error) {
            toast.error('Önizleme alınamadı.');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    // Columns
    const columns = [
        {
            header: 'Şablon',
            accessor: (tpl: EmailTemplateDto) => (
                <div className="flex items-center gap-4 text-text-main">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold">{tpl.name}</p>
                            {tpl.isSystem && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">SİSTEM</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">{tpl.templateKey}</p>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(tpl.templateKey); toast.success('Kopyalandı'); }} className="text-text-muted/30 hover:text-indigo-400">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Kategori',
            accessor: (tpl: EmailTemplateDto) => {
                const cat = categoryLabels[tpl.category] || { label: tpl.category, color: 'text-text-muted', bg: 'bg-indigo-500/5' };
                return (
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cat.bg} ${cat.color}`}>
                        {cat.label}
                    </span>
                );
            }
        },
        {
            header: 'Dil',
            accessor: (tpl: EmailTemplateDto) => (
                <div className="flex items-center gap-2 text-text-muted">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase">{tpl.language}</span>
                </div>
            )
        },
        {
            header: 'Konu',
            accessor: (tpl: EmailTemplateDto) => (
                <p className="text-xs text-text-muted font-medium truncate max-w-[200px]" title={tpl.subject}>
                    {tpl.subject}
                </p>
            )
        },
        {
            header: 'Versiyon',
            accessor: (tpl: EmailTemplateDto) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10">
                    v{tpl.version}
                </span>
            )
        },
        {
            header: 'Durum',
            accessor: (tpl: EmailTemplateDto) => (
                <div
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${tpl.isActive ? 'bg-emerald-500' : 'bg-text-muted/20'}`}
                    onClick={() => !tpl.isSystem && handleToggleActive(tpl.id)}
                >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${tpl.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            )
        },
        {
            header: '',
            accessor: (tpl: EmailTemplateDto) => (
                <div className="flex justify-end gap-2">
                    <button onClick={() => handlePreview(tpl)} className="p-2 text-text-muted/20 hover:text-text-main transition-all" title="Önizle">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenModal(tpl)} className="p-2 text-text-muted/20 hover:text-indigo-400 transition-all" title="Düzenle">
                        <Edit3 className="w-4 h-4" />
                    </button>
                    {!tpl.isSystem && (
                        <button onClick={() => handleDelete(tpl.id)} className="p-2 text-text-muted/20 hover:text-rose-500 transition-all" title="Sil">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            className: 'text-right'
        }
    ];

    const modalTabs = [
        { id: 'info', label: 'Temel Bilgiler', icon: Info },
        { id: 'editor', label: 'İçerik Düzenleyici', icon: Code },
        { id: 'sample', label: 'Örnek Veri', icon: FileJson },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <Mail className="w-8 h-8 text-indigo-400" />
                        E-Posta Şablonları
                    </h2>
                    <p className="text-text-muted mt-1">Sistem otomatik e-postalarını yönetin (Liquid syntax desteklenir).</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => refetch()}>Yenile</Button>
                    <Button icon={Plus} onClick={() => handleOpenModal()}>Yeni Şablon</Button>
                </div>
            </div>

            <Card noPadding className="overflow-hidden border-border-subtle">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40" />
                        <input
                            type="text"
                            placeholder="Şablon adı veya anahtar kelime ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={(Array.isArray(templateResponse?.items) ? templateResponse!.items : [])
                        .filter(t =>
                            (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.templateKey || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(t => ({ ...t, id: t.id }))
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    }
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        pageSize,
                        totalCount: (templateResponse?.items || []).length,
                        totalPages: Math.ceil((templateResponse?.items || []).length / pageSize),
                        onPageChange: setCurrentPage
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
                maxWidth="max-w-4xl"
            >
                <div>
                    <div className="mb-6">
                        <Tabs tabs={modalTabs} activeTab={activeModalTab} onChange={setActiveModalTab} />
                    </div>

                    <div className="space-y-4">
                        {/* TAB: INFO */}
                        {activeModalTab === 'info' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Şablon Anahtarı</label>
                                    <input
                                        disabled={!!editingTemplate}
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none disabled:opacity-50"
                                        placeholder="ornek-sablon-anahtari"
                                        value={formData.templateKey}
                                        onChange={e => setFormData({ ...formData, templateKey: e.target.value })}
                                    />
                                    <p className="text-[10px] text-text-muted">Benzersiz olmalı. Sadece küçük harf, rakam ve tire.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Şablon Adı</label>
                                    <input
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="Örn: Hoşgeldin E-postası"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Açıklama</label>
                                    <textarea
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                                        rows={2}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Kategori</label>
                                    <select
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {Object.keys(categoryLabels).map(cat => (
                                            <option key={cat} value={cat}>{categoryLabels[cat]?.label || cat}</option>
                                        ))}
                                        {categories.filter(c => !categoryLabels[c]).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Dil</label>
                                    <select
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                                        value={formData.language}
                                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                                    >
                                        <option value="tr">Türkçe</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Değişkenler</label>
                                    <input
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="userName, companyName, actionUrl (Virgülle ayırın)"
                                        value={variablesString}
                                        onChange={e => setVariablesString(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB: EDITOR */}
                        {activeModalTab === 'editor' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Email Konusu (Subject)</label>
                                    <input
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="{{ appName }} - Bildirim"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">HTML İçeriği</label>
                                    <textarea
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm font-mono focus:border-indigo-500 outline-none"
                                        rows={12}
                                        placeholder="<!DOCTYPE html>..."
                                        value={formData.htmlBody}
                                        onChange={e => setFormData({ ...formData, htmlBody: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase">Düz Metin (Opsiyonel)</label>
                                    <textarea
                                        className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm font-mono focus:border-indigo-500 outline-none"
                                        rows={4}
                                        value={formData.plainTextBody}
                                        onChange={e => setFormData({ ...formData, plainTextBody: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB: SAMPLE */}
                        {activeModalTab === 'sample' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                                    Önizleme için kullanılacak JSON formatında örnek veri. Şablondaki değişkenlere karşılık gelen değerler içermelidir.
                                </div>
                                <textarea
                                    className="w-full bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-sm font-mono focus:border-indigo-500 outline-none"
                                    rows={12}
                                    placeholder='{ "userName": "Ahmet", "appName": "Stocker" }'
                                    value={formData.sampleData}
                                    onChange={e => setFormData({ ...formData, sampleData: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button onClick={handleSave}>{editingTemplate ? 'Güncelle' : 'Oluştur'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Şablon Önizleme"
                maxWidth="max-w-4xl"
            >
                {isLoadingPreview ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                        <p className="text-sm font-bold text-text-muted animate-pulse uppercase tracking-[0.2em]">Şablon Hazırlanıyor...</p>
                    </div>
                ) : previewData ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl">
                            <p className="text-xs font-bold text-text-muted uppercase mb-1">Konu</p>
                            <p className="text-sm font-bold text-text-main">{previewData.subject}</p>
                        </div>

                        <div className="border border-border-subtle rounded-xl overflow-hidden bg-white min-h-[400px]">
                            <iframe
                                title="Email Preview"
                                srcDoc={previewData.htmlBody}
                                className="w-full min-h-[400px] border-none"
                            />
                        </div>

                        {previewData.plainTextBody && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-text-muted uppercase">Düz Metin</p>
                                <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl font-mono text-xs whitespace-pre-wrap">
                                    {previewData.plainTextBody}
                                </div>
                            </div>
                        )}

                        {!previewData.isSuccess && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                                Hata: {previewData.errorMessage}
                            </div>
                        )}
                    </div>
                ) : null}
                <div className="flex justify-end pt-4">
                    <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Kapat</Button>
                </div>
            </Modal>
        </div>
    );
};

export default EmailTemplatesPage;
