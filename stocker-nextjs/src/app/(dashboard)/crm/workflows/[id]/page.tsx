'use client';

import React, { useState, useEffect, use } from 'react';
import { Empty, Spin, Modal, message } from 'antd';
import {
  ThunderboltOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { CRMService } from '@/lib/api/services/crm.service';
import type { WorkflowDto, WorkflowActionType } from '@/lib/api/services/crm.types';
import type { TriggerConfiguration } from '@/components/crm/workflows/ConfigureTriggerDrawer';
import type { WorkflowActionConfig } from '@/components/crm/workflows/ActionBlock';
import TriggerBlock from '@/components/crm/workflows/TriggerBlock';
import ActionBlock from '@/components/crm/workflows/ActionBlock';
import ActionSelectorDrawer from '@/components/crm/workflows/ActionSelectorDrawer';
import ActionConfigDrawer from '@/components/crm/workflows/ActionConfigDrawer';
import ConfigureTriggerDrawer from '@/components/crm/workflows/ConfigureTriggerDrawer';
import { type Step1FormData } from '@/components/crm/workflows/CreateWorkflowDrawer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { confirm } = Modal;

interface WorkflowDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<any>;
}

export default function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const workflowId = parseInt(resolvedParams.id);
  const [workflow, setWorkflow] = useState<WorkflowDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Builder state
  const [actions, setActions] = useState<WorkflowActionConfig[]>([]);
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfiguration | null>(null);

  // Drawer states
  const [actionSelectorOpen, setActionSelectorOpen] = useState(false);
  const [actionConfigOpen, setActionConfigOpen] = useState(false);
  const [triggerConfigOpen, setTriggerConfigOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<WorkflowActionType | null>(null);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);

  // Load workflow details
  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const data = await CRMService.getWorkflow(workflowId);
      setWorkflow(data);

      // Parse trigger configuration - always create a default config
      let parsedConfig: any = { type: 'manual' };
      if (data.triggerConditions) {
        try {
          parsedConfig = JSON.parse(data.triggerConditions);
          // Ensure config has a type
          if (!parsedConfig.type) {
            parsedConfig = {
              type: data.triggerType === 'Manual' ? 'manual' :
                    data.triggerType === 'Scheduled' ? 'scheduled' : 'event'
            };
          }
        } catch (e) {
          console.error('Failed to parse trigger config', e);
          parsedConfig = {
            type: data.triggerType === 'Manual' ? 'manual' :
                  data.triggerType === 'Scheduled' ? 'scheduled' : 'event'
          };
        }
      } else {
        // No trigger conditions - create default based on trigger type
        parsedConfig = {
          type: data.triggerType === 'Manual' ? 'manual' :
                data.triggerType === 'Scheduled' ? 'scheduled' : 'event'
        };
      }

      setTriggerConfig({
        type: data.triggerType,
        entityType: data.entityType,
        config: parsedConfig,
      });

      // Convert steps to actions
      if (data.steps && data.steps.length > 0) {
        const convertedActions: WorkflowActionConfig[] = data.steps.map((step) => ({
          id: step.id?.toString(),
          type: step.actionType,
          name: step.name,
          description: step.description,
          parameters: step.actionConfiguration ? JSON.parse(step.actionConfiguration) : {},
          delayMinutes: step.delayMinutes,
          isEnabled: step.isEnabled,
          stepOrder: step.stepOrder,
        }));
        setActions(convertedActions);
      }

      setLoading(false);
    } catch (error) {
      showApiError(error, 'Workflow detayları yüklenemedi');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  // Handle activate/deactivate
  const handleToggleActive = async () => {
    if (!workflow) return;

    try {
      if (workflow.isActive) {
        await CRMService.deactivateWorkflow(workflowId);
        showSuccess('Workflow deaktif edildi');
      } else {
        await CRMService.activateWorkflow(workflowId);
        showSuccess('Workflow aktif edildi');
      }
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow durumu değiştirilemedi');
    }
  };

  // Handle save workflow
  const handleSave = async () => {
    if (!workflow) return;

    setSaving(true);
    try {
      // Convert actions to steps with correct backend format
      const steps = actions.map((action, index) => ({
        id: action.id ? parseInt(action.id) : null,
        name: action.name,
        description: action.description || '',
        actionType: action.type,
        actionConfiguration: JSON.stringify(action.parameters),
        conditions: '',
        stepOrder: index + 1,
        delayMinutes: action.delayMinutes || 0,
        isEnabled: action.isEnabled !== false,
        continueOnError: false,
      }));

      await CRMService.updateWorkflow(workflowId, {
        name: workflow.name,
        description: workflow.description || '',
        triggerType: workflow.triggerType,
        entityType: workflow.entityType,
        triggerConditions: triggerConfig ? JSON.stringify(triggerConfig.config) : workflow.triggerConditions || '{}',
        isActive: workflow.isActive,
        steps: steps as any,
      });

      showSuccess('Workflow kaydedildi');
      loadWorkflow();
    } catch (error) {
      showApiError(error, 'Workflow kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  // Action handlers
  const handleSelectActionType = (actionType: WorkflowActionType) => {
    setSelectedActionType(actionType);
    setActionConfigOpen(true);
  };

  const handleSaveAction = (actionData: Partial<WorkflowActionConfig>) => {
    if (editingActionIndex !== null) {
      const updatedActions = [...actions];
      updatedActions[editingActionIndex] = {
        ...updatedActions[editingActionIndex],
        ...actionData,
      };
      setActions(updatedActions);
      message.success('Aksiyon güncellendi');
    } else {
      const newAction: WorkflowActionConfig = {
        ...actionData,
        type: actionData.type!,
        name: actionData.name!,
        stepOrder: actions.length + 1,
        parameters: actionData.parameters || {},
      };
      setActions([...actions, newAction]);
      message.success('Aksiyon eklendi');
    }

    setActionConfigOpen(false);
    setSelectedActionType(null);
    setEditingActionIndex(null);
  };

  const handleEditAction = (index: number) => {
    setEditingActionIndex(index);
    setSelectedActionType(actions[index].type);
    setActionConfigOpen(true);
  };

  const handleDeleteAction = (index: number) => {
    confirm({
      title: 'Aksiyonu Sil',
      content: 'Bu aksiyonu silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk() {
        const updatedActions = actions.filter((_, i) => i !== index);
        updatedActions.forEach((action, i) => {
          action.stepOrder = i + 1;
        });
        setActions(updatedActions);
        message.success('Aksiyon silindi');
      },
    });
  };

  const handleDuplicateAction = (index: number) => {
    const actionToDuplicate = actions[index];
    const newAction: WorkflowActionConfig = {
      ...actionToDuplicate,
      id: undefined,
      name: `${actionToDuplicate.name} (Kopya)`,
      stepOrder: actions.length + 1,
    };
    setActions([...actions, newAction]);
    message.success('Aksiyon kopyalandı');
  };

  const handleEditTrigger = () => {
    setTriggerConfigOpen(true);
  };

  const handleSaveTriggerConfig = (config: TriggerConfiguration) => {
    setTriggerConfig(config);
    setTriggerConfigOpen(false);
    message.success('Tetikleyici güncellendi');
  };

  if (loading && !workflow) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Empty description="Workflow bulunamadı">
          <button
            onClick={() => router.push('/crm/workflows')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            Workflows'a Dön
          </button>
        </Empty>
      </div>
    );
  }

  const step1Data: Step1FormData = {
    name: workflow.name,
    description: workflow.description,
    status: workflow.isActive ? 'active' : 'inactive',
    triggerType: workflow.triggerType,
    entityType: workflow.entityType,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/crm/workflows')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftOutlined />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <ThunderboltOutlined className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">{workflow.name}</h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        workflow.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {workflow.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Aktif
                        </>
                      ) : (
                        'Pasif'
                      )}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{workflow.entityType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  workflow.isActive
                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                }`}
              >
                {workflow.isActive ? (
                  <>
                    <PauseCircleOutlined />
                    Deaktif Et
                  </>
                ) : (
                  <>
                    <PlayCircleOutlined />
                    Aktif Et
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <SaveOutlined className={saving ? 'animate-spin' : ''} />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Workflow Builder - Main Area */}
          <div className="col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl">
              {/* Builder Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Workflow Builder</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tetikleyiciyi yapılandırın ve aksiyonları ekleyin
                </p>
              </div>

              {/* Builder Content */}
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  {/* Trigger Block */}
                  {triggerConfig && (
                    <TriggerBlock trigger={triggerConfig} onEdit={handleEditTrigger} />
                  )}

                  {/* Connection Line */}
                  <div className="flex justify-center py-4">
                    <div className="flex flex-col items-center">
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                    </div>
                  </div>

                  {/* Action Blocks */}
                  {actions.map((action, index) => (
                    <React.Fragment key={index}>
                      <ActionBlock
                        action={action}
                        index={index}
                        onEdit={() => handleEditAction(index)}
                        onDelete={() => handleDeleteAction(index)}
                        onDuplicate={() => handleDuplicateAction(index)}
                      />

                      {/* Connection Line */}
                      <div className="flex justify-center py-4">
                        <div className="flex flex-col items-center">
                          <div className="w-px h-8 bg-slate-200"></div>
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                          <div className="w-px h-8 bg-slate-200"></div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Add Action Button */}
                  <button
                    onClick={() => setActionSelectorOpen(true)}
                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <PlusOutlined className="text-lg" />
                      </div>
                      <span className="text-sm font-medium">Aksiyon Ekle</span>
                    </div>
                  </button>

                  {/* Empty State */}
                  {actions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400">
                        Henüz aksiyon eklenmedi. Yukarıdaki butona tıklayarak aksiyon ekleyin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Info */}
          <div className="col-span-4 space-y-6">
            {/* Stats Card */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">İstatistikler</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                      <BarChartOutlined className="text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-600">Toplam Adım</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{actions.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircleOutlined className="text-green-600" />
                    </div>
                    <span className="text-sm text-slate-600">Aktif Adım</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {actions.filter((a) => a.isEnabled !== false).length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                      <ThunderboltOutlined className="text-purple-600" />
                    </div>
                    <span className="text-sm text-slate-600">Çalıştırma</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{workflow.executionCount}</span>
                </div>
              </div>
            </div>

            {/* Last Execution Card */}
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Son Çalıştırma</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ClockCircleOutlined className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {workflow.lastExecutedAt
                        ? dayjs(workflow.lastExecutedAt).format('DD.MM.YYYY HH:mm')
                        : 'Hiç çalıştırılmadı'}
                    </p>
                    {workflow.lastExecutedAt && (
                      <p className="text-xs text-slate-500">
                        {dayjs(workflow.lastExecutedAt).fromNow()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            {workflow.description && (
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">Açıklama</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600">{workflow.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawers */}
      <ActionSelectorDrawer
        open={actionSelectorOpen}
        onClose={() => setActionSelectorOpen(false)}
        onSelect={handleSelectActionType}
      />

      <ActionConfigDrawer
        open={actionConfigOpen}
        actionType={selectedActionType}
        initialData={editingActionIndex !== null ? actions[editingActionIndex] : undefined}
        onClose={() => {
          setActionConfigOpen(false);
          setSelectedActionType(null);
          setEditingActionIndex(null);
        }}
        onSave={handleSaveAction}
      />

      <ConfigureTriggerDrawer
        open={triggerConfigOpen}
        step1Data={step1Data}
        onClose={() => setTriggerConfigOpen(false)}
        onBack={() => setTriggerConfigOpen(false)}
        onNext={handleSaveTriggerConfig}
      />
    </div>
  );
}
