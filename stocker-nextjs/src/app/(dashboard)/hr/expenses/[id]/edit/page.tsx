'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Select, DatePicker, InputNumber, Input, Row, Col, Spin, Empty } from 'antd';
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
      router.push(`/hr/expenses/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="p-6">
        <Empty description="Harcama kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/expenses')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  if (expense.status !== ExpenseStatus.Pending) {
    return (
      <div className="p-6">
        <Empty description="Bu harcama kaydı düzenlenemez. Sadece bekleyen harcamalar düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/hr/expenses/${id}`)}>Detaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/expenses/${id}`)}
            />
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4" className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Harcama Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {expense.employeeName || `Çalışan #${expense.employeeId}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/expenses/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateExpense.isPending}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Employee & Date */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Harcama Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="expenseDate"
                    label="Harcama Tarihi"
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker
                      format="DD.MM.YYYY"
                      style={{ width: '100%' }}
                      placeholder="Tarih seçin"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="expenseType"
                    label="Harcama Türü"
                    rules={[{ required: true, message: 'Harcama türü gerekli' }]}
                  >
                    <Select
                      placeholder="Harcama türü seçin"
                      variant="filled"
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
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="amount"
                    label="Tutar"
                    rules={[{ required: true, message: 'Tutar gerekli' }]}
                  >
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="merchantName" label="İşyeri Adı">
                    <Input placeholder="İşyeri adı" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="receiptNumber" label="Fiş/Fatura No">
                    <Input placeholder="Fiş veya fatura numarası" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Açıklama ve Notlar
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item
                name="description"
                label="Açıklama"
                rules={[{ required: true, message: 'Açıklama gerekli' }]}
              >
                <Input placeholder="Harcama açıklaması" variant="filled" />
              </Form.Item>
              <Form.Item name="notes" label="Ek Notlar" className="mb-0">
                <TextArea rows={3} placeholder="Ek notlar" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
