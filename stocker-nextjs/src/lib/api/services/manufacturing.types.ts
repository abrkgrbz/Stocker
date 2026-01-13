// =====================================
// Manufacturing Module - TypeScript Type Definitions
// Aligned with Backend .NET DTOs
// =====================================

export type DateTime = string; // ISO 8601 format

// =====================================
// ENUMS
// =====================================

export enum BomStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Active = 'Active',
  Obsolete = 'Obsolete'
}

export enum ProductionOrderStatus {
  Draft = 0,
  Planned = 1,
  Approved = 2,
  Released = 3,
  InProgress = 4,
  Completed = 5,
  Closed = 6,
  Cancelled = 7
}

export enum OrderPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

export enum WorkCenterType {
  Machine = 'Machine',
  Labor = 'Labor',
  Subcontract = 'Subcontract',
  Mixed = 'Mixed'
}

export enum RoutingStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Active = 'Active',
  Obsolete = 'Obsolete'
}

export enum MpsStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Active = 'Active',
  Completed = 'Completed'
}

export enum PeriodType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export enum ReservationPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

export enum ReservationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Allocated = 'Allocated',
  Issued = 'Issued',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum MrpPlanType {
  Regenerative = 'Regenerative',
  NetChange = 'NetChange'
}

export enum MrpPlanStatus {
  Draft = 'Draft',
  Executed = 'Executed',
  Approved = 'Approved',
  Completed = 'Completed'
}

export enum PlannedOrderType {
  Purchase = 'Purchase',
  Production = 'Production'
}

export enum PlannedOrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Released = 'Released',
  Converted = 'Converted',
  Cancelled = 'Cancelled'
}

export enum InspectionType {
  Incoming = 'Incoming',
  InProcess = 'InProcess',
  Final = 'Final',
  Random = 'Random'
}

export enum InspectionStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum InspectionResult {
  Pass = 'Pass',
  Fail = 'Fail',
  Conditional = 'Conditional'
}

export enum Disposition {
  Accept = 'Accept',
  Reject = 'Reject',
  Rework = 'Rework',
  Scrap = 'Scrap',
  Hold = 'Hold'
}

export enum CapacityPlanStatus {
  Draft = 'Draft',
  Executed = 'Executed',
  Approved = 'Approved',
  Cancelled = 'Cancelled'
}

export enum CostCenterType {
  Production = 'Production',
  Administrative = 'Administrative',
  Sales = 'Sales',
  Other = 'Other'
}

export enum AccountingMethod {
  Standard = 'Standard',
  Actual = 'Actual'
}

export enum MaintenanceType {
  Preventive = 'Preventive',
  Corrective = 'Corrective',
  Predictive = 'Predictive',
  Breakdown = 'Breakdown'
}

export enum MaintenanceRecordStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum MaintenancePlanStatus {
  Draft = 'Draft',
  Active = 'Active',
  Suspended = 'Suspended',
  Completed = 'Completed'
}

export enum NcrStatus {
  Open = 'Open',
  UnderInvestigation = 'UnderInvestigation',
  PendingDisposition = 'PendingDisposition',
  Closed = 'Closed',
  Cancelled = 'Cancelled'
}

export enum NcrSource {
  Internal = 'Internal',
  Customer = 'Customer',
  Supplier = 'Supplier',
  Production = 'Production',
  Inspection = 'Inspection'
}

export enum NcrSeverity {
  Minor = 'Minor',
  Major = 'Major',
  Critical = 'Critical'
}

export enum CapaType {
  Corrective = 'Corrective',
  Preventive = 'Preventive'
}

export enum CapaStatus {
  Draft = 'Draft',
  Open = 'Open',
  Planning = 'Planning',
  Implementation = 'Implementation',
  Verification = 'Verification',
  EffectivenessReview = 'EffectivenessReview',
  Closed = 'Closed',
  Cancelled = 'Cancelled'
}

export enum SubcontractOrderStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Shipped = 'Shipped',
  Received = 'Received',
  Completed = 'Completed',
  Closed = 'Closed',
  Cancelled = 'Cancelled'
}

export enum KpiCategory {
  Efficiency = 'Efficiency',
  Quality = 'Quality',
  Delivery = 'Delivery',
  Cost = 'Cost',
  Safety = 'Safety'
}

export enum WidgetType {
  Gauge = 'Gauge',
  LineChart = 'LineChart',
  BarChart = 'BarChart',
  PieChart = 'PieChart',
  Table = 'Table',
  Value = 'Value'
}

// =====================================
// BILL OF MATERIALS (BOM)
// =====================================

export interface BomItemDto {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unitOfMeasure: string;
  scrapPercentage?: number;
  position: number;
  notes?: string;
}

export interface BomItemRequest {
  materialId: string;
  quantity: number;
  unitOfMeasure: string;
  scrapPercentage?: number;
  position: number;
  notes?: string;
}

export interface BillOfMaterialListDto {
  id: string;
  bomNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  version: string;
  status: BomStatus;
  isDefault: boolean;
  effectiveDate: DateTime;
  expiryDate?: DateTime;
  itemCount: number;
  createdAt: DateTime;
}

