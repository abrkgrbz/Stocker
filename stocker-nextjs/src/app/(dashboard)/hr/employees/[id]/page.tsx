'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Tabs, Table, Empty, Modal } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  IdentificationIcon,
  MapPinIcon,
  NoSymbolIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  BriefcaseIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  useEmployee,
  useEmployeeDocuments,
  useLeaveBalance,
  useEmployeeTrainings,
  useDeleteEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
} from '@/lib/api/hooks/useHR';
import { EmployeeStatus, Gender, EmploymentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

// Status configuration
const employeeStatusConfig: Record<number, { color: string; label: string; bgColor: string; textColor: string }> = {
  [EmployeeStatus.Active]: { color: 'green', label: 'Aktif', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  [EmployeeStatus.Inactive]: { color: 'default', label: 'Pasif', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
  [EmployeeStatus.OnLeave]: { color: 'blue', label: 'İzinde', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  [EmployeeStatus.Terminated]: { color: 'red', label: 'İşten Çıkarıldı', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  [EmployeeStatus.Resigned]: { color: 'orange', label: 'İstifa', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  [EmployeeStatus.Retired]: { color: 'gray', label: 'Emekli', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  [EmployeeStatus.Probation]: { color: 'purple', label: 'Deneme Süresinde', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  [EmployeeStatus.MilitaryService]: { color: 'cyan', label: 'Askerde', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' },
  [EmployeeStatus.MaternityLeave]: { color: 'magenta', label: 'Doğum İzni', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  [EmployeeStatus.SickLeave]: { color: 'volcano', label: 'Hastalık İzni', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
};

const defaultStatusConfig = { color: 'default', label: '-', bgColor: 'bg-slate-100', textColor: 'text-slate-500' };

const genderLabels: Record<Gender, string> = {
  [Gender.Male]: 'Erkek',
  [Gender.Female]: 'Kadın',
  [Gender.Other]: 'Diğer',
  [Gender.PreferNotToSay]: 'Belirtilmemiş',
};

const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Tam Zamanlı',
  [EmploymentType.PartTime]: 'Yarı Zamanlı',
  [EmploymentType.Contract]: 'Sözleşmeli',
  [EmploymentType.Intern]: 'Stajyer',
  [EmploymentType.Temporary]: 'Geçici',
  [EmploymentType.Consultant]: 'Danışman',
  [EmploymentType.Freelance]: 'Freelance',
  [EmploymentType.Probation]: 'Deneme Süresi',
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useState('info');

  // API Hooks
  const { data: employee, isLoading, error } = useEmployee(id);
  const { data: documents = [] } = useEmployeeDocuments(id);
  const { data: leaveBalances = [] } = useLeaveBalance(id);
  const { data: trainings = [] } = useEmployeeTrainings(id);
  const deleteEmployee = useDeleteEmployee();
  const activateEmployee = useActivateEmployee();
  const deactivateEmployee = useDeactivateEmployee();

  const handleDelete = () => {
    if (!employee) return;
    Modal.confirm({
      title: 'Çalışanı Sil',
      content: `"${employee.fullName}" çalışanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteEmployee.mutateAsync(id);
          router.push('/hr/employees');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!employee) return;
    try {
      if (employee.status === EmployeeStatus.Active) {
        await deactivateEmployee.mutateAsync(id);
      } else {
        await activateEmployee.mutateAsync(id);
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

  if (error || !employee) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Çalışan Bulunamadı</h3>
          <p className="text-red-600 mb-4">İstenen çalışan bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/hr/employees')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = employeeStatusConfig[employee.status] || defaultStatusConfig;

  // Calculate years of service
  const yearsOfService = employee.hireDate
    ? Math.floor((new Date().getTime() - new Date(employee.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  // Calculate health score (based on document completeness, trainings, etc.)
  const healthScore = Math.min(100, Math.round(
    (documents.length > 0 ? 30 : 0) +
    (leaveBalances.length > 0 ? 20 : 0) +
    (trainings.length > 0 ? 20 : 0) +
    (employee.email ? 10 : 0) +
    (employee.phone ? 10 : 0) +
    (employee.emergencyContactName ? 10 : 0)
  ));

  // Document columns
  const documentColumns = [
    { title: 'Belge Adı', dataIndex: 'documentName', key: 'name' },
    { title: 'Tür', dataIndex: 'documentTypeName', key: 'type' },
    {
      title: 'Son Geçerlilik',
      dataIndex: 'expiryDate',
      key: 'expiry',
      render: (date: string) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'Durum',
      dataIndex: 'isVerified',
      key: 'status',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'orange'}>{verified ? 'Doğrulandı' : 'Beklemede'}</Tag>
      ),
    },
  ];

  // Leave balance columns
  const leaveBalanceColumns = [
    { title: 'İzin Türü', dataIndex: 'leaveTypeName', key: 'type' },
    { title: 'Hak', dataIndex: 'entitlement', key: 'entitlement' },
    { title: 'Kullanılan', dataIndex: 'used', key: 'used' },
    { title: 'Kalan', dataIndex: 'remaining', key: 'remaining' },
  ];

  // Training columns
  const trainingColumns = [
    { title: 'Eğitim', dataIndex: 'trainingName', key: 'name' },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          Enrolled: 'blue',
          InProgress: 'orange',
          Completed: 'green',
          Cancelled: 'red',
        };
        const labels: Record<string, string> = {
          Enrolled: 'Kayıtlı',
          InProgress: 'Devam Ediyor',
          Completed: 'Tamamlandı',
          Cancelled: 'İptal',
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: 'Tamamlanma Tarihi',
      dataIndex: 'completedDate',
      key: 'completedDate',
      render: (date: string) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    { title: 'Puan', dataIndex: 'score', key: 'score', render: (score: number) => score || '-' },
  ];

  const tabItems = [
    {
      key: 'info',
      label: (
        <span className="flex items-center gap-2">
          <IdentificationIcon className="w-4 h-4" />
          Bilgiler
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Kişisel Bilgiler</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">TC Kimlik No</p>
                <p className="text-sm font-medium text-slate-900">{employee.nationalId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Cinsiyet</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.gender ? genderLabels[employee.gender] : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Doğum Tarihi</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.birthDate ? dayjs(employee.birthDate).format('DD.MM.YYYY') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Medeni Durum</p>
                <p className="text-sm font-medium text-slate-900">{employee.maritalStatus || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Uyruk</p>
                <p className="text-sm font-medium text-slate-900">{employee.nationality || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Kan Grubu</p>
                <p className="text-sm font-medium text-slate-900">{employee.bloodType || '-'}</p>
              </div>
            </div>
          </div>

          {/* Job Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">İş Bilgileri</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">İşe Giriş Tarihi</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.hireDate ? dayjs(employee.hireDate).format('DD.MM.YYYY') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Çalışma Tipi</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.employmentType ? employmentTypeLabels[employee.employmentType] : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Departman</p>
                <p className="text-sm font-medium text-slate-900">{employee.departmentName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Pozisyon</p>
                <p className="text-sm font-medium text-slate-900">{employee.positionTitle || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Yönetici</p>
                <p className="text-sm font-medium text-slate-900">{employee.managerName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Çalışma Lokasyonu</p>
                <p className="text-sm font-medium text-slate-900">{employee.workLocationName || '-'}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {employee.emergencyContactName && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <HeartIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Acil Durum İletişim</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ad Soyad</p>
                  <p className="text-sm font-medium text-slate-900">{employee.emergencyContactName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Telefon</p>
                  <p className="text-sm font-medium text-slate-900">{employee.emergencyContactPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Yakınlık</p>
                  <p className="text-sm font-medium text-slate-900">{employee.emergencyContactRelation || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'leaves',
      label: (
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          İzinler
        </span>
      ),
      children: (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {leaveBalances.length > 0 ? (
            <Table
              columns={leaveBalanceColumns}
              dataSource={leaveBalances}
              rowKey="leaveTypeId"
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="İzin bakiyesi bulunamadı" />
          )}
        </div>
      ),
    },
    {
      key: 'documents',
      label: (
        <span className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4" />
          Belgeler
        </span>
      ),
      children: (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {documents.length > 0 ? (
            <Table
              columns={documentColumns}
              dataSource={documents}
              rowKey="id"
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="Belge bulunamadı" />
          )}
        </div>
      ),
    },
    {
      key: 'trainings',
      label: (
        <span className="flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4" />
          Eğitimler
        </span>
      ),
      children: (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {trainings.length > 0 ? (
            <Table
              columns={trainingColumns}
              dataSource={trainings}
              rowKey="id"
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="Eğitim kaydı bulunamadı" />
          )}
        </div>
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
              onClick={() => router.push('/hr/employees')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${employee.status === EmployeeStatus.Active ? 'bg-violet-600' : 'bg-slate-400'}`}>
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{employee.fullName}</h1>
                  <Tag
                    icon={employee.status === EmployeeStatus.Active ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                    className={`border-0 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                  >
                    {statusConfig.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{employee.employeeCode} - {employee.positionTitle || 'Pozisyon belirtilmedi'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={employee.status === EmployeeStatus.Active ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
              onClick={handleToggleActive}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              {employee.status === EmployeeStatus.Active ? 'Pasifleştir' : 'Aktifleştir'}
            </Button>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/employees/${id}/edit`)}
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
          {/* Employee Info Section - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Çalışan Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ad Soyad</p>
                  <p className="text-sm font-medium text-slate-900">{employee.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">E-posta</p>
                  {employee.email ? (
                    <a href={`mailto:${employee.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {employee.email}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Telefon</p>
                  {employee.phone ? (
                    <a href={`tel:${employee.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {employee.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Departman</p>
                  <p className="text-sm font-medium text-slate-900">{employee.departmentName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pozisyon</p>
                  <p className="text-sm font-medium text-slate-900">{employee.positionTitle || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Yönetici</p>
                  <p className="text-sm font-medium text-slate-900">{employee.managerName || '-'}</p>
                </div>
              </div>

              {/* Address */}
              {(employee.street || employee.city) && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400 m-0">Adres</p>
                  </div>
                  <p className="text-sm text-slate-700">
                    {[employee.street, employee.city, employee.state, employee.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Health Score Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Çalışan Profil Durumu
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                    healthScore >= 70
                      ? 'bg-emerald-100 text-emerald-600'
                      : healthScore >= 50
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {healthScore}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-3">
                  {healthScore >= 70 ? 'Tam' : healthScore >= 50 ? 'Kısmi' : 'Eksik'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Profil Tamamlanma</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Kıdem (Yıl)</span>
                  <span className="font-medium text-slate-900">{yearsOfService}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Belge Sayısı</span>
                  <span className="font-medium text-slate-900">{documents.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Eğitim Sayısı</span>
                  <span className="font-medium text-slate-900">{trainings.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="px-6 pt-4"
          />
        </div>
      </div>
    </div>
  );
}
