'use client';

import React, { useState } from 'react';
import { Card, Avatar, Tag, Input, Button, Space, Badge, Statistic, Row, Col, Tooltip, message } from 'antd';
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

  // Filter customers
  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus ? customer.status === filterStatus : true;

    return matchesSearch && matchesStatus;
  });

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
          <Space size="middle" wrap className="w-full justify-between">
            <Input
              size="large"
              placeholder="Müşteri ara (firma, kişi, email...)"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-md"
              allowClear
              suppressHydrationWarning
            />
            <Space>
              <Button
                size="large"
                icon={<FilterOutlined />}
                type={filterStatus === null ? 'primary' : 'default'}
                onClick={() => setFilterStatus(null)}
              >
                Tümü ({mockCustomers.length})
              </Button>
              <Button
                size="large"
                type={filterStatus === 'Active' ? 'primary' : 'default'}
                onClick={() => setFilterStatus('Active')}
              >
                Aktif ({mockCustomers.filter((c) => c.status === 'Active').length})
              </Button>
              <Button
                size="large"
                type={filterStatus === 'Pending' ? 'primary' : 'default'}
                onClick={() => setFilterStatus('Pending')}
              >
                Beklemede ({mockCustomers.filter((c) => c.status === 'Pending').length})
              </Button>
              <Button
                size="large"
                type={filterStatus === 'Inactive' ? 'primary' : 'default'}
                onClick={() => setFilterStatus('Inactive')}
              >
                Pasif ({mockCustomers.filter((c) => c.status === 'Inactive').length})
              </Button>
            </Space>
          </Space>
        </Card>
      </motion.div>

      {/* Customers Grid */}
      <Row gutter={[16, 16]}>
        {filteredCustomers.map((customer, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={customer.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
            >
              <Card
                hoverable
                className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden"
                styles={{ body: { padding: 0 } }}
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-12">
                  <div className="flex justify-between items-start mb-4">
                    <Badge status={customer.status === 'Active' ? 'success' : customer.status === 'Pending' ? 'warning' : 'default'}>
                      <Tag color={getStatusColor(customer.status)} className="font-semibold">
                        {getStatusText(customer.status)}
                      </Tag>
                    </Badge>
                    {customer.industry && (
                      <Tag color={getIndustryColor(customer.industry)} icon={<ShopOutlined />}>
                        {customer.industry}
                      </Tag>
                    )}
                  </div>
                  <div className="text-center">
                    <Avatar
                      size={80}
                      icon={<UserOutlined />}
                      className="bg-white/20 backdrop-blur-sm border-4 border-white shadow-lg mb-3"
                    />
                    <h3 className="text-white font-bold text-lg mb-1">{customer.companyName}</h3>
                    <p className="text-white/80 text-sm">{customer.contactPerson}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 -mt-6 relative z-10">
                  <Card className="shadow-md mb-4">
                    <Space direction="vertical" size="small" className="w-full">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MailOutlined className="text-blue-500" />
                        <span className="text-sm truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneOutlined className="text-green-500" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <EnvironmentOutlined className="text-red-500" />
                        <span className="text-sm">
                          {customer.city}, {customer.district}
                        </span>
                      </div>
                    </Space>
                  </Card>

                  {/* Stats */}
                  <Row gutter={8}>
                    <Col span={12}>
                      <Tooltip title="Kredi Limiti">
                        <Card size="small" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <Statistic
                            title={<span className="text-xs text-gray-600">Limit</span>}
                            value={customer.creditLimit}
                            prefix={<DollarOutlined className="text-blue-500" />}
                            suffix="₺"
                            valueStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}
                          />
                        </Card>
                      </Tooltip>
                    </Col>
                    <Col span={12}>
                      <Tooltip title="Toplam Alışveriş">
                        <Card size="small" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <Statistic
                            title={<span className="text-xs text-gray-600">Ciro</span>}
                            value={customer.totalPurchases}
                            prefix={<ShoppingOutlined className="text-green-500" />}
                            suffix="₺"
                            valueStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#52c41a' }}
                          />
                        </Card>
                      </Tooltip>
                    </Col>
                  </Row>

                  {/* Last Purchase */}
                  <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <CalendarOutlined className="text-purple-500" />
                      Son Alışveriş
                    </span>
                    <span className="text-xs font-semibold text-purple-700">
                      {new Date(customer.lastPurchaseDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

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
