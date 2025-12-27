'use client';

import React from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  EyeIcon,
  FlagIcon,
  LockClosedIcon,
  LockOpenIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  PhoneIcon,
  PrinterIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  UserPlusIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/** Eylem türleri için renk şeması */
export type ActionVariant =
  | 'primary'    // Mavi - Ana eylemler
  | 'success'    // Yeşil - Olumlu eylemler (Tamamla, Onayla)
  | 'warning'    // Turuncu - Dikkat gerektiren
  | 'danger'     // Kırmızı - Tehlikeli eylemler (Sil, İptal)
  | 'default';   // Gri - Nötr eylemler

/** Önceden tanımlı eylem tipleri */
export type ActionType =
  // Temel CRUD
  | 'view'
  | 'edit'
  | 'delete'
  | 'duplicate'
  // Durum değişiklikleri
  | 'complete'
  | 'cancel'
  | 'approve'
  | 'reject'
  | 'archive'
  | 'restore'
  // İletişim
  | 'send'
  | 'email'
  | 'call'
  | 'schedule'
  // Diğer
  | 'print'
  | 'download'
  | 'share'
  | 'lock'
  | 'unlock'
  | 'assign'
  | 'history'
  | 'notes'
  | 'favorite'
  | 'flag'
  | 'custom';

/** Tek bir eylem tanımı */
export interface RowAction {
  /** Benzersiz anahtar */
  key: string;
  /** Önceden tanımlı eylem tipi veya 'custom' */
  type?: ActionType;
  /** Görünen metin (Türkçe) */
  label: string;
  /** Ant Design ikon bileşeni */
  icon?: React.ReactNode;
  /** Renk varyantı */
  variant?: ActionVariant;
  /** Tıklama handler'ı */
  onClick?: () => void;
  /** Devre dışı mı? */
  disabled?: boolean;
  /** Devre dışıyken gösterilecek tooltip */
  disabledReason?: string;
  /** Görünür mü? (izin kontrolü için) */
  visible?: boolean;
  /** Onay gerekli mi? (tehlikeli eylemler için) */
  requireConfirm?: boolean;
  /** Onay mesajı */
  confirmMessage?: string;
  /** Yükleniyor durumu */
  loading?: boolean;
}

