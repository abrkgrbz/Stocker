'use client';

import React, { useState, useEffect } from 'react';
import { Card, Avatar, Tag, Input, Button, Space, Badge, Statistic, Row, Col, Tooltip, message, Pagination } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  TrophyOutlined,
  RiseOutlined,
  TeamOutlined,
  ShopOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { MOCK_CUSTOMERS, MOCK_CUSTOMER_STATS, type MockCustomer } from '@/lib/data/mock-customers';
import CustomerModal from '@/features/customers/components/CustomerModal';

const { Meta } = Card;

export default function CustomersDemo() {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mockCustomers, setMockCustomers] = useState<MockCustomer[]>(MOCK_CUSTOMERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filterCustomerType, setFilterCustomerType] = useState<string | null>(null);

  // Filter customers
  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus ? customer.status === filterStatus : true;
    const matchesType = filterCustomerType ? customer.customerType === filterCustomerType : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalCustomers = filteredCustomers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus, filterCustomerType]);

  // Handle modal success (add new customer to mock data)
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    message.success('Demo modda müşteri eklendi! (Gerçek API çağrısı yapılmadı)');
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  // Status text mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Aktif';
      case 'Pending':
        return 'Beklemede';
      case 'Inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  // Industry color mapping
  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      Teknoloji: 'blue',
      Gıda: 'green',
      Tekstil: 'purple',
      Otomotiv: 'orange',
      İnşaat: 'cyan',
      Mobilya: 'magenta',
      Elektronik: 'geekblue',
      Tarım: 'lime',
      Turizm: 'gold',
      Enerji: 'volcano',
    };
    return colors[industry] || 'default';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="shadow-lg"
            >
              Yeni Müşteri Ekle
            </Button>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Müşteri Yönetimi
          </h1>
          <p className="text-gray-600 text-lg">Modern ve Profesyonel CRM Deneyimi</p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
                <Statistic
                  title={<span className="text-white/90">Toplam Müşteri</span>}
                  value={MOCK_CUSTOMER_STATS.totalCustomers}
                  prefix={<TeamOutlined className="text-white" />}
                  valueStyle={{ color: 'white', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg">
                <Statistic
                  title={<span className="text-white/90">Aktif Müşteri</span>}
                  value={MOCK_CUSTOMER_STATS.activeCustomers}
                  prefix={<TrophyOutlined className="text-white" />}
                  valueStyle={{ color: 'white', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg">
                <Statistic
                  title={<span className="text-white/90">Bu Ay Yeni</span>}
                  value={MOCK_CUSTOMER_STATS.newThisMonth}
                  prefix={<RiseOutlined className="text-white" />}
                  valueStyle={{ color: 'white', fontWeight: 'bold' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg">
                <Statistic
                  title={<span className="text-white/90">Toplam Ciro</span>}
                  value={formatCurrency(MOCK_CUSTOMER_STATS.totalRevenue)}
                  prefix={<DollarOutlined className="text-white" />}
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Card className="shadow-lg border-0 mb-6">
          <Space direction="vertical" size="middle" className="w-full">
            {/* Search Bar - Full Width */}
            <Input
              size="large"
              placeholder="🔍 Firma adı, kişi adı veya email ile müşteri arayın..."
              prefix={<SearchOutlined className="text-blue-500 text-lg" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full text-base"
              allowClear
              suppressHydrationWarning
              style={{ fontSize: '16px', padding: '12px 16px' }}
            />

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-600">Filtrele:</span>

              {/* Customer Type Filter */}
              <Space>
                <Button
                  size="middle"
                  type={filterCustomerType === null ? 'primary' : 'default'}
                  onClick={() => setFilterCustomerType(null)}
                  icon={<TeamOutlined />}
                >
                  Tümü ({mockCustomers.length})
                </Button>
                <Button
                  size="middle"
                  type={filterCustomerType === 'Corporate' ? 'primary' : 'default'}
                  onClick={() => setFilterCustomerType('Corporate')}
                  className={filterCustomerType === 'Corporate' ? 'bg-purple-500' : ''}
                >
                  🏢 Kurumsal ({mockCustomers.filter((c) => c.customerType === 'Corporate').length})
                </Button>
                <Button
                  size="middle"
                  type={filterCustomerType === 'Individual' ? 'primary' : 'default'}
                  onClick={() => setFilterCustomerType('Individual')}
                  className={filterCustomerType === 'Individual' ? 'bg-green-500' : ''}
                >
                  👤 Bireysel ({mockCustomers.filter((c) => c.customerType === 'Individual').length})
                </Button>
              </Space>

              <div className="w-px h-6 bg-gray-300"></div>

              {/* Status Filter */}
              <Space>
                <Button
                  size="middle"
                  icon={<FilterOutlined />}
                  type={filterStatus === null ? 'primary' : 'default'}
                  onClick={() => setFilterStatus(null)}
                >
                  Tüm Durumlar
                </Button>
                <Button
                  size="middle"
                  type={filterStatus === 'Active' ? 'primary' : 'default'}
                  onClick={() => setFilterStatus('Active')}
                  className={filterStatus === 'Active' ? 'bg-green-500' : ''}
                >
                  ✓ Aktif ({mockCustomers.filter((c) => c.status === 'Active').length})
                </Button>
                <Button
                  size="middle"
                  type={filterStatus === 'Pending' ? 'primary' : 'default'}
                  onClick={() => setFilterStatus('Pending')}
                  className={filterStatus === 'Pending' ? 'bg-yellow-500' : ''}
                >
                  ⏳ Beklemede ({mockCustomers.filter((c) => c.status === 'Pending').length})
                </Button>
                <Button
                  size="middle"
                  type={filterStatus === 'Inactive' ? 'primary' : 'default'}
                  onClick={() => setFilterStatus('Inactive')}
                >
                  ✕ Pasif ({mockCustomers.filter((c) => c.status === 'Inactive').length})
                </Button>
              </Space>
            </div>
          </Space>
        </Card>
      </motion.div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-gray-600">
          <span className="font-semibold text-gray-800">{totalCustomers}</span> müşteri bulundu
          {totalCustomers > pageSize && (
            <span className="ml-2">
              (Sayfa {currentPage} / {Math.ceil(totalCustomers / pageSize)})
            </span>
          )}
        </div>
      </div>

      {/* Modern Customer List */}
      <div className="space-y-4">
        {paginatedCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            whileHover={{ scale: 1.01, x: 5 }}
          >
            <Card
              hoverable
              className="shadow-md hover:shadow-2xl transition-all duration-300 border-l-4"
              style={{
                borderLeftColor:
                  customer.status === 'Active'
                    ? '#52c41a'
                    : customer.status === 'Pending'
                    ? '#faad14'
                    : '#d9d9d9',
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Avatar
                      size={72}
                      icon={<UserOutlined />}
                      className={`border-4 ${
                        customer.status === 'Active'
                          ? 'border-green-200 bg-gradient-to-br from-green-400 to-blue-500'
                          : customer.status === 'Pending'
                          ? 'border-yellow-200 bg-gradient-to-br from-yellow-400 to-orange-500'
                          : 'border-gray-200 bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                        customer.status === 'Active'
                          ? 'bg-green-500'
                          : customer.status === 'Pending'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Main Info Section */}
                <div className="flex-grow min-w-0 w-full">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                        {customer.companyName}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-gray-600 text-sm flex items-center gap-1">
                          <UserOutlined className="text-blue-500" />
                          {customer.contactPerson}
                        </span>
                        {customer.industry && (
                          <Tag
                            color={getIndustryColor(customer.industry)}
                            className="font-medium"
                            icon={<ShopOutlined />}
                          >
                            {customer.industry}
                          </Tag>
                        )}
                        <Tag
                          color={customer.customerType === 'Corporate' ? 'purple' : 'green'}
                          className="font-medium"
                        >
                          {customer.customerType === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                        </Tag>
                      </div>
                    </div>
                    <Tag
                      color={getStatusColor(customer.status)}
                      className="font-semibold text-sm px-4 py-1 self-start"
                    >
                      {getStatusText(customer.status)}
                    </Tag>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <MailOutlined className="text-blue-500" />
                      <span className="text-sm truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                      <PhoneOutlined className="text-green-500" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-red-50 px-3 py-2 rounded-lg">
                      <EnvironmentOutlined className="text-red-500" />
                      <span className="text-sm truncate">
                        {customer.city}, {customer.district}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-lg border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <DollarOutlined className="text-blue-500" />
                        Kredi Limiti
                      </div>
                      <div className="text-base font-bold text-blue-700">
                        ₺{customer.creditLimit.toLocaleString('tr-TR')}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-3 rounded-lg border border-green-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <ShoppingOutlined className="text-green-500" />
                        Toplam Ciro
                      </div>
                      <div className="text-base font-bold text-green-700">
                        ₺{customer.totalPurchases.toLocaleString('tr-TR')}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 rounded-lg border border-purple-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <RiseOutlined className="text-purple-500" />
                        Kullanım Oranı
                      </div>
                      <div className="text-base font-bold text-purple-700">
                        {((customer.totalPurchases / customer.creditLimit) * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-3 rounded-lg border border-orange-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <CalendarOutlined className="text-orange-500" />
                        Son Alışveriş
                      </div>
                      <div className="text-xs font-semibold text-orange-700">
                        {new Date(customer.lastPurchaseDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalCustomers > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCustomers}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} müşteri`}
            pageSizeOptions={['5', '10', '20', '50']}
            className="modern-pagination"
          />
        </div>
      )}

      {/* No Results */}
      {filteredCustomers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Müşteri Bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinize uygun müşteri bulunamadı</p>
        </motion.div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
