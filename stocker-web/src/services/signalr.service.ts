import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from '@/config/constants';

class SignalRService {
  private validationConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;
  private baseUrl: string = API_BASE_URL;

  // Validation Hub Methods
  async startValidationConnection(): Promise<void> {
    if (this.validationConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.validationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/validation`, {
        // Try WebSockets first, then SSE, then LongPolling
        transport: signalR.HttpTransportType.WebSockets | 
                  signalR.HttpTransportType.ServerSentEvents | 
                  signalR.HttpTransportType.LongPolling,
        withCredentials: false
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    this.validationConnection.onreconnecting((error) => {
      console.warn('ValidationHub reconnecting:', error);
    });

    this.validationConnection.onreconnected((connectionId) => {
      console.log('ValidationHub reconnected:', connectionId);
    });

    this.validationConnection.onclose((error) => {
      console.error('ValidationHub connection closed:', error);
    });

    try {
      await this.validationConnection.start();
    } catch (err) {
      console.error("Error connecting to validation hub:", err);
      throw err;
    }
  }

  // Notification Hub Methods
  async startNotificationConnection(token?: string): Promise<void> {
    if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const options: signalR.IHttpConnectionOptions = {
      withCredentials: true,
    };

    if (token) {
      options.accessTokenFactory = () => token;
    }

    this.notificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/notification`, {
        ...options,
        // Try WebSockets first, then SSE, then LongPolling
        transport: signalR.HttpTransportType.WebSockets | 
                  signalR.HttpTransportType.ServerSentEvents | 
                  signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    this.notificationConnection.onreconnecting(() => {
    });

    this.notificationConnection.onreconnected(() => {
    });

    this.notificationConnection.onclose(() => {
    });

    try {
      await this.notificationConnection.start();
    } catch (err) {
      console.error("Error connecting to notification hub:", err);
      throw err;
    }
  }

  // Email Validation
  async validateEmail(email: string): Promise<void> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startValidationConnection();
    }
    return this.validationConnection!.invoke("ValidateEmail", email);
  }

  onEmailValidated(callback: (result: ValidationResult) => void): void {
    this.validationConnection?.on("EmailValidated", callback);
  }

  // Password Strength Check
  async checkPasswordStrength(password: string): Promise<void> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startValidationConnection();
    }
    return this.validationConnection!.invoke("CheckPasswordStrength", password);
  }

  onPasswordStrengthChecked(callback: (strength: PasswordStrength) => void): void {
    this.validationConnection?.on("PasswordStrengthChecked", callback);
  }

  // Domain Check
  async checkDomain(domain: string): Promise<void> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startValidationConnection();
    }
    return this.validationConnection!.invoke("CheckDomain", domain);
  }

  onDomainChecked(callback: (result: DomainCheckResult) => void): void {
    this.validationConnection?.on("DomainChecked", callback);
  }

  // Phone Validation
  async validatePhone(phoneNumber: string, countryCode: string = "TR"): Promise<void> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startValidationConnection();
    }
    return this.validationConnection!.invoke("ValidatePhone", phoneNumber, countryCode);
  }

  onPhoneValidated(callback: (result: ValidationResult) => void): void {
    this.validationConnection?.on("PhoneValidated", callback);
  }

  // Company Name Check
  async checkCompanyName(companyName: string): Promise<void> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.startValidationConnection();
    }
    return this.validationConnection!.invoke("CheckCompanyName", companyName);
  }

  onCompanyNameChecked(callback: (result: ValidationResult) => void): void {
    this.validationConnection?.on("CompanyNameChecked", callback);
  }

  // Identity Validation (TC Kimlik No / Vergi No)
  async validateIdentity(identityNumber: string): Promise<void> {
    console.log('SignalR validateIdentity called with:', identityNumber);
    
    try {
      if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('Connection not ready, starting validation connection...');
        await this.startValidationConnection();
      }
      
      console.log('Connection state:', this.validationConnection?.state);
      console.log('Invoking ValidateIdentity on hub...');
      
      const result = await this.validationConnection!.invoke("ValidateIdentity", identityNumber);
      console.log('ValidateIdentity invoke completed:', result);
      return result;
    } catch (error) {
      console.error('Error in validateIdentity:', error);
      throw error;
    }
  }

  onIdentityValidated(callback: (result: ValidationResult) => void): void {
    this.validationConnection?.on("IdentityValidated", callback);
  }

  // Notification Methods
  onNotificationReceived(callback: (notification: NotificationMessage) => void): void {
    this.notificationConnection?.on("ReceiveNotification", callback);
  }

  onConnected(callback: (data: any) => void): void {
    this.validationConnection?.on("Connected", callback);
    this.notificationConnection?.on("Connected", callback);
  }

  onValidationError(callback: (error: string) => void): void {
    this.validationConnection?.on("ValidationError", callback);
  }

  // Cleanup
  async stopValidationConnection(): Promise<void> {
    if (this.validationConnection) {
      await this.validationConnection.stop();
      this.validationConnection = null;
    }
  }

  async stopNotificationConnection(): Promise<void> {
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
      this.notificationConnection = null;
    }
  }

  async stopAllConnections(): Promise<void> {
    await this.stopValidationConnection();
    await this.stopNotificationConnection();
  }
}

// Types
export interface ValidationResult {
  isValid: boolean;
  message: string;
  isUnique?: boolean;
  isAvailable?: boolean;
  containsRestrictedWords?: boolean;
  similarNames?: string[];
  details?: Record<string, string>;
}

export interface PasswordStrength {
  score: number;
  level: string;
  color: string;
  suggestions: string[];
}

export interface DomainCheckResult {
  isAvailable: boolean;
  message: string;
  suggestions?: string[];
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: "Info" | "Success" | "Warning" | "Error" | "System" | "Payment" | "Order" | "Stock" | "User";
  priority: "Low" | "Normal" | "High" | "Urgent";
  data?: Record<string, any>;
  createdAt: Date;
  actionUrl?: string;
  icon?: string;
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;