'use client';

/**
 * Department Management Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Stacked list layout for data
 * - Action buttons only in designated areas
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
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
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
  EmptyState,
  LoadingState,
} from '@/components/ui/enterprise-page';

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
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <ApartmentOutlined style={{ color: '#8b5cf6', fontSize: 14 }} />
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
          <TeamOutlined className="text-slate-400 text-xs" />
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
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <EditOutlined className="text-sm" />
            </button>
          </Tooltip>
          <Tooltip title="Sil">
            <button
              onClick={() => handleDelete(record)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              disabled={record.employeeCount > 0}
            >
              <DeleteOutlined className="text-sm" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <PageContainer maxWidth="5xl">
      <ListPageHeader
        icon={<ApartmentOutlined />}
        iconColor="#8b5cf6"
        title="Departmanlar"
        description="Organizasyonunuzun departmanlarını yönetin"
        itemCount={departments.length}
        primaryAction={{
          label: 'Yeni Departman',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
      />

      {departments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ApartmentOutlined className="text-xl" />}
            title="Henüz departman eklenmemiş"
            description="Organizasyonunuzu yapılandırmak için ilk departmanınızı oluşturun."
            action={{
              label: 'Departman Oluştur',
              onClick: handleCreate,
            }}
          />
        </Card>
      ) : (
        <DataTableWrapper>
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
            className="enterprise-table"
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
