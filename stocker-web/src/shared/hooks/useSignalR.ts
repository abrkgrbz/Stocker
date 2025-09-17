import { useEffect, useState, useCallback } from 'react';
import signalRService, { 
  ValidationResult, 
  PasswordStrength, 
  DomainCheckResult,
  TenantCodeValidationResult,
  NotificationMessage 
} from '@/services/signalr.service';
import mockSignalRService from '@/services/mockSignalr.service';

export const useSignalRValidation = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [emailValidation, setEmailValidation] = useState<ValidationResult | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [domainCheck, setDomainCheck] = useState<DomainCheckResult | null>(null);
  const [phoneValidation, setPhoneValidation] = useState<ValidationResult | null>(null);
  const [companyNameCheck, setCompanyNameCheck] = useState<ValidationResult | null>(null);
  const [identityValidation, setIdentityValidation] = useState<ValidationResult | null>(null);
  const [tenantCodeValidation, setTenantCodeValidation] = useState<TenantCodeValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useMockService, setUseMockService] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let connectionAttempted = false;
    
    const initConnection = async () => {
      // Prevent multiple connection attempts
      if (connectionAttempted) return;
      connectionAttempted = true;
      
      const service = useMockService ? mockSignalRService : signalRService;
      
      try {
        // Try real service first with timeout
        if (!useMockService) {
          const connectionPromise = signalRService.startValidationConnection();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );
          
          await Promise.race([connectionPromise, timeoutPromise]);
                  } else {
          await mockSignalRService.startValidationConnection();
                  }
        
        if (isMounted) {
          setIsConnected(true);
          setError(null);
        }

        // Set up event listeners
        service.onEmailValidated((result) => {
          setEmailValidation(result);
        });

        service.onPasswordStrengthChecked((strength) => {
          setPasswordStrength(strength);
        });

        service.onDomainChecked((result) => {
          setDomainCheck(result);
        });

        service.onPhoneValidated((result) => {
          setPhoneValidation(result);
        });

        service.onCompanyNameChecked((result) => {
          setCompanyNameCheck(result);
        });

        service.onIdentityValidated((result) => {
                    setIdentityValidation(result);
        });

        service.onTenantCodeValidated((result) => {
          setTenantCodeValidation(result);
        });

        service.onValidationError((error) => {
          setError(error);
        });

        service.onConnected(() => {});
      } catch (err) {
        // Error handling removed for production
        // Fallback to mock service
        if (!useMockService) {
                    setUseMockService(true);
          setError('Using mock validation service (API not available)');
        } else {
          setError('Failed to connect to validation service');
          setIsConnected(false);
        }
      }
    };

    initConnection();

    return () => {
      isMounted = false;
      if (useMockService) {
        mockSignalRService.stopValidationConnection();
      } else {
        signalRService.stopValidationConnection();
      }
    };
  }, []); // Remove useMockService from dependencies to prevent reconnection

  const service = useMockService ? mockSignalRService : signalRService;

  const validateEmail = useCallback(async (email: string) => {
    setError(null);
    setEmailValidation(null);
    try {
      await service.validateEmail(email);
    } catch (err) {
      setError('Failed to validate email');
    }
  }, [service]);

  const checkPasswordStrength = useCallback(async (password: string) => {
    setError(null);
    setPasswordStrength(null);
    try {
      await service.checkPasswordStrength(password);
    } catch (err) {
      setError('Failed to check password strength');
    }
  }, [service]);

  const checkDomain = useCallback(async (domain: string) => {
    setError(null);
    setDomainCheck(null);
    try {
      await service.checkDomain(domain);
    } catch (err) {
      setError('Failed to check domain');
    }
  }, [service]);

  const validatePhone = useCallback(async (phone: string, countryCode: string = 'TR') => {
    setError(null);
    setPhoneValidation(null);
    try {
      await service.validatePhone(phone, countryCode);
    } catch (err) {
      setError('Failed to validate phone');
    }
  }, [service]);

  const checkCompanyName = useCallback(async (name: string) => {
    setError(null);
    setCompanyNameCheck(null);
    try {
      await service.checkCompanyName(name);
    } catch (err) {
      setError('Failed to check company name');
    }
  }, [service]);

  const validateIdentity = useCallback(async (identityNumber: string) => {
        setError(null);
    setIdentityValidation(null);
    try {
      await service.validateIdentity(identityNumber);
          } catch (err) {
      // Error handling removed for production
      setError('Failed to validate identity number');
      // Set a fallback validation result
      setIdentityValidation({
        isValid: false,
        message: 'Doğrulama servisi geçici olarak kullanılamıyor'
      });
    }
  }, [service]);

  const validateTenantCode = useCallback(async (code: string) => {
    setError(null);
    setTenantCodeValidation(null);
    try {
      await service.validateTenantCode(code);
    } catch (err) {
      // Error handling removed for production
      setError('Failed to validate tenant code');
      // Set a fallback validation result
      setTenantCodeValidation({
        isAvailable: false,
        message: 'Doğrulama servisi geçici olarak kullanılamıyor',
        code: code,
        suggestedCodes: []
      });
    }
  }, [service]);

  return {
    isConnected,
    emailValidation,
    passwordStrength,
    domainCheck,
    phoneValidation,
    companyNameCheck,
    identityValidation,
    tenantCodeValidation,
    error,
    validateEmail,
    checkPasswordStrength,
    checkDomain,
    validatePhone,
    checkCompanyName,
    validateIdentity,
    validateTenantCode,
  };
};

export const useSignalRNotifications = (token?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initConnection = async () => {
      try {
        await signalRService.startNotificationConnection(token);
        setIsConnected(true);

        signalRService.onNotificationReceived((notification) => {
          setNotifications(prev => [notification, ...prev]);
        });

        signalRService.onConnected(() => {});
      } catch (err) {
        // Error handling removed for production
        setError('Failed to connect to notification service');
        setIsConnected(false);
      }
    };

    if (token) {
      initConnection();
    }

    return () => {
      signalRService.stopNotificationConnection();
    };
  }, [token]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    isConnected,
    notifications,
    error,
    clearNotifications,
    removeNotification,
  };
};