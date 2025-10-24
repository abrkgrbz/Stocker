'use client';

import React from 'react';
import { Table } from 'antd';

interface CRMTableSkeletonProps {
  columns: any[];
  rowCount?: number;
}

export function CRMTableSkeleton({ columns, rowCount = 5 }: CRMTableSkeletonProps) {
  const skeletonData = Array.from({ length: rowCount }, (_, index) => ({
    key: index,
  }));

  return (
    <Table
      loading
      columns={columns}
      dataSource={skeletonData}
      pagination={false}
      size="small"
    />
  );
}
