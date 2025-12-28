using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using System.Text.Json;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Background job for validating migration data
/// </summary>
public class MigrationValidationJob
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<MigrationValidationJob> _logger;

    public MigrationValidationJob(
        IMasterDbContext context,
        ILogger<MigrationValidationJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Executes the validation job for the given session
    /// </summary>
    public async Task ExecuteAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting validation for session {SessionId}", sessionId);

        try
        {
            var session = await _context.MigrationSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

            if (session == null)
            {
                _logger.LogError("Session {SessionId} not found", sessionId);
                return;
            }

            // Update status to validating
            session.UpdateStatus(MigrationSessionStatus.Validating);
            await _context.SaveChangesAsync(cancellationToken);

            // Get all chunks for this session
            var chunks = await _context.MigrationChunks
                .Where(c => c.SessionId == sessionId)
                .OrderBy(c => c.EntityType)
                .ThenBy(c => c.ChunkIndex)
                .ToListAsync(cancellationToken);

            int totalRecords = 0;
            int validRecords = 0;
            int errorRecords = 0;
            int warningRecords = 0;

            foreach (var chunk in chunks)
            {
                try
                {
                    // Parse chunk data
                    var records = JsonSerializer.Deserialize<List<Dictionary<string, object?>>>(chunk.DataJson);
                    if (records == null) continue;

                    foreach (var record in records)
                    {
                        totalRecords++;

                        // Validate the record
                        var validationResult = ValidateRecord(record, chunk.EntityType, session.MappingConfigJson);

                        // Create validation result entity
                        var resultEntity = new Domain.Migration.Entities.MigrationValidationResult(
                            sessionId: sessionId,
                            entityType: chunk.EntityType,
                            rowNumber: totalRecords,
                            originalDataJson: JsonSerializer.Serialize(record));

                        if (validationResult.Errors.Count > 0)
                        {
                            resultEntity.SetValidationResult(
                                ValidationStatus.Error,
                                validationResult.Errors,
                                validationResult.Warnings);
                            errorRecords++;
                        }
                        else if (validationResult.Warnings.Count > 0)
                        {
                            resultEntity.SetValidationResult(
                                ValidationStatus.Warning,
                                validationResult.Errors,
                                validationResult.Warnings);
                            warningRecords++;
                        }
                        else
                        {
                            resultEntity.SetValidationResult(
                                ValidationStatus.Valid,
                                new List<string>(),
                                new List<string>());
                            validRecords++;
                        }

                        _context.MigrationValidationResults.Add(resultEntity);
                    }

                    // Update chunk status
                    chunk.MarkAsValidated();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing chunk {ChunkId}", chunk.Id);
                    chunk.MarkAsFailed(ex.Message);
                }
            }

            // Save all validation results
            await _context.SaveChangesAsync(cancellationToken);

            // Update session statistics and status
            session.SetStatistics(totalRecords, validRecords, errorRecords, warningRecords);
            session.UpdateStatus(MigrationSessionStatus.Validated);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Validation completed for session {SessionId}. Total: {Total}, Valid: {Valid}, Errors: {Errors}, Warnings: {Warnings}",
                sessionId, totalRecords, validRecords, errorRecords, warningRecords);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Validation failed for session {SessionId}", sessionId);

            // Update session status to failed
            var session = await _context.MigrationSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);

            if (session != null)
            {
                session.SetError($"Validation failed: {ex.Message}");
                await _context.SaveChangesAsync(cancellationToken);
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
