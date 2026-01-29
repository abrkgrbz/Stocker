
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { SalesFormPageLayout } from '@/components/sales/shared/SalesFormPageLayout';
import SalesProductForm, { SalesProductFormRef } from '@/components/sales/products/SalesProductForm';
import { salesProductService, SalesProduct, UpdateSalesProductRequest } from '@/lib/api/services/salesProductService';

export default function EditSalesProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const formRef = useRef<SalesProductFormRef>(null);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [product, setProduct] = useState<SalesProduct | undefined>(undefined);
    const [dataLoading, setDataLoading] = useState(true);
    const [errorHeader, setErrorHeader] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setDataLoading(true);
                const data = await salesProductService.getById(params.id);
                setProduct(data);
            } catch (err) {
                setErrorHeader(true);
                message.error('Ürün bilgileri yüklenemedi');
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [params.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (formRef.current) {
                setIsDirty(formRef.current.isDirty());
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (values: UpdateSalesProductRequest) => {
        setLoading(true);
        try {
            await salesProductService.update(params.id, values);
            message.success('Ürün başarıyla güncellendi');
            router.push('/sales/sales-products');
        } catch (error) {
            message.error('Güncelleme sırasında hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SalesFormPageLayout
            title="Ürün Düzenle"
            subtitle="Ürün veya hizmet bilgilerini güncelleyin"
            cancelPath="/sales/sales-products"
            loading={loading}
            onSave={() => formRef.current?.submit()}
            isDirty={isDirty}
            isDataLoading={dataLoading}
            dataError={errorHeader}
        >
            {product && (
                <SalesProductForm
                    ref={formRef}
                    initialValues={product}
                    onFinish={handleSubmit}
                    loading={loading}
                />
            )}
        </SalesFormPageLayout>
    );
}
