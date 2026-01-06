'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { WrenchIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { EmployeeSkillsStats, EmployeeSkillsTable } from '@/components/hr/employee-skills';
import { useEmployeeSkills, useDeleteEmployeeSkill } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { EmployeeSkillDto } from '@/lib/api/services/hr.types';

export default function EmployeeSkillsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: skillsData, isLoading, error, refetch } = useEmployeeSkills();
  const deleteSkillMutation = useDeleteEmployeeSkill();

  // Client-side filtering
  const filteredSkills = useMemo(() => {
    const skills = skillsData || [];
    if (!debouncedSearch) return skills;
    const lower = debouncedSearch.toLowerCase();
    return skills.filter((item: EmployeeSkillDto) =>
      item.skillName?.toLowerCase().includes(lower) ||
      item.category?.toLowerCase().includes(lower) ||
      item.proficiencyLevel?.toLowerCase().includes(lower)
    );
  }, [skillsData, debouncedSearch]);

  const totalCount = filteredSkills.length;

  const handleView = (id: number) => {
    router.push(`/hr/employee-skills/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/employee-skills/${id}/edit`);
  };

  const handleDelete = async (skill: EmployeeSkillDto) => {
    try {
      await deleteSkillMutation.mutateAsync(skill.id);
      showSuccess('Yetkinlik başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Yetkinlik silinemedi');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <EmployeeSkillsStats skills={filteredSkills} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<WrenchIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Çalışan Yetkinlikleri"
        description="Çalışan beceri ve yetkinliklerini takip edin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Yetkinlik',
          onClick: () => router.push('/hr/employee-skills/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {error && (
        <Alert
          variant="error"
          title="Yetkinlikler yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button
              onClick={() => refetch()}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <DataTableWrapper className="mt-6">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Yetkinlik ara... (yetkinlik adı, kategori, çalışan)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <EmployeeSkillsTable
          skills={filteredSkills}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
