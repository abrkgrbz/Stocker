using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Migration.Enums;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Background job for importing validated migration data into the tenant database
/// </summary>
public class MigrationImportJob
{
    private readonly IMasterDbContext _context;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ILogger<MigrationImportJob> _logger;

    public MigrationImportJob(
        IMasterDbContext context,
        ITenantDbContextFactory tenantDbContextFactory,
        ILogger<MigrationImportJob> logger)
    {
        _context = context;
        _tenantDbContextFactory = tenantDbContextFactory;
        _logger = logger;
    }

    /// <summary>
    /// Executes the import job for the given session
    /// </summary>
    public async Task ExecuteAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting import for session {SessionId}", sessionId);

        try
        {
            var session = await _context.MigrationSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

            if (session == null)
            {
                _logger.LogError("Session {SessionId} not found", sessionId);
                return;
            }

            // Update status to importing
            session.UpdateStatus(MigrationSessionStatus.Importing);
            await _context.SaveChangesAsync(cancellationToken);

            // Get all valid records that should be imported
            var recordsToImport = await _context.MigrationValidationResults
                .Where(r => r.SessionId == sessionId &&
                           (r.Status == ValidationStatus.Valid ||
                            r.Status == ValidationStatus.Warning ||
                            r.Status == ValidationStatus.Fixed) &&
                           r.UserAction != "skip")
                .OrderBy(r => r.EntityType)
                .ThenBy(r => r.RowNumber)
                .ToListAsync(cancellationToken);

            int importedCount = 0;
            int failedCount = 0;
            var importErrors = new List<string>();

            // Group records by entity type for batch processing
            var groupedRecords = recordsToImport.GroupBy(r => r.EntityType);

            foreach (var group in groupedRecords)
            {
                _logger.LogInformation("Importing {Count} records of type {EntityType}",
                    group.Count(), group.Key);

                foreach (var record in group)
                {
                    try
                    {
                        // Use fixed data if available, otherwise original data
                        var dataJson = !string.IsNullOrEmpty(record.FixedDataJson)
                            ? record.FixedDataJson
                            : record.OriginalDataJson;

                        var data = JsonSerializer.Deserialize<Dictionary<string, object?>>(dataJson);
                        if (data == null)
                        {
                            failedCount++;
                            importErrors.Add($"Row {record.RowNumber}: Data deserialization failed");
                            continue;
                        }

                        // Import the record to tenant database
                        var success = await ImportRecordAsync(
                            session.TenantId,
                            group.Key,
                            data,
                            session.MappingConfigJson,
                            cancellationToken);

                        if (success)
                        {
                            record.MarkAsImported();
                            importedCount++;
                        }
                        else
                        {
                            failedCount++;
                            importErrors.Add($"Row {record.RowNumber}: Import failed");
                        }
                    }
                    catch (Exception ex)
                    {
                        failedCount++;
                        importErrors.Add($"Row {record.RowNumber}: {ex.Message}");
                        _logger.LogError(ex, "Error importing record {RecordId}", record.Id);
                    }
                }

                // Save progress after each entity type batch
                await _context.SaveChangesAsync(cancellationToken);
            }

            // Update session with final status
            session.SetImportResults(importedCount, failedCount);

            if (failedCount == 0)
            {
                session.UpdateStatus(MigrationSessionStatus.Completed);
                _logger.LogInformation(
                    "Import completed successfully for session {SessionId}. Imported: {Imported}",
                    sessionId, importedCount);
            }
            else if (importedCount > 0)
            {
                session.UpdateStatus(MigrationSessionStatus.Completed);
                session.SetWarning($"Import completed with {failedCount} errors");
                _logger.LogWarning(
                    "Import completed with errors for session {SessionId}. Imported: {Imported}, Failed: {Failed}",
                    sessionId, importedCount, failedCount);
            }
            else
            {
                session.SetError("All imports failed");
                _logger.LogError("Import failed for session {SessionId}. All {Failed} records failed",
                    sessionId, failedCount);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Import job failed for session {SessionId}", sessionId);

            // Update session status to failed
            var session = await _context.MigrationSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

            if (session != null)
            {
                session.SetError($"Import failed: {ex.Message}");
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }

    /// <summary>
    /// Imports a single record to the tenant database
    /// </summary>
    private async Task<bool> ImportRecordAsync(
        Guid tenantId,
        MigrationEntityType entityType,
        Dictionary<string, object?> data,
        string? mappingConfigJson,
        CancellationToken cancellationToken)
    {
        // Parse mapping config
        Dictionary<string, string>? fieldMappings = null;
        if (!string.IsNullOrEmpty(mappingConfigJson))
        {
            try
            {
                fieldMappings = JsonSerializer.Deserialize<Dictionary<string, string>>(mappingConfigJson);
            }
            catch
            {
                // Use direct field names if mapping config is invalid
            }
        }

        // Map source fields to target fields
        var mappedData = MapFields(data, fieldMappings);

        _logger.LogDebug("Importing {EntityType} record to tenant {TenantId}: {Data}",
            entityType, tenantId, JsonSerializer.Serialize(mappedData));

        // Get tenant database context
        await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

        switch (entityType)
        {
            case MigrationEntityType.Product:
                await ImportProductAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Category:
                await ImportCategoryAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Customer:
                await ImportCustomerAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Supplier:
                await ImportSupplierAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Brand:
                await ImportBrandAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Unit:
                await ImportUnitAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Warehouse:
                await ImportWarehouseAsync(tenantContext, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Stock:
            case MigrationEntityType.OpeningBalance:
                await ImportStockAsync(tenantContext, mappedData, cancellationToken);
                break;

            default:
                _logger.LogWarning("Entity type {EntityType} import not implemented", entityType);
                return false;
        }

        await tenantContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task ImportProductAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        var tenantId = await GetTenantIdFromContextAsync(context, ct);
        var code = GetStringValue(data, "Code", "ProductCode", "Kod", "StokKodu");
        var name = GetStringValue(data, "Name", "ProductName", "Ad", "StokAdi");

        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name))
        {
            throw new InvalidOperationException("Product code and name are required");
        }

        // Check if product already exists
        var existing = await context.Products.FirstOrDefaultAsync(p => p.Code == code, ct);
        if (existing != null)
        {
            _logger.LogDebug("Product {Code} already exists, skipping", code);
            return;
        }

        var description = GetStringValue(data, "Description", "Aciklama") ?? string.Empty;
        var salePrice = GetDecimalValue(data, "SalePrice", "SatisFiyati", "Fiyat");
        var currency = GetStringValue(data, "Currency", "ParaBirimi") ?? "TRY";

        var price = Money.Create(salePrice, currency);
        var product = Product.Create(tenantId, name, description, code, price);

        // Set optional fields
        var barcode = GetStringValue(data, "Barcode", "Barkod");
        if (!string.IsNullOrEmpty(barcode))
        {
            product.SetBarcode(barcode);
        }

        var unit = GetStringValue(data, "UnitCode", "BirimKodu", "Unit", "Birim");
        if (!string.IsNullOrEmpty(unit))
        {
            product.SetUnit(unit);
        }

        var vatRate = GetDecimalValue(data, "VatRate", "KdvOrani", "Kdv");
        if (vatRate > 0)
        {
            product.SetVatRate(vatRate);
        }

        var costPrice = GetDecimalValue(data, "PurchasePrice", "AlisFiyati", "Maliyet");
        if (costPrice > 0)
        {
            product.UpdatePricing(price, Money.Create(costPrice, currency));
        }

        await context.Products.AddAsync(product, ct);
    }

    private Task ImportCategoryAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        // Categories are managed in Inventory module - log and skip
        var name = GetStringValue(data, "Name", "CategoryName", "Ad", "KategoriAdi");
        _logger.LogInformation("Category import: {Name} - Use Inventory module for category management", name);
        return Task.CompletedTask;
    }

