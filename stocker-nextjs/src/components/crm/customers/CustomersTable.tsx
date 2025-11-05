'use client';

import React from 'react';
import { Card, Tag, Dropdown, Button, Avatar, Pagination, Space } from 'antd';
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { Customer } from '@/lib/api/services/crm.service';
import { formatCurrency } from '@/lib/crm/formatters';
import { CRM_STATUS_LABELS } from '@/lib/crm/constants';
import { CustomerTagList } from './CustomerTags';

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (customer: Customer) => void;
  onView: (customerId: number) => void;
}

export function CustomersTable({
  customers,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onView,
}: CustomersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Inactive':
        return 'default';
      case 'Potential':
        return 'gold';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const label = CRM_STATUS_LABELS.customers[status as keyof typeof CRM_STATUS_LABELS.customers] || status;
    switch (status) {
      case 'Active':
        return `✓ ${label}`;
      case 'Inactive':
        return `✕ ${label}`;
      case 'Potential':
        return `⏳ ${label}`;
      default:
        return label;
    }
  };

  const getIndustryColor = (industry?: string) => {
    if (!industry) return 'blue';
    const colors = ['blue', 'purple', 'cyan', 'geekblue', 'magenta'];
    const index = industry.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-gray-600">Müşteriler yükleniyor...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Müşteri Bulunamadı</h3>
        <p className="text-gray-500">Arama kriterlerinize uygun müşteri bulunamadı</p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-gray-600">
          <span className="font-semibold text-gray-800">{totalCount}</span> müşteri bulundu
          {totalCount > pageSize && (
            <span className="ml-2">
              (Sayfa {currentPage} / {Math.ceil(totalCount / pageSize)})
            </span>
          )}
        </div>
      </div>

      {/* Modern Customer List */}
      <div className="space-y-4">
        {customers.map((customer, index) => (
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
                    : customer.status === 'Potential'
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
                      icon={<ShopOutlined />}
                      className={`border-4 ${
                        customer.status === 'Active'
                          ? 'border-green-200 bg-gradient-to-br from-green-400 to-blue-500'
                          : customer.status === 'Potential'
                          ? 'border-yellow-200 bg-gradient-to-br from-yellow-400 to-orange-500'
                          : 'border-gray-200 bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                        customer.status === 'Active'
                          ? 'bg-green-500'
                          : customer.status === 'Potential'
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
                        {customer.contactPerson && (
                          <span className="text-gray-600 text-sm flex items-center gap-1">
                            <UserOutlined className="text-blue-500" />
                            {customer.contactPerson}
                          </span>
                        )}
                        <Tag
                          color={customer.customerType === 'Corporate' ? 'purple' : 'green'}
                          className="font-medium"
                        >
                          {customer.customerType === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                        </Tag>
                        <CustomerTagList customerId={customer.id} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag
                        color={getStatusColor(customer.status)}
                        className="font-semibold text-sm px-4 py-1"
                      >
                        {getStatusText(customer.status)}
                      </Tag>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'view',
                              label: 'Detayları Gör',
                              icon: <EyeOutlined />,
                              onClick: () => onView(customer.id),
                            },
                            {
                              key: 'edit',
                              label: 'Düzenle',
                              icon: <EditOutlined />,
                              onClick: () => onEdit(customer),
                            },
                            {
                              type: 'divider',
                            },
                            {
                              key: 'delete',
                              label: 'Sil',
                              icon: <DeleteOutlined />,
                              danger: true,
                            },
                          ],
                        }}
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          className="hover:bg-gray-100"
                        />
                      </Dropdown>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <MailOutlined className="text-blue-500" />
                      <span className="text-sm truncate">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                        <PhoneOutlined className="text-green-500" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                    {(customer.city || customer.country) && (
                      <div className="flex items-center gap-2 text-gray-600 bg-red-50 px-3 py-2 rounded-lg">
                        <EnvironmentOutlined className="text-red-500" />
                        <span className="text-sm truncate">
                          {customer.city}
                          {customer.city && customer.country && ', '}
                          {customer.country}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-lg border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <DollarOutlined className="text-blue-500" />
                        Kredi Limiti
                      </div>
                      <div className="text-base font-bold text-blue-700">
                        {formatCurrency(customer.creditLimit || 0)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-3 rounded-lg border border-green-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <ShoppingOutlined className="text-green-500" />
                        Toplam Ciro
                      </div>
                      <div className="text-base font-bold text-green-700">
                        {formatCurrency(customer.totalPurchases || 0)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 rounded-lg border border-purple-200">
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <RiseOutlined className="text-purple-500" />
                        Kullanım Oranı
                      </div>
                      <div className="text-base font-bold text-purple-700">
                        {customer.creditLimit
                          ? (((customer.totalPurchases || 0) / customer.creditLimit) * 100).toFixed(0)
                          : 0}
                        %
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
      {totalCount > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} müşteri`}
            pageSizeOptions={['5', '10', '20', '50']}
            className="modern-pagination"
          />
        </div>
      )}
    </div>
  );
}
