'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Table, Empty, Modal } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  useDepartment,
  useEmployees,
  useDeleteDepartment,
  useActivateDepartment,
  useDeactivateDepartment,
} from '@/lib/api/hooks/useHR';
import { EmployeeStatus } from '@/lib/api/services/hr.types';

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: department, isLoading, error } = useDepartment(id);
  const { data: allEmployees = [] } = useEmployees({ departmentId: id });
  const deleteDepartment = useDeleteDepartment();
  const activateDepartment = useActivateDepartment();
  const deactivateDepartment = useDeactivateDepartment();

  // Employees for this department
  const departmentEmployees = allEmployees;
  const activeEmployeeCount = departmentEmployees.filter((e) => e.status === EmployeeStatus.Active).length;

  const handleDelete = () => {
    if (!department) return;
    Modal.confirm({
      title: 'Departmanı Sil',
      content: `"${department.name}" departmanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDepartment.mutateAsync(id);
          router.push('/hr/departments');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!department) return;
    try {
      if (department.isActive) {
        await deactivateDepartment.mutateAsync(id);
      } else {
        await activateDepartment.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Departman Bulunamadı</h3>
          <p className="text-red-600 mb-4">İstenen departman bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/hr/departments')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const employeeColumns = [
    {
      title: 'Ad Soyad',
      key: 'name',
      render: (_: any, record: any) => (
        <a
          onClick={() => router.push(`/hr/employees/${record.id}`)}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {record.fullName}
        </a>
      ),
    },
    { title: 'Pozisyon', dataIndex: 'positionTitle', key: 'position' },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === EmployeeStatus.Active ? 'green' : 'default'}>
          {status === EmployeeStatus.Active ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/hr/departments')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${department.isActive ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{department.name}</h1>
                  <Tag
                    icon={department.isActive ? <CheckCircleIcon className="w-4 h-4" /> : null}
                    className={`border-0 ${
                      department.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {department.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{department.code}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={department.isActive ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              {department.isActive ? 'Pasifleştir' : 'Aktifleştir'}
            </Button>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/departments/${id}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Department Info Section - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Departman Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Departman Adı</p>
                  <p className="text-sm font-medium text-slate-900">{department.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Departman Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{department.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Üst Departman</p>
                  <p className="text-sm font-medium text-slate-900">{department.parentDepartmentName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Departman Müdürü</p>
                  <p className="text-sm font-medium text-slate-900">{department.managerName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Maliyet Merkezi</p>
                  <p className="text-sm font-medium text-slate-900">{department.costCenter || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Konum</p>
                  <p className="text-sm font-medium text-slate-900">{department.location || '-'}</p>
                </div>
              </div>

              {/* Description */}
              {department.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{department.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Departman İstatistikleri
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold bg-indigo-100 text-indigo-600">
                  {department.employeeCount || 0}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-3">Toplam Çalışan</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Aktif Çalışan</span>
                  <span className="font-medium text-emerald-600">{activeEmployeeCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Pasif Çalışan</span>
                  <span className="font-medium text-slate-900">{(department.employeeCount || 0) - activeEmployeeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <UsersIcon className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
              Departman Çalışanları
            </p>
          </div>
          {departmentEmployees.length > 0 ? (
            <Table
              columns={employeeColumns}
              dataSource={departmentEmployees}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          ) : (
            <Empty description="Bu departmanda çalışan bulunamadı" />
          )}
        </div>
      </div>
    </div>
  );
}
