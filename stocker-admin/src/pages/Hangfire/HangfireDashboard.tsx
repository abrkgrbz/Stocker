import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const HangfireDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hangfireUrl = `${import.meta.env.VITE_API_URL}/hangfire`;

  useEffect(() => {
    // Check if user has required role - only SistemYoneticisi
    const hasRequiredRole = user?.roles?.some(role => 
      role === 'SistemYoneticisi'
    );

    if (!hasRequiredRole) {
      setError('Bu sayfaya erişim yetkiniz bulunmamaktadır. Sistem Yöneticisi rolüne sahip olmanız gerekmektedir.');
      setLoading(false);
      return;
    }

    // Set loading to false after check
    setLoading(false);
  }, [user]);

  const openHangfireInNewTab = () => {
    // Open Hangfire dashboard with token in query string
    const urlWithToken = `${hangfireUrl}?access_token=${encodeURIComponent(token || '')}`;
    window.open(urlWithToken, '_blank');
  };

  const openHangfireInIframe = () => {
    // Reload iframe with fresh token
    const iframe = document.getElementById('hangfire-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `${hangfireUrl}?access_token=${encodeURIComponent(token || '')}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hangfire Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Arka plan işlemleri ve zamanlanmış görevleri yönetin
          </p>
        </div>
        <Button 
          onClick={openHangfireInNewTab}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Yeni Sekmede Aç
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="bg-muted/50 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Hangfire Dashboard Yükleniyor...</p>
                <p className="text-xs text-muted-foreground">
                  Eğer dashboard yüklenmezse, yukarıdaki "Yeni Sekmede Aç" butonunu kullanın
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openHangfireInIframe}
              >
                Yenile
              </Button>
            </div>
          </div>
          
          {/* Try to embed Hangfire dashboard in iframe with token */}
          <iframe
            id="hangfire-iframe"
            src={`${hangfireUrl}?access_token=${encodeURIComponent(token || '')}`}
            className="w-full h-[800px] border-0"
            title="Hangfire Dashboard"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={() => {
              console.log('Hangfire iframe loaded');
            }}
            onError={(e) => {
              console.error('Hangfire iframe error:', e);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HangfireDashboard;