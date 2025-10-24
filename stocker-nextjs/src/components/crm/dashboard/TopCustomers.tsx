'use client';

import React from 'react';
import { List, Typography, Tag } from 'antd';
import Link from 'next/link';
import { AnimatedCard } from '../shared/AnimatedCard';
import { formatCurrency } from '@/lib/crm';
import type { Customer } from '@/lib/api/services/crm.service';

const { Text } = Typography;

interface TopCustomersProps {
  customers: Customer[];
  loading?: boolean;
}

export function TopCustomers({ customers, loading = false }: TopCustomersProps) {
  return (
    <AnimatedCard title="En Değerli Müşteriler" loading={loading}>
      <List
        dataSource={customers}
        renderItem={(customer, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Text strong className="text-blue-600">
                    #{index + 1}
                  </Text>
                </div>
              }
              title={
                <Link
                  href={`/crm/customers/${customer.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {customer.companyName}
                </Link>
              }
              description={customer.contactPerson}
            />
            <div className="text-right">
              <div className="font-semibold text-lg">
                {formatCurrency(customer.totalPurchases)}
              </div>
              <Tag color={customer.status === 'Active' ? 'success' : 'default'}>
                {customer.status === 'Active' ? 'Aktif' : 'Pasif'}
              </Tag>
            </div>
          </List.Item>
        )}
      />
    </AnimatedCard>
  );
}
