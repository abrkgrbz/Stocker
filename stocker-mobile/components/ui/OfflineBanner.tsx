import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { WifiOff, RefreshCw, Cloud, Clock } from 'lucide-react-native';
import { useSync } from '@/lib/sync';
import { useTheme } from '@/lib/theme';

interface OfflineBannerProps {
  /** Banner style variant */
  variant?: 'persistent' | 'toast';
  /** Show pending mutations count */
  showPendingCount?: boolean;
  /** Show last sync time */
  showLastSync?: boolean;
  /** Auto-dismiss after this many ms (only for toast variant) */
  autoDismissMs?: number;
}

/**
 * OfflineBanner Component
 *
 * Displays network status and sync information to users.
 * Shows when offline, has pending changes, or is actively syncing.
 */
export function OfflineBanner({
  variant = 'persistent',
  showPendingCount = true,
  showLastSync = true,
  autoDismissMs = 5000,
}: OfflineBannerProps) {
  const { isOnline, pendingCount, isSyncing, syncNow, lastSyncTime } = useSync();
  const { colors, isDark } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  // Auto-show when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // Auto-dismiss for toast variant when online
  useEffect(() => {
    if (variant === 'toast' && isOnline && pendingCount === 0 && !isSyncing) {
      const timer = setTimeout(() => setDismissed(true), autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [variant, isOnline, pendingCount, isSyncing, autoDismissMs]);

  // Pulse animation for syncing state
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isSyncing) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isSyncing, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Determine if banner should be visible
  const shouldShow = !isOnline || pendingCount > 0 || isSyncing;

  // Toast variant can be dismissed
  if (variant === 'toast' && dismissed && isOnline) {
    return null;
  }

  // Don't show if online with no pending items and not syncing
  if (!shouldShow) {
    return null;
  }

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Hiç senkronize edilmedi';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    return lastSyncTime.toLocaleDateString('tr-TR');
  };

  const getBannerColor = () => {
    if (!isOnline) return colors.semantic.error;
    if (isSyncing) return colors.semantic.info;
    if (pendingCount > 0) return colors.semantic.warning;
    return colors.semantic.success;
  };

  const getIcon = () => {
    if (!isOnline) return WifiOff;
    if (isSyncing) return RefreshCw;
    return Cloud;
  };

  const getMessage = () => {
    if (!isOnline) return 'Çevrimdışı Mod';
    if (isSyncing) return 'Senkronize ediliyor...';
    return 'Bekleyen değişiklikler var';
  };

  const IconComponent = getIcon();
  const bgColor = getBannerColor();

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, pulseStyle]}>
          <IconComponent size={18} color="#fff" />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{getMessage()}</Text>

          <View style={styles.details}>
            {showPendingCount && pendingCount > 0 && (
              <Text style={styles.detailText}>
                {pendingCount} bekleyen işlem
              </Text>
            )}
            {showLastSync && lastSyncTime && (
              <View style={styles.lastSyncContainer}>
                <Clock size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>{formatLastSync()}</Text>
              </View>
            )}
          </View>
        </View>

        {isOnline && !isSyncing && pendingCount > 0 && (
          <Pressable onPress={syncNow} style={styles.syncButton} hitSlop={8}>
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.syncButtonText}>Senkronize Et</Text>
          </Pressable>
        )}

        {variant === 'toast' && isOnline && (
          <Pressable
            onPress={() => setDismissed(true)}
            style={styles.dismissButton}
            hitSlop={8}
          >
            <Text style={styles.dismissText}>Kapat</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 12,
  },
  detailText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  lastSyncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
  dismissText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});

export default OfflineBanner;
