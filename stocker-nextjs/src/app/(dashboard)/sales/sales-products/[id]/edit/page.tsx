
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Card, Select, message, InputNumber, Spin } from 'antd';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { Button } from '@/components/primitives/buttons';
import { salesProductService, UpdateSalesProductRequest } from '@/lib/api/services/salesProductService';

export default function EditSalesProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        loadProduct();
    }, [params.id]);

    const loadProduct = async () => {
        try {
            setDataLoading(true);
            const product = await salesProductService.getById(params.id);
            form.setFieldsValue({
                name: product.name,
                code: product.code,
                description: product.description,
                unit: product.unit,
                unitPrice: product.unitPrice,
                currency: product.currency,
                taxRate: product.taxRate,
                category: product.category,
                isActive: product.isActive
            });
        } catch (error) {
            message.error('Ürün bilgileri yüklenemedi');
            router.push('/sales/sales-products');
        } finally {
            setDataLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload: UpdateSalesProductRequest = {
                name: values.name,
                code: values.code,
                description: values.description,
                unit: values.unit,
                unitPrice: values.unitPrice,
                currency: values.currency,
                taxRate: values.taxRate,
                category: values.category,
                isActive: values.isActive
            };

            await salesProductService.update(params.id, payload);
            message.success('Ürün başarıyla güncellendi');
            router.push('/sales/sales-products');
        } catch (error) {
            message.error('Güncelleme sırasında hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="5xl">
            <div className="mb-8">
                <Link href="/sales/sales-products" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Listeye Dön
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Ürün Düzenle</h1>
                        <p className="text-sm text-slate-500">Ürün veya hizmet bilgilerini güncelleyin.</p>
                    </div>
                    <div className="bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-500">
                        {params.id}
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-sm font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Ürün Bilgileri</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="name" label="Ürün Adı" rules={[{ required: true, message: 'Zorunlu alan' }]} className="md:col-span-2">
                                    <Input className="rounded-lg" />
                                </Form.Item>
                                <Form.Item name="code" label="Ürün Kodu" rules={[{ required: true, message: 'Zorunlu alan' }]}>
                                    <Input className="rounded-lg" disabled />
                                </Form.Item>
                                <Form.Item name="category" label="Kategori">
                                    <Select className="rounded-lg" mode="tags">
                                        <Select.Option value="Hizmet">Hizmet</Select.Option>
                                        <Select.Option value="Ürün">Ürün</Select.Option>
                                        <Select.Option value="Yazılım">Yazılım</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="description" label="Açıklama" className="md:col-span-2">
                                    <Input.TextArea rows={3} className="rounded-lg" />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Pricing */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="text-sm font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Fiyatlandırma</h2>

                            <Form.Item name="unitPrice" label="Birim Fiyat" rules={[{ required: true }]}>
                                <InputNumber className="w-full rounded-lg" min={0} precision={2} />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="currency" label="Para Birimi" rules={[{ required: true }]}>
                                    <Select className="rounded-lg">
                                        <Select.Option value="TRY">TRY</Select.Option>
                                        <Select.Option value="USD">USD</Select.Option>
                                        <Select.Option value="EUR">EUR</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="unit" label="Birim">
                                    <Select className="rounded-lg" mode="tags">
                                        <Select.Option value="Adet">Adet</Select.Option>
                                        <Select.Option value="Saat">Saat</Select.Option>
                                        <Select.Option value="Ay">Ay</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item name="taxRate" label="KDV Oranı (%)">
                                <InputNumber className="w-full rounded-lg" min={0} max={100} />
                            </Form.Item>

                            <Form.Item name="isActive" label="Durum" className="mb-0">
                                <Select className="rounded-lg">
                                    <Select.Option value={true}>Aktif</Select.Option>
                                    <Select.Option value={false}>Pasif</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10"
                                loading={loading}
                            >
                                Güncelle
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
