using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of IProductImportService for importing products into Inventory module.
/// </summary>
public class ProductImportService : IProductImportService
{
    private readonly InventoryDbContext _context;
    private readonly ILogger<ProductImportService> _logger;

    public ProductImportService(
        InventoryDbContext context,
        ILogger<ProductImportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<int> ImportProductAsync(ProductImportRequest request, CancellationToken cancellationToken = default)
    {
        // Check if product already exists
        var existingProduct = await _context.Products
            .FirstOrDefaultAsync(p => p.Code == request.Code, cancellationToken);

        if (existingProduct != null)
        {
            _logger.LogInformation(
                "Product with code {Code} already exists. Updating existing product.",
                request.Code);

            // Update existing product
            existingProduct.UpdateProductInfo(
                request.Name,
                request.Description,
                Money.Create(request.SalePrice, request.Currency),
                Money.Create(request.CostPrice, request.Currency),
                request.VatRate);

            existingProduct.SetStockLevels(
                request.MinimumStock,
                request.MaximumStock,
                request.ReorderPoint);

            // Set reorder quantity and lead time
            existingProduct.SetReorderQuantity(request.ReorderQuantity);
            existingProduct.SetLeadTimeDays(request.LeadTimeDays);

            // Set product type
            var productType = ParseProductType(request.ProductType);
            existingProduct.SetProductType(productType);

            // Set tracking options
            existingProduct.SetTrackingOptions(request.IsStockTracked, request.IsSerialTracked, request.IsLotTracked);

            // Set brand if provided
            if (!string.IsNullOrWhiteSpace(request.BrandCode))
            {
                var brand = await FindOrCreateBrandAsync(request.BrandCode, request.TenantId, cancellationToken);
                existingProduct.SetBrand(brand.Id);
            }

            // Set supplier if provided
            if (!string.IsNullOrWhiteSpace(request.SupplierCode))
            {
                var supplier = await FindOrCreateSupplierAsync(request.SupplierCode, request.TenantId, cancellationToken);
                existingProduct.SetSupplier(supplier.Id);
            }

            if (!string.IsNullOrWhiteSpace(request.Barcode))
            {
                existingProduct.SetBarcode(request.Barcode);
            }

            if (!string.IsNullOrWhiteSpace(request.Sku))
            {
                existingProduct.SetSku(request.Sku);
            }

            // Set physical properties with all dimensions
            existingProduct.SetPhysicalProperties(
                request.Weight,
                request.WeightUnit,
                request.Length > 0 ? request.Length : null,
                request.Width > 0 ? request.Width : null,
                request.Height > 0 ? request.Height : null,
                !string.IsNullOrWhiteSpace(request.DimensionUnit) ? request.DimensionUnit : null);

            // Set active status
            if (request.IsActive)
                existingProduct.Activate();
            else
                existingProduct.Deactivate("Import");

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Updated existing product: {Code} - {Name}",
                request.Code, request.Name);

            return existingProduct.Id;
        }

        // Find or create category
        var category = await FindOrCreateCategoryAsync(request.CategoryCode, request.TenantId, cancellationToken);

        // Find or create unit
        var unit = await FindOrCreateUnitAsync(request.Unit, request.TenantId, cancellationToken);

        // Parse product type
        var parsedProductType = ParseProductType(request.ProductType);

        // Create new product with all constructor parameters
        var product = new Product(
            code: request.Code,
            name: request.Name,
            categoryId: category.Id,
            unit: unit.Name,
            unitPrice: Money.Create(request.SalePrice, request.Currency),
            vatRate: request.VatRate,
            sku: request.Sku,
            productType: parsedProductType,
            unitId: unit.Id,
            reorderQuantity: request.ReorderQuantity,
            leadTimeDays: request.LeadTimeDays);

        // Set TenantId for new product
        product.SetTenantId(request.TenantId);

        // Set description and cost price
        product.UpdateProductInfo(
            request.Name,
            request.Description,
            Money.Create(request.SalePrice, request.Currency),
            Money.Create(request.CostPrice, request.Currency),
            request.VatRate);

        // Set stock levels
        product.SetStockLevels(
            request.MinimumStock,
            request.MaximumStock,
            request.ReorderPoint);

        // Set tracking options
        product.SetTrackingOptions(request.IsStockTracked, request.IsSerialTracked, request.IsLotTracked);

        // Set brand if provided
        if (!string.IsNullOrWhiteSpace(request.BrandCode))
        {
            var brand = await FindOrCreateBrandAsync(request.BrandCode, request.TenantId, cancellationToken);
            product.SetBrand(brand.Id);
        }

        // Set supplier if provided
        if (!string.IsNullOrWhiteSpace(request.SupplierCode))
        {
            var supplier = await FindOrCreateSupplierAsync(request.SupplierCode, request.TenantId, cancellationToken);
            product.SetSupplier(supplier.Id);
        }

        // Set barcode if provided
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            product.SetBarcode(request.Barcode);
        }

