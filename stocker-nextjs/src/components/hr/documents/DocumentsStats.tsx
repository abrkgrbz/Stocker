'use client';

import React from 'react';
import {
  DocumentIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';

interface DocumentsStatsProps {
  documents: EmployeeDocumentDto[];
  loading?: boolean;
}

export function DocumentsStats({ documents, loading = false }: DocumentsStatsProps) {
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter((d) => d.isVerified).length;
  const expiringSoonDocuments = documents.filter((d) => d.isExpiringSoon && !d.isExpired).length;
  const expiredDocuments = documents.filter((d) => d.isExpired).length;

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam Belge',
      value: totalDocuments,
      subtitle: 'Kayitli Belgeler',
      icon: DocumentIcon,
    },
    {
      title: 'Dogrulanmis',
      value: verifiedDocuments,
      subtitle: `${totalDocuments > 0 ? ((verifiedDocuments / totalDocuments) * 100).toFixed(0) : 0}% Onayli`,
      icon: ShieldCheckIcon,
    },
    {
      title: 'Suresi Dolacak',
      value: expiringSoonDocuments,
      subtitle: 'Yakin Tarih',
      icon: ClockIcon,
    },
    {
      title: 'Suresi Dolmus',
      value: expiredDocuments,
      subtitle: 'Yenilenmeli',
      icon: ExclamationCircleIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
