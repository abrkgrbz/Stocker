/**
 * Audit Logging System
 * Tracks all critical user actions for security and compliance
 */

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  TWO_FACTOR_ENABLED = '2FA_ENABLED',
  TWO_FACTOR_DISABLED = '2FA_DISABLED',
  
  // Data operations
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_VIEW = 'DATA_VIEW',
  DATA_EXPORT = 'DATA_EXPORT',
  
  // Admin operations
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  API_ERROR = 'API_ERROR',
  
  // System events
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  BACKUP_CREATED = 'BACKUP_CREATED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  duration?: number;
}

/**
 * Audit Logger Class
 */
export class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs: number = 1000;
  private storageKey: string = 'audit_logs';
  
  constructor() {
    this.loadLogs();
  }
  
  /**
   * Log an audit event
   */
  log(params: {
    eventType: AuditEventType;
    severity?: AuditSeverity;
    userId?: string;
    userEmail?: string;
    resource?: string;
    action?: string;
    details?: Record<string, any>;
    success?: boolean;
    errorMessage?: string;
    duration?: number;
  }): void {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      eventType: params.eventType,
      severity: params.severity || AuditSeverity.INFO,
      userId: params.userId,
      userEmail: params.userEmail,
      ipAddress: this.getClientIp(),
      userAgent: navigator.userAgent,
      resource: params.resource,
      action: params.action,
      details: params.details,
      success: params.success !== false,
      errorMessage: params.errorMessage,
      duration: params.duration,
    };
    
    // Add to logs
    this.logs.unshift(auditLog);
    
    // Trim logs if exceeded max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Persist logs
    this.saveLogs();
    
    // Send to server in production
    if (import.meta.env.PROD) {
      this.sendToServer(auditLog);
    }
    
    // Console log in development
    if (import.meta.env.DEV) {
      this.consoleLog(auditLog);
    }
  }
  
  /**
   * Log login attempt
   */
  logLogin(email: string, success: boolean, errorMessage?: string): void {
    this.log({
      eventType: success ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILED,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      userEmail: email,
      success,
      errorMessage,
      details: {
        timestamp: new Date().toISOString(),
        browser: this.getBrowserInfo(),
      }
    });
  }
  
  /**
   * Log data operation
   */
  logDataOperation(
    operation: 'create' | 'update' | 'delete' | 'view' | 'export',
    resource: string,
    details?: Record<string, any>
  ): void {
    const eventTypeMap = {
      create: AuditEventType.DATA_CREATE,
      update: AuditEventType.DATA_UPDATE,
      delete: AuditEventType.DATA_DELETE,
      view: AuditEventType.DATA_VIEW,
      export: AuditEventType.DATA_EXPORT,
    };
    
    this.log({
      eventType: eventTypeMap[operation],
      severity: AuditSeverity.INFO,
      resource,
      action: operation,
      details,
      success: true,
    });
  }
  
  /**
   * Log security event
   */
  logSecurityEvent(
    type: 'rate_limit' | 'suspicious' | 'unauthorized',
    details?: Record<string, any>
  ): void {
    const eventTypeMap = {
      rate_limit: AuditEventType.RATE_LIMIT_EXCEEDED,
      suspicious: AuditEventType.SUSPICIOUS_ACTIVITY,
      unauthorized: AuditEventType.UNAUTHORIZED_ACCESS,
    };
    
    this.log({
      eventType: eventTypeMap[type],
      severity: AuditSeverity.WARNING,
      details,
      success: false,
    });
  }
  
  /**
   * Get audit logs
   */
  getLogs(filters?: {
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let filteredLogs = [...this.logs];
    
    if (filters) {
      if (filters.eventType) {
        filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType);
      }
      
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate);
      }
      
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate);
      }
      
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }
    
    return filteredLogs;
  }
  
  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }
  
  /**
   * Export logs
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }
    
    // CSV export
    const headers = [
      'ID',
      'Timestamp',
      'Event Type',
      'Severity',
      'User Email',
      'IP Address',
      'Resource',
      'Action',
      'Success',
      'Error Message'
    ].join(',');
    
    const rows = this.logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.eventType,
      log.severity,
      log.userEmail || '',
      log.ipAddress || '',
      log.resource || '',
      log.action || '',
      log.success,
      log.errorMessage || ''
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get client IP (mock for client-side)
   */
  private getClientIp(): string {
    // In real implementation, this would come from server
    return 'client-ip';
  }
  
  /**
   * Get browser info
   */
  private getBrowserInfo(): Record<string, string> {
    const ua = navigator.userAgent;
    const browser: Record<string, string> = {
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
    };
    
    // Parse browser name and version
    if (ua.includes('Chrome')) {
      browser.name = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser.name = 'Firefox';
    } else if (ua.includes('Safari')) {
      browser.name = 'Safari';
    } else if (ua.includes('Edge')) {
      browser.name = 'Edge';
    }
    
    return browser;
  }
  
  /**
   * Load logs from storage
   */
  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  }
  
  /**
   * Save logs to storage
   */
  private saveLogs(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }
  
  /**
   * Send log to server
   */
  private async sendToServer(log: AuditLog): Promise<void> {
    try {
      // In production, send to audit endpoint
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.error('Failed to send audit log to server:', error);
    }
  }
  
  /**
   * Console log for development
   */
  private consoleLog(log: AuditLog): void {
    const style = {
      info: 'color: #4CAF50',
      warning: 'color: #FF9800',
      error: 'color: #F44336',
      critical: 'color: #D32F2F; font-weight: bold',
    };
    
    console.log(
      `%c[AUDIT] ${log.eventType}`,
      style[log.severity],
      {
        timestamp: log.timestamp.toISOString(),
        userId: log.userId,
        userEmail: log.userEmail,
        resource: log.resource,
        action: log.action,
        success: log.success,
        details: log.details,
      }
    );
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();