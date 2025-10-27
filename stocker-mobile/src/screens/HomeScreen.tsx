
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Appbar } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

const HomeScreen = () => {
  const { logout, user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Stocker Mobile" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
        <Button mode="contained" onPress={logout} style={styles.button}>
          Logout
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});

export default HomeScreen;
