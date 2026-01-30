'use client';

import { useEffect } from 'react';
import { useSignalRHub } from './use-signalr';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { Notification, NotificationCategory, NotificationType } from '@/features/notifications/types/notification.types';
import { toast } from 'sonner';

import logger from '../utils/logger';

// Map backend notification type (number enum) to frontend type (string)
function mapBackendNotificationType(type: number | string): NotificationType {
  if (typeof type === 'string') return type as NotificationType;

  const typeMap: Record<number, NotificationType> = {
    0: 'info',      // Information
    1: 'success',   // Success
    2: 'warning',   // Warning
    3: 'error',     // Error
    4: 'info',      // Order
    5: 'info',      // Inventory
    6: 'info',      // System
    7: 'info',      // User
    8: 'warning',   // Alert
  };
  return typeMap[type] || 'info';
}

// Determine category based on alertType or data
function determineCategory(data?: Record<string, object>): NotificationCategory {
  const alertType = data?.alertType as string;
  if (!alertType) return 'system';

  // Inventory alerts
  if (alertType.includes('stock') || alertType.includes('inventory') ||
      alertType.includes('lot_batch') || alertType.includes('serial_number') ||
      alertType.includes('price_list') || alertType.includes('cycle_count')) {
    return 'inventory';
  }

  // Sales alerts
  if (alertType.includes('sales_order') || alertType.includes('quotation') ||
      alertType.includes('invoice') || alertType.includes('payment') ||
      alertType.includes('shipment') || alertType.includes('sales_return') ||
      alertType.includes('credit_note') || alertType.includes('warranty')) {
    return 'sales';
  }

  // CRM alerts
  if (alertType.includes('lead') || alertType.includes('deal') ||
      alertType.includes('opportunity') || alertType.includes('campaign') ||
      alertType.includes('meeting') || alertType.includes('task') ||
      alertType.includes('activity') || alertType.includes('ticket') ||
      alertType.includes('contract') || alertType.includes('account') ||
      alertType.includes('territory') || alertType.includes('referral')) {
    return 'crm';
  }

  // HR alerts
  if (alertType.includes('probation') || alertType.includes('leave') ||
      alertType.includes('attendance') || alertType.includes('expense') ||
      alertType.includes('performance') || alertType.includes('training') ||
      alertType.includes('salary') || alertType.includes('bonus') ||
      alertType.includes('birthday') || alertType.includes('anniversary')) {
    return 'hr';
  }

  // Backup alerts
  if (alertType.includes('backup')) {
    return 'backup';
  }

  // Finance alerts
  if (alertType.includes('finance') || alertType.includes('budget') ||
      alertType.includes('accounting')) {
    return 'finance';
  }

  return 'system';
}

// Transform SignalR notification to frontend Notification format
function mapSignalRNotification(rawNotification: Record<string, unknown>): Notification {
  const data = (rawNotification.data || rawNotification.Data) as Record<string, object> | undefined;
  const metadata = (rawNotification.metadata || rawNotification.Metadata) as Record<string, object> | undefined;
  const combinedData = { ...metadata, ...data };

  return {
    id: String(rawNotification.id || rawNotification.Id || crypto.randomUUID()),
    title: String(rawNotification.title || rawNotification.Title || ''),
    message: String(rawNotification.message || rawNotification.Message || ''),
    type: mapBackendNotificationType(rawNotification.type as number | string || rawNotification.Type as number | string || 0),
    category: determineCategory(combinedData),
    priority: (rawNotification.priority || rawNotification.Priority || 'Normal') as Notification['priority'],
    isRead: false, // SignalR notifications are always unread initially
    createdAt: String(rawNotification.createdAt || rawNotification.CreatedAt || new Date().toISOString()),
    actionUrl: String(rawNotification.actionUrl || rawNotification.ActionUrl || combinedData?.actionUrl || ''),
    iconName: String(rawNotification.icon || rawNotification.Icon || ''),
    metadata: combinedData,
    data: combinedData,
  } as Notification & { data?: Record<string, object> };
}

