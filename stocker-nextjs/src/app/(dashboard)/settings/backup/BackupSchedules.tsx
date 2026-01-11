'use client';

/**
 * Backup Schedules Component
 * Manages automatic backup schedules with CRUD operations
 */

import { useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, InputNumber } from 'antd';
import {
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Play,
  Pause,
  Edit3,
  AlertTriangle,
  Database,
  FileArchive,
  Settings,
  Shield,
} from 'lucide-react';
import { Spinner } from '@/components/primitives';
import {
  useBackupSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useEnableSchedule,
  useDisableSchedule,
  getScheduleTypeLabel,
  getBackupTypeLabel,
  getCronDescription,
  type BackupScheduleDto,
  type CreateBackupScheduleRequest,
} from '@/lib/api/hooks/useBackup';

// Preset cron expressions
const cronPresets = {
  Daily: [
    { label: 'Her gün 02:00', cron: '0 2 * * *' },
    { label: 'Her gün 03:00', cron: '0 3 * * *' },
    { label: 'Her gün 04:00', cron: '0 4 * * *' },
  ],
  Weekly: [
    { label: 'Her Pazar 03:00', cron: '0 3 * * 0' },
    { label: 'Her Pazartesi 03:00', cron: '0 3 * * 1' },
    { label: 'Her Cuma 03:00', cron: '0 3 * * 5' },
  ],
  Monthly: [
    { label: 'Her ayın 1. günü 04:00', cron: '0 4 1 * *' },
    { label: 'Her ayın 15. günü 04:00', cron: '0 4 15 * *' },
  ],
};

interface ScheduleFormData {
  scheduleName: string;
  scheduleType: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  cronExpression: string;
  backupType: 'Full' | 'Incremental' | 'Differential';
  includeDatabase: boolean;
  includeFiles: boolean;
  includeConfiguration: boolean;
  compress: boolean;
  encrypt: boolean;
  retentionDays: number;
}

const defaultFormData: ScheduleFormData = {
  scheduleName: '',
  scheduleType: 'Daily',
  cronExpression: '0 2 * * *',
  backupType: 'Full',
  includeDatabase: true,
  includeFiles: false,
  includeConfiguration: true,
  compress: true,
  encrypt: false,
  retentionDays: 30,
};

