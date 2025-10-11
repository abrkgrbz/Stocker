'use client';

import React from 'react';
import { Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

interface ErrorFallbackProps {
  error: Error | null;
  resetError?: () => void;
  showDetails?: boolean;
}

export default function ErrorFallback({
  error,
  resetError,
  showDetails = false
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bir Şeyler Ters Gitti
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {(isDevelopment || showDetails) && error && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hata Detayları:
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 font-mono mb-2">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {resetError && (
            <button
              type="button"
              onClick={resetError}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            >
              <ReloadOutlined />
              Tekrar Dene
            </button>
          )}
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            <HomeOutlined />
            Ana Sayfaya Dön
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sorun devam ederse, lütfen{' '}
            <a href="/help" className="text-violet-600 hover:text-violet-700 font-medium">
              destek ekibi
            </a>{' '}
            ile iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
}
