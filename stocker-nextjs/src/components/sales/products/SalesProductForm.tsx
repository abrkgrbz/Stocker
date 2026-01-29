
'use client';

import React, { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { FormSection, FormField } from '@/components/patterns/forms/FormSection';
import { Input, Select, Textarea, NumberInput } from '@/components/primitives';
import { SalesProduct, CreateSalesProductRequest } from '@/lib/api/services/salesProductService';

export interface SalesProductFormRef {
    submit: () => void;
    getValues: () => CreateSalesProductRequest;
    validate: () => boolean;
    isDirty: () => boolean;
}

export interface SalesProductFormProps {
    initialValues?: SalesProduct;
    onFinish: (values: CreateSalesProductRequest) => void;
    loading?: boolean;
}

const SalesProductForm = forwardRef<SalesProductFormRef, SalesProductFormProps>(function SalesProductForm(
    { initialValues, onFinish, loading = false },
    ref
) {
    // Form state
    const [formData, setFormData] = useState<CreateSalesProductRequest>({
        name: '',
        description: '',
        unit: 'Adet',
        unitPrice: 0,
        currency: 'TRY',
        taxRate: 20,
        category: 'Ürün',
        isActive: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateSalesProductRequest, string>>>({});
    const [isDirty, setIsDirty] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Initialize with existing values
    useEffect(() => {
        if (initialValues) {
            setFormData({
                name: initialValues.name,
                code: initialValues.code, // code is optional in Create request but present in Entity
                description: initialValues.description,
                unit: initialValues.unit,
                unitPrice: initialValues.unitPrice,
                currency: initialValues.currency,
                taxRate: initialValues.taxRate,
                category: initialValues.category,
                isActive: initialValues.isActive,
            });
        }
    }, [initialValues]);

    // Field change handler
    const handleChange = useCallback(<K extends keyof CreateSalesProductRequest>(
        field: K,
        value: CreateSalesProductRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // Validate form
    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof CreateSalesProductRequest, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Ürün adı zorunludur';
        }

        if (formData.unitPrice < 0) {
            newErrors.unitPrice = 'Fiyat 0\'dan küçük olamaz';
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

            {/* Ürün Bilgileri */}
            <FormSection title="Ürün Bilgileri" description="Ürün veya hizmetin temel detayları">
                <FormField label="Ürün Adı" required span={12} error={errors.name}>
                    <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Ürün veya hizmet adı"
                        error={!!errors.name}
                        disabled={loading}
                    />
                </FormField>

                {initialValues?.code && (
                    <FormField label="Ürün Kodu" span={6}>
                        <Input value={initialValues.code} disabled />
                    </FormField>
                )}

                <FormField label="Kategori" span={initialValues?.code ? 6 : 12}>
                    <Select
                        value={formData.category}
                        onChange={(val) => handleChange('category', val)}
                        options={[
                            { value: 'Ürün', label: 'Ürün' },
                            { value: 'Hizmet', label: 'Hizmet' },
                            { value: 'Yazılım', label: 'Yazılım' },
                            { value: 'Diğer', label: 'Diğer' }
                        ]}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Açıklama" span={12}>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Ürün açıklaması..."
                        rows={3}
                        disabled={loading}
                    />
                </FormField>
            </FormSection>

            {/* Fiyatlandırma */}
            <FormSection title="Fiyatlandırma" description="Satış fiyatı ve vergi bilgileri">
                <FormField label="Birim Fiyat" required span={4} error={errors.unitPrice}>
                    <NumberInput
                        value={formData.unitPrice}
                        onChange={(val) => handleChange('unitPrice', val ?? 0)}
                        min={0}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Para Birimi" span={4} required>
                    <Select
                        value={formData.currency}
                        onChange={(val) => handleChange('currency', val)}
                        options={[
                            { value: 'TRY', label: 'TRY' },
                            { value: 'USD', label: 'USD' },
                            { value: 'EUR', label: 'EUR' }
                        ]}
                        disabled={loading}
                    />
                </FormField>

                <FormField label="Birim" span={4}>
                    <Select
                        value={formData.unit}
                        onChange={(val) => handleChange('unit', val)}
                        options={[
                            { value: 'Adet', label: 'Adet' },
                            { value: 'Saat', label: 'Saat' },
                            { value: 'Ay', label: 'Ay' },
                            { value: 'Yıl', label: 'Yıl' },
                            { value: 'Kg', label: 'Kg' },
                            { value: 'Lt', label: 'Lt' },
                            { value: 'Metre', label: 'Metre' },
                        ]}
                        disabled={loading}
                        showSearch
                    />
                </FormField>

                <FormField label="KDV Oranı (%)" span={6}>
                    <NumberInput
                        value={formData.taxRate}
                        onChange={(val) => handleChange('taxRate', val ?? 0)}
                        min={0}
                        max={100}
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
            </FormSection>

        </form>
    );
});

export default SalesProductForm;
