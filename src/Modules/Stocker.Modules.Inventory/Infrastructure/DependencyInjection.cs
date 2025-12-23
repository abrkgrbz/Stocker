using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Configuration;
using Stocker.Modules.Inventory.Infrastructure.EventConsumers;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.Modules.Inventory.Infrastructure.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Services;
using Stocker.Modules.Inventory.Interfaces;
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
        // IMPORTANT: Using AddDbContext ensures single instance per scope
        services.AddDbContext<InventoryDbContext>((serviceProvider, optionsBuilder) =>
        {
            var tenantService = serviceProvider.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Tenant connection string is not available. Ensure tenant resolution middleware has run.");
            }

            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(InventoryDbContext).Assembly.FullName);
                npgsqlOptions.CommandTimeout(30);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
        }, ServiceLifetime.Scoped);

        // Register InventoryUnitOfWork following Pattern A (BaseUnitOfWork)
        // REPLACES: services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<InventoryDbContext>());
        // Pattern C (DbContext as UoW) has been eliminated per Report Issue #4
        services.AddScoped<InventoryUnitOfWork>();
        services.AddScoped<IInventoryUnitOfWork>(sp => sp.GetRequiredService<InventoryUnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<InventoryUnitOfWork>());

        // IMPORTANT: Repository registrations now delegate to IInventoryUnitOfWork
        // to ensure the same DbContext instance is used for both repository operations
        // and SaveChanges(). This fixes the bug where entities were added to one DbContext
        // but SaveChanges() was called on a different DbContext instance.
        //
        // Handlers can use either:
        //   - IInventoryUnitOfWork.Products (recommended for new code)
        //   - IProductRepository (legacy, still supported - now correctly shares DbContext)
        services.AddScoped<IProductRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Products);
        services.AddScoped<ICategoryRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Categories);
        services.AddScoped<IBrandRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Brands);
        services.AddScoped<IUnitRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Units);
        services.AddScoped<IWarehouseRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Warehouses);
        services.AddScoped<ILocationRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Locations);
        services.AddScoped<IStockRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Stocks);
        services.AddScoped<IStockMovementRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().StockMovements);
        services.AddScoped<IStockReservationRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().StockReservations);
        services.AddScoped<IStockTransferRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().StockTransfers);
        services.AddScoped<IStockCountRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().StockCounts);
        services.AddScoped<ISupplierRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().Suppliers);
        services.AddScoped<IPriceListRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().PriceLists);
        services.AddScoped<ILotBatchRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().LotBatches);
        services.AddScoped<ISerialNumberRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().SerialNumbers);
        services.AddScoped<IProductAttributeRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().ProductAttributes);
        services.AddScoped<IProductVariantRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().ProductVariants);
        services.AddScoped<IProductBundleRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().ProductBundles);
        services.AddScoped<IBarcodeDefinitionRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().BarcodeDefinitions);
        services.AddScoped<IPackagingTypeRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().PackagingTypes);
        services.AddScoped<IWarehouseZoneRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().WarehouseZones);
        services.AddScoped<IShelfLifeRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().ShelfLives);
        services.AddScoped<IQualityControlRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().QualityControls);
        services.AddScoped<IConsignmentStockRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().ConsignmentStocks);
        services.AddScoped<ICycleCountRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().CycleCounts);
        services.AddScoped<IInventoryAdjustmentRepository>(sp => sp.GetRequiredService<IInventoryUnitOfWork>().InventoryAdjustments);

        // Register Cross-Module Services (Contract Implementations)
        services.AddScoped<Shared.Contracts.Inventory.IInventoryService, Application.Services.InventoryService>();

        // Register MinIO Storage Configuration
        services.Configure<MinioSettings>(configuration.GetSection(MinioSettings.SectionName));

        // Register MinIO Client (if not already registered by another module)
        services.AddSingleton<IMinioClient>(serviceProvider =>
        {
            var settings = configuration.GetSection(MinioSettings.SectionName).Get<MinioSettings>()
                ?? throw new InvalidOperationException("MinioStorage configuration section is missing");

            return new MinioClient()
                .WithEndpoint(settings.Endpoint)
                .WithCredentials(settings.AccessKey, settings.SecretKey)
                .WithSSL(settings.UseSSL)
                .Build();
        });

        // Register Product Image Storage Service
        services.AddScoped<IProductImageStorageService, MinioProductImageStorageService>();

        // Register Barcode Service
        services.AddScoped<IBarcodeService, BarcodeService>();

        // Register Inventory Audit Service
        services.AddScoped<IInventoryAuditService, InventoryAuditService>();

        // Register Stock Forecasting Service
        services.AddScoped<IStockForecastingService, StockForecastingService>();

        // Register Inventory Costing Service (FIFO/LIFO/WAC)
        services.AddScoped<IInventoryCostingService, InventoryCostingService>();

        // Register Excel Export/Import Service
        services.AddScoped<IExcelExportService, ExcelExportService>();

        // Register Stock Alert Notification Service (SignalR-based real-time notifications)
        services.AddScoped<IStockAlertNotificationService, StockAlertNotificationService>();

        // Register Inventory Analysis Service (ABC/XYZ, turnover, dead stock)
        services.AddScoped<IInventoryAnalysisService, InventoryAnalysisService>();

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
        configurator.AddConsumer<SalesOrderCreatedEventConsumer>();
    }
}
