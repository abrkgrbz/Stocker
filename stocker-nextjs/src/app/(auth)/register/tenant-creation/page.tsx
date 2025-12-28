import { Suspense } from 'react';
import TenantCreationProgress from '@/components/registration/TenantCreationProgress';

export const metadata = {
  title: 'Hesabınız Oluşturuluyor | Stocker',
  description: 'Hesabınız oluşturuluyor, lütfen bekleyin',
};

export default function TenantCreationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-slate-900 mx-auto"></div>
            <p className="text-slate-600 mt-4 text-center">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <TenantCreationProgress />
    </Suspense>
  );
}
