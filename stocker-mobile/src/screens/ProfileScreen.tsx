
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Avatar } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

const ProfileScreen = () => {
  const { logout, user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Avatar.Icon size={80} icon="account" style={styles.avatar} />
      <Text style={styles.name}>{user?.name}</Text>
      <Button mode="contained" onPress={logout} style={styles.button}>
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});

export default ProfileScreen;
