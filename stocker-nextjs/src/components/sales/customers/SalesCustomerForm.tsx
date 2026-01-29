
'use client';

import React, { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { FormSection, FormField } from '@/components/patterns/forms/FormSection';
import { Input, Select, Textarea } from '@/components/primitives';
import { SalesCustomer, CreateSalesCustomerRequest } from '@/lib/api/services/salesCustomerService';

export interface SalesCustomerFormRef {
    submit: () => void;
    getValues: () => CreateSalesCustomerRequest;
    validate: () => boolean;
    isDirty: () => boolean;
}

export interface SalesCustomerFormProps {
    initialValues?: SalesCustomer;
    onFinish: (values: CreateSalesCustomerRequest) => void;
    loading?: boolean;
}

const SalesCustomerForm = forwardRef<SalesCustomerFormRef, SalesCustomerFormProps>(function SalesCustomerForm(
    { initialValues, onFinish, loading = false },
    ref
) {
    // Form state
    const [formData, setFormData] = useState<CreateSalesCustomerRequest>({
        name: '',
        email: '',
        phone: '',
        taxId: '',
        taxOffice: '',
        address: '',
        city: '',
        country: '',
        currency: 'TRY',
        isActive: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateSalesCustomerRequest, string>>>({});
    const [isDirty, setIsDirty] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Initialize with existing values
    useEffect(() => {
        if (initialValues) {
            setFormData({
                name: initialValues.name,
                code: initialValues.code,
                email: initialValues.email,
                phone: initialValues.phone,
                taxId: initialValues.taxId,
                taxOffice: initialValues.taxOffice,
                address: initialValues.address,
                city: initialValues.city,
                country: initialValues.country,
                currency: initialValues.currency,
                isActive: initialValues.isActive,
            });
        }
    }, [initialValues]);

    // Field change handler
    const handleChange = useCallback(<K extends keyof CreateSalesCustomerRequest>(
        field: K,
        value: CreateSalesCustomerRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // Validate form
    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof CreateSalesCustomerRequest, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Müşteri adı zorunludur';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Form submit handler
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onFinish(formData);
        }
    }, [validate, onFinish, formData]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        submit: () => {
            if (validate()) {
                onFinish(formData);
            }
        },
        getValues: () => formData,
        validate,
        isDirty: () => isDirty,
    }), [validate, onFinish, formData, isDirty]);

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="w-full space-y-8">

            {/* Temel Bilgiler */}
            <FormSection title="Temel Bilgiler" description="Müşterinin genel bilgileri">
                <FormField label="Müşteri Adı / Unvanı" required span={12} error={errors.name}>
                    <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Firma veya şahıs adı"
                        error={!!errors.name}
                        disabled={loading}
                    />
                </FormField>

                {initialValues?.code && (
                    <FormField label="Müşteri Kodu" span={6}>
                        <Input value={initialValues.code} disabled />
                    </FormField>
                )}

                <FormField label="E-posta" span={6} error={errors.email}>
                    <Input
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="ornek@firma.com"
                        error={!!errors.email}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Telefon" span={6}>
                    <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+90 555 123 45 67"
                        disabled={loading}
                    />
                </FormField>
            </FormSection>

            {/* Finansal & Adres */}
            <FormSection title="Fatura & Adres" description="Vergi ve iletişim detayları">
                <FormField label="Vergi / TC Kimlik No" span={6}>
                    <Input
                        value={formData.taxId}
                        onChange={(e) => handleChange('taxId', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="Vergi No veya TCKN"
                        maxLength={11}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Vergi Dairesi" span={6}>
                    <Input
                        value={formData.taxOffice}
                        onChange={(e) => handleChange('taxOffice', e.target.value)}
                        placeholder="Vergi dairesi adı"
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Para Birimi" span={6} required>
                    <Select
                        value={formData.currency}
                        onChange={(val) => handleChange('currency', val)}
                        options={[
                            { value: 'TRY', label: 'TRY - Türk Lirası' },
                            { value: 'USD', label: 'USD - Amerikan Doları' },
                            { value: 'EUR', label: 'EUR - Euro' }
                        ]}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Durum" span={6}>
                    <Select
                        value={formData.isActive ? 'true' : 'false'}
                        onChange={(val) => handleChange('isActive', val === 'true')}
                        options={[
                            { value: 'true', label: 'Aktif' },
                            { value: 'false', label: 'Pasif' }
                        ]}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Adres" span={12}>
                    <Textarea
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Açık adres"
                        rows={3}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Şehir" span={6}>
                    <Input
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Şehir"
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Ülke" span={6}>
                    <Input
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="Ülke"
                        disabled={loading}
                    />
                </FormField>
            </FormSection>

        </form>
    );
});

export default SalesCustomerForm;