export function useNotificationHub() {
  const { addNotification, fetchUnreadCount } = useNotifications();

  const { isConnected } = useSignalRHub({
    hub: 'notification',
    events: {
      // Receive new notification
      ReceiveNotification: (rawNotification: Record<string, unknown>) => {
        logger.info('Received raw notification:', rawNotification);

        // Map to frontend format
        const notification = mapSignalRNotification(rawNotification);
        logger.info('Mapped notification:', notification);

        // Add to store
        addNotification(notification);

        // Show toast for important notifications
        if (notification.type === 'error' || notification.type === 'warning') {
          toast[notification.type](notification.title, {
            description: notification.message,
          });
        }

        // Get alertType from metadata or data
        const alertType = notification.metadata?.alertType || notification.data?.alertType;
        const actionUrl = notification.actionUrl || notification.metadata?.actionUrl || notification.data?.actionUrl;

        // Helper function for navigation action
        const getNavigationAction = (label: string, url?: string) => {
          if (!url) return undefined;
          return {
            label,
            onClick: () => { window.location.href = url; },
          };
        };

        // ==========================================
        // INVENTORY NOTIFICATIONS
        // ==========================================

        if (alertType === 'low_stock') {
          const currentQty = notification.data?.currentQuantity || notification.metadata?.currentQuantity;
          const isOutOfStock = currentQty !== undefined && currentQty <= 0;
          if (isOutOfStock) {
            toast.error('🚨 ' + notification.title, {
              description: notification.message,
              duration: 12000,
              action: getNavigationAction('Ürüne Git', actionUrl),
            });
          } else {
            toast.warning('📦 ' + notification.title, {
              description: notification.message,
              duration: 8000,
              action: getNavigationAction('Ürüne Git', actionUrl),
            });
          }
        } else if (alertType === 'stock_count_completed') {
          const discrepancies = notification.data?.discrepancies || notification.data?.itemsWithVariance || 0;
          if (discrepancies > 0) {
            toast.warning('📊 ' + notification.title, {
              description: notification.message,
              duration: 8000,
              action: getNavigationAction('Sayımı Görüntüle', actionUrl),
            });
          } else {
            toast.success('✅ ' + notification.title, {
              description: notification.message,
              duration: 6000,
              action: getNavigationAction('Sayımı Görüntüle', actionUrl),
            });
          }
        } else if (alertType === 'stock_count_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sayımı Görüntüle', actionUrl),
          });
        } else if (alertType === 'stock_count_rejected') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Sayımı Görüntüle', actionUrl),
          });
        } else if (alertType === 'stock_count_scheduled') {
          toast.info('📅 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sayımı Görüntüle', actionUrl),
          });
        } else if (alertType === 'stock_count_started') {
          toast.info('▶️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sayımı Görüntüle', actionUrl),
          });
        } else if (alertType === 'stock_count_cancelled') {
          toast.warning('⚠️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Detaylar', actionUrl),
          });
        } else if (alertType === 'lot_batch_expiring') {
          const daysUntilExpiry = notification.data?.daysUntilExpiry || notification.metadata?.daysUntilExpiry || 30;
          if (daysUntilExpiry <= 7) {
            toast.error('⏰ ' + notification.title, {
              description: notification.message,
              duration: 10000,
              action: getNavigationAction('Lot Detayları', actionUrl),
            });
          } else {
            toast.warning('⏰ ' + notification.title, {
              description: notification.message,
              duration: 8000,
              action: getNavigationAction('Lot Detayları', actionUrl),
            });
          }
        } else if (alertType === 'lot_batch_expired') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 15000, // Long duration for critical alert
            action: getNavigationAction('Acil İşlem Yap', actionUrl),
          });
        } else if (alertType === 'lot_batch_quarantined') {
          toast.warning('🛡️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Lot Detayları', actionUrl),
          });
        } else if (alertType === 'serial_number_defective') {
          toast.error('⚠️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Seri Detayları', actionUrl),
          });
        } else if (alertType === 'serial_number_lost') {
          toast.error('🔍 ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Seri Detayları', actionUrl),
          });
        } else if (alertType === 'price_list_updated') {
          toast.info('🏷️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Fiyat Listesi', actionUrl),
          });
        } else if (alertType === 'stock_adjustment_applied') {
          toast.success('🔄 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Düzeltmeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'cycle_count_completed') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sayımı Görüntüle', actionUrl),
          });
        }

        // ==========================================
        // CRM NOTIFICATIONS
        // ==========================================

        else if (alertType === 'meeting_reminder') {
          toast.info('🔔 ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Toplantıya Git', actionUrl),
          });
        } else if (alertType === 'meeting_cancelled') {
          toast.warning('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Detaylar', actionUrl),
          });
        } else if (alertType === 'task_reminder' || alertType === 'task_due' || alertType === 'task_due_date_approaching') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Görevi Aç', actionUrl),
          });
        } else if (alertType === 'task_assigned') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Görevi Aç', actionUrl),
          });
        } else if (alertType === 'task_completed') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 5000,
            action: getNavigationAction('Görevi Görüntüle', actionUrl),
          });
        } else if (alertType === 'task_overdue') {
          toast.error('⏰ ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Görevi Aç', actionUrl),
          });
        } else if (alertType === 'activity_reminder' || alertType === 'activity_overdue') {
          const isOverdue = alertType === 'activity_overdue';
          if (isOverdue) {
            toast.error('⏰ ' + notification.title, {
              description: notification.message,
              duration: 10000,
              action: getNavigationAction('Aktiviteyi Aç', actionUrl),
            });
          } else {
            toast.info('📌 ' + notification.title, {
              description: notification.message,
              duration: 8000,
              action: getNavigationAction('Detaylar', actionUrl),
            });
          }
        } else if (alertType === 'lead_assigned') {
          toast.info('👤 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Lead\'i Görüntüle', actionUrl),
          });
        } else if (alertType === 'lead_converted') {
          toast.success('🎉 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Müşteriyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'lead_score_threshold' || alertType === 'lead_qualified') {
          toast.success('⭐ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Lead\'i Görüntüle', actionUrl),
          });
        } else if (alertType === 'lead_grade_changed') {
          toast.info('📈 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Lead\'i Görüntüle', actionUrl),
          });
        } else if (alertType === 'deal_won') {
          toast.success('🏆 ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Fırsatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'deal_lost') {
          toast.error('😔 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Fırsatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'deal_rotten') {
          toast.warning('⚠️ ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Fırsatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'deal_stage_changed') {
          toast.info('📊 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Fırsatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'opportunity_close_date_approaching') {
          toast.warning('📅 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Fırsatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'campaign_launched') {
          toast.success('📣 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Kampanyayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'workflow_execution_failed') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 12000,
            action: getNavigationAction('Detaylar', actionUrl),
          });
        } else if (alertType === 'loyalty_tier_changed') {
          toast.info('🎖️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Müşteriyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'loyalty_points_expiring') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Müşteriyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quote_accepted') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quote_expiring_soon') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quote_converted') {
          toast.success('🛒 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        } else if (alertType === 'contract_signed') {
          toast.success('📝 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Sözleşmeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'contract_renewed') {
          toast.success('🔄 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sözleşmeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'contract_expiring_soon') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Sözleşmeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'ticket_assigned') {
          toast.info('🎫 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Talebi Görüntüle', actionUrl),
          });
        } else if (alertType === 'ticket_escalated') {
          toast.warning('⬆️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Talebi Görüntüle', actionUrl),
          });
        } else if (alertType === 'ticket_resolved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Talebi Görüntüle', actionUrl),
          });
        } else if (alertType === 'ticket_sla_breached') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 15000, // Long duration for critical
            action: getNavigationAction('Acil İşlem Yap', actionUrl),
          });
        } else if (alertType === 'ticket_sla_warning') {
          toast.warning('⏱️ ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Talebi Görüntüle', actionUrl),
          });
        } else if (alertType === 'reminder_due') {
          toast.info('🔔 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Detaylar', actionUrl),
          });
        } else if (alertType === 'user_mentioned_in_note') {
          toast.info('💬 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Notu Görüntüle', actionUrl),
          });
        } else if (alertType === 'document_shared') {
          toast.info('📄 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Dokümanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'document_approval_requested') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Onaya Git', actionUrl),
          });
        } else if (alertType === 'document_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Dokümanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'document_rejected') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Dokümanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'account_assigned') {
          toast.info('🏢 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Hesabı Görüntüle', actionUrl),
          });
        } else if (alertType === 'account_marked_as_key_account') {
          toast.success('⭐ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Hesabı Görüntüle', actionUrl),
          });
        } else if (alertType === 'territory_user_assigned') {
          toast.info('🗺️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Bölgeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_team_member_added') {
          toast.info('👥 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Ekibi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_team_manager_changed') {
          toast.info('👤 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Ekibi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_team_quota_reached') {
          toast.success('🎯 ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Ekibi Görüntüle', actionUrl),
          });
        } else if (alertType === 'referral_converted') {
          toast.success('🎉 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Referansı Görüntüle', actionUrl),
          });
        } else if (alertType === 'referral_reward_earned') {
          toast.success('🎁 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Referansı Görüntüle', actionUrl),
          });
        } else if (alertType === 'call_missed') {
          toast.warning('📞 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Aramayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'call_transferred') {
          toast.info('📲 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Aramayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'call_scheduled') {
          toast.info('📅 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Aramayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'competitor_threat_changed') {
          toast.warning('⚔️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Rakibi Görüntüle', actionUrl),
          });
        } else if (alertType === 'competitor_report_created') {
          toast.info('📊 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Raporu Görüntüle', actionUrl),
          });
        } else if (alertType === 'product_interest_converted') {
          toast.success('⚡ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Fırsatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'product_interest_followup') {
          toast.info('📅 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Detaylar', actionUrl),
          });
        } else if (alertType === 'survey_completed') {
          toast.info('📝 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Anketi Görüntüle', actionUrl),
          });
        } else if (alertType === 'detractor_alert') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 15000, // Critical - unhappy customer
            action: getNavigationAction('Acil İşlem Yap', actionUrl),
          });
        } else if (alertType === 'survey_followup_required') {
          toast.warning('📋 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Takibi Başlat', actionUrl),
          });
        }

        // ==========================================
        // HR NOTIFICATIONS
        // ==========================================

        else if (alertType === 'probation_ending') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Çalışanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'contract_expiring') {
          toast.warning('📄 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Çalışanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'work_anniversary') {
          toast.success('🎂 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Çalışanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'birthday') {
          toast.success('🎉 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Çalışanı Görüntüle', actionUrl),
          });
        } else if (alertType === 'leave_request_submitted') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Talebi Görüntüle', actionUrl),
          });
        } else if (alertType === 'leave_request_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('İzni Görüntüle', actionUrl),
          });
        } else if (alertType === 'leave_request_rejected') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('İzni Görüntüle', actionUrl),
          });
        } else if (alertType === 'leave_balance_low') {
          toast.warning('⚠️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Bakiyeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'leave_balance_expiring') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Bakiyeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'late_arrival') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Devam Takibi', actionUrl),
          });
        } else if (alertType === 'absence') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Devam Takibi', actionUrl),
          });
        } else if (alertType === 'overtime') {
          toast.info('⏱️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Devam Takibi', actionUrl),
          });
        } else if (alertType === 'expense_submitted') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Masrafı Görüntüle', actionUrl),
          });
        } else if (alertType === 'expense_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Masrafı Görüntüle', actionUrl),
          });
        } else if (alertType === 'expense_rejected') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Masrafı Görüntüle', actionUrl),
          });
        } else if (alertType === 'expense_budget_exceeded') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Masrafları Görüntüle', actionUrl),
          });
        } else if (alertType === 'performance_review_submitted') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Değerlendirmeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'performance_review_due') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Değerlendirmeye Git', actionUrl),
          });
        } else if (alertType === 'low_performance') {
          toast.warning('⚠️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Performansı Görüntüle', actionUrl),
          });
        } else if (alertType === 'training_enrollment') {
          toast.info('📚 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Eğitimi Görüntüle', actionUrl),
          });
        } else if (alertType === 'training_deadline_approaching') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Eğitimi Görüntüle', actionUrl),
          });
        } else if (alertType === 'mandatory_training_overdue') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 12000,
            action: getNavigationAction('Eğitimi Görüntüle', actionUrl),
          });
        } else if (alertType === 'certification_expiring') {
          toast.warning('🏅 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Sertifikaları Görüntüle', actionUrl),
          });
        } else if (alertType === 'salary_paid') {
          toast.success('💰 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Bordroyu Görüntüle', actionUrl),
          });
        } else if (alertType === 'bonus_awarded') {
          toast.success('🎉 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Bordroyu Görüntüle', actionUrl),
          });
        } else if (alertType === 'announcement_published') {
          toast.info('📢 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Duyuruyu Görüntüle', actionUrl),
          });
        } else if (alertType === 'upcoming_holiday') {
          toast.info('🎉 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Takvimi Görüntüle', actionUrl),
          });
        }

        // ==========================================
        // SALES NOTIFICATIONS
        // ==========================================

        // Sales Order Notifications
        else if (alertType === 'sales_order_created') {
          toast.success('🛒 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_order_confirmed') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_order_shipped') {
          toast.info('📦 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_order_delivered') {
          toast.success('🎉 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_order_cancelled') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_order_partially_shipped') {
          toast.warning('📦 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Siparişi Görüntüle', actionUrl),
          });
        }

        // Quotation Notifications
        else if (alertType === 'quotation_created') {
          toast.success('📝 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quotation_sent') {
          toast.info('📤 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quotation_accepted') {
          toast.success('🎉 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quotation_rejected') {
          toast.warning('😔 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quotation_expired') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        } else if (alertType === 'quotation_expiring') {
          toast.warning('⏳ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Teklifi Görüntüle', actionUrl),
          });
        }

        // Invoice Notifications
        else if (alertType === 'invoice_created') {
          toast.success('📄 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Faturayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'invoice_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Faturayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'invoice_sent_to_gib') {
          toast.success('📤 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Faturayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'invoice_paid') {
          toast.success('💰 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Faturayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'invoice_cancelled') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Faturayı Görüntüle', actionUrl),
          });
        } else if (alertType === 'invoice_overdue') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 12000,
            action: getNavigationAction('Faturayı Görüntüle', actionUrl),
          });
        }

        // Payment Notifications
        else if (alertType === 'payment_received') {
          toast.success('💵 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Ödemeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'payment_confirmed') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Ödemeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'payment_allocated') {
          toast.info('🔗 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Ödemeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'payment_refunded') {
          toast.warning('↩️ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Ödemeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'payment_failed') {
          toast.error('❌ ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Ödemeyi Görüntüle', actionUrl),
          });
        }

        // Shipment Notifications
        else if (alertType === 'shipment_created') {
          toast.info('📦 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sevkiyatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'shipment_dispatched') {
          toast.success('🚚 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sevkiyatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'shipment_status_updated') {
          toast.info('📍 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sevkiyatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'shipment_delivered') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Sevkiyatı Görüntüle', actionUrl),
          });
        } else if (alertType === 'shipment_delivery_failed') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 10000,
            action: getNavigationAction('Sevkiyatı Görüntüle', actionUrl),
          });
        }

        // Sales Return Notifications
        else if (alertType === 'sales_return_created') {
          toast.info('↩️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('İadeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_return_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('İadeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_return_received') {
          toast.success('📦 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('İadeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_return_refunded') {
          toast.success('💰 ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('İadeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'sales_return_rejected') {
          toast.warning('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('İadeyi Görüntüle', actionUrl),
          });
        }

        // Credit Note Notifications
        else if (alertType === 'credit_note_created') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Alacak Dekontunu Görüntüle', actionUrl),
          });
        } else if (alertType === 'credit_note_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Alacak Dekontunu Görüntüle', actionUrl),
          });
        } else if (alertType === 'credit_note_applied') {
          toast.success('🔗 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Alacak Dekontunu Görüntüle', actionUrl),
          });
        }

        // Warranty Notifications
        else if (alertType === 'warranty_registered') {
          toast.success('🛡️ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Garantiyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'warranty_claim_created') {
          toast.info('📋 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Talep Detayları', actionUrl),
          });
        } else if (alertType === 'warranty_claim_approved') {
          toast.success('✅ ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Talep Detayları', actionUrl),
          });
        } else if (alertType === 'warranty_claim_rejected') {
          toast.warning('❌ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Talep Detayları', actionUrl),
          });
        } else if (alertType === 'warranty_expiring') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Garantiyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'warranty_expired') {
          toast.error('⌛ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Garantiyi Görüntüle', actionUrl),
          });
        }

        // Customer Contract Notifications
        else if (alertType === 'customer_contract_expiring') {
          toast.warning('⏰ ' + notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Sözleşmeyi Görüntüle', actionUrl),
          });
        } else if (alertType === 'customer_contract_renewed') {
          toast.success('🔄 ' + notification.title, {
            description: notification.message,
            duration: 6000,
            action: getNavigationAction('Sözleşmeyi Görüntüle', actionUrl),
          });
        }

        // ==========================================
        // FALLBACK FOR HIGH PRIORITY NOTIFICATIONS
        // ==========================================

        else if (notification.priority === 'Urgent' || notification.priority === 'Critical') {
          toast.error('🚨 ' + notification.title, {
            description: notification.message,
            duration: 15000,
            action: getNavigationAction('Görüntüle', actionUrl),
          });
        } else if (notification.priority === 'High') {
          toast.warning(notification.title, {
            description: notification.message,
            duration: 8000,
            action: getNavigationAction('Görüntüle', actionUrl),
          });
        }
      },

      // Inventory update notification
      UpdateInventory: (data: { productId: string; stockLevel: number; message: string }) => {
        logger.info('Inventory updated', { metadata: data });
        addNotification({
          id: `inventory-${Date.now()}`,
          title: 'Stok Güncellendi',
          message: data.message,
          type: 'info',
          category: 'inventory',
          isRead: false,
          createdAt: new Date().toISOString(),
          metadata: { productId: data.productId, stockLevel: data.stockLevel },
        });

        // Show toast for low stock warnings
        if (data.stockLevel < 10) {
          toast.warning('Düşük Stok Seviyesi', {
            description: data.message,
          });
        }
      },

      // Order status changed notification
      OrderStatusChanged: (data: { orderId: string; status: string; message: string }) => {
        logger.info('Order status changed', { metadata: data });
        addNotification({
          id: `order-${Date.now()}`,
          title: 'Sipariş Durumu Değişti',
          message: data.message,
          type: 'success',
          category: 'order',
          isRead: false,
          createdAt: new Date().toISOString(),
          metadata: { orderId: data.orderId, status: data.status },
          link: `/orders/${data.orderId}`,
        });

        // Show success toast for order updates
        toast.success('Sipariş Güncellendi', {
          description: data.message,
          action: {
            label: 'Görüntüle',
            onClick: () => {
              window.location.href = `/orders/${data.orderId}`;
            },
          },
        });
      },

      // System alert notification
      SystemAlert: (data: { severity: 'info' | 'warning' | 'error'; message: string }) => {
        logger.info('System alert', { metadata: data });
        addNotification({
          id: `system-${Date.now()}`,
          title: 'Sistem Bildirimi',
          message: data.message,
          type: data.severity === 'error' ? 'error' : data.severity === 'warning' ? 'warning' : 'info',
          category: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        // Always show toast for system alerts
        const toastType = data.severity === 'error' ? 'error' : data.severity === 'warning' ? 'warning' : 'info';
        toast[toastType]('Sistem Bildirimi', {
          description: data.message,
        });
      },

      // ==========================================
      // BACKUP NOTIFICATIONS
      // ==========================================

      // Backup started notification
      BackupStarted: (data: {
        Type: string;
        BackupId: string;
        BackupName: string;
        BackupType: string;
        Status: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.info('Backup started', { metadata: data });
        addNotification({
          id: `backup-started-${data.BackupId}`,
          title: '🔄 Yedekleme Başladı',
          message: data.Message || `${data.BackupName} yedeklemesi başlatıldı`,
          type: 'info',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: { backupId: data.BackupId, backupType: data.BackupType, status: data.Status },
          link: '/settings/backup',
        });

        toast.info('🔄 Yedekleme Başladı', {
          description: data.Message || `${data.BackupName} yedeklemesi başlatıldı`,
          duration: 5000,
          action: {
            label: 'Görüntüle',
            onClick: () => {
              window.location.href = '/settings/backup';
            },
          },
        });
      },

      // Backup completed notification
      BackupCompleted: (data: {
        Type: string;
        BackupId: string;
        BackupName: string;
        BackupType: string;
        Status: string;
        SizeInBytes?: number;
        Duration?: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.info('Backup completed', { metadata: data });
        addNotification({
          id: `backup-completed-${data.BackupId}`,
          title: '✅ Yedekleme Tamamlandı',
          message: data.Message || `${data.BackupName} yedeklemesi başarıyla tamamlandı`,
          type: 'success',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: {
            backupId: data.BackupId,
            backupType: data.BackupType,
            status: data.Status,
            sizeInBytes: data.SizeInBytes
          },
          link: '/settings/backup',
        });

        toast.success('✅ Yedekleme Tamamlandı', {
          description: data.Message || `${data.BackupName} yedeklemesi başarıyla tamamlandı`,
          duration: 8000,
          action: {
            label: 'İndir',
            onClick: () => {
              window.location.href = '/settings/backup';
            },
          },
        });
      },

      // Backup failed notification
      BackupFailed: (data: {
        Type: string;
        BackupId: string;
        BackupName: string;
        BackupType: string;
        Status: string;
        ErrorMessage?: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.error('Backup failed', { metadata: data });
        addNotification({
          id: `backup-failed-${data.BackupId}`,
          title: '❌ Yedekleme Başarısız',
          message: data.Message || `${data.BackupName} yedeklemesi başarısız oldu`,
          type: 'error',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: {
            backupId: data.BackupId,
            backupType: data.BackupType,
            status: data.Status,
            errorMessage: data.ErrorMessage
          },
          link: '/settings/backup',
        });

        toast.error('❌ Yedekleme Başarısız', {
          description: data.ErrorMessage || data.Message || `${data.BackupName} yedeklemesi başarısız oldu`,
          duration: 10000,
          action: {
            label: 'Detaylar',
            onClick: () => {
              window.location.href = '/settings/backup';
            },
          },
        });
      },

      // Restore started notification
      RestoreStarted: (data: {
        Type: string;
        BackupId: string;
        BackupName: string;
        Status: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.info('Restore started', { metadata: data });
        addNotification({
          id: `restore-started-${data.BackupId}`,
          title: '🔄 Geri Yükleme Başladı',
          message: data.Message || `${data.BackupName} geri yüklemesi başlatıldı`,
          type: 'info',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: { backupId: data.BackupId, status: data.Status },
          link: '/settings/backup',
        });

        toast.info('🔄 Geri Yükleme Başladı', {
          description: data.Message || `${data.BackupName} geri yüklemesi başlatıldı`,
          duration: 5000,
        });
      },

      // Restore completed notification
      RestoreCompleted: (data: {
        Type: string;
        BackupId: string;
        BackupName: string;
        Status: string;
        Duration?: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.info('Restore completed', { metadata: data });
        addNotification({
          id: `restore-completed-${data.BackupId}`,
          title: '✅ Geri Yükleme Tamamlandı',
          message: data.Message || `${data.BackupName} geri yüklemesi başarıyla tamamlandı`,
          type: 'success',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: { backupId: data.BackupId, status: data.Status },
          link: '/settings/backup',
        });

        toast.success('✅ Geri Yükleme Tamamlandı', {
          description: data.Message || `${data.BackupName} geri yüklemesi başarıyla tamamlandı`,
          duration: 8000,
        });
      },

      // Restore failed notification
      RestoreFailed: (data: {
        Type: string;
        BackupId: string;
        BackupName: string;
        Status: string;
        ErrorMessage?: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.error('Restore failed', { metadata: data });
        addNotification({
          id: `restore-failed-${data.BackupId}`,
          title: '❌ Geri Yükleme Başarısız',
          message: data.Message || `${data.BackupName} geri yüklemesi başarısız oldu`,
          type: 'error',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: {
            backupId: data.BackupId,
            status: data.Status,
            errorMessage: data.ErrorMessage
          },
          link: '/settings/backup',
        });

        toast.error('❌ Geri Yükleme Başarısız', {
          description: data.ErrorMessage || data.Message || `${data.BackupName} geri yüklemesi başarısız oldu`,
          duration: 10000,
        });
      },

      // Backup cleanup completed notification
      BackupCleanupCompleted: (data: {
        Type: string;
        DeletedCount: number;
        FreedSpaceBytes: number;
        FreedSpaceFormatted: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.info('Backup cleanup completed', { metadata: data });
        addNotification({
          id: `backup-cleanup-${Date.now()}`,
          title: '🧹 Yedek Temizliği Tamamlandı',
          message: data.Message || `${data.DeletedCount} eski yedek silindi, ${data.FreedSpaceFormatted} alan açıldı`,
          type: 'info',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: {
            deletedCount: data.DeletedCount,
            freedSpaceBytes: data.FreedSpaceBytes
          },
          link: '/settings/backup',
        });

        toast.info('🧹 Yedek Temizliği Tamamlandı', {
          description: data.Message || `${data.DeletedCount} eski yedek silindi, ${data.FreedSpaceFormatted} alan açıldı`,
          duration: 6000,
        });
      },

      // Storage warning notification
      StorageWarning: (data: {
        Type: string;
        UsedBytes: number;
        LimitBytes: number;
        PercentageUsed: number;
        UsedFormatted: string;
        LimitFormatted: string;
        Timestamp: string;
        Message: string;
      }) => {
        logger.warn('Storage warning', { metadata: data });
        addNotification({
          id: `storage-warning-${Date.now()}`,
          title: '⚠️ Yedekleme Alanı Uyarısı',
          message: data.Message || `Yedekleme alanı %${data.PercentageUsed} dolulukta (${data.UsedFormatted}/${data.LimitFormatted})`,
          type: 'warning',
          category: 'backup',
          isRead: false,
          createdAt: data.Timestamp || new Date().toISOString(),
          metadata: {
            usedBytes: data.UsedBytes,
            limitBytes: data.LimitBytes,
            percentageUsed: data.PercentageUsed
          },
          link: '/settings/backup',
        });

        toast.warning('⚠️ Yedekleme Alanı Uyarısı', {
          description: data.Message || `Yedekleme alanı %${data.PercentageUsed} dolulukta`,
          duration: 10000,
          action: {
            label: 'Yönet',
            onClick: () => {
              window.location.href = '/settings/backup';
            },
          },
        });
      },
    },
  });

  // Fetch unread count when connected
  useEffect(() => {
    if (isConnected) {
      fetchUnreadCount();
    }
  }, [isConnected, fetchUnreadCount]);

  return { isConnected };
}
