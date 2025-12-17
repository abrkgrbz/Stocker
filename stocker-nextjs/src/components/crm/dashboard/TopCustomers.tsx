'use client';

import React from 'react';
import { List, Typography } from 'antd';
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
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Text strong className="text-slate-600">
                    #{index + 1}
                  </Text>
                </div>
              }
              title={
                <Link
                  href={`/crm/customers/${customer.id}`}
                  className="text-slate-900 hover:text-slate-600"
                >
                  {customer.companyName}
                </Link>
              }
              description={<span className="text-slate-400">{customer.contactPerson}</span>}
            />
            <div className="text-right">
              <div className="font-semibold text-lg text-slate-900">
                {formatCurrency(customer.totalPurchases)}
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                customer.status === 'Active'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {customer.status === 'Active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </List.Item>
        )}
      />
    </AnimatedCard>
  );
}
