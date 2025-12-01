using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.EventConsumers;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.Modules.Inventory.Infrastructure.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure;

/// <summary>
/// Dependency injection configuration for Inventory Infrastructure
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Inventory infrastructure services to the service collection
    /// </summary>
    public static IServiceCollection AddInventoryInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // InventoryDbContext is registered dynamically per request based on tenant
        // using ITenantService to get the current tenant's connection string
        services.AddScoped<InventoryDbContext>(serviceProvider =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<InventoryDbContext>();
            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(InventoryDbContext).Assembly.FullName);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });

            return new InventoryDbContext(optionsBuilder.Options, tenantService);
        });

        // Register specific repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IUnitRepository, UnitRepository>();
        services.AddScoped<IWarehouseRepository, WarehouseRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<IStockRepository, StockRepository>();
        services.AddScoped<IStockMovementRepository, StockMovementRepository>();
        services.AddScoped<IStockReservationRepository, StockReservationRepository>();
        services.AddScoped<IStockTransferRepository, StockTransferRepository>();
        services.AddScoped<IStockCountRepository, StockCountRepository>();
        services.AddScoped<ISupplierRepository, SupplierRepository>();
        services.AddScoped<IPriceListRepository, PriceListRepository>();
        services.AddScoped<ILotBatchRepository, LotBatchRepository>();
        services.AddScoped<ISerialNumberRepository, SerialNumberRepository>();

        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.Inventory.IInventoryService, Application.Services.InventoryService>();

        return services;
    }

    /// <summary>
    /// Registers Inventory event consumers with MassTransit
    /// Called from API layer where MassTransit is configured
    /// </summary>
    public static void AddInventoryConsumers(IRegistrationConfigurator configurator)
    {
        // Register event consumers
        configurator.AddConsumer<DealWonEventConsumer>();
    }
}
