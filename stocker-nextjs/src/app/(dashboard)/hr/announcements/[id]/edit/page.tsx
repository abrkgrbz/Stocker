'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, DatePicker, Select, Switch, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAnnouncement, useUpdateAnnouncement } from '@/lib/api/hooks/useHR';
import type { UpdateAnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: announcement, isLoading, error } = useAnnouncement(id);
  const updateAnnouncement = useUpdateAnnouncement();

  // Populate form when announcement data loads
  useEffect(() => {
    if (announcement) {
      form.setFieldsValue({
        title: announcement.title,
        content: announcement.content,
        summary: announcement.summary,
        announcementType: announcement.announcementType,
        priority: announcement.priority,
        publishDate: announcement.publishDate ? dayjs(announcement.publishDate) : null,
        expiryDate: announcement.expiryDate ? dayjs(announcement.expiryDate) : null,
        isPinned: announcement.isPinned,
        requiresAcknowledgment: announcement.requiresAcknowledgment,
        targetDepartmentId: announcement.targetDepartmentId,
      });
    }
  }, [announcement, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateAnnouncementDto = {
        title: values.title,
        content: values.content,
        summary: values.summary,
        announcementType: values.announcementType || 'General',
        priority: values.priority || 'Normal',
        publishDate: values.publishDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        isPinned: values.isPinned || false,
        requiresAcknowledgment: values.requiresAcknowledgment || false,
        targetDepartmentId: values.targetDepartmentId,
      };

      await updateAnnouncement.mutateAsync({ id, data });
      message.success('Duyuru başarıyla güncellendi');
      router.push(`/hr/announcements/${id}`);
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

  if (error || !announcement) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Duyuru bulunamadı</p>
          <Link href="/hr/announcements" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
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
          href={`/hr/announcements/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Duyuru Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-medium">{announcement.title}</span> duyurusunu düzenliyorsunuz
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
          {/* Duyuru İçeriği */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Duyuru İçeriği
            </h2>
            <div className="space-y-4">
              <Form.Item
                name="title"
                label={<span className="text-sm text-slate-700">Duyuru Başlığı</span>}
                rules={[{ required: true, message: 'Başlık zorunludur' }]}
              >
                <Input placeholder="Duyuru başlığı girin" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="content"
                label={<span className="text-sm text-slate-700">İçerik</span>}
                rules={[{ required: true, message: 'İçerik zorunludur' }]}
              >
                <TextArea rows={6} placeholder="Duyuru içeriğini girin" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="summary"
                label={<span className="text-sm text-slate-700">Özet</span>}
              >
                <TextArea rows={2} placeholder="Kısa özet (opsiyonel)" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Öncelik ve Tarihler */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Öncelik ve Tarihler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="priority"
                label={<span className="text-sm text-slate-700">Öncelik</span>}
              >
                <Select
                  placeholder="Öncelik seçin"
                  className="w-full"
                  options={[
                    { value: 'Low', label: 'Düşük' },
                    { value: 'Normal', label: 'Normal' },
                    { value: 'High', label: 'Yüksek' },
                    { value: 'Urgent', label: 'Acil' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="publishDate"
                label={<span className="text-sm text-slate-700">Yayın Tarihi</span>}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="expiryDate"
                label={<span className="text-sm text-slate-700">Bitiş Tarihi</span>}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                />
              </Form.Item>
            </div>
          </div>

          {/* Ayarlar */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Ayarlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="isPinned"
                label={<span className="text-sm text-slate-700">Sabitlenmiş</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="requiresAcknowledgment"
                label={<span className="text-sm text-slate-700">Onay Gerekli</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/hr/announcements/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={updateAnnouncement.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateAnnouncement.isPending ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
