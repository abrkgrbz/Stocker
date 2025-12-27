/**
 * Unauthorized access page
 * Shown when users try to access resources they don't have permission for
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import {
  HomeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useRole } from '@/hooks/useRole';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { displayName, role } = useRole();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <LockClosedIcon className="w-4 h-4" className="text-6xl text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Yetkisiz Erişim
        </h1>

        <p className="text-gray-600 mb-6">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </p>

        {role && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Mevcut Rolünüz: <strong>{displayName}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Bu sayfaya erişmek için daha yüksek yetki seviyesine ihtiyacınız var.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="primary"
            icon={<HomeIcon className="w-4 h-4" />}
            size="large"
            block
            onClick={() => router.push('/dashboard')}
          >
            Ana Sayfaya Dön
          </Button>

          <Button
            size="large"
            block
            onClick={() => router.back()}
          >
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
