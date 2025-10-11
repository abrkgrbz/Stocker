'use client';

import React from 'react';
import { Button } from 'antd';
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sayfa Yüklenemedi
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Bu sayfa yüklenirken bir hata oluştu.
        </p>

        {/* Development Error Details */}
        {isDevelopment && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-left">
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={reset}
          >
            Tekrar Dene
          </Button>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