    private async Task ImportCustomerAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        var tenantId = await GetTenantIdFromContextAsync(context, ct);
        var name = GetStringValue(data, "Name", "CustomerName", "Ad", "CariUnvani", "MusteriAdi");

        if (string.IsNullOrEmpty(name))
        {
            throw new InvalidOperationException("Customer name is required");
        }

        // Check if customer already exists by name
        var existing = await context.Customers.FirstOrDefaultAsync(c => c.Name == name, ct);
        if (existing != null)
        {
            _logger.LogDebug("Customer {Name} already exists, skipping", name);
            return;
        }

        var phone = GetStringValue(data, "Phone", "Telefon", "Tel") ?? "0000000000";
        var emailStr = GetStringValue(data, "Email", "Eposta", "Mail") ?? $"{name.Replace(" ", "").ToLowerInvariant()}@import.local";
        var addressLine = GetStringValue(data, "Address", "Adres") ?? string.Empty;
        var city = GetStringValue(data, "City", "Sehir", "Il") ?? string.Empty;
        var district = GetStringValue(data, "District", "Ilce") ?? string.Empty;
        var country = GetStringValue(data, "Country", "Ulke") ?? "Türkiye";
        var postalCode = GetStringValue(data, "PostalCode", "PostaKodu") ?? string.Empty;

