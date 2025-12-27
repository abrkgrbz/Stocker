'use client';

import React from 'react';
import { Input, Button, Row, Col, Space } from 'antd';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface LeadsFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  activeStatusFilter?: string;
  onStatusFilterChange?: (status: string | null) => void;
}

const statusFilters = [
  { key: null, label: 'Tümü', count: 0 },
  { key: 'New', label: 'Yeni Lead\'ler', count: 0 },
  { key: 'Qualified', label: 'Nitelikli', count: 0 },
  { key: 'MeetingScheduled', label: 'Görüşme Ayarlandı', count: 0 },
  { key: 'Lost', label: 'Kaybedildi', count: 0 },
];

export function LeadsFilters({
  searchText,
  onSearchChange,
  activeStatusFilter,
  onStatusFilterChange,
}: LeadsFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Quick Filter Tabs */}
      {onStatusFilterChange && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.key || 'all'}
              onClick={() => onStatusFilterChange(filter.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeStatusFilter === filter.key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Search and Filter Row */}
      <Row gutter={[16, 16]}>
        <Col flex="auto">
          <Input
            placeholder="Potansiyel müşteri ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col>
          <Button icon={<FunnelIcon className="w-4 h-4" />} size="large">
            Filtrele
          </Button>
        </Col>
      </Row>
    </div>
  );
}
