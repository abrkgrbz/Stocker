'use client';

import { DocumentUpload } from '@/components/crm/shared/DocumentUpload';
import { Card, Tag } from 'antd';

export default function DocumentDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-xl border-0">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📁 Doküman Upload Demo
            </h1>
            <p className="text-gray-600 text-lg">
              Yeni tasarımı test edin - Dropzone.js ile modern drag & drop arayüzü
            </p>
            <div className="flex justify-center gap-3">
              <Tag color="blue">Renkli Dosya İkonları</Tag>
              <Tag color="green">Animasyonlu Liste</Tag>
              <Tag color="purple">Gradient Efektler</Tag>
              <Tag color="orange">Responsive Tasarım</Tag>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <div className="space-y-2">
              <div className="text-3xl">🎨</div>
              <h3 className="font-semibold text-gray-900">Dosya Tipine Göre Renk</h3>
              <p className="text-sm text-gray-600">
                PDF (Kırmızı), Word (Mavi), Excel (Yeşil), Resim (Mor), ZIP (Turuncu)
              </p>
            </div>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <div className="space-y-2">
              <div className="text-3xl">✨</div>
              <h3 className="font-semibold text-gray-900">Smooth Animasyonlar</h3>
              <p className="text-sm text-gray-600">
                Soldan sağa giriş, hover efektleri, icon büyüme animasyonları
              </p>
            </div>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <div className="space-y-2">
              <div className="text-3xl">📱</div>
              <h3 className="font-semibold text-gray-900">Responsive Layout</h3>
              <p className="text-sm text-gray-600">
                Mobil, tablet ve desktop için optimize edilmiş tasarım
              </p>
            </div>
          </Card>
        </div>

        {/* Demo Component */}
        <Card className="shadow-xl border-0">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 -m-6 mb-6 rounded-t-lg">
            <h2 className="text-xl font-semibold">🚀 Canlı Demo</h2>
            <p className="text-sm text-blue-100">
              Test entity için doküman yükleme ve listeleme
            </p>
          </div>

          <DocumentUpload
            entityId="demo-entity-123"
            entityType="Deal"
            maxFileSize={50}
            multiple={true}
          />
        </Card>

        {/* Features List */}
        <Card className="shadow-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📋</span>
            Özellikler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Dosya tipine göre otomatik renklendirme</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Büyük, renkli gradient iconlar (80x80px)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Hover'da icon büyüme animasyonu</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Soldan sağa slide-in animasyon</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Kompakt list layout (full-width)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Büyük action butonları (download/delete)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Dropzone.js drag & drop desteği</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-gray-700">Responsive tasarım (mobile/tablet/desktop)</span>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
