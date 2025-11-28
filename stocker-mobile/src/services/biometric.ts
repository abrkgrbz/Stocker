import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

export interface BiometricStatus {
    available: boolean;
    biometryType?: LocalAuthentication.AuthenticationType;
    enrolled: boolean;
}

export const biometricService = {
    checkAvailability: async (): Promise<BiometricStatus> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            let biometryType: LocalAuthentication.AuthenticationType | undefined;
            if (hasHardware) {
                const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
                if (types && types.length > 0) {
                    biometryType = types[0];
                }
            }

            return {
                available: hasHardware && isEnrolled,
                biometryType,
                enrolled: isEnrolled
            };
        } catch (error) {
            console.error('Biometric check failed:', error);
            return { available: false, enrolled: false };
        }
    },

    authenticate: async (promptMessage: string = 'Giriş yapmak için doğrulayın'): Promise<boolean> => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                fallbackLabel: 'Şifre kullan',
                cancelLabel: 'İptal',
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    },

    getBiometryLabel: (type?: LocalAuthentication.AuthenticationType): string => {
        switch (type) {
            case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                return Platform.OS === 'ios' ? 'Face ID' : 'Yüz Tanıma';
            case LocalAuthentication.AuthenticationType.FINGERPRINT:
                return Platform.OS === 'ios' ? 'Touch ID' : 'Parmak İzi';
            case LocalAuthentication.AuthenticationType.IRIS:
                return 'İris Tarama';
            default:
                return 'Biyometrik Giriş';
        }
    }
};
