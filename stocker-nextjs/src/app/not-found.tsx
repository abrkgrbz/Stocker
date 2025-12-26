'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-lg text-gray-600">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-12">
          <svg
            className="w-64 h-64 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={0.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              type="primary"
              icon={<HomeOutlined />}
              size="large"
              className="w-full sm:w-auto"
            >
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            Geri Dön
          </Button>
        </div>

        {/* Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Yardıma mı ihtiyacınız var?
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/help" className="text-violet-600 hover:text-violet-700 font-medium">
              Yardım Merkezi
            </Link>
            <Link href="/contact" className="text-violet-600 hover:text-violet-700 font-medium">
              İletişim
            </Link>
            <Link href="/docs" className="text-violet-600 hover:text-violet-700 font-medium">
              Dokümantasyon
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
