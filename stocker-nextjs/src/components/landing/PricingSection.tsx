'use client';

import React from 'react';
import { Button } from 'antd';
import { CheckOutlined, RocketOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import Link from 'next/link';

const plans = [
  {
    name: 'Başlangıç',
    icon: <RocketOutlined />,
    price: '0',
    period: 'Ücretsiz',
    description: 'Küçük işletmeler için ideal',
    features: [
      '100 ürün limiti',
      '1 kullanıcı',
      'Temel raporlar',
      'Email desteği',
      'Mobil uygulama',
      '1 GB depolama',
    ],
    color: 'from-blue-500 to-cyan-500',
    popular: false,
    cta: 'Ücretsiz Başla',
  },
  {
    name: 'Profesyonel',
    icon: <StarOutlined />,
    price: '299',
    period: '/ay',
    description: 'Büyüyen işletmeler için',
    features: [
      'Sınırsız ürün',
      '10 kullanıcı',
      'Gelişmiş raporlar',
      'Öncelikli destek',
      'Mobil uygulama',
      '50 GB depolama',
      'API erişimi',
      'Çoklu depo',
      'Otomatik bildirimler',
    ],
    color: 'from-purple-500 to-pink-500',
    popular: true,
    cta: 'Şimdi Başla',
  },
  {
    name: 'Kurumsal',
    icon: <CrownOutlined />,
    price: 'Özel',
    period: 'Fiyat',
    description: 'Büyük ölçekli şirketler için',
    features: [
      'Sınırsız her şey',
      'Sınırsız kullanıcı',
      'Özel raporlar',
      '7/24 premium destek',
      'Mobil uygulama',
      'Sınırsız depolama',
      'API erişimi',
      'Özel entegrasyonlar',
      'Eğitim ve danışmanlık',
      'Özel sunucu seçeneği',
    ],
    color: 'from-amber-500 to-orange-500',
    popular: false,
    cta: 'Bize Ulaşın',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Basit ve Şeffaf Fiyatlandırma
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            İşletmenizin büyüklüğüne uygun plan seçin. Tüm planlar 14 gün ücretsiz deneme ile gelir.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'lg:scale-110 lg:z-10 border-2 border-purple-500' : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ En Popüler
                  </div>
                </div>
              )}

              <div className="p-8 lg:p-10">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}>
                  {plan.icon}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  {plan.price === 'Özel' ? (
                    <div>
                      <div className="text-4xl font-bold text-gray-900">{plan.price}</div>
                      <div className="text-gray-600 mt-1">{plan.period}</div>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">₺{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <CheckOutlined className="text-white text-xs" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href="/register">
                  <Button
                    size="large"
                    block
                    className={`h-12 font-semibold text-base ${
                      plan.popular
                        ? 'btn-neon-green shadow-xl'
                        : 'btn-pricing-ghost'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Tüm planlar <span className="font-semibold text-purple-600">14 gün ücretsiz deneme</span> ile gelir. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckOutlined className="text-green-500" />
              <span>İstediğiniz zaman iptal edin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckOutlined className="text-green-500" />
              <span>Gizli ücret yok</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckOutlined className="text-green-500" />
              <span>Ücretsiz güncellemeler</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
