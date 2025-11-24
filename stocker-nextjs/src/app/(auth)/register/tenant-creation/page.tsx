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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <TenantCreationProgress />
    </Suspense>
  );
}
