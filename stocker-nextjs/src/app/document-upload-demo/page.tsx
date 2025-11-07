'use client';

import { DocumentUpload } from '@/components/crm/shared/DocumentUpload';

export default function DocumentUploadDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-2">📁 Modern Document Upload Demo</h1>
          <p className="text-gray-600">
            Bu sayfa modern drag & drop document upload bileşenini test etmek için oluşturulmuştur.
          </p>
        </div>

        <div className="mb-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <h2 className="text-xl font-semibold mb-3">🎯 Beklenen Özellikler:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✅ Büyük dropzone alanı (InboxOutlined icon ile)</li>
            <li>✅ Drag & drop desteği - dosyaları sürükleyip bırakabilme</li>
            <li>✅ Dosya türü ikonları (PDF kırmızı, Word mavi, Excel yeşil, vs.)</li>
            <li>✅ Akıllı dosya boyutu formatlaması (KB, MB, GB)</li>
            <li>✅ Yükleme progress bar'ı</li>
            <li>✅ Smooth animasyonlar ve hover efektleri</li>
            <li>✅ Modern card layout ve shadow efektleri</li>
          </ul>
        </div>

        {/* Demo Component */}
        <DocumentUpload
          entityId="demo-entity-123"
          entityType="Deal"
          maxFileSize={50}
          multiple={true}
        />

        <div className="mt-6 bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
          <h3 className="font-semibold mb-2">⚠️ Test Notu:</h3>
          <p className="text-sm text-gray-700">
            Bu demo sayfası test amaçlıdır. Yüklenen dosyalar gerçek bir entity'ye bağlanmayacaktır.
            Sadece UI'ı test etmek için kullanın.
          </p>
        </div>
      </div>
    </div>
  );
}