/** RowActions bileşeni props */
export interface RowActionsProps {
  /** Kayıt ID'si */
  id: string | number;
  /** Hızlı erişim eylemleri (direkt buton olarak gösterilir) */
  quickActions?: RowAction[];
  /** Dropdown menüsündeki eylemler */
  menuActions?: RowAction[];
  /** Bileşen boyutu */
  size?: 'small' | 'middle' | 'large';
  /** Özel className */
  className?: string;
  /** Dropdown tetikleme şekli */
  trigger?: ('click' | 'hover')[];
  /** Dropdown menüsü gizle */
  hideMenu?: boolean;
  /** Quick actions'ı gizle */
  hideQuickActions?: boolean;
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/** Eylem tiplerine göre varsayılan konfigürasyonlar */
const ACTION_PRESETS: Record<ActionType, { icon: React.ReactNode; variant: ActionVariant; label: string }> = {
  // Temel CRUD
  view: { icon: <EyeIcon className="w-4 h-4" />, variant: 'default', label: 'Görüntüle' },
  edit: { icon: <PencilSquareIcon className="w-4 h-4" />, variant: 'primary', label: 'Düzenle' },
  delete: { icon: <TrashIcon className="w-4 h-4" />, variant: 'danger', label: 'Sil' },
  duplicate: { icon: <DocumentDuplicateIcon className="w-4 h-4" />, variant: 'default', label: 'Kopyala' },
  // Durum değişiklikleri
  complete: { icon: <CheckCircleIcon className="w-4 h-4" />, variant: 'success', label: 'Tamamla' },
  cancel: { icon: <XCircleIcon className="w-4 h-4" />, variant: 'danger', label: 'İptal Et' },
  approve: { icon: <CheckCircleIcon className="w-4 h-4" />, variant: 'success', label: 'Onayla' },
  reject: { icon: <XCircleIcon className="w-4 h-4" />, variant: 'danger', label: 'Reddet' },
  archive: { icon: <ArchiveBoxIcon className="w-4 h-4" />, variant: 'warning', label: 'Arşivle' },
  restore: { icon: <ArrowPathIcon className="w-4 h-4" />, variant: 'success', label: 'Geri Yükle' },
  // İletişim
  send: { icon: <PaperAirplaneIcon className="w-4 h-4" />, variant: 'primary', label: 'Gönder' },
  email: { icon: <EnvelopeIcon className="w-4 h-4" />, variant: 'default', label: 'E-posta Gönder' },
  call: { icon: <PhoneIcon className="w-4 h-4" />, variant: 'default', label: 'Ara' },
  schedule: { icon: <CalendarIcon className="w-4 h-4" />, variant: 'primary', label: 'Planla' },
  // Diğer
  print: { icon: <PrinterIcon className="w-4 h-4" />, variant: 'default', label: 'Yazdır' },
  download: { icon: <ArrowDownTrayIcon className="w-4 h-4" />, variant: 'default', label: 'İndir' },
  share: { icon: <ShareIcon className="w-4 h-4" />, variant: 'default', label: 'Paylaş' },
  lock: { icon: <LockClosedIcon className="w-4 h-4" />, variant: 'warning', label: 'Kilitle' },
  unlock: { icon: <LockOpenIcon className="w-4 h-4" />, variant: 'success', label: 'Kilidi Aç' },
  assign: { icon: <UserPlusIcon className="w-4 h-4" />, variant: 'primary', label: 'Ata' },
  history: { icon: <ClockIcon className="w-4 h-4" />, variant: 'default', label: 'Geçmiş' },
  notes: { icon: <DocumentTextIcon className="w-4 h-4" />, variant: 'default', label: 'Notlar' },
  favorite: { icon: <StarIcon className="w-4 h-4" />, variant: 'warning', label: 'Favorilere Ekle' },
  flag: { icon: <FlagIcon className="w-4 h-4" />, variant: 'warning', label: 'İşaretle' },
  custom: { icon: null, variant: 'default', label: '' },
};

/** Varyantlara göre Tailwind renk sınıfları */
const VARIANT_STYLES: Record<ActionVariant, { text: string; hover: string; bg: string }> = {
  primary: { text: 'text-blue-600', hover: 'hover:text-blue-700 hover:bg-blue-50', bg: 'bg-blue-50' },
  success: { text: 'text-green-600', hover: 'hover:text-green-700 hover:bg-green-50', bg: 'bg-green-50' },
  warning: { text: 'text-orange-500', hover: 'hover:text-orange-600 hover:bg-orange-50', bg: 'bg-orange-50' },
  danger: { text: 'text-red-500', hover: 'hover:text-red-600 hover:bg-red-50', bg: 'bg-red-50' },
  default: { text: 'text-slate-600', hover: 'hover:text-slate-700 hover:bg-slate-50', bg: 'bg-slate-50' },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Eylem için tam konfigürasyon oluştur */
function resolveAction(action: RowAction): RowAction & { resolvedIcon: React.ReactNode; resolvedVariant: ActionVariant } {
  const preset = action.type && action.type !== 'custom' ? ACTION_PRESETS[action.type] : null;

  return {
    ...action,
    resolvedIcon: action.icon ?? preset?.icon ?? null,
    resolvedVariant: action.variant ?? preset?.variant ?? 'default',
  };
}

/** Görünür eylemleri filtrele */
function filterVisibleActions(actions: RowAction[]): RowAction[] {
  return actions.filter(action => action.visible !== false);
}

// =============================================================================
// COMPONENTS
// =============================================================================

/** Tek bir hızlı eylem butonu */
function QuickActionButton({ action, size }: { action: RowAction; size: 'small' | 'middle' | 'large' }) {
  const resolved = resolveAction(action);
  const styles = VARIANT_STYLES[resolved.resolvedVariant];

  const sizeClasses = {
    small: 'w-7 h-7 text-sm',
    middle: 'w-8 h-8 text-base',
    large: 'w-9 h-9 text-lg',
  };

  const button = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        action.onClick?.();
      }}
      disabled={action.disabled || action.loading}
      className={`
        inline-flex items-center justify-center rounded-md transition-all duration-200
        ${sizeClasses[size]}
        ${styles.text} ${styles.hover}
        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${action.loading ? 'animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
      `}
      aria-label={action.label}
    >
      {resolved.resolvedIcon}
    </button>
  );

  // Tooltip ile sar
  const tooltipTitle = action.disabled && action.disabledReason
    ? action.disabledReason
    : action.label;

  return (
    <Tooltip title={tooltipTitle} placement="top">
      {button}
    </Tooltip>
  );
}

