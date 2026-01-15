using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using System.Text.Json;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Background job for validating migration data.
/// Updates existing validation result records that were created during upload.
/// Processes records in batches to handle large datasets efficiently.
/// </summary>
public class MigrationValidationJob
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ILogger<MigrationValidationJob> _logger;
    private const int BATCH_SIZE = 500; // Process 500 records at a time

    public MigrationValidationJob(
        ITenantDbContextFactory tenantDbContextFactory,
        ILogger<MigrationValidationJob> logger)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
        _logger = logger;
    }

    /// <summary>
    /// Executes the validation job for the given session
    /// </summary>
    public async Task ExecuteAsync(Guid tenantId, Guid sessionId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting validation for session {SessionId} in tenant {TenantId}", sessionId, tenantId);

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

            // Update status to validating
            session.UpdateStatus(MigrationSessionStatus.Validating);
            await context.SaveChangesAsync(cancellationToken);

            // Get total count of pending validation results
            var totalPendingCount = await context.MigrationValidationResults
                .CountAsync(r => r.SessionId == sessionId && r.Status == ValidationStatus.Pending, cancellationToken);

            _logger.LogInformation("Found {Count} pending validation results for session {SessionId}",
                totalPendingCount, sessionId);

            int totalRecords = 0;
            int validRecords = 0;
            int errorRecords = 0;
            int warningRecords = 0;
            int processedBatches = 0;

            // Process in batches to avoid memory issues with large datasets
            while (true)
            {
                // Fetch next batch of pending records
                var batch = await context.MigrationValidationResults
                    .Where(r => r.SessionId == sessionId && r.Status == ValidationStatus.Pending)
                    .OrderBy(r => r.GlobalRowIndex)
                    .Take(BATCH_SIZE)
                    .ToListAsync(cancellationToken);

                if (batch.Count == 0)
                    break;

                foreach (var result in batch)
                {
                    try
                    {
                        totalRecords++;

                        // Parse original data
                        var record = JsonSerializer.Deserialize<Dictionary<string, object?>>(result.OriginalDataJson);
                        if (record == null)
                        {
                            result.SetValidationResult(
                                ValidationStatus.Error,
                                new List<string> { "Veri okunamadı" },
                                new List<string>());
                            errorRecords++;
                            continue;
                        }

                        // Validate the record
                        var validationResult = ValidateRecord(record, result.EntityType, session.MappingConfigJson);

                        if (validationResult.Errors.Count > 0)
                        {
                            result.SetValidationResult(
                                ValidationStatus.Error,
                                validationResult.Errors,
                                validationResult.Warnings);
                            errorRecords++;
                        }
                        else if (validationResult.Warnings.Count > 0)
                        {
                            result.SetValidationResult(
                                ValidationStatus.Warning,
                                validationResult.Errors,
                                validationResult.Warnings);
                            warningRecords++;
                        }
                        else
                        {
                            result.SetValidationResult(
                                ValidationStatus.Valid,
                                new List<string>(),
                                new List<string>());
                            validRecords++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error validating record {RecordId}", result.Id);
                        result.SetValidationResult(
                            ValidationStatus.Error,
                            new List<string> { $"Doğrulama hatası: {ex.Message}" },
                            new List<string>());
                        errorRecords++;
                    }
                }

                // Save batch changes
                await context.SaveChangesAsync(cancellationToken);
                processedBatches++;

                _logger.LogDebug("Validation progress: {Current}/{Total} records processed (batch {Batch})",
                    totalRecords, totalPendingCount, processedBatches);
            }

            // Mark all chunks as validated
            var chunks = await context.MigrationChunks
                .Where(c => c.SessionId == sessionId)
                .ToListAsync(cancellationToken);

            foreach (var chunk in chunks)
            {
                chunk.MarkAsValidated();
            }

            await context.SaveChangesAsync(cancellationToken);

            // Update session statistics and status
            session.SetStatistics(totalRecords, validRecords, errorRecords, warningRecords);
            session.UpdateStatus(MigrationSessionStatus.Validated);
            await context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Validation completed for session {SessionId}. Total: {Total}, Valid: {Valid}, Errors: {Errors}, Warnings: {Warnings}",
                sessionId, totalRecords, validRecords, errorRecords, warningRecords);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Validation failed for session {SessionId}", sessionId);

            // Update session status to failed
            try
            {
                await using var context = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);
                var session = await context.MigrationSessions
                    .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

                if (session != null)
                {
                    session.SetError($"Validation failed: {ex.Message}");
                    await context.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception innerEx)
            {
                _logger.LogError(innerEx, "Failed to update session status after validation failure");
            }
        }
    }

    private ValidationResult ValidateRecord(
        Dictionary<string, object?> record,
        MigrationEntityType entityType,
        string? mappingConfigJson)
    {
        var errors = new List<string>();
        var warnings = new List<string>();

        // Get required fields for entity type
        var requiredFields = GetRequiredFields(entityType);

        // Parse mapping config if available
        Dictionary<string, string>? fieldMappings = null;
        if (!string.IsNullOrEmpty(mappingConfigJson))
        {
            try
            {
                fieldMappings = JsonSerializer.Deserialize<Dictionary<string, string>>(mappingConfigJson);
            }
            catch
            {
                // If mapping config is invalid, use direct field names
            }
        }

        // Validate required fields
        foreach (var requiredField in requiredFields)
        {
            var sourceField = fieldMappings?.GetValueOrDefault(requiredField) ?? requiredField;

            if (!record.TryGetValue(sourceField, out var value) ||
                value == null ||
                string.IsNullOrWhiteSpace(value.ToString()))
            {
                errors.Add($"Zorunlu alan eksik: {requiredField}");
            }
        }

        // Entity-specific validation
        switch (entityType)
        {
            case MigrationEntityType.Product:
                ValidateProduct(record, fieldMappings, errors, warnings);
                break;
            case MigrationEntityType.Customer:
            case MigrationEntityType.Supplier:
                ValidateCustomerSupplier(record, fieldMappings, errors, warnings);
                break;
            case MigrationEntityType.OpeningBalance:
            case MigrationEntityType.StockMovement:
                ValidateStockData(record, fieldMappings, errors, warnings);
                break;
        }

        return new ValidationResult(errors, warnings);
    }

    private void ValidateProduct(
        Dictionary<string, object?> record,
        Dictionary<string, string>? mappings,
        List<string> errors,
        List<string> warnings)
    {
        // Validate price fields if present
        var priceFields = new[] { "PurchasePrice", "SalePrice" };
        foreach (var field in priceFields)
        {
            var sourceField = mappings?.GetValueOrDefault(field) ?? field;
            if (record.TryGetValue(sourceField, out var value) && value != null)
            {
                if (!decimal.TryParse(value.ToString(), out var price))
                {
                    errors.Add($"{field} geçerli bir sayı değil");
                }
                else if (price < 0)
                {
                    warnings.Add($"{field} negatif değer içeriyor");
                }
            }
        }

        // Validate VAT rate
        var vatField = mappings?.GetValueOrDefault("VatRate") ?? "VatRate";
        if (record.TryGetValue(vatField, out var vatValue) && vatValue != null)
        {
            if (decimal.TryParse(vatValue.ToString(), out var vat))
            {
                var validRates = new[] { 0m, 1m, 8m, 10m, 18m, 20m };
                if (!validRates.Contains(vat))
                {
                    warnings.Add($"KDV oranı standart değerler arasında değil: {vat}%");
                }
            }
        }
    }

    private void ValidateCustomerSupplier(
        Dictionary<string, object?> record,
        Dictionary<string, string>? mappings,
        List<string> errors,
        List<string> warnings)
    {
        // Validate tax number if present
        var taxField = mappings?.GetValueOrDefault("TaxNumber") ?? "TaxNumber";
        if (record.TryGetValue(taxField, out var taxValue) && taxValue != null)
        {
            var taxNumber = taxValue.ToString()!.Trim();
            if (!string.IsNullOrEmpty(taxNumber))
            {
                // Turkish VKN is 10 digits, TCKN is 11 digits
                if (taxNumber.Length != 10 && taxNumber.Length != 11)
                {
                    warnings.Add("Vergi numarası 10 veya 11 haneli olmalıdır");
                }
                else if (!taxNumber.All(char.IsDigit))
                {
                    errors.Add("Vergi numarası sadece rakam içermelidir");
                }
            }
        }

        // Validate email if present
        var emailField = mappings?.GetValueOrDefault("Email") ?? "Email";
        if (record.TryGetValue(emailField, out var emailValue) && emailValue != null)
        {
            var email = emailValue.ToString()!.Trim();
            if (!string.IsNullOrEmpty(email) && !email.Contains('@'))
            {
                errors.Add("E-posta adresi geçerli değil");
            }
        }
    }

    private void ValidateStockData(
        Dictionary<string, object?> record,
        Dictionary<string, string>? mappings,
        List<string> errors,
        List<string> warnings)
    {
        // Validate quantity
        var qtyField = mappings?.GetValueOrDefault("Quantity") ?? "Quantity";
        if (record.TryGetValue(qtyField, out var qtyValue) && qtyValue != null)
        {
            if (!decimal.TryParse(qtyValue.ToString(), out _))
            {
                errors.Add("Miktar geçerli bir sayı değil");
            }
        }

        // Validate date if present
        var dateField = mappings?.GetValueOrDefault("Date") ?? "Date";
        if (record.TryGetValue(dateField, out var dateValue) && dateValue != null)
        {
            var dateStr = dateValue.ToString()!.Trim();
            if (!string.IsNullOrEmpty(dateStr) && !DateTime.TryParse(dateStr, out _))
            {
                errors.Add("Tarih formatı geçerli değil");
            }
        }
    }

    private List<string> GetRequiredFields(MigrationEntityType entityType)
    {
        return entityType switch
        {
            MigrationEntityType.Product => new List<string> { "Code", "Name", "Unit" },
            MigrationEntityType.Customer => new List<string> { "Code", "Name" },
            MigrationEntityType.Supplier => new List<string> { "Code", "Name" },
            MigrationEntityType.Category => new List<string> { "Code", "Name" },
            MigrationEntityType.Warehouse => new List<string> { "Code", "Name" },
            MigrationEntityType.OpeningBalance => new List<string> { "ProductCode", "WarehouseCode", "Quantity" },
            MigrationEntityType.StockMovement => new List<string> { "ProductCode", "WarehouseCode", "Quantity", "MovementType", "Date" },
            MigrationEntityType.PriceList => new List<string> { "ProductCode", "PriceListCode", "Price" },
            _ => new List<string>()
        };
    }

    private record ValidationResult(List<string> Errors, List<string> Warnings);
}
