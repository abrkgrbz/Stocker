using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Migration.Enums;
using Stocker.Domain.Tenant.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using System.Globalization;
using System.Text.Json;
using CrmCustomer = Stocker.Modules.CRM.Domain.Entities.Customer;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Background job for importing validated migration data into the tenant database
/// </summary>
public class MigrationImportJob
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ILogger<MigrationImportJob> _logger;
    private readonly IServiceProvider _serviceProvider;

    // Turkish field name patterns for auto-detection (target field -> possible source names)
    private static readonly Dictionary<string, string[]> TurkishFieldPatterns = new()
    {
        ["Code"] = new[] { "kod", "kodu", "code", "no", "numara", "cari kodu", "ürün kodu", "urun kodu", "stok kodu", "stokkodu" },
        ["Name"] = new[] { "ad", "adi", "adı", "isim", "ismi", "name", "tanim", "tanım", "firma", "kişi", "kisi", "firma/kişi adı", "ürün adı", "urun adi", "stok adı", "stokadi" },
        ["Unit"] = new[] { "birim", "unit", "olcu", "ölçü" },
        ["TaxNumber"] = new[] { "vergi", "vergino", "vergi no", "vergi/tc no", "vkn", "tc", "tc no" },
        ["Email"] = new[] { "email", "eposta", "e-posta", "mail" },
        ["Phone"] = new[] { "tel", "telefon", "phone", "gsm", "cep" },
        ["Address"] = new[] { "adres", "address" },
        ["City"] = new[] { "il", "sehir", "şehir", "city" },
        ["District"] = new[] { "ilce", "ilçe", "district" },
        ["Barcode"] = new[] { "barkod", "barcode", "ean" },
        ["CategoryCode"] = new[] { "kategori", "kategori kodu", "category" },
        ["PurchasePrice"] = new[] { "alış", "alis", "alış fiyatı", "alis fiyati", "maliyet" },
        ["SalePrice"] = new[] { "satış", "satis", "satış fiyatı", "satis fiyati", "fiyat" },
        ["VatRate"] = new[] { "kdv", "kdv oranı", "kdv orani", "vat" },
        ["MinStock"] = new[] { "min", "minimum", "minimum stok", "min stok" },
        ["MaxStock"] = new[] { "max", "maksimum", "maksimum stok", "max stok" },
        ["CreditLimit"] = new[] { "kredi", "kredi limiti", "limit" },
        ["TaxOffice"] = new[] { "vergi dairesi", "vd" },
        ["Description"] = new[] { "açıklama", "aciklama", "detay", "detaylı açıklama" },
    };

    public MigrationImportJob(
        ITenantDbContextFactory tenantDbContextFactory,
        ILogger<MigrationImportJob> logger,
        IServiceProvider serviceProvider)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    /// <summary>
    /// Executes the import job for the given session
    /// </summary>
    public async Task ExecuteAsync(Guid tenantId, Guid sessionId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting import for session {SessionId} in tenant {TenantId}", sessionId, tenantId);

        try
        {
            await using var context = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

            var session = await context.MigrationSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

            if (session == null)
            {
                _logger.LogError("Session {SessionId} not found in tenant {TenantId}", sessionId, tenantId);
                return;
            }

            // Update status to importing
            session.UpdateStatus(MigrationSessionStatus.Importing);
            await context.SaveChangesAsync(cancellationToken);

            // Get all valid records that should be imported
            // Note: Use GlobalRowIndex instead of RowNumber (computed property) for EF Core translation
            var recordsToImport = await context.MigrationValidationResults
                .Where(r => r.SessionId == sessionId &&
                           (r.Status == ValidationStatus.Valid ||
                            r.Status == ValidationStatus.Warning ||
                            r.Status == ValidationStatus.Fixed) &&
                           r.UserAction != "skip")
                .OrderBy(r => r.EntityType)
                .ThenBy(r => r.GlobalRowIndex)
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
                            importErrors.Add($"Row {record.GlobalRowIndex}: Data deserialization failed");
                            continue;
                        }

                        // Import the record to tenant database
                        var success = await ImportRecordAsync(
                            context,
                            tenantId,
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
                            importErrors.Add($"Row {record.GlobalRowIndex}: Import failed");
                        }
                    }
                    catch (Exception ex)
                    {
                        failedCount++;
                        importErrors.Add($"Row {record.GlobalRowIndex}: {ex.Message}");
                        _logger.LogError(ex, "Error importing record {RecordId}", record.Id);
                    }
                }

                // Save progress after each entity type batch
                await context.SaveChangesAsync(cancellationToken);
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

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Import job failed for session {SessionId}", sessionId);

            // Update session status to failed
            try
            {
                await using var context = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
                var session = await context.MigrationSessions
                    .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

                if (session != null)
                {
                    session.SetError($"Import failed: {ex.Message}");
                    await context.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception innerEx)
            {
                _logger.LogError(innerEx, "Failed to update session status after import failure");
            }
        }
    }

    /// <summary>
    /// Imports a single record to the tenant database
    /// </summary>
    private async Task<bool> ImportRecordAsync(
        ITenantDbContext context,
        Guid tenantId,
        MigrationEntityType entityType,
        Dictionary<string, object?> data,
        string? mappingConfigJson,
        CancellationToken cancellationToken)
    {
        // Build field mappings from config or auto-detect from Turkish patterns
        var fieldMappings = BuildFieldMappings(data, entityType, mappingConfigJson);

        // Map source fields to target fields using the mappings
        var mappedData = MapFieldsWithMappings(data, fieldMappings);

        _logger.LogDebug("Importing {EntityType} record to tenant {TenantId}: {Data}",
            entityType, tenantId, JsonSerializer.Serialize(mappedData));

        switch (entityType)
        {
            case MigrationEntityType.Product:
                await ImportProductAsync(context, tenantId, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Category:
                await ImportCategoryAsync(context, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Customer:
                await ImportCustomerAsync(context, tenantId, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Supplier:
                await ImportSupplierAsync(context, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Brand:
                await ImportBrandAsync(context, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Unit:
                await ImportUnitAsync(context, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Warehouse:
                await ImportWarehouseAsync(context, mappedData, cancellationToken);
                break;

            case MigrationEntityType.Stock:
            case MigrationEntityType.OpeningBalance:
                await ImportStockAsync(context, mappedData, cancellationToken);
                break;

            default:
                _logger.LogWarning("Entity type {EntityType} import not implemented", entityType);
                return false;
        }

        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task ImportProductAsync(ITenantDbContext context, Guid tenantId, Dictionary<string, object?> data, CancellationToken ct)
    {
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

    private async Task ImportCustomerAsync(ITenantDbContext context, Guid tenantId, Dictionary<string, object?> data, CancellationToken ct)
    {
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

        // Also create CRM Customer so it shows up in CRM module
        await CreateCrmCustomerAsync(tenantId, name, emailStr, phone, addressLine, city, district, country, postalCode, taxNumber, ct);
    }


    /// <summary>
    /// Creates a customer in the CRM module database
    /// </summary>
    private async Task CreateCrmCustomerAsync(
        Guid tenantId,
        string companyName,
        string email,
        string? phone,
        string? address,
        string? city,
        string? district,
        string? country,
        string? postalCode,
        string? taxId,
        CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var scopedProvider = scope.ServiceProvider;

        try
        {
            // Set up tenant context for CRM module
            var tenantResolver = scopedProvider.GetRequiredService<ITenantResolver>();
            var backgroundTenantService = scopedProvider.GetRequiredService<IBackgroundTenantService>();

            var tenantInfo = await tenantResolver.ResolveByIdAsync(tenantId);
            if (tenantInfo == null)
            {
                _logger.LogWarning("Tenant not found for CRM customer creation. TenantId: {TenantId}", tenantId);
                return;
            }

            // Set tenant context for this scope
            backgroundTenantService.SetTenantInfo(
                tenantId,
                tenantInfo.Name,
                tenantInfo.ConnectionString);

            // Get CRM DbContext with proper tenant context
            var crmContext = scopedProvider.GetRequiredService<CRMDbContext>();

            // Check if CRM customer already exists
            var existingCrm = await crmContext.Customers
                .FirstOrDefaultAsync(c => c.CompanyName == companyName, ct);

            if (existingCrm != null)
            {
                _logger.LogDebug("CRM Customer {CompanyName} already exists, skipping", companyName);
                return;
            }

            // Create CRM Customer
            var crmCustomerResult = CrmCustomer.Create(
                tenantId,
                companyName,
                email,
                phone);

            if (!crmCustomerResult.IsSuccess)
            {
                _logger.LogWarning("Failed to create CRM customer {CompanyName}: {Error}",
                    companyName, crmCustomerResult.Error);
                return;
            }

            var crmCustomer = crmCustomerResult.Value!;

            // Set address if available
            if (!string.IsNullOrEmpty(address) || !string.IsNullOrEmpty(city))
            {
                crmCustomer.UpdateAddressLegacy(address, city, district, country, postalCode);
            }

            // Set tax ID if available
            if (!string.IsNullOrEmpty(taxId))
            {
                crmCustomer.UpdateFinancialInfo(null, null, null, taxId, null, null);
            }

            await crmContext.Customers.AddAsync(crmCustomer, ct);
            await crmContext.SaveChangesAsync(ct);

            _logger.LogDebug("Created CRM customer {CompanyName} for tenant {TenantId}",
                companyName, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create CRM customer {CompanyName}: {Message}",
                companyName, ex.Message);
            // Don't throw - CRM customer creation is secondary, core customer was already created
        }
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

    #region Helper Methods

    private string? GetStringValue(Dictionary<string, object?> data, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (data.TryGetValue(key, out var value) && value != null)
            {
                string? strValue = null;

                if (value is JsonElement jsonElement)
                {
                    // Handle different JSON value types
                    strValue = jsonElement.ValueKind switch
                    {
                        JsonValueKind.String => jsonElement.GetString(),
                        JsonValueKind.Number => jsonElement.ToString(),
                        JsonValueKind.True => "true",
                        JsonValueKind.False => "false",
                        JsonValueKind.Null => null,
                        _ => jsonElement.ToString()
                    };
                }
                else
                {
                    strValue = value.ToString();
                }

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
                decimal decVal = 0;
                bool parsed = false;

                if (value is JsonElement jsonElement)
                {
                    // Handle different JSON value types
                    if (jsonElement.ValueKind == JsonValueKind.Number)
                    {
                        if (jsonElement.TryGetDecimal(out decVal))
                        {
                            parsed = true;
                        }
                    }
                    else if (jsonElement.ValueKind == JsonValueKind.String)
                    {
                        // Value is stored as string in JSON, parse it
                        var strValue = jsonElement.GetString();
                        if (TryParseDecimal(strValue, out decVal))
                        {
                            parsed = true;
                        }
                    }
                }
                else if (TryParseDecimal(value.ToString(), out decVal))
                {
                    parsed = true;
                }

                if (parsed)
                {
                    // Normalize VAT rate if stored as percentage * 100
                    if (key.Contains("Vat", StringComparison.OrdinalIgnoreCase) ||
                        key.Contains("Kdv", StringComparison.OrdinalIgnoreCase))
                    {
                        if (decVal > 100) decVal /= 100;
                    }
                    return decVal;
                }
            }
        }
        return 0;
    }

    /// <summary>
    /// Tries to parse a decimal value supporting both Turkish (comma) and English (dot) formats
    /// </summary>
    private static bool TryParseDecimal(string? value, out decimal result)
    {
        result = 0;
        if (string.IsNullOrWhiteSpace(value))
            return false;

        // Try invariant culture first (dot as decimal separator)
        if (decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return true;

        // Try Turkish culture (comma as decimal separator)
        if (decimal.TryParse(value, NumberStyles.Any, new CultureInfo("tr-TR"), out result))
            return true;

        // Try replacing comma with dot and parse again
        var normalized = value.Replace(",", ".");
        if (decimal.TryParse(normalized, NumberStyles.Any, CultureInfo.InvariantCulture, out result))
            return true;

        return false;
    }

    #endregion

    /// <summary>
    /// Builds field mappings from config or auto-detects from Turkish patterns.
    /// Returns a dictionary mapping target field names to source field names.
    /// </summary>
    private Dictionary<string, string> BuildFieldMappings(
        Dictionary<string, object?> record,
        MigrationEntityType entityType,
        string? mappingConfigJson)
    {
        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        // Try to parse mapping config if available
        if (!string.IsNullOrEmpty(mappingConfigJson))
        {
            try
            {
                // Try parsing as simple Dictionary<string, string> first
                var simpleMappings = JsonSerializer.Deserialize<Dictionary<string, string>>(mappingConfigJson);
                if (simpleMappings != null && simpleMappings.Count > 0)
                {
                    foreach (var kv in simpleMappings)
                    {
                        result[kv.Key] = kv.Value;
                    }
                    return result;
                }
            }
            catch
            {
                // Try parsing as MappingConfigDto structure
                try
                {
                    using var doc = JsonDocument.Parse(mappingConfigJson);
                    if (doc.RootElement.TryGetProperty("EntityMappings", out var entityMappings) ||
                        doc.RootElement.TryGetProperty("entityMappings", out entityMappings))
                    {
                        var entityKey = entityType.ToString();
                        if (entityMappings.TryGetProperty(entityKey, out var entityMapping) ||
                            entityMappings.TryGetProperty(entityKey.ToLower(), out entityMapping))
                        {
                            if (entityMapping.TryGetProperty("FieldMappings", out var fieldMappings) ||
                                entityMapping.TryGetProperty("fieldMappings", out fieldMappings))
                            {
                                foreach (var fm in fieldMappings.EnumerateArray())
                                {
                                    var sourceField = fm.TryGetProperty("SourceField", out var sf) ? sf.GetString() :
                                                      fm.TryGetProperty("sourceField", out sf) ? sf.GetString() : null;
                                    var targetField = fm.TryGetProperty("TargetField", out var tf) ? tf.GetString() :
                                                      fm.TryGetProperty("targetField", out tf) ? tf.GetString() : null;

                                    if (!string.IsNullOrEmpty(targetField) && !string.IsNullOrEmpty(sourceField))
                                    {
                                        result[targetField] = sourceField;
                                    }
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Ignore parsing errors, fall through to auto-detection
                }
            }
        }

        // Auto-detect field mappings from record keys using Turkish patterns
        var sourceFields = record.Keys.ToList();
        foreach (var sourceField in sourceFields)
        {
            var normalizedSource = sourceField.ToLowerInvariant()
                .Replace("*", "")
                .Replace("(", "")
                .Replace(")", "")
                .Replace("%", "")
                .Trim();

            foreach (var (targetField, patterns) in TurkishFieldPatterns)
            {
                // Skip if already mapped
                if (result.ContainsKey(targetField))
                    continue;

                foreach (var pattern in patterns)
                {
                    if (normalizedSource.Contains(pattern) || pattern.Contains(normalizedSource))
                    {
                        result[targetField] = sourceField;
                        break;
                    }
                }
            }

            // Direct match (case-insensitive)
            foreach (var targetField in TurkishFieldPatterns.Keys)
            {
                if (!result.ContainsKey(targetField) &&
                    string.Equals(normalizedSource, targetField, StringComparison.OrdinalIgnoreCase))
                {
                    result[targetField] = sourceField;
                }
            }
        }

        return result;
    }

    /// <summary>
    /// Maps source field names to target field names based on field mappings
    /// </summary>
    private Dictionary<string, object?> MapFieldsWithMappings(
        Dictionary<string, object?> sourceData,
        Dictionary<string, string> fieldMappings)
    {
        var result = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

        // First, copy all original data
        foreach (var kv in sourceData)
        {
            result[kv.Key] = kv.Value;
        }

        // Then apply mappings (target field -> source field value)
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
