import { ApiService } from '../api-service';
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
  MpsLineDto,
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
  MaterialReservationAllocationDto,
  MaterialReservationIssueDto,
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
  ProductionCostAllocationDto,
  CostJournalEntryDto,
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
  MaintenanceTaskDto,
  CreateMaintenanceTaskRequest,
  UpdateMaintenanceTaskRequest,
  MaintenanceRecordListDto,
  MaintenanceRecordDto,
  CreateMaintenanceRecordRequest,
  UpdateMaintenanceRecordRequest,
  StartMaintenanceRecordRequest,
  CompleteMaintenanceRecordRequest,
  AddMaintenanceRecordSparePartRequest,
  MaintenanceRecordSparePartDto,
  SparePartListDto,
  SparePartDto,
  CreateSparePartRequest,
  UpdateSparePartRequest,
  MachineCounterListDto,
  MachineCounterDto,
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
  NcrContainmentActionDto,
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
  CapaTaskDto,
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
  SubcontractMaterialDto,
  SubcontractShipmentDto,
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
  KpiTargetDto,
  CreateKpiTargetRequest,
  DashboardConfigurationListDto,
  DashboardConfigurationDto,
  CreateDashboardConfigurationRequest,
  UpdateDashboardConfigurationRequest,
  CreateDashboardWidgetRequest,
  DashboardWidgetDto,
  OeeRecordListDto,
  OeeRecordDto,
  CreateOeeRecordRequest,
  DashboardOeeSummaryDto,
  ProductionPerformanceSummaryListDto,
  DashboardKpiCardDto,
  KpiValueFilterParams,
  OeeFilterParams,
  PerformanceSummaryFilterParams,
} from './manufacturing.types';

// =====================================
// MANUFACTURING API SERVICE
// =====================================

export class ManufacturingService {
  /**
   * Build Manufacturing module API path
   * @param resource - Resource path (e.g., 'billofmaterials', 'productionorders')
   * @returns Manufacturing API path (without /api prefix as it's in baseURL)
   *
   * Manufacturing module uses: /api/manufacturing/{resource}
   * Tenant context is handled by backend middleware via X-Tenant-Code header (not in URL)
   */
  private static getPath(resource: string): string {
    return `/manufacturing/${resource}`;
  }

  // =====================================
  // BILL OF MATERIALS (BOM)
  // =====================================

  /**
   * Get all BOMs with optional filters
   */
  static async getBillOfMaterials(filters?: BomFilterParams): Promise<BillOfMaterialListDto[]> {
    return ApiService.get<BillOfMaterialListDto[]>(this.getPath('billofmaterials'), {
      params: filters,
    });
  }

  /**
   * Get BOM by ID
   */
  static async getBillOfMaterial(id: string): Promise<BillOfMaterialDto> {
    return ApiService.get<BillOfMaterialDto>(this.getPath(`billofmaterials/${id}`));
  }

  /**
   * Create a new BOM
   */
  static async createBillOfMaterial(data: CreateBillOfMaterialRequest): Promise<BillOfMaterialDto> {
    return ApiService.post<BillOfMaterialDto>(this.getPath('billofmaterials'), data);
  }

  /**
   * Update a BOM
   */
  static async updateBillOfMaterial(id: string, data: UpdateBillOfMaterialRequest): Promise<BillOfMaterialDto> {
    return ApiService.put<BillOfMaterialDto>(this.getPath(`billofmaterials/${id}`), data);
  }

