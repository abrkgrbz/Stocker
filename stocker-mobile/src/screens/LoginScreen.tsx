
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Title, Snackbar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import * as authService from '../services/authService';

const LoginScreen = () => {
  const { login } = useAuthStore();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(data.username, data.password);
      login(token, user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Stocker Mobile</Title>
          <Controller
            control={control}
            rules={{
              required: 'Username is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Username"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                error={!!errors.username}
              />
            )}
            name="username"
          />
          <Controller
            control={control}
            rules={{
              required: 'Password is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                style={styles.input}
                error={!!errors.password}
              />
            )}
            name="password"
          />
          <Button 
            mode="contained" 
            onPress={handleSubmit(onSubmit)} 
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Dismiss',
          onPress: () => {
            setError(null);
          },
        }}>
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '80%',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
});

export default LoginScreen;