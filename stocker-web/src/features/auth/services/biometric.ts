// Biometric Authentication Service
// WebAuthn API implementation for biometric authentication

interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    alg: number;
    type: string;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
}

class BiometricAuthService {
  private isSupported: boolean = false;
  private isAvailable: boolean = false;

  constructor() {
    this.checkSupport();
  }

  // Check if WebAuthn is supported
  private async checkSupport() {
    this.isSupported = !!(
      navigator.credentials &&
      window.PublicKeyCredential
    );

    if (this.isSupported) {
      try {
        this.isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        this.isAvailable = false;
      }
    }
  }

  // Check if biometric authentication is available
  public isBiometricAvailable(): boolean {
    return this.isSupported && this.isAvailable;
  }

  // Encode string to base64url
  private base64urlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Decode base64url to ArrayBuffer
  private base64urlDecode(str: string): ArrayBuffer {
    str = (str + '===').slice(0, str.length + (str.length % 4));
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Generate random challenge
  private generateChallenge(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64urlEncode(String.fromCharCode(...array));
  }

  // Register biometric credential
  public async registerBiometric(
    userId: string,
    username: string,
    displayName?: string
  ): Promise<{ credentialId: string; publicKey: string } | null> {
    if (!this.isBiometricAvailable()) {
      throw new Error('Biometric authentication is not available');
    }

    try {
      const challenge = this.generateChallenge();
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: this.base64urlDecode(challenge),
        rp: {
          name: 'Stocker',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: username,
          displayName: displayName || username
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Use platform authenticator (Touch ID, Face ID, Windows Hello)
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: 'direct'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Get credential data
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = this.base64urlEncode(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );
      const publicKey = this.base64urlEncode(
        String.fromCharCode(...new Uint8Array(response.publicKey!))
      );

      // Store credential info
      this.storeCredential(userId, credentialId, publicKey);

      return {
        credentialId,
        publicKey
      };
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  }

  // Authenticate with biometric
  public async authenticateWithBiometric(
    userId?: string
  ): Promise<{ verified: boolean; userId?: string } | null> {
    if (!this.isBiometricAvailable()) {
      throw new Error('Biometric authentication is not available');
    }

    try {
      const challenge = this.generateChallenge();
      const credentialIds = this.getStoredCredentials(userId);

      if (credentialIds.length === 0) {
        throw new Error('No registered biometric credentials found');
      }

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: this.base64urlDecode(challenge),
        allowCredentials: credentialIds.map(id => ({
          id: this.base64urlDecode(id),
          type: 'public-key' as PublicKeyCredentialType,
          transports: ['internal'] as AuthenticatorTransport[]
        })),
        userVerification: 'required',
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Authentication failed');
      }

      // Verify assertion (in production, this should be done server-side)
      const response = assertion.response as AuthenticatorAssertionResponse;
      const verified = this.verifyAssertion(assertion.id, response);

      if (verified) {
        const authenticatedUserId = this.getUserIdFromCredential(assertion.id);
        return {
          verified: true,
          userId: authenticatedUserId
        };
      }

      return { verified: false };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  }

  // Store credential in localStorage (in production, use secure backend)
  private storeCredential(userId: string, credentialId: string, publicKey: string) {
    const credentials = JSON.parse(
      localStorage.getItem('biometric_credentials') || '{}'
    );
    
    if (!credentials[userId]) {
      credentials[userId] = [];
    }
    
    credentials[userId].push({
      credentialId,
      publicKey,
      createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('biometric_credentials', JSON.stringify(credentials));
  }

  // Get stored credentials
  private getStoredCredentials(userId?: string): string[] {
    const credentials = JSON.parse(
      localStorage.getItem('biometric_credentials') || '{}'
    );
    
    if (userId) {
      return (credentials[userId] || []).map((c: any) => c.credentialId);
    }
    
    // Return all credential IDs if no specific user
    const allCredentials: string[] = [];
    Object.values(credentials).forEach((userCreds: any) => {
      userCreds.forEach((c: any) => {
        allCredentials.push(c.credentialId);
      });
    });
    
    return allCredentials;
  }

  // Get user ID from credential
  private getUserIdFromCredential(credentialId: string): string | undefined {
    const credentials = JSON.parse(
      localStorage.getItem('biometric_credentials') || '{}'
    );
    
    for (const [userId, userCreds] of Object.entries(credentials)) {
      const creds = userCreds as any[];
      if (creds.some(c => c.credentialId === credentialId)) {
        return userId;
      }
    }
    
    return undefined;
  }

  // Verify assertion (simplified - in production, do this server-side)
  private verifyAssertion(credentialId: string, response: AuthenticatorAssertionResponse): boolean {
    // In a real implementation, this should:
    // 1. Verify the signature using the stored public key
    // 2. Check the authenticator data
    // 3. Verify the client data JSON
    // 4. Check the challenge matches
    
    // For demo purposes, we'll do a simple check
    const clientDataJSON = new TextDecoder().decode(response.clientDataJSON);
    const clientData = JSON.parse(clientDataJSON);
    
    return clientData.type === 'webauthn.get';
  }

  // Remove biometric credential
  public removeBiometricCredential(userId: string, credentialId?: string) {
    const credentials = JSON.parse(
      localStorage.getItem('biometric_credentials') || '{}'
    );
    
    if (credentialId) {
      // Remove specific credential
      if (credentials[userId]) {
        credentials[userId] = credentials[userId].filter(
          (c: any) => c.credentialId !== credentialId
        );
        
        if (credentials[userId].length === 0) {
          delete credentials[userId];
        }
      }
    } else {
      // Remove all credentials for user
      delete credentials[userId];
    }
    
    localStorage.setItem('biometric_credentials', JSON.stringify(credentials));
  }

  // Check if user has biometric registered
  public hasBiometricRegistered(userId: string): boolean {
    const credentials = JSON.parse(
      localStorage.getItem('biometric_credentials') || '{}'
    );
    
    return !!(credentials[userId] && credentials[userId].length > 0);
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuthService();

// React Hooks for Biometric Authentication
import { useState, useEffect, useCallback } from 'react';

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAvailable(biometricAuth.isBiometricAvailable());
  }, []);

  const checkRegistration = useCallback((userId: string) => {
    setIsRegistered(biometricAuth.hasBiometricRegistered(userId));
  }, []);

  const register = useCallback(async (
    userId: string,
    username: string,
    displayName?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await biometricAuth.registerBiometric(userId, username, displayName);
      if (result) {
        setIsRegistered(true);
        return true;
      }
      return false;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await biometricAuth.authenticateWithBiometric(userId);
      return result;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback((userId: string, credentialId?: string) => {
    biometricAuth.removeBiometricCredential(userId, credentialId);
    setIsRegistered(false);
  }, []);

  return {
    isAvailable,
    isRegistered,
    loading,
    error,
    register,
    authenticate,
    remove,
    checkRegistration
  };
};