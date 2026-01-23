using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Interfaces;

/// <summary>
/// Unit of Work interface specific to the Inventory module.
/// Provides access to inventory-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in Inventory handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across Inventory operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.InventoryUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
/// </remarks>
public interface IInventoryUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    #region Domain-Specific Repositories

    /// <summary>
    /// Gets the Product repository.
    /// </summary>
    IProductRepository Products { get; }

    /// <summary>
    /// Gets the Category repository.
    /// </summary>
    ICategoryRepository Categories { get; }

    /// <summary>
    /// Gets the Brand repository.
    /// </summary>
    IBrandRepository Brands { get; }

    /// <summary>
    /// Gets the Unit repository.
    /// </summary>
    IUnitRepository Units { get; }

    /// <summary>
    /// Gets the Warehouse repository.
    /// </summary>
    IWarehouseRepository Warehouses { get; }

    /// <summary>
    /// Gets the Location repository.
    /// </summary>
    ILocationRepository Locations { get; }

    /// <summary>
    /// Gets the Stock repository.
    /// </summary>
    IStockRepository Stocks { get; }

    /// <summary>
    /// Gets the Stock Movement repository.
    /// </summary>
    IStockMovementRepository StockMovements { get; }

    /// <summary>
    /// Gets the Stock Reservation repository.
    /// </summary>
    IStockReservationRepository StockReservations { get; }

    /// <summary>
    /// Gets the Stock Transfer repository.
    /// </summary>
    IStockTransferRepository StockTransfers { get; }

    /// <summary>
    /// Gets the Stock Count repository.
    /// </summary>
    IStockCountRepository StockCounts { get; }

    /// <summary>
    /// Gets the Supplier repository.
    /// </summary>
    ISupplierRepository Suppliers { get; }

    /// <summary>
    /// Gets the Price List repository.
    /// </summary>
    IPriceListRepository PriceLists { get; }

    /// <summary>
    /// Gets the Lot/Batch repository.
    /// </summary>
    ILotBatchRepository LotBatches { get; }

    /// <summary>
    /// Gets the Serial Number repository.
    /// </summary>
    ISerialNumberRepository SerialNumbers { get; }

    /// <summary>
    /// Gets the Product Attribute repository.
    /// </summary>
    IProductAttributeRepository ProductAttributes { get; }

    /// <summary>
    /// Gets the Product Variant repository.
    /// </summary>
    IProductVariantRepository ProductVariants { get; }

    /// <summary>
    /// Gets the Product Bundle repository.
    /// </summary>
    IProductBundleRepository ProductBundles { get; }

    /// <summary>
    /// Gets the Barcode Definition repository.
    /// </summary>
    IBarcodeDefinitionRepository BarcodeDefinitions { get; }

    /// <summary>
    /// Gets the Packaging Type repository.
    /// </summary>
    IPackagingTypeRepository PackagingTypes { get; }

    /// <summary>
    /// Gets the Warehouse Zone repository.
    /// </summary>
    IWarehouseZoneRepository WarehouseZones { get; }

    /// <summary>
    /// Gets the Shelf Life repository.
    /// </summary>
    IShelfLifeRepository ShelfLives { get; }

    /// <summary>
    /// Gets the Quality Control repository.
    /// </summary>
    IQualityControlRepository QualityControls { get; }

    /// <summary>
    /// Gets the Consignment Stock repository.
    /// </summary>
    IConsignmentStockRepository ConsignmentStocks { get; }

    /// <summary>
    /// Gets the Cycle Count repository.
    /// </summary>
    ICycleCountRepository CycleCounts { get; }

    /// <summary>
    /// Gets the Inventory Adjustment repository.
    /// </summary>
    IInventoryAdjustmentRepository InventoryAdjustments { get; }

    /// <summary>
    /// Gets the Reorder Rule repository.
    /// </summary>
    IReorderRuleRepository ReorderRules { get; }

    /// <summary>
    /// Gets the Processed Request repository for idempotency checking.
    /// </summary>
    IProcessedRequestRepository ProcessedRequests { get; }

    #endregion
}