        var emailResult = Email.Create(emailStr);
        if (!emailResult.IsSuccess)
        {
            throw new InvalidOperationException($"Invalid email: {emailResult.Error}");
        }

        var phoneResult = PhoneNumber.Create(phone);
        if (!phoneResult.IsSuccess)
        {
            throw new InvalidOperationException($"Invalid phone number: {phoneResult.Error}");
        }

        var address = Address.Create(addressLine, city, district, postalCode, country);

        var customer = Customer.Create(tenantId, name, emailResult.Value!, phoneResult.Value!, address);

        // Set tax info if available
        var taxNumber = GetStringValue(data, "TaxNumber", "VergiNo", "VKN");
        var taxOffice = GetStringValue(data, "TaxOffice", "VergiDairesi");
        if (!string.IsNullOrEmpty(taxNumber))
        {
            customer.SetTaxInfo(taxNumber, taxOffice ?? string.Empty);
        }

        await context.Customers.AddAsync(customer, ct);
    }

    private Task ImportSupplierAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        // Suppliers are managed in Inventory module - log and skip
        var name = GetStringValue(data, "Name", "SupplierName", "Ad", "TedarikciAdi");
        _logger.LogInformation("Supplier import: {Name} - Use Inventory module for supplier management", name);
        return Task.CompletedTask;
    }

    private Task ImportBrandAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        // Brands are managed in Inventory module - log and skip
        var name = GetStringValue(data, "Name", "BrandName", "Ad", "MarkaAdi");
        _logger.LogInformation("Brand import: {Name} - Use Inventory module for brand management", name);
        return Task.CompletedTask;
    }

    private Task ImportUnitAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        // Units are managed in Inventory module - log and skip
        var name = GetStringValue(data, "Name", "UnitName", "Ad", "BirimAdi");
        _logger.LogInformation("Unit import: {Name} - Use Inventory module for unit management", name);
        return Task.CompletedTask;
    }

    private Task ImportWarehouseAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        // Warehouses are managed in Inventory module - log and skip
        var name = GetStringValue(data, "Name", "WarehouseName", "Ad", "DepoAdi");
        _logger.LogInformation("Warehouse import: {Name} - Use Inventory module for warehouse management", name);
        return Task.CompletedTask;
    }

    private Task ImportStockAsync(ITenantDbContext context, Dictionary<string, object?> data, CancellationToken ct)
    {
        // Stock is managed in Inventory module - log and skip
        var productCode = GetStringValue(data, "ProductCode", "StokKodu", "Kod");
        _logger.LogInformation("Stock import for product: {Code} - Use Inventory module for stock management", productCode);
        return Task.CompletedTask;
    }

    private async Task<Guid> GetTenantIdFromContextAsync(ITenantDbContext context, CancellationToken ct)
    {
        // Get tenantId from first existing entity or return empty guid
        var existingProduct = await context.Products.FirstOrDefaultAsync(ct);
        if (existingProduct != null)
        {
            return existingProduct.TenantId;
        }

        var existingCustomer = await context.Customers.FirstOrDefaultAsync(ct);
        if (existingCustomer != null)
        {
            return existingCustomer.TenantId;
        }

        // If no entities exist, we need to get it from session
        _logger.LogWarning("Could not determine tenant ID from context");
        return Guid.Empty;
    }

    #region Helper Methods

    private string? GetStringValue(Dictionary<string, object?> data, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (data.TryGetValue(key, out var value) && value != null)
            {
                var strValue = value.ToString();
                if (!string.IsNullOrWhiteSpace(strValue))
                {
                    return strValue.Trim();
                }
            }
        }
        return null;
    }

    private decimal GetDecimalValue(Dictionary<string, object?> data, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (data.TryGetValue(key, out var value) && value != null)
            {
                if (value is JsonElement jsonElement)
                {
                    if (jsonElement.TryGetDecimal(out var decVal))
                        return decVal;
                }
                else if (decimal.TryParse(value.ToString(), out var parsed))
                {
                    return parsed;
                }
            }
        }
        return 0;
    }

    #endregion

    /// <summary>
    /// Maps source field names to target field names based on mapping configuration
    /// </summary>
    private Dictionary<string, object?> MapFields(
        Dictionary<string, object?> sourceData,
        Dictionary<string, string>? fieldMappings)
    {
        if (fieldMappings == null || fieldMappings.Count == 0)
        {
            return sourceData;
        }

        var result = new Dictionary<string, object?>();

        foreach (var mapping in fieldMappings)
        {
            var targetField = mapping.Key;
            var sourceField = mapping.Value;

            if (sourceData.TryGetValue(sourceField, out var value))
            {
                result[targetField] = value;
            }
        }

        return result;
    }
}
