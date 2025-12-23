'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty, Modal, Form, Input, InputNumber, Tabs, Timeline, Card, Skeleton, Table, Select, DatePicker, Tooltip } from 'antd';
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
import { useCustomer, useUpdateCustomer, useActivities } from '@/lib/api/hooks/useCRM';
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
          ...item,
          lineNumber: index + 1,
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
                        {ordersData?.totalCount ? (
                          <Tag className="ml-1" color="blue">{ordersData.totalCount}</Tag>
                        ) : null}
                      </span>
                    ),
                    children: (
                      <div className="p-6">
                        {/* Module access check */}
                        {!canCreateOrder && !modulesLoading && (
                          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                            <LockOutlined className="text-amber-500 text-lg" />
                            <div>
                              <p className="font-medium text-amber-800 m-0">Sipariş Oluşturma Kısıtlı</p>
                              <p className="text-sm text-amber-600 m-0">
                                Sipariş oluşturmak için Satış ve Envanter modüllerine erişim gereklidir.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Header with create button */}
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 m-0">Müşteri Siparişleri</h3>
                            <p className="text-sm text-slate-500 m-0">Bu müşteriye ait tüm siparişler</p>
                          </div>
                          {canCreateOrder && (
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => setIsOrderModalOpen(true)}
                            >
                              Yeni Sipariş
                            </Button>
                          )}
                        </div>

                        {/* Orders list */}
                        {ordersLoading ? (
                          <div className="space-y-4">
                            <Skeleton active />
                            <Skeleton active />
                          </div>
                        ) : !ordersData?.items?.length ? (
                          <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                              <ShoppingOutlined className="text-2xl text-slate-400" />
                            </div>
                            <p className="text-slate-500 mb-4">Henüz sipariş bulunmuyor</p>
                            {canCreateOrder && (
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsOrderModalOpen(true)}
                              >
                                İlk Siparişi Oluştur
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Table
                            dataSource={ordersData.items}
                            rowKey="id"
                            pagination={{
                              total: ordersData.totalCount,
                              pageSize: 10,
                              showSizeChanger: false,
                              showTotal: (total) => `Toplam ${total} sipariş`,
                            }}
                            columns={[
                              {
                                title: 'Sipariş No',
                                dataIndex: 'orderNumber',
                                key: 'orderNumber',
                                render: (text: string) => (
                                  <span className="font-medium text-blue-600">{text}</span>
                                ),
                              },
                              {
                                title: 'Tarih',
                                dataIndex: 'orderDate',
                                key: 'orderDate',
                                render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                              },
                              {
                                title: 'Tutar',
                                dataIndex: 'totalAmount',
                                key: 'totalAmount',
                                render: (amount: number, record: any) => (
                                  <span className="font-semibold">
                                    {new Intl.NumberFormat('tr-TR', {
                                      style: 'currency',
                                      currency: record.currency || 'TRY',
                                    }).format(amount)}
                                  </span>
                                ),
                              },
                              {
                                title: 'Durum',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status: string) => (
                                  <Tag color={getOrderStatusColor(status)}>
                                    {getOrderStatusText(status)}
                                  </Tag>
                                ),
                              },
                              {
                                title: 'İşlemler',
                                key: 'actions',
                                width: 100,
                                render: (_: any, record: any) => (
                                  <Tooltip title="Sipariş Detayı">
                                    <Button
                                      type="text"
                                      icon={<EyeOutlined />}
                                      onClick={() => router.push(`/sales/orders/${record.id}`)}
                                    />
                                  </Tooltip>
                                ),
                              },
                            ]}
                          />
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

      {/* Create Order Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShoppingOutlined className="text-blue-600" />
            <span>Yeni Sipariş Oluştur</span>
          </div>
        }
        open={isOrderModalOpen}
        onCancel={() => {
          setIsOrderModalOpen(false);
          setOrderItems([]);
          orderForm.resetFields();
        }}
        footer={null}
        width={900}
        centered
      >
        <Form
          form={orderForm}
          layout="vertical"
          onFinish={handleCreateOrder}
          className="mt-6"
          initialValues={{
            orderDate: dayjs(),
          }}
        >
          {/* Customer Info (Read-only) */}
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-500 mb-1">Müşteri</p>
            <p className="font-semibold text-slate-800 m-0">{customer?.companyName}</p>
            {customer?.email && <p className="text-sm text-slate-600 m-0">{customer.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Form.Item
              name="orderDate"
              label="Sipariş Tarihi"
              rules={[{ required: true, message: 'Sipariş tarihi gereklidir' }]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Tarih seçin"
              />
            </Form.Item>

            <Form.Item name="notes" label="Notlar">
              <Input placeholder="Sipariş notu..." />
            </Form.Item>
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Ürün Ekle</label>
            <Select
              showSearch
              placeholder="Ürün arayın ve seçin..."
              optionFilterProp="label"
              loading={productsLoading}
              className="w-full"
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

          {/* Order Items Table */}
          {orderItems.length > 0 && (
            <div className="mb-6">
              <Table
                dataSource={orderItems}
                rowKey="productId"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Ürün',
                    key: 'product',
                    render: (_: any, record: any) => (
                      <div>
                        <p className="font-medium m-0">{record.productName}</p>
                        <p className="text-xs text-slate-500 m-0">{record.productCode}</p>
                      </div>
                    ),
                  },
                  {
                    title: 'Miktar',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 100,
                    render: (value: number, record: any) => (
                      <InputNumber
                        min={1}
                        value={value}
                        size="small"
                        onChange={(val) => handleUpdateOrderItem(record.productId, 'quantity', val || 1)}
                      />
                    ),
                  },
                  {
                    title: 'Birim Fiyat',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    width: 120,
                    render: (value: number, record: any) => (
                      <InputNumber
                        min={0}
                        value={value}
                        size="small"
                        formatter={(val) => `₺ ${val}`}
                        parser={(val) => Number((val || '').replace('₺ ', '')) as any}
                        onChange={(val) => handleUpdateOrderItem(record.productId, 'unitPrice', val || 0)}
                      />
                    ),
                  },
                  {
                    title: 'İndirim %',
                    dataIndex: 'discountRate',
                    key: 'discountRate',
                    width: 90,
                    render: (value: number, record: any) => (
                      <InputNumber
                        min={0}
                        max={100}
                        value={value}
                        size="small"
                        onChange={(val) => handleUpdateOrderItem(record.productId, 'discountRate', val || 0)}
                      />
                    ),
                  },
                  {
                    title: 'Toplam',
                    key: 'total',
                    width: 100,
                    render: (_: any, record: any) => {
                      const subtotal = record.quantity * record.unitPrice;
                      const discount = subtotal * (record.discountRate / 100);
                      const afterDiscount = subtotal - discount;
                      const vat = afterDiscount * (record.vatRate / 100);
                      const total = afterDiscount + vat;
                      return (
                        <span className="font-semibold">
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          }).format(total)}
                        </span>
                      );
                    },
                  },
                  {
                    title: '',
                    key: 'actions',
                    width: 50,
                    render: (_: any, record: any) => (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveProduct(record.productId)}
                      />
                    ),
                  },
                ]}
              />

              {/* Order Total */}
              <div className="flex justify-end mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Genel Toplam</p>
                  <p className="text-xl font-bold text-slate-800 m-0">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(calculateOrderTotal())}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              size="large"
              onClick={() => {
                setIsOrderModalOpen(false);
                setOrderItems([]);
                orderForm.resetFields();
              }}
            >
              İptal
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<ShoppingOutlined />}
              loading={createOrder.isPending}
              disabled={orderItems.length === 0}
            >
              Sipariş Oluştur
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
