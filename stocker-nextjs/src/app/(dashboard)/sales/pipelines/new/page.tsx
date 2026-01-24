'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Switch, InputNumber, message, Spin, Button } from 'antd';
import {
  FunnelIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useCreatePipeline, useAddPipelineStage } from '@/features/sales';
import type { CreateSalesPipelineDto, AddPipelineStageDto } from '@/features/sales';
import Link from 'next/link';

const typeOptions = [
  { value: 'Sales', label: 'Satis' },
  { value: 'Service', label: 'Servis' },
  { value: 'Marketing', label: 'Pazarlama' },
  { value: 'Custom', label: 'Ozel' },
];

const categoryOptions = [
  { value: 'Lead', label: 'Aday' },
  { value: 'Qualification', label: 'Nitelendirme' },
  { value: 'Proposal', label: 'Teklif' },
  { value: 'Negotiation', label: 'Muzakere' },
  { value: 'Closing', label: 'Kapanis' },
  { value: 'Won', label: 'Kazanildi' },
  { value: 'Lost', label: 'Kaybedildi' },
];

interface StageFormValues {
  code: string;
  name: string;
  description?: string;
  successProbability: number;
  category: string;
  color?: string;
}

export default function NewPipelinePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreatePipeline();
  const addStageMutation = useAddPipelineStage();
  const [stages, setStages] = React.useState<StageFormValues[]>([]);

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        code: '',
        name: '',
        description: '',
        successProbability: 50,
        category: 'Lead',
        color: '#64748b',
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, field: keyof StageFormValues, value: string | number) => {
    const newStages = [...stages];
    (newStages[index] as Record<string, unknown>)[field] = value;
    setStages(newStages);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateSalesPipelineDto = {
        code: values.code as string,
        name: values.name as string,
        description: values.description as string | undefined,
        type: (values.type as string) || 'Sales',
        createWithDefaultStages: stages.length === 0 ? (values.createWithDefaultStages as boolean) : false,
      };

      const result = await createMutation.mutateAsync(data);

      // Add stages if any
      if (stages.length > 0 && result.id) {
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i];
          if (stage.code && stage.name) {
            const stageData: AddPipelineStageDto = {
              code: stage.code,
              name: stage.name,
              description: stage.description,
              orderIndex: i,
              successProbability: stage.successProbability,
              category: stage.category,
              color: stage.color,
            };
            await addStageMutation.mutateAsync({ id: result.id, data: stageData });
          }
        }
      }

      message.success('Pipeline basariyla olusturuldu');
      router.push('/sales/pipelines');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/pipelines"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <FunnelIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Yeni Pipeline</h1>
                <p className="text-sm text-slate-500">Yeni bir satis pipeline&apos;i olusturun</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/pipelines"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Vazgec
            </Link>
            <button
              onClick={() => form.submit()}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending && <Spin size="small" />}
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: 'Sales', createWithDefaultStages: true }}
        >
          {/* Pipeline Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Bilgileri</h2>
            <Form.Item
              name="name"
              label={<span className="text-slate-700 font-medium">Ad</span>}
              rules={[{ required: true, message: 'Pipeline adi zorunludur' }]}
            >
              <Input placeholder="Pipeline adini girin" className="h-12 text-lg" />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="code"
                label={<span className="text-slate-700 font-medium">Kod</span>}
                rules={[{ required: true, message: 'Kod zorunludur' }]}
              >
                <Input placeholder="PIPELINE-001" />
              </Form.Item>
              <Form.Item
                name="type"
                label={<span className="text-slate-700 font-medium">Tur</span>}
              >
                <Select options={typeOptions} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <Form.Item
              name="description"
              label={<span className="text-slate-700 font-medium">Aciklama</span>}
            >
              <Input.TextArea rows={3} placeholder="Pipeline aciklamasi..." />
            </Form.Item>
            {stages.length === 0 && (
              <Form.Item
                name="createWithDefaultStages"
                valuePropName="checked"
                label={<span className="text-slate-700 font-medium">Varsayilan asamalarla olustur</span>}
              >
                <Switch />
              </Form.Item>
            )}
          </div>

          {/* Asamalar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Asamalar</h2>
              <Button
                type="dashed"
                onClick={handleAddStage}
                icon={<PlusIcon className="w-4 h-4" />}
                className="flex items-center gap-1"
              >
                Asama Ekle
              </Button>
            </div>

            {stages.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <FunnelIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Henuz asama eklenmedi. Varsayilan asamalar kullanilacak veya manuel ekleyin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Asama {index + 1}</span>
                      <button
                        onClick={() => handleRemoveStage(index)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Kod</label>
                        <Input
                          value={stage.code}
                          onChange={(e) => handleStageChange(index, 'code', e.target.value)}
                          placeholder="LEAD"
                          size="small"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Ad</label>
                        <Input
                          value={stage.name}
                          onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                          placeholder="Aday"
                          size="small"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Kategori</label>
                        <Select
                          value={stage.category}
                          onChange={(value) => handleStageChange(index, 'category', value)}
                          options={categoryOptions}
                          size="small"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Basari Olasiligi (%)</label>
                        <InputNumber
                          value={stage.successProbability}
                          onChange={(value) => handleStageChange(index, 'successProbability', value || 0)}
                          min={0}
                          max={100}
                          size="small"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Renk</label>
                        <Input
                          type="color"
                          value={stage.color || '#64748b'}
                          onChange={(e) => handleStageChange(index, 'color', e.target.value)}
                          size="small"
                          className="h-[24px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Aciklama</label>
                        <Input
                          value={stage.description || ''}
                          onChange={(e) => handleStageChange(index, 'description', e.target.value)}
                          placeholder="Aciklama"
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
