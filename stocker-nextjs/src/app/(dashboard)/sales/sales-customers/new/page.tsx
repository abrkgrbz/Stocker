
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { SalesFormPageLayout } from '@/components/sales/shared/SalesFormPageLayout';
import SalesCustomerForm, { SalesCustomerFormRef, SalesCustomerFormProps } from '@/components/sales/customers/SalesCustomerForm';
import { salesCustomerService, CreateSalesCustomerRequest } from '@/lib/api/services/salesCustomerService';

export default function NewSalesCustomerPage() {
    const router = useRouter();
    const formRef = useRef<SalesCustomerFormRef>(null);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Check dirty state periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (formRef.current) {
                setIsDirty(formRef.current.isDirty());
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (values: CreateSalesCustomerRequest) => {
        setLoading(true);
        try {
            await salesCustomerService.create(values);
            message.success('Müşteri başarıyla oluşturuldu');
            router.push('/sales/sales-customers');
        } catch (error) {
            message.error('Müşteri oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SalesFormPageLayout
            title="Yeni Müşteri"
            subtitle="Yeni satış müşterisi kaydı oluşturun"
            cancelPath="/sales/sales-customers"
            loading={loading}
            onSave={() => formRef.current?.submit()}
            isDirty={isDirty}
        >
            <SalesCustomerForm
                ref={formRef}
                onFinish={handleSubmit}
                loading={loading}
            />
        </SalesFormPageLayout>
    );
}
