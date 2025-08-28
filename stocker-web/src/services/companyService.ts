import api from './api';

export interface CompanyData {
  name: string;
  code: string;
  legalName?: string;
  identityType?: string;
  identityNumber?: string;
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
  foundedDate?: string;
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
    const response = await api.post<Company>('/api/tenant/companies', {
      name: data.name,
      code: data.code,
      legalName: data.legalName || data.name,
      identityType: data.identityType || 'TaxNumber',
      identityNumber: data.identityNumber || data.taxNumber,
      taxNumber: data.taxNumber,
      taxOffice: data.taxOffice,
      tradeRegisterNumber: data.tradeRegisterNumber,
      email: data.email,
      phone: data.phone,
      fax: data.fax || '',
      website: data.website,
      sector: data.sector,
      employeeCount: data.employeeCount,
      foundedYear: data.foundedYear,
      foundedDate: data.foundedDate || (data.foundedYear ? `${data.foundedYear}-01-01` : new Date().toISOString().split('T')[0]),
      currency: data.currency,
      timezone: data.timezone,
      address: {
        country: data.country,
        city: data.city,
        district: data.district,
        postalCode: data.postalCode || '',
        addressLine: data.addressLine
      }
    }, {
      timeout: 120000 // 2 minutes for company creation
    });
    return response.data;
  }

  async getCompany(): Promise<Company | null> {
    try {
      const response = await api.get<Company>('/api/tenant/companies/current');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async updateCompany(id: string, data: Partial<CompanyData>): Promise<Company> {
    const updateData: any = {};
    
    // Map fields that exist in data
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.legalName !== undefined) updateData.legalName = data.legalName;
    if (data.identityType !== undefined) updateData.identityType = data.identityType;
    if (data.identityNumber !== undefined) updateData.identityNumber = data.identityNumber;
    if (data.taxNumber !== undefined) updateData.taxNumber = data.taxNumber;
    if (data.taxOffice !== undefined) updateData.taxOffice = data.taxOffice;
    if (data.tradeRegisterNumber !== undefined) updateData.tradeRegisterNumber = data.tradeRegisterNumber;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.fax !== undefined) updateData.fax = data.fax;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.employeeCount !== undefined) updateData.employeeCount = data.employeeCount;
    if (data.foundedYear !== undefined) {
      updateData.foundedYear = data.foundedYear;
      updateData.foundedDate = `${data.foundedYear}-01-01`;
    }
    if (data.foundedDate !== undefined) updateData.foundedDate = data.foundedDate;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    
    // Map address fields if any exist
    if (data.country !== undefined || data.city !== undefined || data.district !== undefined || 
        data.postalCode !== undefined || data.addressLine !== undefined) {
      updateData.address = {};
      if (data.country !== undefined) updateData.address.country = data.country;
      if (data.city !== undefined) updateData.address.city = data.city;
      if (data.district !== undefined) updateData.address.district = data.district;
      if (data.postalCode !== undefined) updateData.address.postalCode = data.postalCode || '';
      if (data.addressLine !== undefined) updateData.address.addressLine = data.addressLine;
    }
    
    const response = await api.put<Company>(`/api/tenant/companies/${id}`, updateData);
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
    
    const response = await api.post<{ logoUrl: string }>('/api/tenant/companies/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
}

export default new CompanyService();