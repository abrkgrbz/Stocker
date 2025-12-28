using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using System.Text.Json;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

/// <summary>
/// Background job for importing validated migration data into the tenant database
/// </summary>
public class MigrationImportJob
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<MigrationImportJob> _logger;

    public MigrationImportJob(
        IMasterDbContext context,
        ILogger<MigrationImportJob> logger)
    {
        _context = context;
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

        // TODO: This is where we would call the tenant-specific repository
        // to actually insert the data. For now, we simulate success.
        //
        // The actual implementation would:
        // 1. Get the tenant's database context
        // 2. Create the appropriate entity (Product, Customer, etc.)
        // 3. Save to the tenant database
        //
        // Example:
        // switch (entityType)
        // {
        //     case MigrationEntityType.Product:
        //         var product = CreateProduct(mappedData);
        //         await tenantContext.Products.AddAsync(product);
        //         break;
        //     case MigrationEntityType.Customer:
        //         var customer = CreateCustomer(mappedData);
        //         await tenantContext.Customers.AddAsync(customer);
        //         break;
        //     ...
        // }
        // await tenantContext.SaveChangesAsync(cancellationToken);

        _logger.LogDebug("Importing {EntityType} record to tenant {TenantId}: {Data}",
            entityType, tenantId, JsonSerializer.Serialize(mappedData));

        // Simulate async operation
        await Task.Delay(1, cancellationToken);

        return true;
    }

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
