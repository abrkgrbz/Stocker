# Manufacturing Module API Endpoints

Stocker ERP - Manufacturing modülünün tüm API endpointleri ve response yapıları.

**Base URL**: `api/manufacturing/`
**Authentication**: Bearer Token (JWT)
**Response Format**: JSON

---

## İçindekiler

1. [Bill of Materials (BOM)](#1-bill-of-materials-billofmaterials)
2. [Production Orders](#2-production-orders-productionorders)
3. [Work Centers](#3-work-centers-workcenters)
4. [Routings](#4-routings-routings)
5. [Master Production Schedules (MPS)](#5-master-production-schedules-masterproductionschedules)
6. [Material Reservations](#6-material-reservations-materialreservations)
7. [MRP Plans](#7-mrp-plans-mrpplans)
8. [Quality Inspections](#8-quality-inspections-qualityinspections)
9. [Capacity Plans](#9-capacity-plans-capacityplans)
10. [Cost Accounting](#10-cost-accounting-cost-accounting)
11. [Maintenance](#11-maintenance-maintenance)
12. [Quality Management (NCR & CAPA)](#12-quality-management-quality)
13. [Subcontract Orders](#13-subcontract-orders-subcontractorders)
14. [KPI Dashboard](#14-kpi-dashboard-kpidashboard)

---

## 1. Bill of Materials (`/billofmaterials`)

Ürün reçeteleri yönetimi.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/billofmaterials` | GET | Query: `status`, `productId`, `activeOnly`, `defaultOnly` | `IReadOnlyList<BillOfMaterialListDto>` | BOM listesi |
| `/billofmaterials/{id}` | GET | - | `BillOfMaterialDto` | BOM detayı |
| `/billofmaterials` | POST | `CreateBillOfMaterialRequest` | `BillOfMaterialDto` | Yeni BOM oluştur |
| `/billofmaterials/{id}` | PUT | `UpdateBillOfMaterialRequest` | `BillOfMaterialDto` | BOM güncelle |
| `/billofmaterials/{id}/approve` | POST | - | `{message: string}` | BOM onayla |
| `/billofmaterials/{id}/activate` | POST | - | `{message: string}` | BOM aktifleştir |
| `/billofmaterials/{id}` | DELETE | - | 204 | BOM sil |

### Request/Response Yapıları

```typescript
// CreateBillOfMaterialRequest
{
  productId: string;
  version: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  items: BomItemRequest[];
}

// BomItemRequest
{
  materialId: string;
  quantity: number;
  unitOfMeasure: string;
  scrapPercentage?: number;
  position: number;
  notes?: string;
}

// BillOfMaterialDto
{
  id: string;
  bomNumber: string;
  productId: string;
  productName: string;
  productCode: string;
  version: string;
  description?: string;
  status: BomStatus; // Draft, Approved, Active, Obsolete
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  items: BomItemDto[];
  createdAt: string;
  createdBy: string;
}
```

---

## 2. Production Orders (`/productionorders`)

Üretim emirleri yönetimi.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/productionorders` | GET | Query: `status`, `productId`, `startDate`, `endDate`, `activeOnly`, `overdueOnly` | `IReadOnlyList<ProductionOrderListDto>` | Emir listesi |
| `/productionorders/{id}` | GET | - | `ProductionOrderDto` | Emir detayı |
| `/productionorders` | POST | `CreateProductionOrderRequest` | `ProductionOrderListDto` | Yeni emir oluştur |
| `/productionorders/{id}/approve` | POST | - | `{message: string}` | Emir onayla |
| `/productionorders/{id}/release` | POST | - | `{message: string}` | Üretime serbest bırak |
| `/productionorders/{id}/start` | POST | `StartProductionOrderRequest` | `{message: string}` | Üretimi başlat |
| `/productionorders/{id}/complete` | POST | `CompleteProductionOrderRequest` | `{message: string}` | Üretimi tamamla |
| `/productionorders/{id}/cancel` | POST | `{reason: string}` | `{message: string}` | Emri iptal et |

### Request/Response Yapıları

```typescript
// CreateProductionOrderRequest
{
  productId: string;
  billOfMaterialId: string;
  routingId?: string;
  plannedQuantity: number;
  unitOfMeasure: string;
  plannedStartDate: string;
  plannedEndDate: string;
  priority: OrderPriority; // Low, Normal, High, Urgent
  notes?: string;
}

// ProductionOrderStatus
enum ProductionOrderStatus {
  Draft = 0,
  Planned = 1,
  Approved = 2,
  Released = 3,
  InProgress = 4,
  Completed = 5,
  Closed = 6,
  Cancelled = 7
}

// ProductionOrderDto
{
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
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  priority: OrderPriority;
  operations: ProductionOperationDto[];
  materialRequirements: MaterialRequirementDto[];
}
```

---

## 3. Work Centers (`/workcenters`)

İş merkezleri yönetimi.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/workcenters` | GET | Query: `activeOnly`, `type` | `IReadOnlyList<WorkCenterListDto>` | İş merkezi listesi |
| `/workcenters/{id}` | GET | - | `WorkCenterDto` | İş merkezi detayı |
| `/workcenters` | POST | `CreateWorkCenterRequest` | `WorkCenterDto` | Yeni iş merkezi |
| `/workcenters/{id}` | PUT | `UpdateWorkCenterRequest` | `WorkCenterDto` | Güncelle |
| `/workcenters/{id}` | DELETE | - | 204 | Sil |
| `/workcenters/{id}/activate` | POST | - | `{message: string}` | Aktifleştir |
| `/workcenters/{id}/deactivate` | POST | - | `{message: string}` | Deaktif et |

### Request/Response Yapıları

```typescript
// CreateWorkCenterRequest
{
  code: string;
  name: string;
  description?: string;
  type: WorkCenterType; // Machine, Labor, Subcontract, Mixed
  costCenterId?: string;
  capacityPerHour: number;
  setupTime: number;
  efficiency: number; // percentage 0-100
  hourlyRate: number;
  setupCost: number;
}

// WorkCenterDto
{
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
}
```

---

## 4. Routings (`/routings`)

Üretim rotaları yönetimi.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/routings` | GET | Query: `status`, `productId`, `activeOnly`, `defaultOnly` | `IReadOnlyList<RoutingListDto>` | Rota listesi |
| `/routings/{id}` | GET | - | `RoutingDto` | Rota detayı |
| `/routings` | POST | `CreateRoutingRequest` | `RoutingDto` | Yeni rota |
| `/routings/{id}` | PUT | `UpdateRoutingRequest` | `RoutingDto` | Güncelle |
| `/routings/{id}/approve` | POST | - | `{message: string}` | Onayla |
| `/routings/{id}/activate` | POST | - | `{message: string}` | Aktifleştir |
| `/routings/{id}` | DELETE | - | 204 | Sil |

### Request/Response Yapıları

```typescript
// CreateRoutingRequest
{
  productId: string;
  version: string;
  description?: string;
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  operations: RoutingOperationRequest[];
}

// RoutingOperationRequest
{
  operationNumber: number;
  workCenterId: string;
  operationName: string;
  description?: string;
  setupTime: number; // minutes
  runTime: number; // minutes per unit
  waitTime: number; // minutes
  moveTime: number; // minutes
  overlapPercentage?: number;
}

// RoutingDto
{
  id: string;
  routingNumber: string;
  productId: string;
  productName: string;
  version: string;
  status: RoutingStatus; // Draft, Approved, Active, Obsolete
  effectiveDate: string;
  expiryDate?: string;
  isDefault: boolean;
  totalSetupTime: number;
  totalRunTime: number;
  operations: RoutingOperationDto[];
}
```

---

## 5. Master Production Schedules (`/masterproductionschedules`)

Ana üretim planlaması (MPS).

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/masterproductionschedules` | GET | Query: `status`, `startDate`, `endDate`, `activeOnly` | `IReadOnlyList<MasterProductionScheduleListDto>` | MPS listesi |
| `/masterproductionschedules/{id}` | GET | - | `MasterProductionScheduleDto` | MPS detayı |
| `/masterproductionschedules` | POST | `CreateMasterProductionScheduleRequest` | `MasterProductionScheduleDto` | Yeni MPS |
| `/masterproductionschedules/{id}` | PUT | `UpdateMasterProductionScheduleRequest` | `MasterProductionScheduleDto` | Güncelle |
| `/masterproductionschedules/{id}/approve` | POST | - | `{message: string}` | Onayla |
| `/masterproductionschedules/{id}/activate` | POST | - | `{message: string}` | Aktifleştir |
| `/masterproductionschedules/{id}` | DELETE | - | 204 | Sil |
| `/masterproductionschedules/lines` | GET | Query: `scheduleId`, `productId`, `periodStart`, `periodEnd` | `IReadOnlyList<MpsLineListDto>` | MPS satırları |
| `/masterproductionschedules/{scheduleId}/lines` | POST | `AddMpsLineRequest` | `MpsLineDto` | Satır ekle |
| `/masterproductionschedules/{scheduleId}/lines/{lineId}` | PUT | `UpdateMpsLineRequest` | `MpsLineDto` | Satır güncelle |
| `/masterproductionschedules/{scheduleId}/lines/{lineId}/actuals` | POST | `RecordActualsRequest` | `MpsLineDto` | Gerçekleşen kaydet |
| `/masterproductionschedules/{scheduleId}/lines/{lineId}` | DELETE | - | 204 | Satır sil |
| `/masterproductionschedules/atp` | GET | Query: `productId`, `date` | `AtpQueryResponse` | ATP sorgu |

### Request/Response Yapıları

```typescript
// CreateMasterProductionScheduleRequest
{
  name: string;
  description?: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  periodType: PeriodType; // Daily, Weekly, Monthly
}

// AddMpsLineRequest
{
  productId: string;
  periodStart: string;
  periodEnd: string;
  forecastQuantity: number;
  plannedProductionQuantity: number;
  safetyStock: number;
}

// AtpQueryResponse
{
  productId: string;
  productName: string;
  queryDate: string;
  availableToPromise: number;
  onHandQuantity: number;
  reservedQuantity: number;
  plannedReceipts: number;
  forecastDemand: number;
}
```

---

## 6. Material Reservations (`/materialreservations`)

Malzeme rezervasyonları yönetimi.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/materialreservations` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Rezervasyon listesi |
| `/materialreservations/{id}` | GET | - | `MaterialReservationDto` | Rezervasyon detayı |
| `/materialreservations/active` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Aktif rezervasyonlar |
| `/materialreservations/by-status/{status}` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Duruma göre filtre |
| `/materialreservations/by-product/{productId}` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Ürüne göre filtre |
| `/materialreservations/by-production-order/{productionOrderId}` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Üretim emrine göre |
| `/materialreservations/by-warehouse/{warehouseId}` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Depoya göre |
| `/materialreservations/urgent` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Acil rezervasyonlar |
| `/materialreservations/pending-approval` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Onay bekleyenler |
| `/materialreservations/by-required-date-range` | GET | Query: `startDate`, `endDate` | `IReadOnlyList<MaterialReservationListDto>` | Tarihe göre |
| `/materialreservations/by-lot/{lotNumber}` | GET | - | `IReadOnlyList<MaterialReservationListDto>` | Lota göre |
| `/materialreservations/summary` | GET | - | `MaterialReservationSummaryDto` | Özet |
| `/materialreservations/summary/by-product/{productId}` | GET | - | `ProductReservationSummaryDto` | Ürün özeti |
| `/materialreservations` | POST | `CreateMaterialReservationRequest` | `MaterialReservationListDto` | Oluştur |
| `/materialreservations/{id}` | PUT | `UpdateMaterialReservationRequest` | `MaterialReservationListDto` | Güncelle |
| `/materialreservations/{id}/approve` | POST | `ApproveMaterialReservationRequest` | `MaterialReservationListDto` | Onayla |
| `/materialreservations/{id}/allocate` | POST | `AllocateMaterialRequest` | `MaterialReservationAllocationDto` | Tahsis et |
| `/materialreservations/{id}/issue` | POST | `IssueMaterialRequest` | `MaterialReservationIssueDto` | Çıkış yap |
| `/materialreservations/{id}/return` | POST | `ReturnMaterialRequest` | `MaterialReservationIssueDto` | İade |
| `/materialreservations/{reservationId}/allocations/{allocationId}/cancel` | POST | Query: `reason` | `MaterialReservationListDto` | Tahsisi iptal |
| `/materialreservations/{id}/complete` | POST | - | `MaterialReservationListDto` | Tamamla |
| `/materialreservations/{id}/cancel` | POST | Query: `reason` | `MaterialReservationListDto` | İptal |

### Request/Response Yapıları

```typescript
// CreateMaterialReservationRequest
{
  productionOrderId: string;
  productId: string;
  warehouseId: string;
  requiredQuantity: number;
  requiredDate: string;
  priority: ReservationPriority; // Low, Normal, High, Urgent
  lotNumber?: string;
  notes?: string;
}

// MaterialReservationSummaryDto
{
  totalReservations: number;
  pendingReservations: number;
  approvedReservations: number;
  allocatedReservations: number;
  totalReservedQuantity: number;
  totalAllocatedQuantity: number;
  totalIssuedQuantity: number;
}
```

---

## 7. MRP Plans (`/mrpplans`)

Malzeme İhtiyaç Planlaması (MRP).

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/mrpplans` | GET | Query: `status`, `type`, `startDate`, `endDate` | `IReadOnlyList<MrpPlanListDto>` | Plan listesi |
| `/mrpplans/{id}` | GET | - | `MrpPlanDto` | Plan detayı |
| `/mrpplans` | POST | `CreateMrpPlanRequest` | `MrpPlanDto` | Yeni plan |
| `/mrpplans/{id}/execute` | POST | `ExecuteMrpPlanRequest` | `{message: string}` | Planı çalıştır |
| `/mrpplans/{id}/approve` | POST | - | `{message: string}` | Onayla |
| `/mrpplans/{id}` | DELETE | - | 204 | Sil |
| `/mrpplans/planned-orders` | GET | Query: `planId`, `productId`, `status` | `IReadOnlyList<PlannedOrderListDto>` | Planlı siparişler |
| `/mrpplans/{planId}/planned-orders/{orderId}/confirm` | POST | `ConfirmPlannedOrderRequest` | `{message: string}` | Onayla |
| `/mrpplans/{planId}/planned-orders/{orderId}/release` | POST | `ReleasePlannedOrderRequest` | `{message: string}` | Serbest bırak |
| `/mrpplans/{planId}/planned-orders/{orderId}/convert` | POST | `ConvertPlannedOrderRequest` | `{message, convertedOrderId}` | Siparişe dönüştür |
| `/mrpplans/exceptions` | GET | Query: `planId`, `unresolvedOnly` | `IReadOnlyList<MrpExceptionDto>` | İstisnalar |
| `/mrpplans/{planId}/exceptions/{exceptionId}/resolve` | POST | `ResolveMrpExceptionRequest` | `{message: string}` | İstisna çöz |

### Request/Response Yapıları

```typescript
// CreateMrpPlanRequest
{
  name: string;
  description?: string;
  planType: MrpPlanType; // Regenerative, NetChange
  planningHorizonStart: string;
  planningHorizonEnd: string;
  includeSafetyStock: boolean;
  includeLeadTimes: boolean;
}

// MrpPlanDto
{
  id: string;
  planNumber: string;
  name: string;
  status: MrpPlanStatus;
  planType: MrpPlanType;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  executedAt?: string;
  plannedOrders: PlannedOrderDto[];
  exceptions: MrpExceptionDto[];
}

// PlannedOrderDto
{
  id: string;
  productId: string;
  productName: string;
  orderType: PlannedOrderType; // Purchase, Production
  plannedQuantity: number;
  requiredDate: string;
  releaseDate: string;
  status: PlannedOrderStatus;
}
```

---

## 8. Quality Inspections (`/qualityinspections`)

Kalite denetimleri yönetimi.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/qualityinspections` | GET | Query: `inspectionType`, `result`, `productId`, `productionOrderId`, `startDate`, `endDate` | `IReadOnlyList<QualityInspectionListDto>` | Denetim listesi |
| `/qualityinspections/{id}` | GET | - | `QualityInspectionDto` | Denetim detayı |
| `/qualityinspections` | POST | `CreateQualityInspectionRequest` | `QualityInspectionDto` | Yeni denetim |
| `/qualityinspections/{id}/start` | POST | `StartInspectionRequest` | `{message: string}` | Başlat |
| `/qualityinspections/{id}/result` | POST | `RecordInspectionResultRequest` | `{message: string}` | Sonuç kaydet |
| `/qualityinspections/{id}/nonconformance` | POST | `RecordNonConformanceRequest` | `{message: string}` | Uygunsuzluk kaydet |
| `/qualityinspections/{id}/disposition` | POST | `SetDispositionRequest` | `{message: string}` | Karar ver |
| `/qualityinspections/{id}/complete` | POST | - | `{message: string}` | Tamamla |
| `/qualityinspections/open` | GET | - | `IReadOnlyList<QualityInspectionListDto>` | Açık denetimler |
| `/qualityinspections/nonconformance` | GET | - | `IReadOnlyList<QualityInspectionListDto>` | Uygunsuzluklar |

### Request/Response Yapıları

```typescript
// CreateQualityInspectionRequest
{
  productionOrderId?: string;
  productId: string;
  inspectionType: InspectionType; // Incoming, InProcess, Final, Random
  inspectionPlanId?: string;
  sampleSize: number;
  notes?: string;
}

// RecordInspectionResultRequest
{
  result: InspectionResult; // Pass, Fail, Conditional
  passedQuantity: number;
  failedQuantity: number;
  inspectorNotes?: string;
  measurements?: InspectionMeasurement[];
}

// QualityInspectionDto
{
  id: string;
  inspectionNumber: string;
  productionOrderId?: string;
  productId: string;
  productName: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  result?: InspectionResult;
  sampleSize: number;
  passedQuantity?: number;
  failedQuantity?: number;
  disposition?: Disposition;
  measurements: InspectionMeasurementDto[];
  nonConformances: NonConformanceDto[];
}
```

---

## 9. Capacity Plans (`/capacityplans`)

Kapasite planlama.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/capacityplans` | GET | Query: `status`, `mrpPlanId`, `startDate`, `endDate` | `IReadOnlyList<CapacityPlanListDto>` | Plan listesi |
| `/capacityplans/{id}` | GET | - | `CapacityPlanDto` | Plan detayı |
| `/capacityplans` | POST | `CreateCapacityPlanRequest` | `CapacityPlanDto` | Yeni plan |
| `/capacityplans/{id}/execute` | POST | `ExecuteCapacityPlanRequest` | `{message: string}` | Çalıştır |
| `/capacityplans/{id}/approve` | POST | - | `{message: string}` | Onayla |
| `/capacityplans/{id}/cancel` | POST | - | `{message: string}` | İptal |
| `/capacityplans/{id}` | DELETE | - | 204 | Sil |
| `/capacityplans/requirements` | GET | Query: `planId`, `workCenterId`, `startDate`, `endDate`, `onlyOverloaded` | `IReadOnlyList<CapacityRequirementDto>` | Gereksinimler |
| `/capacityplans/{planId}/exceptions` | GET | Query: `onlyUnresolved` | `IReadOnlyList<CapacityExceptionDto>` | İstisnalar |
| `/capacityplans/{planId}/exceptions/{exceptionId}/resolve` | POST | `ResolveCapacityExceptionRequest` | `{message: string}` | İstisna çöz |
| `/capacityplans/workcenter-overview` | GET | Query: `workCenterIds[]`, `startDate`, `endDate` | `IReadOnlyList<WorkCenterCapacityOverviewDto>` | İş merkezi özeti |

### Request/Response Yapıları

```typescript
// CreateCapacityPlanRequest
{
  name: string;
  description?: string;
  mrpPlanId?: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  includeSetupTimes: boolean;
  includeEfficiency: boolean;
}

// WorkCenterCapacityOverviewDto
{
  workCenterId: string;
  workCenterName: string;
  periodStart: string;
  periodEnd: string;
  availableCapacity: number;
  requiredCapacity: number;
  utilizationPercentage: number;
  isOverloaded: boolean;
}
```

---

## 10. Cost Accounting (`/cost-accounting`)

Üretim maliyetlendirme.

### Production Cost Records

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/cost-accounting/records` | GET | Query: `year`, `month`, `accountingMethod`, `productionOrderId`, `productId`, `costCenterId`, `isFinalized` | `IReadOnlyList<ProductionCostRecordListDto>` | Kayıt listesi |
| `/cost-accounting/records/{id}` | GET | - | `ProductionCostRecordDto` | Kayıt detayı |
| `/cost-accounting/records` | POST | `CreateProductionCostRecordRequest` | `ProductionCostRecordDto` | Yeni kayıt |
| `/cost-accounting/records/{id}/direct-costs` | PUT | `SetProductionDirectCostsRequest` | `{message: string}` | Direkt maliyet |
| `/cost-accounting/records/{id}/overhead-costs` | PUT | `SetOverheadCostsRequest` | `{message: string}` | Genel gider |
| `/cost-accounting/records/{id}/variances` | PUT | `SetVariancesRequest` | `{message: string}` | Sapmalar |
| `/cost-accounting/records/{id}/finalize` | POST | - | `{message: string}` | Kesinleştir |
| `/cost-accounting/records/{recordId}/allocations` | POST | `AddCostAllocationRequest` | `ProductionCostAllocationDto` | Dağıtım ekle |
| `/cost-accounting/records/{recordId}/journal-entries` | POST | `AddJournalEntryRequest` | `CostJournalEntryDto` | Yevmiye ekle |
| `/cost-accounting/records/{recordId}/journal-entries/{entryId}/post` | POST | - | `{message: string}` | Yevmiye kaydet |
| `/cost-accounting/records/{id}` | DELETE | - | 204 | Sil |
| `/cost-accounting/summary` | GET | Query: `year`, `month` | `CostSummaryDto` | Özet |

### Cost Centers

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/cost-accounting/cost-centers` | GET | Query: `type`, `activeOnly` | `IReadOnlyList<CostCenterListDto>` | Merkez listesi |
| `/cost-accounting/cost-centers/{id}` | GET | - | `CostCenterDto` | Merkez detayı |
| `/cost-accounting/cost-centers` | POST | `CreateCostCenterRequest` | `CostCenterDto` | Yeni merkez |
| `/cost-accounting/cost-centers/{id}` | PUT | `UpdateCostCenterRequest` | `{message: string}` | Güncelle |
| `/cost-accounting/cost-centers/{id}/activate` | POST | - | `{message: string}` | Aktifleştir |
| `/cost-accounting/cost-centers/{id}/deactivate` | POST | - | `{message: string}` | Deaktif et |
| `/cost-accounting/cost-centers/{id}` | DELETE | - | 204 | Sil |

### Standard Cost Cards

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/cost-accounting/standard-costs` | GET | Query: `productId`, `year`, `currentOnly` | `IReadOnlyList<StandardCostCardListDto>` | Kart listesi |
| `/cost-accounting/standard-costs/{id}` | GET | - | `StandardCostCardDto` | Kart detayı |
| `/cost-accounting/standard-costs/product/{productId}/current` | GET | - | `StandardCostCardDto` | Güncel kart |
| `/cost-accounting/standard-costs` | POST | `CreateStandardCostCardRequest` | `StandardCostCardDto` | Yeni kart |
| `/cost-accounting/standard-costs/{id}/approve` | POST | - | `{message: string}` | Onayla |
| `/cost-accounting/standard-costs/{id}/set-current` | POST | - | `{message: string}` | Güncel yap |
| `/cost-accounting/standard-costs/{id}` | DELETE | - | 204 | Sil |

---

## 11. Maintenance (`/maintenance`)

Bakım yönetimi.

### Maintenance Plans

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/maintenance/plans` | GET | - | `IReadOnlyList<MaintenancePlanListDto>` | Plan listesi |
| `/maintenance/plans/active` | GET | - | `IReadOnlyList<MaintenancePlanListDto>` | Aktif planlar |
| `/maintenance/plans/due` | GET | Query: `asOfDate` | `IReadOnlyList<MaintenancePlanListDto>` | Vadesi gelen |
| `/maintenance/plans/overdue` | GET | Query: `asOfDate` | `IReadOnlyList<MaintenancePlanListDto>` | Geciken |
| `/maintenance/plans/upcoming` | GET | Query: `startDate`, `endDate` | `IReadOnlyList<MaintenancePlanListDto>` | Yaklaşan |
| `/maintenance/plans/{id}` | GET | - | `MaintenancePlanDto` | Plan detayı |
| `/maintenance/plans` | POST | `CreateMaintenancePlanRequest` | `MaintenancePlanDto` | Yeni plan |
| `/maintenance/plans/{id}` | PUT | `UpdateMaintenancePlanRequest` | 204 | Güncelle |
| `/maintenance/plans/{id}/activate` | POST | - | 204 | Aktifleştir |
| `/maintenance/plans/{id}/suspend` | POST | - | 204 | Askıya al |
| `/maintenance/plans/{id}/approve` | POST | Query: `approvedBy` | 204 | Onayla |
| `/maintenance/plans/{id}` | DELETE | - | 204 | Sil |

### Maintenance Tasks

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/maintenance/tasks` | POST | `CreateMaintenanceTaskRequest` | `MaintenanceTaskDto` | Yeni görev |
| `/maintenance/tasks/{id}` | PUT | `UpdateMaintenanceTaskRequest` | 204 | Güncelle |
| `/maintenance/tasks/{id}` | DELETE | - | 204 | Sil |

### Maintenance Records

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/maintenance/records` | GET | Query: `status`, `startDate`, `endDate` | `IReadOnlyList<MaintenanceRecordListDto>` | Kayıt listesi |
| `/maintenance/records/pending` | GET | - | `IReadOnlyList<MaintenanceRecordListDto>` | Bekleyenler |
| `/maintenance/records/{id}` | GET | - | `MaintenanceRecordDto` | Kayıt detayı |
| `/maintenance/records` | POST | `CreateMaintenanceRecordRequest` | `MaintenanceRecordDto` | Yeni kayıt |
| `/maintenance/records/{id}` | PUT | `UpdateMaintenanceRecordRequest` | 204 | Güncelle |
| `/maintenance/records/{id}/start` | POST | `StartMaintenanceRecordRequest` | 204 | Başlat |
| `/maintenance/records/{id}/complete` | POST | `CompleteMaintenanceRecordRequest` | 204 | Tamamla |
| `/maintenance/records/{id}/approve` | POST | Query: `approvedBy` | 204 | Onayla |
| `/maintenance/records/{id}/cancel` | POST | - | 204 | İptal |

### Spare Parts

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/maintenance/records/spare-parts` | POST | `AddMaintenanceRecordSparePartRequest` | `MaintenanceRecordSparePartDto` | Yedek parça ekle |
| `/maintenance/spare-parts` | GET | - | `IReadOnlyList<SparePartListDto>` | Parça listesi |
| `/maintenance/spare-parts/search` | GET | Query: `searchTerm` | `IReadOnlyList<SparePartListDto>` | Ara |
| `/maintenance/spare-parts/{id}` | GET | - | `SparePartDto` | Parça detayı |
| `/maintenance/spare-parts` | POST | `CreateSparePartRequest` | `SparePartDto` | Yeni parça |
| `/maintenance/spare-parts/{id}` | PUT | `UpdateSparePartRequest` | 204 | Güncelle |
| `/maintenance/spare-parts/{id}/activate` | POST | - | 204 | Aktifleştir |
| `/maintenance/spare-parts/{id}/deactivate` | POST | - | 204 | Deaktif et |
| `/maintenance/spare-parts/{id}` | DELETE | - | 204 | Sil |

### Machine Counters

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/maintenance/counters/machine/{machineId}` | GET | - | `IReadOnlyList<MachineCounterListDto>` | Sayaç listesi |
| `/maintenance/counters/critical` | GET | - | `IReadOnlyList<MachineCounterListDto>` | Kritik sayaçlar |
| `/maintenance/counters` | POST | `CreateMachineCounterRequest` | `MachineCounterDto` | Yeni sayaç |
| `/maintenance/counters/{id}/value` | PUT | `UpdateMachineCounterValueRequest` | 204 | Değer güncelle |
| `/maintenance/counters/{id}/reset` | POST | `ResetMachineCounterRequest` | 204 | Sıfırla |

### Dashboard

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/maintenance/dashboard` | GET | - | `MaintenanceDashboardDto` | Dashboard |
| `/maintenance/summary` | GET | Query: `periodStart`, `periodEnd` | `MaintenanceSummaryDto` | Özet |

---

## 12. Quality Management (`/quality`)

Kalite yönetimi (NCR & CAPA).

### Non-Conformance Reports (NCR)

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/quality/ncr` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | NCR listesi |
| `/quality/ncr/{id}` | GET | - | `NonConformanceReportDto` | NCR detayı |
| `/quality/ncr/open` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Açık NCR'ler |
| `/quality/ncr/by-status/{status}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Duruma göre |
| `/quality/ncr/by-source/{source}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Kaynağa göre |
| `/quality/ncr/by-severity/{severity}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Ciddiyete göre |
| `/quality/ncr/by-product/{productId}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Ürüne göre |
| `/quality/ncr/by-production-order/{productionOrderId}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Emre göre |
| `/quality/ncr/by-customer/{customerId}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Müşteriye göre |
| `/quality/ncr/by-supplier/{supplierId}` | GET | - | `IReadOnlyList<NonConformanceReportListDto>` | Tedarikçiye göre |
| `/quality/ncr/by-date-range` | GET | Query: `startDate`, `endDate` | `IReadOnlyList<NonConformanceReportListDto>` | Tarihe göre |
| `/quality/ncr/statistics` | GET | Query: `startDate`, `endDate` | `NcrStatisticsDto` | İstatistikler |
| `/quality/ncr` | POST | `CreateNcrRequest` | `NonConformanceReportListDto` | NCR oluştur |
| `/quality/ncr/{id}` | PUT | `UpdateNcrRequest` | `NonConformanceReportListDto` | Güncelle |
| `/quality/ncr/{id}/start-investigation` | POST | `StartNcrInvestigationRequest` | `NonConformanceReportListDto` | Araştırma başlat |
| `/quality/ncr/{id}/complete-investigation` | POST | - | `NonConformanceReportListDto` | Araştırma tamamla |
| `/quality/ncr/{id}/set-root-cause` | POST | `SetNcrRootCauseRequest` | `NonConformanceReportListDto` | Kök neden belirle |
| `/quality/ncr/{id}/set-disposition` | POST | `SetNcrDispositionRequest` | `NonConformanceReportListDto` | Karar ver |
| `/quality/ncr/{id}/containment-actions` | POST | `AddNcrContainmentActionRequest` | `NcrContainmentActionDto` | Önlem ekle |
| `/quality/ncr/{ncrId}/containment-actions/{actionId}/complete` | POST | `CompleteNcrContainmentActionRequest` | `NcrContainmentActionDto` | Önlem tamamla |
| `/quality/ncr/{id}/close` | POST | `CloseNcrRequest` | `NonConformanceReportListDto` | Kapat |
| `/quality/ncr/{id}/cancel` | POST | Query: `reason` | `NonConformanceReportListDto` | İptal |

### Corrective & Preventive Actions (CAPA)

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/quality/capa` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | CAPA listesi |
| `/quality/capa/{id}` | GET | - | `CorrectivePreventiveActionDto` | CAPA detayı |
| `/quality/capa/open` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | Açık CAPA'lar |
| `/quality/capa/overdue` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | Gecikenler |
| `/quality/capa/by-status/{status}` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | Duruma göre |
| `/quality/capa/by-type/{type}` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | Türe göre |
| `/quality/capa/by-ncr/{ncrId}` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | NCR'ye göre |
| `/quality/capa/by-responsible-user/{userId}` | GET | - | `IReadOnlyList<CorrectivePreventiveActionListDto>` | Sorumluya göre |
| `/quality/capa/by-due-date-range` | GET | Query: `startDate`, `endDate` | `IReadOnlyList<CorrectivePreventiveActionListDto>` | Tarihe göre |
| `/quality/capa/statistics` | GET | Query: `startDate`, `endDate` | `CapaStatisticsDto` | İstatistikler |
| `/quality/capa` | POST | `CreateCapaRequest` | `CorrectivePreventiveActionListDto` | CAPA oluştur |
| `/quality/capa/{id}` | PUT | `UpdateCapaRequest` | `CorrectivePreventiveActionListDto` | Güncelle |
| `/quality/capa/{id}/open` | POST | - | `CorrectivePreventiveActionListDto` | Aç |
| `/quality/capa/{id}/start-planning` | POST | - | `CorrectivePreventiveActionListDto` | Planlama başlat |
| `/quality/capa/{id}/start-implementation` | POST | - | `CorrectivePreventiveActionListDto` | Uygulama başlat |
| `/quality/capa/{id}/update-progress` | POST | `UpdateCapaProgressRequest` | `CorrectivePreventiveActionListDto` | İlerleme güncelle |
| `/quality/capa/{id}/complete-implementation` | POST | - | `CorrectivePreventiveActionListDto` | Tamamla |
| `/quality/capa/{id}/verify` | POST | `VerifyCapaRequest` | `CorrectivePreventiveActionListDto` | Doğrula |
| `/quality/capa/{id}/evaluate-effectiveness` | POST | `EvaluateCapaEffectivenessRequest` | `CorrectivePreventiveActionListDto` | Etkinlik değerlendir |
| `/quality/capa/{id}/close` | POST | `CloseCapaRequest` | `CorrectivePreventiveActionListDto` | Kapat |
| `/quality/capa/{id}/cancel` | POST | Query: `reason` | `CorrectivePreventiveActionListDto` | İptal |
| `/quality/capa/{id}/tasks` | POST | `AddCapaTaskRequest` | `CapaTaskDto` | Görev ekle |
| `/quality/capa/{capaId}/tasks/{taskId}/complete` | POST | `CompleteCapaTaskRequest` | `CapaTaskDto` | Görev tamamla |

---

## 13. Subcontract Orders (`/subcontractorders`)

Fason üretim siparişleri.

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/subcontractorders` | GET | Query: `status`, `subcontractorId`, `productionOrderId`, `startDate`, `endDate` | `IReadOnlyList<SubcontractOrderListDto>` | Sipariş listesi |
| `/subcontractorders/{id}` | GET | - | `SubcontractOrderDto` | Sipariş detayı |
| `/subcontractorders` | POST | `CreateSubcontractOrderRequest` | `SubcontractOrderDto` | Yeni sipariş |
| `/subcontractorders/{id}/approve` | POST | - | `{message: string}` | Onayla |
| `/subcontractorders/{id}/ship` | POST | `ShipMaterialRequest` | `SubcontractShipmentDto` | Malzeme gönder |
| `/subcontractorders/{id}/receive` | POST | `ReceiveProductRequest` | `SubcontractShipmentDto` | Ürün al |
| `/subcontractorders/{id}/complete` | POST | - | `{message: string}` | Tamamla |
| `/subcontractorders/{id}/close` | POST | - | `{message: string}` | Kapat |
| `/subcontractorders/{id}/cancel` | POST | - | `{message: string}` | İptal |
| `/subcontractorders/pending-deliveries` | GET | - | `IReadOnlyList<SubcontractOrderListDto>` | Bekleyen teslimatlar |
| `/subcontractorders/overdue` | GET | - | `IReadOnlyList<SubcontractOrderListDto>` | Gecikenler |
| `/subcontractorders/{orderId}/materials` | POST | `AddSubcontractMaterialRequest` | `SubcontractMaterialDto` | Malzeme ekle |
| `/subcontractorders/{orderId}/materials` | GET | - | `IReadOnlyList<SubcontractMaterialDto>` | Malzeme listesi |
| `/subcontractorders/{orderId}/shipments` | GET | - | `IReadOnlyList<SubcontractShipmentDto>` | Sevkiyat listesi |

### Request/Response Yapıları

```typescript
// CreateSubcontractOrderRequest
{
  productionOrderId?: string;
  subcontractorId: string;
  productId: string;
  quantity: number;
  unitOfMeasure: string;
  expectedDeliveryDate: string;
  unitPrice: number;
  notes?: string;
}

// SubcontractOrderDto
{
  id: string;
  orderNumber: string;
  productionOrderId?: string;
  subcontractorId: string;
  subcontractorName: string;
  productId: string;
  productName: string;
  status: SubcontractOrderStatus;
  quantity: number;
  receivedQuantity: number;
  unitOfMeasure: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  unitPrice: number;
  totalPrice: number;
  materials: SubcontractMaterialDto[];
  shipments: SubcontractShipmentDto[];
}
```

---

## 14. KPI Dashboard (`/kpidashboard`)

Üretim performans göstergeleri.

### KPI Definitions

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/kpi-definitions` | GET | - | `IReadOnlyList<KpiDefinitionListDto>` | Tanım listesi |
| `/kpidashboard/kpi-definitions/{id}` | GET | - | `KpiDefinitionDto` | Tanım detayı |
| `/kpidashboard/kpi-definitions` | POST | `CreateKpiDefinitionRequest` | `KpiDefinitionDto` | Yeni tanım |
| `/kpidashboard/kpi-definitions/{id}` | PUT | `UpdateKpiDefinitionRequest` | 204 | Güncelle |
| `/kpidashboard/kpi-definitions/{id}` | DELETE | - | 204 | Sil |

### KPI Values

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/kpi-values` | GET | Query: `kpiDefinitionId`, `startDate`, `endDate` | `IReadOnlyList<KpiValueListDto>` | Değer listesi |
| `/kpidashboard/kpi-values/latest/{kpiDefinitionId}` | GET | - | `KpiValueDto` | Son değer |
| `/kpidashboard/kpi-values` | POST | `CreateKpiValueRequest` | `KpiValueDto` | Yeni değer |
| `/kpidashboard/kpi-values/trend/{kpiDefinitionId}` | GET | Query: `startDate`, `endDate` | `KpiTrendDataDto` | Trend verisi |

### KPI Targets

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/kpi-targets` | POST | `CreateKpiTargetRequest` | `KpiTargetDto` | Yeni hedef |
| `/kpidashboard/kpi-targets/{id}/approve` | POST | - | 204 | Onayla |

### Dashboard Configurations

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/dashboards` | GET | - | `IReadOnlyList<DashboardConfigurationListDto>` | Dashboard listesi |
| `/kpidashboard/dashboards/{id}` | GET | - | `DashboardConfigurationDto` | Dashboard detayı |
| `/kpidashboard/dashboards/default` | GET | - | `DashboardConfigurationDto` | Varsayılan |
| `/kpidashboard/dashboards` | POST | `CreateDashboardConfigurationRequest` | `DashboardConfigurationDto` | Yeni dashboard |
| `/kpidashboard/dashboards/{id}` | PUT | `UpdateDashboardConfigurationRequest` | 204 | Güncelle |
| `/kpidashboard/dashboards/{id}` | DELETE | - | 204 | Sil |

### Dashboard Widgets

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/dashboards/widgets` | POST | `CreateDashboardWidgetRequest` | `DashboardWidgetDto` | Widget ekle |

### OEE Records

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/oee` | GET | Query: `workCenterId`, `startDate`, `endDate` | `IReadOnlyList<OeeRecordListDto>` | OEE listesi |
| `/kpidashboard/oee/{id}` | GET | - | `OeeRecordDto` | OEE detayı |
| `/kpidashboard/oee/summary` | GET | Query: `startDate`, `endDate` | `DashboardOeeSummaryDto` | OEE özeti |
| `/kpidashboard/oee` | POST | `CreateOeeRecordRequest` | `OeeRecordDto` | Yeni OEE kaydı |
| `/kpidashboard/oee/{id}/validate` | POST | - | 204 | Doğrula |

### Performance Summaries

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/performance-summaries` | GET | Query: `periodType`, `startDate`, `endDate` | `IReadOnlyList<ProductionPerformanceSummaryListDto>` | Performans özeti |

### Dashboard Real-Time Data

| Endpoint | Method | Request Body | Response | Açıklama |
|----------|--------|--------------|----------|----------|
| `/kpidashboard/dashboard-data/kpi-cards` | GET | - | `IReadOnlyList<DashboardKpiCardDto>` | KPI kartları |

---

## Özet İstatistikler

| Metrik | Değer |
|--------|-------|
| **Toplam Controller** | 14 |
| **Toplam Endpoint** | ~250+ |
| **Base Route** | `api/manufacturing/` |
| **Authentication** | Bearer Token (JWT) |
| **Response Format** | JSON |
| **Mimari Pattern** | CQRS (MediatR) |

---

## HTTP Status Kodları

| Kod | Anlamı |
|-----|--------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 204 | İçerik Yok (Başarılı) |
| 400 | Hatalı İstek |
| 401 | Yetkisiz |
| 403 | Erişim Reddedildi |
| 404 | Bulunamadı |
| 500 | Sunucu Hatası |

---

## DTO Dosya Konumları

Tüm request/response DTO'ları:
```
src/Modules/Stocker.Modules.Manufacturing/Application/DTOs/
```

---

*Bu dokümantasyon otomatik olarak oluşturulmuştur. Son güncelleme: 2026-01-13*