/** Ana RowActions bileşeni */
export function RowActions({
  id,
  quickActions = [],
  menuActions = [],
  size = 'small',
  className = '',
  trigger = ['click'],
  hideMenu = false,
  hideQuickActions = false,
}: RowActionsProps) {
  // Görünür eylemleri filtrele
  const visibleQuickActions = filterVisibleActions(quickActions);
  const visibleMenuActions = filterVisibleActions(menuActions);

  // Dropdown menü items oluştur
  const menuItems: MenuProps['items'] = visibleMenuActions.map((action, index) => {
    const resolved = resolveAction(action);
    const isLastBeforeDelete =
      index === visibleMenuActions.length - 2 &&
      visibleMenuActions[index + 1]?.type === 'delete';

    // Silme öncesi ayırıcı ekle
    const items: MenuProps['items'] = [];

    if (action.type === 'delete' && index > 0) {
      items.push({ type: 'divider', key: `divider-${action.key}` });
    }

    items.push({
      key: action.key,
      icon: resolved.resolvedIcon,
      label: action.label,
      danger: resolved.resolvedVariant === 'danger',
      disabled: action.disabled,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        action.onClick?.();
      },
    });

    return items;
  }).flat();

  // Hiç eylem yoksa null döndür
  if (visibleQuickActions.length === 0 && visibleMenuActions.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hızlı Eylem Butonları */}
      {!hideQuickActions && visibleQuickActions.map((action) => (
        <QuickActionButton
          key={action.key}
          action={action}
          size={size}
        />
      ))}

      {/* Dropdown Menü */}
      {!hideMenu && visibleMenuActions.length > 0 && (
        <Dropdown
          menu={{ items: menuItems }}
          trigger={trigger}
          placement="bottomRight"
        >
          <Tooltip title="Daha fazla işlem">
            <button
              onClick={(e) => e.stopPropagation()}
              className={`
                inline-flex items-center justify-center rounded-md transition-all duration-200
                ${size === 'small' ? 'w-7 h-7' : size === 'middle' ? 'w-8 h-8' : 'w-9 h-9'}
                text-slate-400 hover:text-slate-600 hover:bg-slate-100
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
              `}
              aria-label="Daha fazla işlem"
            >
              <EllipsisVerticalIcon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} />
            </button>
          </Tooltip>
        </Dropdown>
      )}
    </div>
  );
}

// =============================================================================
// FACTORY HELPERS - Kolay eylem oluşturma
// =============================================================================

