
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { SalesFormPageLayout } from '@/components/sales/shared/SalesFormPageLayout';
import SalesProductForm, { SalesProductFormRef } from '@/components/sales/products/SalesProductForm';
import { salesProductService, CreateSalesProductRequest } from '@/lib/api/services/salesProductService';

export default function NewSalesProductPage() {
    const router = useRouter();
    const formRef = useRef<SalesProductFormRef>(null);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Check dirty state
    useEffect(() => {
        const interval = setInterval(() => {
            if (formRef.current) {
                setIsDirty(formRef.current.isDirty());
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (values: CreateSalesProductRequest) => {
        setLoading(true);
        try {
            await salesProductService.create(values);
            message.success('Ürün başarıyla oluşturuldu');
            router.push('/sales/sales-products');
        } catch (error) {
            message.error('Ürün oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SalesFormPageLayout
            title="Yeni Ürün/Hizmet"
            subtitle="Yeni satış kalemi oluşturun"
            cancelPath="/sales/sales-products"
            loading={loading}
            onSave={() => formRef.current?.submit()}
            isDirty={isDirty}
        >
            <SalesProductForm
                ref={formRef}
                onFinish={handleSubmit}
                loading={loading}
            />
        </SalesFormPageLayout>
    );
}
