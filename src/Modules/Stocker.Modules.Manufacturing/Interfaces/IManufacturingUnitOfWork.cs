using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Interfaces;

/// <summary>
/// Unit of Work interface specific to the Manufacturing module.
/// Provides access to manufacturing-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in Manufacturing handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across Manufacturing operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.ManufacturingUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
/// </remarks>
public interface IManufacturingUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    #region Core Manufacturing Repositories

    /// <summary>
    /// Gets the WorkCenter repository.
    /// </summary>
    IWorkCenterRepository WorkCenters { get; }

    /// <summary>
    /// Gets the Machine repository.
    /// </summary>
    IMachineRepository Machines { get; }

    /// <summary>
    /// Gets the BillOfMaterial repository.
    /// </summary>
    IBillOfMaterialRepository BillOfMaterials { get; }

    /// <summary>
    /// Gets the Routing repository.
    /// </summary>
    IRoutingRepository Routings { get; }

    /// <summary>
    /// Gets the ProductionOrder repository.
    /// </summary>
    IProductionOrderRepository ProductionOrders { get; }

    /// <summary>
    /// Gets the QualityInspection repository.
    /// </summary>
    IQualityInspectionRepository QualityInspections { get; }

    #endregion

    #region MRP/MPS Repositories

    /// <summary>
    /// Gets the MrpPlan repository.
    /// </summary>
    IMrpPlanRepository MrpPlans { get; }

    /// <summary>
    /// Gets the MasterProductionSchedule repository.
    /// </summary>
    IMasterProductionScheduleRepository MasterProductionSchedules { get; }

    #endregion

    #region CRP Repositories

    /// <summary>
    /// Gets the CapacityPlan repository.
    /// </summary>
    ICapacityPlanRepository CapacityPlans { get; }

    #endregion

    #region Subcontract Repositories

    /// <summary>
    /// Gets the SubcontractOrder repository.
    /// </summary>
    ISubcontractOrderRepository SubcontractOrders { get; }

    #endregion

    #region Cost Accounting Repositories

    /// <summary>
    /// Gets the ProductionCostRecord repository.
    /// </summary>
    IProductionCostRecordRepository ProductionCostRecords { get; }

    /// <summary>
    /// Gets the CostCenter repository.
    /// </summary>
    ICostCenterRepository CostCenters { get; }

    /// <summary>
    /// Gets the StandardCostCard repository.
    /// </summary>
    IStandardCostCardRepository StandardCostCards { get; }

    #endregion

    #region KPI Dashboard Repositories

    /// <summary>
    /// Gets the KpiDefinition repository.
    /// </summary>
    IKpiDefinitionRepository KpiDefinitions { get; }

    /// <summary>
    /// Gets the KpiValue repository.
    /// </summary>
    IKpiValueRepository KpiValues { get; }

    /// <summary>
    /// Gets the KpiTarget repository.
    /// </summary>
    IKpiTargetRepository KpiTargets { get; }

    /// <summary>
    /// Gets the DashboardConfiguration repository.
    /// </summary>
    IDashboardConfigurationRepository DashboardConfigurations { get; }

    /// <summary>
    /// Gets the OeeRecord repository.
    /// </summary>
    IOeeRecordRepository OeeRecords { get; }

    /// <summary>
    /// Gets the ProductionPerformanceSummary repository.
    /// </summary>
    IProductionPerformanceSummaryRepository ProductionPerformanceSummaries { get; }

    #endregion

    #region Maintenance Repositories

    /// <summary>
    /// Gets the MaintenancePlan repository.
    /// </summary>
    IMaintenancePlanRepository MaintenancePlans { get; }

    /// <summary>
    /// Gets the MaintenanceTask repository.
    /// </summary>
    IMaintenanceTaskRepository MaintenanceTasks { get; }

    /// <summary>
    /// Gets the MaintenanceRecord repository.
    /// </summary>
    IMaintenanceRecordRepository MaintenanceRecords { get; }

    /// <summary>
    /// Gets the SparePart repository.
    /// </summary>
    ISparePartRepository SpareParts { get; }

    /// <summary>
    /// Gets the MachineCounter repository.
    /// </summary>
    IMachineCounterRepository MachineCounters { get; }

    #endregion

    #region Quality Management (NCR/CAPA) Repositories

    /// <summary>
    /// Gets the NonConformanceReport repository.
    /// </summary>
    INonConformanceReportRepository NonConformanceReports { get; }

    /// <summary>
    /// Gets the CorrectivePreventiveAction repository.
    /// </summary>
    ICorrectivePreventiveActionRepository CorrectivePreventiveActions { get; }

    #endregion

    #region Material Management Repositories

    /// <summary>
    /// Gets the MaterialReservation repository.
    /// </summary>
    IMaterialReservationRepository MaterialReservations { get; }

    #endregion
}
