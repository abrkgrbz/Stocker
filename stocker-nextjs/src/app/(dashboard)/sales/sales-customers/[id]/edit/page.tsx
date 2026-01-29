
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { SalesFormPageLayout } from '@/components/sales/shared/SalesFormPageLayout';
import SalesCustomerForm, { SalesCustomerFormRef } from '@/components/sales/customers/SalesCustomerForm';
import { salesCustomerService, SalesCustomer, UpdateSalesCustomerRequest } from '@/lib/api/services/salesCustomerService';

export default function EditSalesCustomerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const formRef = useRef<SalesCustomerFormRef>(null);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [customer, setCustomer] = useState<SalesCustomer | undefined>(undefined);
    const [dataLoading, setDataLoading] = useState(true);
    const [errorHeader, setErrorHeader] = useState(false);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setDataLoading(true);
                const data = await salesCustomerService.getById(params.id);
                setCustomer(data);
            } catch (err) {
                setErrorHeader(true);
                message.error('Müşteri bilgileri yüklenemedi');
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [params.id]);

    // Check dirty state
    useEffect(() => {
        const interval = setInterval(() => {
            if (formRef.current) {
                setIsDirty(formRef.current.isDirty());
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (values: UpdateSalesCustomerRequest) => {
        setLoading(true);
        try {
            await salesCustomerService.update(params.id, values);
            message.success('Müşteri başarıyla güncellendi');
            router.push('/sales/sales-customers');
        } catch (error) {
            message.error('Güncelleme sırasında hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SalesFormPageLayout
            title="Müşteri Düzenle"
            subtitle="Müşteri bilgilerini güncelleyin"
            cancelPath="/sales/sales-customers"
            loading={loading}
            onSave={() => formRef.current?.submit()}
            isDirty={isDirty}
            isDataLoading={dataLoading}
            dataError={errorHeader}
        >
            {customer && (
                <SalesCustomerForm
                    ref={formRef}
                    initialValues={customer}
                    onFinish={handleSubmit}
                    loading={loading}
                />
            )}
        </SalesFormPageLayout>
    );
}
