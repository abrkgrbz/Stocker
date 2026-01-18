'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty, Modal, Form, Input, InputNumber, Tabs, Timeline, Card, Skeleton, Table, Select, DatePicker, Tooltip, Checkbox } from 'antd';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  EyeIcon,
  GlobeAltIcon,
  IdentificationIcon,
  LockClosedIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TagIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCustomer, useUpdateCustomer, useActivities, useCreateActivity, useCallLogsByCustomer, useContactsByCustomer, useCreateContact, useUpdateContact, useDeleteContact, useSetContactAsPrimary } from '@/lib/api/hooks/useCRM';
import type { Contact, CreateContactCommand, UpdateContactCommand } from '@/lib/api/services/crm.service';
import { useSalesOrdersByCustomer, useCreateSalesOrder } from '@/lib/api/hooks/useSales';
import { useProducts } from '@/lib/api/hooks/useInventory';
import { useModuleCodes } from '@/lib/api/hooks/useUserModules';
import { DocumentUpload } from '@/components/crm/shared';
import { CustomerTags } from '@/components/crm/customers';
import { ActivityModal } from '@/features/activities/components';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// GUID format validation helper
const isValidGuid = (str: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  // Validate GUID format early
  const isValidId = customerId && isValidGuid(customerId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
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

  // Only fetch data if ID is valid GUID format
  const { data: customer, isLoading, error } = useCustomer(isValidId ? customerId : undefined);
  const updateCustomer = useUpdateCustomer();
  const createOrder = useCreateSalesOrder();

  // Fetch customer activities (only if ID is valid GUID)
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(
    isValidId ? { customerId: customerId } : {}
  );

  // Fetch customer call logs (only if ID is valid GUID)
  const { data: callLogsData, isLoading: callLogsLoading } = useCallLogsByCustomer(
    isValidId ? customerId : ''
  );

  // Fetch customer orders (only if Sales module is available and ID is valid GUID)
  const { data: ordersData, isLoading: ordersLoading } = useSalesOrdersByCustomer(
    isValidId ? customerId : '',
    1,
    10
  );

  // Fetch products for order creation (only if Inventory module is available)
  const { data: productsData, isLoading: productsLoading } = useProducts(false);

  // Fetch customer contacts (only if ID is valid GUID)
  const { data: contactsData, isLoading: contactsLoading } = useContactsByCustomer(
    isValidId ? customerId : undefined
  );
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const setContactAsPrimary = useSetContactAsPrimary();
  const createActivity = useCreateActivity();

  // Handle create activity
  const handleCreateActivity = async (values: any) => {
    try {
      await createActivity.mutateAsync(values);
      showSuccess('Aktivite başarıyla oluşturuldu');
      setIsActivityModalOpen(false);
    } catch (error) {
      showApiError(error, 'Aktivite oluşturulurken bir hata oluştu');
    }
  };

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

  // Check for invalid ID format early
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <Empty description="Geçersiz müşteri ID formatı" />
        <p className="text-sm text-slate-500">Müşteri ID'si geçerli bir GUID formatında olmalıdır.</p>
        <Button onClick={() => router.push('/crm/customers')}>
          Müşteri Listesine Dön
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !customer) {
    const errorMessage = error instanceof Error ? error.message : 'Müşteri bulunamadı';
    console.error('Customer fetch error:', error);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <Empty description={errorMessage} />
        <Button onClick={() => router.push('/crm/customers')}>
          Müşteri Listesine Dön
        </Button>
      </div>
    );
  }

  // Calculate health score
  const healthScore = Math.min(100, Math.round((customer.isActive ? 70 : 30) + 30));

  // Activity helpers
  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Call: <PhoneIcon className="w-4 h-4" />,
      Email: <EnvelopeIcon className="w-4 h-4" />,
      Meeting: <UserGroupIcon className="w-4 h-4" />,
      Task: <DocumentTextIcon className="w-4 h-4" />,
      Note: <DocumentTextIcon className="w-4 h-4" />,
      Document: <DocumentIcon className="w-4 h-4" />,
    };
    return iconMap[type] || <ClockIcon className="w-4 h-4" />;
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

  // Combine activities and call logs into unified timeline
  const activityItems = activitiesData?.items?.map((activity: any) => ({
    id: `activity-${activity.id}`,
    type: 'activity' as const,
    entityType: activity.type,
    color: getActivityColor(activity.type, activity.status),
    icon: getActivityIcon(activity.type),
    title: activity.subject || activity.title,
    description: activity.description || `${activity.type} aktivitesi`,
    date: new Date(activity.startTime || activity.createdAt),
    time: dayjs(activity.startTime || activity.createdAt).fromNow(),
    status: activity.status,
  })) || [];

  const callLogItems = (Array.isArray(callLogsData) ? callLogsData : []).map((callLog: any) => ({
    id: `calllog-${callLog.id}`,
    type: 'calllog' as const,
    entityType: 'Call',
    color: callLog.status === 'Completed' ? 'green' : callLog.status === 'Missed' ? 'red' : 'blue',
    icon: <PhoneIcon className="w-4 h-4" />,
    title: callLog.subject || 'Arama Kaydı',
    description: callLog.notes || `${callLog.direction === 'Outbound' ? 'Giden' : 'Gelen'} arama - ${callLog.duration ? `${callLog.duration} dk` : 'Süre belirtilmedi'}`,
    date: new Date(callLog.callDate || callLog.createdAt),
    time: dayjs(callLog.callDate || callLog.createdAt).fromNow(),
    status: callLog.status || callLog.outcome,
  }));

  // Merge and sort by date (newest first)
  const timelineData = [...activityItems, ...callLogItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const isTimelineLoading = activitiesLoading || callLogsLoading;

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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/crm/customers')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${customer.isActive ? 'bg-blue-600' : 'bg-slate-400'}`}>
                <BuildingStorefrontIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{customer.companyName}</h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      customer.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {customer.isActive ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 m-0">{customer.email}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
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
                  <p className="text-xs text-slate-400 mb-1">Müşteri Tipi</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                    {customer.customerType === 'Corporate' ? <BuildingOfficeIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                    {customer.customerType === 'Corporate' ? 'Kurumsal' :
                     customer.customerType === 'Individual' ? 'Bireysel' :
                     customer.customerType === 'Government' ? 'Kamu' : 'Sivil Toplum'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">İrtibat Kişisi</p>
                  <p className="text-sm font-medium text-slate-900">{customer.contactPerson || '-'}</p>
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
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                      customer.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {customer.isActive ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                {customer.industry && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sektör</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">{customer.industry}</span>
                  </div>
                )}
                {customer.businessEntityType && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Şirket Türü</p>
                    <p className="text-sm font-medium text-slate-900">{customer.businessEntityType}</p>
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
                    <DocumentTextIcon className="w-4 h-4 text-slate-400" />
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
                <TagIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Etiketler
                </p>
              </div>
              <CustomerTags customerId={String(customer.id)} editable={true} size="default" />
            </div>
          </div>

          {/* Mali Bilgiler Section */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <BanknotesIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Mali Bilgiler
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Vergi Numarası</p>
                  <p className="text-sm font-medium text-slate-900">{customer.taxId || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Vergi Dairesi</p>
                  <p className="text-sm font-medium text-slate-900">{customer.taxOffice || '-'}</p>
                </div>
                {customer.customerType === 'Individual' && customer.tcKimlikNo && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">TC Kimlik No</p>
                    <p className="text-sm font-medium text-slate-900">{customer.tcKimlikNo}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kredi Limiti</p>
                  <p className="text-sm font-medium text-slate-900">
                    {customer.creditLimit ? `₺${customer.creditLimit.toLocaleString('tr-TR')}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ödeme Vadesi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {customer.paymentTerms === 'Immediate' ? 'Peşin' :
                     customer.paymentTerms === '15 Days' ? '15 Gün' :
                     customer.paymentTerms === '30 Days' ? '30 Gün' :
                     customer.paymentTerms === '45 Days' ? '45 Gün' :
                     customer.paymentTerms === '60 Days' ? '60 Gün' :
                     customer.paymentTerms === '90 Days' ? '90 Gün' :
                     customer.paymentTerms || '-'}
                  </p>
                </div>
                {customer.totalPurchases !== null && customer.totalPurchases !== undefined && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Toplam Alışveriş</p>
                    <p className="text-sm font-medium text-slate-900">
                      ₺{customer.totalPurchases.toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resmi Kayıt Bilgileri Section - Sadece Kurumsal için */}
          {customer.customerType === 'Corporate' && (
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <BuildingLibraryIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Resmi Kayıt & e-Fatura Bilgileri
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">MERSIS No</p>
                    <p className="text-sm font-medium text-slate-900 font-mono">{customer.mersisNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ticaret Sicil No</p>
                    <p className="text-sm font-medium text-slate-900">{customer.tradeRegistryNo || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">KEP Adresi</p>
                    {customer.kepAddress ? (
                      <a href={`mailto:${customer.kepAddress}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {customer.kepAddress}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">e-Fatura Mükellefi</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                        customer.eInvoiceRegistered
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                      {customer.eInvoiceRegistered ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                      {customer.eInvoiceRegistered ? 'Evet' : 'Hayır'}
                    </span>
                  </div>
                  {customer.eInvoiceStartDate && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">e-Fatura Başlangıç</p>
                      <p className="text-sm font-medium text-slate-900">
                        {dayjs(customer.eInvoiceStartDate).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KVKK Onayları Section */}
          <div className={`col-span-12 ${customer.customerType === 'Corporate' ? '' : 'lg:col-span-6'}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  KVKK Rıza Durumu
                </p>
              </div>
              {(customer.kvkkDataProcessingConsent || customer.kvkkMarketingConsent || customer.kvkkCommunicationConsent) ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {customer.kvkkDataProcessingConsent ? (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 m-0 leading-tight">Kişisel Veri İşleme İzni</p>
                        <p className="text-xs text-slate-500 m-0 leading-tight mt-0.5">Veri toplama, işleme ve saklama</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 ml-3 ${customer.kvkkDataProcessingConsent ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {customer.kvkkDataProcessingConsent ? 'Onaylı' : 'Onaysız'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {customer.kvkkMarketingConsent ? (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 m-0 leading-tight">Pazarlama İletişimi İzni</p>
                        <p className="text-xs text-slate-500 m-0 leading-tight mt-0.5">Tanıtım ve pazarlama amaçlı iletişim</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 ml-3 ${customer.kvkkMarketingConsent ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {customer.kvkkMarketingConsent ? 'Onaylı' : 'Onaysız'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {customer.kvkkCommunicationConsent ? (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 m-0 leading-tight">Elektronik İletişim İzni</p>
                        <p className="text-xs text-slate-500 m-0 leading-tight mt-0.5">E-posta, SMS ve telefon ile iletişim</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 ml-3 ${customer.kvkkCommunicationConsent ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {customer.kvkkCommunicationConsent ? 'Onaylı' : 'Onaysız'}
                    </span>
                  </div>
                  {customer.kvkkConsentDate && (
                    <p className="text-xs text-slate-500 mt-2">
                      Onay Tarihi: {dayjs(customer.kvkkConsentDate).format('DD/MM/YYYY HH:mm')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">KVKK Onayı Alınmamış</p>
                  <p className="text-xs text-slate-500">Müşteriden KVKK onayları henüz alınmamış.</p>
                </div>
              )}
            </div>
          </div>

          {/* Notlar Section */}
          {customer.notes && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Notlar
                  </p>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}

          {/* Contact & Address Section */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
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
                      <GlobeAltIcon className="w-5 h-5 text-slate-600" />
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
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(customer.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {customer.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
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
                        <ClockIcon className="w-4 h-4" />
                        Etkinlikler
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
                              <ClockIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-slate-900 m-0">Etkinlikler</h3>
                                {timelineData.length > 0 && (
                                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {timelineData.length}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 m-0">Aktiviteler, aramalar ve tüm etkileşimler</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsActivityModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Yeni Aktivite
                          </button>
                        </div>

                        {/* Timeline List */}
                        {isTimelineLoading ? (
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
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                              <ClockIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">Aktivite bulunmuyor</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm">
                              Bu müşteri için henüz aktivite kaydı oluşturulmamış.
                            </p>
                            <button
                              onClick={() => setIsActivityModalOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
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
                                  {item.icon || <ClockIcon className={`w-5 h-5 ${
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
                        <ShoppingBagIcon className="w-4 h-4" />
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
                              <LockClosedIcon className="w-4 h-4 text-amber-600" />
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
                              <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
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
                              <PlusIcon className="w-4 h-4" />
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
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                              <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
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
                                <PlusIcon className="w-4 h-4" />
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
                                    <ShoppingBagIcon className="w-4 h-4 text-slate-500" />
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
                                    <EyeIcon className="w-4 h-4" />
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
                        <DocumentIcon className="w-4 h-4" />
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
                        <UserIcon className="w-4 h-4" />
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
                              <UserIcon className="w-5 h-5 text-indigo-600" />
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
                            <PlusIcon className="w-4 h-4" />
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
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                              <UserIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">Kişi bulunmuyor</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm">
                              Bu firma için henüz kişi eklenmemiş.
                            </p>
                            <button
                              onClick={() => handleOpenContactModal()}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
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
                                    <UserIcon className={`w-5 h-5 ${contact.isPrimary ? 'text-indigo-600' : 'text-slate-500'}`} />
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
                                        <CheckCircleIcon className="w-4 h-4" />
                                      </button>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Düzenle">
                                    <button
                                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                      onClick={() => handleOpenContactModal(contact)}
                                    >
                                      <PencilIcon className="w-4 h-4" />
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
                                      <TrashIcon className="w-4 h-4" />
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
            <PencilIcon className="w-4 h-4 text-blue-600" />
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
              <Input size="large" prefix={<BuildingStorefrontIcon className="w-4 h-4" />} placeholder="Firma adı" />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta gereklidir' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
              ]}
            >
              <Input size="large" prefix={<EnvelopeIcon className="w-4 h-4" />} placeholder="ornek@firma.com" />
            </Form.Item>

            <Form.Item name="phone" label="Telefon">
              <Input size="large" prefix={<PhoneIcon className="w-4 h-4" />} placeholder="+90 555 123 4567" />
            </Form.Item>

            <Form.Item name="website" label="Website">
              <Input size="large" prefix={<GlobeAltIcon className="w-4 h-4" />} placeholder="https://www.firma.com" />
            </Form.Item>

            <Form.Item name="industry" label="Sektör">
              <Input size="large" prefix={<BuildingStorefrontIcon className="w-4 h-4" />} placeholder="Teknoloji" />
            </Form.Item>

            <Form.Item name="address" label="Adres">
              <Input size="large" prefix={<MapPinIcon className="w-4 h-4" />} placeholder="Adres" />
            </Form.Item>

            <Form.Item name="city" label="Şehir">
              <Input size="large" prefix={<MapPinIcon className="w-4 h-4" />} placeholder="İstanbul" />
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
            <Button type="primary" size="large" htmlType="submit" icon={<PencilIcon className="w-4 h-4" />} loading={updateCustomer.isPending}>
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
            <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
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
                <BuildingStorefrontIcon className="w-4 h-4 text-slate-500" />
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
                          <TrashIcon className="w-4 h-4" />
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
                      <CurrencyDollarIcon className="w-4 h-4 text-white" />
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
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
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
                <ShoppingBagIcon className="w-4 h-4" />
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
            <UserIcon className={`w-6 h-6 ${editingContact ? 'text-amber-600' : 'text-indigo-600'}`} />
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
                <UserIcon className="w-3 h-3 text-slate-500" />
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
                <PhoneIcon className="w-3 h-3 text-slate-500" />
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
                    prefix={<EnvelopeIcon className="w-4 h-4 text-slate-400" />}
                    placeholder="ahmet@firma.com"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                    placeholder="+90 212 123 4567"
                    className="h-10 rounded-lg border-slate-200 hover:border-slate-300 focus:border-slate-400"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cep Telefonu</label>
                <Form.Item name="mobilePhone" className="mb-0">
                  <Input
                    prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
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
                <TagIcon className="w-3 h-3 text-slate-500" />
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
                <DocumentTextIcon className="w-3 h-3 text-slate-500" />
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
                <PencilIcon className="w-4 h-4" />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
              {editingContact ? 'Güncelle' : 'Kişi Ekle'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Activity Modal */}
      <ActivityModal
        open={isActivityModalOpen}
        activity={null}
        loading={createActivity.isPending}
        onCancel={() => setIsActivityModalOpen(false)}
        onSubmit={handleCreateActivity}
        initialCustomerId={customerId}
      />
    </div>
  );
}
