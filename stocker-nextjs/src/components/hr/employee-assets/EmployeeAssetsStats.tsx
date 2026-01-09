'use client';

import React from 'react';
import {
  ComputerDesktopIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeAssetDto } from '@/lib/api/services/hr.types';

interface EmployeeAssetsStatsProps {
  assets: EmployeeAssetDto[];
  loading?: boolean;
}

export function EmployeeAssetsStats({ assets, loading = false }: EmployeeAssetsStatsProps) {
  const totalAssets = assets.length;
  const assignedAssets = assets.filter((a) => a.status === 'Assigned').length;
  const availableAssets = assets.filter((a) => a.status === 'Available').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'UnderMaintenance' || a.status === 'Lost' || a.status === 'Damaged').length;

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
      title: 'Toplam Varlik',
      value: totalAssets,
      subtitle: 'Kayitli Varliklar',
      icon: ComputerDesktopIcon,
    },
    {
      title: 'Atanmis',
      value: assignedAssets,
      subtitle: 'Kullanimda',
      icon: CheckCircleIcon,
    },
    {
      title: 'Musait',
      value: availableAssets,
      subtitle: 'Atanabilir',
      icon: ComputerDesktopIcon,
    },
    {
      title: 'Bakim/Sorunlu',
      value: maintenanceAssets,
      subtitle: 'Dikkat Gerekli',
      icon: maintenanceAssets > 0 ? ExclamationTriangleIcon : WrenchScrewdriverIcon,
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
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
