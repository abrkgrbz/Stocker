'use client';

import React from 'react';
import { Input, Button, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

interface LeadsFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

export function LeadsFilters({ searchText, onSearchChange }: LeadsFiltersProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col flex="auto">
        <Input
          placeholder="Potansiyel müşteri ara..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />
      </Col>
      <Col>
        <Button icon={<FilterOutlined />}>Filtrele</Button>
      </Col>
    </Row>
  );
}
