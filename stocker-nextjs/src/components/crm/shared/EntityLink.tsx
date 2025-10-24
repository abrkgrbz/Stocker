'use client';

import React from 'react';
import Link from 'next/link';
import { CRM_ROUTES } from '@/lib/crm';

interface EntityLinkProps {
  entityType: 'customers' | 'leads' | 'deals';
  entityId: number;
  children: React.ReactNode;
  className?: string;
}

export function EntityLink({ entityType, entityId, children, className = '' }: EntityLinkProps) {
  const href = `${CRM_ROUTES[entityType]}/${entityId}`;

  return (
    <Link href={href} className={`text-blue-600 hover:text-blue-800 hover:underline ${className}`}>
      {children}
    </Link>
  );
}
