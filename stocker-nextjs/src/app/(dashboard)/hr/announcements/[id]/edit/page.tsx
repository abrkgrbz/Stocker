'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, DatePicker, Select, Switch, message } from 'antd';
import { BellIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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
      message.success('Duyuru basariyla guncellendi');
      router.push(`/hr/announcements/${id}`);
    } catch (error) {
      message.error('Guncelleme sirasinda bir hata olustu');
    }
  };

  return (
    <FormPageLayout
      title="Duyuru Duzenle"
      subtitle={announcement?.title || 'Yukleniyor...'}
      icon={<BellIcon className="w-5 h-5" />}
      cancelPath={`/hr/announcements/${id}`}
      loading={updateAnnouncement.isPending}
      onSave={() => form.submit()}
      saveButtonText="Guncelle"
      isDataLoading={isLoading}
      dataError={!!error || !announcement}
      errorMessage="Duyuru Bulunamadi"
      errorDescription="Istenen duyuru bulunamadi veya bir hata olustu."
      maxWidth="max-w-4xl"
    >
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Duyuru Icerigi */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Duyuru Icerigi
            </h2>
            <div className="space-y-4">
              <Form.Item
                name="title"
                label={<span className="text-sm text-slate-700">Duyuru Basligi</span>}
                rules={[{ required: true, message: 'Baslik zorunludur' }]}
              >
                <Input placeholder="Duyuru basligi girin" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="content"
                label={<span className="text-sm text-slate-700">Icerik</span>}
                rules={[{ required: true, message: 'Icerik zorunludur' }]}
              >
                <TextArea rows={6} placeholder="Duyuru icerigini girin" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="summary"
                label={<span className="text-sm text-slate-700">Ozet</span>}
              >
                <TextArea rows={2} placeholder="Kisa ozet (opsiyonel)" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Oncelik ve Tarihler */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Oncelik ve Tarihler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="priority"
                label={<span className="text-sm text-slate-700">Oncelik</span>}
              >
                <Select
                  placeholder="Oncelik secin"
                  className="w-full"
                  options={[
                    { value: 'Low', label: 'Dusuk' },
                    { value: 'Normal', label: 'Normal' },
                    { value: 'High', label: 'Yuksek' },
                    { value: 'Urgent', label: 'Acil' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="publishDate"
                label={<span className="text-sm text-slate-700">Yayin Tarihi</span>}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih secin"
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="expiryDate"
                label={<span className="text-sm text-slate-700">Bitis Tarihi</span>}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih secin"
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
                label={<span className="text-sm text-slate-700">Sabitlenmis</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="requiresAcknowledgment"
                label={<span className="text-sm text-slate-700">Onay Gerekli</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </FormPageLayout>
  );
}
