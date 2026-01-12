using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data;

public class ManufacturingDbContext : DbContext
{
    public const string Schema = "manufacturing";

    public ManufacturingDbContext(DbContextOptions<ManufacturingDbContext> options) : base(options)
    {
    }

    public DbSet<WorkCenter> WorkCenters => Set<WorkCenter>();
    public DbSet<WorkCenterShift> WorkCenterShifts => Set<WorkCenterShift>();
    public DbSet<WorkCenterCalendar> WorkCenterCalendars => Set<WorkCenterCalendar>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<MachineDowntime> MachineDowntimes => Set<MachineDowntime>();
    public DbSet<BillOfMaterial> BillOfMaterials => Set<BillOfMaterial>();
    public DbSet<BomLine> BomLines => Set<BomLine>();
    public DbSet<BomCoProduct> BomCoProducts => Set<BomCoProduct>();
    public DbSet<Routing> Routings => Set<Routing>();
    public DbSet<Operation> Operations => Set<Operation>();
    public DbSet<ProductionOrder> ProductionOrders => Set<ProductionOrder>();
    public DbSet<ProductionOrderLine> ProductionOrderLines => Set<ProductionOrderLine>();
    public DbSet<ProductionOperation> ProductionOperations => Set<ProductionOperation>();
    public DbSet<MaterialConsumption> MaterialConsumptions => Set<MaterialConsumption>();
    public DbSet<ProductionReceipt> ProductionReceipts => Set<ProductionReceipt>();
    public DbSet<ProductionTimeLog> ProductionTimeLogs => Set<ProductionTimeLog>();
    public DbSet<QualityInspection> QualityInspections => Set<QualityInspection>();
    public DbSet<QualityInspectionDetail> QualityInspectionDetails => Set<QualityInspectionDetail>();
    public DbSet<CostAllocation> CostAllocations => Set<CostAllocation>();
    public DbSet<CostAllocationDetail> CostAllocationDetails => Set<CostAllocationDetail>();

    // MRP/MPS Entities
    public DbSet<MrpPlan> MrpPlans => Set<MrpPlan>();
    public DbSet<MrpRequirement> MrpRequirements => Set<MrpRequirement>();
    public DbSet<PlannedOrder> PlannedOrders => Set<PlannedOrder>();
    public DbSet<MrpException> MrpExceptions => Set<MrpException>();
    public DbSet<MasterProductionSchedule> MasterProductionSchedules => Set<MasterProductionSchedule>();
    public DbSet<MpsLine> MpsLines => Set<MpsLine>();

    // CRP Entities
    public DbSet<CapacityPlan> CapacityPlans => Set<CapacityPlan>();
    public DbSet<CapacityRequirement> CapacityRequirements => Set<CapacityRequirement>();
    public DbSet<CapacityLoadDetail> CapacityLoadDetails => Set<CapacityLoadDetail>();
    public DbSet<CapacityException> CapacityExceptions => Set<CapacityException>();

    // Subcontract Entities
    public DbSet<SubcontractOrder> SubcontractOrders => Set<SubcontractOrder>();
    public DbSet<SubcontractShipment> SubcontractShipments => Set<SubcontractShipment>();
    public DbSet<SubcontractMaterial> SubcontractMaterials => Set<SubcontractMaterial>();

    // Cost Accounting Entities
    public DbSet<ProductionCostRecord> ProductionCostRecords => Set<ProductionCostRecord>();
    public DbSet<ProductionCostAllocation> ProductionCostAllocations => Set<ProductionCostAllocation>();
    public DbSet<CostJournalEntry> CostJournalEntries => Set<CostJournalEntry>();
    public DbSet<CostCenter> CostCenters => Set<CostCenter>();
    public DbSet<StandardCostCard> StandardCostCards => Set<StandardCostCard>();

    // KPI Dashboard Entities
    public DbSet<KpiDefinition> KpiDefinitions => Set<KpiDefinition>();
    public DbSet<KpiValue> KpiValues => Set<KpiValue>();
    public DbSet<KpiTarget> KpiTargets => Set<KpiTarget>();
    public DbSet<DashboardConfiguration> DashboardConfigurations => Set<DashboardConfiguration>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();
    public DbSet<OeeRecord> OeeRecords => Set<OeeRecord>();
    public DbSet<ProductionPerformanceSummary> ProductionPerformanceSummaries => Set<ProductionPerformanceSummary>();

    // Maintenance Entities
    public DbSet<MaintenancePlan> MaintenancePlans => Set<MaintenancePlan>();
    public DbSet<MaintenanceTask> MaintenanceTasks => Set<MaintenanceTask>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<MaintenanceRecordTask> MaintenanceRecordTasks => Set<MaintenanceRecordTask>();
    public DbSet<SparePart> SpareParts => Set<SparePart>();
    public DbSet<MaintenancePlanSparePart> MaintenancePlanSpareParts => Set<MaintenancePlanSparePart>();
    public DbSet<MaintenanceRecordSparePart> MaintenanceRecordSpareParts => Set<MaintenanceRecordSparePart>();
    public DbSet<MachineCounter> MachineCounters => Set<MachineCounter>();

    // Quality Management (NCR/CAPA) Entities
    public DbSet<NonConformanceReport> NonConformanceReports => Set<NonConformanceReport>();
    public DbSet<NcrContainmentAction> NcrContainmentActions => Set<NcrContainmentAction>();
    public DbSet<CorrectivePreventiveAction> CorrectivePreventiveActions => Set<CorrectivePreventiveAction>();
    public DbSet<CapaTask> CapaTasks => Set<CapaTask>();

    // Material Reservation Entities
    public DbSet<MaterialReservation> MaterialReservations => Set<MaterialReservation>();
    public DbSet<MaterialReservationAllocation> MaterialReservationAllocations => Set<MaterialReservationAllocation>();
    public DbSet<MaterialReservationIssue> MaterialReservationIssues => Set<MaterialReservationIssue>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ManufacturingDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
