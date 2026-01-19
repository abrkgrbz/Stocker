'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export default function InvalidTenantPage() {
  const handleGoToMain = () => {
    // Redirect to main domain
    window.location.href = 'https://stoocker.app';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Result
        icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        title="Geçersiz İşletme"
        subTitle={
          <div className="space-y-2">
            <p>Bu adrese ait bir işletme bulunamadı.</p>
            <p className="text-sm text-gray-500">
              Lütfen doğru adresi kullandığınızdan emin olun veya işletme yöneticinize başvurun.
            </p>
          </div>
        }
        extra={[
          <Button
            key="main"
            type="primary"
            onClick={handleGoToMain}
            style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
          >
            Ana Sayfaya Git
          </Button>,
        ]}
      />
    </div>
  );
}