        // Set physical properties with all dimensions
        product.SetPhysicalProperties(
            request.Weight,
            request.WeightUnit,
            request.Length > 0 ? request.Length : null,
            request.Width > 0 ? request.Width : null,
            request.Height > 0 ? request.Height : null,
            !string.IsNullOrWhiteSpace(request.DimensionUnit) ? request.DimensionUnit : null);

        // Set active status
        if (!request.IsActive)
        {
            product.Deactivate("Import");
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        // Raise domain event
        product.RaiseCreatedEvent();

        _logger.LogInformation(
            "Imported new product: {Code} - {Name}, Category: {CategoryCode}, Type: {ProductType}",
            request.Code, request.Name, request.CategoryCode ?? "Default", parsedProductType);

        return product.Id;
    }

    private async Task<Category> FindOrCreateCategoryAsync(string? categoryCode, Guid tenantId, CancellationToken cancellationToken)
    {
        // If no category code, find or create default category
        if (string.IsNullOrWhiteSpace(categoryCode))
        {
            categoryCode = "GENEL";
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Code == categoryCode, cancellationToken);

        if (category != null)
        {
            return category;
        }

        // Create new category with TenantId
        category = new Category(
            code: categoryCode,
            name: GetCategoryNameFromCode(categoryCode));
        category.SetTenantId(tenantId);

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created new category: {Code} - {Name}",
            category.Code, category.Name);

