import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api/authService';
import { Colors } from '../../constants/colors';
import { Theme } from '../../constants/theme';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      await login(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      });
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.gray400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.light.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Theme.light.spacing.xl,
  },
  title: {
    fontSize: Theme.light.fontSize.xxxl,
    fontWeight: Theme.light.fontWeight.bold,
    color: Colors.text,
    marginBottom: Theme.light.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.light.fontSize.md,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Theme.light.spacing.lg,
  },
  label: {
    fontSize: Theme.light.fontSize.sm,
    fontWeight: Theme.light.fontWeight.medium,
    color: Colors.text,
    marginBottom: Theme.light.spacing.sm,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Theme.light.borderRadius.md,
    paddingHorizontal: Theme.light.spacing.md,
    paddingVertical: Theme.light.spacing.md,
    fontSize: Theme.light.fontSize.md,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.light.borderRadius.md,
    paddingVertical: Theme.light.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.light.spacing.md,
    height: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Theme.light.fontSize.md,
    fontWeight: Theme.light.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.light.spacing.lg,
  },
  footerText: {
    fontSize: Theme.light.fontSize.sm,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: Theme.light.fontSize.sm,
    color: Colors.primary,
    fontWeight: Theme.light.fontWeight.semibold,
  },
});

export default LoginScreen;
