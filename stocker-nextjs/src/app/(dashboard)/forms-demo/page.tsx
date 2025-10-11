'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Alert, Tabs } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import type { CustomerFormData } from '@/features/customers/schemas/customer-schema';

const { Title, Paragraph } = Typography;

export default function FormsDemoPage() {
  const [submittedData, setSubmittedData] = useState<CustomerFormData | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    console.log('Form Data:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmittedData(data);
  };

  const handleCancel = () => {
    setSubmittedData(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Space direction="vertical" size="small">
          <Title level={2}>
            <FormOutlined className="mr-2" />
            Gelişmiş Form Sistemi
          </Title>
          <Paragraph type="secondary">
            React Hook Form + Zod validation ile güçlü, tip-güvenli formlar
          </Paragraph>
        </Space>
      </div>

      <Alert
        message="Form Özellikleri"
        description={
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>✅ React Hook Form ile performanslı form yönetimi</li>
            <li>✅ Zod ile tip-güvenli validasyon</li>
            <li>✅ Türkiye'ye özel validasyonlar (TC Kimlik, Vergi No, IBAN, Telefon)</li>
            <li>✅ Gerçek zamanlı hata mesajları</li>
            <li>✅ Conditional validation (Bireysel/Kurumsal)</li>
            <li>✅ Format maskeleme ve dönüşümler</li>
            <li>✅ Ant Design entegrasyonu</li>
          </ul>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Tabs
        defaultActiveKey="customer-form"
        items={[
          {
            key: 'customer-form',
            label: 'Müşteri Formu',
            children: (
              <div>
                <CustomerForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />

                {submittedData && (
                  <Card title="Gönderilen Veri" className="mt-6" type="inner">
                    <pre className="bg-gray-50 p-4 rounded overflow-auto">
                      {JSON.stringify(submittedData, null, 2)}
                    </pre>
                  </Card>
                )}
              </div>
            ),
          },
          {
            key: 'validation-examples',
            label: 'Validasyon Örnekleri',
            children: (
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>TC Kimlik No</Title>
                    <Paragraph type="secondary">
                      11 haneli, checksum algoritması ile doğrulanır
                    </Paragraph>
                    <code className="bg-gray-100 px-2 py-1 rounded">12345678901 (geçersiz)</code>
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded">10000000146 (geçerli)</code>
                  </div>

                  <div>
                    <Title level={5}>Vergi Kimlik No</Title>
                    <Paragraph type="secondary">
                      10 haneli (şirket) veya 11 haneli (bireysel/TC Kimlik)
                    </Paragraph>
                    <code className="bg-gray-100 px-2 py-1 rounded">1234567890 (10 haneli şirket)</code>
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded">10000000146 (11 haneli TC)</code>
                  </div>

                  <div>
                    <Title level={5}>IBAN</Title>
                    <Paragraph type="secondary">
                      TR + 24 rakam, mod-97 checksum
                    </Paragraph>
                    <code className="bg-gray-100 px-2 py-1 rounded">TR330006100519786457841326</code>
                  </div>

                  <div>
                    <Title level={5}>Telefon</Title>
                    <Paragraph type="secondary">
                      +90 ile normalize edilir, formatlanır
                    </Paragraph>
                    <code className="bg-gray-100 px-2 py-1 rounded">0532 123 45 67 → +90 532 123 45 67</code>
                  </div>

                  <div>
                    <Title level={5}>Para Birimi</Title>
                    <Paragraph type="secondary">
                      Türk Lirası formatı, 2 ondalık basamak
                    </Paragraph>
                    <code className="bg-gray-100 px-2 py-1 rounded">1234.56 → 1.234,56 ₺</code>
                  </div>
                </Space>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
