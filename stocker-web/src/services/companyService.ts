import api from './api';

export interface CompanyData {
  name: string;
  code: string;
  taxNumber: string;
  taxOffice?: string;
  tradeRegisterNumber?: string;
  email: string;
  phone: string;
  fax?: string;
  website?: string;
  sector?: string;
  employeeCount?: number;
  foundedYear?: number;
  currency: string;
  timezone: string;
  country: string;
  city: string;
  district: string;
  postalCode?: string;
  addressLine: string;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  legalName?: string;
  identityType?: string;
  identityNumber?: string;
  taxNumber?: string;
  taxOffice?: string;
  tradeRegisterNumber?: string;
  email: string;
  phone: string;
  fax?: string;
  address: {
    country: string;
    city: string;
    district: string;
    postalCode?: string;
    addressLine: string;
  };
  website?: string;
  logoUrl?: string;
  sector?: string;
  employeeCount?: number;
  foundedDate: string;
  currency: string;
  timezone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

class CompanyService {
  async createCompany(data: CompanyData): Promise<Company> {
    const response = await api.post<Company>('/api/companies', {
      ...data,
      address: {
        country: data.country,
        city: data.city,
        district: data.district,
        postalCode: data.postalCode,
        addressLine: data.addressLine
      },
      foundedDate: data.foundedYear ? new Date(data.foundedYear, 0, 1).toISOString() : new Date().toISOString()
    });
    return response.data;
  }

  async getCompany(): Promise<Company | null> {
    try {
      const response = await api.get<Company>('/api/companies/current');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async updateCompany(id: string, data: Partial<CompanyData>): Promise<Company> {
    const response = await api.put<Company>(`/api/companies/${id}`, data);
    return response.data;
  }

  async checkCompanyExists(): Promise<boolean> {
    try {
      const company = await this.getCompany();
      return !!company;
    } catch {
      return false;
    }
  }

  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post<{ logoUrl: string }>('/api/companies/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
}

export default new CompanyService();