import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
// import { useToast } from '../hooks/useToast';
import { tokenStorage } from '../utils/tokenStorage';
import { authService } from '../services/authService';
import { GradientMesh } from '../components/ui/GradientMesh';

const LoginPage: React.FC = () => {
    const [step, setStep] = useState<'login' | '2fa'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    // const toast = useToast();

    // Clear error when inputs change
    const onInputChange = (setter: (val: string) => void, val: string) => {
        setter(val);
        if (error) setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login({ email, password });

            // Check if 2FA is required
            if (response.requires2FA) {
                setStep('2fa');
                setIsLoading(false);
                return;
            }

            // Normal login success
            if (response.accessToken) {
                tokenStorage.setToken(response.accessToken);
                if (response.refreshToken) tokenStorage.setRefreshToken(response.refreshToken);
                navigate('/');
            } else {
                throw new Error('Sunucudan geçersiz yanıt alındı. (Token eksik)');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (twoFactorCode.length !== 6) {
            setError('Lütfen 6 haneli kodu giriniz.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.verify2Fa(email, twoFactorCode);

            if (response.accessToken) {
                tokenStorage.setToken(response.accessToken);
                if (response.refreshToken) tokenStorage.setRefreshToken(response.refreshToken);
                navigate('/');
            } else {
                throw new Error('Doğrulama başarılı ancak token alınamadı.');
            }
        } catch (error: any) {
            console.error('2FA error:', error);
            setError(error.message || 'Doğrulama başarısız. Kodu kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
            <GradientMesh />

            {/* Ambient Lights */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/40 mb-6">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">Stocker</h1>
                    <p className="text-text-muted font-medium uppercase tracking-widest text-xs">Master Administration Portal</p>
                </div>

                <div className="glass-card p-10 border-border-subtle shadow-2xl backdrop-blur-3xl transition-all duration-300">
                    <h2 className="text-xl font-bold text-text-main mb-6">
                        {step === 'login' ? 'Oturum Açın' : 'İki Faktörlü Doğrulama'}
                    </h2>

                    {step === '2fa' && (
                        <p className="text-sm text-text-muted mb-6">
                            Lütfen <strong>{email}</strong> hesabı için telefonunuzdaki authenticator uygulamasından 6 haneli kodu girin.
                        </p>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                            <div className="mt-0.5 text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <p className="text-sm font-medium text-rose-500">{error}</p>
                        </div>
                    )}

                    {step === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">E-Posta Adresi</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => onInputChange(setEmail, e.target.value)}
                                        placeholder="admin@stocker.app"
                                        className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Şifre</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => onInputChange(setPassword, e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2 text-xs font-bold uppercase tracking-tighter">
                                <label className="flex items-center gap-2 text-text-muted/40 cursor-pointer hover:text-text-muted transition-colors">
                                    <input type="checkbox" className="rounded border-border-subtle bg-indigo-500/5 text-indigo-500 focus:ring-indigo-500/20" />
                                    <span>Beni Hatırla</span>
                                </label>
                                <button type="button" className="text-indigo-400 hover:text-indigo-300">Şifremi Unuttum</button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold 
                                    shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all
                                    active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sisteme Giriş Yap
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify2FA} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Doğrulama Kodu</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        maxLength={6}
                                        value={twoFactorCode}
                                        onChange={(e) => onInputChange(setTwoFactorCode, e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-4 pl-12 pr-6 text-2xl font-bold tracking-[0.5em] text-center text-text-main focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-text-muted/20 placeholder:tracking-normal"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold 
                                    shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all
                                    active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Doğrula
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('login');
                                    setPassword('');
                                    setError(null);
                                }}
                                className="w-full py-2 text-xs font-bold text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
                            >
                                Geri Dön
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-text-muted/40 text-[10px] font-medium uppercase tracking-[0.3em]">
                        &copy; 2026 Stocker Technologies — Her Hakkı Saklıdır
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
