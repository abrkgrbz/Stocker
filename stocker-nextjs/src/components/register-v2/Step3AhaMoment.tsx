'use client';

import React, { useState } from 'react';
import { Input, Button, Card, message } from 'antd';
import {
  CheckCircleFilled,
  RocketOutlined,
  ShoppingOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

interface Step3Props {
  onComplete: () => void;
  userName: string;
}

export default function Step3AhaMoment({ onComplete, userName }: Step3Props) {
  const [currentTask, setCurrentTask] = useState<'product' | 'invoice' | 'complete'>('product');
  const [productData, setProductData] = useState({
    name: '',
    price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({
    product: false,
    invoice: false,
  });

  const firstName = userName.split(' ')[0];

  const handleAddProduct = async () => {
    if (!productData.name || !productData.price) {
      message.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (isNaN(Number(productData.price)) || Number(productData.price) <= 0) {
      message.error('Lütfen geçerli bir fiyat girin');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setCompletedTasks(prev => ({ ...prev, product: true }));

    message.success('🎉 Harika! İlk ürününüzü eklediniz!');

    // Move to invoice task after a short delay
    setTimeout(() => {
      setCurrentTask('invoice');
    }, 1500);
  };

  const handleCreateInvoice = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setCompletedTasks(prev => ({ ...prev, invoice: true }));

    message.success('🎊 Muhteşem! İlk faturanızı oluşturdunuz!');

    // Move to complete state
    setTimeout(() => {
      setCurrentTask('complete');
    }, 1500);
  };

  if (currentTask === 'complete') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 animate-bounce">
            <TrophyOutlined className="text-5xl text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Tebrikler {firstName}! 🎉
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Stocker'ı kullanmaya hazırsınız!
        </p>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Başarılarınız
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left">
              <CheckCircleFilled className="text-2xl text-green-500" />
              <span className="text-gray-700">İlk ürününüzü eklediniz</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <CheckCircleFilled className="text-2xl text-green-500" />
              <span className="text-gray-700">İlk faturanızı oluşturdunuz</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sırada Ne Var?
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Daha fazla ürün ekleyin ve kategorileyin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Müşterilerinizi sisteme kaydedin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>Stok hareketlerinizi takip edin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <span>e-Fatura entegrasyonunu tamamlayın</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <Button
          type="primary"
          size="large"
          onClick={onComplete}
          icon={<RocketOutlined />}
          className="btn-neon-green h-14 px-12 text-lg font-bold"
        >
          Stocker'a Giriş Yap
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          14 günlük ücretsiz denemeniz şimdi başlıyor 🎁
        </p>
      </div>
    );
  }

  if (currentTask === 'invoice') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            <CheckCircleFilled /> Ürün Eklendi
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Harika İş! Şimdi İlk Faturanı Oluştur 📄
          </h2>
          <p className="text-lg text-gray-600">
            Artık ürününüzü kullanan bir fatura oluşturalım
          </p>
        </div>

        {/* Invoice Preview Card */}
        <Card className="mb-6 border-2 border-purple-200 shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Örnek Fatura #1</h3>
                <p className="text-sm text-gray-500">Örnek Müşteri A.Ş.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  ₺{productData.price}
                </p>
                <p className="text-sm text-gray-500">KDV Dahil</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ürün</span>
                <span className="font-medium text-gray-900">{productData.name}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Adet</span>
                <span className="font-medium text-gray-900">1</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Birim Fiyat</span>
                <span className="font-medium text-gray-900">₺{productData.price}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action */}
        <Button
          type="primary"
          size="large"
          block
          onClick={handleCreateInvoice}
          loading={isSubmitting}
          icon={<CheckCircleFilled />}
          className="btn-neon-green h-14 text-lg font-bold"
        >
          Faturayı Oluştur
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          💡 Gerçek faturalar için e-Fatura entegrasyonu yapabilirsiniz
        </p>
      </div>
    );
  }

  // Product Task
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4">
          <ShoppingOutlined className="text-3xl text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Hadi İlk Ürününü Ekleyelim! 🎯
        </h2>
        <p className="text-lg text-gray-600">
          {firstName}, işte Stocker'ın gücünü görelim
        </p>
      </div>

      {/* Product Form */}
      <Card className="mb-6 shadow-lg">
        <div className="space-y-5">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Adı <span className="text-red-500">*</span>
            </label>
            <Input
              id="productName"
              size="large"
              placeholder="Örnek: Laptop, Telefon, Sandalye..."
              value={productData.name}
              onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
              className="h-12"
            />
          </div>

          <div>
            <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat (₺) <span className="text-red-500">*</span>
            </label>
            <Input
              id="productPrice"
              size="large"
              type="number"
              placeholder="100"
              prefix="₺"
              value={productData.price}
              onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
              className="h-12"
            />
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="primary"
        size="large"
        block
        onClick={handleAddProduct}
        loading={isSubmitting}
        disabled={!productData.name || !productData.price}
        icon={<RocketOutlined />}
        className="btn-neon-green h-14 text-lg font-bold"
      >
        İlk Ürünümü Ekle
      </Button>

      {/* Encouragement */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          🚀 Sadece 2 alan - çok basit! Stocker ile ürün yönetimi bu kadar kolay.
        </p>
      </div>
    </div>
  );
}
