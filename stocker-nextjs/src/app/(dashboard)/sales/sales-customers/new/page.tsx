
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Card, Select, message, Row, Col } from 'antd';
import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button } from '@/components/primitives/buttons';
import { salesCustomerService, CreateSalesCustomerRequest } from '@/lib/api/services/salesCustomerService';

export default function NewSalesCustomerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload: CreateSalesCustomerRequest = {
                name: values.name,
                code: values.code,
                email: values.email,
                phone: values.phone,
                taxId: values.taxId,
                taxOffice: values.taxOffice,
                address: values.address,
                city: values.city,
                country: values.country,
                currency: values.currency || 'TRY'
            };

            await salesCustomerService.create(payload);
            message.success('Müşteri başarıyla oluşturuldu');
            router.push('/sales/sales-customers');
        } catch (error) {
            message.error('Kayıt oluşturulurken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer maxWidth="5xl">
            <div className="mb-8">
                <Link href="/sales/sales-customers" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Listeye Dön
                </Link>
                <h1 className="text-2xl font-semibold text-slate-900">Yeni Müşteri Ekle</h1>
                <p className="text-sm text-slate-500">Satış modülü için yeni bir müşteri kaydı oluşturun.</p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ currency: 'TRY', country: 'Türkiye' }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-sm font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Temel Bilgiler</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="name" label="Müşteri Adı / Unvanı" rules={[{ required: true, message: 'Zorunlu alan' }]} className="md:col-span-2">
                                    <Input className="rounded-lg" placeholder="Örn: Acme A.Ş." />
                                </Form.Item>
                                <Form.Item name="code" label="Müşteri Kodu">
                                    <Input className="rounded-lg" placeholder="Otomatik (Boş bırakılabilir)" />
                                </Form.Item>
                                <Form.Item name="email" label="E-posta Adresi" rules={[{ type: 'email' }]}>
                                    <Input className="rounded-lg" placeholder="ornek@sirket.com" />
                                </Form.Item>
                                <Form.Item name="phone" label="Telefon">
                                    <Input className="rounded-lg" placeholder="+90 555 123 45 67" />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-sm font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Fatura & Adres Bilgileri</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="taxId" label="Vergi / TC Kimlik No">
                                    <Input className="rounded-lg" />
                                </Form.Item>
                                <Form.Item name="taxOffice" label="Vergi Dairesi">
                                    <Input className="rounded-lg" />
                                </Form.Item>
                                <Form.Item name="address" label="Adres" className="md:col-span-2">
                                    <Input.TextArea rows={3} className="rounded-lg" />
                                </Form.Item>
                                <Form.Item name="city" label="Şehir">
                                    <Input className="rounded-lg" />
                                </Form.Item>
                                <Form.Item name="country" label="Ülke">
                                    <Input className="rounded-lg" />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Settings */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-sm font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Finansal Ayarlar</h2>
                            <Form.Item name="currency" label="Para Birimi" rules={[{ required: true }]}>
                                <Select className="rounded-lg">
                                    <Select.Option value="TRY">TRY - Türk Lirası</Select.Option>
                                    <Select.Option value="USD">USD - Amerikan Doları</Select.Option>
                                    <Select.Option value="EUR">EUR - Euro</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10"
                                loading={loading}
                            >
                                Kaydet
                            </Button>
                            <Button
                                type="button"
                                className="w-full bg-white text-slate-700 border-slate-300 hover:bg-slate-50 h-10"
                                onClick={() => router.back()}
                            >
                                İptal
                            </Button>
                        </div>
                    </div>
                </div>
            </Form>
        </PageContainer>
    );
}
