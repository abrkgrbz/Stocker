'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { WrenchIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
      showSuccess('Yetkinlik basariyla silindi');
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <WrenchIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Calisan Yetkinlikleri</h1>
              <p className="text-sm text-slate-500">Calisan beceri ve yetkinliklerini takip edin ve yonetin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/hr/employee-skills/new')}
            className="flex items-center gap-2 px-4 py-2 !bg-slate-900 hover:!bg-slate-800 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Yetkinlik
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <EmployeeSkillsStats skills={filteredSkills} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Yetkinlikler yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Table Card with Search */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="relative max-w-md w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Yetkinlik ara... (yetkinlik adi, kategori, calisan)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              {totalCount} kayit
            </div>
          </div>
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
      </div>
    </div>
  );
}
