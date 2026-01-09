'use client';

/**
 * Department Management Page
 * Monochrome Design System - Slate-based color palette
 * - Page wrapper: min-h-screen bg-slate-50 p-8
 * - Header icon: w-12 h-12 rounded-xl bg-slate-900 with white icon
 * - Stat cards: bg-white border border-slate-200 rounded-xl p-5
 * - Table: Custom slate-based styling
 * - Primary button: bg-slate-900 hover:bg-slate-800
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Tooltip } from 'antd';
import {
  BuildingOffice2Icon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import {
  deleteDepartment,
  type Department,
} from '@/lib/api/departments';
import { useDepartments } from '@/hooks/useDepartments';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import { Spinner } from '@/components/primitives';

export default function DepartmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading } = useDepartments();

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showDeleteSuccess('departman');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Departman silinirken bir hata oluştu';
      showError(errorMessage);
    },
  });

  const handleCreate = () => {
    router.push('/settings/departments/new');
  };

  const handleEdit = (department: Department) => {
    router.push(`/settings/departments/${department.id}/edit`);
  };

  const handleDelete = async (department: Department) => {
    const additionalWarning = department.employeeCount > 0
      ? `Bu departmanda ${department.employeeCount} çalışan var. Silmeden önce çalışanları başka bir departmana atamanız gerekir.`
      : undefined;

    const confirmed = await confirmDelete('Departman', department.name, additionalWarning);

    if (confirmed && department.employeeCount === 0) {
      deleteMutation.mutate(department.id);
    }
  };

  const columns: ColumnsType<Department> = [
    {
      title: 'Departman',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Department) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <BuildingOffice2Icon className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            {record.code && (
              <div className="text-xs text-slate-400">{record.code}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (description?: string) => (
        <span className="text-sm text-slate-500">
          {description || <span className="text-slate-300">—</span>}
        </span>
      ),
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      align: 'center',
      width: 100,
      render: (count: number) => (
        <div className="flex items-center justify-center gap-1.5">
          <UsersIcon className="w-3 h-3 text-slate-400" />
          <span className={`text-sm ${count > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
            {count}
          </span>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Düzenle">
            <button
              onClick={() => handleEdit(record)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip title="Sil">
            <button
              onClick={() => handleDelete(record)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={record.employeeCount > 0}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Monochrome Icon */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <BuildingOffice2Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Departmanlar</h1>
              <p className="text-sm text-slate-500">Organizasyonunuzun departmanlarını yönetin</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Departman
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Departman</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingOffice2Icon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{departments.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Çalışan</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aktif Departman</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingOffice2Icon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              {departments.filter(d => d.employeeCount > 0).length}
            </div>
          </div>
        </div>

        {/* Table */}
        {departments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BuildingOffice2Icon className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">Henüz departman eklenmemiş</h3>
            <p className="text-xs text-slate-500 mb-4">Organizasyonunuzu yapılandırmak için ilk departmanınızı oluşturun.</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Departman Oluştur
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <Table
              columns={columns}
              dataSource={departments}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => (
                  <span className="text-sm text-slate-500">
                    Toplam {total} departman
                  </span>
                ),
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
