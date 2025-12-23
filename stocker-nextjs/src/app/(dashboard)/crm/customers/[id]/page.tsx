'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty, Modal, Form, Input, InputNumber, Tabs, Timeline, Card, Skeleton, Table, Select, DatePicker, Tooltip, Checkbox } from 'antd';
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
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useCustomer, useUpdateCustomer, useActivities, useContactsByCustomer, useCreateContact, useUpdateContact, useDeleteContact, useSetContactAsPrimary } from '@/lib/api/hooks/useCRM';
import type { Contact, CreateContactCommand, UpdateContactCommand } from '@/lib/api/services/crm.service';
import { useSalesOrdersByCustomer, useCreateSalesOrder } from '@/lib/api/hooks/useSales';
import { useProducts } from '@/lib/api/hooks/useInventory';
import { useModuleCodes } from '@/lib/api/hooks/useUserModules';
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState('activities');
  const [orderItems, setOrderItems] = useState<Array<{
    productId: string;
    productCode: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    discountRate: number;
  }>>([]);
  const [form] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [contactForm] = Form.useForm();

  // Module access check
  const { hasModule, isLoading: modulesLoading } = useModuleCodes();
  const canCreateOrder = hasModule('Sales') && hasModule('Inventory');

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();
  const createOrder = useCreateSalesOrder();

  // Fetch customer activities
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    customerId: customerId,
  });

  // Fetch customer orders (only if Sales module is available)
  const { data: ordersData, isLoading: ordersLoading } = useSalesOrdersByCustomer(
    customerId,
    1,
    10
  );

  // Fetch products for order creation (only if Inventory module is available)
  const { data: productsData, isLoading: productsLoading } = useProducts(false);

  // Fetch customer contacts (only for Corporate customers)
  // DEBUG: Temporarily fetch for all customers
  const { data: contactsData, isLoading: contactsLoading } = useContactsByCustomer(customerId);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const setContactAsPrimary = useSetContactAsPrimary();

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

  // Handle create order
  const handleCreateOrder = async (values: any) => {
    try {
      if (orderItems.length === 0) {
        showApiError(new Error('En az bir ürün eklemeniz gerekmektedir'), 'Sipariş oluşturulamadı');
        return;
      }

      await createOrder.mutateAsync({
        orderDate: values.orderDate?.toISOString() || new Date().toISOString(),
        customerId: customerId,
        customerName: customer?.companyName || '',
        customerEmail: customer?.email,
        currency: 'TRY',
        notes: values.notes,
        items: orderItems.map((item, index) => ({
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate,
        })),
      });

      showSuccess('Sipariş başarıyla oluşturuldu!');
      setIsOrderModalOpen(false);
      setOrderItems([]);
      orderForm.resetFields();
    } catch (error) {
      showApiError(error, 'Sipariş oluşturulurken bir hata oluştu');
    }
  };

  // Add product to order items
  const handleAddProduct = (productId: string) => {
    const products = Array.isArray(productsData) ? productsData : [];
    const product = products.find((p: any) => p.id === productId || p.id?.toString() === productId);
    if (product && !orderItems.find(item => item.productId === productId)) {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id?.toString() || productId,
          productCode: product.code || product.sku || '',
          productName: product.name,
          unit: product.unitName || product.unitSymbol || 'Adet',
          quantity: 1,
          unitPrice: product.unitPrice || 0,
          vatRate: 20,
          discountRate: 0,
        },
      ]);
    }
  };

  // Update order item
  const handleUpdateOrderItem = (productId: string, field: string, value: number) => {
    setOrderItems(
      orderItems.map(item =>
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );
  };

  // Remove product from order items
  const handleRemoveProduct = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  // Calculate order totals
  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * (item.discountRate / 100);
      const afterDiscount = subtotal - discount;
      const vat = afterDiscount * (item.vatRate / 100);
      return total + afterDiscount + vat;
    }, 0);
  };

  // Contact handlers
  const handleOpenContactModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      contactForm.setFieldsValue({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        mobilePhone: contact.mobilePhone,
        jobTitle: contact.jobTitle,
        department: contact.department,
        isPrimary: contact.isPrimary,
        notes: contact.notes,
      });
    } else {
      setEditingContact(null);
      contactForm.resetFields();
    }
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setEditingContact(null);
    contactForm.resetFields();
  };

  const handleSaveContact = async (values: any) => {
    try {
      if (editingContact) {
        await updateContact.mutateAsync({
          id: editingContact.id,
          data: values as UpdateContactCommand,
        });
        showSuccess('Kişi başarıyla güncellendi!');
      } else {
        await createContact.mutateAsync({
          ...values,
          customerId: customerId,
        } as CreateContactCommand);
        showSuccess('Kişi başarıyla eklendi!');
      }
      handleCloseContactModal();
    } catch (error) {
      showApiError(error, editingContact ? 'Kişi güncellenirken bir hata oluştu' : 'Kişi eklenirken bir hata oluştu');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact.mutateAsync({ id: contactId, customerId: customerId });
      showSuccess('Kişi başarıyla silindi!');
    } catch (error) {
      showApiError(error, 'Kişi silinirken bir hata oluştu');
    }
  };

  const handleSetPrimaryContact = async (contactId: string) => {
    try {
      await setContactAsPrimary.mutateAsync(contactId);
      showSuccess('Birincil kişi başarıyla belirlendi!');
    } catch (error) {
      showApiError(error, 'Birincil kişi belirlenirken bir hata oluştu');
    }
  };

  // Order status helpers
  const getOrderStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      Draft: 'default',
      Confirmed: 'processing',
      Approved: 'blue',
      Shipped: 'cyan',
      Delivered: 'green',
      Completed: 'success',
      Cancelled: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getOrderStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      Draft: 'Taslak',
      Confirmed: 'Onaylandı',
      Approved: 'Onaylandı',
      Shipped: 'Sevk Edildi',
      Delivered: 'Teslim Edildi',
      Completed: 'Tamamlandı',
      Cancelled: 'İptal',
    };
    return textMap[status] || status;
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
                        {timelineData.length > 0 && (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                            {timelineData.length}
                          </span>
                        )}
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50">
                              <ClockCircleOutlined className="text-purple-600 text-lg" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-slate-900 m-0">Aktiviteler</h3>
                                {timelineData.length > 0 && (
                                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {timelineData.length}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 m-0">Müşteri ile ilgili tüm aktiviteler</p>
                            </div>
                          </div>
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            <PlusOutlined />
                            Yeni Aktivite
                          </button>
                        </div>

                        {/* Activities List */}
                        {activitiesLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : timelineData.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                              <ClockCircleOutlined className="text-xl" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">Aktivite bulunmuyor</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm">
                              Bu müşteri için henüz aktivite kaydı oluşturulmamış.
                            </p>
                            <button
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <PlusOutlined />
                              İlk Aktiviteyi Oluştur
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                            {timelineData.map((item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  item.color === 'blue' ? 'bg-blue-50' :
                                  item.color === 'green' ? 'bg-green-50' :
                                  item.color === 'orange' ? 'bg-orange-50' :
                                  item.color === 'red' ? 'bg-red-50' :
                                  item.color === 'purple' ? 'bg-purple-50' : 'bg-slate-100'
                                }`}>
                                  {item.icon || <ClockCircleOutlined className={`text-lg ${
                                    item.color === 'blue' ? 'text-blue-600' :
                                    item.color === 'green' ? 'text-green-600' :
                                    item.color === 'orange' ? 'text-orange-600' :
                                    item.color === 'red' ? 'text-red-600' :
                                    item.color === 'purple' ? 'text-purple-600' : 'text-slate-500'
                                  }`} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-sm font-medium text-slate-900">{item.title}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      item.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                                      item.color === 'green' ? 'bg-green-50 text-green-700' :
                                      item.color === 'orange' ? 'bg-orange-50 text-orange-700' :
                                      item.color === 'red' ? 'bg-red-50 text-red-700' :
                                      item.color === 'purple' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-1">{item.description}</p>
                                  <span className="text-xs text-slate-400">{item.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
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
                        {ordersData?.totalCount ? (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                            {ordersData.totalCount}
                          </span>
                        ) : null}
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Module access check */}
                        {!canCreateOrder && !modulesLoading && (
                          <div className="mb-6 p-4 bg-amber-50/50 border border-amber-200/50 rounded-lg flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-amber-100">
                              <LockOutlined className="text-amber-600 text-sm" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800 m-0">Sipariş Oluşturma Kısıtlı</p>
                              <p className="text-xs text-amber-600 m-0">
                                Sipariş oluşturmak için Satış ve Envanter modüllerine erişim gereklidir.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                              <ShoppingOutlined className="text-blue-600 text-lg" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-slate-900 m-0">Siparişler</h3>
                                {ordersData?.totalCount ? (
                                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {ordersData.totalCount}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-slate-500 m-0">Bu müşteriye ait siparişler</p>
                            </div>
                          </div>
                          {canCreateOrder && (
                            <button
                              onClick={() => setIsOrderModalOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                            >
                              <PlusOutlined />
                              Yeni Sipariş
                            </button>
                          )}
                        </div>

                        {/* Orders list */}
                        {ordersLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : !ordersData?.items?.length ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                              <ShoppingOutlined className="text-xl" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">Sipariş bulunmuyor</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm">
                              Bu müşteri için henüz sipariş oluşturulmamış.
                            </p>
                            {canCreateOrder && (
                              <button
                                onClick={() => setIsOrderModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                              >
                                <PlusOutlined />
                                İlk Siparişi Oluştur
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                            {ordersData.items.map((order: any) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/sales/orders/${order.id}`)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
                                    <ShoppingOutlined className="text-slate-500" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-900">{order.orderNumber}</span>
                                      <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                          backgroundColor: getOrderStatusColor(order.status) === 'default' ? '#64748b15' :
                                            getOrderStatusColor(order.status) === 'processing' ? '#3b82f615' :
                                            getOrderStatusColor(order.status) === 'blue' ? '#3b82f615' :
                                            getOrderStatusColor(order.status) === 'cyan' ? '#06b6d415' :
                                            getOrderStatusColor(order.status) === 'green' ? '#10b98115' :
                                            getOrderStatusColor(order.status) === 'red' ? '#ef444415' : '#64748b15',
                                          color: getOrderStatusColor(order.status) === 'default' ? '#64748b' :
                                            getOrderStatusColor(order.status) === 'processing' ? '#3b82f6' :
                                            getOrderStatusColor(order.status) === 'blue' ? '#3b82f6' :
                                            getOrderStatusColor(order.status) === 'cyan' ? '#06b6d4' :
                                            getOrderStatusColor(order.status) === 'green' ? '#10b981' :
                                            getOrderStatusColor(order.status) === 'red' ? '#ef4444' : '#64748b',
                                        }}
                                      >
                                        {getOrderStatusText(order.status)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-xs text-slate-500">
                                        {dayjs(order.orderDate).format('DD MMM YYYY')}
                                      </span>
                                      <span className="text-xs text-slate-300">•</span>
                                      <span className="text-xs font-medium text-slate-700">
                                        {new Intl.NumberFormat('tr-TR', {
                                          style: 'currency',
                                          currency: order.currency || 'TRY',
                                        }).format(order.totalAmount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/sales/orders/${order.id}`);
                                    }}
                                  >
                                    <EyeOutlined />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                  // Contacts tab - shown for all customers
                  {
                    key: 'contacts',
                    label: (
                      <span className="flex items-center gap-2 py-1">
                        <UserOutlined />
                        Kişiler
                        {contactsData && contactsData.length > 0 && (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                            {contactsData.length}
                          </span>
                        )}
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50">
                              <UserOutlined className="text-indigo-600 text-lg" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-slate-900 m-0">Kişiler</h3>
                                {contactsData?.length ? (
                                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {contactsData.length}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-slate-500 m-0">Firmaya ait iletişim kişileri</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenContactModal()}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            <PlusOutlined />
                            Yeni Kişi
                          </button>
                        </div>

                        {/* Contacts list */}
                        {contactsLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : !contactsData?.length ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                              <UserOutlined className="text-xl" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">Kişi bulunmuyor</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm">
                              Bu firma için henüz kişi eklenmemiş.
                            </p>
                            <button
                              onClick={() => handleOpenContactModal()}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <PlusOutlined />
                              İlk Kişiyi Ekle
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                            {contactsData.map((contact: Contact) => (
                              <div
                                key={contact.id}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${contact.isPrimary ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                    <UserOutlined className={contact.isPrimary ? 'text-indigo-600' : 'text-slate-500'} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-900">{contact.fullName}</span>
                                      {contact.isPrimary && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                          Birincil
                                        </span>
                                      )}
                                      {!contact.isActive && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                          Pasif
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {contact.jobTitle && (
                                        <>
                                          <span className="text-xs text-slate-500">{contact.jobTitle}</span>
                                          {(contact.email || contact.phone) && <span className="text-xs text-slate-300">•</span>}
                                        </>
                                      )}
                                      {contact.email && (
                                        <a href={`mailto:${contact.email}`} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                                          {contact.email}
                                        </a>
                                      )}
                                      {contact.phone && (
                                        <>
                                          {contact.email && <span className="text-xs text-slate-300">•</span>}
                                          <a href={`tel:${contact.phone}`} className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                                            {contact.phone}
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!contact.isPrimary && (
                                    <Tooltip title="Birincil Yap">
                                      <button
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                        onClick={() => handleSetPrimaryContact(contact.id)}
                                      >
                                        <CheckCircleOutlined />
                                      </button>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Düzenle">
                                    <button
                                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                      onClick={() => handleOpenContactModal(contact)}
                                    >
                                      <EditOutlined />
                                    </button>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <button
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      onClick={() => {
                                        Modal.confirm({
                                          title: 'Kişiyi Sil',
                                          content: `${contact.fullName} kişisini silmek istediğinize emin misiniz?`,
                                          okText: 'Sil',
                                          cancelText: 'İptal',
                                          okButtonProps: { danger: true },
                                          onOk: () => handleDeleteContact(contact.id),
                                        });
                                      }}
                                    >
                                      <DeleteOutlined />
                                    </button>
                                  </Tooltip>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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

      {/* Create Order Modal - Enterprise Design */}
      <Modal
        title={null}
        open={isOrderModalOpen}
        onCancel={() => {
          setIsOrderModalOpen(false);
          setOrderItems([]);
          orderForm.resetFields();
        }}
        footer={null}
        width={900}
        centered
        className="enterprise-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
            <ShoppingOutlined className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 m-0">Yeni Sipariş Oluştur</h2>
            <p className="text-sm text-slate-500 m-0">{customer?.companyName} için sipariş oluşturun</p>
          </div>
        </div>

        <Form
          form={orderForm}
          layout="vertical"
          onFinish={handleCreateOrder}
          className="mt-6"
          initialValues={{
            orderDate: dayjs(),
          }}
        >
          {/* Customer Info Card */}
          <div className="bg-slate-50/50 border border-slate-200/50 p-4 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
                <ShopOutlined className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 m-0">{customer?.companyName}</p>
                {customer?.email && <p className="text-xs text-slate-500 m-0">{customer.email}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sipariş Tarihi</label>
              <Form.Item
                name="orderDate"
                rules={[{ required: true, message: 'Sipariş tarihi gereklidir' }]}
                className="mb-0"
              >
                <DatePicker
                  className="w-full h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  format="DD/MM/YYYY"
                  placeholder="Tarih seçin"
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notlar</label>
              <Form.Item name="notes" className="mb-0">
                <Input
                  placeholder="Sipariş notu..."
                  className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                />
              </Form.Item>
            </div>
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Ürün Ekle</label>
            <Select
              showSearch
              placeholder="Ürün arayın ve seçin..."
              optionFilterProp="label"
              loading={productsLoading}
              className="w-full enterprise-select"
              value={null}
              onChange={(value) => value && handleAddProduct(value)}
              filterOption={(input, option) =>
                (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={(Array.isArray(productsData) ? productsData : []).map((product: any) => ({
                value: product.id?.toString(),
                label: `${product.code || product.sku || ''} - ${product.name}`,
                disabled: orderItems.some(item => item.productId === product.id?.toString()),
              }))}
            />
          </div>

          {/* Order Items - Enterprise Card List */}
          {orderItems.length > 0 ? (
            <div className="mb-6">
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {orderItems.map((item, index) => {
                  const subtotal = item.quantity * item.unitPrice;
                  const discount = subtotal * (item.discountRate / 100);
                  const afterDiscount = subtotal - discount;
                  const vat = afterDiscount * (item.vatRate / 100);
                  const total = afterDiscount + vat;

                  return (
                    <div key={item.productId} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-900">{item.productName}</span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                {item.productCode}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-3 mt-3">
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Miktar</label>
                                <InputNumber
                                  min={1}
                                  value={item.quantity}
                                  size="small"
                                  className="w-full"
                                  onChange={(val) => handleUpdateOrderItem(item.productId, 'quantity', val || 1)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Birim Fiyat</label>
                                <InputNumber
                                  min={0}
                                  value={item.unitPrice}
                                  size="small"
                                  className="w-full"
                                  formatter={(val) => `₺ ${val}`}
                                  parser={(val) => Number((val || '').replace('₺ ', '')) as any}
                                  onChange={(val) => handleUpdateOrderItem(item.productId, 'unitPrice', val || 0)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">İndirim %</label>
                                <InputNumber
                                  min={0}
                                  max={100}
                                  value={item.discountRate}
                                  size="small"
                                  className="w-full"
                                  onChange={(val) => handleUpdateOrderItem(item.productId, 'discountRate', val || 0)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Toplam</label>
                                <div className="h-[24px] flex items-center">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {new Intl.NumberFormat('tr-TR', {
                                      style: 'currency',
                                      currency: 'TRY',
                                    }).format(total)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleRemoveProduct(item.productId)}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Total Card */}
              <div className="mt-4 p-4 bg-slate-900 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10">
                      <DollarOutlined className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 m-0">Genel Toplam</p>
                      <p className="text-xs text-slate-500 m-0">{orderItems.length} ürün</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white m-0">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(calculateOrderTotal())}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 mb-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <ShoppingOutlined className="text-xl" />
              </div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">Ürün eklenmedi</h3>
              <p className="text-sm text-slate-500 max-w-sm text-center">
                Sipariş oluşturmak için yukarıdan ürün seçin
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsOrderModalOpen(false);
                setOrderItems([]);
                orderForm.resetFields();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={orderItems.length === 0 || createOrder.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrder.isPending ? (
                <Spin size="small" className="text-white" />
              ) : (
                <ShoppingOutlined />
              )}
              Sipariş Oluştur
            </button>
          </div>
        </Form>
      </Modal>

      {/* Contact Modal - Enterprise Design */}
      <Modal
        title={null}
        open={isContactModalOpen}
        onCancel={handleCloseContactModal}
        footer={null}
        width={700}
        centered
        className="enterprise-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingContact ? 'bg-amber-50' : 'bg-indigo-50'}`}>
            <UserOutlined className={`text-xl ${editingContact ? 'text-amber-600' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 m-0">
              {editingContact ? 'Kişi Düzenle' : 'Yeni Kişi Ekle'}
            </h2>
            <p className="text-sm text-slate-500 m-0">
              {editingContact ? `${editingContact.fullName} bilgilerini güncelleyin` : 'Firmaya yeni bir iletişim kişisi ekleyin'}
            </p>
          </div>
        </div>

        <Form
          form={contactForm}
          layout="vertical"
          onFinish={handleSaveContact}
          className="mt-6"
        >
          {/* Personal Info Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
                <UserOutlined className="text-slate-500 text-xs" />
              </div>
              <span className="text-sm font-medium text-slate-700">Kişisel Bilgiler</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ad <span className="text-red-500">*</span></label>
                <Form.Item
                  name="firstName"
                  rules={[{ required: true, message: 'Ad gereklidir' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ahmet"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Soyad <span className="text-red-500">*</span></label>
                <Form.Item
                  name="lastName"
                  rules={[{ required: true, message: 'Soyad gereklidir' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Yılmaz"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ünvan</label>
                <Form.Item name="jobTitle" className="mb-0">
                  <Input
                    placeholder="Satış Müdürü"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Departman</label>
                <Form.Item name="department" className="mb-0">
                  <Input
                    placeholder="Satış"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
                <PhoneOutlined className="text-slate-500 text-xs" />
              </div>
              <span className="text-sm font-medium text-slate-700">İletişim Bilgileri</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta <span className="text-red-500">*</span></label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta gereklidir' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                  className="mb-0"
                >
                  <Input
                    prefix={<MailOutlined className="text-slate-400" />}
                    placeholder="ahmet@firma.com"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400" />}
                    placeholder="+90 212 123 4567"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cep Telefonu</label>
                <Form.Item name="mobilePhone" className="mb-0">
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400" />}
                    placeholder="+90 555 123 4567"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
                <TagOutlined className="text-slate-500 text-xs" />
              </div>
              <span className="text-sm font-medium text-slate-700">Ayarlar</span>
            </div>
            <div className="bg-slate-50/50 border border-slate-200/50 p-4 rounded-xl">
              <Form.Item name="isPrimary" valuePropName="checked" className="mb-0">
                <div className="flex items-center gap-3">
                  <Checkbox className="enterprise-checkbox" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 m-0">Birincil Kişi olarak belirle</p>
                    <p className="text-xs text-slate-500 m-0">Bu kişi firma için ana iletişim kişisi olarak görüntülenecek</p>
                  </div>
                </div>
              </Form.Item>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100">
                <FileTextOutlined className="text-slate-500 text-xs" />
              </div>
              <span className="text-sm font-medium text-slate-700">Notlar</span>
            </div>
            <Form.Item name="notes" className="mb-0">
              <Input.TextArea
                rows={3}
                placeholder="Kişi hakkında notlar..."
                className="rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
              />
            </Form.Item>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCloseContactModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createContact.isPending || updateContact.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createContact.isPending || updateContact.isPending) ? (
                <Spin size="small" className="text-white" />
              ) : editingContact ? (
                <EditOutlined />
              ) : (
                <PlusOutlined />
              )}
              {editingContact ? 'Güncelle' : 'Kişi Ekle'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