  /**
   * Approve a BOM
   */
  static async approveBillOfMaterial(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`billofmaterials/${id}/approve`), {});
  }

  /**
   * Activate a BOM
   */
  static async activateBillOfMaterial(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`billofmaterials/${id}/activate`), {});
  }

  /**
   * Delete a BOM
   */
  static async deleteBillOfMaterial(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`billofmaterials/${id}`));
  }

  // =====================================
  // PRODUCTION ORDERS
  // =====================================

  /**
   * Get all production orders with optional filters
   */
  static async getProductionOrders(filters?: ProductionOrderFilterParams): Promise<ProductionOrderListDto[]> {
    return ApiService.get<ProductionOrderListDto[]>(this.getPath('productionorders'), {
      params: filters,
    });
  }

  /**
   * Get production order by ID
   */
  static async getProductionOrder(id: string): Promise<ProductionOrderDto> {
    return ApiService.get<ProductionOrderDto>(this.getPath(`productionorders/${id}`));
  }

  /**
   * Create a new production order
   */
  static async createProductionOrder(data: CreateProductionOrderRequest): Promise<ProductionOrderListDto> {
    return ApiService.post<ProductionOrderListDto>(this.getPath('productionorders'), data);
  }

  /**
   * Update an existing production order
   */
  static async updateProductionOrder(id: string, data: Partial<CreateProductionOrderRequest>): Promise<ProductionOrderDto> {
    return ApiService.put<ProductionOrderDto>(this.getPath(`productionorders/${id}`), data);
  }

  /**
   * Delete a production order
   */
  static async deleteProductionOrder(id: string): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(this.getPath(`productionorders/${id}`));
  }

  /**
   * Approve a production order
   */
  static async approveProductionOrder(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`productionorders/${id}/approve`), {});
  }

  /**
   * Release a production order
   */
  static async releaseProductionOrder(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`productionorders/${id}/release`), {});
  }

  /**
   * Start a production order
   */
  static async startProductionOrder(id: string, data?: StartProductionOrderRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`productionorders/${id}/start`), data || {});
  }

  /**
   * Complete a production order
   */
  static async completeProductionOrder(id: string, data: CompleteProductionOrderRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`productionorders/${id}/complete`), data);
  }

  /**
   * Cancel a production order
   */
  static async cancelProductionOrder(id: string, reason: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`productionorders/${id}/cancel`), { reason });
  }

  // =====================================
  // WORK CENTERS
  // =====================================

  /**
   * Get all work centers with optional filters
   */
  static async getWorkCenters(filters?: WorkCenterFilterParams): Promise<WorkCenterListDto[]> {
    return ApiService.get<WorkCenterListDto[]>(this.getPath('workcenters'), {
      params: filters,
    });
  }

  /**
   * Get work center by ID
   */
  static async getWorkCenter(id: string): Promise<WorkCenterDto> {
    return ApiService.get<WorkCenterDto>(this.getPath(`workcenters/${id}`));
  }

  /**
   * Create a new work center
   */
  static async createWorkCenter(data: CreateWorkCenterRequest): Promise<WorkCenterDto> {
    return ApiService.post<WorkCenterDto>(this.getPath('workcenters'), data);
  }

  /**
   * Update a work center
   */
  static async updateWorkCenter(id: string, data: UpdateWorkCenterRequest): Promise<WorkCenterDto> {
    return ApiService.put<WorkCenterDto>(this.getPath(`workcenters/${id}`), data);
  }

  /**
   * Delete a work center
   */
  static async deleteWorkCenter(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`workcenters/${id}`));
  }

  /**
   * Activate a work center
   */
  static async activateWorkCenter(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`workcenters/${id}/activate`), {});
  }

  /**
   * Deactivate a work center
   */
  static async deactivateWorkCenter(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`workcenters/${id}/deactivate`), {});
  }

  // =====================================
  // ROUTINGS
  // =====================================

  /**
   * Get all routings with optional filters
   */
  static async getRoutings(filters?: RoutingFilterParams): Promise<RoutingListDto[]> {
    return ApiService.get<RoutingListDto[]>(this.getPath('routings'), {
      params: filters,
    });
  }

  /**
   * Get routing by ID
   */
  static async getRouting(id: string): Promise<RoutingDto> {
    return ApiService.get<RoutingDto>(this.getPath(`routings/${id}`));
  }

  /**
   * Create a new routing
   */
  static async createRouting(data: CreateRoutingRequest): Promise<RoutingDto> {
    return ApiService.post<RoutingDto>(this.getPath('routings'), data);
  }

  /**
   * Update a routing
   */
  static async updateRouting(id: string, data: UpdateRoutingRequest): Promise<RoutingDto> {
    return ApiService.put<RoutingDto>(this.getPath(`routings/${id}`), data);
  }

  /**
   * Approve a routing
   */
  static async approveRouting(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`routings/${id}/approve`), {});
  }

  /**
   * Activate a routing
   */
  static async activateRouting(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`routings/${id}/activate`), {});
  }

  /**
   * Delete a routing
   */
  static async deleteRouting(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`routings/${id}`));
  }

  // =====================================
  // MASTER PRODUCTION SCHEDULES (MPS)
  // =====================================

  /**
   * Get all MPS with optional filters
   */
  static async getMasterProductionSchedules(filters?: MpsFilterParams): Promise<MasterProductionScheduleListDto[]> {
    return ApiService.get<MasterProductionScheduleListDto[]>(this.getPath('masterproductionschedules'), {
      params: filters,
    });
  }

  /**
   * Get MPS by ID
   */
  static async getMasterProductionSchedule(id: string): Promise<MasterProductionScheduleDto> {
    return ApiService.get<MasterProductionScheduleDto>(this.getPath(`masterproductionschedules/${id}`));
  }

  /**
   * Create a new MPS
   */
  static async createMasterProductionSchedule(data: CreateMasterProductionScheduleRequest): Promise<MasterProductionScheduleDto> {
    return ApiService.post<MasterProductionScheduleDto>(this.getPath('masterproductionschedules'), data);
  }

  /**
   * Update an MPS
   */
  static async updateMasterProductionSchedule(id: string, data: UpdateMasterProductionScheduleRequest): Promise<MasterProductionScheduleDto> {
    return ApiService.put<MasterProductionScheduleDto>(this.getPath(`masterproductionschedules/${id}`), data);
  }

  /**
   * Approve an MPS
   */
  static async approveMasterProductionSchedule(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`masterproductionschedules/${id}/approve`), {});
  }

  /**
   * Activate an MPS
   */
  static async activateMasterProductionSchedule(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`masterproductionschedules/${id}/activate`), {});
  }

  /**
   * Delete an MPS
   */
  static async deleteMasterProductionSchedule(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`masterproductionschedules/${id}`));
  }

  /**
   * Get MPS lines with optional filters
   */
  static async getMpsLines(filters?: MpsLineFilterParams): Promise<MpsLineListDto[]> {
    return ApiService.get<MpsLineListDto[]>(this.getPath('masterproductionschedules/lines'), {
      params: filters,
    });
  }

  /**
   * Add a line to MPS
   */
  static async addMpsLine(scheduleId: string, data: AddMpsLineRequest): Promise<MpsLineDto> {
    return ApiService.post<MpsLineDto>(this.getPath(`masterproductionschedules/${scheduleId}/lines`), data);
  }

  /**
   * Update an MPS line
   */
  static async updateMpsLine(scheduleId: string, lineId: string, data: UpdateMpsLineRequest): Promise<MpsLineDto> {
    return ApiService.put<MpsLineDto>(this.getPath(`masterproductionschedules/${scheduleId}/lines/${lineId}`), data);
  }

  /**
   * Record actual production for an MPS line
   */
  static async recordMpsActuals(scheduleId: string, lineId: string, data: RecordActualsRequest): Promise<MpsLineDto> {
    return ApiService.post<MpsLineDto>(this.getPath(`masterproductionschedules/${scheduleId}/lines/${lineId}/actuals`), data);
  }

  /**
   * Delete an MPS line
   */
  static async deleteMpsLine(scheduleId: string, lineId: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`masterproductionschedules/${scheduleId}/lines/${lineId}`));
  }

  /**
   * Query Available-to-Promise (ATP)
   */
  static async queryAtp(productId: string, date: string): Promise<AtpQueryResponse> {
    return ApiService.get<AtpQueryResponse>(this.getPath('masterproductionschedules/atp'), {
      params: { productId, date },
    });
  }

  // =====================================
  // MATERIAL RESERVATIONS
  // =====================================

  /**
   * Get all material reservations
   */
  static async getMaterialReservations(): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath('materialreservations'));
  }

  /**
   * Get material reservation by ID
   */
  static async getMaterialReservation(id: string): Promise<MaterialReservationDto> {
    return ApiService.get<MaterialReservationDto>(this.getPath(`materialreservations/${id}`));
  }

  /**
   * Get active material reservations
   */
  static async getActiveMaterialReservations(): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath('materialreservations/active'));
  }

  /**
   * Get material reservations by status
   */
  static async getMaterialReservationsByStatus(status: ReservationStatus): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath(`materialreservations/by-status/${status}`));
  }

  /**
   * Get material reservations by product
   */
  static async getMaterialReservationsByProduct(productId: string): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath(`materialreservations/by-product/${productId}`));
  }

  /**
   * Get material reservations by production order
   */
  static async getMaterialReservationsByProductionOrder(productionOrderId: string): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath(`materialreservations/by-production-order/${productionOrderId}`));
  }

  /**
   * Get material reservations by warehouse
   */
  static async getMaterialReservationsByWarehouse(warehouseId: string): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath(`materialreservations/by-warehouse/${warehouseId}`));
  }

  /**
   * Get urgent material reservations
   */
  static async getUrgentMaterialReservations(): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath('materialreservations/urgent'));
  }

  /**
   * Get material reservations pending approval
   */
  static async getPendingApprovalMaterialReservations(): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath('materialreservations/pending-approval'));
  }

  /**
   * Get material reservations by required date range
   */
  static async getMaterialReservationsByDateRange(startDate: string, endDate: string): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath('materialreservations/by-required-date-range'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Get material reservations by lot number
   */
  static async getMaterialReservationsByLot(lotNumber: string): Promise<MaterialReservationListDto[]> {
    return ApiService.get<MaterialReservationListDto[]>(this.getPath(`materialreservations/by-lot/${lotNumber}`));
  }

  /**
   * Get material reservation summary
   */
  static async getMaterialReservationSummary(): Promise<MaterialReservationSummaryDto> {
    return ApiService.get<MaterialReservationSummaryDto>(this.getPath('materialreservations/summary'));
  }

  /**
   * Get product reservation summary
   */
  static async getProductReservationSummary(productId: string): Promise<ProductReservationSummaryDto> {
    return ApiService.get<ProductReservationSummaryDto>(this.getPath(`materialreservations/summary/by-product/${productId}`));
  }

  /**
   * Create a material reservation
   */
  static async createMaterialReservation(data: CreateMaterialReservationRequest): Promise<MaterialReservationListDto> {
    return ApiService.post<MaterialReservationListDto>(this.getPath('materialreservations'), data);
  }

  /**
   * Update a material reservation
   */
  static async updateMaterialReservation(id: string, data: UpdateMaterialReservationRequest): Promise<MaterialReservationListDto> {
    return ApiService.put<MaterialReservationListDto>(this.getPath(`materialreservations/${id}`), data);
  }

  /**
   * Approve a material reservation
   */
  static async approveMaterialReservation(id: string, data?: ApproveMaterialReservationRequest): Promise<MaterialReservationListDto> {
    return ApiService.post<MaterialReservationListDto>(this.getPath(`materialreservations/${id}/approve`), data || {});
  }

  /**
   * Allocate material to a reservation
   */
  static async allocateMaterial(id: string, data: AllocateMaterialRequest): Promise<MaterialReservationAllocationDto> {
    return ApiService.post<MaterialReservationAllocationDto>(this.getPath(`materialreservations/${id}/allocate`), data);
  }

  /**
   * Issue material from a reservation
   */
  static async issueMaterial(id: string, data: IssueMaterialRequest): Promise<MaterialReservationIssueDto> {
    return ApiService.post<MaterialReservationIssueDto>(this.getPath(`materialreservations/${id}/issue`), data);
  }

  /**
   * Return material to a reservation
   */
  static async returnMaterial(id: string, data: ReturnMaterialRequest): Promise<MaterialReservationIssueDto> {
    return ApiService.post<MaterialReservationIssueDto>(this.getPath(`materialreservations/${id}/return`), data);
  }

  /**
   * Cancel an allocation
   */
  static async cancelAllocation(reservationId: string, allocationId: string, reason?: string): Promise<MaterialReservationListDto> {
    return ApiService.post<MaterialReservationListDto>(
      this.getPath(`materialreservations/${reservationId}/allocations/${allocationId}/cancel`),
      {},
      { params: { reason } }
    );
  }

  /**
   * Complete a material reservation
   */
  static async completeMaterialReservation(id: string): Promise<MaterialReservationListDto> {
    return ApiService.post<MaterialReservationListDto>(this.getPath(`materialreservations/${id}/complete`), {});
  }

  /**
   * Cancel a material reservation
   */
  static async cancelMaterialReservation(id: string, reason?: string): Promise<MaterialReservationListDto> {
    return ApiService.post<MaterialReservationListDto>(
      this.getPath(`materialreservations/${id}/cancel`),
      {},
      { params: { reason } }
    );
  }

  // =====================================
  // MRP PLANS
  // =====================================

  /**
   * Get all MRP plans with optional filters
   */
  static async getMrpPlans(filters?: MrpPlanFilterParams): Promise<MrpPlanListDto[]> {
    return ApiService.get<MrpPlanListDto[]>(this.getPath('mrpplans'), {
      params: filters,
    });
  }

  /**
   * Get MRP plan by ID
   */
  static async getMrpPlan(id: string): Promise<MrpPlanDto> {
    return ApiService.get<MrpPlanDto>(this.getPath(`mrpplans/${id}`));
  }

  /**
   * Create a new MRP plan
   */
  static async createMrpPlan(data: CreateMrpPlanRequest): Promise<MrpPlanDto> {
    return ApiService.post<MrpPlanDto>(this.getPath('mrpplans'), data);
  }

  /**
   * Execute an MRP plan
   */
  static async executeMrpPlan(id: string, data?: ExecuteMrpPlanRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`mrpplans/${id}/execute`), data || {});
  }

  /**
   * Approve an MRP plan
   */
  static async approveMrpPlan(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`mrpplans/${id}/approve`), {});
  }

  /**
   * Delete an MRP plan
   */
  static async deleteMrpPlan(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`mrpplans/${id}`));
  }

  /**
   * Get planned orders with optional filters
   */
  static async getPlannedOrders(filters?: PlannedOrderFilterParams): Promise<PlannedOrderListDto[]> {
    return ApiService.get<PlannedOrderListDto[]>(this.getPath('mrpplans/planned-orders'), {
      params: filters,
    });
  }

  /**
   * Confirm a planned order
   */
  static async confirmPlannedOrder(planId: string, orderId: string, data?: ConfirmPlannedOrderRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`mrpplans/${planId}/planned-orders/${orderId}/confirm`), data || {});
  }

  /**
   * Release a planned order
   */
  static async releasePlannedOrder(planId: string, orderId: string, data?: ReleasePlannedOrderRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`mrpplans/${planId}/planned-orders/${orderId}/release`), data || {});
  }

  /**
   * Convert a planned order to actual order
   */
  static async convertPlannedOrder(planId: string, orderId: string, data: ConvertPlannedOrderRequest): Promise<{ message: string; convertedOrderId: string }> {
    return ApiService.post<{ message: string; convertedOrderId: string }>(
      this.getPath(`mrpplans/${planId}/planned-orders/${orderId}/convert`),
      data
    );
  }

  /**
   * Get MRP exceptions
   */
  static async getMrpExceptions(planId?: string, unresolvedOnly?: boolean): Promise<MrpExceptionDto[]> {
    return ApiService.get<MrpExceptionDto[]>(this.getPath('mrpplans/exceptions'), {
      params: { planId, unresolvedOnly },
    });
  }

  /**
   * Resolve an MRP exception
   */
  static async resolveMrpException(planId: string, exceptionId: string, data: ResolveMrpExceptionRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(
      this.getPath(`mrpplans/${planId}/exceptions/${exceptionId}/resolve`),
      data
    );
  }

  // =====================================
  // QUALITY INSPECTIONS
  // =====================================

  /**
   * Get all quality inspections with optional filters
   */
  static async getQualityInspections(filters?: QualityInspectionFilterParams): Promise<QualityInspectionListDto[]> {
    return ApiService.get<QualityInspectionListDto[]>(this.getPath('qualityinspections'), {
      params: filters,
    });
  }

  /**
   * Get quality inspection by ID
   */
  static async getQualityInspection(id: string): Promise<QualityInspectionDto> {
    return ApiService.get<QualityInspectionDto>(this.getPath(`qualityinspections/${id}`));
  }

  /**
   * Create a new quality inspection
   */
  static async createQualityInspection(data: CreateQualityInspectionRequest): Promise<QualityInspectionDto> {
    return ApiService.post<QualityInspectionDto>(this.getPath('qualityinspections'), data);
  }

  /**
   * Start a quality inspection
   */
  static async startQualityInspection(id: string, data?: StartInspectionRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`qualityinspections/${id}/start`), data || {});
  }

  /**
   * Record inspection result
   */
  static async recordInspectionResult(id: string, data: RecordInspectionResultRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`qualityinspections/${id}/result`), data);
  }

  /**
   * Record a non-conformance
   */
  static async recordNonConformance(id: string, data: RecordNonConformanceRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`qualityinspections/${id}/nonconformance`), data);
  }

  /**
   * Set disposition for an inspection
   */
  static async setInspectionDisposition(id: string, data: SetDispositionRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`qualityinspections/${id}/disposition`), data);
  }

  /**
   * Complete a quality inspection
   */
  static async completeQualityInspection(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`qualityinspections/${id}/complete`), {});
  }

  /**
   * Get open quality inspections
   */
  static async getOpenQualityInspections(): Promise<QualityInspectionListDto[]> {
    return ApiService.get<QualityInspectionListDto[]>(this.getPath('qualityinspections/open'));
  }

  /**
   * Get inspections with non-conformances
   */
  static async getNonConformanceInspections(): Promise<QualityInspectionListDto[]> {
    return ApiService.get<QualityInspectionListDto[]>(this.getPath('qualityinspections/nonconformance'));
  }

  // =====================================
  // CAPACITY PLANS
  // =====================================

  /**
   * Get all capacity plans with optional filters
   */
  static async getCapacityPlans(filters?: CapacityPlanFilterParams): Promise<CapacityPlanListDto[]> {
    return ApiService.get<CapacityPlanListDto[]>(this.getPath('capacityplans'), {
      params: filters,
    });
  }

  /**
   * Get capacity plan by ID
   */
  static async getCapacityPlan(id: string): Promise<CapacityPlanDto> {
    return ApiService.get<CapacityPlanDto>(this.getPath(`capacityplans/${id}`));
  }

  /**
   * Create a new capacity plan
   */
  static async createCapacityPlan(data: CreateCapacityPlanRequest): Promise<CapacityPlanDto> {
    return ApiService.post<CapacityPlanDto>(this.getPath('capacityplans'), data);
  }

  /**
   * Execute a capacity plan
   */
  static async executeCapacityPlan(id: string, data?: ExecuteCapacityPlanRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`capacityplans/${id}/execute`), data || {});
  }

  /**
   * Approve a capacity plan
   */
  static async approveCapacityPlan(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`capacityplans/${id}/approve`), {});
  }

  /**
   * Cancel a capacity plan
   */
  static async cancelCapacityPlan(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`capacityplans/${id}/cancel`), {});
  }

  /**
   * Delete a capacity plan
   */
  static async deleteCapacityPlan(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`capacityplans/${id}`));
  }

  /**
   * Get capacity requirements with optional filters
   */
  static async getCapacityRequirements(filters?: CapacityRequirementFilterParams): Promise<CapacityRequirementDto[]> {
    return ApiService.get<CapacityRequirementDto[]>(this.getPath('capacityplans/requirements'), {
      params: filters,
    });
  }

  /**
   * Get capacity exceptions for a plan
   */
  static async getCapacityExceptions(planId: string, onlyUnresolved?: boolean): Promise<CapacityExceptionDto[]> {
    return ApiService.get<CapacityExceptionDto[]>(this.getPath(`capacityplans/${planId}/exceptions`), {
      params: { onlyUnresolved },
    });
  }

  /**
   * Resolve a capacity exception
   */
  static async resolveCapacityException(planId: string, exceptionId: string, data: ResolveCapacityExceptionRequest): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(
      this.getPath(`capacityplans/${planId}/exceptions/${exceptionId}/resolve`),
      data
    );
  }

  /**
   * Get work center capacity overview
   */
  static async getWorkCenterCapacityOverview(
    workCenterIds: string[],
    startDate: string,
    endDate: string
  ): Promise<WorkCenterCapacityOverviewDto[]> {
    return ApiService.get<WorkCenterCapacityOverviewDto[]>(this.getPath('capacityplans/workcenter-overview'), {
      params: { workCenterIds, startDate, endDate },
    });
  }

  // =====================================
  // COST ACCOUNTING - PRODUCTION COST RECORDS
  // =====================================

  /**
   * Get production cost records with optional filters
   */
  static async getProductionCostRecords(filters?: CostRecordFilterParams): Promise<ProductionCostRecordListDto[]> {
    return ApiService.get<ProductionCostRecordListDto[]>(this.getPath('cost-accounting/records'), {
      params: filters,
    });
  }

  /**
   * Get production cost record by ID
   */
  static async getProductionCostRecord(id: string): Promise<ProductionCostRecordDto> {
    return ApiService.get<ProductionCostRecordDto>(this.getPath(`cost-accounting/records/${id}`));
  }

  /**
   * Create a production cost record
   */
  static async createProductionCostRecord(data: CreateProductionCostRecordRequest): Promise<ProductionCostRecordDto> {
    return ApiService.post<ProductionCostRecordDto>(this.getPath('cost-accounting/records'), data);
  }

  /**
   * Set direct costs for a production cost record
   */
  static async setProductionDirectCosts(id: string, data: SetProductionDirectCostsRequest): Promise<{ message: string }> {
    return ApiService.put<{ message: string }>(this.getPath(`cost-accounting/records/${id}/direct-costs`), data);
  }

  /**
   * Set overhead costs for a production cost record
   */
  static async setOverheadCosts(id: string, data: SetOverheadCostsRequest): Promise<{ message: string }> {
    return ApiService.put<{ message: string }>(this.getPath(`cost-accounting/records/${id}/overhead-costs`), data);
  }

  /**
   * Set variances for a production cost record
   */
  static async setVariances(id: string, data: SetVariancesRequest): Promise<{ message: string }> {
    return ApiService.put<{ message: string }>(this.getPath(`cost-accounting/records/${id}/variances`), data);
  }

  /**
   * Finalize a production cost record
   */
  static async finalizeProductionCostRecord(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`cost-accounting/records/${id}/finalize`), {});
  }

  /**
   * Add cost allocation to a record
   */
  static async addCostAllocation(recordId: string, data: AddCostAllocationRequest): Promise<ProductionCostAllocationDto> {
    return ApiService.post<ProductionCostAllocationDto>(this.getPath(`cost-accounting/records/${recordId}/allocations`), data);
  }

  /**
   * Add journal entry to a record
   */
  static async addJournalEntry(recordId: string, data: AddJournalEntryRequest): Promise<CostJournalEntryDto> {
    return ApiService.post<CostJournalEntryDto>(this.getPath(`cost-accounting/records/${recordId}/journal-entries`), data);
  }

  /**
   * Post a journal entry
   */
  static async postJournalEntry(recordId: string, entryId: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`cost-accounting/records/${recordId}/journal-entries/${entryId}/post`), {});
  }

  /**
   * Delete a production cost record
   */
  static async deleteProductionCostRecord(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`cost-accounting/records/${id}`));
  }

  /**
   * Get cost summary
   */
  static async getCostSummary(year?: number, month?: number): Promise<CostSummaryDto> {
    return ApiService.get<CostSummaryDto>(this.getPath('cost-accounting/summary'), {
      params: { year, month },
    });
  }

  // =====================================
  // COST ACCOUNTING - COST CENTERS
  // =====================================

  /**
   * Get cost centers with optional filters
   */
  static async getCostCenters(filters?: CostCenterFilterParams): Promise<CostCenterListDto[]> {
    return ApiService.get<CostCenterListDto[]>(this.getPath('cost-accounting/cost-centers'), {
      params: filters,
    });
  }

  /**
   * Get cost center by ID
   */
  static async getCostCenter(id: string): Promise<CostCenterDto> {
    return ApiService.get<CostCenterDto>(this.getPath(`cost-accounting/cost-centers/${id}`));
  }

  /**
   * Create a cost center
   */
  static async createCostCenter(data: CreateCostCenterRequest): Promise<CostCenterDto> {
    return ApiService.post<CostCenterDto>(this.getPath('cost-accounting/cost-centers'), data);
  }

  /**
   * Update a cost center
   */
  static async updateCostCenter(id: string, data: UpdateCostCenterRequest): Promise<{ message: string }> {
    return ApiService.put<{ message: string }>(this.getPath(`cost-accounting/cost-centers/${id}`), data);
  }

  /**
   * Activate a cost center
   */
  static async activateCostCenter(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`cost-accounting/cost-centers/${id}/activate`), {});
  }

  /**
   * Deactivate a cost center
   */
  static async deactivateCostCenter(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`cost-accounting/cost-centers/${id}/deactivate`), {});
  }

  /**
   * Delete a cost center
   */
  static async deleteCostCenter(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`cost-accounting/cost-centers/${id}`));
  }

  // =====================================
  // COST ACCOUNTING - STANDARD COST CARDS
  // =====================================

  /**
   * Get standard cost cards with optional filters
   */
  static async getStandardCostCards(filters?: StandardCostFilterParams): Promise<StandardCostCardListDto[]> {
    return ApiService.get<StandardCostCardListDto[]>(this.getPath('cost-accounting/standard-costs'), {
      params: filters,
    });
  }

  /**
   * Get standard cost card by ID
   */
  static async getStandardCostCard(id: string): Promise<StandardCostCardDto> {
    return ApiService.get<StandardCostCardDto>(this.getPath(`cost-accounting/standard-costs/${id}`));
  }

  /**
   * Get current standard cost card for a product
   */
  static async getCurrentStandardCostCard(productId: string): Promise<StandardCostCardDto> {
    return ApiService.get<StandardCostCardDto>(this.getPath(`cost-accounting/standard-costs/product/${productId}/current`));
  }

  /**
   * Create a standard cost card
   */
  static async createStandardCostCard(data: CreateStandardCostCardRequest): Promise<StandardCostCardDto> {
    return ApiService.post<StandardCostCardDto>(this.getPath('cost-accounting/standard-costs'), data);
  }

  /**
   * Approve a standard cost card
   */
  static async approveStandardCostCard(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`cost-accounting/standard-costs/${id}/approve`), {});
  }

  /**
   * Set a standard cost card as current
   */
  static async setStandardCostCardAsCurrent(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`cost-accounting/standard-costs/${id}/set-current`), {});
  }

  /**
   * Delete a standard cost card
   */
  static async deleteStandardCostCard(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`cost-accounting/standard-costs/${id}`));
  }

  // =====================================
  // MAINTENANCE - PLANS
  // =====================================

  /**
   * Get all maintenance plans
   */
  static async getMaintenancePlans(): Promise<MaintenancePlanListDto[]> {
    return ApiService.get<MaintenancePlanListDto[]>(this.getPath('maintenance/plans'));
  }

  /**
   * Get active maintenance plans
   */
  static async getActiveMaintenancePlans(): Promise<MaintenancePlanListDto[]> {
    return ApiService.get<MaintenancePlanListDto[]>(this.getPath('maintenance/plans/active'));
  }

  /**
   * Get maintenance plans due
   */
  static async getDueMaintenancePlans(asOfDate?: string): Promise<MaintenancePlanListDto[]> {
    return ApiService.get<MaintenancePlanListDto[]>(this.getPath('maintenance/plans/due'), {
      params: { asOfDate },
    });
  }

  /**
   * Get overdue maintenance plans
   */
  static async getOverdueMaintenancePlans(asOfDate?: string): Promise<MaintenancePlanListDto[]> {
    return ApiService.get<MaintenancePlanListDto[]>(this.getPath('maintenance/plans/overdue'), {
      params: { asOfDate },
    });
  }

  /**
   * Get upcoming maintenance plans
   */
  static async getUpcomingMaintenancePlans(startDate: string, endDate: string): Promise<MaintenancePlanListDto[]> {
    return ApiService.get<MaintenancePlanListDto[]>(this.getPath('maintenance/plans/upcoming'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Get maintenance plan by ID
   */
  static async getMaintenancePlan(id: string): Promise<MaintenancePlanDto> {
    return ApiService.get<MaintenancePlanDto>(this.getPath(`maintenance/plans/${id}`));
  }

  /**
   * Create a maintenance plan
   */
  static async createMaintenancePlan(data: CreateMaintenancePlanRequest): Promise<MaintenancePlanDto> {
    return ApiService.post<MaintenancePlanDto>(this.getPath('maintenance/plans'), data);
  }

  /**
   * Update a maintenance plan
   */
  static async updateMaintenancePlan(id: string, data: UpdateMaintenancePlanRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`maintenance/plans/${id}`), data);
  }

  /**
   * Activate a maintenance plan
   */
  static async activateMaintenancePlan(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/plans/${id}/activate`), {});
  }

  /**
   * Suspend a maintenance plan
   */
  static async suspendMaintenancePlan(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/plans/${id}/suspend`), {});
  }

  /**
   * Approve a maintenance plan
   */
  static async approveMaintenancePlan(id: string, approvedBy: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/plans/${id}/approve`), {}, {
      params: { approvedBy },
    });
  }

  /**
   * Delete a maintenance plan
   */
  static async deleteMaintenancePlan(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`maintenance/plans/${id}`));
  }

  // =====================================
  // MAINTENANCE - TASKS
  // =====================================

  /**
   * Create a maintenance task
   */
  static async createMaintenanceTask(data: CreateMaintenanceTaskRequest): Promise<MaintenanceTaskDto> {
    return ApiService.post<MaintenanceTaskDto>(this.getPath('maintenance/tasks'), data);
  }

  /**
   * Update a maintenance task
   */
  static async updateMaintenanceTask(id: string, data: UpdateMaintenanceTaskRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`maintenance/tasks/${id}`), data);
  }

  /**
   * Delete a maintenance task
   */
  static async deleteMaintenanceTask(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`maintenance/tasks/${id}`));
  }

  // =====================================
  // MAINTENANCE - RECORDS
  // =====================================

  /**
   * Get maintenance records with optional filters
   */
  static async getMaintenanceRecords(filters?: MaintenanceRecordFilterParams): Promise<MaintenanceRecordListDto[]> {
    return ApiService.get<MaintenanceRecordListDto[]>(this.getPath('maintenance/records'), {
      params: filters,
    });
  }

  /**
   * Get pending maintenance records
   */
  static async getPendingMaintenanceRecords(): Promise<MaintenanceRecordListDto[]> {
    return ApiService.get<MaintenanceRecordListDto[]>(this.getPath('maintenance/records/pending'));
  }

  /**
   * Get maintenance record by ID
   */
  static async getMaintenanceRecord(id: string): Promise<MaintenanceRecordDto> {
    return ApiService.get<MaintenanceRecordDto>(this.getPath(`maintenance/records/${id}`));
  }

  /**
   * Create a maintenance record
   */
  static async createMaintenanceRecord(data: CreateMaintenanceRecordRequest): Promise<MaintenanceRecordDto> {
    return ApiService.post<MaintenanceRecordDto>(this.getPath('maintenance/records'), data);
  }

  /**
   * Update a maintenance record
   */
  static async updateMaintenanceRecord(id: string, data: UpdateMaintenanceRecordRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`maintenance/records/${id}`), data);
  }

  /**
   * Start a maintenance record
   */
  static async startMaintenanceRecord(id: string, data: StartMaintenanceRecordRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/records/${id}/start`), data);
  }

  /**
   * Complete a maintenance record
   */
  static async completeMaintenanceRecord(id: string, data: CompleteMaintenanceRecordRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/records/${id}/complete`), data);
  }

  /**
   * Approve a maintenance record
   */
  static async approveMaintenanceRecord(id: string, approvedBy: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/records/${id}/approve`), {}, {
      params: { approvedBy },
    });
  }

  /**
   * Cancel a maintenance record
   */
  static async cancelMaintenanceRecord(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/records/${id}/cancel`), {});
  }

  /**
   * Add spare part to maintenance record
   */
  static async addMaintenanceRecordSparePart(data: AddMaintenanceRecordSparePartRequest): Promise<MaintenanceRecordSparePartDto> {
    return ApiService.post<MaintenanceRecordSparePartDto>(this.getPath('maintenance/records/spare-parts'), data);
  }

  // =====================================
  // MAINTENANCE - SPARE PARTS
  // =====================================

  /**
   * Get all spare parts
   */
  static async getSpareParts(): Promise<SparePartListDto[]> {
    return ApiService.get<SparePartListDto[]>(this.getPath('maintenance/spare-parts'));
  }

  /**
   * Search spare parts
   */
  static async searchSpareParts(searchTerm: string): Promise<SparePartListDto[]> {
    return ApiService.get<SparePartListDto[]>(this.getPath('maintenance/spare-parts/search'), {
      params: { searchTerm },
    });
  }

  /**
   * Get spare part by ID
   */
  static async getSparePart(id: string): Promise<SparePartDto> {
    return ApiService.get<SparePartDto>(this.getPath(`maintenance/spare-parts/${id}`));
  }

  /**
   * Create a spare part
   */
  static async createSparePart(data: CreateSparePartRequest): Promise<SparePartDto> {
    return ApiService.post<SparePartDto>(this.getPath('maintenance/spare-parts'), data);
  }

  /**
   * Update a spare part
   */
  static async updateSparePart(id: string, data: UpdateSparePartRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`maintenance/spare-parts/${id}`), data);
  }

  /**
   * Activate a spare part
   */
  static async activateSparePart(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/spare-parts/${id}/activate`), {});
  }

  /**
   * Deactivate a spare part
   */
  static async deactivateSparePart(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/spare-parts/${id}/deactivate`), {});
  }

  /**
   * Delete a spare part
   */
  static async deleteSparePart(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`maintenance/spare-parts/${id}`));
  }

  // =====================================
  // MAINTENANCE - MACHINE COUNTERS
  // =====================================

  /**
   * Get machine counters for a machine
   */
  static async getMachineCounters(machineId: string): Promise<MachineCounterListDto[]> {
    return ApiService.get<MachineCounterListDto[]>(this.getPath(`maintenance/counters/machine/${machineId}`));
  }

  /**
   * Get critical machine counters
   */
  static async getCriticalMachineCounters(): Promise<MachineCounterListDto[]> {
    return ApiService.get<MachineCounterListDto[]>(this.getPath('maintenance/counters/critical'));
  }

  /**
   * Create a machine counter
   */
  static async createMachineCounter(data: CreateMachineCounterRequest): Promise<MachineCounterDto> {
    return ApiService.post<MachineCounterDto>(this.getPath('maintenance/counters'), data);
  }

  /**
   * Update machine counter value
   */
  static async updateMachineCounterValue(id: string, data: UpdateMachineCounterValueRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`maintenance/counters/${id}/value`), data);
  }

  /**
   * Reset a machine counter
   */
  static async resetMachineCounter(id: string, data: ResetMachineCounterRequest): Promise<void> {
    return ApiService.post<void>(this.getPath(`maintenance/counters/${id}/reset`), data);
  }

  // =====================================
  // MAINTENANCE - DASHBOARD
  // =====================================

  /**
   * Get maintenance dashboard data
   */
  static async getMaintenanceDashboard(): Promise<MaintenanceDashboardDto> {
    return ApiService.get<MaintenanceDashboardDto>(this.getPath('maintenance/dashboard'));
  }

  /**
   * Get maintenance summary for a period
   */
  static async getMaintenanceSummary(periodStart: string, periodEnd: string): Promise<MaintenanceSummaryDto> {
    return ApiService.get<MaintenanceSummaryDto>(this.getPath('maintenance/summary'), {
      params: { periodStart, periodEnd },
    });
  }

  // =====================================
  // QUALITY MANAGEMENT - NCR
  // =====================================

  /**
   * Get all NCRs
   */
  static async getNcrs(): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath('quality/ncr'));
  }

  /**
   * Get NCR by ID
   */
  static async getNcr(id: string): Promise<NonConformanceReportDto> {
    return ApiService.get<NonConformanceReportDto>(this.getPath(`quality/ncr/${id}`));
  }

  /**
   * Get open NCRs
   */
  static async getOpenNcrs(): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath('quality/ncr/open'));
  }

  /**
   * Get NCRs by status
   */
  static async getNcrsByStatus(status: NcrStatus): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-status/${status}`));
  }

  /**
   * Get NCRs by source
   */
  static async getNcrsBySource(source: NcrSource): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-source/${source}`));
  }

  /**
   * Get NCRs by severity
   */
  static async getNcrsBySeverity(severity: NcrSeverity): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-severity/${severity}`));
  }

  /**
   * Get NCRs by product
   */
  static async getNcrsByProduct(productId: string): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-product/${productId}`));
  }

  /**
   * Get NCRs by production order
   */
  static async getNcrsByProductionOrder(productionOrderId: string): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-production-order/${productionOrderId}`));
  }

  /**
   * Get NCRs by customer
   */
  static async getNcrsByCustomer(customerId: string): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-customer/${customerId}`));
  }

  /**
   * Get NCRs by supplier
   */
  static async getNcrsBySupplier(supplierId: string): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath(`quality/ncr/by-supplier/${supplierId}`));
  }

  /**
   * Get NCRs by date range
   */
  static async getNcrsByDateRange(startDate: string, endDate: string): Promise<NonConformanceReportListDto[]> {
    return ApiService.get<NonConformanceReportListDto[]>(this.getPath('quality/ncr/by-date-range'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Get NCR statistics
   */
  static async getNcrStatistics(startDate?: string, endDate?: string): Promise<NcrStatisticsDto> {
    return ApiService.get<NcrStatisticsDto>(this.getPath('quality/ncr/statistics'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Create an NCR
   */
  static async createNcr(data: CreateNcrRequest): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(this.getPath('quality/ncr'), data);
  }

  /**
   * Update an NCR
   */
  static async updateNcr(id: string, data: UpdateNcrRequest): Promise<NonConformanceReportListDto> {
    return ApiService.put<NonConformanceReportListDto>(this.getPath(`quality/ncr/${id}`), data);
  }

  /**
   * Start NCR investigation
   */
  static async startNcrInvestigation(id: string, data: StartNcrInvestigationRequest): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(this.getPath(`quality/ncr/${id}/start-investigation`), data);
  }

  /**
   * Complete NCR investigation
   */
  static async completeNcrInvestigation(id: string): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(this.getPath(`quality/ncr/${id}/complete-investigation`), {});
  }

  /**
   * Set NCR root cause
   */
  static async setNcrRootCause(id: string, data: SetNcrRootCauseRequest): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(this.getPath(`quality/ncr/${id}/set-root-cause`), data);
  }

  /**
   * Set NCR disposition
   */
  static async setNcrDisposition(id: string, data: SetNcrDispositionRequest): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(this.getPath(`quality/ncr/${id}/set-disposition`), data);
  }

  /**
   * Add NCR containment action
   */
  static async addNcrContainmentAction(id: string, data: AddNcrContainmentActionRequest): Promise<NcrContainmentActionDto> {
    return ApiService.post<NcrContainmentActionDto>(this.getPath(`quality/ncr/${id}/containment-actions`), data);
  }

  /**
   * Complete NCR containment action
   */
  static async completeNcrContainmentAction(ncrId: string, actionId: string, data: CompleteNcrContainmentActionRequest): Promise<NcrContainmentActionDto> {
    return ApiService.post<NcrContainmentActionDto>(
      this.getPath(`quality/ncr/${ncrId}/containment-actions/${actionId}/complete`),
      data
    );
  }

  /**
   * Close an NCR
   */
  static async closeNcr(id: string, data: CloseNcrRequest): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(this.getPath(`quality/ncr/${id}/close`), data);
  }

  /**
   * Cancel an NCR
   */
  static async cancelNcr(id: string, reason?: string): Promise<NonConformanceReportListDto> {
    return ApiService.post<NonConformanceReportListDto>(
      this.getPath(`quality/ncr/${id}/cancel`),
      {},
      { params: { reason } }
    );
  }

  // =====================================
  // QUALITY MANAGEMENT - CAPA
  // =====================================

  /**
   * Get all CAPAs
   */
  static async getCapas(): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath('quality/capa'));
  }

  /**
   * Get CAPA by ID
   */
  static async getCapa(id: string): Promise<CorrectivePreventiveActionDto> {
    return ApiService.get<CorrectivePreventiveActionDto>(this.getPath(`quality/capa/${id}`));
  }

  /**
   * Get open CAPAs
   */
  static async getOpenCapas(): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath('quality/capa/open'));
  }

  /**
   * Get overdue CAPAs
   */
  static async getOverdueCapas(): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath('quality/capa/overdue'));
  }

  /**
   * Get CAPAs by status
   */
  static async getCapasByStatus(status: CapaStatus): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath(`quality/capa/by-status/${status}`));
  }

  /**
   * Get CAPAs by type
   */
  static async getCapasByType(type: CapaType): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath(`quality/capa/by-type/${type}`));
  }

  /**
   * Get CAPAs by NCR
   */
  static async getCapasByNcr(ncrId: string): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath(`quality/capa/by-ncr/${ncrId}`));
  }

  /**
   * Get CAPAs by responsible user
   */
  static async getCapasByResponsibleUser(userId: string): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath(`quality/capa/by-responsible-user/${userId}`));
  }

  /**
   * Get CAPAs by due date range
   */
  static async getCapasByDueDateRange(startDate: string, endDate: string): Promise<CorrectivePreventiveActionListDto[]> {
    return ApiService.get<CorrectivePreventiveActionListDto[]>(this.getPath('quality/capa/by-due-date-range'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Get CAPA statistics
   */
  static async getCapaStatistics(startDate?: string, endDate?: string): Promise<CapaStatisticsDto> {
    return ApiService.get<CapaStatisticsDto>(this.getPath('quality/capa/statistics'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Create a CAPA
   */
  static async createCapa(data: CreateCapaRequest): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath('quality/capa'), data);
  }

  /**
   * Update a CAPA
   */
  static async updateCapa(id: string, data: UpdateCapaRequest): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.put<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}`), data);
  }

  /**
   * Open a CAPA
   */
  static async openCapa(id: string): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/open`), {});
  }

  /**
   * Start CAPA planning
   */
  static async startCapaPlanning(id: string): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/start-planning`), {});
  }

  /**
   * Start CAPA implementation
   */
  static async startCapaImplementation(id: string): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/start-implementation`), {});
  }

  /**
   * Update CAPA progress
   */
  static async updateCapaProgress(id: string, data: UpdateCapaProgressRequest): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/update-progress`), data);
  }

  /**
   * Complete CAPA implementation
   */
  static async completeCapaImplementation(id: string): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/complete-implementation`), {});
  }

  /**
   * Verify a CAPA
   */
  static async verifyCapa(id: string, data: VerifyCapaRequest): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/verify`), data);
  }

  /**
   * Evaluate CAPA effectiveness
   */
  static async evaluateCapaEffectiveness(id: string, data: EvaluateCapaEffectivenessRequest): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/evaluate-effectiveness`), data);
  }

  /**
   * Close a CAPA
   */
  static async closeCapa(id: string, data: CloseCapaRequest): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(this.getPath(`quality/capa/${id}/close`), data);
  }

  /**
   * Cancel a CAPA
   */
  static async cancelCapa(id: string, reason?: string): Promise<CorrectivePreventiveActionListDto> {
    return ApiService.post<CorrectivePreventiveActionListDto>(
      this.getPath(`quality/capa/${id}/cancel`),
      {},
      { params: { reason } }
    );
  }

  /**
   * Add CAPA task
   */
  static async addCapaTask(id: string, data: AddCapaTaskRequest): Promise<CapaTaskDto> {
    return ApiService.post<CapaTaskDto>(this.getPath(`quality/capa/${id}/tasks`), data);
  }

  /**
   * Complete CAPA task
   */
  static async completeCapaTask(capaId: string, taskId: string, data: CompleteCapaTaskRequest): Promise<CapaTaskDto> {
    return ApiService.post<CapaTaskDto>(
      this.getPath(`quality/capa/${capaId}/tasks/${taskId}/complete`),
      data
    );
  }

  // =====================================
  // SUBCONTRACT ORDERS
  // =====================================

  /**
   * Get all subcontract orders with optional filters
   */
  static async getSubcontractOrders(filters?: SubcontractOrderFilterParams): Promise<SubcontractOrderListDto[]> {
    return ApiService.get<SubcontractOrderListDto[]>(this.getPath('subcontractorders'), {
      params: filters,
    });
  }

  /**
   * Get subcontract order by ID
   */
  static async getSubcontractOrder(id: string): Promise<SubcontractOrderDto> {
    return ApiService.get<SubcontractOrderDto>(this.getPath(`subcontractorders/${id}`));
  }

  /**
   * Create a subcontract order
   */
  static async createSubcontractOrder(data: CreateSubcontractOrderRequest): Promise<SubcontractOrderDto> {
    return ApiService.post<SubcontractOrderDto>(this.getPath('subcontractorders'), data);
  }

  /**
   * Approve a subcontract order
   */
  static async approveSubcontractOrder(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`subcontractorders/${id}/approve`), {});
  }

  /**
   * Ship material for a subcontract order
   */
  static async shipSubcontractMaterial(id: string, data: ShipMaterialRequest): Promise<SubcontractShipmentDto> {
    return ApiService.post<SubcontractShipmentDto>(this.getPath(`subcontractorders/${id}/ship`), data);
  }

  /**
   * Receive product from a subcontract order
   */
  static async receiveSubcontractProduct(id: string, data: ReceiveProductRequest): Promise<SubcontractShipmentDto> {
    return ApiService.post<SubcontractShipmentDto>(this.getPath(`subcontractorders/${id}/receive`), data);
  }

  /**
   * Complete a subcontract order
   */
  static async completeSubcontractOrder(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`subcontractorders/${id}/complete`), {});
  }

  /**
   * Close a subcontract order
   */
  static async closeSubcontractOrder(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`subcontractorders/${id}/close`), {});
  }

  /**
   * Cancel a subcontract order
   */
  static async cancelSubcontractOrder(id: string): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>(this.getPath(`subcontractorders/${id}/cancel`), {});
  }

  /**
   * Get pending delivery subcontract orders
   */
  static async getPendingDeliverySubcontractOrders(): Promise<SubcontractOrderListDto[]> {
    return ApiService.get<SubcontractOrderListDto[]>(this.getPath('subcontractorders/pending-deliveries'));
  }

  /**
   * Get overdue subcontract orders
   */
  static async getOverdueSubcontractOrders(): Promise<SubcontractOrderListDto[]> {
    return ApiService.get<SubcontractOrderListDto[]>(this.getPath('subcontractorders/overdue'));
  }

  /**
   * Add material to a subcontract order
   */
  static async addSubcontractMaterial(orderId: string, data: AddSubcontractMaterialRequest): Promise<SubcontractMaterialDto> {
    return ApiService.post<SubcontractMaterialDto>(this.getPath(`subcontractorders/${orderId}/materials`), data);
  }

  /**
   * Get materials for a subcontract order
   */
  static async getSubcontractMaterials(orderId: string): Promise<SubcontractMaterialDto[]> {
    return ApiService.get<SubcontractMaterialDto[]>(this.getPath(`subcontractorders/${orderId}/materials`));
  }

  /**
   * Get shipments for a subcontract order
   */
  static async getSubcontractShipments(orderId: string): Promise<SubcontractShipmentDto[]> {
    return ApiService.get<SubcontractShipmentDto[]>(this.getPath(`subcontractorders/${orderId}/shipments`));
  }

  // =====================================
  // KPI DASHBOARD - DEFINITIONS
  // =====================================

  /**
   * Get all KPI definitions
   */
  static async getKpiDefinitions(): Promise<KpiDefinitionListDto[]> {
    return ApiService.get<KpiDefinitionListDto[]>(this.getPath('kpidashboard/kpi-definitions'));
  }

  /**
   * Get KPI definition by ID
   */
  static async getKpiDefinition(id: string): Promise<KpiDefinitionDto> {
    return ApiService.get<KpiDefinitionDto>(this.getPath(`kpidashboard/kpi-definitions/${id}`));
  }

  /**
   * Create a KPI definition
   */
  static async createKpiDefinition(data: CreateKpiDefinitionRequest): Promise<KpiDefinitionDto> {
    return ApiService.post<KpiDefinitionDto>(this.getPath('kpidashboard/kpi-definitions'), data);
  }

  /**
   * Update a KPI definition
   */
  static async updateKpiDefinition(id: string, data: UpdateKpiDefinitionRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`kpidashboard/kpi-definitions/${id}`), data);
  }

  /**
   * Delete a KPI definition
   */
  static async deleteKpiDefinition(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`kpidashboard/kpi-definitions/${id}`));
  }

  // =====================================
  // KPI DASHBOARD - VALUES
  // =====================================

  /**
   * Get KPI values with optional filters
   */
  static async getKpiValues(filters?: KpiValueFilterParams): Promise<KpiValueListDto[]> {
    return ApiService.get<KpiValueListDto[]>(this.getPath('kpidashboard/kpi-values'), {
      params: filters,
    });
  }

  /**
   * Get latest KPI value for a definition
   */
  static async getLatestKpiValue(kpiDefinitionId: string): Promise<KpiValueDto> {
    return ApiService.get<KpiValueDto>(this.getPath(`kpidashboard/kpi-values/latest/${kpiDefinitionId}`));
  }

  /**
   * Create a KPI value
   */
  static async createKpiValue(data: CreateKpiValueRequest): Promise<KpiValueDto> {
    return ApiService.post<KpiValueDto>(this.getPath('kpidashboard/kpi-values'), data);
  }

  /**
   * Get KPI trend data
   */
  static async getKpiTrendData(kpiDefinitionId: string, startDate?: string, endDate?: string): Promise<KpiTrendDataDto> {
    return ApiService.get<KpiTrendDataDto>(this.getPath(`kpidashboard/kpi-values/trend/${kpiDefinitionId}`), {
      params: { startDate, endDate },
    });
  }

  // =====================================
  // KPI DASHBOARD - TARGETS
  // =====================================

  /**
   * Create a KPI target
   */
  static async createKpiTarget(data: CreateKpiTargetRequest): Promise<KpiTargetDto> {
    return ApiService.post<KpiTargetDto>(this.getPath('kpidashboard/kpi-targets'), data);
  }

  /**
   * Approve a KPI target
   */
  static async approveKpiTarget(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`kpidashboard/kpi-targets/${id}/approve`), {});
  }

  // =====================================
  // KPI DASHBOARD - CONFIGURATIONS
  // =====================================

  /**
   * Get all dashboard configurations
   */
  static async getDashboardConfigurations(): Promise<DashboardConfigurationListDto[]> {
    return ApiService.get<DashboardConfigurationListDto[]>(this.getPath('kpidashboard/dashboards'));
  }

  /**
   * Get dashboard configuration by ID
   */
  static async getDashboardConfiguration(id: string): Promise<DashboardConfigurationDto> {
    return ApiService.get<DashboardConfigurationDto>(this.getPath(`kpidashboard/dashboards/${id}`));
  }

  /**
   * Get default dashboard configuration
   */
  static async getDefaultDashboardConfiguration(): Promise<DashboardConfigurationDto> {
    return ApiService.get<DashboardConfigurationDto>(this.getPath('kpidashboard/dashboards/default'));
  }

  /**
   * Create a dashboard configuration
   */
  static async createDashboardConfiguration(data: CreateDashboardConfigurationRequest): Promise<DashboardConfigurationDto> {
    return ApiService.post<DashboardConfigurationDto>(this.getPath('kpidashboard/dashboards'), data);
  }

  /**
   * Update a dashboard configuration
   */
  static async updateDashboardConfiguration(id: string, data: UpdateDashboardConfigurationRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`kpidashboard/dashboards/${id}`), data);
  }

  /**
   * Delete a dashboard configuration
   */
  static async deleteDashboardConfiguration(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`kpidashboard/dashboards/${id}`));
  }

  /**
   * Create a dashboard widget
   */
  static async createDashboardWidget(data: CreateDashboardWidgetRequest): Promise<DashboardWidgetDto> {
    return ApiService.post<DashboardWidgetDto>(this.getPath('kpidashboard/dashboards/widgets'), data);
  }

  // =====================================
  // KPI DASHBOARD - OEE RECORDS
  // =====================================

  /**
   * Get OEE records with optional filters
   */
  static async getOeeRecords(filters?: OeeFilterParams): Promise<OeeRecordListDto[]> {
    return ApiService.get<OeeRecordListDto[]>(this.getPath('kpidashboard/oee'), {
      params: filters,
    });
  }

  /**
   * Get OEE record by ID
   */
  static async getOeeRecord(id: string): Promise<OeeRecordDto> {
    return ApiService.get<OeeRecordDto>(this.getPath(`kpidashboard/oee/${id}`));
  }

  /**
   * Get OEE summary
   */
  static async getOeeSummary(startDate?: string, endDate?: string): Promise<DashboardOeeSummaryDto> {
    return ApiService.get<DashboardOeeSummaryDto>(this.getPath('kpidashboard/oee/summary'), {
      params: { startDate, endDate },
    });
  }

  /**
   * Create an OEE record
   */
  static async createOeeRecord(data: CreateOeeRecordRequest): Promise<OeeRecordDto> {
    return ApiService.post<OeeRecordDto>(this.getPath('kpidashboard/oee'), data);
  }

  /**
   * Validate an OEE record
   */
  static async validateOeeRecord(id: string): Promise<void> {
    return ApiService.post<void>(this.getPath(`kpidashboard/oee/${id}/validate`), {});
  }

  // =====================================
  // KPI DASHBOARD - PERFORMANCE SUMMARIES
  // =====================================

  /**
   * Get performance summaries with optional filters
   */
  static async getPerformanceSummaries(filters?: PerformanceSummaryFilterParams): Promise<ProductionPerformanceSummaryListDto[]> {
    return ApiService.get<ProductionPerformanceSummaryListDto[]>(this.getPath('kpidashboard/performance-summaries'), {
      params: filters,
    });
  }

  /**
   * Get dashboard KPI cards
   */
  static async getDashboardKpiCards(): Promise<DashboardKpiCardDto[]> {
    return ApiService.get<DashboardKpiCardDto[]>(this.getPath('kpidashboard/dashboard-data/kpi-cards'));
  }
}

export default ManufacturingService;
