using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Domain.Services;
using Stocker.Modules.Manufacturing.Infrastructure.Data;
using Stocker.Modules.Manufacturing.Infrastructure.Persistence;
using Stocker.Modules.Manufacturing.Infrastructure.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Services;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Infrastructure;

/// <summary>
/// Dependency injection configuration for Manufacturing Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Manufacturing infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddManufacturingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ManufacturingDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        services.AddDbContext<ManufacturingDbContext>((serviceProvider, optionsBuilder) =>
        {
            // Try IBackgroundTenantService first (for MassTransit consumers/background jobs)
            var backgroundTenantService = serviceProvider.GetService<IBackgroundTenantService>();
            var connectionString = backgroundTenantService?.GetConnectionString();

            // Fallback to ITenantService (for HTTP requests)
            if (string.IsNullOrEmpty(connectionString))
            {
                var tenantService = serviceProvider.GetRequiredService<ITenantService>();
                connectionString = tenantService.GetConnectionString();
            }

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run or background tenant context is set.");
            }

            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ManufacturingDbContext).Assembly.FullName);
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", ManufacturingDbContext.Schema);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        }, ServiceLifetime.Scoped);

        // Register ManufacturingUnitOfWork following Pattern A (BaseUnitOfWork)
        // Exposes IManufacturingUnitOfWork for strongly-typed access
        services.AddScoped<ManufacturingUnitOfWork>();
        services.AddScoped<IManufacturingUnitOfWork>(sp => sp.GetRequiredService<ManufacturingUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ManufacturingUnitOfWork>());

        // IMPORTANT: Repository registrations now delegate to IManufacturingUnitOfWork
        // These registrations allow direct injection of repositories where needed
        // Register Repositories
        services.AddScoped<IWorkCenterRepository, WorkCenterRepository>();
        services.AddScoped<IProductionOrderRepository, ProductionOrderRepository>();
        services.AddScoped<IBillOfMaterialRepository, BillOfMaterialRepository>();
        services.AddScoped<IRoutingRepository, RoutingRepository>();
        services.AddScoped<IMachineRepository, MachineRepository>();
        services.AddScoped<IQualityInspectionRepository, QualityInspectionRepository>();
        services.AddScoped<IMrpPlanRepository, MrpPlanRepository>();
        services.AddScoped<IMasterProductionScheduleRepository, MasterProductionScheduleRepository>();
        services.AddScoped<ICapacityPlanRepository, CapacityPlanRepository>();
        services.AddScoped<ISubcontractOrderRepository, SubcontractOrderRepository>();
        services.AddScoped<IProductionCostRecordRepository, ProductionCostRecordRepository>();
        services.AddScoped<ICostCenterRepository, CostCenterRepository>();
        services.AddScoped<IStandardCostCardRepository, StandardCostCardRepository>();

        // KPI Dashboard Repositories
        services.AddScoped<IKpiDefinitionRepository, KpiDefinitionRepository>();
        services.AddScoped<IKpiValueRepository, KpiValueRepository>();
        services.AddScoped<IKpiTargetRepository, KpiTargetRepository>();
        services.AddScoped<IDashboardConfigurationRepository, DashboardConfigurationRepository>();
        services.AddScoped<IOeeRecordRepository, OeeRecordRepository>();
        services.AddScoped<IProductionPerformanceSummaryRepository, ProductionPerformanceSummaryRepository>();

        // Maintenance Repositories
        services.AddScoped<IMaintenancePlanRepository, MaintenancePlanRepository>();
        services.AddScoped<IMaintenanceTaskRepository, MaintenanceTaskRepository>();
        services.AddScoped<IMaintenanceRecordRepository, MaintenanceRecordRepository>();
        services.AddScoped<ISparePartRepository, SparePartRepository>();
        services.AddScoped<IMachineCounterRepository, MachineCounterRepository>();

        // Quality Management (NCR/CAPA) Repositories
        services.AddScoped<INonConformanceReportRepository, NonConformanceReportRepository>();
        services.AddScoped<ICorrectivePreventiveActionRepository, CorrectivePreventiveActionRepository>();

        // Material Management Repositories
        services.AddScoped<IMaterialReservationRepository, MaterialReservationRepository>();

        // Register Domain Services
        services.AddScoped<IProductionPlanningService, ProductionPlanningService>();
        services.AddScoped<IProductionCostingService, ProductionCostingService>();
        services.AddScoped<IOeeCalculationService, OeeCalculationService>();

        return services;
    }
}
