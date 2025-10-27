import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const settingsItems = [
    { title: 'Profile', icon: 'person-outline', onPress: () => {} },
    { title: 'Notifications', icon: 'notifications-outline', onPress: () => {} },
    { title: 'Language', icon: 'language-outline', onPress: () => {} },
    { title: 'Theme', icon: 'moon-outline', onPress: () => {} },
    { title: 'Help & Support', icon: 'help-circle-outline', onPress: () => {} },
    { title: 'About', icon: 'information-circle-outline', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.menuSection}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  userSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Theme.light.spacing.xl,
    marginBottom: Theme.light.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.light.spacing.md,
  },
  avatarText: {
    fontSize: Theme.light.fontSize.xxxl,
    fontWeight: Theme.light.fontWeight.bold,
    color: Colors.white,
  },
  userName: {
    fontSize: Theme.light.fontSize.xl,
    fontWeight: Theme.light.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.light.spacing.xs,
  },
  userEmail: {
    fontSize: Theme.light.fontSize.sm,
    color: Colors.textSecondary,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginBottom: Theme.light.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.light.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: Theme.light.fontSize.md,
    color: Colors.text,
    marginLeft: Theme.light.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Theme.light.spacing.lg,
    marginBottom: Theme.light.spacing.md,
  },
  logoutText: {
    fontSize: Theme.light.fontSize.md,
    fontWeight: Theme.light.fontWeight.semibold,
    color: Colors.error,
    marginLeft: Theme.light.spacing.sm,
  },
  version: {
    textAlign: 'center',
    fontSize: Theme.light.fontSize.sm,
    color: Colors.textSecondary,
    paddingVertical: Theme.light.spacing.md,
  },
});

export default SettingsScreen;
