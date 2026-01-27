import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { twoFactorService, type TwoFactorSetupDto } from '@/services/twoFactorService';
import {
    Shield,
    Smartphone,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Trash2,
    Copy,
    Download
} from 'lucide-react';

export const TwoFactorSettings: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);

    // Modals
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);

    // Data
    const [setupData, setSetupData] = useState<TwoFactorSetupDto | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const status = await twoFactorService.get2FAStatus();
            setIs2FAEnabled(status.enabled);
            setRemainingBackupCodes(status.backupCodesRemaining || 0);
        } catch (error) {
            console.error('Failed to fetch 2FA status', error);
        }
    };

    const handleEnableClick = async () => {
        setIsLoading(true);
        try {
            const data = await twoFactorService.setupTwoFactor();
            setSetupData(data);
            setBackupCodes(data.backupCodes);
            setShowSetupModal(true);
        } catch (error) {
            toast.error('2FA kurulumu başlatılamadı');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmEnable2FA = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Lütfen 6 haneli doğrulama kodunu girin');
            return;
        }

        if (!setupData) return;

        setIsLoading(true);
        try {
            const success = await twoFactorService.enable2FA(
                setupData.secret,
                verificationCode,
                setupData.backupCodes
            );

            if (success) {
                setIs2FAEnabled(true);
                setShowSetupModal(false);
                setVerificationCode('');
                toast.success('2FA başarıyla etkinleştirildi!');
                setShowBackupCodesModal(true);
                fetchStatus();
            } else {
                toast.error('Geçersiz doğrulama kodu');
            }
        } catch (error) {
            toast.error('2FA etkinleştirme başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!password) {
            toast.error('Lütfen şifrenizi girin');
            return;
        }

        setIsLoading(true);
        try {
            const success = await twoFactorService.disable2FA(password);
            if (success) {
                setIs2FAEnabled(false);
                setShowDisableModal(false);
                setPassword('');
                toast.success('2FA devre dışı bırakıldı');
            } else {
                toast.error('Şifre yanlış veya işlem başarısız');
            }
        } catch (error) {
            toast.error('Devre dışı bırakma başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async () => {
        // For simplicity, using a prompt or reusing the password modal logic could be better
        // For now, let's assume we urge user to disable/enable if they lost codes or implement a dedicated modal later
        // But matching legacy simple flow:
        const pwd = window.prompt("Güvenlik için şifrenizi giriniz:");
        if (!pwd) return;

        setIsLoading(true);
        try {
            const codes = await twoFactorService.regenerateBackupCodes(pwd);
            if (codes.length > 0) {
                setBackupCodes(codes);
                setShowBackupCodesModal(true);
                fetchStatus();
                toast.success('Yedek kodlar yenilendi');
            } else {
                toast.error('Yedek kodlar yenilenemedi');
            }
        } catch (error) {
            toast.error('İşlem başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadBackupCodes = () => {
        const content = `Stocker Admin - Yedek Kodlar\n\nTarih: ${new Date().toLocaleString()}\n\nYedek Kodlarınız:\n${backupCodes.join('\n')}\n\nNot: Her kod yalnızca bir kez kullanılabilir.`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stocker-backup-codes-${Date.now()}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                    <Smartphone className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        İki Faktörlü Kimlik Doğrulama
                        {is2FAEnabled && <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">Aktif</span>}
                    </h3>
                    <p className="text-sm text-text-muted">Hesabınızı ekstra bir güvenlik katmanı ile koruyun.</p>
                </div>
            </div>

            <Card className="p-6 bg-slate-900/30 border-slate-800">
                {!is2FAEnabled ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h4 className="font-bold text-text-main">Henüz etkinleştirilmedi</h4>
                            <p className="text-sm text-text-muted max-w-lg">
                                2FA etkinleştirildiğinde, giriş yaparken şifrenizin yanı sıra telefonunuzdaki uygulamadan bir kod girmeniz gerekir.
                            </p>
                        </div>
                        <Button variant="primary" icon={Shield} onClick={handleEnableClick} disabled={isLoading}>
                            Şimdi Etkinleştir
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-widest">Kalan Yedek Kod</p>
                                    <p className="text-2xl font-bold text-text-main mt-1">{remainingBackupCodes} / 10</p>
                                </div>
                                <Shield className="w-8 h-8 text-indigo-500 opacity-50" />
                            </div>
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-widest">Durum</p>
                                    <p className="text-2xl font-bold text-emerald-500 mt-1">Korumalı</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" icon={RefreshCw} onClick={handleRegenerateBackupCodes} disabled={isLoading}>
                                Kodları Yenile
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={() => setShowDisableModal(true)} disabled={isLoading}>
                                Devre Dışı Bırak
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Setup Modal */}
            <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} title="2FA Kurulumu">
                <div className="space-y-6">
                    <div className="text-center p-4 bg-white rounded-xl w-fit mx-auto">
                        {setupData?.qrCodeUrl && (
                            <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-text-muted">Telefonunuzdaki Authenticator uygulaması ile bu karekodu tarayın.</p>
                        <div className="flex items-center justify-center gap-2 p-2 bg-slate-900 rounded-lg font-mono text-sm text-indigo-300">
                            {setupData?.manualEntryKey}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(setupData?.manualEntryKey || '');
                                    toast.success('Kopyalandı');
                                }}
                                className="hover:text-white transition-colors"
                            >
                                <Copy className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Doğrulama Kodu</label>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-center text-xl font-bold tracking-widest text-text-main focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowSetupModal(false)}>İptal</Button>
                        <Button variant="primary" onClick={confirmEnable2FA} disabled={isLoading}>Doğrula ve Aç</Button>
                    </div>
                </div>
            </Modal>

            {/* Backup Codes Modal */}
            <Modal isOpen={showBackupCodesModal} onClose={() => setShowBackupCodesModal(false)} title="Yedek Kodlar">
                <div className="space-y-6">
                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm">Bu kodları güvenli bir yere kaydedin. Erişimini kaybettiğinizde hesabınıza giriş yapmak için bu kodları kullanabilirsiniz.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {backupCodes.map((code, i) => (
                            <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 text-center font-mono text-text-main">
                                {code}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="primary" icon={Download} onClick={downloadBackupCodes}>İndir</Button>
                        <Button variant="outline" onClick={() => setShowBackupCodesModal(false)}>Kapat</Button>
                    </div>
                </div>
            </Modal>

            {/* Disable Confirmation Modal */}
            <Modal isOpen={showDisableModal} onClose={() => setShowDisableModal(false)} title="2FA'yı Kapat">
                <div className="space-y-4">
                    <p className="text-text-muted">Güvenliğiniz için lütfen şifrenizi girerek işlemi onaylayın.</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifreniz"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-text-main"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowDisableModal(false)}>İptal</Button>
                        <Button variant="danger" onClick={handleDisable2FA} disabled={!password || isLoading}>Onayla ve Kapat</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
