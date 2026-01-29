import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import {
    Package,
    Plus,
    Calculator,
    Save,
    Edit2,
    Zap,
    CheckCircle2
} from 'lucide-react';
import { pricingService, type ModulePricingDto, type BundleDto, type AddOnDto, type PriceCalculationResponse } from '@/services/pricingService';

const PricingConfigPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('modules');
    const [isLoading, setIsLoading] = useState(false);

    const [modules, setModules] = useState<ModulePricingDto[]>([]);
    const [bundles, setBundles] = useState<BundleDto[]>([]);
    const [addOns, setAddOns] = useState<AddOnDto[]>([]);

    // Editing states
    const [editingModule, setEditingModule] = useState<ModulePricingDto | null>(null);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

    const [editingBundle, setEditingBundle] = useState<Partial<BundleDto> | null>(null);
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

    const [editingAddOn, setEditingAddOn] = useState<AddOnDto | null>(null);
    const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);

    // Simulator state
    const [simResult, setSimResult] = useState<PriceCalculationResponse | null>(null);
    const [simBundle, setSimBundle] = useState('');
    const [simUsers, setSimUsers] = useState(1);
    const [simCycle, setSimCycle] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [mods, bnds, adds] = await Promise.all([
                pricingService.getModules(),
                pricingService.getBundles(),
                pricingService.getAddOns()
            ]);
            setModules(mods);
            setBundles(bnds);
            setAddOns(adds);
        } catch (error) {
            toast.error('Fiyatlandırma verileri yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- MODULES ---
    const handleEditModule = (module: ModulePricingDto) => {
        setEditingModule({ ...module });
        setIsModuleModalOpen(true);
    };

    const saveModule = async () => {
        if (!editingModule) return;
        try {
            await pricingService.updateModule(editingModule.moduleCode, {
                monthlyPrice: Number(editingModule.monthlyPrice),
                yearlyPrice: Number(editingModule.yearlyPrice),
                isCore: editingModule.isCore,
                trialDays: Number(editingModule.trialDays),
                isActive: editingModule.isActive
            });
            toast.success('Modül güncellendi.');
            setIsModuleModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Guncelleme başarısız.');
        }
    };

    // --- BUNDLES ---
    const handleCreateBundle = () => {
        setEditingBundle({
            bundleCode: '',
            bundleName: '',
            monthlyPrice: 0,
            yearlyPrice: 0,
            discountPercent: 0,
            displayOrder: 0,
            moduleCodes: [],
            // @ts-ignore
            isActive: true
        });
        setIsBundleModalOpen(true);
    };

    const handleEditBundle = (bundle: BundleDto) => {
        setEditingBundle({ ...bundle });
        setIsBundleModalOpen(true);
    };

    const saveBundle = async () => {
        if (!editingBundle) return;
        try {
            if ((editingBundle as any).id) {
                // Update
                await pricingService.updateBundle(editingBundle.bundleCode!, {
                    bundleName: editingBundle.bundleName,
                    monthlyPrice: Number(editingBundle.monthlyPrice),
                    yearlyPrice: Number(editingBundle.yearlyPrice),
                    moduleCodes: editingBundle.moduleCodes,
                    discountPercent: Number(editingBundle.discountPercent),
                    isActive: editingBundle.isActive
                });
            } else {
                // Create
                await pricingService.createBundle({
                    bundleCode: editingBundle.bundleCode!,
                    bundleName: editingBundle.bundleName!,
                    monthlyPrice: Number(editingBundle.monthlyPrice),
                    yearlyPrice: Number(editingBundle.yearlyPrice),
                    moduleCodes: editingBundle.moduleCodes || [],
                    discountPercent: Number(editingBundle.discountPercent) || 0,
                    displayOrder: Number(editingBundle.displayOrder) || 0
                });
            }
            toast.success('Paket kaydedildi.');
            setIsBundleModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Kaydetme başarısız.');
        }
    };

    // --- ADDONS ---
    const handleEditAddOn = (addOn: AddOnDto) => {
        setEditingAddOn({ ...addOn });
        setIsAddOnModalOpen(true);
    };

    const saveAddOn = async () => {
        if (!editingAddOn) return;
        try {
            await pricingService.updateAddOn(editingAddOn.code, {
                monthlyPrice: Number(editingAddOn.monthlyPrice),
                yearlyPrice: Number(editingAddOn.yearlyPrice),
                isActive: editingAddOn.isActive
            });
            toast.success('Eklenti güncellendi.');
            setIsAddOnModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Guncelleme başarısız.');
        }
    };

    // --- SIMULATOR ---
    const runSimulation = async () => {
        try {
            const res = await pricingService.calculatePrice({
                bundleCode: simBundle || undefined,
                userCount: Number(simUsers),
                billingCycle: simCycle,
                moduleCodes: [], // Simple sim for now
                addOnCodes: []
            });
            setSimResult(res);
        } catch (error) {
            toast.error('Hesaplama başarısız.');
        }
    };


    const tabs = [
        { id: 'modules', label: 'Modüller', icon: Zap },
        { id: 'bundles', label: 'Paketler & Bundle', icon: Package },
        { id: 'addons', label: 'Eklentiler', icon: Plus },
        { id: 'simulator', label: 'Fiyat Simülatörü', icon: Calculator },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Fiyatlandırma Ayarları</h2>
                    <p className="text-text-muted mt-1">Sistem genelindeki modül ve paket fiyatlarını yönetin.</p>
                </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* MODULES TAB */}
            {activeTab === 'modules' && (
                <Card noPadding>
                    <Table
                        data={modules}
                        isLoading={isLoading}
                        columns={[
                            { header: 'Kod', accessor: 'moduleCode' },
                            { header: 'Ad', accessor: 'moduleName' },
                            {
                                header: 'Aylık',
                                accessor: (m: ModulePricingDto) => <span className="font-mono font-bold text-emerald-400">₺{m.monthlyPrice}</span>
                            },
                            {
                                header: 'Yıllık',
                                accessor: (m: ModulePricingDto) => <span className="font-mono font-bold text-emerald-400">₺{m.yearlyPrice}</span>
                            },
                            {
                                header: 'Core',
                                accessor: (m: ModulePricingDto) => m.isCore ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : '-'
                            },
                            {
                                header: 'Durum',
                                accessor: (m: ModulePricingDto) => (
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${m.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {m.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                )
                            },
                            {
                                header: '',
                                accessor: (m: ModulePricingDto) => (
                                    <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleEditModule(m)}>Düzenle</Button>
                                ),
                                className: 'text-right'
                            }
                        ]}
                    />
                </Card>
            )}

            {/* BUNDLES TAB */}
            {activeTab === 'bundles' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button icon={Plus} onClick={handleCreateBundle}>Yeni Bundle</Button>
                    </div>
                    <Card noPadding>
                        <Table
                            data={bundles}
                            isLoading={isLoading}
                            columns={[
                                { header: 'Kod', accessor: 'bundleCode' },
                                { header: 'Ad', accessor: 'bundleName' },
                                { header: 'İçerik', accessor: (b: BundleDto) => <span className="text-xs text-text-muted">{b.moduleCodes.join(', ')}</span> },
                                {
                                    header: 'Fiyat',
                                    accessor: (b: BundleDto) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-emerald-400">₺{b.monthlyPrice} / ay</span>
                                            <span className="text-xs text-text-muted">₺{b.yearlyPrice} / yıl</span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'İndirim',
                                    accessor: (b: BundleDto) => <span className="font-bold text-amber-400">%{b.discountPercent}</span>
                                },
                                {
                                    header: '',
                                    accessor: (b: BundleDto) => (
                                        <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleEditBundle(b)}>Düzenle</Button>
                                    ),
                                    className: 'text-right'
                                }
                            ]}
                        />
                    </Card>
                </div>
            )}

            {/* ADDONS TAB */}
            {activeTab === 'addons' && (
                <Card noPadding>
                    <Table
                        data={addOns}
                        isLoading={isLoading}
                        columns={[
                            { header: 'Kod', accessor: 'code' },
                            { header: 'Ad', accessor: 'name' },
                            {
                                header: 'Aylık',
                                accessor: (a: AddOnDto) => <span className="font-mono font-bold text-emerald-400">₺{a.monthlyPrice}</span>
                            },
                            {
                                header: 'Yıllık',
                                accessor: (a: AddOnDto) => <span className="font-mono font-bold text-emerald-400">₺{a.yearlyPrice}</span>
                            },
                            {
                                header: '',
                                accessor: (a: AddOnDto) => (
                                    <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleEditAddOn(a)}>Düzenle</Button>
                                ),
                                className: 'text-right'
                            }
                        ]}
                    />
                </Card>
            )}

            {/* SIMULATOR TAB */}
            {activeTab === 'simulator' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Simülasyon Ayarları">
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-bold uppercase text-text-muted">Paket / Bundle</label>
                                <select
                                    className="bg-indigo-500/5 border border-border-subtle rounded-xl p-3 text-text-main focus:outline-none focus:border-indigo-500"
                                    value={simBundle}
                                    onChange={(e) => setSimBundle(e.target.value)}
                                >
                                    <option value="">Seçiniz...</option>
                                    {bundles.map(b => (
                                        <option key={b.bundleCode} value={b.bundleCode}>{b.bundleName} ({b.monthlyPrice}₺)</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Kullanıcı Sayısı"
                                type="number"
                                value={simUsers}
                                onChange={(e) => setSimUsers(Number(e.target.value))}
                            />

                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-bold uppercase text-text-muted">Fatura Dönemi</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="cycle" checked={simCycle === 'monthly'} onChange={() => setSimCycle('monthly')} />
                                        <span>Aylık</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="cycle" checked={simCycle === 'yearly'} onChange={() => setSimCycle('yearly')} />
                                        <span>Yıllık</span>
                                    </label>
                                </div>
                            </div>

                            <Button className="w-full" icon={Calculator} onClick={runSimulation}>Hesapla</Button>
                        </div>
                    </Card>

                    <Card title="Sonuçlar">
                        {simResult ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    {simResult.lineItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                            <div>
                                                <p className="font-medium text-text-main">{item.name}</p>
                                                <p className="text-xs text-text-muted">{item.quantity} adet x {item.unitPrice}</p>
                                            </div>
                                            <p className="font-bold">₺{item.totalPrice.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-border-subtle pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Ara Toplam</span>
                                        <span>₺{simResult.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">KDV (%20)</span>
                                        <span>₺{simResult.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-emerald-400 pt-2">
                                        <span>Toplam</span>
                                        <span>₺{simResult.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-text-muted/40">
                                <Calculator className="w-12 h-12 mb-4 opacity-20" />
                                <p>Hesaplama yapmak için formu doldurun.</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* MODULE EDIT MODAL */}
            <Modal
                isOpen={isModuleModalOpen}
                onClose={() => setIsModuleModalOpen(false)}
                title={`Modül Düzenle: ${editingModule?.moduleName}`}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Aylık Fiyat"
                            type="number"
                            value={editingModule?.monthlyPrice || 0}
                            onChange={(e) => setEditingModule(prev => prev ? ({ ...prev, monthlyPrice: Number(e.target.value) }) : null)}
                        />
                        <Input
                            label="Yıllık Fiyat"
                            type="number"
                            value={editingModule?.yearlyPrice || 0}
                            onChange={(e) => setEditingModule(prev => prev ? ({ ...prev, yearlyPrice: Number(e.target.value) }) : null)}
                        />
                    </div>
                    <Input
                        label="Deneme Süresi (Gün)"
                        type="number"
                        value={editingModule?.trialDays || 0}
                        onChange={(e) => setEditingModule(prev => prev ? ({ ...prev, trialDays: Number(e.target.value) }) : null)}
                    />
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <span className="text-sm font-medium">Aktif Modül</span>
                        <Switch
                            checked={editingModule?.isActive || false}
                            onCheckedChange={(chk) => setEditingModule(prev => prev ? ({ ...prev, isActive: chk }) : null)}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsModuleModalOpen(false)}>İptal</Button>
                        <Button icon={Save} onClick={saveModule}>Kaydet</Button>
                    </div>
                </div>
            </Modal>

            {/* BUNDLE MODAL */}
            <Modal
                isOpen={isBundleModalOpen}
                onClose={() => setIsBundleModalOpen(false)}
                title={editingBundle?.id ? 'Paket Düzenle' : 'Yeni Paket Oluştur'}
            >
                <div className="space-y-4">
                    <Input
                        label="Paket Kodu"
                        value={editingBundle?.bundleCode || ''}
                        disabled={!!editingBundle?.id}
                        onChange={(e) => setEditingBundle(prev => prev ? ({ ...prev, bundleCode: e.target.value }) : null)}
                    />
                    <Input
                        label="Paket Adı"
                        value={editingBundle?.bundleName || ''}
                        onChange={(e) => setEditingBundle(prev => prev ? ({ ...prev, bundleName: e.target.value }) : null)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Aylık Fiyat"
                            type="number"
                            value={editingBundle?.monthlyPrice || 0}
                            onChange={(e) => setEditingBundle(prev => prev ? ({ ...prev, monthlyPrice: Number(e.target.value) }) : null)}
                        />
                        <Input
                            label="Yıllık Fiyat"
                            type="number"
                            value={editingBundle?.yearlyPrice || 0}
                            onChange={(e) => setEditingBundle(prev => prev ? ({ ...prev, yearlyPrice: Number(e.target.value) }) : null)}
                        />
                    </div>
                    <Input
                        label="İndirim Oranı (%)"
                        type="number"
                        value={editingBundle?.discountPercent || 0}
                        onChange={(e) => setEditingBundle(prev => prev ? ({ ...prev, discountPercent: Number(e.target.value) }) : null)}
                    />

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-text-muted">İçerilen Modüller</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border-subtle rounded-lg">
                            {modules.map(mod => (
                                <label key={mod.moduleCode} className="flex items-center gap-2 text-sm cursor-pointer hover:text-indigo-400">
                                    <input
                                        type="checkbox"
                                        checked={editingBundle?.moduleCodes?.includes(mod.moduleCode) || false}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setEditingBundle(prev => {
                                                if (!prev) return null;
                                                const codes = prev.moduleCodes || [];
                                                if (checked) return { ...prev, moduleCodes: [...codes, mod.moduleCode] };
                                                return { ...prev, moduleCodes: codes.filter(c => c !== mod.moduleCode) };
                                            });
                                        }}
                                    />
                                    {mod.moduleName}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsBundleModalOpen(false)}>İptal</Button>
                        <Button icon={Save} onClick={saveBundle}>Kaydet</Button>
                    </div>
                </div>
            </Modal>

            {/* ADDON MODAL */}
            <Modal
                isOpen={isAddOnModalOpen}
                onClose={() => setIsAddOnModalOpen(false)}
                title={`Eklenti Düzenle: ${editingAddOn?.name}`}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Aylık Fiyat"
                            type="number"
                            value={editingAddOn?.monthlyPrice || 0}
                            onChange={(e) => setEditingAddOn(prev => prev ? ({ ...prev, monthlyPrice: Number(e.target.value) }) : null)}
                        />
                        <Input
                            label="Yıllık Fiyat"
                            type="number"
                            value={editingAddOn?.yearlyPrice || 0}
                            onChange={(e) => setEditingAddOn(prev => prev ? ({ ...prev, yearlyPrice: Number(e.target.value) }) : null)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <span className="text-sm font-medium">Aktif</span>
                        <Switch
                            checked={editingAddOn?.isActive || false}
                            onCheckedChange={(chk) => setEditingAddOn(prev => prev ? ({ ...prev, isActive: chk }) : null)}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsAddOnModalOpen(false)}>İptal</Button>
                        <Button icon={Save} onClick={saveAddOn}>Kaydet</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PricingConfigPage;
