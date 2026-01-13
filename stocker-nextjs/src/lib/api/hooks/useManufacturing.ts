/**
 * React Query Hooks for Manufacturing Module
 * Comprehensive hooks for all Manufacturing endpoints with optimistic updates and cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ManufacturingService } from '../services/manufacturing.service';
import { queryOptions } from '../query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  // BOM
  BillOfMaterialListDto,
  BillOfMaterialDto,
  CreateBillOfMaterialRequest,
  UpdateBillOfMaterialRequest,
  BomFilterParams,
  // Production Orders
  ProductionOrderListDto,
  ProductionOrderDto,
  CreateProductionOrderRequest,
  StartProductionOrderRequest,
  CompleteProductionOrderRequest,
  ProductionOrderFilterParams,
  ProductionOrderStatus,
  // Work Centers
  WorkCenterListDto,
  WorkCenterDto,
  CreateWorkCenterRequest,
  UpdateWorkCenterRequest,
  WorkCenterFilterParams,
  // Routings
  RoutingListDto,
  RoutingDto,
  CreateRoutingRequest,
  UpdateRoutingRequest,
  RoutingFilterParams,
  // MPS
  MasterProductionScheduleListDto,
  MasterProductionScheduleDto,
  CreateMasterProductionScheduleRequest,
  UpdateMasterProductionScheduleRequest,
  MpsLineListDto,
  AddMpsLineRequest,
  UpdateMpsLineRequest,
  RecordActualsRequest,
  AtpQueryResponse,
  MpsFilterParams,
  MpsLineFilterParams,
  // Material Reservations
  MaterialReservationListDto,
  MaterialReservationDto,
  CreateMaterialReservationRequest,
  UpdateMaterialReservationRequest,
  ApproveMaterialReservationRequest,
  AllocateMaterialRequest,
  IssueMaterialRequest,
  ReturnMaterialRequest,
  MaterialReservationSummaryDto,
  ProductReservationSummaryDto,
  ReservationStatus,
  // MRP Plans
  MrpPlanListDto,
  MrpPlanDto,
  CreateMrpPlanRequest,
  ExecuteMrpPlanRequest,
  PlannedOrderListDto,
  ConfirmPlannedOrderRequest,
  ReleasePlannedOrderRequest,
  ConvertPlannedOrderRequest,
  MrpExceptionDto,
  ResolveMrpExceptionRequest,
  MrpPlanFilterParams,
  PlannedOrderFilterParams,
  // Quality Inspections
  QualityInspectionListDto,
  QualityInspectionDto,
  CreateQualityInspectionRequest,
  StartInspectionRequest,
  RecordInspectionResultRequest,
  RecordNonConformanceRequest,
  SetDispositionRequest,
  QualityInspectionFilterParams,
  // Capacity Plans
  CapacityPlanListDto,
  CapacityPlanDto,
  CreateCapacityPlanRequest,
  ExecuteCapacityPlanRequest,
  CapacityRequirementDto,
  CapacityExceptionDto,
  ResolveCapacityExceptionRequest,
  WorkCenterCapacityOverviewDto,
  CapacityPlanFilterParams,
  CapacityRequirementFilterParams,
  // Cost Accounting
  ProductionCostRecordListDto,
  ProductionCostRecordDto,
  CreateProductionCostRecordRequest,
  SetProductionDirectCostsRequest,
  SetOverheadCostsRequest,
  SetVariancesRequest,
  AddCostAllocationRequest,
  AddJournalEntryRequest,
  CostSummaryDto,
  CostCenterListDto,
  CostCenterDto,
  CreateCostCenterRequest,
  UpdateCostCenterRequest,
  StandardCostCardListDto,
  StandardCostCardDto,
  CreateStandardCostCardRequest,
  CostRecordFilterParams,
  CostCenterFilterParams,
  StandardCostFilterParams,
  // Maintenance
  MaintenancePlanListDto,
  MaintenancePlanDto,
  CreateMaintenancePlanRequest,
  UpdateMaintenancePlanRequest,
  CreateMaintenanceTaskRequest,
  UpdateMaintenanceTaskRequest,
  MaintenanceRecordListDto,
  MaintenanceRecordDto,
  CreateMaintenanceRecordRequest,
  UpdateMaintenanceRecordRequest,
  StartMaintenanceRecordRequest,
  CompleteMaintenanceRecordRequest,
  AddMaintenanceRecordSparePartRequest,
  SparePartListDto,
  SparePartDto,
  CreateSparePartRequest,
  UpdateSparePartRequest,
  MachineCounterListDto,
  CreateMachineCounterRequest,
  UpdateMachineCounterValueRequest,
  ResetMachineCounterRequest,
  MaintenanceDashboardDto,
  MaintenanceSummaryDto,
  MaintenanceRecordFilterParams,
  // Quality Management (NCR & CAPA)
  NonConformanceReportListDto,
  NonConformanceReportDto,
  CreateNcrRequest,
  UpdateNcrRequest,
  StartNcrInvestigationRequest,
  SetNcrRootCauseRequest,
  SetNcrDispositionRequest,
  AddNcrContainmentActionRequest,
  CompleteNcrContainmentActionRequest,
  CloseNcrRequest,
  NcrStatisticsDto,
  NcrStatus,
  NcrSource,
  NcrSeverity,
  CorrectivePreventiveActionListDto,
  CorrectivePreventiveActionDto,
  CreateCapaRequest,
  UpdateCapaRequest,
  UpdateCapaProgressRequest,
  VerifyCapaRequest,
  EvaluateCapaEffectivenessRequest,
  CloseCapaRequest,
  AddCapaTaskRequest,
  CompleteCapaTaskRequest,
  CapaStatisticsDto,
  CapaStatus,
  CapaType,
  // Subcontract Orders
  SubcontractOrderListDto,
  SubcontractOrderDto,
  CreateSubcontractOrderRequest,
  AddSubcontractMaterialRequest,
  ShipMaterialRequest,
  ReceiveProductRequest,
  SubcontractOrderFilterParams,
  // KPI Dashboard
  KpiDefinitionListDto,
  KpiDefinitionDto,
  CreateKpiDefinitionRequest,
  UpdateKpiDefinitionRequest,
  KpiValueListDto,
  KpiValueDto,
  CreateKpiValueRequest,
  KpiTrendDataDto,
  CreateKpiTargetRequest,
  DashboardConfigurationListDto,
  DashboardConfigurationDto,
  CreateDashboardConfigurationRequest,
  UpdateDashboardConfigurationRequest,
  CreateDashboardWidgetRequest,
  OeeRecordListDto,
  OeeRecordDto,
  CreateOeeRecordRequest,
  DashboardOeeSummaryDto,
  ProductionPerformanceSummaryListDto,
  KpiValueFilterParams,
  OeeFilterParams,
  PerformanceSummaryFilterParams,
  MaintenanceRecordStatus,
  MaintenanceType,
} from '../services/manufacturing.types';

// =====================================
// QUERY KEYS
// =====================================

export const manufacturingKeys = {
  // Bill of Materials (BOM)
  boms: ['manufacturing', 'boms'] as const,
  bom: (id: string) => ['manufacturing', 'boms', id] as const,
  bomByProduct: (productId: string) => ['manufacturing', 'boms', 'product', productId] as const,

  // Production Orders
  productionOrders: ['manufacturing', 'production-orders'] as const,
  productionOrder: (id: string) => ['manufacturing', 'production-orders', id] as const,
  productionOrdersByStatus: (status: ProductionOrderStatus) => ['manufacturing', 'production-orders', 'status', status] as const,
  productionOrdersByProduct: (productId: string) => ['manufacturing', 'production-orders', 'product', productId] as const,

  // Work Centers
  workCenters: ['manufacturing', 'work-centers'] as const,
  workCenter: (id: string) => ['manufacturing', 'work-centers', id] as const,
  workCenterUtilization: (id: string, startDate: string, endDate: string) =>
    ['manufacturing', 'work-centers', id, 'utilization', startDate, endDate] as const,

  // Routings
  routings: ['manufacturing', 'routings'] as const,
  routing: (id: string) => ['manufacturing', 'routings', id] as const,
  routingByProduct: (productId: string) => ['manufacturing', 'routings', 'product', productId] as const,

  // Master Production Schedules (MPS)
  mpsSchedules: ['manufacturing', 'mps'] as const,
  mpsSchedule: (id: string) => ['manufacturing', 'mps', id] as const,
  mpsLines: (mpsId: string) => ['manufacturing', 'mps', mpsId, 'lines'] as const,
  mpsLine: (mpsId: string, lineId: string) => ['manufacturing', 'mps', mpsId, 'lines', lineId] as const,
  mpsAtp: (productId: string, date: string) => ['manufacturing', 'mps', 'atp', productId, date] as const,

  // Material Reservations
  reservations: ['manufacturing', 'reservations'] as const,
  reservation: (id: string) => ['manufacturing', 'reservations', id] as const,
  reservationSummary: (id: string) => ['manufacturing', 'reservations', id, 'summary'] as const,
  productReservations: (productId: string) => ['manufacturing', 'reservations', 'product', productId] as const,

  // MRP Plans
  mrpPlans: ['manufacturing', 'mrp-plans'] as const,
  mrpPlan: (id: string) => ['manufacturing', 'mrp-plans', id] as const,
  plannedOrders: (mrpPlanId: string) => ['manufacturing', 'mrp-plans', mrpPlanId, 'planned-orders'] as const,
  mrpExceptions: (mrpPlanId: string) => ['manufacturing', 'mrp-plans', mrpPlanId, 'exceptions'] as const,

  // Quality Inspections
  inspections: ['manufacturing', 'inspections'] as const,
  inspection: (id: string) => ['manufacturing', 'inspections', id] as const,

  // Capacity Plans
  capacityPlans: ['manufacturing', 'capacity-plans'] as const,
  capacityPlan: (id: string) => ['manufacturing', 'capacity-plans', id] as const,
  capacityRequirements: (planId: string) => ['manufacturing', 'capacity-plans', planId, 'requirements'] as const,
  capacityExceptions: (planId: string) => ['manufacturing', 'capacity-plans', planId, 'exceptions'] as const,
  workCenterCapacity: (workCenterId: string, startDate: string, endDate: string) =>
    ['manufacturing', 'capacity-plans', 'work-center', workCenterId, startDate, endDate] as const,

  // Cost Accounting
  costRecords: ['manufacturing', 'cost-records'] as const,
  costRecord: (id: string) => ['manufacturing', 'cost-records', id] as const,
  costSummary: (id: string) => ['manufacturing', 'cost-records', id, 'summary'] as const,
  costCenters: ['manufacturing', 'cost-centers'] as const,
  costCenter: (id: string) => ['manufacturing', 'cost-centers', id] as const,
  standardCosts: ['manufacturing', 'standard-costs'] as const,
  standardCost: (id: string) => ['manufacturing', 'standard-costs', id] as const,

  // Maintenance
  maintenancePlans: ['manufacturing', 'maintenance-plans'] as const,
  maintenancePlan: (id: string) => ['manufacturing', 'maintenance-plans', id] as const,
  maintenanceRecords: ['manufacturing', 'maintenance-records'] as const,
  maintenanceRecord: (id: string) => ['manufacturing', 'maintenance-records', id] as const,
  spareParts: ['manufacturing', 'spare-parts'] as const,
  sparePart: (id: string) => ['manufacturing', 'spare-parts', id] as const,
  machineCounters: ['manufacturing', 'machine-counters'] as const,
  machineCounter: (id: string) => ['manufacturing', 'machine-counters', id] as const,
  maintenanceDashboard: ['manufacturing', 'maintenance', 'dashboard'] as const,
  maintenanceSummary: (workCenterId: string) => ['manufacturing', 'maintenance', 'summary', workCenterId] as const,

  // NCR (Non-Conformance Reports)
  ncrs: ['manufacturing', 'ncrs'] as const,
  ncr: (id: string) => ['manufacturing', 'ncrs', id] as const,
  ncrStatistics: ['manufacturing', 'ncrs', 'statistics'] as const,

  // CAPA (Corrective and Preventive Actions)
  capas: ['manufacturing', 'capas'] as const,
  capa: (id: string) => ['manufacturing', 'capas', id] as const,
  capaStatistics: ['manufacturing', 'capas', 'statistics'] as const,

  // Subcontract Orders
  subcontractOrders: ['manufacturing', 'subcontract-orders'] as const,
  subcontractOrder: (id: string) => ['manufacturing', 'subcontract-orders', id] as const,

  // KPI Dashboard
  kpiDefinitions: ['manufacturing', 'kpi', 'definitions'] as const,
  kpiDefinition: (id: string) => ['manufacturing', 'kpi', 'definitions', id] as const,
  kpiValues: (kpiId: string) => ['manufacturing', 'kpi', 'values', kpiId] as const,
  kpiTrend: (kpiId: string, startDate: string, endDate: string) =>
    ['manufacturing', 'kpi', 'trend', kpiId, startDate, endDate] as const,
  dashboardConfigs: ['manufacturing', 'dashboard-configs'] as const,
  dashboardConfig: (id: string) => ['manufacturing', 'dashboard-configs', id] as const,
  oeeRecords: ['manufacturing', 'oee'] as const,
  oeeRecord: (id: string) => ['manufacturing', 'oee', id] as const,
  oeeSummary: (workCenterId: string, startDate: string, endDate: string) =>
    ['manufacturing', 'oee', 'summary', workCenterId, startDate, endDate] as const,
  productionPerformance: (startDate: string, endDate: string) =>
    ['manufacturing', 'production-performance', startDate, endDate] as const,
};

// =====================================
// BILL OF MATERIALS (BOM) HOOKS
// =====================================

export function useBillOfMaterials(filters?: BomFilterParams) {
  return useQuery<BillOfMaterialListDto[]>({
    queryKey: [...manufacturingKeys.boms, { filters }],
    queryFn: () => ManufacturingService.getBillOfMaterials(filters),
    ...queryOptions.list(),
  });
}

export function useBillOfMaterial(id: string) {
  return useQuery<BillOfMaterialDto>({
    queryKey: manufacturingKeys.bom(id),
    queryFn: () => ManufacturingService.getBillOfMaterial(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useBillOfMaterialsByProduct(productId: string) {
  return useQuery<BillOfMaterialListDto[]>({
    queryKey: manufacturingKeys.bomByProduct(productId),
    queryFn: () => ManufacturingService.getBillOfMaterials({ productId }),
    ...queryOptions.list({ enabled: !!productId }),
  });
}

export function useCreateBillOfMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBillOfMaterialRequest) => ManufacturingService.createBillOfMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms });
      showSuccess('Ürün reçetesi oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Ürün reçetesi oluşturulamadı'),
  });
}

export function useUpdateBillOfMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBillOfMaterialRequest }) =>
      ManufacturingService.updateBillOfMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.bom(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms });
      showSuccess('Ürün reçetesi güncellendi');
    },
    onError: (error) => showApiError(error, 'Ürün reçetesi güncellenemedi'),
  });
}

export function useDeleteBillOfMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteBillOfMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms });
      showSuccess('Ürün reçetesi silindi');
    },
    onError: (error) => showApiError(error, 'Ürün reçetesi silinemedi'),
  });
}

export function useApproveBillOfMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveBillOfMaterial(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.bom(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms });
      showSuccess('Ürün reçetesi onaylandı');
    },
    onError: (error) => showApiError(error, 'Ürün reçetesi onaylanamadı'),
  });
}

export function useActivateBillOfMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.activateBillOfMaterial(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.bom(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms });
      showSuccess('Ürün reçetesi aktifleştirildi');
    },
    onError: (error) => showApiError(error, 'Ürün reçetesi aktifleştirilemedi'),
  });
}

// =====================================
// PRODUCTION ORDERS HOOKS
// =====================================

export function useProductionOrders(filters?: ProductionOrderFilterParams) {
  return useQuery<ProductionOrderListDto[]>({
    queryKey: [...manufacturingKeys.productionOrders, { filters }],
    queryFn: () => ManufacturingService.getProductionOrders(filters),
    ...queryOptions.list(),
  });
}

export function useProductionOrder(id: string) {
  return useQuery<ProductionOrderDto>({
    queryKey: manufacturingKeys.productionOrder(id),
    queryFn: () => ManufacturingService.getProductionOrder(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useProductionOrdersByStatus(status: ProductionOrderStatus) {
  return useQuery<ProductionOrderListDto[]>({
    queryKey: manufacturingKeys.productionOrdersByStatus(status),
    queryFn: () => ManufacturingService.getProductionOrders({ status }),
    ...queryOptions.list(),
  });
}

export function useProductionOrdersByProduct(productId: string) {
  return useQuery<ProductionOrderListDto[]>({
    queryKey: manufacturingKeys.productionOrdersByProduct(productId),
    queryFn: () => ManufacturingService.getProductionOrders({ productId }),
    ...queryOptions.list({ enabled: !!productId }),
  });
}

export function useCreateProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductionOrderRequest) => ManufacturingService.createProductionOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Üretim emri oluşturulamadı'),
  });
}

export function useReleaseProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.releaseProductionOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrder(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri serbest bırakıldı');
    },
    onError: (error) => showApiError(error, 'Üretim emri serbest bırakılamadı'),
  });
}

export function useStartProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartProductionOrderRequest }) =>
      ManufacturingService.startProductionOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrder(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri başlatıldı');
    },
    onError: (error) => showApiError(error, 'Üretim emri başlatılamadı'),
  });
}

export function useCompleteProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteProductionOrderRequest }) =>
      ManufacturingService.completeProductionOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrder(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri tamamlandı');
    },
    onError: (error) => showApiError(error, 'Üretim emri tamamlanamadı'),
  });
}

export function useCancelProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => ManufacturingService.cancelProductionOrder(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrder(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri iptal edildi');
    },
    onError: (error) => showApiError(error, 'Üretim emri iptal edilemedi'),
  });
}

export function useUpdateProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductionOrderRequest> }) =>
      ManufacturingService.updateProductionOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrder(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri güncellendi');
    },
    onError: (error) => showApiError(error, 'Üretim emri güncellenemedi'),
  });
}

export function useDeleteProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteProductionOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Üretim emri silindi');
    },
    onError: (error) => showApiError(error, 'Üretim emri silinemedi'),
  });
}

// =====================================
// WORK CENTERS HOOKS
// =====================================

export function useWorkCenters(filters?: WorkCenterFilterParams) {
  return useQuery<WorkCenterListDto[]>({
    queryKey: [...manufacturingKeys.workCenters, { filters }],
    queryFn: () => ManufacturingService.getWorkCenters(filters),
    ...queryOptions.static(),
  });
}

export function useWorkCenter(id: string) {
  return useQuery<WorkCenterDto>({
    queryKey: manufacturingKeys.workCenter(id),
    queryFn: () => ManufacturingService.getWorkCenter(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateWorkCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkCenterRequest) => ManufacturingService.createWorkCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenters });
      showSuccess('İş merkezi oluşturuldu');
    },
    onError: (error) => showApiError(error, 'İş merkezi oluşturulamadı'),
  });
}

export function useUpdateWorkCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkCenterRequest }) =>
      ManufacturingService.updateWorkCenter(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenter(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenters });
      showSuccess('İş merkezi güncellendi');
    },
    onError: (error) => showApiError(error, 'İş merkezi güncellenemedi'),
  });
}

export function useDeleteWorkCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteWorkCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenters });
      showSuccess('İş merkezi silindi');
    },
    onError: (error) => showApiError(error, 'İş merkezi silinemedi'),
  });
}

export function useActivateWorkCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.activateWorkCenter(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenter(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenters });
      showSuccess('İş merkezi aktifleştirildi');
    },
    onError: (error) => showApiError(error, 'İş merkezi aktifleştirilemedi'),
  });
}

export function useDeactivateWorkCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deactivateWorkCenter(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenter(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workCenters });
      showSuccess('İş merkezi pasifleştirildi');
    },
    onError: (error) => showApiError(error, 'İş merkezi pasifleştirilemedi'),
  });
}

// =====================================
// ROUTINGS HOOKS
// =====================================

export function useRoutings(filters?: RoutingFilterParams) {
  return useQuery<RoutingListDto[]>({
    queryKey: [...manufacturingKeys.routings, { filters }],
    queryFn: () => ManufacturingService.getRoutings(filters),
    ...queryOptions.list(),
  });
}

export function useRouting(id: string) {
  return useQuery<RoutingDto>({
    queryKey: manufacturingKeys.routing(id),
    queryFn: () => ManufacturingService.getRouting(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useRoutingsByProduct(productId: string) {
  return useQuery<RoutingListDto[]>({
    queryKey: manufacturingKeys.routingByProduct(productId),
    queryFn: () => ManufacturingService.getRoutings({ productId }),
    ...queryOptions.list({ enabled: !!productId }),
  });
}

export function useCreateRouting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoutingRequest) => ManufacturingService.createRouting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routings });
      showSuccess('Rota oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Rota oluşturulamadı'),
  });
}

export function useUpdateRouting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoutingRequest }) =>
      ManufacturingService.updateRouting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routing(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routings });
      showSuccess('Rota güncellendi');
    },
    onError: (error) => showApiError(error, 'Rota güncellenemedi'),
  });
}

export function useDeleteRouting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteRouting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routings });
      showSuccess('Rota silindi');
    },
    onError: (error) => showApiError(error, 'Rota silinemedi'),
  });
}

export function useApproveRouting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveRouting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routing(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routings });
      showSuccess('Rota onaylandı');
    },
    onError: (error) => showApiError(error, 'Rota onaylanamadı'),
  });
}

export function useActivateRouting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.activateRouting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routing(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.routings });
      showSuccess('Rota aktifleştirildi');
    },
    onError: (error) => showApiError(error, 'Rota aktifleştirilemedi'),
  });
}

// =====================================
// MPS (MASTER PRODUCTION SCHEDULES) HOOKS
// =====================================

export function useMasterProductionSchedules(filters?: MpsFilterParams) {
  return useQuery<MasterProductionScheduleListDto[]>({
    queryKey: [...manufacturingKeys.mpsSchedules, { filters }],
    queryFn: () => ManufacturingService.getMasterProductionSchedules(filters),
    ...queryOptions.list(),
  });
}

export function useMasterProductionSchedule(id: string) {
  return useQuery<MasterProductionScheduleDto>({
    queryKey: manufacturingKeys.mpsSchedule(id),
    queryFn: () => ManufacturingService.getMasterProductionSchedule(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateMasterProductionSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMasterProductionScheduleRequest) =>
      ManufacturingService.createMasterProductionSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedules });
      showSuccess('Ana üretim planı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Ana üretim planı oluşturulamadı'),
  });
}

export function useUpdateMasterProductionSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMasterProductionScheduleRequest }) =>
      ManufacturingService.updateMasterProductionSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedules });
      showSuccess('Ana üretim planı güncellendi');
    },
    onError: (error) => showApiError(error, 'Ana üretim planı güncellenemedi'),
  });
}

export function useDeleteMasterProductionSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteMasterProductionSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedules });
      showSuccess('Ana üretim planı silindi');
    },
    onError: (error) => showApiError(error, 'Ana üretim planı silinemedi'),
  });
}

export function useApproveMasterProductionSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveMasterProductionSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedule(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedules });
      showSuccess('Ana üretim planı onaylandı');
    },
    onError: (error) => showApiError(error, 'Ana üretim planı onaylanamadı'),
  });
}

export function useActivateMasterProductionSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.activateMasterProductionSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedule(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedules });
      showSuccess('Ana üretim planı aktifleştirildi');
    },
    onError: (error) => showApiError(error, 'Ana üretim planı aktifleştirilemedi'),
  });
}

// MPS Lines
export function useMpsLines(mpsId: string, filters?: Omit<MpsLineFilterParams, 'scheduleId'>) {
  return useQuery<MpsLineListDto[]>({
    queryKey: [...manufacturingKeys.mpsLines(mpsId), { filters }],
    queryFn: () => ManufacturingService.getMpsLines({ scheduleId: mpsId, ...filters }),
    ...queryOptions.list({ enabled: !!mpsId }),
  });
}

export function useAddMpsLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mpsId, data }: { mpsId: string; data: AddMpsLineRequest }) =>
      ManufacturingService.addMpsLine(mpsId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsLines(variables.mpsId) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsSchedule(variables.mpsId) });
      showSuccess('MPS satırı eklendi');
    },
    onError: (error) => showApiError(error, 'MPS satırı eklenemedi'),
  });
}

export function useUpdateMpsLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mpsId, lineId, data }: { mpsId: string; lineId: string; data: UpdateMpsLineRequest }) =>
      ManufacturingService.updateMpsLine(mpsId, lineId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsLine(variables.mpsId, variables.lineId) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsLines(variables.mpsId) });
      showSuccess('MPS satırı güncellendi');
    },
    onError: (error) => showApiError(error, 'MPS satırı güncellenemedi'),
  });
}

export function useDeleteMpsLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mpsId, lineId }: { mpsId: string; lineId: string }) =>
      ManufacturingService.deleteMpsLine(mpsId, lineId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsLines(variables.mpsId) });
      showSuccess('MPS satırı silindi');
    },
    onError: (error) => showApiError(error, 'MPS satırı silinemedi'),
  });
}

export function useRecordMpsActuals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mpsId, lineId, data }: { mpsId: string; lineId: string; data: RecordActualsRequest }) =>
      ManufacturingService.recordMpsActuals(mpsId, lineId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsLine(variables.mpsId, variables.lineId) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mpsLines(variables.mpsId) });
      showSuccess('Gerçekleşenler kaydedildi');
    },
    onError: (error) => showApiError(error, 'Gerçekleşenler kaydedilemedi'),
  });
}

export function useAvailableToPromise(productId: string, date: string) {
  return useQuery<AtpQueryResponse>({
    queryKey: manufacturingKeys.mpsAtp(productId, date),
    queryFn: () => ManufacturingService.queryAtp(productId, date),
    ...queryOptions.realtime({ enabled: !!productId && !!date }),
  });
}

// =====================================
// MATERIAL RESERVATIONS HOOKS
// =====================================

export function useMaterialReservations() {
  return useQuery<MaterialReservationListDto[]>({
    queryKey: manufacturingKeys.reservations,
    queryFn: () => ManufacturingService.getMaterialReservations(),
    ...queryOptions.list(),
  });
}

export function useMaterialReservationsByStatus(status: ReservationStatus) {
  return useQuery<MaterialReservationListDto[]>({
    queryKey: [...manufacturingKeys.reservations, { status }],
    queryFn: () => ManufacturingService.getMaterialReservationsByStatus(status),
    ...queryOptions.list({ enabled: !!status }),
  });
}

export function useMaterialReservationsByProductionOrder(productionOrderId: string) {
  return useQuery<MaterialReservationListDto[]>({
    queryKey: [...manufacturingKeys.reservations, { productionOrderId }],
    queryFn: () => ManufacturingService.getMaterialReservationsByProductionOrder(productionOrderId),
    ...queryOptions.list({ enabled: !!productionOrderId }),
  });
}

export function useMaterialReservation(id: string) {
  return useQuery<MaterialReservationDto>({
    queryKey: manufacturingKeys.reservation(id),
    queryFn: () => ManufacturingService.getMaterialReservation(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useMaterialReservationSummary() {
  return useQuery<MaterialReservationSummaryDto>({
    queryKey: ['manufacturing', 'reservations', 'summary'],
    queryFn: () => ManufacturingService.getMaterialReservationSummary(),
    ...queryOptions.detail(),
  });
}

export function useProductReservationSummary(productId: string) {
  return useQuery<ProductReservationSummaryDto>({
    queryKey: manufacturingKeys.productReservations(productId),
    queryFn: () => ManufacturingService.getProductReservationSummary(productId),
    ...queryOptions.list({ enabled: !!productId }),
  });
}

export function useCreateMaterialReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterialReservationRequest) => ManufacturingService.createMaterialReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme rezervasyonu oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Malzeme rezervasyonu oluşturulamadı'),
  });
}

export function useUpdateMaterialReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialReservationRequest }) =>
      ManufacturingService.updateMaterialReservation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme rezervasyonu güncellendi');
    },
    onError: (error) => showApiError(error, 'Malzeme rezervasyonu güncellenemedi'),
  });
}

export function useApproveMaterialReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveMaterialReservationRequest }) =>
      ManufacturingService.approveMaterialReservation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme rezervasyonu onaylandı');
    },
    onError: (error) => showApiError(error, 'Malzeme rezervasyonu onaylanamadı'),
  });
}

export function useAllocateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AllocateMaterialRequest }) =>
      ManufacturingService.allocateMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme tahsis edildi');
    },
    onError: (error) => showApiError(error, 'Malzeme tahsis edilemedi'),
  });
}

export function useIssueMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IssueMaterialRequest }) =>
      ManufacturingService.issueMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme çıkışı yapıldı');
    },
    onError: (error) => showApiError(error, 'Malzeme çıkışı yapılamadı'),
  });
}

export function useReturnMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnMaterialRequest }) =>
      ManufacturingService.returnMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme iade edildi');
    },
    onError: (error) => showApiError(error, 'Malzeme iade edilemedi'),
  });
}

export function useCompleteMaterialReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.completeMaterialReservation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme rezervasyonu tamamlandı');
    },
    onError: (error) => showApiError(error, 'Malzeme rezervasyonu tamamlanamadı'),
  });
}

export function useCancelMaterialReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.cancelMaterialReservation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservation(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.reservations });
      showSuccess('Malzeme rezervasyonu iptal edildi');
    },
    onError: (error) => showApiError(error, 'Malzeme rezervasyonu iptal edilemedi'),
  });
}

// =====================================
// MRP PLANS HOOKS
// =====================================

export function useMrpPlans(filters?: MrpPlanFilterParams) {
  return useQuery<MrpPlanListDto[]>({
    queryKey: [...manufacturingKeys.mrpPlans, { filters }],
    queryFn: () => ManufacturingService.getMrpPlans(filters),
    ...queryOptions.list(),
  });
}

export function useMrpPlan(id: string) {
  return useQuery<MrpPlanDto>({
    queryKey: manufacturingKeys.mrpPlan(id),
    queryFn: () => ManufacturingService.getMrpPlan(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateMrpPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMrpPlanRequest) => ManufacturingService.createMrpPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpPlans });
      showSuccess('MRP planı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'MRP planı oluşturulamadı'),
  });
}

export function useExecuteMrpPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExecuteMrpPlanRequest }) =>
      ManufacturingService.executeMrpPlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpPlan(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpPlans });
      showSuccess('MRP planı çalıştırıldı');
    },
    onError: (error) => showApiError(error, 'MRP planı çalıştırılamadı'),
  });
}

export function useApproveMrpPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveMrpPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpPlan(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpPlans });
      showSuccess('MRP planı onaylandı');
    },
    onError: (error) => showApiError(error, 'MRP planı onaylanamadı'),
  });
}

export function useDeleteMrpPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteMrpPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpPlans });
      showSuccess('MRP planı silindi');
    },
    onError: (error) => showApiError(error, 'MRP planı silinemedi'),
  });
}

// Planned Orders
export function usePlannedOrders(mrpPlanId: string, filters?: Omit<PlannedOrderFilterParams, 'planId'>) {
  return useQuery<PlannedOrderListDto[]>({
    queryKey: [...manufacturingKeys.plannedOrders(mrpPlanId), { filters }],
    queryFn: () => ManufacturingService.getPlannedOrders({ planId: mrpPlanId, ...filters }),
    ...queryOptions.list({ enabled: !!mrpPlanId }),
  });
}

export function useConfirmPlannedOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mrpPlanId, orderId, data }: { mrpPlanId: string; orderId: string; data: ConfirmPlannedOrderRequest }) =>
      ManufacturingService.confirmPlannedOrder(mrpPlanId, orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.plannedOrders(variables.mrpPlanId) });
      showSuccess('Planlı sipariş onaylandı');
    },
    onError: (error) => showApiError(error, 'Planlı sipariş onaylanamadı'),
  });
}

export function useReleasePlannedOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mrpPlanId, orderId, data }: { mrpPlanId: string; orderId: string; data: ReleasePlannedOrderRequest }) =>
      ManufacturingService.releasePlannedOrder(mrpPlanId, orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.plannedOrders(variables.mrpPlanId) });
      showSuccess('Planlı sipariş serbest bırakıldı');
    },
    onError: (error) => showApiError(error, 'Planlı sipariş serbest bırakılamadı'),
  });
}

export function useConvertPlannedOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mrpPlanId, orderId, data }: { mrpPlanId: string; orderId: string; data: ConvertPlannedOrderRequest }) =>
      ManufacturingService.convertPlannedOrder(mrpPlanId, orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.plannedOrders(variables.mrpPlanId) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionOrders });
      showSuccess('Planlı sipariş dönüştürüldü');
    },
    onError: (error) => showApiError(error, 'Planlı sipariş dönüştürülemedi'),
  });
}

// MRP Exceptions
export function useMrpExceptions(mrpPlanId: string) {
  return useQuery<MrpExceptionDto[]>({
    queryKey: manufacturingKeys.mrpExceptions(mrpPlanId),
    queryFn: () => ManufacturingService.getMrpExceptions(mrpPlanId),
    ...queryOptions.list({ enabled: !!mrpPlanId }),
  });
}

export function useResolveMrpException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mrpPlanId, exceptionId, data }: { mrpPlanId: string; exceptionId: string; data: ResolveMrpExceptionRequest }) =>
      ManufacturingService.resolveMrpException(mrpPlanId, exceptionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.mrpExceptions(variables.mrpPlanId) });
      showSuccess('MRP istisnası çözüldü');
    },
    onError: (error) => showApiError(error, 'MRP istisnası çözülemedi'),
  });
}

// =====================================
// QUALITY INSPECTIONS HOOKS
// =====================================

export function useQualityInspections(filters?: QualityInspectionFilterParams) {
  return useQuery<QualityInspectionListDto[]>({
    queryKey: [...manufacturingKeys.inspections, { filters }],
    queryFn: () => ManufacturingService.getQualityInspections(filters),
    ...queryOptions.list(),
  });
}

export function useQualityInspection(id: string) {
  return useQuery<QualityInspectionDto>({
    queryKey: manufacturingKeys.inspection(id),
    queryFn: () => ManufacturingService.getQualityInspection(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateQualityInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQualityInspectionRequest) => ManufacturingService.createQualityInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspections });
      showSuccess('Kalite kontrolü oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Kalite kontrolü oluşturulamadı'),
  });
}

export function useStartQualityInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartInspectionRequest }) =>
      ManufacturingService.startQualityInspection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspection(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspections });
      showSuccess('Kalite kontrolü başlatıldı');
    },
    onError: (error) => showApiError(error, 'Kalite kontrolü başlatılamadı'),
  });
}

export function useRecordInspectionResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordInspectionResultRequest }) =>
      ManufacturingService.recordInspectionResult(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspection(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspections });
      showSuccess('Kontrol sonucu kaydedildi');
    },
    onError: (error) => showApiError(error, 'Kontrol sonucu kaydedilemedi'),
  });
}

export function useRecordNonConformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordNonConformanceRequest }) =>
      ManufacturingService.recordNonConformance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspection(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspections });
      showSuccess('Uygunsuzluk kaydedildi');
    },
    onError: (error) => showApiError(error, 'Uygunsuzluk kaydedilemedi'),
  });
}

export function useSetInspectionDisposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetDispositionRequest }) =>
      ManufacturingService.setInspectionDisposition(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspection(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspections });
      showSuccess('Değerlendirme sonucu belirlendi');
    },
    onError: (error) => showApiError(error, 'Değerlendirme sonucu belirlenemedi'),
  });
}

export function useCompleteQualityInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.completeQualityInspection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspection(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.inspections });
      showSuccess('Kalite kontrolü tamamlandı');
    },
    onError: (error) => showApiError(error, 'Kalite kontrolü tamamlanamadı'),
  });
}

// =====================================
// CAPACITY PLANS HOOKS
// =====================================

export function useCapacityPlans(filters?: CapacityPlanFilterParams) {
  return useQuery<CapacityPlanListDto[]>({
    queryKey: [...manufacturingKeys.capacityPlans, { filters }],
    queryFn: () => ManufacturingService.getCapacityPlans(filters),
    ...queryOptions.list(),
  });
}

export function useCapacityPlan(id: string) {
  return useQuery<CapacityPlanDto>({
    queryKey: manufacturingKeys.capacityPlan(id),
    queryFn: () => ManufacturingService.getCapacityPlan(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateCapacityPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCapacityPlanRequest) => ManufacturingService.createCapacityPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlans });
      showSuccess('Kapasite planı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Kapasite planı oluşturulamadı'),
  });
}

export function useExecuteCapacityPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExecuteCapacityPlanRequest }) =>
      ManufacturingService.executeCapacityPlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlan(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlans });
      showSuccess('Kapasite planı çalıştırıldı');
    },
    onError: (error) => showApiError(error, 'Kapasite planı çalıştırılamadı'),
  });
}

export function useApproveCapacityPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveCapacityPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlan(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlans });
      showSuccess('Kapasite planı onaylandı');
    },
    onError: (error) => showApiError(error, 'Kapasite planı onaylanamadı'),
  });
}

export function useCancelCapacityPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.cancelCapacityPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlan(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlans });
      showSuccess('Kapasite planı iptal edildi');
    },
    onError: (error) => showApiError(error, 'Kapasite planı iptal edilemedi'),
  });
}

export function useDeleteCapacityPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteCapacityPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityPlans });
      showSuccess('Kapasite planı silindi');
    },
    onError: (error) => showApiError(error, 'Kapasite planı silinemedi'),
  });
}

// Capacity Requirements & Exceptions
export function useCapacityRequirements(planId: string, filters?: Omit<CapacityRequirementFilterParams, 'planId'>) {
  return useQuery<CapacityRequirementDto[]>({
    queryKey: [...manufacturingKeys.capacityRequirements(planId), { filters }],
    queryFn: () => ManufacturingService.getCapacityRequirements({ planId, ...filters }),
    ...queryOptions.list({ enabled: !!planId }),
  });
}

export function useCapacityExceptions(planId: string) {
  return useQuery<CapacityExceptionDto[]>({
    queryKey: manufacturingKeys.capacityExceptions(planId),
    queryFn: () => ManufacturingService.getCapacityExceptions(planId),
    ...queryOptions.list({ enabled: !!planId }),
  });
}

export function useResolveCapacityException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, exceptionId, data }: { planId: string; exceptionId: string; data: ResolveCapacityExceptionRequest }) =>
      ManufacturingService.resolveCapacityException(planId, exceptionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capacityExceptions(variables.planId) });
      showSuccess('Kapasite istisnası çözüldü');
    },
    onError: (error) => showApiError(error, 'Kapasite istisnası çözülemedi'),
  });
}

export function useWorkCenterCapacityOverview(workCenterIds: string[], startDate: string, endDate: string) {
  return useQuery<WorkCenterCapacityOverviewDto[]>({
    queryKey: ['manufacturing', 'capacity', 'workcenter-overview', { workCenterIds, startDate, endDate }],
    queryFn: () => ManufacturingService.getWorkCenterCapacityOverview(workCenterIds, startDate, endDate),
    ...queryOptions.list({ enabled: workCenterIds.length > 0 && !!startDate && !!endDate }),
  });
}

// =====================================
// COST ACCOUNTING HOOKS
// =====================================

export function useProductionCostRecords(filters?: CostRecordFilterParams) {
  return useQuery<ProductionCostRecordListDto[]>({
    queryKey: [...manufacturingKeys.costRecords, { filters }],
    queryFn: () => ManufacturingService.getProductionCostRecords(filters),
    ...queryOptions.list(),
  });
}

export function useProductionCostRecord(id: string) {
  return useQuery<ProductionCostRecordDto>({
    queryKey: manufacturingKeys.costRecord(id),
    queryFn: () => ManufacturingService.getProductionCostRecord(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCostSummary(year?: number, month?: number) {
  return useQuery<CostSummaryDto>({
    queryKey: ['manufacturing', 'cost', 'summary', { year, month }],
    queryFn: () => ManufacturingService.getCostSummary(year, month),
    ...queryOptions.detail(),
  });
}

export function useCreateProductionCostRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductionCostRecordRequest) => ManufacturingService.createProductionCostRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costRecords });
      showSuccess('Üretim maliyet kaydı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Üretim maliyet kaydı oluşturulamadı'),
  });
}

export function useSetProductionDirectCosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetProductionDirectCostsRequest }) =>
      ManufacturingService.setProductionDirectCosts(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costRecord(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costSummary(variables.id) });
      showSuccess('Direkt maliyetler kaydedildi');
    },
    onError: (error) => showApiError(error, 'Direkt maliyetler kaydedilemedi'),
  });
}

export function useSetOverheadCosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetOverheadCostsRequest }) =>
      ManufacturingService.setOverheadCosts(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costRecord(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costSummary(variables.id) });
      showSuccess('Genel giderler kaydedildi');
    },
    onError: (error) => showApiError(error, 'Genel giderler kaydedilemedi'),
  });
}

export function useSetCostVariances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetVariancesRequest }) =>
      ManufacturingService.setVariances(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costRecord(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costSummary(variables.id) });
      showSuccess('Maliyet sapmaları kaydedildi');
    },
    onError: (error) => showApiError(error, 'Maliyet sapmaları kaydedilemedi'),
  });
}

export function useAddCostAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddCostAllocationRequest }) =>
      ManufacturingService.addCostAllocation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costRecord(variables.id) });
      showSuccess('Maliyet dağıtımı eklendi');
    },
    onError: (error) => showApiError(error, 'Maliyet dağıtımı eklenemedi'),
  });
}

export function useAddJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddJournalEntryRequest }) =>
      ManufacturingService.addJournalEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costRecord(variables.id) });
      showSuccess('Muhasebe kaydı eklendi');
    },
    onError: (error) => showApiError(error, 'Muhasebe kaydı eklenemedi'),
  });
}

// Cost Centers
export function useCostCenters(filters?: CostCenterFilterParams) {
  return useQuery<CostCenterListDto[]>({
    queryKey: [...manufacturingKeys.costCenters, { filters }],
    queryFn: () => ManufacturingService.getCostCenters(filters),
    ...queryOptions.static(),
  });
}

export function useCostCenter(id: string) {
  return useQuery<CostCenterDto>({
    queryKey: manufacturingKeys.costCenter(id),
    queryFn: () => ManufacturingService.getCostCenter(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCostCenterRequest) => ManufacturingService.createCostCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costCenters });
      showSuccess('Maliyet merkezi oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Maliyet merkezi oluşturulamadı'),
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostCenterRequest }) =>
      ManufacturingService.updateCostCenter(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costCenter(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costCenters });
      showSuccess('Maliyet merkezi güncellendi');
    },
    onError: (error) => showApiError(error, 'Maliyet merkezi güncellenemedi'),
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.costCenters });
      showSuccess('Maliyet merkezi silindi');
    },
    onError: (error) => showApiError(error, 'Maliyet merkezi silinemedi'),
  });
}

// Standard Cost Cards
export function useStandardCostCards(filters?: StandardCostFilterParams) {
  return useQuery<StandardCostCardListDto[]>({
    queryKey: [...manufacturingKeys.standardCosts, { filters }],
    queryFn: () => ManufacturingService.getStandardCostCards(filters),
    ...queryOptions.list(),
  });
}

export function useStandardCostCard(id: string) {
  return useQuery<StandardCostCardDto>({
    queryKey: manufacturingKeys.standardCost(id),
    queryFn: () => ManufacturingService.getStandardCostCard(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateStandardCostCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStandardCostCardRequest) => ManufacturingService.createStandardCostCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.standardCosts });
      showSuccess('Standart maliyet kartı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Standart maliyet kartı oluşturulamadı'),
  });
}

export function useSetStandardCostCardAsCurrent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.setStandardCostCardAsCurrent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.standardCost(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.standardCosts });
      showSuccess('Standart maliyet kartı güncel olarak ayarlandı');
    },
    onError: (error) => showApiError(error, 'Standart maliyet kartı ayarlanamadı'),
  });
}

// =====================================
// MAINTENANCE HOOKS
// =====================================

export function useMaintenancePlans() {
  return useQuery<MaintenancePlanListDto[]>({
    queryKey: manufacturingKeys.maintenancePlans,
    queryFn: () => ManufacturingService.getMaintenancePlans(),
    ...queryOptions.list(),
  });
}

export function useMaintenancePlan(id: string) {
  return useQuery<MaintenancePlanDto>({
    queryKey: manufacturingKeys.maintenancePlan(id),
    queryFn: () => ManufacturingService.getMaintenancePlan(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenancePlanRequest) => ManufacturingService.createMaintenancePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım planı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Bakım planı oluşturulamadı'),
  });
}

export function useUpdateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenancePlanRequest }) =>
      ManufacturingService.updateMaintenancePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlan(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım planı güncellendi');
    },
    onError: (error) => showApiError(error, 'Bakım planı güncellenemedi'),
  });
}

export function useDeleteMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteMaintenancePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım planı silindi');
    },
    onError: (error) => showApiError(error, 'Bakım planı silinemedi'),
  });
}

export function useActivateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.activateMaintenancePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlan(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım planı aktifleştirildi');
    },
    onError: (error) => showApiError(error, 'Bakım planı aktifleştirilemedi'),
  });
}

export function useSuspendMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.suspendMaintenancePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlan(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım planı askıya alındı');
    },
    onError: (error) => showApiError(error, 'Bakım planı askıya alınamadı'),
  });
}

// Maintenance Tasks
export function useCreateMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceTaskRequest) =>
      ManufacturingService.createMaintenanceTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım görevi oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Bakım görevi oluşturulamadı'),
  });
}

export function useUpdateMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceTaskRequest }) =>
      ManufacturingService.updateMaintenanceTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım görevi güncellendi');
    },
    onError: (error) => showApiError(error, 'Bakım görevi güncellenemedi'),
  });
}

export function useDeleteMaintenanceTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      ManufacturingService.deleteMaintenanceTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenancePlans });
      showSuccess('Bakım görevi silindi');
    },
    onError: (error) => showApiError(error, 'Bakım görevi silinemedi'),
  });
}

// Maintenance Records
export function useMaintenanceRecords(filters?: MaintenanceRecordFilterParams) {
  return useQuery<MaintenanceRecordListDto[]>({
    queryKey: [...manufacturingKeys.maintenanceRecords, { filters }],
    queryFn: () => ManufacturingService.getMaintenanceRecords(filters),
    ...queryOptions.list(),
  });
}

export function useMaintenanceRecord(id: string) {
  return useQuery<MaintenanceRecordDto>({
    queryKey: manufacturingKeys.maintenanceRecord(id),
    queryFn: () => ManufacturingService.getMaintenanceRecord(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceRecordRequest) => ManufacturingService.createMaintenanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecords });
      showSuccess('Bakım kaydı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Bakım kaydı oluşturulamadı'),
  });
}

export function useUpdateMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceRecordRequest }) =>
      ManufacturingService.updateMaintenanceRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecord(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecords });
      showSuccess('Bakım kaydı güncellendi');
    },
    onError: (error) => showApiError(error, 'Bakım kaydı güncellenemedi'),
  });
}

export function useStartMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartMaintenanceRecordRequest }) =>
      ManufacturingService.startMaintenanceRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecord(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecords });
      showSuccess('Bakım başlatıldı');
    },
    onError: (error) => showApiError(error, 'Bakım başlatılamadı'),
  });
}

export function useCompleteMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteMaintenanceRecordRequest }) =>
      ManufacturingService.completeMaintenanceRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecord(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecords });
      showSuccess('Bakım tamamlandı');
    },
    onError: (error) => showApiError(error, 'Bakım tamamlanamadı'),
  });
}

export function useCancelMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.cancelMaintenanceRecord(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecord(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecords });
      showSuccess('Bakım iptal edildi');
    },
    onError: (error) => showApiError(error, 'Bakım iptal edilemedi'),
  });
}

export function useAddMaintenanceRecordSparePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMaintenanceRecordSparePartRequest) =>
      ManufacturingService.addMaintenanceRecordSparePart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.maintenanceRecords });
      showSuccess('Yedek parça eklendi');
    },
    onError: (error) => showApiError(error, 'Yedek parça eklenemedi'),
  });
}

// Spare Parts
export function useSpareParts() {
  return useQuery<SparePartListDto[]>({
    queryKey: manufacturingKeys.spareParts,
    queryFn: () => ManufacturingService.getSpareParts(),
    ...queryOptions.static(),
  });
}

export function useSparePart(id: string) {
  return useQuery<SparePartDto>({
    queryKey: manufacturingKeys.sparePart(id),
    queryFn: () => ManufacturingService.getSparePart(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateSparePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSparePartRequest) => ManufacturingService.createSparePart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.spareParts });
      showSuccess('Yedek parça oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Yedek parça oluşturulamadı'),
  });
}

export function useUpdateSparePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSparePartRequest }) =>
      ManufacturingService.updateSparePart(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.sparePart(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.spareParts });
      showSuccess('Yedek parça güncellendi');
    },
    onError: (error) => showApiError(error, 'Yedek parça güncellenemedi'),
  });
}

export function useDeleteSparePart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteSparePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.spareParts });
      showSuccess('Yedek parça silindi');
    },
    onError: (error) => showApiError(error, 'Yedek parça silinemedi'),
  });
}

// Machine Counters
export function useMachineCounters(machineId: string) {
  return useQuery<MachineCounterListDto[]>({
    queryKey: [...manufacturingKeys.machineCounters, machineId],
    queryFn: () => ManufacturingService.getMachineCounters(machineId),
    ...queryOptions.list({ enabled: !!machineId }),
  });
}

export function useCriticalMachineCounters() {
  return useQuery<MachineCounterListDto[]>({
    queryKey: [...manufacturingKeys.machineCounters, 'critical'],
    queryFn: () => ManufacturingService.getCriticalMachineCounters(),
    ...queryOptions.list(),
  });
}

export function useCreateMachineCounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMachineCounterRequest) => ManufacturingService.createMachineCounter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.machineCounters });
      showSuccess('Makine sayacı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Makine sayacı oluşturulamadı'),
  });
}

export function useUpdateMachineCounterValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMachineCounterValueRequest }) =>
      ManufacturingService.updateMachineCounterValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.machineCounters });
      showSuccess('Sayaç değeri güncellendi');
    },
    onError: (error) => showApiError(error, 'Sayaç değeri güncellenemedi'),
  });
}

export function useResetMachineCounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetMachineCounterRequest }) =>
      ManufacturingService.resetMachineCounter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.machineCounters });
      showSuccess('Sayaç sıfırlandı');
    },
    onError: (error) => showApiError(error, 'Sayaç sıfırlanamadı'),
  });
}

// Maintenance Dashboard & Summary
export function useMaintenanceDashboard() {
  return useQuery<MaintenanceDashboardDto>({
    queryKey: manufacturingKeys.maintenanceDashboard,
    queryFn: () => ManufacturingService.getMaintenanceDashboard(),
    ...queryOptions.realtime(),
  });
}

export function useMaintenanceSummary(periodStart: string, periodEnd: string) {
  return useQuery<MaintenanceSummaryDto>({
    queryKey: ['manufacturing', 'maintenance', 'summary', { periodStart, periodEnd }],
    queryFn: () => ManufacturingService.getMaintenanceSummary(periodStart, periodEnd),
    ...queryOptions.detail({ enabled: !!periodStart && !!periodEnd }),
  });
}

// =====================================
// NCR (NON-CONFORMANCE REPORTS) HOOKS
// =====================================

export function useNcrs() {
  return useQuery<NonConformanceReportListDto[]>({
    queryKey: manufacturingKeys.ncrs,
    queryFn: () => ManufacturingService.getNcrs(),
    ...queryOptions.list(),
  });
}

export function useOpenNcrs() {
  return useQuery<NonConformanceReportListDto[]>({
    queryKey: [...manufacturingKeys.ncrs, 'open'],
    queryFn: () => ManufacturingService.getOpenNcrs(),
    ...queryOptions.list(),
  });
}

export function useNcrsByStatus(status: NcrStatus) {
  return useQuery<NonConformanceReportListDto[]>({
    queryKey: [...manufacturingKeys.ncrs, 'by-status', status],
    queryFn: () => ManufacturingService.getNcrsByStatus(status),
    ...queryOptions.list({ enabled: !!status }),
  });
}

export function useNcrsBySource(source: NcrSource) {
  return useQuery<NonConformanceReportListDto[]>({
    queryKey: [...manufacturingKeys.ncrs, 'by-source', source],
    queryFn: () => ManufacturingService.getNcrsBySource(source),
    ...queryOptions.list({ enabled: !!source }),
  });
}

export function useNcrsBySeverity(severity: NcrSeverity) {
  return useQuery<NonConformanceReportListDto[]>({
    queryKey: [...manufacturingKeys.ncrs, 'by-severity', severity],
    queryFn: () => ManufacturingService.getNcrsBySeverity(severity),
    ...queryOptions.list({ enabled: !!severity }),
  });
}

export function useNcrsByProduct(productId: string) {
  return useQuery<NonConformanceReportListDto[]>({
    queryKey: [...manufacturingKeys.ncrs, 'by-product', productId],
    queryFn: () => ManufacturingService.getNcrsByProduct(productId),
    ...queryOptions.list({ enabled: !!productId }),
  });
}

export function useNcr(id: string) {
  return useQuery<NonConformanceReportDto>({
    queryKey: manufacturingKeys.ncr(id),
    queryFn: () => ManufacturingService.getNcr(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useNcrStatistics(startDate?: string, endDate?: string) {
  return useQuery<NcrStatisticsDto>({
    queryKey: [...manufacturingKeys.ncrStatistics, { startDate, endDate }],
    queryFn: () => ManufacturingService.getNcrStatistics(startDate, endDate),
    ...queryOptions.realtime(),
  });
}

export function useCreateNcr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNcrRequest) => ManufacturingService.createNcr(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrs });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrStatistics });
      showSuccess('Uygunsuzluk raporu oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Uygunsuzluk raporu oluşturulamadı'),
  });
}

export function useUpdateNcr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNcrRequest }) =>
      ManufacturingService.updateNcr(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrs });
      showSuccess('Uygunsuzluk raporu güncellendi');
    },
    onError: (error) => showApiError(error, 'Uygunsuzluk raporu güncellenemedi'),
  });
}

export function useStartNcrInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartNcrInvestigationRequest }) =>
      ManufacturingService.startNcrInvestigation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrs });
      showSuccess('Soruşturma başlatıldı');
    },
    onError: (error) => showApiError(error, 'Soruşturma başlatılamadı'),
  });
}

export function useSetNcrRootCause() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetNcrRootCauseRequest }) =>
      ManufacturingService.setNcrRootCause(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      showSuccess('Kök neden belirlendi');
    },
    onError: (error) => showApiError(error, 'Kök neden belirlenemedi'),
  });
}

export function useSetNcrDisposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetNcrDispositionRequest }) =>
      ManufacturingService.setNcrDisposition(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrs });
      showSuccess('Değerlendirme sonucu belirlendi');
    },
    onError: (error) => showApiError(error, 'Değerlendirme sonucu belirlenemedi'),
  });
}

export function useAddNcrContainmentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddNcrContainmentActionRequest }) =>
      ManufacturingService.addNcrContainmentAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      showSuccess('Acil önlem eklendi');
    },
    onError: (error) => showApiError(error, 'Acil önlem eklenemedi'),
  });
}

export function useCompleteNcrContainmentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actionId, data }: { id: string; actionId: string; data: CompleteNcrContainmentActionRequest }) =>
      ManufacturingService.completeNcrContainmentAction(id, actionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      showSuccess('Acil önlem tamamlandı');
    },
    onError: (error) => showApiError(error, 'Acil önlem tamamlanamadı'),
  });
}

export function useCloseNcr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseNcrRequest }) =>
      ManufacturingService.closeNcr(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrs });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrStatistics });
      showSuccess('Uygunsuzluk raporu kapatıldı');
    },
    onError: (error) => showApiError(error, 'Uygunsuzluk raporu kapatılamadı'),
  });
}

export function useCancelNcr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.cancelNcr(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncr(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrs });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.ncrStatistics });
      showSuccess('Uygunsuzluk raporu iptal edildi');
    },
    onError: (error) => showApiError(error, 'Uygunsuzluk raporu iptal edilemedi'),
  });
}

// =====================================
// CAPA (CORRECTIVE AND PREVENTIVE ACTIONS) HOOKS
// =====================================

export function useCapas() {
  return useQuery<CorrectivePreventiveActionListDto[]>({
    queryKey: manufacturingKeys.capas,
    queryFn: () => ManufacturingService.getCapas(),
    ...queryOptions.list(),
  });
}

export function useOpenCapas() {
  return useQuery<CorrectivePreventiveActionListDto[]>({
    queryKey: [...manufacturingKeys.capas, 'open'],
    queryFn: () => ManufacturingService.getOpenCapas(),
    ...queryOptions.list(),
  });
}

export function useOverdueCapas() {
  return useQuery<CorrectivePreventiveActionListDto[]>({
    queryKey: [...manufacturingKeys.capas, 'overdue'],
    queryFn: () => ManufacturingService.getOverdueCapas(),
    ...queryOptions.list(),
  });
}

export function useCapasByStatus(status: CapaStatus) {
  return useQuery<CorrectivePreventiveActionListDto[]>({
    queryKey: [...manufacturingKeys.capas, 'by-status', status],
    queryFn: () => ManufacturingService.getCapasByStatus(status),
    ...queryOptions.list({ enabled: !!status }),
  });
}

export function useCapasByType(type: CapaType) {
  return useQuery<CorrectivePreventiveActionListDto[]>({
    queryKey: [...manufacturingKeys.capas, 'by-type', type],
    queryFn: () => ManufacturingService.getCapasByType(type),
    ...queryOptions.list({ enabled: !!type }),
  });
}

export function useCapasByNcr(ncrId: string) {
  return useQuery<CorrectivePreventiveActionListDto[]>({
    queryKey: [...manufacturingKeys.capas, 'by-ncr', ncrId],
    queryFn: () => ManufacturingService.getCapasByNcr(ncrId),
    ...queryOptions.list({ enabled: !!ncrId }),
  });
}

export function useCapa(id: string) {
  return useQuery<CorrectivePreventiveActionDto>({
    queryKey: manufacturingKeys.capa(id),
    queryFn: () => ManufacturingService.getCapa(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCapaStatistics(startDate?: string, endDate?: string) {
  return useQuery<CapaStatisticsDto>({
    queryKey: [...manufacturingKeys.capaStatistics, { startDate, endDate }],
    queryFn: () => ManufacturingService.getCapaStatistics(startDate, endDate),
    ...queryOptions.realtime(),
  });
}

export function useCreateCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCapaRequest) => ManufacturingService.createCapa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capaStatistics });
      showSuccess('CAPA oluşturuldu');
    },
    onError: (error) => showApiError(error, 'CAPA oluşturulamadı'),
  });
}

export function useUpdateCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCapaRequest }) =>
      ManufacturingService.updateCapa(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      showSuccess('CAPA güncellendi');
    },
    onError: (error) => showApiError(error, 'CAPA güncellenemedi'),
  });
}

export function useUpdateCapaProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCapaProgressRequest }) =>
      ManufacturingService.updateCapaProgress(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      showSuccess('CAPA ilerlemesi güncellendi');
    },
    onError: (error) => showApiError(error, 'CAPA ilerlemesi güncellenemedi'),
  });
}

export function useVerifyCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyCapaRequest }) =>
      ManufacturingService.verifyCapa(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      showSuccess('CAPA doğrulandı');
    },
    onError: (error) => showApiError(error, 'CAPA doğrulanamadı'),
  });
}

export function useEvaluateCapaEffectiveness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EvaluateCapaEffectivenessRequest }) =>
      ManufacturingService.evaluateCapaEffectiveness(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      showSuccess('CAPA etkinliği değerlendirildi');
    },
    onError: (error) => showApiError(error, 'CAPA etkinliği değerlendirilemedi'),
  });
}

export function useCloseCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseCapaRequest }) =>
      ManufacturingService.closeCapa(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capaStatistics });
      showSuccess('CAPA kapatıldı');
    },
    onError: (error) => showApiError(error, 'CAPA kapatılamadı'),
  });
}

export function useCancelCapa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.cancelCapa(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capas });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capaStatistics });
      showSuccess('CAPA iptal edildi');
    },
    onError: (error) => showApiError(error, 'CAPA iptal edilemedi'),
  });
}

// CAPA Tasks
export function useAddCapaTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ capaId, data }: { capaId: string; data: AddCapaTaskRequest }) =>
      ManufacturingService.addCapaTask(capaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.capaId) });
      showSuccess('CAPA görevi eklendi');
    },
    onError: (error) => showApiError(error, 'CAPA görevi eklenemedi'),
  });
}

export function useCompleteCapaTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ capaId, taskId, data }: { capaId: string; taskId: string; data: CompleteCapaTaskRequest }) =>
      ManufacturingService.completeCapaTask(capaId, taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.capa(variables.capaId) });
      showSuccess('CAPA görevi tamamlandı');
    },
    onError: (error) => showApiError(error, 'CAPA görevi tamamlanamadı'),
  });
}

// =====================================
// SUBCONTRACT ORDERS HOOKS
// =====================================

export function useSubcontractOrders(filters?: SubcontractOrderFilterParams) {
  return useQuery<SubcontractOrderListDto[]>({
    queryKey: [...manufacturingKeys.subcontractOrders, { filters }],
    queryFn: () => ManufacturingService.getSubcontractOrders(filters),
    ...queryOptions.list(),
  });
}

export function useSubcontractOrder(id: string) {
  return useQuery<SubcontractOrderDto>({
    queryKey: manufacturingKeys.subcontractOrder(id),
    queryFn: () => ManufacturingService.getSubcontractOrder(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateSubcontractOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubcontractOrderRequest) => ManufacturingService.createSubcontractOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Fason iş emri oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Fason iş emri oluşturulamadı'),
  });
}

export function useApproveSubcontractOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveSubcontractOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Fason iş emri onaylandı');
    },
    onError: (error) => showApiError(error, 'Fason iş emri onaylanamadı'),
  });
}

export function useAddSubcontractMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: AddSubcontractMaterialRequest }) =>
      ManufacturingService.addSubcontractMaterial(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(variables.orderId) });
      showSuccess('Fason malzeme eklendi');
    },
    onError: (error) => showApiError(error, 'Fason malzeme eklenemedi'),
  });
}

export function useShipSubcontractMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipMaterialRequest }) =>
      ManufacturingService.shipSubcontractMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Malzeme sevk edildi');
    },
    onError: (error) => showApiError(error, 'Malzeme sevk edilemedi'),
  });
}

export function useReceiveSubcontractProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: ReceiveProductRequest }) =>
      ManufacturingService.receiveSubcontractProduct(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Ürün teslim alındı');
    },
    onError: (error) => showApiError(error, 'Ürün teslim alınamadı'),
  });
}

export function useCompleteSubcontractOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.completeSubcontractOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Fason iş emri tamamlandı');
    },
    onError: (error) => showApiError(error, 'Fason iş emri tamamlanamadı'),
  });
}

export function useCloseSubcontractOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.closeSubcontractOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Fason iş emri kapatıldı');
    },
    onError: (error) => showApiError(error, 'Fason iş emri kapatılamadı'),
  });
}

export function useCancelSubcontractOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.cancelSubcontractOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrder(id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.subcontractOrders });
      showSuccess('Fason iş emri iptal edildi');
    },
    onError: (error) => showApiError(error, 'Fason iş emri iptal edilemedi'),
  });
}

// =====================================
// KPI DASHBOARD HOOKS
// =====================================

// KPI Definitions
export function useKpiDefinitions() {
  return useQuery<KpiDefinitionListDto[]>({
    queryKey: manufacturingKeys.kpiDefinitions,
    queryFn: () => ManufacturingService.getKpiDefinitions(),
    ...queryOptions.static(),
  });
}

export function useKpiDefinition(id: string) {
  return useQuery<KpiDefinitionDto>({
    queryKey: manufacturingKeys.kpiDefinition(id),
    queryFn: () => ManufacturingService.getKpiDefinition(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateKpiDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKpiDefinitionRequest) => ManufacturingService.createKpiDefinition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.kpiDefinitions });
      showSuccess('KPI tanımı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'KPI tanımı oluşturulamadı'),
  });
}

export function useUpdateKpiDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKpiDefinitionRequest }) =>
      ManufacturingService.updateKpiDefinition(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.kpiDefinition(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.kpiDefinitions });
      showSuccess('KPI tanımı güncellendi');
    },
    onError: (error) => showApiError(error, 'KPI tanımı güncellenemedi'),
  });
}

export function useDeleteKpiDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteKpiDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.kpiDefinitions });
      showSuccess('KPI tanımı silindi');
    },
    onError: (error) => showApiError(error, 'KPI tanımı silinemedi'),
  });
}

// KPI Values
export function useKpiValues(filters?: KpiValueFilterParams) {
  return useQuery<KpiValueListDto[]>({
    queryKey: ['manufacturing', 'kpi', 'values', { filters }],
    queryFn: () => ManufacturingService.getKpiValues(filters),
    ...queryOptions.list(),
  });
}

export function useLatestKpiValue(kpiDefinitionId: string) {
  return useQuery<KpiValueDto>({
    queryKey: ['manufacturing', 'kpi', 'values', 'latest', kpiDefinitionId],
    queryFn: () => ManufacturingService.getLatestKpiValue(kpiDefinitionId),
    ...queryOptions.detail({ enabled: !!kpiDefinitionId }),
  });
}

export function useCreateKpiValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKpiValueRequest) =>
      ManufacturingService.createKpiValue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing', 'kpi', 'values'] });
      showSuccess('KPI değeri kaydedildi');
    },
    onError: (error) => showApiError(error, 'KPI değeri kaydedilemedi'),
  });
}

export function useKpiTrendData(kpiId: string, startDate: string, endDate: string) {
  return useQuery<KpiTrendDataDto>({
    queryKey: manufacturingKeys.kpiTrend(kpiId, startDate, endDate),
    queryFn: () => ManufacturingService.getKpiTrendData(kpiId, startDate, endDate),
    ...queryOptions.detail({ enabled: !!kpiId && !!startDate && !!endDate }),
  });
}

// KPI Targets
export function useCreateKpiTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKpiTargetRequest) =>
      ManufacturingService.createKpiTarget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.kpiDefinitions });
      showSuccess('KPI hedefi belirlendi');
    },
    onError: (error) => showApiError(error, 'KPI hedefi belirlenemedi'),
  });
}

export function useApproveKpiTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.approveKpiTarget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.kpiDefinitions });
      showSuccess('KPI hedefi onaylandı');
    },
    onError: (error) => showApiError(error, 'KPI hedefi onaylanamadı'),
  });
}

// Dashboard Configurations
export function useDashboardConfigurations() {
  return useQuery<DashboardConfigurationListDto[]>({
    queryKey: manufacturingKeys.dashboardConfigs,
    queryFn: () => ManufacturingService.getDashboardConfigurations(),
    ...queryOptions.static(),
  });
}

export function useDashboardConfiguration(id: string) {
  return useQuery<DashboardConfigurationDto>({
    queryKey: manufacturingKeys.dashboardConfig(id),
    queryFn: () => ManufacturingService.getDashboardConfiguration(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateDashboardConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDashboardConfigurationRequest) => ManufacturingService.createDashboardConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.dashboardConfigs });
      showSuccess('Dashboard yapılandırması oluşturuldu');
    },
    onError: (error) => showApiError(error, 'Dashboard yapılandırması oluşturulamadı'),
  });
}

export function useUpdateDashboardConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDashboardConfigurationRequest }) =>
      ManufacturingService.updateDashboardConfiguration(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.dashboardConfig(variables.id) });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.dashboardConfigs });
      showSuccess('Dashboard yapılandırması güncellendi');
    },
    onError: (error) => showApiError(error, 'Dashboard yapılandırması güncellenemedi'),
  });
}

export function useDeleteDashboardConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.deleteDashboardConfiguration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.dashboardConfigs });
      showSuccess('Dashboard yapılandırması silindi');
    },
    onError: (error) => showApiError(error, 'Dashboard yapılandırması silinemedi'),
  });
}

export function useCreateDashboardWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDashboardWidgetRequest) =>
      ManufacturingService.createDashboardWidget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.dashboardConfigs });
      showSuccess('Widget eklendi');
    },
    onError: (error) => showApiError(error, 'Widget eklenemedi'),
  });
}

// OEE Records
export function useOeeRecords(filters?: OeeFilterParams) {
  return useQuery<OeeRecordListDto[]>({
    queryKey: [...manufacturingKeys.oeeRecords, { filters }],
    queryFn: () => ManufacturingService.getOeeRecords(filters),
    ...queryOptions.list(),
  });
}

export function useOeeRecord(id: string) {
  return useQuery<OeeRecordDto>({
    queryKey: manufacturingKeys.oeeRecord(id),
    queryFn: () => ManufacturingService.getOeeRecord(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

export function useCreateOeeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOeeRecordRequest) => ManufacturingService.createOeeRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.oeeRecords });
      showSuccess('OEE kaydı oluşturuldu');
    },
    onError: (error) => showApiError(error, 'OEE kaydı oluşturulamadı'),
  });
}

export function useValidateOeeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ManufacturingService.validateOeeRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.oeeRecords });
      showSuccess('OEE kaydı doğrulandı');
    },
    onError: (error) => showApiError(error, 'OEE kaydı doğrulanamadı'),
  });
}

export function useOeeSummary(startDate?: string, endDate?: string) {
  return useQuery<DashboardOeeSummaryDto>({
    queryKey: ['manufacturing', 'oee', 'summary', { startDate, endDate }],
    queryFn: () => ManufacturingService.getOeeSummary(startDate, endDate),
    ...queryOptions.detail(),
  });
}

// Production Performance
export function usePerformanceSummaries(filters?: PerformanceSummaryFilterParams) {
  return useQuery<ProductionPerformanceSummaryListDto[]>({
    queryKey: ['manufacturing', 'performance-summaries', { filters }],
    queryFn: () => ManufacturingService.getPerformanceSummaries(filters),
    ...queryOptions.list(),
  });
}

// =====================================
// MANUFACTURING DASHBOARD HOOKS
// =====================================

export function useManufacturingDashboard() {
  return useQuery({
    queryKey: ['manufacturing', 'dashboard'],
    queryFn: async () => {
      // Aggregate dashboard data from multiple sources
      const [productionOrders, maintenancePlans] = await Promise.all([
        ManufacturingService.getProductionOrders({ activeOnly: true }),
        ManufacturingService.getMaintenancePlans(),
      ]);

      const today = new Date().toISOString().split('T')[0];

      // Calculate stats
      const activeOrders = productionOrders.filter(o => o.status === 4 || o.status === 3); // InProgress or Released
      const todaysOrders = productionOrders.filter(o => {
        const startDate = new Date(o.plannedStartDate).toISOString().split('T')[0];
        return startDate === today;
      });
      const overdueOrders = productionOrders.filter(o => {
        const endDate = new Date(o.plannedEndDate);
        return endDate < new Date() && (o.status === 1 || o.status === 2 || o.status === 3 || o.status === 4);
      });
      const completedToday = productionOrders.filter(o => {
        if (o.status !== 5) return false; // Completed
        const completedDate = o.actualEndDate ? new Date(o.actualEndDate).toISOString().split('T')[0] : null;
        return completedDate === today;
      });

      // Generate alerts based on conditions
      const alerts: { severity: 'Critical' | 'Warning' | 'Info'; title: string; message: string }[] = [];
      if (overdueOrders.length > 0) {
        alerts.push({
          severity: 'Critical',
          title: 'Geciken Emirler',
          message: `${overdueOrders.length} adet üretim emri gecikmiş durumda`,
        });
      }

      // Upcoming maintenance
      const upcomingMaintenance = maintenancePlans
        .filter(p => {
          const dueDate = new Date(p.nextDueDate);
          const daysDiff = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff <= 7;
        })
        .slice(0, 5)
        .map(p => ({
          workCenterId: p.machineId,
          workCenterName: p.machineName,
          maintenanceType: p.maintenanceType,
          scheduledDate: p.nextDueDate,
        }));

      // Recent production orders
      const recentProductionOrders = productionOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          productName: o.productName,
          productCode: o.productCode || '',
          quantity: o.plannedQuantity,
          status: getProductionOrderStatusName(o.status),
          plannedStartDate: o.plannedStartDate,
          priority: o.priority,
        }));

      return {
        activeProductionOrders: activeOrders.length,
        todaysOrders: todaysOrders.length,
        overdueOrders: overdueOrders.length,
        completedToday: completedToday.length,
        oeePercentage: 85, // Placeholder - would come from OEE calculations
        qualityRate: 98, // Placeholder
        onTimeDeliveryRate: 92, // Placeholder
        capacityUtilization: 78, // Placeholder
        recentProductionOrders,
        alerts,
        upcomingMaintenance,
      };
    },
    ...queryOptions.realtime(),
  });
}

function getProductionOrderStatusName(status: number): string {
  const statusMap: Record<number, string> = {
    0: 'Draft',
    1: 'Planned',
    2: 'Approved',
    3: 'Released',
    4: 'InProgress',
    5: 'Completed',
    6: 'Closed',
    7: 'Cancelled',
  };
  return statusMap[status] || 'Unknown';
}

// =====================================
// ADDITIONAL SIMPLIFIED HOOKS
// =====================================

// NCR List Hook (simplified for quality management page)
export function useNCRs(filters?: { status?: NcrStatus; category?: NcrSource }) {
  return useQuery({
    queryKey: [...manufacturingKeys.ncrs, { filters }],
    queryFn: async () => {
      let ncrs: NonConformanceReportListDto[];
      if (filters?.status) {
        ncrs = await ManufacturingService.getNcrsByStatus(filters.status);
      } else if (filters?.category) {
        ncrs = await ManufacturingService.getNcrsBySource(filters.category);
      } else {
        ncrs = await ManufacturingService.getNcrs();
      }
      return ncrs.map((ncr: NonConformanceReportListDto) => ({
        id: ncr.id,
        ncrNumber: ncr.ncrNumber,
        title: ncr.title,
        category: ncr.source as 'Material' | 'Process' | 'Product' | 'Supplier' | 'Customer',
        status: ncr.status as 'Open' | 'UnderReview' | 'Resolved' | 'Closed',
        severity: ncr.severity,
        reportedDate: ncr.reportedAt,
      }));
    },
    ...queryOptions.list(),
  });
}

// CAPA List Hook (simplified for quality management page)
export function useCAPAs(filters?: { status?: CapaStatus; type?: CapaType }) {
  return useQuery({
    queryKey: [...manufacturingKeys.capas, { filters }],
    queryFn: async () => {
      let capas: CorrectivePreventiveActionListDto[];
      if (filters?.status) {
        capas = await ManufacturingService.getCapasByStatus(filters.status);
      } else if (filters?.type) {
        capas = await ManufacturingService.getCapasByType(filters.type);
      } else {
        capas = await ManufacturingService.getCapas();
      }
      return capas.map((capa: CorrectivePreventiveActionListDto) => ({
        id: capa.id,
        capaNumber: capa.capaNumber,
        title: capa.title,
        type: capa.type as 'Corrective' | 'Preventive',
        status: capa.status as 'Draft' | 'Open' | 'InProgress' | 'PendingVerification' | 'Closed',
        targetDate: capa.dueDate,
        completionRate: capa.progress,
      }));
    },
    ...queryOptions.list(),
  });
}

// Maintenance Orders Hook (for maintenance page)
export function useMaintenanceOrders(filters?: { status?: MaintenanceRecordStatus; maintenanceType?: MaintenanceType }) {
  return useQuery({
    queryKey: [...manufacturingKeys.maintenanceRecords, { filters }],
    queryFn: async () => {
      const records = await ManufacturingService.getMaintenanceRecords(filters as MaintenanceRecordFilterParams);
      return records.map((record: MaintenanceRecordListDto) => ({
        id: record.id,
        orderNumber: record.recordNumber,
        workCenterId: record.machineId,
        workCenterName: record.machineName,
        maintenanceType: record.maintenanceType,
        status: record.status,
        description: record.planName,
        scheduledDate: record.scheduledDate,
        completedDate: record.completedAt,
      }));
    },
    ...queryOptions.list(),
  });
}

// Product Costs Hook (for cost accounting page)
export function useProductCosts(filters?: CostRecordFilterParams) {
  return useQuery({
    queryKey: [...manufacturingKeys.costRecords, 'products', { filters }],
    queryFn: async () => {
      const records = await ManufacturingService.getProductionCostRecords(filters);
      // Aggregate by product
      const productMap = new Map<string, {
        productId: string;
        productName: string;
        productCode: string;
        materialCost: number;
        laborCost: number;
        overheadCost: number;
        totalCost: number;
        lastCalculatedAt?: string;
      }>();

      records.forEach((record: ProductionCostRecordListDto) => {
        const existing = productMap.get(record.productId);
        if (!existing || new Date(record.createdAt) > new Date(existing.lastCalculatedAt || '')) {
          productMap.set(record.productId, {
            productId: record.productId,
            productName: record.productName,
            productCode: record.productId.substring(0, 8),
            materialCost: record.totalDirectMaterialCost,
            laborCost: record.totalDirectLaborCost,
            overheadCost: record.totalOverheadCost,
            totalCost: record.totalCost,
            lastCalculatedAt: record.createdAt,
          });
        }
      });

      return Array.from(productMap.values());
    },
    ...queryOptions.list(),
  });
}
