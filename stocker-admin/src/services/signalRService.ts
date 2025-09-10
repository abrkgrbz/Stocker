import * as signalR from '@microsoft/signalr';

class SignalRService {
  private validationConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;
  private isConnecting = false;

  // Get API URL from environment
  private getApiUrl(): string {
    return import.meta.env.VITE_API_URL || 'https://api.stoocker.app';
  }

  // Initialize validation hub connection
  async initializeValidationHub(): Promise<void> {
    if (this.validationConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) {
      // Wait for ongoing connection
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isConnecting = true;

    try {
      const apiUrl = this.getApiUrl();
      
      this.validationConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiUrl}/hubs/validation`, {
          withCredentials: true,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.validationConnection.on('Connected', (data) => {
        console.log('Validation hub connected:', data);
      });

      this.validationConnection.on('ValidationError', (error) => {
        console.error('Validation error:', error);
      });

      this.validationConnection.onreconnecting(() => {
        console.log('Validation hub reconnecting...');
      });

      this.validationConnection.onreconnected(() => {
        console.log('Validation hub reconnected');
      });

      this.validationConnection.onclose(() => {
        console.log('Validation hub connection closed');
      });

      // Start the connection
      await this.validationConnection.start();
      console.log('Validation hub connection established');
    } catch (error) {
      console.error('Error connecting to validation hub:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Validate tenant code
  async validateTenantCode(code: string): Promise<{ isAvailable: boolean; message: string; suggestedCodes?: string[] }> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.initializeValidationHub();
    }

    return new Promise((resolve, reject) => {
      if (!this.validationConnection) {
        reject(new Error('Validation hub not connected'));
        return;
      }

      // Set up one-time listener for the response
      const handler = (result: any) => {
        this.validationConnection?.off('TenantCodeValidated', handler);
        resolve({
          isAvailable: result.isAvailable,
          message: result.message,
          suggestedCodes: result.suggestedCodes,
        });
      };

      const errorHandler = (error: string) => {
        this.validationConnection?.off('ValidationError', errorHandler);
        this.validationConnection?.off('TenantCodeValidated', handler);
        reject(new Error(error));
      };

      this.validationConnection.on('TenantCodeValidated', handler);
      this.validationConnection.once('ValidationError', errorHandler);

      // Send validation request
      this.validationConnection.invoke('ValidateTenantCode', code)
        .catch((error) => {
          this.validationConnection?.off('TenantCodeValidated', handler);
          this.validationConnection?.off('ValidationError', errorHandler);
          reject(error);
        });

      // Timeout after 5 seconds
      setTimeout(() => {
        this.validationConnection?.off('TenantCodeValidated', handler);
        this.validationConnection?.off('ValidationError', errorHandler);
        reject(new Error('Validation timeout'));
      }, 5000);
    });
  }

  // Validate email
  async validateEmail(email: string): Promise<{ isValid: boolean; message: string; suggestedEmail?: string }> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.initializeValidationHub();
    }

    return new Promise((resolve, reject) => {
      if (!this.validationConnection) {
        reject(new Error('Validation hub not connected'));
        return;
      }

      const handler = (result: any) => {
        this.validationConnection?.off('EmailValidated', handler);
        resolve({
          isValid: result.isValid,
          message: result.message,
          suggestedEmail: result.details?.suggestedEmail,
        });
      };

      this.validationConnection.on('EmailValidated', handler);
      
      this.validationConnection.invoke('ValidateEmail', email)
        .catch((error) => {
          this.validationConnection?.off('EmailValidated', handler);
          reject(error);
        });

      setTimeout(() => {
        this.validationConnection?.off('EmailValidated', handler);
        reject(new Error('Validation timeout'));
      }, 5000);
    });
  }

  // Check company name
  async checkCompanyName(companyName: string): Promise<{ isValid: boolean; message: string; similarNames?: string[] }> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.initializeValidationHub();
    }

    return new Promise((resolve, reject) => {
      if (!this.validationConnection) {
        reject(new Error('Validation hub not connected'));
        return;
      }

      const handler = (result: any) => {
        this.validationConnection?.off('CompanyNameChecked', handler);
        resolve({
          isValid: result.isValid,
          message: result.message,
          similarNames: result.details?.similarNames?.split(', ') || [],
        });
      };

      this.validationConnection.on('CompanyNameChecked', handler);
      
      this.validationConnection.invoke('CheckCompanyName', companyName)
        .catch((error) => {
          this.validationConnection?.off('CompanyNameChecked', handler);
          reject(error);
        });

      setTimeout(() => {
        this.validationConnection?.off('CompanyNameChecked', handler);
        reject(new Error('Validation timeout'));
      }, 5000);
    });
  }

  // Check password strength
  async checkPasswordStrength(password: string): Promise<{ score: number; level: string; color: string; suggestions: string[] }> {
    if (!this.validationConnection || this.validationConnection.state !== signalR.HubConnectionState.Connected) {
      await this.initializeValidationHub();
    }

    return new Promise((resolve, reject) => {
      if (!this.validationConnection) {
        reject(new Error('Validation hub not connected'));
        return;
      }

      const handler = (result: any) => {
        this.validationConnection?.off('PasswordStrengthChecked', handler);
        resolve(result);
      };

      this.validationConnection.on('PasswordStrengthChecked', handler);
      
      this.validationConnection.invoke('CheckPasswordStrength', password)
        .catch((error) => {
          this.validationConnection?.off('PasswordStrengthChecked', handler);
          reject(error);
        });

      setTimeout(() => {
        this.validationConnection?.off('PasswordStrengthChecked', handler);
        reject(new Error('Validation timeout'));
      }, 5000);
    });
  }

  // Disconnect from hubs
  async disconnect(): Promise<void> {
    if (this.validationConnection) {
      await this.validationConnection.stop();
      this.validationConnection = null;
    }
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
      this.notificationConnection = null;
    }
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
export default signalRService;