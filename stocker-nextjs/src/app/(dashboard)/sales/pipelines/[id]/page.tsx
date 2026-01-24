'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal, Input, InputNumber, Select, Spin, message } from 'antd';
import {
  FunnelIcon,
  ArrowLeftIcon,
  PlusIcon,
  CheckBadgeIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  usePipeline,
  useAddPipelineStage,
  useRemovePipelineStage,
  useSetDefaultPipeline,
  useActivatePipeline,
  useDeactivatePipeline,
} from '@/features/sales';
import type { AddPipelineStageDto, PipelineStageDto } from '@/features/sales';
import Link from 'next/link';

const categoryOptions = [
  { value: 'Lead', label: 'Aday' },
  { value: 'Qualification', label: 'Nitelendirme' },
  { value: 'Proposal', label: 'Teklif' },
  { value: 'Negotiation', label: 'Muzakere' },
  { value: 'Closing', label: 'Kapanis' },
  { value: 'Won', label: 'Kazanildi' },
  { value: 'Lost', label: 'Kaybedildi' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: pipeline, isLoading } = usePipeline(id);
  const addStageMutation = useAddPipelineStage();
  const removeStageMutation = useRemovePipelineStage();
  const setDefaultMutation = useSetDefaultPipeline();
  const activateMutation = useActivatePipeline();
  const deactivateMutation = useDeactivatePipeline();

  const [addStageModalOpen, setAddStageModalOpen] = useState(false);
  const [newStage, setNewStage] = useState<Partial<AddPipelineStageDto>>({
    successProbability: 50,
    category: 'Lead',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Pipeline bulunamadi</p>
          <Link href="/sales/pipelines" className="text-slate-900 hover:underline mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const handleAddStage = async () => {
    if (!newStage.code || !newStage.name) {
      message.error('Kod ve ad zorunludur');
      return;
    }
    try {
      const stageData: AddPipelineStageDto = {
        code: newStage.code,
        name: newStage.name,
        description: newStage.description,
        orderIndex: pipeline.stages.length,
        successProbability: newStage.successProbability || 50,
        category: newStage.category || 'Lead',
        color: newStage.color,
      };
      await addStageMutation.mutateAsync({ id, data: stageData });
      setAddStageModalOpen(false);
      setNewStage({ successProbability: 50, category: 'Lead' });
    } catch {
      // Error handled by hook
    }
  };

  const handleRemoveStage = async (stageId: string) => {
    Modal.confirm({
      title: 'Asama Sil',
      content: 'Bu asamayi silmek istediginizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: async () => {
        try {
          await removeStageMutation.mutateAsync({ id, stageId });
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const handleSetDefault = async () => {
    try {
      await setDefaultMutation.mutateAsync(id);
      message.success('Varsayilan pipeline ayarlandi');
    } catch {
      // Error handled by hook
    }
  };

  const handleToggleActive = async () => {
    try {
      if (pipeline.isActive) {
        await deactivateMutation.mutateAsync(id);
        message.success('Pipeline deaktif edildi');
      } else {
        await activateMutation.mutateAsync(id);
        message.success('Pipeline aktif edildi');
      }
    } catch {
      // Error handled by hook
    }
  };

  const sortedStages = [...(pipeline.stages || [])].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{pipeline.name}</h1>
                {pipeline.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                    <CheckBadgeIcon className="w-3 h-3" />
                    Varsayilan
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{pipeline.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleActive}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pipeline.isActive
                  ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  : 'text-white bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {pipeline.isActive ? 'Deaktif Et' : 'Aktif Et'}
            </button>
            {!pipeline.isDefault && (
              <button
                onClick={handleSetDefault}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Varsayilan Yap
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        {/* Pipeline Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Bilgileri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Durum</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                pipeline.isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {pipeline.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Tur</p>
              <p className="text-sm font-medium text-slate-900">{pipeline.type || 'Sales'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Firsat</p>
              <p className="text-sm font-medium text-slate-900">{pipeline.totalOpportunities}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Pipeline Degeri</p>
              <p className="text-sm font-medium text-slate-900">{formatCurrency(pipeline.totalPipelineValue)}</p>
            </div>
          </div>
          {pipeline.description && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Aciklama</p>
              <p className="text-sm text-slate-700">{pipeline.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Ortalama Donusum Orani</p>
              <p className="text-sm font-medium text-slate-900">{pipeline.averageConversionRate?.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Ortalama Kapanis Suresi</p>
              <p className="text-sm font-medium text-slate-900">{pipeline.averageDaysToClose} gun</p>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Asamalar</h2>
            <button
              onClick={() => setAddStageModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Asama Ekle
            </button>
          </div>

          {sortedStages.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
              <ArrowsUpDownIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Henuz asama eklenmemis</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Visual Pipeline Flow */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
                {sortedStages.map((stage: PipelineStageDto, index: number) => (
                  <React.Fragment key={stage.id}>
                    <div
                      className="flex-shrink-0 min-w-[140px] p-3 rounded-lg border border-slate-200 text-center"
                      style={{ borderLeftColor: stage.color || '#64748b', borderLeftWidth: '4px' }}
                    >
                      <p className="text-sm font-medium text-slate-900">{stage.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{stage.successProbability}%</p>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.opportunityCount} firsat</p>
                    </div>
                    {index < sortedStages.length - 1 && (
                      <ArrowRightIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Stage Details List */}
              <div className="border-t border-slate-100 pt-4">
                {sortedStages.map((stage: PipelineStageDto) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color || '#64748b' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{stage.name}</p>
                        <p className="text-xs text-slate-500">
                          {stage.code} - {stage.category} - Sira: {stage.orderIndex}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{stage.successProbability}%</p>
                        <p className="text-xs text-slate-500">{stage.opportunityCount} firsat</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(stage.stageValue)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStage(stage.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Stage Modal */}
      <Modal
        title="Yeni Asama Ekle"
        open={addStageModalOpen}
        onOk={handleAddStage}
        onCancel={() => setAddStageModalOpen(false)}
        okText="Ekle"
        cancelText="Vazgec"
        confirmLoading={addStageMutation.isPending}
      >
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kod *</label>
              <Input
                value={newStage.code || ''}
                onChange={(e) => setNewStage({ ...newStage, code: e.target.value })}
                placeholder="LEAD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ad *</label>
              <Input
                value={newStage.name || ''}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                placeholder="Aday"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <Select
              value={newStage.category}
              onChange={(value) => setNewStage({ ...newStage, category: value })}
              options={categoryOptions}
              style={{ width: '100%' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Basari Olasiligi (%)</label>
              <InputNumber
                value={newStage.successProbability}
                onChange={(value) => setNewStage({ ...newStage, successProbability: value || 50 })}
                min={0}
                max={100}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Renk</label>
              <Input
                type="color"
                value={newStage.color || '#64748b'}
                onChange={(e) => setNewStage({ ...newStage, color: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aciklama</label>
            <Input.TextArea
              value={newStage.description || ''}
              onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
              rows={2}
              placeholder="Asama aciklamasi..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
