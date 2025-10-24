'use client';

import React from 'react';
import { Card, Skeleton } from 'antd';

interface CRMCardSkeletonProps {
  rows?: number;
  avatar?: boolean;
}

export function CRMCardSkeleton({ rows = 2, avatar = false }: CRMCardSkeletonProps) {
  return (
    <Card>
      <Skeleton active avatar={avatar} paragraph={{ rows }} />
    </Card>
  );
}
