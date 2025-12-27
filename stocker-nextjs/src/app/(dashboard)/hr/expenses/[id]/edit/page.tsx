'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Select, DatePicker, InputNumber, Input, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useExpense, useUpdateExpense } from '@/lib/api/hooks/useHR';
import type { UpdateExpenseDto } from '@/lib/api/services/hr.types';
import { ExpenseStatus, ExpenseType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: expense, isLoading, error } = useExpense(id);
  const updateExpense = useUpdateExpense();

  // Populate form when expense data loads
  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        expenseDate: expense.expenseDate ? dayjs(expense.expenseDate) : null,
        expenseType: expense.expenseType,
        amount: expense.amount,
        description: expense.description,
        merchantName: expense.merchantName,
        receiptNumber: expense.receiptNumber,
        notes: expense.notes,
      });
    }
  }, [expense, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateExpenseDto = {
        description: values.description,
        amount: values.amount,
        expenseType: values.expenseType,
        expenseDate: values.expenseDate?.format('YYYY-MM-DD'),
        merchantName: values.merchantName,
        receiptNumber: values.receiptNumber,
        notes: values.notes,
      };

      await updateExpense.mutateAsync({ id, data });
      message.success('Harcama başarıyla güncellendi');
      router.push(`/hr/expenses/${id}`);
    } catch (error) {
      message.error('Güncelleme sırasında bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </PageContainer>
    );
  }

  if (error || !expense) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Harcama kaydı bulunamadı</p>
          <Link href="/hr/expenses" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (expense.status !== ExpenseStatus.Pending) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Bu harcama kaydı düzenlenemez. Sadece bekleyen harcamalar düzenlenebilir.</p>
          <Link href={`/hr/expenses/${id}`} className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Detaya Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/hr/expenses/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <WalletIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Harcama Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">
              {expense.employeeName || `Çalışan #${expense.employeeId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Form Kartı */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Harcama Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Harcama Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="expenseDate"
                label={<span className="text-sm text-slate-700">Harcama Tarihi</span>}
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="expenseType"
                label={<span className="text-sm text-slate-700">Harcama Türü</span>}
                rules={[{ required: true, message: 'Harcama türü zorunludur' }]}
              >
                <Select
                  placeholder="Harcama türü seçin"
                  className="w-full"
                  options={[
                    { value: ExpenseType.Transportation, label: 'Ulaşım' },
                    { value: ExpenseType.Meal, label: 'Yemek' },
                    { value: ExpenseType.Accommodation, label: 'Konaklama' },
                    { value: ExpenseType.Communication, label: 'İletişim' },
                    { value: ExpenseType.OfficeSupplies, label: 'Ofis Malzemeleri' },
                    { value: ExpenseType.Training, label: 'Eğitim' },
                    { value: ExpenseType.Medical, label: 'Sağlık' },
                    { value: ExpenseType.Entertainment, label: 'Eğlence' },
                    { value: ExpenseType.Other, label: 'Diğer' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="amount"
                label={<span className="text-sm text-slate-700">Tutar</span>}
                rules={[{ required: true, message: 'Tutar zorunludur' }]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="merchantName"
                label={<span className="text-sm text-slate-700">İşyeri Adı</span>}
              >
                <Input placeholder="İşyeri adı" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="receiptNumber"
                label={<span className="text-sm text-slate-700">Fiş/Fatura No</span>}
              >
                <Input placeholder="Fiş veya fatura numarası" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Açıklama ve Notlar */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Açıklama ve Notlar
            </h2>
            <div className="space-y-4">
              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama</span>}
                rules={[{ required: true, message: 'Açıklama zorunludur' }]}
              >
                <Input placeholder="Harcama açıklaması" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="notes"
                label={<span className="text-sm text-slate-700">Ek Notlar</span>}
              >
                <TextArea rows={3} placeholder="Ek notlar (opsiyonel)" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/hr/expenses/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={updateExpense.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateExpense.isPending ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
