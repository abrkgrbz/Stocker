'use client';

/**
 * Sales Team Detail Page
 * Design following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Modal, Form, Input, Select, InputNumber, Button } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSalesTeam, useAddSalesTeamMember, useRemoveSalesTeamMember } from '@/lib/api/hooks/useCRM';
import { SalesTeamRole } from '@/lib/api/services/crm.types';
import { confirmDelete, showDeleteSuccess, showError } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const roleLabels: Record<SalesTeamRole, { label: string; color: string }> = {
  [SalesTeamRole.Member]: { label: 'Üye', color: 'default' },
  [SalesTeamRole.Senior]: { label: 'Kıdemli', color: 'blue' },
  [SalesTeamRole.Leader]: { label: 'Lider', color: 'cyan' },
  [SalesTeamRole.Manager]: { label: 'Yönetici', color: 'purple' },
  [SalesTeamRole.Director]: { label: 'Direktör', color: 'gold' },
};

const roleOptions = [
  { value: SalesTeamRole.Member, label: 'Üye' },
  { value: SalesTeamRole.Senior, label: 'Kıdemli' },
  { value: SalesTeamRole.Leader, label: 'Lider' },
  { value: SalesTeamRole.Manager, label: 'Yönetici' },
  { value: SalesTeamRole.Director, label: 'Direktör' },
];

export default function SalesTeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const [form] = Form.useForm();

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const { data: team, isLoading, error, refetch } = useSalesTeam(teamId);
  const addMember = useAddSalesTeamMember();
  const removeMember = useRemoveSalesTeamMember();

  const handleAddMember = async (values: any) => {
    try {
      await addMember.mutateAsync({
        salesTeamId: teamId,
        userId: values.userId,
        userName: values.userName,
        role: values.role,
      });
      setIsAddMemberModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    const confirmed = await confirmDelete('Üye', userName || 'Bu üye');

    if (confirmed) {
      try {
        await removeMember.mutateAsync({ salesTeamId: teamId, userId });
        showDeleteSuccess('üye');
        refetch();
      } catch (error) {
        showError('Üye çıkarılamadı');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Empty description="Satış ekibi bulunamadı" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/sales-teams')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  team.isActive ? 'bg-slate-100' : 'bg-slate-100'
                }`}
              >
                <UsersIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{team.name}</h1>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      team.isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {team.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {team.code || 'Kod belirtilmemiş'} • {team.activeMemberCount || 0} Aktif Üye
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/sales-teams/${team.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Düzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Ekip Bilgileri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ekip Adı</p>
                  <p className="text-sm font-medium text-slate-900">{team.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ekip Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{team.code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      team.isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {team.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Aktif Üye</p>
                  <p className="text-sm font-medium text-slate-900">{team.activeMemberCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Toplam Üye</p>
                  <p className="text-sm font-medium text-slate-900">{team.totalMemberCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {team.createdAt ? dayjs(team.createdAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                {team.teamEmail && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ekip E-postası</p>
                    <a
                      href={`mailto:${team.teamEmail}`}
                      className="text-sm text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      <EnvelopeIcon className="w-3 h-3" />
                      {team.teamEmail}
                    </a>
                  </div>
                )}
                {team.communicationChannel && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">İletişim Kanalı</p>
                    <p className="text-sm font-medium text-slate-900">{team.communicationChannel}</p>
                  </div>
                )}
              </div>

              {team.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{team.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Target & Leader Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Hedef & Liderlik
              </h3>

              {team.teamLeaderName && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{team.teamLeaderName}</p>
                    <p className="text-xs text-slate-500">Ekip Lideri</p>
                  </div>
                </div>
              )}

              {team.salesTarget !== undefined && team.salesTarget > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Satış Hedefi</span>
                    {team.targetPeriod && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {team.targetPeriod}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {team.salesTarget.toLocaleString('tr-TR')} {team.currency || 'TRY'}
                  </p>
                </div>
              )}

              {team.territoryNames && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Atanan Bölgeler</span>
                  </div>
                  <p className="text-sm text-slate-700">{team.territoryNames}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Members Card */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">
                    Ekip Üyeleri ({team.members?.length || 0})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:text-slate-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Üye Ekle
                </button>
              </div>

              {team.members && team.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => {
                    const roleInfo = roleLabels[member.role] || { label: String(member.role), color: 'default' };
                    return (
                      <div
                        key={member.id}
                        className={`p-4 rounded-lg border group relative ${
                          member.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.userId, member.userName || '')}
                          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                          title="Üyeyi çıkar"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              member.isActive ? 'bg-slate-100' : 'bg-slate-200'
                            }`}
                          >
                            <UserIcon
                              className={`w-5 h-5 ${member.isActive ? 'text-slate-600' : 'text-slate-400'}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {member.userName || 'İsimsiz'}
                            </p>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                member.role === SalesTeamRole.Leader || member.role === SalesTeamRole.Manager || member.role === SalesTeamRole.Director
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {roleInfo.label}
                            </span>
                          </div>
                          {!member.isActive && (
                            <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                              Pasif
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Katılım Tarihi</span>
                            <span className="font-medium text-slate-800">
                              {member.joinedDate ? dayjs(member.joinedDate).format('DD/MM/YYYY') : '-'}
                            </span>
                          </div>
                          {member.individualTarget !== undefined && member.individualTarget > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Bireysel Hedef</span>
                              <span className="font-medium text-slate-800">
                                {member.individualTarget.toLocaleString('tr-TR')}
                              </span>
                            </div>
                          )}
                          {member.commissionRate !== undefined && member.commissionRate > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Komisyon Oranı</span>
                              <span className="font-medium text-slate-800">%{member.commissionRate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  <UserPlusIcon className="w-8 h-8 text-slate-400 mb-2 mx-auto" />
                  <div className="text-sm text-slate-500">Henüz üye eklenmemiş</div>
                  <div className="text-xs text-slate-400 mt-1">Eklemek için tıklayın</div>
                </div>
              )}
            </div>
          </div>

          {/* Parent Team Card */}
          {team.parentTeamId && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Üst Ekip
                </h3>
                <div
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => router.push(`/crm/sales-teams/${team.parentTeamId}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {team.parentTeamName || 'Üst Ekip'}
                    </p>
                    <p className="text-xs text-slate-500">Üst ekip bağlantısı</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        title={null}
        open={isAddMemberModalOpen}
        onCancel={() => {
          setIsAddMemberModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={480}
        centered
        closeIcon={<XMarkIcon className="w-5 h-5 text-slate-400" />}
      >
        <div className="pt-2">
          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <UserPlusIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 m-0">Yeni Üye Ekle</h2>
              <p className="text-sm text-slate-500 m-0">{team.name} ekibine üye ekleyin</p>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddMember}
            initialValues={{ role: SalesTeamRole.Member }}
          >
            {/* User ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Kullanıcı ID <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="userId"
                rules={[{ required: true, message: 'Kullanıcı ID zorunludur' }]}
                className="mb-0"
              >
                <InputNumber
                  placeholder="123"
                  min={1}
                  style={{ width: '100%' }}
                  className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                />
              </Form.Item>
            </div>

            {/* User Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Kullanıcı Adı
              </label>
              <Form.Item name="userName" className="mb-0">
                <Input
                  placeholder="Ahmet Yılmaz"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                />
              </Form.Item>
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Rol <span className="text-red-500">*</span>
              </label>
              <Form.Item
                name="role"
                rules={[{ required: true, message: 'Rol seçimi zorunludur' }]}
                className="mb-0"
              >
                <Select
                  placeholder="Rol seçin"
                  options={roleOptions}
                  className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                />
              </Form.Item>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  form.resetFields();
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={addMember.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {addMember.isPending ? 'Ekleniyor...' : 'Üye Ekle'}
              </button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
