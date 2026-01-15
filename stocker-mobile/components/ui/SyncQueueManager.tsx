import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  Layout,
} from 'react-native-reanimated';
import {
  X,
  Trash2,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Users,
  ShoppingCart,
  FileText,
  MoreHorizontal,
} from 'lucide-react-native';
import { useSync } from '@/lib/sync';
import { useTheme } from '@/lib/theme';
import type { QueueItem } from '@/lib/storage/offline';

interface SyncQueueManagerProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * SyncQueueManager Component
 *
 * Modal for viewing and managing the offline sync queue.
 * Allows users to view pending mutations, retry failed ones, or remove items.
 */
export function SyncQueueManager({ visible, onClose }: SyncQueueManagerProps) {
  const { isOnline, pendingCount, isSyncing, syncNow, getQueueItems, removeFromQueue, clearQueue } = useSync();
  const { colors, isDark } = useTheme();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Get queue items from sync context
  const queueItems: QueueItem[] = getQueueItems?.() || [];

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'product':
      case 'inventory':
        return Package;
      case 'customer':
      case 'crm':
        return Users;
      case 'order':
      case 'sale':
        return ShoppingCart;
      case 'invoice':
      case 'document':
        return FileText;
      default:
        return MoreHorizontal;
    }
  };

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'Oluştur';
      case 'update':
        return 'Güncelle';
      case 'delete':
        return 'Sil';
      default:
        return operation;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create':
        return colors.semantic.success;
      case 'update':
        return colors.semantic.info;
      case 'delete':
        return colors.semantic.error;
      default:
        return colors.text.secondary;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === queueItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(queueItems.map((item) => item.id)));
    }
  };

  const handleRemoveSelected = useCallback(() => {
    Alert.alert(
      'İşlemleri Sil',
      `${selectedItems.size} bekleyen işlem silinecek. Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              for (const id of selectedItems) {
                await removeFromQueue?.(id);
              }
              setSelectedItems(new Set());
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [selectedItems, removeFromQueue]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Tüm Kuyruğu Temizle',
      'Tüm bekleyen işlemler silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await clearQueue?.();
              setSelectedItems(new Set());
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [clearQueue]);

  const handleSync = useCallback(() => {
    if (isOnline && !isSyncing) {
      syncNow();
    }
  }, [isOnline, isSyncing, syncNow]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <Pressable style={styles.overlayBackground} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background.primary },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                Senkronizasyon Kuyruğu
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {pendingCount} bekleyen işlem
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <X size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          {/* Status Bar */}
          <View
            style={[
              styles.statusBar,
              {
                backgroundColor: isOnline
                  ? colors.semantic.success + '20'
                  : colors.semantic.error + '20',
              },
            ]}
          >
            {isOnline ? (
              <CheckCircle size={16} color={colors.semantic.success} />
            ) : (
              <AlertTriangle size={16} color={colors.semantic.error} />
            )}
            <Text
              style={[
                styles.statusText,
                {
                  color: isOnline
                    ? colors.semantic.success
                    : colors.semantic.error,
                },
              ]}
            >
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı - Bağlantı bekleniyor'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBar}>
            <Pressable
              onPress={selectAll}
              style={[styles.actionButton, { borderColor: colors.border.primary }]}
            >
              <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>
                {selectedItems.size === queueItems.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </Text>
            </Pressable>

            {selectedItems.size > 0 && (
              <Pressable
                onPress={handleRemoveSelected}
                disabled={isDeleting}
                style={[
                  styles.actionButton,
                  { borderColor: colors.semantic.error },
                ]}
              >
                <Trash2 size={14} color={colors.semantic.error} />
                <Text
                  style={[styles.actionButtonText, { color: colors.semantic.error }]}
                >
                  Seçilenleri Sil ({selectedItems.size})
                </Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleSync}
              disabled={!isOnline || isSyncing || pendingCount === 0}
              style={[
                styles.syncButton,
                {
                  backgroundColor:
                    !isOnline || isSyncing || pendingCount === 0
                      ? colors.background.secondary
                      : colors.semantic.info,
                },
              ]}
            >
              <RefreshCw
                size={16}
                color={
                  !isOnline || isSyncing || pendingCount === 0
                    ? colors.text.tertiary
                    : '#fff'
                }
              />
              <Text
                style={[
                  styles.syncButtonText,
                  {
                    color:
                      !isOnline || isSyncing || pendingCount === 0
                        ? colors.text.tertiary
                        : '#fff',
                  },
                ]}
              >
                {isSyncing ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
              </Text>
            </Pressable>
          </View>

          {/* Queue List */}
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {queueItems.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle size={48} color={colors.semantic.success} />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                  Kuyruk Boş
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                  Tüm veriler senkronize edildi
                </Text>
              </View>
            ) : (
              queueItems.map((item, index) => {
                const IconComponent = getEntityIcon(item.entity);
                const isSelected = selectedItems.has(item.id);
                const operationColor = getOperationColor(item.type);

                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeIn.delay(index * 50)}
                    layout={Layout.springify()}
                  >
                    <Pressable
                      onPress={() => toggleItemSelection(item.id)}
                      style={[
                        styles.queueItem,
                        {
                          backgroundColor: isSelected
                            ? colors.semantic.info + '10'
                            : colors.background.secondary,
                          borderColor: isSelected
                            ? colors.semantic.info
                            : colors.border.primary,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.itemIcon,
                          { backgroundColor: operationColor + '20' },
                        ]}
                      >
                        <IconComponent size={20} color={operationColor} />
                      </View>

                      <View style={styles.itemContent}>
                        <View style={styles.itemHeader}>
                          <Text
                            style={[styles.itemName, { color: colors.text.primary }]}
                            numberOfLines={1}
                          >
                            {item.payload?.name || item.entity}
                          </Text>
                          <View
                            style={[
                              styles.operationBadge,
                              { backgroundColor: operationColor + '20' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.operationText,
                                { color: operationColor },
                              ]}
                            >
                              {getOperationLabel(item.type)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.itemMeta}>
                          <Clock size={12} color={colors.text.tertiary} />
                          <Text
                            style={[styles.itemTime, { color: colors.text.tertiary }]}
                          >
                            {formatTimestamp(new Date(item.timestamp))}
                          </Text>
                          {item.retryCount > 0 && (
                            <>
                              <View style={styles.metaSeparator} />
                              <AlertTriangle
                                size={12}
                                color={colors.semantic.warning}
                              />
                              <Text
                                style={[
                                  styles.itemRetry,
                                  { color: colors.semantic.warning },
                                ]}
                              >
                                {item.retryCount} deneme
                              </Text>
                            </>
                          )}
                        </View>
                      </View>

                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isSelected
                              ? colors.semantic.info
                              : 'transparent',
                            borderColor: isSelected
                              ? colors.semantic.info
                              : colors.border.primary,
                          },
                        ]}
                      >
                        {isSelected && (
                          <CheckCircle size={14} color="#fff" />
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          {queueItems.length > 0 && (
            <View
              style={[
                styles.footer,
                { borderTopColor: colors.border.primary },
              ]}
            >
              <Pressable
                onPress={handleClearAll}
                disabled={isDeleting}
                style={styles.clearAllButton}
              >
                <Trash2 size={16} color={colors.semantic.error} />
                <Text
                  style={[styles.clearAllText, { color: colors.semantic.error }]}
                >
                  Tümünü Temizle
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  operationBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  operationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  itemTime: {
    fontSize: 12,
  },
  metaSeparator: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 6,
  },
  itemRetry: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemError: {
    fontSize: 11,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SyncQueueManager;
