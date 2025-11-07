'use client';

import { useState } from 'react';
import { Card, Tag } from 'antd';
import { motion } from 'framer-motion';
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

// Mock data
const mockDocuments = [
  {
    id: 1,
    fileName: 'Sözleşme_2024.pdf',
    originalFileName: 'Sözleşme_2024.pdf',
    contentType: 'application/pdf',
    fileSize: 2458624, // 2.4 MB
    category: 'Contract',
    description: 'Tedarikçi sözleşmesi - 2024 yılı için geçerli',
    uploadedAt: new Date('2024-11-01'),
  },
  {
    id: 2,
    fileName: 'Teknik_Şartname.docx',
    originalFileName: 'Teknik_Şartname.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1245184, // 1.2 MB
    category: 'General',
    description: 'Proje teknik şartname dokümanı',
    uploadedAt: new Date('2024-11-03'),
  },
  {
    id: 3,
    fileName: 'Fiyat_Listesi.xlsx',
    originalFileName: 'Fiyat_Listesi.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 856320, // 836 KB
    category: 'Quote',
    description: '2024 Q4 güncel fiyat listesi',
    uploadedAt: new Date('2024-11-05'),
  },
  {
    id: 4,
    fileName: 'Logo_Tasarım.png',
    originalFileName: 'Logo_Tasarım.png',
    contentType: 'image/png',
    fileSize: 458752, // 448 KB
    category: 'Other',
    description: 'Yeni logo tasarım önerisi - yüksek çözünürlük',
    uploadedAt: new Date('2024-11-06'),
  },
  {
    id: 5,
    fileName: 'Proje_Arsiv.zip',
    originalFileName: 'Proje_Arsiv.zip',
    contentType: 'application/zip',
    fileSize: 15728640, // 15 MB
    category: 'Other',
    description: 'Tüm proje dosyaları arşivi',
    uploadedAt: new Date('2024-11-07'),
  },
];

// File type info helper
const getFileTypeInfo = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return {
        icon: <FilePdfOutlined className="text-white text-4xl" />,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    case 'doc':
    case 'docx':
      return {
        icon: <FileWordOutlined className="text-white text-4xl" />,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    case 'xls':
    case 'xlsx':
      return {
        icon: <FileExcelOutlined className="text-white text-4xl" />,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return {
        icon: <FileImageOutlined className="text-white text-4xl" />,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      };
    case 'zip':
    case 'rar':
    case '7z':
      return {
        icon: <FileZipOutlined className="text-white text-4xl" />,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    default:
      return {
        icon: <FileOutlined className="text-white text-4xl" />,
        color: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function DocumentDemoPage() {
  const [documents] = useState(mockDocuments);
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
              Doküman listesi görünümü - 5 farklı dosya tipi
            </p>
          </div>

          {/* Documents List */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileOutlined className="text-xl" />
                  <span className="font-semibold">Dokümanlar</span>
                  <span className="text-sm text-gray-500">({documents.length})</span>
                </div>
              </div>
            }
            className="shadow-lg"
          >
            <div className="space-y-3">
              {documents.map((doc, index) => {
                const fileInfo = getFileTypeInfo(doc.fileName);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 ${fileInfo.borderColor} ${fileInfo.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                    >
                      {/* Icon Section */}
                      <div className={`flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br ${fileInfo.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {fileInfo.icon}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        {/* File Name */}
                        <Tooltip title={doc.fileName}>
                          <h3 className="font-semibold text-gray-900 truncate text-lg mb-1">
                            {doc.fileName}
                          </h3>
                        </Tooltip>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Tag color="blue" className="m-0">
                            {doc.category}
                          </Tag>
                          <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          {doc.uploadedAt && (
                            <span className="text-xs text-gray-500">
                              📅 {doc.uploadedAt.toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {doc.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Tooltip title="İndir">
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            className="shadow-sm"
                            size="large"
                          />
                        </Tooltip>
                        <Tooltip title="Sil">
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="large"
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
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
