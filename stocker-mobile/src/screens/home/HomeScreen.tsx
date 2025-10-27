import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { title: 'Total Products', value: '1,234', icon: 'cube', color: Colors.primary },
    { title: 'Low Stock', value: '23', icon: 'alert-circle', color: Colors.warning },
    { title: 'Sales Today', value: '₺12,450', icon: 'cart', color: Colors.success },
    { title: 'Orders', value: '45', icon: 'document-text', color: Colors.accent },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.name || 'User'}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="cube-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Product Added</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="cart-outline" size={20} color={Colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Order</Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.warning} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Low Stock Alert</Text>
              <Text style={styles.activityTime}>6 hours ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    padding: Theme.light.spacing.lg,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: Theme.light.fontSize.md,
    color: Colors.textSecondary,
  },
  username: {
    fontSize: Theme.light.fontSize.xxl,
    fontWeight: Theme.light.fontWeight.bold,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Theme.light.spacing.md,
    gap: Theme.light.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: Theme.light.borderRadius.lg,
    padding: Theme.light.spacing.lg,
    alignItems: 'center',
    ...Theme.light.shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.light.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.light.spacing.sm,
  },
  statValue: {
    fontSize: Theme.light.fontSize.xl,
    fontWeight: Theme.light.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.light.spacing.xs,
  },
  statTitle: {
    fontSize: Theme.light.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: Theme.light.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.light.fontSize.lg,
    fontWeight: Theme.light.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Theme.light.spacing.md,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.light.borderRadius.lg,
    padding: Theme.light.spacing.md,
    ...Theme.light.shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.light.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: Theme.light.borderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.light.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Theme.light.fontSize.md,
    fontWeight: Theme.light.fontWeight.medium,
    color: Colors.text,
  },
  activityTime: {
    fontSize: Theme.light.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default HomeScreen;