        return category;
    }

    private async Task<Unit> FindOrCreateUnitAsync(string unitName, Guid tenantId, CancellationToken cancellationToken)
    {
        // Normalize unit name
        var normalizedName = NormalizeUnitName(unitName);
        var unitCode = GetUnitCode(normalizedName);

        // Try to find existing unit by code or name
        var unit = await _context.Units
            .FirstOrDefaultAsync(u => u.Code == unitCode || u.Name == normalizedName, cancellationToken);

        if (unit != null)
        {
            return unit;
        }

        // Create new unit with TenantId
        var (symbol, allowDecimals, decimalPlaces) = GetUnitProperties(unitCode);
        unit = new Unit(unitCode, normalizedName, symbol);
        unit.SetDecimalSettings(allowDecimals, decimalPlaces);
        unit.SetTenantId(tenantId);

        _context.Units.Add(unit);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created new unit: {Code} - {Name} ({Symbol})",
            unit.Code, unit.Name, unit.Symbol);

        return unit;
    }

    private static string NormalizeUnitName(string unitName)
    {
        if (string.IsNullOrWhiteSpace(unitName))
            return "Adet";

        // Normalize common Turkish unit names
        return unitName.Trim().ToLowerInvariant() switch
        {
            "adet" or "ad" or "pcs" or "piece" => "Adet",
            "kg" or "kilogram" or "kilo" => "Kilogram",
            "gr" or "gram" => "Gram",
            "lt" or "litre" or "liter" => "Litre",
            "ml" or "mililitre" => "Mililitre",
            "mt" or "metre" or "meter" => "Metre",
            "cm" or "santimetre" => "Santimetre",
            "mm" or "milimetre" => "Milimetre",
            "m2" or "metrekare" => "Metrekare",
            "m3" or "metreküp" => "Metreküp",
            "paket" or "pk" or "pack" => "Paket",
            "kutu" or "box" => "Kutu",
            "koli" or "carton" => "Koli",
            "düzine" or "duzine" or "dozen" => "Düzine",
            "çift" or "cift" or "pair" => "Çift",
            "set" or "takım" or "takim" => "Set",
            "ton" => "Ton",
            "palet" => "Palet",
            "rulo" or "roll" => "Rulo",
            "top" or "bale" => "Top",
            "teneke" or "can" => "Teneke",
            "bidon" => "Bidon",
            "şişe" or "sise" or "bottle" => "Şişe",
            "poşet" or "poset" or "bag" => "Poşet",
            "torba" or "sack" => "Torba",
            _ => unitName.Trim()
        };
    }

    private static string GetUnitCode(string unitName)
    {
        return unitName.ToUpperInvariant() switch
        {
            "ADET" => "ADET",
            "KILOGRAM" => "KG",
            "GRAM" => "GR",
            "LITRE" => "LT",
            "MILILITRE" => "ML",
            "METRE" => "MT",
            "SANTIMETRE" => "CM",
            "MILIMETRE" => "MM",
            "METREKARE" => "M2",
            "METREKÜP" => "M3",
            "PAKET" => "PKT",
            "KUTU" => "KTU",
            "KOLI" => "KOL",
            "DÜZINE" => "DZN",
            "ÇIFT" => "CIF",
            "SET" => "SET",
            "TON" => "TON",
            "PALET" => "PLT",
            "RULO" => "RUL",
            "TOP" => "TOP",
            "TENEKE" => "TNK",
            "BIDON" => "BDN",
            "ŞIŞE" => "SIS",
            "POŞET" => "PST",
            "TORBA" => "TRB",
            _ => unitName.ToUpperInvariant().Replace(" ", "")[..Math.Min(5, unitName.Length)]
        };
    }

    private static (string? Symbol, bool AllowDecimals, int DecimalPlaces) GetUnitProperties(string unitCode)
    {
        return unitCode switch
        {
            "ADET" => ("Ad", false, 0),
            "KG" => ("kg", true, 3),
            "GR" => ("gr", true, 2),
            "LT" => ("lt", true, 3),
            "ML" => ("ml", true, 2),
            "MT" => ("m", true, 2),
            "CM" => ("cm", true, 2),
            "MM" => ("mm", true, 1),
            "M2" => ("m²", true, 2),
            "M3" => ("m³", true, 3),
            "PKT" => ("Pk", false, 0),
            "KTU" => ("Kt", false, 0),
            "KOL" => ("Kl", false, 0),
            "DZN" => ("Dz", false, 0),
            "CIF" => ("Çf", false, 0),
            "SET" => ("Set", false, 0),
            "TON" => ("t", true, 3),
            "PLT" => ("Plt", false, 0),
            "RUL" => ("Rl", false, 0),
            "TOP" => ("Top", false, 0),
            "TNK" => ("Tnk", false, 0),
            "BDN" => ("Bdn", false, 0),
            "SIS" => ("Şş", false, 0),
            "PST" => ("Pş", false, 0),
            "TRB" => ("Trb", false, 0),
            _ => (null, false, 0)
        };
    }

    private static string GetCategoryNameFromCode(string code)
    {
        // Common Turkish category name mappings
        return code.ToUpperInvariant() switch
        {
            "GENEL" => "Genel",
            "ELEKTRONIK" => "Elektronik",
            "GIDA" => "Gida",
            "TEKSTIL" => "Tekstil",
            "MOBILYA" => "Mobilya",
            "KOZMETIK" => "Kozmetik",
            "OTOMOTIV" => "Otomotiv",
            "YAPI" => "Yapi Malzemeleri",
            "OFIS" => "Ofis Malzemeleri",
            "TEMIZLIK" => "Temizlik Urunleri",
            _ => code
        };
    }

    private async Task<Brand> FindOrCreateBrandAsync(string brandCode, Guid tenantId, CancellationToken cancellationToken)
    {
        var brand = await _context.Brands
            .FirstOrDefaultAsync(b => b.Code == brandCode, cancellationToken);

        if (brand != null)
        {
            return brand;
        }

        // Create new brand with TenantId
        brand = new Brand(
            code: brandCode,
            name: brandCode);
        brand.SetTenantId(tenantId);

        _context.Brands.Add(brand);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created new brand: {Code} - {Name}",
            brand.Code, brand.Name);

        return brand;
    }

    private async Task<Supplier> FindOrCreateSupplierAsync(string supplierCode, Guid tenantId, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Code == supplierCode, cancellationToken);

        if (supplier != null)
        {
            return supplier;
        }

        // Create new supplier with TenantId
        supplier = new Supplier(
            code: supplierCode,
            name: supplierCode);
        supplier.SetTenantId(tenantId);

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created new supplier: {Code} - {Name}",
            supplier.Code, supplier.Name);

        return supplier;
    }

    private static ProductType ParseProductType(string? productTypeString)
    {
        if (string.IsNullOrWhiteSpace(productTypeString))
            return ProductType.Finished;

        // Parse Turkish and English product type names
        return productTypeString.Trim().ToLowerInvariant() switch
        {
            "hammadde" or "raw" or "rawmaterial" => ProductType.Raw,
            "yarımamul" or "yarimamul" or "semifinished" or "semi-finished" => ProductType.SemiFinished,
            "mamul" or "finished" or "finishedgood" => ProductType.Finished,
            "hizmet" or "service" => ProductType.Service,
            "sarf" or "sarfmalzeme" or "consumable" => ProductType.Consumable,
            "duranvarlik" or "fixedasset" or "fixed-asset" => ProductType.FixedAsset,
            _ => ProductType.Finished
        };
    }
}