export interface BillOfMaterialDto {
  id: string;
  bomNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  version: string;
  description?: string;
  status: BomStatus;
  effectiveDate: DateTime;
  expiryDate?: DateTime;
  isDefault: boolean;
  items: BomItemDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateBillOfMaterialRequest {
  productId: string;
  version: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  items: BomItemRequest[];
}

export interface UpdateBillOfMaterialRequest {
  version: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  items: BomItemRequest[];
}

// =====================================
// PRODUCTION ORDERS
// =====================================

export interface ProductionOperationDto {
  id: string;
  operationNumber: number;
  workCenterId: string;
  workCenterName: string;
  operationName: string;
  status: string;
  plannedStartTime?: DateTime;
  plannedEndTime?: DateTime;
  actualStartTime?: DateTime;
  actualEndTime?: DateTime;
  setupTime: number;
  runTime: number;
}

export interface MaterialRequirementDto {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  requiredQuantity: number;
  allocatedQuantity: number;
  issuedQuantity: number;
  unitOfMeasure: string;
}

export interface ProductionOrderListDto {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  status: ProductionOrderStatus;
  plannedQuantity: number;
  completedQuantity: number;
  unitOfMeasure: string;
  plannedStartDate: DateTime;
  plannedEndDate: DateTime;
  actualStartDate?: DateTime;
  actualEndDate?: DateTime;
  priority: OrderPriority;
  progress: number;
  createdAt: DateTime;
}

export interface ProductionOrderDto {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  billOfMaterialId: string;
  routingId?: string;
  status: ProductionOrderStatus;
  plannedQuantity: number;
  completedQuantity: number;
  scrapQuantity: number;
  unitOfMeasure: string;
  plannedStartDate: DateTime;
  plannedEndDate: DateTime;
  actualStartDate?: DateTime;
  actualEndDate?: DateTime;
  priority: OrderPriority;
  notes?: string;
  operations: ProductionOperationDto[];
  materialRequirements: MaterialRequirementDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateProductionOrderRequest {
  productId: string;
  billOfMaterialId: string;
  routingId?: string;
  plannedQuantity: number;
  unitOfMeasure: string;
  plannedStartDate: string;
  plannedEndDate: string;
  priority: OrderPriority;
  notes?: string;
}

export interface StartProductionOrderRequest {
  actualStartDate?: string;
  notes?: string;
}

export interface CompleteProductionOrderRequest {
  completedQuantity: number;
  scrapQuantity?: number;
  notes?: string;
}

// =====================================
// WORK CENTERS
// =====================================

export interface WorkCenterListDto {
  id: string;
  code: string;
  name: string;
  type: WorkCenterType;
  capacityPerHour: number;
  efficiency: number;
  hourlyRate: number;
  isActive: boolean;
  currentUtilization?: number;
}

export interface WorkCenterDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: WorkCenterType;
  costCenterId?: string;
  costCenterName?: string;
  capacityPerHour: number;
  setupTime: number;
  efficiency: number;
  hourlyRate: number;
  setupCost: number;
  isActive: boolean;
  currentUtilization?: number;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateWorkCenterRequest {
  code: string;
  name: string;
  description?: string;
  type: WorkCenterType;
  costCenterId?: string;
  capacityPerHour: number;
  setupTime: number;
  efficiency: number;
  hourlyRate: number;
  setupCost: number;
}

export interface UpdateWorkCenterRequest {
  name: string;
  description?: string;
  type: WorkCenterType;
  costCenterId?: string;
  capacityPerHour: number;
  setupTime: number;
  efficiency: number;
  hourlyRate: number;
  setupCost: number;
}

// =====================================
// ROUTINGS
// =====================================

export interface RoutingOperationDto {
  id: string;
  operationNumber: number;
  workCenterId: string;
  workCenterName: string;
  operationName: string;
  description?: string;
  setupTime: number;
  runTime: number;
  waitTime: number;
  moveTime: number;
  overlapPercentage?: number;
}

export interface RoutingOperationRequest {
  operationNumber: number;
  workCenterId: string;
  operationName: string;
  description?: string;
  setupTime: number;
  runTime: number;
  waitTime: number;
  moveTime: number;
  overlapPercentage?: number;
}

export interface RoutingListDto {
  id: string;
  routingNumber: string;
  productId: string;
  productName: string;
  version: string;
  status: RoutingStatus;
  isDefault: boolean;
  totalSetupTime: number;
  totalRunTime: number;
  operationCount: number;
  createdAt: DateTime;
}

export interface RoutingDto {
  id: string;
  routingNumber: string;
  productId: string;
  productName: string;
  version: string;
  description?: string;
  status: RoutingStatus;
  effectiveDate: DateTime;
  expiryDate?: DateTime;
  isDefault: boolean;
  totalSetupTime: number;
  totalRunTime: number;
  operations: RoutingOperationDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateRoutingRequest {
  productId: string;
  version: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  operations: RoutingOperationRequest[];
}

export interface UpdateRoutingRequest {
  version: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  operations: RoutingOperationRequest[];
}

// =====================================
// MASTER PRODUCTION SCHEDULES (MPS)
// =====================================

export interface MpsLineDto {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  periodStart: DateTime;
  periodEnd: DateTime;
  forecastQuantity: number;
  plannedProductionQuantity: number;
  actualProductionQuantity: number;
  safetyStock: number;
  variance: number;
}

export interface MasterProductionScheduleListDto {
  id: string;
  name: string;
  status: MpsStatus;
  periodType: PeriodType;
  planningHorizonStart: DateTime;
  planningHorizonEnd: DateTime;
  lineCount: number;
  createdAt: DateTime;
}

export interface MasterProductionScheduleDto {
  id: string;
  name: string;
  description?: string;
  status: MpsStatus;
  periodType: PeriodType;
  planningHorizonStart: DateTime;
  planningHorizonEnd: DateTime;
  lines: MpsLineDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateMasterProductionScheduleRequest {
  name: string;
  description?: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  periodType: PeriodType;
}

export interface UpdateMasterProductionScheduleRequest {
  name: string;
  description?: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  periodType: PeriodType;
}

export interface AddMpsLineRequest {
  productId: string;
  periodStart: string;
  periodEnd: string;
  forecastQuantity: number;
  plannedProductionQuantity: number;
  safetyStock: number;
}

export interface UpdateMpsLineRequest {
  forecastQuantity: number;
  plannedProductionQuantity: number;
  safetyStock: number;
}

export interface RecordActualsRequest {
  actualProductionQuantity: number;
}

export interface AtpQueryResponse {
  productId: string;
  productName: string;
  queryDate: DateTime;
  availableToPromise: number;
  onHandQuantity: number;
  reservedQuantity: number;
  plannedReceipts: number;
  forecastDemand: number;
}

export interface MpsLineListDto {
  id: string;
  scheduleId: string;
  scheduleName: string;
  productId: string;
  productName: string;
  productCode: string;
  periodStart: DateTime;
  periodEnd: DateTime;
  forecastQuantity: number;
  plannedProductionQuantity: number;
  actualProductionQuantity: number;
  variance: number;
}

// =====================================
// MATERIAL RESERVATIONS
// =====================================

export interface MaterialReservationAllocationDto {
  id: string;
  warehouseId: string;
  warehouseName: string;
  locationId?: string;
  locationName?: string;
  lotNumber?: string;
  allocatedQuantity: number;
  allocatedAt: DateTime;
  allocatedBy: string;
}

export interface MaterialReservationIssueDto {
  id: string;
  allocationId: string;
  issuedQuantity: number;
  issuedAt: DateTime;
  issuedBy: string;
  returnedQuantity?: number;
  returnedAt?: DateTime;
}

export interface MaterialReservationListDto {
  id: string;
  reservationNumber: string;
  productionOrderId: string;
  productionOrderNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  warehouseId: string;
  warehouseName: string;
  status: ReservationStatus;
  requiredQuantity: number;
  allocatedQuantity: number;
  issuedQuantity: number;
  requiredDate: DateTime;
  priority: ReservationPriority;
  createdAt: DateTime;
}

export interface MaterialReservationDto {
  id: string;
  reservationNumber: string;
  productionOrderId: string;
  productionOrderNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  warehouseId: string;
  warehouseName: string;
  status: ReservationStatus;
  requiredQuantity: number;
  allocatedQuantity: number;
  issuedQuantity: number;
  requiredDate: DateTime;
  priority: ReservationPriority;
  lotNumber?: string;
  notes?: string;
  allocations: MaterialReservationAllocationDto[];
  issues: MaterialReservationIssueDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateMaterialReservationRequest {
  productionOrderId: string;
  productId: string;
  warehouseId: string;
  requiredQuantity: number;
  requiredDate: string;
  priority: ReservationPriority;
  lotNumber?: string;
  notes?: string;
}

export interface UpdateMaterialReservationRequest {
  requiredQuantity: number;
  requiredDate: string;
  priority: ReservationPriority;
  notes?: string;
}

export interface ApproveMaterialReservationRequest {
  approvalNotes?: string;
}

export interface AllocateMaterialRequest {
  warehouseId: string;
  locationId?: string;
  lotNumber?: string;
  quantity: number;
}

export interface IssueMaterialRequest {
  allocationId: string;
  quantity: number;
}

export interface ReturnMaterialRequest {
  issueId: string;
  quantity: number;
  reason?: string;
}

export interface MaterialReservationSummaryDto {
  totalReservations: number;
  pendingReservations: number;
  approvedReservations: number;
  allocatedReservations: number;
  totalReservedQuantity: number;
  totalAllocatedQuantity: number;
  totalIssuedQuantity: number;
}

export interface ProductReservationSummaryDto {
  productId: string;
  productName: string;
  totalReserved: number;
  totalAllocated: number;
  totalIssued: number;
  pendingReservations: number;
}

// =====================================
// MRP PLANS
// =====================================

export interface PlannedOrderDto {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  orderType: PlannedOrderType;
  plannedQuantity: number;
  requiredDate: DateTime;
  releaseDate: DateTime;
  status: PlannedOrderStatus;
}

export interface MrpExceptionDto {
  id: string;
  type: string;
  productId: string;
  productName: string;
  message: string;
  severity: string;
  isResolved: boolean;
  resolution?: string;
  resolvedAt?: DateTime;
  resolvedBy?: string;
}

export interface MrpPlanListDto {
  id: string;
  planNumber: string;
  name: string;
  status: MrpPlanStatus;
  planType: MrpPlanType;
  planningHorizonStart: DateTime;
  planningHorizonEnd: DateTime;
  plannedOrderCount: number;
  exceptionCount: number;
  executedAt?: DateTime;
  createdAt: DateTime;
}

export interface MrpPlanDto {
  id: string;
  planNumber: string;
  name: string;
  description?: string;
  status: MrpPlanStatus;
  planType: MrpPlanType;
  planningHorizonStart: DateTime;
  planningHorizonEnd: DateTime;
  includeSafetyStock: boolean;
  includeLeadTimes: boolean;
  executedAt?: DateTime;
  plannedOrders: PlannedOrderDto[];
  exceptions: MrpExceptionDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateMrpPlanRequest {
  name: string;
  description?: string;
  planType: MrpPlanType;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  includeSafetyStock: boolean;
  includeLeadTimes: boolean;
}

export interface ExecuteMrpPlanRequest {
  force?: boolean;
}

export interface ConfirmPlannedOrderRequest {
  notes?: string;
}

export interface ReleasePlannedOrderRequest {
  releaseDate?: string;
}

export interface ConvertPlannedOrderRequest {
  orderType: PlannedOrderType;
}

export interface ResolveMrpExceptionRequest {
  resolution: string;
}

export interface PlannedOrderListDto {
  id: string;
  planId: string;
  planName: string;
  productId: string;
  productName: string;
  productCode: string;
  orderType: PlannedOrderType;
  plannedQuantity: number;
  requiredDate: DateTime;
  releaseDate: DateTime;
  status: PlannedOrderStatus;
}

// =====================================
// QUALITY INSPECTIONS
// =====================================

export interface InspectionMeasurementDto {
  id: string;
  parameterName: string;
  targetValue: number;
  actualValue: number;
  tolerance: number;
  unit: string;
  isPassing: boolean;
}

export interface NonConformanceDto {
  id: string;
  description: string;
  quantity: number;
  severity: NcrSeverity;
  disposition?: Disposition;
  notes?: string;
}

export interface QualityInspectionListDto {
  id: string;
  inspectionNumber: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  productId: string;
  productName: string;
  productCode?: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  result?: InspectionResult;
  sampleSize: number;
  inspectedQuantity?: number;
  passedQuantity?: number;
  failedQuantity?: number;
  inspectionDate?: DateTime;
  createdAt: DateTime;
}

export interface QualityInspectionDto {
  id: string;
  inspectionNumber: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  productId: string;
  productName: string;
  inspectionPlanId?: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  result?: InspectionResult;
  sampleSize: number;
  passedQuantity?: number;
  failedQuantity?: number;
  disposition?: Disposition;
  inspectorNotes?: string;
  measurements: InspectionMeasurementDto[];
  nonConformances: NonConformanceDto[];
  startedAt?: DateTime;
  completedAt?: DateTime;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateQualityInspectionRequest {
  productionOrderId?: string;
  productId: string;
  inspectionType: InspectionType;
  inspectionPlanId?: string;
  sampleSize: number;
  notes?: string;
}

export interface StartInspectionRequest {
  inspectorNotes?: string;
}

export interface InspectionMeasurement {
  parameterName: string;
  targetValue: number;
  actualValue: number;
  tolerance: number;
  unit: string;
}

export interface RecordInspectionResultRequest {
  result: InspectionResult;
  passedQuantity: number;
  failedQuantity: number;
  inspectorNotes?: string;
  measurements?: InspectionMeasurement[];
}

export interface RecordNonConformanceRequest {
  description: string;
  quantity: number;
  severity: NcrSeverity;
  notes?: string;
}

export interface SetDispositionRequest {
  disposition: Disposition;
  notes?: string;
}

// =====================================
// CAPACITY PLANS
// =====================================

export interface CapacityRequirementDto {
  id: string;
  workCenterId: string;
  workCenterName: string;
  periodStart: DateTime;
  periodEnd: DateTime;
  requiredCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
  isOverloaded: boolean;
}

export interface CapacityExceptionDto {
  id: string;
  workCenterId: string;
  workCenterName: string;
  type: string;
  message: string;
  suggestedAction?: string;
  isResolved: boolean;
  resolution?: string;
}

export interface CapacityPlanListDto {
  id: string;
  name: string;
  status: CapacityPlanStatus;
  periodType?: PeriodType;
  mrpPlanId?: string;
  mrpPlanName?: string;
  planningHorizonStart: DateTime;
  planningHorizonEnd: DateTime;
  overloadedWorkCenters: number;
  utilizationRate?: number;
  workCenterCount?: number;
  createdAt: DateTime;
}

export interface CapacityPlanDto {
  id: string;
  name: string;
  description?: string;
  status: CapacityPlanStatus;
  mrpPlanId?: string;
  mrpPlanName?: string;
  planningHorizonStart: DateTime;
  planningHorizonEnd: DateTime;
  includeSetupTimes: boolean;
  includeEfficiency: boolean;
  requirements: CapacityRequirementDto[];
  exceptions: CapacityExceptionDto[];
  executedAt?: DateTime;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateCapacityPlanRequest {
  name: string;
  description?: string;
  mrpPlanId?: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  includeSetupTimes: boolean;
  includeEfficiency: boolean;
}

export interface ExecuteCapacityPlanRequest {
  force?: boolean;
}

export interface ResolveCapacityExceptionRequest {
  resolution: string;
}

export interface WorkCenterCapacityOverviewDto {
  workCenterId: string;
  workCenterName: string;
  periodStart: DateTime;
  periodEnd: DateTime;
  availableCapacity: number;
  requiredCapacity: number;
  utilizationPercentage: number;
  isOverloaded: boolean;
}

// =====================================
// COST ACCOUNTING
// =====================================

export interface ProductionCostAllocationDto {
  id: string;
  costCenterId: string;
  costCenterName: string;
  costType: string;
  amount: number;
  notes?: string;
}

export interface CostJournalEntryDto {
  id: string;
  entryDate: DateTime;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  isPosted: boolean;
  postedAt?: DateTime;
}

export interface ProductionCostRecordListDto {
  id: string;
  recordNumber: string;
  productionOrderId: string;
  productionOrderNumber: string;
  productId: string;
  productName: string;
  accountingMethod: AccountingMethod;
  totalDirectMaterialCost: number;
  totalDirectLaborCost: number;
  totalOverheadCost: number;
  totalCost: number;
  isFinalized: boolean;
  createdAt: DateTime;
}

export interface ProductionCostRecordDto {
  id: string;
  recordNumber: string;
  productionOrderId: string;
  productionOrderNumber: string;
  productId: string;
  productName: string;
  accountingMethod: AccountingMethod;
  year: number;
  month: number;
  totalDirectMaterialCost: number;
  totalDirectLaborCost: number;
  totalOverheadCost: number;
  materialVariance: number;
  laborVariance: number;
  overheadVariance: number;
  totalCost: number;
  unitCost: number;
  producedQuantity: number;
  isFinalized: boolean;
  allocations: ProductionCostAllocationDto[];
  journalEntries: CostJournalEntryDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateProductionCostRecordRequest {
  productionOrderId: string;
  accountingMethod: AccountingMethod;
  year: number;
  month: number;
}

export interface SetProductionDirectCostsRequest {
  directMaterialCost: number;
  directLaborCost: number;
}

export interface SetOverheadCostsRequest {
  overheadCost: number;
  allocationBasis: string;
}

export interface SetVariancesRequest {
  materialVariance: number;
  laborVariance: number;
  overheadVariance: number;
}

export interface AddCostAllocationRequest {
  costCenterId: string;
  costType: string;
  amount: number;
  notes?: string;
}

export interface AddJournalEntryRequest {
  entryDate: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

export interface CostSummaryDto {
  year: number;
  month: number;
  totalDirectMaterialCost: number;
  totalDirectLaborCost: number;
  totalOverheadCost: number;
  totalCost: number;
  totalVariance: number;
  recordCount: number;
}

// Cost Centers
export interface CostCenterListDto {
  id: string;
  code: string;
  name: string;
  type: CostCenterType;
  isActive: boolean;
  budgetAmount?: number;
  actualAmount?: number;
}

export interface CostCenterDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CostCenterType;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  budgetAmount?: number;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateCostCenterRequest {
  code: string;
  name: string;
  description?: string;
  type: CostCenterType;
  parentId?: string;
  budgetAmount?: number;
}

export interface UpdateCostCenterRequest {
  name: string;
  description?: string;
  type: CostCenterType;
  parentId?: string;
  budgetAmount?: number;
}

// Standard Cost Cards
export interface StandardCostCardListDto {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  year: number;
  standardMaterialCost: number;
  standardLaborCost: number;
  standardOverheadCost: number;
  totalStandardCost: number;
  isCurrent: boolean;
  isApproved: boolean;
}

export interface StandardCostCardDto {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  year: number;
  standardMaterialCost: number;
  standardLaborCost: number;
  standardOverheadCost: number;
  totalStandardCost: number;
  isCurrent: boolean;
  isApproved: boolean;
  approvedAt?: DateTime;
  approvedBy?: string;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateStandardCostCardRequest {
  productId: string;
  year: number;
  standardMaterialCost: number;
  standardLaborCost: number;
  standardOverheadCost: number;
}

// =====================================
// MAINTENANCE
// =====================================

export interface MaintenanceTaskDto {
  id: string;
  taskName: string;
  description?: string;
  estimatedDuration: number;
  requiredSkills?: string;
  isCompleted: boolean;
}

export interface MaintenancePlanListDto {
  id: string;
  planNumber: string;
  name: string;
  machineId: string;
  machineName: string;
  maintenanceType: MaintenanceType;
  status: MaintenancePlanStatus;
  frequencyDays: number;
  nextDueDate: DateTime;
  lastExecutedDate?: DateTime;
}

export interface MaintenancePlanDto {
  id: string;
  planNumber: string;
  name: string;
  description?: string;
  machineId: string;
  machineName: string;
  maintenanceType: MaintenanceType;
  status: MaintenancePlanStatus;
  frequencyDays: number;
  estimatedDuration: number;
  nextDueDate: DateTime;
  lastExecutedDate?: DateTime;
  tasks: MaintenanceTaskDto[];
  isApproved: boolean;
  approvedAt?: DateTime;
  approvedBy?: string;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateMaintenancePlanRequest {
  name: string;
  description?: string;
  machineId: string;
  maintenanceType: MaintenanceType;
  frequencyDays: number;
  estimatedDuration: number;
  nextDueDate: string;
}

export interface UpdateMaintenancePlanRequest {
  name: string;
  description?: string;
  maintenanceType: MaintenanceType;
  frequencyDays: number;
  estimatedDuration: number;
  nextDueDate: string;
}

export interface CreateMaintenanceTaskRequest {
  planId: string;
  taskName: string;
  description?: string;
  estimatedDuration: number;
  requiredSkills?: string;
}

export interface UpdateMaintenanceTaskRequest {
  taskName: string;
  description?: string;
  estimatedDuration: number;
  requiredSkills?: string;
}

// Maintenance Records
export interface MaintenanceRecordSparePartDto {
  id: string;
  sparePartId: string;
  sparePartName: string;
  sparePartCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface MaintenanceRecordListDto {
  id: string;
  recordNumber: string;
  planId?: string;
  planName?: string;
  machineId: string;
  machineName: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceRecordStatus;
  scheduledDate: DateTime;
  startedAt?: DateTime;
  completedAt?: DateTime;
  totalCost: number;
}

export interface MaintenanceRecordDto {
  id: string;
  recordNumber: string;
  planId?: string;
  planName?: string;
  machineId: string;
  machineName: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceRecordStatus;
  description?: string;
  scheduledDate: DateTime;
  startedAt?: DateTime;
  completedAt?: DateTime;
  performedBy?: string;
  laborHours?: number;
  laborCost?: number;
  findings?: string;
  recommendations?: string;
  spareParts: MaintenanceRecordSparePartDto[];
  totalCost: number;
  isApproved: boolean;
  approvedAt?: DateTime;
  approvedBy?: string;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateMaintenanceRecordRequest {
  planId?: string;
  machineId: string;
  maintenanceType: MaintenanceType;
  description?: string;
  scheduledDate: string;
}

export interface UpdateMaintenanceRecordRequest {
  description?: string;
  scheduledDate: string;
}

export interface StartMaintenanceRecordRequest {
  performedBy: string;
  notes?: string;
}

export interface CompleteMaintenanceRecordRequest {
  laborHours: number;
  laborCost: number;
  findings?: string;
  recommendations?: string;
}

export interface AddMaintenanceRecordSparePartRequest {
  recordId: string;
  sparePartId: string;
  quantity: number;
  unitCost: number;
}

// Spare Parts
export interface SparePartListDto {
  id: string;
  code: string;
  name: string;
  category?: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  isActive: boolean;
}

export interface SparePartDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  leadTimeDays: number;
  supplierId?: string;
  supplierName?: string;
  isActive: boolean;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateSparePartRequest {
  code: string;
  name: string;
  description?: string;
  category?: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  leadTimeDays: number;
  supplierId?: string;
}

export interface UpdateSparePartRequest {
  name: string;
  description?: string;
  category?: string;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  leadTimeDays: number;
  supplierId?: string;
}

// Machine Counters
export interface MachineCounterListDto {
  id: string;
  machineId: string;
  machineName: string;
  counterName: string;
  currentValue: number;
  unit: string;
  thresholdValue?: number;
  lastResetDate?: DateTime;
  isCritical: boolean;
}

export interface MachineCounterDto {
  id: string;
  machineId: string;
  machineName: string;
  counterName: string;
  description?: string;
  currentValue: number;
  unit: string;
  thresholdValue?: number;
  lastResetDate?: DateTime;
  lastUpdatedAt: DateTime;
  createdAt: DateTime;
  createdBy: string;
}

export interface CreateMachineCounterRequest {
  machineId: string;
  counterName: string;
  description?: string;
  unit: string;
  thresholdValue?: number;
  initialValue?: number;
}

export interface UpdateMachineCounterValueRequest {
  value: number;
}

export interface ResetMachineCounterRequest {
  reason: string;
}

// Dashboard
export interface MaintenanceDashboardDto {
  totalPlans: number;
  activePlans: number;
  overdueCount: number;
  upcomingCount: number;
  pendingRecords: number;
  completedThisMonth: number;
  totalCostThisMonth: number;
  criticalCounters: number;
}

export interface MaintenanceSummaryDto {
  periodStart: DateTime;
  periodEnd: DateTime;
  totalRecords: number;
  completedRecords: number;
  cancelledRecords: number;
  totalLaborHours: number;
  totalLaborCost: number;
  totalPartsCost: number;
  totalCost: number;
  averageCompletionTime: number;
}

// =====================================
// QUALITY MANAGEMENT (NCR & CAPA)
// =====================================

export interface NcrContainmentActionDto {
  id: string;
  actionDescription: string;
  assignedTo: string;
  dueDate: DateTime;
  isCompleted: boolean;
  completedAt?: DateTime;
  completedNotes?: string;
}

export interface NonConformanceReportListDto {
  id: string;
  ncrNumber: string;
  title: string;
  source: NcrSource;
  severity: NcrSeverity;
  status: NcrStatus;
  productId?: string;
  productName?: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  affectedQuantity: number;
  reportedAt: DateTime;
  reportedBy: string;
}

export interface NonConformanceReportDto {
  id: string;
  ncrNumber: string;
  title: string;
  description: string;
  source: NcrSource;
  severity: NcrSeverity;
  status: NcrStatus;
  productId?: string;
  productName?: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  affectedQuantity: number;
  defectType?: string;
  rootCause?: string;
  disposition?: Disposition;
  dispositionNotes?: string;
  investigationStartedAt?: DateTime;
  investigationCompletedAt?: DateTime;
  investigatedBy?: string;
  containmentActions: NcrContainmentActionDto[];
  closedAt?: DateTime;
  closedBy?: string;
  closureNotes?: string;
  reportedAt: DateTime;
  reportedBy: string;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateNcrRequest {
  title: string;
  description: string;
  source: NcrSource;
  severity: NcrSeverity;
  productId?: string;
  productionOrderId?: string;
  customerId?: string;
  supplierId?: string;
  affectedQuantity: number;
  defectType?: string;
}

export interface UpdateNcrRequest {
  title: string;
  description: string;
  severity: NcrSeverity;
  affectedQuantity: number;
  defectType?: string;
}

export interface StartNcrInvestigationRequest {
  investigator: string;
  notes?: string;
}

export interface SetNcrRootCauseRequest {
  rootCause: string;
  analysisMethod?: string;
}

export interface SetNcrDispositionRequest {
  disposition: Disposition;
  notes?: string;
}

export interface AddNcrContainmentActionRequest {
  actionDescription: string;
  assignedTo: string;
  dueDate: string;
}

export interface CompleteNcrContainmentActionRequest {
  completedNotes: string;
}

export interface CloseNcrRequest {
  closureNotes: string;
}

export interface NcrStatisticsDto {
  totalNcrs: number;
  openNcrs: number;
  closedNcrs: number;
  bySource: Record<string, number>;
  bySeverity: Record<string, number>;
  averageResolutionDays: number;
}

// CAPA
export interface CapaTaskDto {
  id: string;
  taskDescription: string;
  assignedTo: string;
  dueDate: DateTime;
  isCompleted: boolean;
  completedAt?: DateTime;
  completedNotes?: string;
}

export interface CorrectivePreventiveActionListDto {
  id: string;
  capaNumber: string;
  title: string;
  type: CapaType;
  status: CapaStatus;
  ncrId?: string;
  ncrNumber?: string;
  priority: OrderPriority;
  dueDate: DateTime;
  responsibleUserId: string;
  responsibleUserName: string;
  progress: number;
  isOverdue: boolean;
  createdAt: DateTime;
}

export interface CorrectivePreventiveActionDto {
  id: string;
  capaNumber: string;
  title: string;
  description: string;
  type: CapaType;
  status: CapaStatus;
  ncrId?: string;
  ncrNumber?: string;
  priority: OrderPriority;
  dueDate: DateTime;
  responsibleUserId: string;
  responsibleUserName: string;
  rootCauseAnalysis?: string;
  proposedActions?: string;
  implementationPlan?: string;
  progress: number;
  verificationMethod?: string;
  verificationResult?: string;
  verifiedAt?: DateTime;
  verifiedBy?: string;
  effectivenessEvaluation?: string;
  effectivenessScore?: number;
  evaluatedAt?: DateTime;
  evaluatedBy?: string;
  tasks: CapaTaskDto[];
  closedAt?: DateTime;
  closedBy?: string;
  closureNotes?: string;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateCapaRequest {
  title: string;
  description: string;
  type: CapaType;
  ncrId?: string;
  priority: OrderPriority;
  dueDate: string;
  responsibleUserId: string;
}

export interface UpdateCapaRequest {
  title: string;
  description: string;
  priority: OrderPriority;
  dueDate: string;
  responsibleUserId: string;
  rootCauseAnalysis?: string;
  proposedActions?: string;
  implementationPlan?: string;
}

export interface UpdateCapaProgressRequest {
  progress: number;
  notes?: string;
}

export interface VerifyCapaRequest {
  verificationMethod: string;
  verificationResult: string;
}

export interface EvaluateCapaEffectivenessRequest {
  effectivenessEvaluation: string;
  effectivenessScore: number;
}

export interface CloseCapaRequest {
  closureNotes: string;
}

export interface AddCapaTaskRequest {
  taskDescription: string;
  assignedTo: string;
  dueDate: string;
}

export interface CompleteCapaTaskRequest {
  completedNotes: string;
}

export interface CapaStatisticsDto {
  totalCapas: number;
  openCapas: number;
  closedCapas: number;
  overdueCapas: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageCompletionDays: number;
  averageEffectivenessScore: number;
}

// =====================================
// SUBCONTRACT ORDERS
// =====================================

export interface SubcontractMaterialDto {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unitOfMeasure: string;
  shippedQuantity: number;
}

export interface SubcontractShipmentDto {
  id: string;
  shipmentType: string;
  shipmentDate: DateTime;
  materialId?: string;
  materialName?: string;
  quantity: number;
  notes?: string;
}

export interface SubcontractOrderListDto {
  id: string;
  orderNumber: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  subcontractorId: string;
  subcontractorName: string;
  productId: string;
  productName: string;
  status: SubcontractOrderStatus;
  quantity: number;
  receivedQuantity: number;
  expectedDeliveryDate: DateTime;
  actualDeliveryDate?: DateTime;
  totalPrice: number;
  createdAt: DateTime;
}

export interface SubcontractOrderDto {
  id: string;
  orderNumber: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  subcontractorId: string;
  subcontractorName: string;
  productId: string;
  productName: string;
  productCode: string;
  status: SubcontractOrderStatus;
  quantity: number;
  receivedQuantity: number;
  unitOfMeasure: string;
  expectedDeliveryDate: DateTime;
  actualDeliveryDate?: DateTime;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  materials: SubcontractMaterialDto[];
  shipments: SubcontractShipmentDto[];
  approvedAt?: DateTime;
  approvedBy?: string;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateSubcontractOrderRequest {
  productionOrderId?: string;
  subcontractorId: string;
  productId: string;
  quantity: number;
  unitOfMeasure: string;
  expectedDeliveryDate: string;
  unitPrice: number;
  notes?: string;
}

export interface AddSubcontractMaterialRequest {
  materialId: string;
  quantity: number;
  unitOfMeasure: string;
}

export interface ShipMaterialRequest {
  materialId: string;
  quantity: number;
  shipmentDate: string;
  notes?: string;
}

export interface ReceiveProductRequest {
  quantity: number;
  receiptDate: string;
  notes?: string;
}

// =====================================
// KPI DASHBOARD
// =====================================

export interface KpiDefinitionListDto {
  id: string;
  code: string;
  name: string;
  category: KpiCategory;
  unit: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  isActive: boolean;
}

export interface KpiDefinitionDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: KpiCategory;
  unit: string;
  formula?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  isActive: boolean;
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateKpiDefinitionRequest {
  code: string;
  name: string;
  description?: string;
  category: KpiCategory;
  unit: string;
  formula?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface UpdateKpiDefinitionRequest {
  name: string;
  description?: string;
  category: KpiCategory;
  unit: string;
  formula?: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface KpiValueListDto {
  id: string;
  kpiDefinitionId: string;
  kpiName: string;
  recordDate: DateTime;
  value: number;
  targetValue?: number;
  variance?: number;
  status: string;
}

export interface KpiValueDto {
  id: string;
  kpiDefinitionId: string;
  kpiName: string;
  kpiUnit: string;
  recordDate: DateTime;
  value: number;
  targetValue?: number;
  variance?: number;
  notes?: string;
  createdAt: DateTime;
  createdBy: string;
}

export interface CreateKpiValueRequest {
  kpiDefinitionId: string;
  recordDate: string;
  value: number;
  notes?: string;
}

export interface KpiTrendDataDto {
  kpiDefinitionId: string;
  kpiName: string;
  kpiUnit: string;
  targetValue?: number;
  dataPoints: KpiDataPointDto[];
  averageValue: number;
  minValue: number;
  maxValue: number;
  trend: string;
}

export interface KpiDataPointDto {
  date: DateTime;
  value: number;
}

export interface KpiTargetDto {
  id: string;
  kpiDefinitionId: string;
  kpiName: string;
  year: number;
  month?: number;
  targetValue: number;
  isApproved: boolean;
  approvedAt?: DateTime;
  approvedBy?: string;
}

export interface CreateKpiTargetRequest {
  kpiDefinitionId: string;
  year: number;
  month?: number;
  targetValue: number;
}

// Dashboard Configurations
export interface DashboardWidgetDto {
  id: string;
  kpiDefinitionId: string;
  kpiName: string;
  widgetType: WidgetType;
  position: number;
  width: number;
  height: number;
}

export interface DashboardConfigurationListDto {
  id: string;
  name: string;
  isDefault: boolean;
  widgetCount: number;
  createdAt: DateTime;
}

export interface DashboardConfigurationDto {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: DashboardWidgetDto[];
  createdAt: DateTime;
  createdBy: string;
  updatedAt?: DateTime;
  updatedBy?: string;
}

export interface CreateDashboardConfigurationRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateDashboardConfigurationRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface CreateDashboardWidgetRequest {
  dashboardId: string;
  kpiDefinitionId: string;
  widgetType: WidgetType;
  position: number;
  width: number;
  height: number;
}

// OEE Records
export interface OeeRecordListDto {
  id: string;
  workCenterId: string;
  workCenterName: string;
  recordDate: DateTime;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  isValidated: boolean;
}

export interface OeeRecordDto {
  id: string;
  workCenterId: string;
  workCenterName: string;
  recordDate: DateTime;
  plannedProductionTime: number;
  actualRunTime: number;
  plannedOutput: number;
  actualOutput: number;
  goodOutput: number;
  defectiveOutput: number;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  downtimeMinutes: number;
  downtimeReasons?: string;
  isValidated: boolean;
  validatedAt?: DateTime;
  validatedBy?: string;
  notes?: string;
  createdAt: DateTime;
  createdBy: string;
}

export interface CreateOeeRecordRequest {
  workCenterId: string;
  recordDate: string;
  plannedProductionTime: number;
  actualRunTime: number;
  plannedOutput: number;
  actualOutput: number;
  goodOutput: number;
  defectiveOutput: number;
  downtimeMinutes: number;
  downtimeReasons?: string;
  notes?: string;
}

export interface DashboardOeeSummaryDto {
  averageOee: number;
  averageAvailability: number;
  averagePerformance: number;
  averageQuality: number;
  workCenterBreakdown: WorkCenterOeeDto[];
  trendData: OeeTrendDataDto[];
}

export interface WorkCenterOeeDto {
  workCenterId: string;
  workCenterName: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface OeeTrendDataDto {
  date: DateTime;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

// Performance Summaries
export interface ProductionPerformanceSummaryListDto {
  id: string;
  periodType: PeriodType;
  periodStart: DateTime;
  periodEnd: DateTime;
  totalOrders: number;
  completedOrders: number;
  onTimeDelivery: number;
  averageOee: number;
  qualityRate: number;
}

// Dashboard KPI Cards
export interface DashboardKpiCardDto {
  kpiId: string;
  kpiName: string;
  kpiCode: string;
  category: KpiCategory;
  currentValue: number;
  targetValue?: number;
  unit: string;
  variance?: number;
  trend: string;
  status: string;
  lastUpdated: DateTime;
}

// =====================================
// FILTER INTERFACES
// =====================================

export interface BomFilterParams {
  status?: BomStatus;
  productId?: string;
  activeOnly?: boolean;
  defaultOnly?: boolean;
}

export interface ProductionOrderFilterParams {
  status?: ProductionOrderStatus;
  productId?: string;
  startDate?: string;
  endDate?: string;
  activeOnly?: boolean;
  overdueOnly?: boolean;
}

export interface WorkCenterFilterParams {
  activeOnly?: boolean;
  type?: WorkCenterType;
}

export interface RoutingFilterParams {
  status?: RoutingStatus;
  productId?: string;
  activeOnly?: boolean;
  defaultOnly?: boolean;
}

export interface MpsFilterParams {
  status?: MpsStatus;
  startDate?: string;
  endDate?: string;
  activeOnly?: boolean;
}

export interface MpsLineFilterParams {
  scheduleId?: string;
  productId?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface MrpPlanFilterParams {
  status?: MrpPlanStatus;
  type?: MrpPlanType;
  startDate?: string;
  endDate?: string;
}

export interface PlannedOrderFilterParams {
  planId?: string;
  productId?: string;
  status?: PlannedOrderStatus;
}

export interface QualityInspectionFilterParams {
  inspectionType?: InspectionType;
  result?: InspectionResult;
  productId?: string;
  productionOrderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CapacityPlanFilterParams {
  status?: CapacityPlanStatus;
  mrpPlanId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CapacityRequirementFilterParams {
  planId?: string;
  workCenterId?: string;
  startDate?: string;
  endDate?: string;
  onlyOverloaded?: boolean;
}

export interface CostRecordFilterParams {
  year?: number;
  month?: number;
  accountingMethod?: AccountingMethod;
  productionOrderId?: string;
  productId?: string;
  costCenterId?: string;
  isFinalized?: boolean;
}

export interface CostCenterFilterParams {
  type?: CostCenterType;
  activeOnly?: boolean;
}

export interface StandardCostFilterParams {
  productId?: string;
  year?: number;
  currentOnly?: boolean;
}

export interface MaintenanceRecordFilterParams {
  status?: MaintenanceRecordStatus;
  startDate?: string;
  endDate?: string;
}

export interface SubcontractOrderFilterParams {
  status?: SubcontractOrderStatus;
  subcontractorId?: string;
  productionOrderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface KpiValueFilterParams {
  kpiDefinitionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface OeeFilterParams {
  workCenterId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PerformanceSummaryFilterParams {
  periodType?: PeriodType;
  startDate?: string;
  endDate?: string;
}

// =====================================
// MANUFACTURING DASHBOARD
// =====================================

export interface ManufacturingDashboardAlert {
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  message: string;
  timestamp?: DateTime;
}

export interface ManufacturingDashboardMaintenanceItem {
  workCenterId: string;
  workCenterName: string;
  maintenanceType: string;
  scheduledDate: DateTime;
}

export interface ManufacturingDashboardProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productCode: string;
  quantity: number;
  status: string;
  plannedStartDate: DateTime;
  priority: string;
}

export interface ManufacturingDashboardDto {
  // Production Stats
  activeProductionOrders: number;
  todaysOrders: number;
  overdueOrders: number;
  completedToday: number;

  // KPIs
  oeePercentage: number;
  qualityRate: number;
  onTimeDeliveryRate: number;
  capacityUtilization: number;

  // Recent Data
  recentProductionOrders: ManufacturingDashboardProductionOrder[];
  alerts: ManufacturingDashboardAlert[];
  upcomingMaintenance: ManufacturingDashboardMaintenanceItem[];
}

// =====================================
// SIMPLIFIED LIST DTOs FOR HOOKS
// =====================================

export interface NCRListDto {
  id: string;
  ncrNumber: string;
  title: string;
  category: NCRCategory;
  status: NCRStatus;
  severity: NcrSeverity;
  reportedDate: DateTime;
}

export type NCRCategory = 'Material' | 'Process' | 'Product' | 'Supplier' | 'Customer';
export type NCRStatus = 'Open' | 'UnderReview' | 'Resolved' | 'Closed';

export interface CAPAListDto {
  id: string;
  capaNumber: string;
  title: string;
  type: CAPAType;
  status: CAPAStatus;
  targetDate: DateTime;
  completionRate: number;
}

export type CAPAType = 'Corrective' | 'Preventive';
export type CAPAStatus = 'Draft' | 'Open' | 'InProgress' | 'PendingVerification' | 'Closed';


// Updated for Cost Accounting
export interface ProductCostListDto {
  productId: string;
  productName: string;
  productCode: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  lastCalculatedAt?: DateTime;
}

// Updated for Maintenance Orders
export interface MaintenanceOrderListDto {
  id: string;
  orderNumber: string;
  workCenterId: string;
  workCenterName: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceOrderStatus;
  description?: string;
  scheduledDate: DateTime;
  completedDate?: DateTime;
}

export type MaintenanceOrderStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';

// Updated for Subcontract Orders
export interface SubcontractOrderListDto {
  id: string;
  orderNumber: string;
  subcontractorId: string;
  subcontractorName: string;
  productId: string;
  productName: string;
  productCode: string;
  status: SubcontractOrderStatus;
  orderedQuantity: number;
  receivedQuantity: number;
  totalAmount: number;
  expectedDeliveryDate: DateTime;
}
