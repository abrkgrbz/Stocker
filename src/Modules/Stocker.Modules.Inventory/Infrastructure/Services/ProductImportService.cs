using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Entities;
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

            if (!string.IsNullOrWhiteSpace(request.Barcode))
            {
                existingProduct.SetBarcode(request.Barcode);
            }

            if (!string.IsNullOrWhiteSpace(request.Sku))
            {
                existingProduct.SetSku(request.Sku);
            }

            if (request.Weight > 0)
            {
                existingProduct.SetPhysicalProperties(
                    request.Weight,
                    request.WeightUnit,
                    null, null, null, null);
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Updated existing product: {Code} - {Name}",
                request.Code, request.Name);

            return existingProduct.Id;
        }

        // Find or create category
        var category = await FindOrCreateCategoryAsync(request.CategoryCode, cancellationToken);

        // Create new product
        var product = new Product(
            code: request.Code,
            name: request.Name,
            categoryId: category.Id,
            unit: request.Unit,
            unitPrice: Money.Create(request.SalePrice, request.Currency),
            vatRate: request.VatRate,
            sku: request.Sku);

        // Set cost price if provided
        if (request.CostPrice > 0)
        {
            product.UpdateProductInfo(
                request.Name,
                request.Description,
                Money.Create(request.SalePrice, request.Currency),
                Money.Create(request.CostPrice, request.Currency),
                request.VatRate);
        }

        // Set stock levels
        product.SetStockLevels(
            request.MinimumStock,
            request.MaximumStock,
            request.ReorderPoint);

        // Set barcode if provided
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            product.SetBarcode(request.Barcode);
        }

        // Set physical properties if provided
        if (request.Weight > 0)
        {
            product.SetPhysicalProperties(
                request.Weight,
                request.WeightUnit,
                null, null, null, null);
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        // Raise domain event
        product.RaiseCreatedEvent();

        _logger.LogInformation(
            "Imported new product: {Code} - {Name}, Category: {CategoryCode}",
            request.Code, request.Name, request.CategoryCode ?? "Default");

        return product.Id;
    }

    private async Task<Category> FindOrCreateCategoryAsync(string? categoryCode, CancellationToken cancellationToken)
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

        // Create new category
        category = new Category(
            code: categoryCode,
            name: GetCategoryNameFromCode(categoryCode));

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created new category: {Code} - {Name}",
            category.Code, category.Name);

        return category;
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
}
