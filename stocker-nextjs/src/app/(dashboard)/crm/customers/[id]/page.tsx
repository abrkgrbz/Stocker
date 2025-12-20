'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty, Modal, Form, Input, InputNumber, Tabs, Timeline, Card, Skeleton } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShopOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  TagOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  FileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useCustomer, useUpdateCustomer, useActivities } from '@/lib/api/hooks/useCRM';
import { DocumentUpload } from '@/components/crm/shared';
import { CustomerTags } from '@/components/crm/customers';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');
  const [form] = Form.useForm();

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  // Fetch customer activities
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    customerId: customerId,
  });

  // Handle edit customer
  const handleEdit = async (values: any) => {
    try {
      await updateCustomer.mutateAsync({
        id: customerId,
        data: values,
      });
      showSuccess('Müşteri bilgileri başarıyla güncellendi!');
      setIsEditModalOpen(false);
    } catch (error) {
      showApiError(error, 'Müşteri güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Müşteri bulunamadı" />
      </div>
    );
  }

  // Calculate health score
  const healthScore = Math.min(100, Math.round((customer.isActive ? 70 : 30) + 30));

  // Activity helpers
  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Call: <PhoneOutlined />,
      Email: <MailOutlined />,
      Meeting: <TeamOutlined />,
      Task: <FileTextOutlined />,
      Note: <FileTextOutlined />,
      Document: <FileOutlined />,
    };
    return iconMap[type] || <ClockCircleOutlined />;
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'Completed') return 'green';
    if (status === 'Cancelled') return 'red';
    const colorMap: Record<string, string> = {
      Call: 'blue',
      Email: 'cyan',
      Meeting: 'green',
      Task: 'orange',
      Note: 'gray',
      Document: 'purple',
    };
    return colorMap[type] || 'blue';
  };

  const timelineData = activitiesData?.items?.map((activity: any) => ({
    color: getActivityColor(activity.type, activity.status),
    icon: getActivityIcon(activity.type),
    title: activity.subject || activity.title,
    description: activity.description || `${activity.type} aktivitesi`,
    time: dayjs(activity.createdAt).fromNow(),
    status: activity.status,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/crm/customers')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${customer.isActive ? 'bg-blue-600' : 'bg-slate-400'}`}>
                <ShopOutlined className="text-white text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{customer.companyName}</h1>
                  <Tag
                    icon={customer.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      customer.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{customer.email}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  companyName: customer.companyName,
                  email: customer.email,
                  phone: customer.phone,
                  website: customer.website,
                  industry: customer.industry,
                  address: customer.address,
                  city: customer.city,
                  state: customer.state,
                  country: customer.country,
                  postalCode: customer.postalCode,
                  annualRevenue: customer.annualRevenue,
                  numberOfEmployees: customer.numberOfEmployees,
                  description: customer.description,
                });
                setIsEditModalOpen(true);
              }}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Company Info Section - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Firma Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Firma Adı</p>
                  <p className="text-sm font-medium text-slate-900">{customer.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">E-posta</p>
                  <a href={`mailto:${customer.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {customer.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Telefon</p>
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {customer.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={customer.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      customer.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                {customer.industry && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sektör</p>
                    <Tag color="blue" className="m-0">{customer.industry}</Tag>
                  </div>
                )}
                {customer.numberOfEmployees && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Çalışan Sayısı</p>
                    <p className="text-sm font-medium text-slate-900">{customer.numberOfEmployees}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {customer.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-slate-400" />
                    <p className="text-xs text-slate-400 m-0">Açıklama</p>
                  </div>
                  <p className="text-sm text-slate-700">{customer.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Score Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Müşteri Sağlığı
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                    healthScore >= 70
                      ? 'bg-emerald-100 text-emerald-600'
                      : healthScore >= 50
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {healthScore}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-3">
                  {healthScore >= 70 ? 'Mükemmel' : healthScore >= 50 ? 'İyi' : 'Geliştirilmeli'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Genel Skor</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Kişi Sayısı</span>
                  <span className="font-medium text-slate-900">{customer.contacts?.length || 0}</span>
                </div>
                {customer.annualRevenue && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500">Yıllık Gelir</span>
                    <span className="font-medium text-slate-900">₺{customer.annualRevenue.toLocaleString('tr-TR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TagOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Etiketler
                </p>
              </div>
              <CustomerTags customerId={String(customer.id)} editable={true} size="default" />
            </div>
          </div>

          {/* Contact & Address Section */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <EnvironmentOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Adres Bilgileri
                </p>
              </div>
              <div className="space-y-4">
                {customer.address && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Adres</p>
                    <p className="text-sm font-medium text-slate-900">{customer.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Şehir</p>
                    <p className="text-sm font-medium text-slate-900">{customer.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">İlçe</p>
                    <p className="text-sm font-medium text-slate-900">{customer.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ülke</p>
                    <p className="text-sm font-medium text-slate-900">{customer.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Posta Kodu</p>
                    <p className="text-sm font-medium text-slate-900">{customer.postalCode || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Website & Timestamps Section */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>

              {/* Website */}
              {customer.website && (
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <GlobalOutlined className="text-slate-600 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-0">Web Sitesi</p>
                      <a
                        href={customer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {customer.website}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(customer.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {customer.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(customer.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Section - Full Width */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Tab Header */}
              <div className="px-6 pt-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Detaylar
                </p>
              </div>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="customer-detail-tabs"
                tabBarStyle={{
                  margin: 0,
                  padding: '0 24px',
                  borderBottom: '1px solid #e2e8f0'
                }}
                items={[
                  {
                    key: 'activities',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <ClockCircleOutlined />
                        Aktiviteler
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {activitiesLoading ? (
                          <div className="space-y-4">
                            <Skeleton active />
                            <Skeleton active />
                          </div>
                        ) : timelineData.length === 0 ? (
                          <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                              <ClockCircleOutlined className="text-2xl text-slate-400" />
                            </div>
                            <p className="text-slate-500 mb-4">Henüz aktivite bulunmuyor</p>
                            <Button type="dashed" icon={<ClockCircleOutlined />}>
                              Yeni Aktivite Oluştur
                            </Button>
                          </div>
                        ) : (
                          <Timeline
                            items={timelineData.map((item: any) => ({
                              color: item.color,
                              dot: item.icon,
                              children: (
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-slate-800 m-0">{item.title}</p>
                                    <Tag color={item.color} className="m-0">{item.status}</Tag>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                                  <span className="text-xs text-slate-400">{item.time}</span>
                                </div>
                              ),
                            }))}
                          />
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'orders',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <ShoppingOutlined />
                        Siparişler
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <ShoppingOutlined className="text-2xl text-slate-400" />
                          </div>
                          <p className="text-slate-500 mb-4">Henüz sipariş bulunmuyor</p>
                          <Button type="primary" icon={<ShoppingOutlined />}>
                            Yeni Sipariş Oluştur
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'documents',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <FileOutlined />
                        Dokümanlar
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        <DocumentUpload
                          entityId={customer.id}
                          entityType="Customer"
                          maxFileSize={10}
                          allowedFileTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg']}
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'contacts',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <UserOutlined />
                        Kişiler
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <UserOutlined className="text-2xl text-slate-400" />
                          </div>
                          <p className="text-slate-500 mb-4">Henüz kişi bulunmuyor</p>
                          <Button type="dashed" icon={<UserOutlined />}>
                            Yeni Kişi Ekle
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            <span>Müşteri Bilgilerini Düzenle</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="companyName"
              label="Firma Adı"
              rules={[{ required: true, message: 'Firma adı gereklidir' }]}
            >
              <Input size="large" prefix={<ShopOutlined />} placeholder="Firma adı" />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta gereklidir' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
              ]}
            >
              <Input size="large" prefix={<MailOutlined />} placeholder="ornek@firma.com" />
            </Form.Item>

            <Form.Item name="phone" label="Telefon">
              <Input size="large" prefix={<PhoneOutlined />} placeholder="+90 555 123 4567" />
            </Form.Item>

            <Form.Item name="website" label="Website">
              <Input size="large" prefix={<GlobalOutlined />} placeholder="https://www.firma.com" />
            </Form.Item>

            <Form.Item name="industry" label="Sektör">
              <Input size="large" prefix={<ShopOutlined />} placeholder="Teknoloji" />
            </Form.Item>

            <Form.Item name="address" label="Adres">
              <Input size="large" prefix={<EnvironmentOutlined />} placeholder="Adres" />
            </Form.Item>

            <Form.Item name="city" label="Şehir">
              <Input size="large" prefix={<EnvironmentOutlined />} placeholder="İstanbul" />
            </Form.Item>

            <Form.Item name="state" label="İlçe">
              <Input size="large" placeholder="Kadıköy" />
            </Form.Item>

            <Form.Item name="country" label="Ülke">
              <Input size="large" placeholder="Türkiye" />
            </Form.Item>

            <Form.Item name="postalCode" label="Posta Kodu">
              <Input size="large" placeholder="34000" />
            </Form.Item>

            <Form.Item name="annualRevenue" label="Yıllık Gelir (₺)">
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                min={0}
                step={1000}
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number((value || '').replace(/₺\s?|(,*)/g, '')) as any}
                placeholder="1,000,000"
              />
            </Form.Item>

            <Form.Item name="numberOfEmployees" label="Çalışan Sayısı">
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                min={0}
                step={1}
                placeholder="50"
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={4} placeholder="Müşteri hakkında notlar..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button size="large" onClick={() => setIsEditModalOpen(false)}>
              İptal
            </Button>
            <Button type="primary" size="large" htmlType="submit" icon={<EditOutlined />} loading={updateCustomer.isPending}>
              Güncelle
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
