import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { message } from 'antd';
import { API_BASE_URL } from '@/config/constants';

interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: Record<string, any>;
}

interface PasswordStrength {
  score: number;
  level: string;
  color: string;
  suggestions: string[];
}

interface DomainCheckResult {
  isAvailable: boolean;
  message: string;
  suggestions?: string[];
}

interface IdentityValidationResult {
  isValid: boolean;
  message: string;
  numberType: string;
  details?: Record<string, any>;
}

export const useRealTimeValidation = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize SignalR connection
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/validation`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: false
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    newConnection.on('Connected', (data) => {
      console.log('Connected to validation hub:', data);
      setIsConnected(true);
    });

    newConnection.on('EmailValidated', (result: ValidationResult) => {
      setValidationResults(prev => ({ ...prev, email: result }));
      setLoading(prev => ({ ...prev, email: false }));
    });

    newConnection.on('PasswordStrengthChecked', (result: PasswordStrength) => {
      setValidationResults(prev => ({ ...prev, password: result }));
      setLoading(prev => ({ ...prev, password: false }));
    });

    newConnection.on('DomainChecked', (result: DomainCheckResult) => {
      setValidationResults(prev => ({ ...prev, domain: result }));
      setLoading(prev => ({ ...prev, domain: false }));
    });

    newConnection.on('PhoneValidated', (result: ValidationResult) => {
      setValidationResults(prev => ({ ...prev, phone: result }));
      setLoading(prev => ({ ...prev, phone: false }));
    });

    newConnection.on('CompanyNameChecked', (result: ValidationResult) => {
      setValidationResults(prev => ({ ...prev, companyName: result }));
      setLoading(prev => ({ ...prev, companyName: false }));
    });

    newConnection.on('IdentityValidated', (result: IdentityValidationResult) => {
      setValidationResults(prev => ({ ...prev, identity: result }));
      setLoading(prev => ({ ...prev, identity: false }));
    });

    newConnection.on('ValidationError', (errorMessage: string) => {
      message.error(errorMessage);
      setLoading({});
    });

    // Reconnection handlers
    newConnection.onreconnecting(() => {
      console.log('Attempting to reconnect to validation hub...');
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      console.log('Reconnected to validation hub');
      setIsConnected(true);
      message.success('Bağlantı yeniden kuruldu');
    });

    newConnection.onclose(() => {
      console.log('Connection closed');
      setIsConnected(false);
    });

    // Start connection
    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log('SignalR Connected for validation');
        setConnection(newConnection);
      } catch (err) {
        console.error('SignalR Connection Error:', err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, []);

  // Validation methods with debouncing
  const validateEmail = useCallback((email: string) => {
    if (!connection || !email) return;

    // Clear existing timer
    if (debounceTimers.current.email) {
      clearTimeout(debounceTimers.current.email);
    }

    // Set loading state
    setLoading(prev => ({ ...prev, email: true }));

    // Debounce the validation
    debounceTimers.current.email = setTimeout(async () => {
      try {
        await connection.invoke('ValidateEmail', email);
      } catch (err) {
        console.error('Email validation error:', err);
        setLoading(prev => ({ ...prev, email: false }));
      }
    }, 500);
  }, [connection]);

  const checkPasswordStrength = useCallback((password: string) => {
    if (!connection || !password) return;

    if (debounceTimers.current.password) {
      clearTimeout(debounceTimers.current.password);
    }

    setLoading(prev => ({ ...prev, password: true }));

    debounceTimers.current.password = setTimeout(async () => {
      try {
        await connection.invoke('CheckPasswordStrength', password);
      } catch (err) {
        console.error('Password strength check error:', err);
        setLoading(prev => ({ ...prev, password: false }));
      }
    }, 300);
  }, [connection]);

  const checkDomain = useCallback((domain: string) => {
    if (!connection || !domain) return;

    if (debounceTimers.current.domain) {
      clearTimeout(debounceTimers.current.domain);
    }

    setLoading(prev => ({ ...prev, domain: true }));

    debounceTimers.current.domain = setTimeout(async () => {
      try {
        await connection.invoke('CheckDomain', domain);
      } catch (err) {
        console.error('Domain check error:', err);
        setLoading(prev => ({ ...prev, domain: false }));
      }
    }, 800);
  }, [connection]);

  const validatePhone = useCallback((phoneNumber: string, countryCode: string = 'TR') => {
    if (!connection || !phoneNumber) return;

    if (debounceTimers.current.phone) {
      clearTimeout(debounceTimers.current.phone);
    }

    setLoading(prev => ({ ...prev, phone: true }));

    debounceTimers.current.phone = setTimeout(async () => {
      try {
        await connection.invoke('ValidatePhone', phoneNumber, countryCode);
      } catch (err) {
        console.error('Phone validation error:', err);
        setLoading(prev => ({ ...prev, phone: false }));
      }
    }, 500);
  }, [connection]);

  const checkCompanyName = useCallback((companyName: string) => {
    if (!connection || !companyName) return;

    if (debounceTimers.current.companyName) {
      clearTimeout(debounceTimers.current.companyName);
    }

    setLoading(prev => ({ ...prev, companyName: true }));

    debounceTimers.current.companyName = setTimeout(async () => {
      try {
        await connection.invoke('CheckCompanyName', companyName);
      } catch (err) {
        console.error('Company name check error:', err);
        setLoading(prev => ({ ...prev, companyName: false }));
      }
    }, 700);
  }, [connection]);

  const validateIdentity = useCallback((identityNumber: string) => {
    if (!connection || !identityNumber) return;

    if (debounceTimers.current.identity) {
      clearTimeout(debounceTimers.current.identity);
    }

    setLoading(prev => ({ ...prev, identity: true }));

    debounceTimers.current.identity = setTimeout(async () => {
      try {
        await connection.invoke('ValidateIdentity', identityNumber);
      } catch (err) {
        console.error('Identity validation error:', err);
        setLoading(prev => ({ ...prev, identity: false }));
      }
    }, 600);
  }, [connection]);

  // Clear specific validation result
  const clearValidation = useCallback((field: string) => {
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[field];
      return newResults;
    });
    setLoading(prev => {
      const newLoading = { ...prev };
      delete newLoading[field];
      return newLoading;
    });
  }, []);

  // Clear all validations
  const clearAllValidations = useCallback(() => {
    setValidationResults({});
    setLoading({});
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};
  }, []);

  return {
    isConnected,
    validationResults,
    loading,
    validateEmail,
    checkPasswordStrength,
    checkDomain,
    validatePhone,
    checkCompanyName,
    validateIdentity,
    clearValidation,
    clearAllValidations
  };
};