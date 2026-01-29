using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.Modules.Sales.Domain.Services;
using Stocker.Modules.Sales.Infrastructure.Persistence;

namespace Stocker.Modules.Sales.Infrastructure.Services;

/// <summary>
/// Modül bazlı veri kaynağı çözümleyici.
///
/// Senaryo Matrisi:
/// ┌──────────────┬─────────────┬─────────────────────────┐
/// │ CRM Aktif    │ Inv Aktif   │ Veri Kaynakları         │
/// ├──────────────┼─────────────┼─────────────────────────┤
/// │ Hayır        │ Hayır       │ Customer: Sales         │
/// │              │             │ Product:  Sales         │
/// ├──────────────┼─────────────┼─────────────────────────┤
/// │ Evet         │ Hayır       │ Customer: CRM           │
/// │              │             │ Product:  Sales         │
/// ├──────────────┼─────────────┼─────────────────────────┤
/// │ Hayır        │ Evet        │ Customer: Sales         │
/// │              │             │ Product:  Inventory     │
/// ├──────────────┼─────────────┼─────────────────────────┤
/// │ Evet         │ Evet        │ Customer: CRM           │
/// │              │             │ Product:  Inventory     │
/// └──────────────┴─────────────┴─────────────────────────┘
/// </summary>
public class SalesDataResolver : ISalesDataResolver
{
    private readonly SalesDbContext _salesDbContext;
    private readonly ITenantModuleService _tenantModuleService;
    private readonly ILogger<SalesDataResolver> _logger;

    // Module codes
    private const string CRM_MODULE = "CRM";
    private const string INVENTORY_MODULE = "Inventory";

    public SalesDataResolver(
        SalesDbContext salesDbContext,
        ITenantModuleService tenantModuleService,
        ILogger<SalesDataResolver> logger)
    {
        _salesDbContext = salesDbContext;
        _tenantModuleService = tenantModuleService;
        _logger = logger;
    }

    #region Module Check

    public async Task<bool> IsCrmModuleActiveAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _tenantModuleService.HasModuleAccessAsync(tenantId, CRM_MODULE);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CRM modülü kontrolü başarısız, varsayılan olarak false döndürülüyor. TenantId: {TenantId}", tenantId);
            return false;
        }
    }

    public async Task<bool> IsInventoryModuleActiveAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _tenantModuleService.HasModuleAccessAsync(tenantId, INVENTORY_MODULE);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Inventory modülü kontrolü başarısız, varsayılan olarak false döndürülüyor. TenantId: {TenantId}", tenantId);
            return false;
        }
    }

    public async Task<CustomerDataSource> GetCustomerDataSourceAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var isCrmActive = await IsCrmModuleActiveAsync(tenantId, cancellationToken);
        return isCrmActive ? CustomerDataSource.CRM : CustomerDataSource.Sales;
    }

    public async Task<ProductDataSource> GetProductDataSourceAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var isInventoryActive = await IsInventoryModuleActiveAsync(tenantId, cancellationToken);
        return isInventoryActive ? ProductDataSource.Inventory : ProductDataSource.Sales;
    }

    #endregion

    #region Customer Resolution

    public async Task<ResolvedCustomer?> ResolveCustomerAsync(
        Guid tenantId,
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetCustomerDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == CustomerDataSource.CRM)
        {
            // CRM modülünden al
            return await ResolveCrmCustomerAsync(tenantId, customerId, cancellationToken);
        }
        else
        {
            // Sales modülünden al
            return await ResolveSalesCustomerAsync(tenantId, customerId, cancellationToken);
        }
    }

    public async Task<IReadOnlyList<ResolvedCustomer>> ResolveCustomersAsync(
        Guid tenantId,
        CustomerSearchFilter? filter = null,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetCustomerDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == CustomerDataSource.CRM)
        {
            return await ResolveCrmCustomersAsync(tenantId, filter, cancellationToken);
        }
        else
        {
            return await ResolveSalesCustomersAsync(tenantId, filter, cancellationToken);
        }
    }

    public async Task<ResolvedCustomer?> ResolveCustomerByCodeAsync(
        Guid tenantId,
        string customerCode,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetCustomerDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == CustomerDataSource.CRM)
        {
            // CRM'de customer code araması
            // TODO: CRM DbContext entegrasyonu gerekli
            _logger.LogDebug("CRM modülünden müşteri aranıyor. Code: {Code}", customerCode);
            return null; // Şimdilik null, entegrasyon yapılacak
        }
        else
        {
            var customer = await _salesDbContext.SalesCustomers
                .AsNoTracking()
                .Where(c => c.TenantId == tenantId && c.CustomerCode == customerCode.ToUpperInvariant())
                .FirstOrDefaultAsync(cancellationToken);

            return customer != null ? MapToResolvedCustomer(customer) : null;
        }
    }

    private async Task<ResolvedCustomer?> ResolveSalesCustomerAsync(
        Guid tenantId,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        var customer = await _salesDbContext.SalesCustomers
            .AsNoTracking()
            .Where(c => c.TenantId == tenantId && c.Id == customerId)
            .FirstOrDefaultAsync(cancellationToken);

        return customer != null ? MapToResolvedCustomer(customer) : null;
    }

    private async Task<IReadOnlyList<ResolvedCustomer>> ResolveSalesCustomersAsync(
        Guid tenantId,
        CustomerSearchFilter? filter,
        CancellationToken cancellationToken)
    {
        var query = _salesDbContext.SalesCustomers
            .AsNoTracking()
            .Where(c => c.TenantId == tenantId);

        // Apply filters
        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLowerInvariant();
                query = query.Where(c =>
                    (c.CompanyName != null && c.CompanyName.ToLower().Contains(searchTerm)) ||
                    (c.FirstName != null && c.FirstName.ToLower().Contains(searchTerm)) ||
                    (c.LastName != null && c.LastName.ToLower().Contains(searchTerm)) ||
                    c.CustomerCode.ToLower().Contains(searchTerm) ||
                    (c.Email != null && c.Email.Contains(searchTerm)) ||
                    (c.TaxNumber != null && c.TaxNumber.Contains(searchTerm)));
            }

            if (filter.CustomerType.HasValue)
                query = query.Where(c => c.CustomerType == filter.CustomerType.Value);

            if (filter.IsActive.HasValue)
                query = query.Where(c => c.IsActive == filter.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(filter.City))
                query = query.Where(c => c.City == filter.City);

            if (filter.IsEInvoiceRegistered.HasValue)
                query = query.Where(c => c.IsEInvoiceRegistered == filter.IsEInvoiceRegistered.Value);

            // Sorting
            query = filter.SortBy?.ToLowerInvariant() switch
            {
                "code" => filter.SortDescending
                    ? query.OrderByDescending(c => c.CustomerCode)
                    : query.OrderBy(c => c.CustomerCode),
                "name" => filter.SortDescending
                    ? query.OrderByDescending(c => c.CompanyName ?? c.FirstName)
                    : query.OrderBy(c => c.CompanyName ?? c.FirstName),
                "createdat" => filter.SortDescending
                    ? query.OrderByDescending(c => c.CreatedAt)
                    : query.OrderBy(c => c.CreatedAt),
                _ => query.OrderBy(c => c.CustomerCode)
            };

            // Pagination
            query = query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize);
        }
        else
        {
            query = query.OrderBy(c => c.CustomerCode).Take(50);
        }

        var customers = await query.ToListAsync(cancellationToken);
        return customers.Select(MapToResolvedCustomer).ToList();
    }

    private Task<ResolvedCustomer?> ResolveCrmCustomerAsync(
        Guid tenantId,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        // TODO: CRM DbContext entegrasyonu
        // Bu metod CRM modülü aktif olduğunda CRM.Customer tablosundan veri çekecek
        _logger.LogDebug("CRM modülünden müşteri çözümleniyor. CustomerId: {CustomerId}", customerId);

        // Şimdilik Sales'e fallback
        return ResolveSalesCustomerAsync(tenantId, customerId, cancellationToken);
    }

    private Task<IReadOnlyList<ResolvedCustomer>> ResolveCrmCustomersAsync(
        Guid tenantId,
        CustomerSearchFilter? filter,
        CancellationToken cancellationToken)
    {
        // TODO: CRM DbContext entegrasyonu
        _logger.LogDebug("CRM modülünden müşteri listesi çözümleniyor. TenantId: {TenantId}", tenantId);

        // Şimdilik Sales'e fallback
        return ResolveSalesCustomersAsync(tenantId, filter, cancellationToken);
    }

    private static ResolvedCustomer MapToResolvedCustomer(SalesCustomer customer)
    {
        return new ResolvedCustomer
        {
            Id = customer.Id,
            DataSource = customer.DataSource,
            CustomerCode = customer.CustomerCode,
            CustomerType = customer.CustomerType,
            DisplayName = customer.DisplayName,
            CompanyName = customer.CompanyName,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            TaxNumber = customer.TaxNumber,
            IdentityNumber = customer.IdentityNumber,
            TaxOffice = customer.TaxOffice,
            Email = customer.Email,
            Phone = customer.Phone,
            MobilePhone = customer.MobilePhone,
            AddressLine = customer.AddressLine,
            District = customer.District,
            City = customer.City,
            PostalCode = customer.PostalCode,
            Country = customer.Country,
            CountryCode = customer.CountryCode,
            CreditLimit = customer.CreditLimit,
            CurrentBalance = customer.CurrentBalance,
            DefaultPaymentTermDays = customer.DefaultPaymentTermDays,
            DefaultVatRate = customer.DefaultVatRate,
            Currency = customer.Currency,
            IsEInvoiceRegistered = customer.IsEInvoiceRegistered,
            EInvoiceAlias = customer.EInvoiceAlias,
            IsActive = customer.IsActive
        };
    }

    #endregion

    #region Product Resolution

    public async Task<ResolvedProduct?> ResolveProductAsync(
        Guid tenantId,
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetProductDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == ProductDataSource.Inventory)
        {
            // Inventory modülünden al - önce SalesProduct'tan InventoryProductId'ye bak
            var salesProduct = await _salesDbContext.SalesProducts
                .AsNoTracking()
                .Where(p => p.TenantId == tenantId && p.Id == productId)
                .FirstOrDefaultAsync(cancellationToken);

            if (salesProduct?.InventoryProductId != null)
            {
                return await ResolveInventoryProductAsync(tenantId, salesProduct.InventoryProductId.Value, cancellationToken);
            }

            // Inventory'de yoksa Sales'den dön
            return salesProduct != null ? MapToResolvedProduct(salesProduct) : null;
        }
        else
        {
            return await ResolveSalesProductAsync(tenantId, productId, cancellationToken);
        }
    }

    public async Task<ResolvedProduct?> ResolveProductByInventoryIdAsync(
        Guid tenantId,
        int inventoryProductId,
        CancellationToken cancellationToken = default)
    {
        var isInventoryActive = await IsInventoryModuleActiveAsync(tenantId, cancellationToken);

        if (isInventoryActive)
        {
            return await ResolveInventoryProductAsync(tenantId, inventoryProductId, cancellationToken);
        }

        // Inventory aktif değilse, SalesProduct'ta eşleşen var mı bak
        var salesProduct = await _salesDbContext.SalesProducts
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.InventoryProductId == inventoryProductId)
            .FirstOrDefaultAsync(cancellationToken);

        return salesProduct != null ? MapToResolvedProduct(salesProduct) : null;
    }

    public async Task<IReadOnlyList<ResolvedProduct>> ResolveProductsAsync(
        Guid tenantId,
        ProductSearchFilter? filter = null,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetProductDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == ProductDataSource.Inventory)
        {
            return await ResolveInventoryProductsAsync(tenantId, filter, cancellationToken);
        }
        else
        {
            return await ResolveSalesProductsAsync(tenantId, filter, cancellationToken);
        }
    }

    public async Task<ResolvedProduct?> ResolveProductByCodeAsync(
        Guid tenantId,
        string productCode,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetProductDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == ProductDataSource.Inventory)
        {
            // TODO: Inventory DbContext entegrasyonu
            _logger.LogDebug("Inventory modülünden ürün aranıyor. Code: {Code}", productCode);
        }

        // Sales'den ara (fallback veya primary)
        var product = await _salesDbContext.SalesProducts
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.ProductCode == productCode.ToUpperInvariant())
            .FirstOrDefaultAsync(cancellationToken);

        return product != null ? MapToResolvedProduct(product) : null;
    }

    public async Task<ResolvedProduct?> ResolveProductByBarcodeAsync(
        Guid tenantId,
        string barcode,
        CancellationToken cancellationToken = default)
    {
        var dataSource = await GetProductDataSourceAsync(tenantId, cancellationToken);

        if (dataSource == ProductDataSource.Inventory)
        {
            // TODO: Inventory DbContext entegrasyonu
            _logger.LogDebug("Inventory modülünden barkod ile ürün aranıyor. Barcode: {Barcode}", barcode);
        }

        // Sales'den ara
        var product = await _salesDbContext.SalesProducts
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.Barcode == barcode)
            .FirstOrDefaultAsync(cancellationToken);

        return product != null ? MapToResolvedProduct(product) : null;
    }

    private async Task<ResolvedProduct?> ResolveSalesProductAsync(
        Guid tenantId,
        Guid productId,
        CancellationToken cancellationToken)
    {
        var product = await _salesDbContext.SalesProducts
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.Id == productId)
            .FirstOrDefaultAsync(cancellationToken);

        return product != null ? MapToResolvedProduct(product) : null;
    }

    private async Task<IReadOnlyList<ResolvedProduct>> ResolveSalesProductsAsync(
        Guid tenantId,
        ProductSearchFilter? filter,
        CancellationToken cancellationToken)
    {
        var query = _salesDbContext.SalesProducts
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId);

        // Apply filters
        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLowerInvariant();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    p.ProductCode.ToLower().Contains(searchTerm) ||
                    (p.Barcode != null && p.Barcode.Contains(searchTerm)) ||
                    (p.SKU != null && p.SKU.ToLower().Contains(searchTerm)));
            }

            if (filter.ProductType.HasValue)
                query = query.Where(p => p.ProductType == filter.ProductType.Value);

            if (filter.IsActive.HasValue)
                query = query.Where(p => p.IsActive == filter.IsActive.Value);

            if (filter.IsAvailableForSale.HasValue)
                query = query.Where(p => p.IsAvailableForSale == filter.IsAvailableForSale.Value);

            if (!string.IsNullOrWhiteSpace(filter.Category))
                query = query.Where(p => p.Category == filter.Category);

            if (!string.IsNullOrWhiteSpace(filter.Brand))
                query = query.Where(p => p.Brand == filter.Brand);

            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.UnitPrice >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.UnitPrice <= filter.MaxPrice.Value);

            if (filter.InStockOnly == true)
                query = query.Where(p => !p.TrackStock || p.StockQuantity > 0);

            // Sorting
            query = filter.SortBy?.ToLowerInvariant() switch
            {
                "code" => filter.SortDescending
                    ? query.OrderByDescending(p => p.ProductCode)
                    : query.OrderBy(p => p.ProductCode),
                "name" => filter.SortDescending
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name),
                "price" => filter.SortDescending
                    ? query.OrderByDescending(p => p.UnitPrice)
                    : query.OrderBy(p => p.UnitPrice),
                "stock" => filter.SortDescending
                    ? query.OrderByDescending(p => p.StockQuantity)
                    : query.OrderBy(p => p.StockQuantity),
                _ => query.OrderBy(p => p.Name)
            };

            // Pagination
            query = query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize);
        }
        else
        {
            query = query.OrderBy(p => p.Name).Take(50);
        }

        var products = await query.ToListAsync(cancellationToken);
        return products.Select(MapToResolvedProduct).ToList();
    }

    private Task<ResolvedProduct?> ResolveInventoryProductAsync(
        Guid tenantId,
        int inventoryProductId,
        CancellationToken cancellationToken)
    {
        // TODO: Inventory DbContext entegrasyonu
        // Bu metod Inventory modülü aktif olduğunda Inventory.Product tablosundan veri çekecek
        _logger.LogDebug("Inventory modülünden ürün çözümleniyor. ProductId: {ProductId}", inventoryProductId);

        // Şimdilik null döner - entegrasyon yapılacak
        return Task.FromResult<ResolvedProduct?>(null);
    }

    private Task<IReadOnlyList<ResolvedProduct>> ResolveInventoryProductsAsync(
        Guid tenantId,
        ProductSearchFilter? filter,
        CancellationToken cancellationToken)
    {
        // TODO: Inventory DbContext entegrasyonu
        _logger.LogDebug("Inventory modülünden ürün listesi çözümleniyor. TenantId: {TenantId}", tenantId);

        // Şimdilik Sales'e fallback
        return ResolveSalesProductsAsync(tenantId, filter, cancellationToken);
    }

    private static ResolvedProduct MapToResolvedProduct(SalesProduct product)
    {
        return new ResolvedProduct
        {
            Id = product.Id,
            InventoryProductId = product.InventoryProductId,
            DataSource = product.DataSource,
            ProductCode = product.ProductCode,
            Name = product.Name,
            Description = product.Description,
            ProductType = product.ProductType,
            Barcode = product.Barcode,
            SKU = product.SKU,
            GtipCode = product.GtipCode,
            Unit = product.Unit,
            UnitDescription = product.UnitDescription,
            UnitPrice = product.UnitPrice,
            Currency = product.Currency,
            CostPrice = product.CostPrice,
            MinimumSalePrice = product.MinimumSalePrice,
            ListPrice = product.ListPrice,
            IsPriceIncludingVat = product.IsPriceIncludingVat,
            VatRate = product.VatRate,
            VatExemptionCode = product.VatExemptionCode,
            VatExemptionReason = product.VatExemptionReason,
            TrackStock = product.TrackStock,
            StockQuantity = product.StockQuantity,
            MinimumStock = product.MinimumStock,
            AvailableStock = product.StockQuantity, // Basit versiyon
            Category = product.Category,
            SubCategory = product.SubCategory,
            Brand = product.Brand,
            ImageUrl = product.ImageUrl,
            ThumbnailUrl = product.ThumbnailUrl,
            IsActive = product.IsActive,
            IsAvailableForSale = product.IsAvailableForSale
        };
    }

    #endregion

    #region Stock Operations

    public async Task<decimal> GetAvailableStockAsync(
        Guid tenantId,
        Guid productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var isInventoryActive = await IsInventoryModuleActiveAsync(tenantId, cancellationToken);

        if (isInventoryActive)
        {
            // TODO: Inventory modülünden stok bilgisi al
            // InventoryService.GetAvailableStockAsync(...) çağrılacak
            _logger.LogDebug("Inventory modülünden stok kontrolü yapılacak. ProductId: {ProductId}", productId);
        }

        // Sales modülünden basit stok bilgisi
        var product = await _salesDbContext.SalesProducts
            .AsNoTracking()
            .Where(p => p.TenantId == tenantId && p.Id == productId)
            .FirstOrDefaultAsync(cancellationToken);

        return product?.StockQuantity ?? 0;
    }

    public async Task<bool> ReserveStockAsync(
        Guid tenantId,
        Guid productId,
        decimal quantity,
        string referenceNumber,
        int? warehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var isInventoryActive = await IsInventoryModuleActiveAsync(tenantId, cancellationToken);

        if (isInventoryActive)
        {
            // TODO: Inventory modülünde stok rezervasyonu yap
            // InventoryService.ReserveStockAsync(...) çağrılacak
            _logger.LogInformation(
                "Inventory modülünde stok rezervasyonu yapılacak. ProductId: {ProductId}, Quantity: {Quantity}, Ref: {Ref}",
                productId, quantity, referenceNumber);
            return true; // Şimdilik başarılı varsay
        }

        // Sales modülünde basit stok düşümü
        var product = await _salesDbContext.SalesProducts
            .Where(p => p.TenantId == tenantId && p.Id == productId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            return false;

        var result = product.DecreaseStock(quantity);
        if (result.IsFailure)
        {
            _logger.LogWarning("Stok yetersiz. ProductId: {ProductId}, Requested: {Quantity}, Available: {Available}",
                productId, quantity, product.StockQuantity);
            return false;
        }

        await _salesDbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ReleaseStockReservationAsync(
        Guid tenantId,
        string referenceNumber,
        CancellationToken cancellationToken = default)
    {
        var isInventoryActive = await IsInventoryModuleActiveAsync(tenantId, cancellationToken);

        if (isInventoryActive)
        {
            // TODO: Inventory modülünde rezervasyonu iptal et
            _logger.LogInformation("Inventory modülünde stok rezervasyonu iptal edilecek. Ref: {Ref}", referenceNumber);
            return true;
        }

        // Sales modülünde basit takipte rezervasyon yönetimi yok
        _logger.LogDebug("Sales modülünde rezervasyon iptal işlemi atlandı (basit stok takibi). Ref: {Ref}", referenceNumber);
        return true;
    }

    #endregion
}
