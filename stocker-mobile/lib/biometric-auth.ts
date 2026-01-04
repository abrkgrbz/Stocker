import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'stocker_biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'stocker_biometric_credentials';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricStatus {
    isAvailable: boolean;
    isEnrolled: boolean;
    biometricType: BiometricType;
    securityLevel: 'none' | 'weak' | 'strong';
}

export interface BiometricCredentials {
    email: string;
    tenantCode: string;
    // We store a secure token, not the password
    authToken: string;
}

/**
 * Get the type of biometric authentication available
 */
function getBiometricType(types: LocalAuthentication.AuthenticationType[]): BiometricType {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'facial';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'iris';
    }
    return 'none';
}

/**
 * Get user-friendly name for biometric type
 */
export function getBiometricName(type: BiometricType): string {
    switch (type) {
        case 'facial':
            return Platform.OS === 'ios' ? 'Face ID' : 'Yüz Tanıma';
        case 'fingerprint':
            return Platform.OS === 'ios' ? 'Touch ID' : 'Parmak İzi';
        case 'iris':
            return 'Iris Tarama';
        default:
            return 'Biyometrik';
    }
}

/**
 * Check biometric authentication availability and status
 */
export async function checkBiometricStatus(): Promise<BiometricStatus> {
    try {
        // Check if hardware is available
        const isAvailable = await LocalAuthentication.hasHardwareAsync();

        if (!isAvailable) {
            return {
                isAvailable: false,
                isEnrolled: false,
                biometricType: 'none',
                securityLevel: 'none',
            };
        }

        // Check if biometrics are enrolled
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        // Get supported authentication types
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const biometricType = getBiometricType(supportedTypes);

        // Get security level
        const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
        let level: 'none' | 'weak' | 'strong' = 'none';

        if (securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
            level = 'strong';
        } else if (securityLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK) {
            level = 'weak';
        }

        return {
            isAvailable,
            isEnrolled,
            biometricType,
            securityLevel: level,
        };
    } catch (error) {
        console.error('Error checking biometric status:', error);
        return {
            isAvailable: false,
            isEnrolled: false,
            biometricType: 'none',
            securityLevel: 'none',
        };
    }
}

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometrics(
    promptMessage?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const status = await checkBiometricStatus();

        if (!status.isAvailable) {
            return { success: false, error: 'Cihazınızda biyometrik doğrulama desteklenmiyor.' };
        }

        if (!status.isEnrolled) {
            return { success: false, error: 'Biyometrik doğrulama ayarlanmamış. Lütfen cihaz ayarlarından yapılandırın.' };
        }

        const biometricName = getBiometricName(status.biometricType);

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: promptMessage || `${biometricName} ile giriş yapın`,
            cancelLabel: 'İptal',
            fallbackLabel: 'Şifre Kullan',
            disableDeviceFallback: false,
        });

        if (result.success) {
            return { success: true };
        }

        // Handle different error types
        if (result.error === 'user_cancel') {
            return { success: false, error: 'İptal edildi' };
        }
        if (result.error === 'user_fallback') {
            return { success: false, error: 'fallback' };
        }
        if (result.error === 'lockout') {
            return { success: false, error: 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.' };
        }

        return { success: false, error: 'Doğrulama başarısız oldu' };
    } catch (error) {
        console.error('Biometric authentication error:', error);
        return { success: false, error: 'Bir hata oluştu' };
    }
}

/**
 * Check if biometric login is enabled for this device
 */
export async function isBiometricEnabled(): Promise<boolean> {
    try {
        const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        return value === 'true';
    } catch {
        return false;
    }
}

/**
 * Enable biometric login and store credentials securely
 */
export async function enableBiometricLogin(credentials: BiometricCredentials): Promise<boolean> {
    try {
        // First authenticate to confirm user identity
        const authResult = await authenticateWithBiometrics('Biyometrik girişi etkinleştirmek için doğrulayın');

        if (!authResult.success) {
            return false;
        }

        // Store credentials securely
        await SecureStore.setItemAsync(
            BIOMETRIC_CREDENTIALS_KEY,
            JSON.stringify(credentials)
        );

        // Mark biometric as enabled
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

        return true;
    } catch (error) {
        console.error('Error enabling biometric login:', error);
        return false;
    }
}

/**
 * Disable biometric login
 */
export async function disableBiometricLogin(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    } catch (error) {
        console.error('Error disabling biometric login:', error);
    }
}

/**
 * Get stored biometric credentials after successful authentication
 */
export async function getBiometricCredentials(): Promise<BiometricCredentials | null> {
    try {
        // Require biometric authentication first
        const authResult = await authenticateWithBiometrics();

        if (!authResult.success) {
            return null;
        }

        // Get stored credentials
        const data = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);

        if (!data) {
            return null;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error('Error getting biometric credentials:', error);
        return null;
    }
}

/**
 * Check if we have stored credentials for biometric login
 */
export async function hasBiometricCredentials(): Promise<boolean> {
    try {
        const data = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
        return !!data;
    } catch {
        return false;
    }
}