/** Hızlı eylem oluşturucular */
export const createAction = {
  /** Görüntüleme eylemi */
  view: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'view',
    type: 'view',
    label: 'Görüntüle',
    onClick,
    ...overrides,
  }),

  /** Düzenleme eylemi */
  edit: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'edit',
    type: 'edit',
    label: 'Düzenle',
    onClick,
    ...overrides,
  }),

  /** Silme eylemi */
  delete: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'delete',
    type: 'delete',
    label: 'Sil',
    onClick,
    requireConfirm: true,
    ...overrides,
  }),

  /** Tamamlama eylemi */
  complete: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'complete',
    type: 'complete',
    label: 'Tamamla',
    onClick,
    ...overrides,
  }),

  /** İptal eylemi */
  cancel: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'cancel',
    type: 'cancel',
    label: 'İptal Et',
    onClick,
    ...overrides,
  }),

  /** Onaylama eylemi */
  approve: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'approve',
    type: 'approve',
    label: 'Onayla',
    onClick,
    ...overrides,
  }),

  /** Reddetme eylemi */
  reject: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'reject',
    type: 'reject',
    label: 'Reddet',
    onClick,
    ...overrides,
  }),

  /** Arşivleme eylemi */
  archive: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'archive',
    type: 'archive',
    label: 'Arşivle',
    onClick,
    ...overrides,
  }),

  /** Kopyalama eylemi */
  duplicate: (onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key: 'duplicate',
    type: 'duplicate',
    label: 'Kopyala',
    onClick,
    ...overrides,
  }),

  /** Özel eylem */
  custom: (key: string, label: string, onClick: () => void, overrides?: Partial<RowAction>): RowAction => ({
    key,
    type: 'custom',
    label,
    onClick,
    ...overrides,
  }),
};

// =============================================================================
// PRESET CONFIGURATIONS - Hazır eylem grupları
// =============================================================================

/** Yaygın kullanılan eylem kombinasyonları */
export const actionPresets = {
  /** Temel CRUD: Görüntüle, Düzenle, Sil */
  crud: (handlers: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) => ({
    quickActions: [
      handlers.onView && createAction.view(handlers.onView),
      handlers.onEdit && createAction.edit(handlers.onEdit),
    ].filter(Boolean) as RowAction[],
    menuActions: [
      handlers.onDelete && createAction.delete(handlers.onDelete),
    ].filter(Boolean) as RowAction[],
  }),

  /** Toplantı işlemleri */
  meeting: (handlers: {
    onEdit?: () => void;
    onComplete?: () => void;
    onCancel?: () => void;
    onDelete?: () => void;
  }) => ({
    quickActions: [
      handlers.onEdit && createAction.edit(handlers.onEdit),
    ].filter(Boolean) as RowAction[],
    menuActions: [
      handlers.onComplete && createAction.complete(handlers.onComplete),
      handlers.onCancel && createAction.cancel(handlers.onCancel),
      handlers.onDelete && createAction.delete(handlers.onDelete),
    ].filter(Boolean) as RowAction[],
  }),

  /** Sipariş işlemleri */
  order: (handlers: {
    onView?: () => void;
    onEdit?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onCancel?: () => void;
    onDelete?: () => void;
  }) => ({
    quickActions: [
      handlers.onView && createAction.view(handlers.onView),
      handlers.onEdit && createAction.edit(handlers.onEdit),
    ].filter(Boolean) as RowAction[],
    menuActions: [
      handlers.onApprove && createAction.approve(handlers.onApprove),
      handlers.onReject && createAction.reject(handlers.onReject),
      handlers.onCancel && createAction.cancel(handlers.onCancel),
      handlers.onDelete && createAction.delete(handlers.onDelete),
    ].filter(Boolean) as RowAction[],
  }),

  /** Müşteri işlemleri */
  customer: (handlers: {
    onView?: () => void;
    onEdit?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
  }) => ({
    quickActions: [
      handlers.onView && createAction.view(handlers.onView),
      handlers.onEdit && createAction.edit(handlers.onEdit),
    ].filter(Boolean) as RowAction[],
    menuActions: [
      handlers.onArchive && createAction.archive(handlers.onArchive),
      handlers.onDelete && createAction.delete(handlers.onDelete),
    ].filter(Boolean) as RowAction[],
  }),
};

export default RowActions;