export default function BackupSchedules() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BackupScheduleDto | null>(null);
  const [deleteSchedule, setDeleteScheduleModal] = useState<BackupScheduleDto | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);

  // Queries & Mutations
  const { data: schedules, isLoading } = useBackupSchedules();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const enableSchedule = useEnableSchedule();
  const disableSchedule = useDisableSchedule();

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingSchedule(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (schedule: BackupScheduleDto) => {
    setFormData({
      scheduleName: schedule.scheduleName,
      scheduleType: schedule.scheduleType,
      cronExpression: schedule.cronExpression,
      backupType: schedule.backupType,
      includeDatabase: schedule.includeDatabase,
      includeFiles: schedule.includeFiles,
      includeConfiguration: schedule.includeConfiguration,
      compress: schedule.compress,
      encrypt: schedule.encrypt,
      retentionDays: schedule.retentionDays,
    });
    setEditingSchedule(schedule);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formData.scheduleName.trim()) return;

    try {
      if (editingSchedule) {
        await updateSchedule.mutateAsync({
          id: editingSchedule.id,
          request: formData as CreateBackupScheduleRequest,
        });
      } else {
        await createSchedule.mutateAsync(formData as CreateBackupScheduleRequest);
      }
      setShowCreateModal(false);
      setEditingSchedule(null);
      setFormData(defaultFormData);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteSchedule) return;
    try {
      await deleteScheduleMutation.mutateAsync(deleteSchedule.id);
      setDeleteScheduleModal(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggle = async (schedule: BackupScheduleDto) => {
    try {
      if (schedule.isEnabled) {
        await disableSchedule.mutateAsync(schedule.id);
      } else {
        await enableSchedule.mutateAsync(schedule.id);
      }
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Otomatik Yedekleme Zamanlamaları</h2>
          <p className="text-sm text-slate-500">Düzenli yedekleme işlemleri için zamanlama oluşturun</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Zamanlama
        </button>
      </div>

      {/* Schedules List */}
      {schedules && schedules.length > 0 ? (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white border rounded-lg p-4 ${
                schedule.isEnabled ? 'border-slate-200' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${schedule.isEnabled ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                    <Clock className={`w-5 h-5 ${schedule.isEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">{schedule.scheduleName}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          schedule.isEnabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {schedule.isEnabled ? 'Aktif' : 'Devre Dışı'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {getCronDescription(schedule.cronExpression)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileArchive className="w-3 h-3" />
                        {getBackupTypeLabel(schedule.backupType)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getScheduleTypeLabel(schedule.scheduleType)}
                      </span>
                      <span>Saklama: {schedule.retentionDays} gün</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(schedule)}
                    disabled={enableSchedule.isPending || disableSchedule.isPending}
                    className={`p-2 rounded-md transition-colors ${
                      schedule.isEnabled
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={schedule.isEnabled ? 'Devre dışı bırak' : 'Etkinleştir'}
                  >
                    {schedule.isEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(schedule)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteScheduleModal(schedule)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600">Başarılı: {schedule.successCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-slate-600">Başarısız: {schedule.failureCount}</span>
                </div>
                {schedule.lastExecutedAt && (
                  <div className="text-sm text-slate-500">
                    Son çalışma: {new Date(schedule.lastExecutedAt).toLocaleString('tr-TR')}
                  </div>
                )}
                {schedule.nextExecutionAt && (
                  <div className="text-sm text-slate-500">
                    Sonraki: {new Date(schedule.nextExecutionAt).toLocaleString('tr-TR')}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {schedule.lastErrorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm text-red-600">{schedule.lastErrorMessage}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz zamanlama yok</h3>
          <p className="text-sm text-slate-500 mb-4">
            Otomatik yedekleme için yeni bir zamanlama oluşturun
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Zamanlama Oluştur
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={
          <span className="text-slate-900 font-semibold">
            {editingSchedule ? 'Zamanlama Düzenle' : 'Yeni Zamanlama Oluştur'}
          </span>
        }
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onOk={handleSave}
        okText={(createSchedule.isPending || updateSchedule.isPending)
          ? (editingSchedule ? 'Kaydediliyor...' : 'Oluşturuluyor...')
          : (editingSchedule ? 'Kaydet' : 'Oluştur')}
        cancelText="İptal"
        confirmLoading={createSchedule.isPending || updateSchedule.isPending}
        okButtonProps={{
          disabled: !formData.scheduleName.trim(),
          className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900',
        }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
        width={520}
      >
        <Form layout="vertical" className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Schedule Name */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Zamanlama Adı</span>}
            required
            className="mb-4"
          >
            <Input
              value={formData.scheduleName}
              onChange={(e) => setFormData({ ...formData, scheduleName: e.target.value })}
              placeholder="Örn: Günlük Yedekleme"
              className="!rounded-lg !border-slate-300"
            />
          </Form.Item>

          {/* Schedule Type */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Zamanlama Tipi</span>}
            className="mb-4"
          >
            <Select
              value={formData.scheduleType}
              onChange={(value) => {
                const type = value as ScheduleFormData['scheduleType'];
                const presets = cronPresets[type as keyof typeof cronPresets];
                setFormData({
                  ...formData,
                  scheduleType: type,
                  cronExpression: presets?.[0]?.cron || formData.cronExpression,
                });
              }}
              className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
            >
              <Select.Option value="Daily">Günlük</Select.Option>
              <Select.Option value="Weekly">Haftalık</Select.Option>
              <Select.Option value="Monthly">Aylık</Select.Option>
              <Select.Option value="Custom">Özel</Select.Option>
            </Select>
          </Form.Item>

          {/* Cron Expression */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Zamanlama</span>}
            help={<span className="text-slate-500">{getCronDescription(formData.cronExpression)}</span>}
            className="mb-4"
          >
            {formData.scheduleType !== 'Custom' && cronPresets[formData.scheduleType as keyof typeof cronPresets] ? (
              <Select
                value={formData.cronExpression}
                onChange={(value) => setFormData({ ...formData, cronExpression: value })}
                className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
              >
                {cronPresets[formData.scheduleType as keyof typeof cronPresets].map((preset) => (
                  <Select.Option key={preset.cron} value={preset.cron}>
                    {preset.label}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                placeholder="0 2 * * *"
                className="!rounded-lg !border-slate-300"
              />
            )}
          </Form.Item>

          {/* Backup Type */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Yedekleme Tipi</span>}
            className="mb-4"
          >
            <Select
              value={formData.backupType}
              onChange={(value) => setFormData({ ...formData, backupType: value as ScheduleFormData['backupType'] })}
              className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-300"
            >
              <Select.Option value="Full">Tam Yedek</Select.Option>
              <Select.Option value="Incremental">Artımlı</Select.Option>
              <Select.Option value="Differential">Fark</Select.Option>
            </Select>
          </Form.Item>

          {/* Include Options */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Dahil Edilecekler</span>}
            className="mb-4"
          >
            <div className="space-y-2">
              <Checkbox
                checked={formData.includeDatabase}
                onChange={(e) => setFormData({ ...formData, includeDatabase: e.target.checked })}
                className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-slate-900 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-slate-900"
              >
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <Database className="w-4 h-4 text-slate-500" />
                  Veritabanı
                </span>
              </Checkbox>
              <br />
              <Checkbox
                checked={formData.includeFiles}
                onChange={(e) => setFormData({ ...formData, includeFiles: e.target.checked })}
                className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-slate-900 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-slate-900"
              >
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <FileArchive className="w-4 h-4 text-slate-500" />
                  Dosyalar
                </span>
              </Checkbox>
              <br />
              <Checkbox
                checked={formData.includeConfiguration}
                onChange={(e) => setFormData({ ...formData, includeConfiguration: e.target.checked })}
                className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-slate-900 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-slate-900"
              >
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <Settings className="w-4 h-4 text-slate-500" />
                  Yapılandırma
                </span>
              </Checkbox>
            </div>
          </Form.Item>

          {/* Compression & Encryption */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Güvenlik</span>}
            className="mb-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                checked={formData.compress}
                onChange={(e) => setFormData({ ...formData, compress: e.target.checked })}
                className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-slate-900 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-slate-900"
              >
                <span className="text-slate-700">Sıkıştır</span>
              </Checkbox>
              <Checkbox
                checked={formData.encrypt}
                onChange={(e) => setFormData({ ...formData, encrypt: e.target.checked })}
                className="[&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-slate-900 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-slate-900"
              >
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <Shield className="w-4 h-4 text-slate-500" />
                  Şifrele
                </span>
              </Checkbox>
            </div>
          </Form.Item>

          {/* Retention Days */}
          <Form.Item
            label={<span className="text-slate-700 font-medium">Saklama Süresi (Gün)</span>}
            help={<span className="text-slate-500">Yedekler bu süre sonunda otomatik olarak silinecektir</span>}
            className="mb-0"
          >
            <InputNumber
              min={1}
              max={365}
              value={formData.retentionDays}
              onChange={(value) => setFormData({ ...formData, retentionDays: value || 30 })}
              style={{ width: '100%' }}
              className="!rounded-lg [&_.ant-input-number-input]:!border-slate-300"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Zamanlama Sil</span>}
        open={!!deleteSchedule}
        onCancel={() => setDeleteScheduleModal(null)}
        onOk={handleDelete}
        okText={deleteScheduleMutation.isPending ? 'Siliniyor...' : 'Sil'}
        cancelText="İptal"
        confirmLoading={deleteScheduleMutation.isPending}
        okButtonProps={{
          danger: true,
          icon: <Trash2 className="w-4 h-4" />,
        }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
        width={450}
      >
        <div className="flex items-start gap-4 mt-4">
          <div className="flex-shrink-0 p-2 bg-slate-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <p className="text-sm text-slate-600">
              <strong>&ldquo;{deleteSchedule?.scheduleName}&rdquo;</strong> zamanlamasını silmek istediğinize emin misiniz?
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Bu işlem geri alınamaz!
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
