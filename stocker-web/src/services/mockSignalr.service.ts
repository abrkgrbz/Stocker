// Mock SignalR Service for development when API is not accessible
import { ValidationResult, PasswordStrength, DomainCheckResult, NotificationMessage } from './signalr.service';

class MockSignalRService {
  private emailCallbacks: Array<(result: ValidationResult) => void> = [];
  private passwordCallbacks: Array<(strength: PasswordStrength) => void> = [];
  private domainCallbacks: Array<(result: DomainCheckResult) => void> = [];
  private phoneCallbacks: Array<(result: ValidationResult) => void> = [];
  private companyCallbacks: Array<(result: ValidationResult) => void> = [];
  private identityCallbacks: Array<(result: ValidationResult) => void> = [];
  private notificationCallbacks: Array<(notification: NotificationMessage) => void> = [];
  private connectedCallbacks: Array<(data: any) => void> = [];
  private errorCallbacks: Array<(error: string) => void> = [];

  async startValidationConnection(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connectedCallbacks.forEach(cb => cb({ connectionId: "mock-connection-id" }));
  }

  async startNotificationConnection(token?: string): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connectedCallbacks.forEach(cb => cb({ connectionId: "mock-notification-id", token }));
  }

  // Email Validation
  async validateEmail(email: string): Promise<void> {
    // Simulate server processing delay
    setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      
      const result: ValidationResult = {
        isValid,
        message: isValid 
          ? "Email adresi geçerli" 
          : "Geçersiz email formatı",
        details: {
          format: isValid ? "valid" : "invalid",
          domain: email.split('@')[1] || "",
          suggestion: !isValid && !email.includes('@') ? "@ işareti eksik" : ""
        }
      };
      
      this.emailCallbacks.forEach(cb => cb(result));
    }, 300);
  }

  onEmailValidated(callback: (result: ValidationResult) => void): void {
    this.emailCallbacks.push(callback);
  }

  // Password Strength Check
  async checkPasswordStrength(password: string): Promise<void> {
    setTimeout(() => {
      let score = 0;
      const suggestions: string[] = [];
      
      // Length check
      if (password.length >= 8) score++;
      else suggestions.push("En az 8 karakter kullanın");
      
      if (password.length >= 12) score++;
      
      // Uppercase check
      if (/[A-Z]/.test(password)) score++;
      else suggestions.push("Büyük harf ekleyin");
      
      // Lowercase check
      if (/[a-z]/.test(password)) score++;
      else suggestions.push("Küçük harf ekleyin");
      
      // Number check
      if (/\d/.test(password)) score++;
      else suggestions.push("Rakam ekleyin");
      
      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
      else suggestions.push("Özel karakter ekleyin (!@#$%^&*)");
      
      const levels = ['VeryWeak', 'Weak', 'Fair', 'Strong', 'VeryStrong'];
      const colors = ['#ff4d4f', '#faad14', '#fadb14', '#52c41a', '#389e0d'];
      
      const levelIndex = Math.min(Math.floor(score / 1.5), 4);
      
      const strength: PasswordStrength = {
        score: Math.min(score, 5),
        level: levels[levelIndex],
        color: colors[levelIndex],
        suggestions
      };
      
      this.passwordCallbacks.forEach(cb => cb(strength));
    }, 200);
  }

  onPasswordStrengthChecked(callback: (strength: PasswordStrength) => void): void {
    this.passwordCallbacks.push(callback);
  }

  // Domain Check
  async checkDomain(domain: string): Promise<void> {
    setTimeout(() => {
      const takenDomains = ['test.stocker.app', 'demo.stocker.app', 'example.stocker.app'];
      const isAvailable = !takenDomains.includes(domain.toLowerCase());
      
      const baseName = domain.split('.')[0];
      const suggestions = isAvailable ? [] : [
        `${baseName}1.stocker.app`,
        `${baseName}-company.stocker.app`,
        `${baseName}2024.stocker.app`
      ];
      
      const result: DomainCheckResult = {
        isAvailable,
        message: isAvailable 
          ? "Domain kullanılabilir" 
          : "Bu domain zaten kullanılıyor",
        suggestions
      };
      
      this.domainCallbacks.forEach(cb => cb(result));
    }, 400);
  }

  onDomainChecked(callback: (result: DomainCheckResult) => void): void {
    this.domainCallbacks.push(callback);
  }

  // Phone Validation
  async validatePhone(phoneNumber: string, countryCode: string = "TR"): Promise<void> {
    setTimeout(() => {
      // Simple Turkish phone number validation
      const cleaned = phoneNumber.replace(/\D/g, '');
      const isValid = countryCode === 'TR' 
        ? /^(90)?5\d{9}$/.test(cleaned) || /^5\d{9}$/.test(cleaned)
        : cleaned.length >= 10;
      
      const result: ValidationResult = {
        isValid,
        message: isValid 
          ? "Telefon numarası geçerli" 
          : "Geçersiz telefon numarası formatı",
        details: {
          countryCode,
          format: isValid ? "valid" : "invalid",
          suggestion: countryCode === 'TR' && !isValid 
            ? "Türkiye telefon numarası 5XX XXX XX XX formatında olmalı" 
            : ""
        }
      };
      
      this.phoneCallbacks.forEach(cb => cb(result));
    }, 300);
  }

  onPhoneValidated(callback: (result: ValidationResult) => void): void {
    this.phoneCallbacks.push(callback);
  }

  // Company Name Check
  async checkCompanyName(companyName: string): Promise<void> {
    setTimeout(() => {
      const takenNames = ['ABC Teknoloji', 'XYZ Yazılım', 'Test Company'];
      const isValid = !takenNames.some(name => 
        name.toLowerCase() === companyName.toLowerCase()
      );
      
      const result: ValidationResult = {
        isValid,
        message: isValid 
          ? "Şirket adı kullanılabilir" 
          : "Bu şirket adı zaten kayıtlı",
        details: {
          available: isValid ? "yes" : "no",
          suggestion: !isValid ? "Şirket adına bir numara veya ayırt edici kelime ekleyin" : ""
        }
      };
      
      this.companyCallbacks.forEach(cb => cb(result));
    }, 350);
  }

  onCompanyNameChecked(callback: (result: ValidationResult) => void): void {
    this.companyCallbacks.push(callback);
  }

  // Identity Validation (TC Kimlik No / Vergi No)
  async validateIdentity(identityNumber: string): Promise<void> {
    setTimeout(() => {
      // Remove spaces and non-numeric characters
      const cleaned = identityNumber.replace(/\D/g, '');
      let isValid = false;
      let numberType = '';
      let message = '';
      
      if (cleaned.length === 11) {
        // TC Kimlik No validation (simplified)
        numberType = 'TCKimlik';
        const firstDigit = parseInt(cleaned[0]);
        isValid = firstDigit !== 0 && /^\d{11}$/.test(cleaned);
        message = isValid 
          ? "TC Kimlik numarası geçerli" 
          : "Geçersiz TC Kimlik numarası";
      } else if (cleaned.length === 10) {
        // Vergi No validation (simplified)
        numberType = 'VergiNo';
        isValid = /^\d{10}$/.test(cleaned);
        message = isValid 
          ? "Vergi numarası geçerli" 
          : "Geçersiz Vergi numarası";
      } else {
        message = "Kimlik/Vergi numarası 10 veya 11 haneli olmalıdır";
      }
      
      const result: ValidationResult = {
        isValid,
        message,
        details: {
          numberType,
          formattedNumber: cleaned,
          length: cleaned.length.toString()
        }
      };
      
      this.identityCallbacks.forEach(cb => cb(result));
    }, 400);
  }

  onIdentityValidated(callback: (result: ValidationResult) => void): void {
    this.identityCallbacks.push(callback);
  }

  // Notification Methods
  onNotificationReceived(callback: (notification: NotificationMessage) => void): void {
    this.notificationCallbacks.push(callback);
    
    // Simulate some notifications
    setTimeout(() => {
      const mockNotification: NotificationMessage = {
        id: "mock-1",
        title: "Hoş Geldiniz",
        message: "SignalR Mock Service aktif",
        type: "Info",
        priority: "Normal",
        createdAt: new Date(),
        icon: "info"
      };
      callback(mockNotification);
    }, 2000);
  }

  onConnected(callback: (data: any) => void): void {
    this.connectedCallbacks.push(callback);
  }

  onValidationError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  // Cleanup
  async stopValidationConnection(): Promise<void> {
    this.emailCallbacks = [];
    this.passwordCallbacks = [];
    this.domainCallbacks = [];
    this.phoneCallbacks = [];
    this.companyCallbacks = [];
    this.identityCallbacks = [];
    this.connectedCallbacks = [];
    this.errorCallbacks = [];
  }

  async stopNotificationConnection(): Promise<void> {
    this.notificationCallbacks = [];
  }

  async stopAllConnections(): Promise<void> {
    await this.stopValidationConnection();
    await this.stopNotificationConnection();
  }
}

// Export singleton instance
const mockSignalRService = new MockSignalRService();
export default mockSignalRService;