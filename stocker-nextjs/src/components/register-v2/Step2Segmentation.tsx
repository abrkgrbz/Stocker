'use client';

import React, { useState } from 'react';
import { Button, Card } from 'antd';
import {
  AppstoreOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShopOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
} from '@ant-design/icons';

interface Step2Props {
  onComplete: (data: { useCases: string[] }) => void;
  onSkip: () => void;
  userName: string;
}

const USE_CASES = [
  {
    id: 'inventory',
    title: 'Stok Takibi',
    description: 'Ürünlerinizi ve stok seviyelerini yönetin',
    icon: <AppstoreOutlined className="text-3xl" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'invoicing',
    title: 'Fatura Yönetimi',
    description: 'e-Fatura ve e-Arşiv oluşturun',
    icon: <FileTextOutlined className="text-3xl" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'customers',
    title: 'Müşteri Takibi',
    description: 'Müşteri ilişkilerinizi yönetin',
    icon: <TeamOutlined className="text-3xl" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'warehouse',
    title: 'Depo Yönetimi',
    description: 'Çoklu depo ve lokasyon takibi',
    icon: <ShopOutlined className="text-3xl" />,
    color: 'from-orange-500 to-red-500',
  },
];

export default function Step2Segmentation({ onComplete, onSkip, userName }: Step2Props) {
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  const toggleUseCase = (caseId: string) => {
    setSelectedCases(prev => {
      if (prev.includes(caseId)) {
        return prev.filter(id => id !== caseId);
      } else {
        return [...prev, caseId];
      }
    });
  };

  const handleContinue = () => {
    onComplete({ useCases: selectedCases });
  };

  const firstName = userName.split(' ')[0];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Merhaba {firstName}! 👋
        </h2>
        <p className="text-lg text-gray-600">
          Stocker'ı nasıl kullanmayı planlıyorsunuz?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Size daha iyi hizmet verebilmemiz için seçin (isterseniz atlayabilirsiniz)
        </p>
      </div>

      {/* Use Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {USE_CASES.map((useCase) => {
          const isSelected = selectedCases.includes(useCase.id);

          return (
            <Card
              key={useCase.id}
              hoverable
              onClick={() => toggleUseCase(useCase.id)}
              className={`relative transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-2 border-purple-500 shadow-lg scale-105'
                  : 'border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircleFilled className="text-2xl text-purple-600" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center text-white shadow-md`}>
                  {useCase.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Button
          type="primary"
          size="large"
          onClick={handleContinue}
          disabled={selectedCases.length === 0}
          icon={<ArrowRightOutlined />}
          className={`h-12 px-8 font-semibold ${
            selectedCases.length > 0
              ? 'btn-neon-green'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedCases.length > 0
            ? `Devam Et (${selectedCases.length} seçildi)`
            : 'Lütfen en az bir seçim yapın'}
        </Button>

        <Button
          size="large"
          onClick={onSkip}
          className="h-12 px-8 text-gray-600 hover:text-gray-800"
        >
          Şimdi Atla
        </Button>
      </div>

      {/* Info */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          💡 İpucu: Birden fazla seçim yapabilirsiniz. Daha sonra değiştirebilirsiniz.
        </p>
      </div>
    </div>
  );
}
