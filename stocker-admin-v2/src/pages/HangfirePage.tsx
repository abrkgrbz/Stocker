import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { tokenStorage } from '@/utils/tokenStorage';

const HangfirePage: React.FC = () => {
    const token = tokenStorage.getToken();
    // Assuming admin role for now since guarded by AuthGuard
    const isAdmin = true;

    const [isLoading, setIsLoading] = useState(true);
    const [iframeUrl, setIframeUrl] = useState('');

    // Base URL should ideally come from env, defaulting to current origin's API part if not set
    // Assuming Vite proxy or env variable VITE_API_URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const hangfireBaseUrl = `${apiUrl}/hangfire`;

    useEffect(() => {
        if (token) {
            // Append token to query string for Hangfire dashboard auth if supported by backend
            // or rely on cookie if same-domain. 
            // Legacy code used ?access_token=...
            setIframeUrl(`${hangfireBaseUrl}?access_token=${encodeURIComponent(token)}`);
        }
    }, [token, hangfireBaseUrl]);

    const handleOpenNewTab = () => {
        if (iframeUrl) {
            window.open(iframeUrl, '_blank');
        }
    };

    const handleReload = () => {
        setIsLoading(true);
        const iframe = document.getElementById('hangfire-iframe') as HTMLIFrameElement;
        if (iframe) {
            iframe.src = iframeUrl;
        }
    };


    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-text-main">Erişim Reddedildi</h2>
                <p className="text-text-muted mt-2">Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Hangfire Dashboard</h2>
                    <p className="text-text-muted mt-1">Arka plan işlerini ve zamanlanmış görevleri yönetin.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={RefreshCw} onClick={handleReload}>Yenile</Button>
                    <Button icon={ExternalLink} onClick={handleOpenNewTab}>Yeni Sekmede Aç</Button>
                </div>
            </div>

            <Card noPadding className="flex-1 overflow-hidden relative border-border-subtle bg-white">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-surface z-10">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                )}
                <iframe
                    id="hangfire-iframe"
                    src={iframeUrl}
                    className="w-full h-full border-none"
                    title="Hangfire Dashboard"
                    onLoad={() => setIsLoading(false)}
                />
            </Card>
        </div>
    );
};

export default HangfirePage;
