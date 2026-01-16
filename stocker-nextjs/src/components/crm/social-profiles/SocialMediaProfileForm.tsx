'use client';

import React from 'react';
import { Form, Input, Select, Switch } from 'antd';
import type { FormInstance } from 'antd';
import {
  UserIcon,
  GlobeAltIcon,
  HashtagIcon,
  UserGroupIcon,
  HeartIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { SocialMediaPlatform, SocialMediaProfileDto } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';

const platformOptions = [
  { value: SocialMediaPlatform.Facebook, label: 'Facebook', icon: '📘' },
  { value: SocialMediaPlatform.Instagram, label: 'Instagram', icon: '📸' },
  { value: SocialMediaPlatform.Twitter, label: 'Twitter/X', icon: '🐦' },
  { value: SocialMediaPlatform.LinkedIn, label: 'LinkedIn', icon: '💼' },
  { value: SocialMediaPlatform.YouTube, label: 'YouTube', icon: '🎬' },
  { value: SocialMediaPlatform.TikTok, label: 'TikTok', icon: '🎵' },
  { value: SocialMediaPlatform.Pinterest, label: 'Pinterest', icon: '📌' },
  { value: SocialMediaPlatform.WhatsApp, label: 'WhatsApp', icon: '💬' },
  { value: SocialMediaPlatform.Telegram, label: 'Telegram', icon: '✈️' },
  { value: SocialMediaPlatform.Other, label: 'Diger', icon: '🌐' },
];

interface SocialMediaProfileFormProps {
  form: FormInstance;
  initialValues?: Partial<SocialMediaProfileDto>;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SocialMediaProfileForm({
  form,
  initialValues,
  onFinish,
  loading,
}: SocialMediaProfileFormProps) {
  const { data: customersData } = useCustomers({ page: 1, pageSize: 100 });

  const customers = customersData?.items || [];

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.companyName,
  }));

  // Use initial values as-is
  const formattedInitialValues = initialValues || undefined;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={formattedInitialValues}
      className="space-y-6"
    >
      {/* Platform Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <GlobeAltIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Platform Bilgileri
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="platform"
            label={<span className="text-slate-700 font-medium">Platform</span>}
            rules={[{ required: true, message: 'Platform secimi zorunludur' }]}
          >
            <Select
              placeholder="Platform seciniz"
              className="w-full"
              options={platformOptions.map((p) => ({
                value: p.value,
                label: (
                  <span className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </span>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="username"
            label={<span className="text-slate-700 font-medium">Kullanici Adi</span>}
            rules={[{ required: true, message: 'Kullanici adi zorunludur' }]}
          >
            <Input
              prefix={<span className="text-slate-400">@</span>}
              placeholder="kullanici_adi"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="profileUrl"
            label={<span className="text-slate-700 font-medium">Profil URL</span>}
          >
            <Input
              prefix={<LinkIcon className="w-4 h-4 text-slate-400" />}
              placeholder="https://..."
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="displayName"
            label={<span className="text-slate-700 font-medium">Gorunen Ad</span>}
          >
            <Input
              prefix={<UserIcon className="w-4 h-4 text-slate-400" />}
              placeholder="Gorunen ad"
              className="rounded-md"
            />
          </Form.Item>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <HashtagIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Metrikler
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            name="followersCount"
            label={<span className="text-slate-700 font-medium">Takipci Sayisi</span>}
          >
            <Input
              type="number"
              prefix={<UserGroupIcon className="w-4 h-4 text-slate-400" />}
              placeholder="0"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="followingCount"
            label={<span className="text-slate-700 font-medium">Takip Edilen</span>}
          >
            <Input
              type="number"
              prefix={<UserGroupIcon className="w-4 h-4 text-slate-400" />}
              placeholder="0"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="engagementRate"
            label={<span className="text-slate-700 font-medium">Etkilesim Orani (%)</span>}
          >
            <Input
              type="number"
              step="0.01"
              prefix={<HeartIcon className="w-4 h-4 text-slate-400" />}
              placeholder="0.00"
              className="rounded-md"
            />
          </Form.Item>

        </div>
      </div>

      {/* Association Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Iliskilendirme
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Form.Item
            name="customerId"
            label={<span className="text-slate-700 font-medium">Musteri</span>}
          >
            <Select
              placeholder="Musteri seciniz"
              className="w-full"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={customerOptions}
            />
          </Form.Item>
        </div>

        <div className="mt-4">
          <Form.Item
            name="isVerified"
            valuePropName="checked"
            label={<span className="text-slate-700 font-medium">Dogrulanmis Hesap</span>}
          >
            <Switch />
          </Form.Item>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <HashtagIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Notlar
          </h3>
        </div>

        <Form.Item name="notes">
          <Input.TextArea
            rows={4}
            placeholder="Profil hakkinda notlar..."
            className="rounded-md"
          />
        </Form.Item>
      </div>
    </Form>
  );
}
