import * as signalR from "@microsoft/signalr";

class SignalRService {
  private validationConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;
  private baseUrl: string = window.location.hostname === "localhost" ? "http://localhost:5104" : "http://127.0.0.1:5104";

  // Validation Hub Methods
  async startValidationConnection(): Promise<void> {
    if (this.validationConnection?.state === signalR.HubConnectionState.Connected) {
      console.log("Validation hub already connected");
      return;
    }

    this.validationConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/validation`, {
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    this.validationConnection.onreconnecting(() => {
      console.log("Validation hub reconnecting...");
    });

    this.validationConnection.onreconnected(() => {
      console.log("Validation hub reconnected");
    });

    this.validationConnection.onclose(() => {
      console.log("Validation hub connection closed");
    });

    try {
      await this.validationConnection.start();
      console.log("Validation hub connected successfully");
    } catch (err) {
      console.error("Error connecting to validation hub:", err);
      throw err;
    }
  }

  // Notification Hub Methods
  async startNotificationConnection(token?: string): Promise<void> {
    if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
      console.log("Notification hub already connected");
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
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    this.notificationConnection.onreconnecting(() => {
      console.log("Notification hub reconnecting...");
    });

    this.notificationConnection.onreconnected(() => {
      console.log("Notification hub reconnected");
    });

    this.notificationConnection.onclose(() => {
      console.log("Notification hub connection closed");
    });

    try {
      await this.notificationConnection.start();
      console.log("Notification hub connected successfully");
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