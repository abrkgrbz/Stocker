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
      const restrictedWords = ['admin', 'system', 'test', 'root', 'superuser'];
      const lowerName = companyName.toLowerCase();
      
      // Check for restricted words
      const containsRestricted = restrictedWords.some(word => lowerName.includes(word));
      const isUnique = !takenNames.some(name => 
        name.toLowerCase() === lowerName
      );
      
      // Determine if valid based on restrictions and uniqueness
      const isValid = !containsRestricted && companyName.length >= 3;
      
      let message = '';
      const details: Record<string, string> = {};
      
      if (containsRestricted) {
        message = "Şirket adı kısıtlı kelimeler içeriyor";
        details.restriction = "Admin, System, Test gibi kelimeler kullanılamaz";
      } else if (!isUnique) {
        message = "Bu şirket adı zaten kayıtlı";
        details.suggestion = "Şirket adına bir numara veya ayırt edici kelime ekleyin";
      } else if (companyName.length < 3) {
        message = "Şirket adı en az 3 karakter olmalıdır";
      } else {
        message = "Şirket adı kullanılabilir";
      }
      
      const result: ValidationResult = {
        isValid,
        isUnique,
        containsRestrictedWords: containsRestricted,
        message,
        similarNames: !isUnique ? takenNames.filter(name => 
          name.toLowerCase().includes(lowerName.substring(0, 3))
        ) : [],
        details
      };
      
      this.companyCallbacks.forEach(cb => cb(result));
    }, 350);
  }

  onCompanyNameChecked(callback: (result: ValidationResult) => void): void {
    this.companyCallbacks.push(callback);
  }

  // Identity Validation (TC Kimlik No / Vergi No)
  validateIdentity = async (identityNumber: string): Promise<void> => {
        setTimeout(() => {
      // Remove spaces and non-numeric characters
      const cleaned = identityNumber.replace(/\D/g, '');
            let isValid = false;
      let numberType = '';
      let message = '';
      
      if (cleaned.length === 11) {
        // TC Kimlik No validation with proper algorithm
        numberType = 'TCKimlik';
        isValid = this.validateTCKimlikNo(cleaned);
        message = isValid 
          ? "TC Kimlik numarası geçerli" 
          : "Geçersiz TC Kimlik numarası";
      } else if (cleaned.length === 10) {
        // Vergi No validation with proper algorithm
        numberType = 'VergiNo';
        isValid = this.validateVergiNo(cleaned);
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

  private validateTCKimlikNo(tcKimlikNo: string): boolean {
    // TC Kimlik No validation algorithm
    // 1. Must be 11 digits
    // 2. First digit cannot be 0
    // 3. 10th digit = ((1st + 3rd + 5th + 7th + 9th) * 7 - (2nd + 4th + 6th + 8th)) % 10
    // 4. 11th digit = sum of first 10 digits % 10

    if (tcKimlikNo.length !== 11) return false;
    if (!/^\d{11}$/.test(tcKimlikNo)) return false;
    if (tcKimlikNo[0] === '0') return false;

    const digits = tcKimlikNo.split('').map(Number);

    // Calculate 10th digit
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    let tenthDigit = ((oddSum * 7) - evenSum) % 10;
    
    if (tenthDigit < 0) tenthDigit += 10;
    
    if (digits[9] !== tenthDigit) return false;

    // Calculate 11th digit
    const firstTenSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    const eleventhDigit = firstTenSum % 10;
    
    if (digits[10] !== eleventhDigit) return false;

    return true;
  }

  private validateVergiNo(vergiNo: string): boolean {
    // Vergi No validation algorithm
    // 1. Must be 10 digits
    // 2. Uses modulo 11 algorithm
    
    if (vergiNo.length !== 10) return false;
    if (!/^\d{10}$/.test(vergiNo)) return false;

    const digits = vergiNo.split('').map(Number);
    
    // Vergi No algorithm
    const v1 = (digits[0] + 9) % 10;
    let v2 = (v1 * 2) % 9;
    if (v1 !== 0 && v2 === 0) v2 = 9;
    const v3 = (digits[1] + 8) % 10;
    let v4 = (v3 * 4) % 9;
    if (v3 !== 0 && v4 === 0) v4 = 9;
    const v5 = (digits[2] + 7) % 10;
    let v6 = (v5 * 8) % 9;
    if (v5 !== 0 && v6 === 0) v6 = 9;
    const v7 = (digits[3] + 6) % 10;
    let v8 = (v7 * 16) % 9;
    if (v7 !== 0 && v8 === 0) v8 = 9;
    const v9 = (digits[4] + 5) % 10;
    let v10 = (v9 * 32) % 9;
    if (v9 !== 0 && v10 === 0) v10 = 9;
    const v11 = (digits[5] + 4) % 10;
    let v12 = (v11 * 64) % 9;
    if (v11 !== 0 && v12 === 0) v12 = 9;
    const v13 = (digits[6] + 3) % 10;
    let v14 = (v13 * 128) % 9;
    if (v13 !== 0 && v14 === 0) v14 = 9;
    const v15 = (digits[7] + 2) % 10;
    let v16 = (v15 * 256) % 9;
    if (v15 !== 0 && v16 === 0) v16 = 9;
    const v17 = (digits[8] + 1) % 10;
    let v18 = (v17 * 512) % 9;
    if (v17 !== 0 && v18 === 0) v18 = 9;

    const sum = v2 + v4 + v6 + v8 + v10 + v12 + v14 + v16 + v18;
    const lastDigit = (10 - (sum % 10)) % 10;

    return digits[9] === lastDigit;
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