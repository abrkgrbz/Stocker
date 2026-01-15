import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Cloud, CloudOff, RefreshCw, Check } from 'lucide-react-native';
import { useSync } from '@/lib/sync';
import { useTheme } from '@/lib/theme';

interface PendingMutationsCounterProps {
  /** Counter style variant */
  variant?: 'badge' | 'pill' | 'compact';
  /** Show sync button */
  showSyncButton?: boolean;
  /** Custom onPress handler */
  onPress?: () => void;
  /** Size of the counter */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PendingMutationsCounter Component
 *
 * Displays the count of pending offline mutations with sync status.
 * Tapping can trigger manual sync or open a details modal.
 */
export function PendingMutationsCounter({
  variant = 'badge',
  showSyncButton = true,
  onPress,
  size = 'md',
}: PendingMutationsCounterProps) {
  const { isOnline, pendingCount, isSyncing, syncNow } = useSync();
  const { colors } = useTheme();

  // Animation for syncing state
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isSyncing, rotation]);

  // Bounce animation when count changes
  React.useEffect(() => {
    if (pendingCount > 0) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
    }
  }, [pendingCount, scale]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Don't show if online with no pending items and not syncing
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (showSyncButton && isOnline && pendingCount > 0 && !isSyncing) {
      syncNow();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 4, paddingHorizontal: 8 },
          icon: 14,
          text: 11,
          badge: { minWidth: 16, height: 16 },
        };
      case 'lg':
        return {
          container: { paddingVertical: 10, paddingHorizontal: 16 },
          icon: 22,
          text: 16,
          badge: { minWidth: 24, height: 24 },
        };
      default:
        return {
          container: { paddingVertical: 6, paddingHorizontal: 12 },
          icon: 18,
          text: 13,
          badge: { minWidth: 20, height: 20 },
        };
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return colors.semantic.error;
    if (isSyncing) return colors.semantic.info;
    if (pendingCount > 0) return colors.semantic.warning;
    return colors.semantic.success;
  };

  const getIcon = () => {
    if (!isOnline) return CloudOff;
    if (isSyncing) return RefreshCw;
    if (pendingCount === 0) return Check;
    return Cloud;
  };

  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();
  const IconComponent = getIcon();

  if (variant === 'badge') {
    return (
      <Pressable onPress={handlePress} hitSlop={8}>
        <Animated.View style={scaleStyle}>
          <View style={[styles.badgeContainer, { backgroundColor: statusColor }]}>
            <Animated.View style={isSyncing ? rotationStyle : undefined}>
              <IconComponent size={sizeStyles.icon} color="#fff" />
            </Animated.View>
            {pendingCount > 0 && (
              <View
                style={[
                  styles.countBadge,
                  sizeStyles.badge,
                  { backgroundColor: colors.background.primary },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: statusColor, fontSize: sizeStyles.text - 2 },
                  ]}
                >
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  if (variant === 'pill') {
    return (
      <Pressable onPress={handlePress} hitSlop={8}>
        <Animated.View style={scaleStyle}>
          <View
            style={[
              styles.pillContainer,
              sizeStyles.container,
              { backgroundColor: statusColor },
            ]}
          >
            <Animated.View style={isSyncing ? rotationStyle : undefined}>
              <IconComponent size={sizeStyles.icon} color="#fff" />
            </Animated.View>
            <Text style={[styles.pillText, { fontSize: sizeStyles.text }]}>
              {isSyncing
                ? 'Senkronize ediliyor...'
                : !isOnline
                ? 'Çevrimdışı'
                : `${pendingCount} bekleyen`}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  // Compact variant
  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={scaleStyle}>
        <View style={styles.compactContainer}>
          <Animated.View style={isSyncing ? rotationStyle : undefined}>
            <IconComponent size={sizeStyles.icon} color={statusColor} />
          </Animated.View>
          {pendingCount > 0 && (
            <View
              style={[
                styles.compactBadge,
                { backgroundColor: statusColor },
              ]}
            >
              <Text style={styles.compactBadgeText}>
                {pendingCount > 9 ? '9+' : pendingCount}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Badge variant
  badgeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontWeight: '700',
  },

  // Pill variant
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 8,
  },
  pillText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Compact variant
  compactContainer: {
    position: 'relative',
  },
  compactBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  compactBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default PendingMutationsCounter;
