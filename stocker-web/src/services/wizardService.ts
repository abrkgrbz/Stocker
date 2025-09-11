import api from '@/services/api';
import { AxiosResponse } from 'axios';

interface WizardData {
  id: string;
  tenantId: string;
  wizardType: string;
  status: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  progressPercentage: number;
  currentStepName?: string;
  currentStepDescription?: string;
  savedConfiguration?: any;
  completedStepsData?: number[];
  skippedStepsData?: number[];
  startedAt: string;
  completedAt?: string;
  lastActivityAt?: string;
}

interface CreateWizardRequest {
  wizardType: string;
  totalSteps: number;
}

interface UpdateStepRequest {
  stepNumber: number;
  stepData: any;
  completed: boolean;
}

interface SaveProgressRequest {
  currentStep: number;
  savedConfiguration: any;
  completedStepsData: number[];
  skippedStepsData: number[];
}

interface SkipStepRequest {
  stepNumber: number;
  reason: string;
}

interface ChecklistData {
  id: string;
  tenantId: string;
  status: string;
  companyInfoCompleted: boolean;
  logoUploaded: boolean;
  adminUserCreated: boolean;
  departmentsCreated: boolean;
  modulesSelected: boolean;
  modulesConfigured: boolean;
  securitySettingsConfigured: boolean;
  emailIntegrationConfigured: boolean;
  overallProgress: number;
  requiredProgress: number;
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  requiredCompletedItems: number;
}

class WizardService {
  private baseUrl = '/api/public/tenant-registration';

  // Get current tenant ID from auth store
  private getTenantId(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.tenantId || user.tenant?.id || '';
  }

  // Wizard Methods
  async getActiveWizard(): Promise<WizardData | null> {
    try {
      const tenantId = this.getTenantId();
      const response: AxiosResponse<any> = await api.get(`${this.baseUrl}/wizard/${tenantId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createWizard(data: CreateWizardRequest): Promise<WizardData> {
    // Backend'de wizard otomatik oluşturulur, tenant registration ile birlikte
    // Bu yüzden getActiveWizard kullanıyoruz
    const wizard = await this.getActiveWizard();
    if (wizard) {
      return wizard;
    }
    // Eğer yoksa boş bir wizard döndür (frontend için)
    return {
      id: 'temp-' + Date.now(),
      tenantId: this.getTenantId(),
      wizardType: data.wizardType,
      status: 'NotStarted',
      totalSteps: data.totalSteps,
      completedSteps: 0,
      currentStep: 1,
      progressPercentage: 0,
      startedAt: new Date().toISOString()
    };
  }

  async updateStep(wizardId: string, data: UpdateStepRequest): Promise<void> {
    await api.put(`${this.baseUrl}/wizard/${wizardId}/step`, data);
  }

  async saveProgress(wizardId: string, data: SaveProgressRequest): Promise<void> {
    await api.put(`${this.baseUrl}/${wizardId}/save`, data);
  }

  async skipStep(wizardId: string, data: SkipStepRequest): Promise<void> {
    await api.post(`${this.baseUrl}/${wizardId}/skip`, data);
  }

  async completeWizard(wizardId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${wizardId}/complete`);
  }

  async pauseWizard(wizardId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${wizardId}/pause`);
  }

  async resumeWizard(wizardId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${wizardId}/resume`);
  }

  async cancelWizard(wizardId: string, reason: string): Promise<void> {
    await api.post(`${this.baseUrl}/${wizardId}/cancel`, { reason });
  }

  async requestHelp(wizardId: string, notes: string): Promise<void> {
    await api.post(`${this.baseUrl}/${wizardId}/help`, { notes });
  }

  // Checklist Methods
  async getChecklist(): Promise<ChecklistData | null> {
    try {
      const response: AxiosResponse<ChecklistData> = await api.get(`${this.checklistUrl}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateChecklistItem(item: string, data: any): Promise<void> {
    await api.put(`${this.checklistUrl}/${item}`, data);
  }

  async completeCompanyInfo(data: any): Promise<void> {
    await api.post(`${this.checklistUrl}/company-info`, data);
  }

  async uploadLogo(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('logo', file);
    await api.post(`${this.checklistUrl}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async selectModules(modules: string[]): Promise<void> {
    await api.post(`${this.checklistUrl}/modules`, { modules });
  }

  async configureSecuritySettings(settings: any): Promise<void> {
    await api.post(`${this.checklistUrl}/security`, settings);
  }

  async configureIntegrations(integrations: any): Promise<void> {
    await api.post(`${this.checklistUrl}/integrations`, integrations);
  }

  async importData(type: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    await api.post(`${this.checklistUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async getImportTemplate(type: string): Promise<Blob> {
    const response = await api.get(`${this.checklistUrl}/import-template/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadImportTemplate(type: string): Promise<void> {
    const blob = await this.getImportTemplate(type);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async validateSetup(): Promise<{ isValid: boolean; errors: string[] }> {
    const response = await api.get(`${this.checklistUrl}/validate`);
    return response.data;
  }

  async approveGoLive(): Promise<void> {
    await api.post(`${this.checklistUrl}/go-live`);
  }
}

export default new WizardService();