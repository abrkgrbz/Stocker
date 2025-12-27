'use client';

import React from 'react';
import { Input, Button, Space } from 'antd';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface CustomersFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

export function CustomersFilters({ searchText, onSearchChange }: CustomersFiltersProps) {
  return (
    <Space style={{ width: '100%' }} direction="vertical" size="middle">
      <div className="flex gap-4">
        <Input
          placeholder="İsim, e-posta veya telefona göre ara..."
          prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ flex: 1 }}
          size="large"
          allowClear
        />
        <Button icon={<FunnelIcon className="w-4 h-4" />} size="large">
          Filtreler
        </Button>
      </div>
    </Space>
  );
}
