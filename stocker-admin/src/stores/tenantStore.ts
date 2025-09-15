import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { tenantService, TenantListDto, TenantDto, GetTenantsListQuery, CreateTenantCommand, UpdateTenantCommand } from '../services/api/tenantService';
import { errorService } from '../services/errorService';
import Swal from 'sweetalert2';

interface TenantState {
  // Data
  tenants: TenantListDto[];
  currentTenant: TenantDto | null;
  statistics: any | null;
  
  // UI State
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Pagination
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  
  // Filters
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive' | 'suspended';
  
  // Actions
  fetchTenants: (query?: GetTenantsListQuery) => Promise<void>;
  fetchTenantById: (id: string) => Promise<void>;
  createTenant: (command: CreateTenantCommand) => Promise<boolean>;
  updateTenant: (id: string, command: UpdateTenantCommand) => Promise<boolean>;
  toggleTenantStatus: (id: string) => Promise<boolean>;
  deleteTenant: (id: string, reason?: string, hardDelete?: boolean) => Promise<boolean>;
  suspendTenant: (id: string, reason: string, until?: string) => Promise<boolean>;
  activateTenant: (id: string) => Promise<boolean>;
  
  // UI Actions
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: 'all' | 'active' | 'inactive' | 'suspended') => void;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  clearCurrentTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tenants: [],
      currentTenant: null,
      statistics: null,
      loading: false,
      creating: false,
      updating: false,
      deleting: false,
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      statusFilter: 'all',

      // Fetch all tenants
      fetchTenants: async (customQuery?: GetTenantsListQuery) => {
        set({ loading: true });
        
        try {
          const query = customQuery || {
            searchTerm: get().searchTerm,
            status: get().statusFilter,
            pageNumber: get().pageNumber,
            pageSize: get().pageSize,
            sortBy: 'createdDate',
            sortOrder: 'desc' as const,
          };
          
          const tenants = await tenantService.getAll(query);
          
          set({ 
            tenants,
            totalCount: tenants.length, // Backend should return pagination info
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          errorService.handleError(error);
        }
      },

      // Fetch single tenant
      fetchTenantById: async (id: string) => {
        set({ loading: true });
        
        try {
          const tenant = await tenantService.getById(id);
          set({ currentTenant: tenant, loading: false });
        } catch (error) {
          set({ loading: false });
          errorService.handleError(error);
        }
      },

      // Create tenant
      createTenant: async (command: CreateTenantCommand) => {
        set({ creating: true });
        
        try {
          const tenant = await tenantService.create(command);
          
          // Update local state
          set((state) => ({
            tenants: [mapTenantToListDto(tenant), ...state.tenants],
            creating: false,
          }));
          
          // Show success message
          await Swal.fire({
            icon: 'success',
            title: 'Tenant Oluşturuldu',
            text: `${command.name} başarıyla oluşturuldu.`,
            timer: 2000,
            showConfirmButton: false,
          });
          
          return true;
        } catch (error) {
          set({ creating: false });
          errorService.handleError(error);
          return false;
        }
      },

      // Update tenant
      updateTenant: async (id: string, command: UpdateTenantCommand) => {
        set({ updating: true });
        
        try {
          await tenantService.update(id, command);
          
          // Update local state
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === id ? { ...t, ...command } : t
            ),
            currentTenant: state.currentTenant?.id === id 
              ? { ...state.currentTenant, ...command }
              : state.currentTenant,
            updating: false,
          }));
          
          // Show success message
          await Swal.fire({
            icon: 'success',
            title: 'Güncelleme Başarılı',
            text: 'Tenant bilgileri güncellendi.',
            timer: 2000,
            showConfirmButton: false,
          });
          
          return true;
        } catch (error) {
          set({ updating: false });
          errorService.handleError(error);
          return false;
        }
      },

      // Toggle tenant status
      toggleTenantStatus: async (id: string) => {
        set({ updating: true });
        
        try {
          await tenantService.toggleStatus(id);
          
          // Update local state
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === id ? { ...t, isActive: !t.isActive } : t
            ),
            currentTenant: state.currentTenant?.id === id
              ? { ...state.currentTenant, isActive: !state.currentTenant.isActive }
              : state.currentTenant,
            updating: false,
          }));
          
          const tenant = get().tenants.find(t => t.id === id);
          const newStatus = tenant?.isActive ? 'aktif' : 'pasif';
          
          await Swal.fire({
            icon: 'success',
            title: 'Durum Güncellendi',
            text: `Tenant durumu ${newStatus} olarak değiştirildi.`,
            timer: 2000,
            showConfirmButton: false,
          });
          
          return true;
        } catch (error) {
          set({ updating: false });
          errorService.handleError(error);
          return false;
        }
      },

      // Delete tenant
      deleteTenant: async (id: string, reason?: string, hardDelete: boolean = false) => {
        set({ deleting: true });
        
        // Confirm deletion
        const result = await Swal.fire({
          title: hardDelete ? 'Kalıcı Silme!' : 'Tenant Silinecek',
          text: hardDelete 
            ? 'Bu işlem geri alınamaz! Tüm veriler kalıcı olarak silinecektir.' 
            : 'Tenant pasif duruma alınacak. Emin misiniz?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Evet, Sil',
          cancelButtonText: 'İptal',
        });
        
        if (!result.isConfirmed) {
          set({ deleting: false });
          return false;
        }
        
        try {
          await tenantService.delete(id, reason, hardDelete);
          
          // Update local state
          if (hardDelete) {
            set((state) => ({
              tenants: state.tenants.filter((t) => t.id !== id),
              currentTenant: state.currentTenant?.id === id ? null : state.currentTenant,
              deleting: false,
            }));
          } else {
            set((state) => ({
              tenants: state.tenants.map((t) =>
                t.id === id ? { ...t, isActive: false } : t
              ),
              deleting: false,
            }));
          }
          
          await Swal.fire({
            icon: 'success',
            title: 'Silme Başarılı',
            text: hardDelete ? 'Tenant kalıcı olarak silindi.' : 'Tenant pasif duruma alındı.',
            timer: 2000,
            showConfirmButton: false,
          });
          
          return true;
        } catch (error) {
          set({ deleting: false });
          errorService.handleError(error);
          return false;
        }
      },

      // Suspend tenant
      suspendTenant: async (id: string, reason: string, until?: string) => {
        set({ updating: true });
        
        try {
          await tenantService.suspend(id, { reason, suspendedUntil: until });
          
          // Update local state
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === id ? { ...t, isActive: false } : t
            ),
            updating: false,
          }));
          
          await Swal.fire({
            icon: 'warning',
            title: 'Tenant Askıya Alındı',
            text: `Sebep: ${reason}`,
            timer: 3000,
            showConfirmButton: false,
          });
          
          return true;
        } catch (error) {
          set({ updating: false });
          errorService.handleError(error);
          return false;
        }
      },

      // Activate tenant
      activateTenant: async (id: string) => {
        set({ updating: true });
        
        try {
          await tenantService.activate(id);
          
          // Update local state
          set((state) => ({
            tenants: state.tenants.map((t) =>
              t.id === id ? { ...t, isActive: true } : t
            ),
            updating: false,
          }));
          
          await Swal.fire({
            icon: 'success',
            title: 'Tenant Aktif Edildi',
            timer: 2000,
            showConfirmButton: false,
          });
          
          return true;
        } catch (error) {
          set({ updating: false });
          errorService.handleError(error);
          return false;
        }
      },

      // UI Actions
      setSearchTerm: (term: string) => {
        set({ searchTerm: term, pageNumber: 1 });
        get().fetchTenants();
      },

      setStatusFilter: (status: 'all' | 'active' | 'inactive' | 'suspended') => {
        set({ statusFilter: status, pageNumber: 1 });
        get().fetchTenants();
      },

      setPageNumber: (page: number) => {
        set({ pageNumber: page });
        get().fetchTenants();
      },

      setPageSize: (size: number) => {
        set({ pageSize: size, pageNumber: 1 });
        get().fetchTenants();
      },

      clearCurrentTenant: () => {
        set({ currentTenant: null });
      },
    }),
    {
      name: 'tenant-store',
    }
  )
);

// Helper function to map TenantDto to TenantListDto
function mapTenantToListDto(tenant: TenantDto): TenantListDto {
  return {
    id: tenant.id,
    name: tenant.name,
    code: tenant.code,
    domain: tenant.domain,
    isActive: tenant.isActive,
    contactEmail: '', // Would need to be fetched separately
    packageName: tenant.subscription?.packageName || '',
    createdDate: tenant.createdAt,
    subscriptionEndDate: tenant.subscription?.endDate,
    userCount: 0, // Would need to be fetched separately
  };
}