using Stocker.SharedKernel.Primitives;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Domain.Migration.Entities;

/// <summary>
/// Represents a data migration session from external ERP/CRM systems
/// </summary>
public sealed class MigrationSession : Entity
{
    private MigrationSession() { } // EF Core

    public MigrationSession(
        Guid tenantId,
        Guid createdByUserId,
        MigrationSourceType sourceType,
        string sourceName,
        List<MigrationEntityType> entities)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        CreatedByUserId = createdByUserId;
        SourceType = sourceType;
        SourceName = sourceName;
        Entities = entities;
        Status = MigrationSessionStatus.Created;
        CreatedAt = DateTime.UtcNow;
        ExpiresAt = DateTime.UtcNow.AddDays(7); // Auto-cleanup after 7 days
    }

    /// <summary>Tenant owning this migration session</summary>
    public Guid TenantId { get; private set; }

    /// <summary>User who initiated the migration</summary>
    public Guid CreatedByUserId { get; private set; }

    /// <summary>Type of source system (Logo, ETA, Excel, etc.)</summary>
    public MigrationSourceType SourceType { get; private set; }

    /// <summary>Friendly name of source (e.g., "Logo Tiger 3.0")</summary>
    public string SourceName { get; private set; } = string.Empty;

    /// <summary>Current session status</summary>
    public MigrationSessionStatus Status { get; private set; }

    /// <summary>Entities being migrated</summary>
    public List<MigrationEntityType> Entities { get; private set; } = new();

    /// <summary>Total records across all chunks</summary>
    public int TotalRecords { get; private set; }

    /// <summary>Records that passed validation</summary>
    public int ValidRecords { get; private set; }

    /// <summary>Records with warnings</summary>
    public int WarningRecords { get; private set; }

    /// <summary>Records with errors</summary>
    public int ErrorRecords { get; private set; }

    /// <summary>Successfully imported records</summary>
    public int ImportedRecords { get; private set; }

    /// <summary>Skipped records (by user choice)</summary>
    public int SkippedRecords { get; private set; }

    /// <summary>Options JSON (update existing, skip errors, etc.)</summary>
    public string? OptionsJson { get; private set; }

    /// <summary>Field mapping configuration JSON</summary>
    public string? MappingConfigJson { get; private set; }

    /// <summary>Error message if failed</summary>
    public string? ErrorMessage { get; private set; }

    /// <summary>Hangfire job ID for import</summary>
    public string? ImportJobId { get; private set; }

    /// <summary>When session was created</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>When validation completed</summary>
    public DateTime? ValidatedAt { get; private set; }

    /// <summary>When import started</summary>
    public DateTime? ImportStartedAt { get; private set; }

    /// <summary>When import completed</summary>
    public DateTime? CompletedAt { get; private set; }

    /// <summary>When session expires for auto-cleanup</summary>
    public DateTime ExpiresAt { get; private set; }

    /// <summary>Navigation: Uploaded chunks</summary>
    public ICollection<MigrationChunk> Chunks { get; private set; } = new List<MigrationChunk>();

    /// <summary>Navigation: Validation results</summary>
    public ICollection<MigrationValidationResult> ValidationResults { get; private set; } = new List<MigrationValidationResult>();

    // Domain methods

    public void MarkAsUploading()
    {
        if (Status != MigrationSessionStatus.Created && Status != MigrationSessionStatus.Uploading)
            throw new InvalidOperationException($"Cannot start uploading from status {Status}");

        Status = MigrationSessionStatus.Uploading;
    }

    public void MarkAsUploaded(int totalRecords)
    {
        if (Status != MigrationSessionStatus.Uploading)
            throw new InvalidOperationException($"Cannot mark as uploaded from status {Status}");

        Status = MigrationSessionStatus.Uploaded;
        TotalRecords = totalRecords;
    }

    public void StartValidation()
    {
        if (Status != MigrationSessionStatus.Uploaded)
            throw new InvalidOperationException($"Cannot start validation from status {Status}");

        Status = MigrationSessionStatus.Validating;
    }

    public void CompleteValidation(int validRecords, int warningRecords, int errorRecords)
    {
        if (Status != MigrationSessionStatus.Validating)
            throw new InvalidOperationException($"Cannot complete validation from status {Status}");

        Status = MigrationSessionStatus.Validated;
        ValidRecords = validRecords;
        WarningRecords = warningRecords;
        ErrorRecords = errorRecords;
        ValidatedAt = DateTime.UtcNow;
    }

    public void StartImport(string hangfireJobId)
    {
        if (Status != MigrationSessionStatus.Validated)
            throw new InvalidOperationException($"Cannot start import from status {Status}");

        Status = MigrationSessionStatus.Importing;
        ImportJobId = hangfireJobId;
        ImportStartedAt = DateTime.UtcNow;
    }

    public void CompleteImport(int importedRecords, int skippedRecords)
    {
        if (Status != MigrationSessionStatus.Importing)
            throw new InvalidOperationException($"Cannot complete import from status {Status}");

        Status = MigrationSessionStatus.Completed;
        ImportedRecords = importedRecords;
        SkippedRecords = skippedRecords;
        CompletedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string errorMessage)
    {
        Status = MigrationSessionStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == MigrationSessionStatus.Completed || Status == MigrationSessionStatus.Importing)
            throw new InvalidOperationException($"Cannot cancel from status {Status}");

        Status = MigrationSessionStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
    }

    public void SetOptions(string optionsJson)
    {
        OptionsJson = optionsJson;
    }

    public void SetMappingConfig(string mappingConfigJson)
    {
        MappingConfigJson = mappingConfigJson;
    }

    public void UpdateRecordCounts(int total, int valid, int warning, int error)
    {
        TotalRecords = total;
        ValidRecords = valid;
        WarningRecords = warning;
        ErrorRecords = error;
    }

    /// <summary>Updates status (for background job use)</summary>
    public void UpdateStatus(MigrationSessionStatus newStatus)
    {
        Status = newStatus;
        if (newStatus == MigrationSessionStatus.Validated)
            ValidatedAt = DateTime.UtcNow;
        else if (newStatus == MigrationSessionStatus.Importing)
            ImportStartedAt = DateTime.UtcNow;
        else if (newStatus == MigrationSessionStatus.Completed)
            CompletedAt = DateTime.UtcNow;
    }

    /// <summary>Sets validation statistics</summary>
    public void SetStatistics(int total, int valid, int errors, int warnings)
    {
        TotalRecords = total;
        ValidRecords = valid;
        ErrorRecords = errors;
        WarningRecords = warnings;
    }

    /// <summary>Sets import results</summary>
    public void SetImportResults(int imported, int failed)
    {
        ImportedRecords = imported;
        SkippedRecords = TotalRecords - imported - failed;
    }

    /// <summary>Sets error message</summary>
    public void SetError(string message)
    {
        Status = MigrationSessionStatus.Failed;
        ErrorMessage = message;
        CompletedAt = DateTime.UtcNow;
    }

    /// <summary>Sets warning message without changing status</summary>
    public void SetWarning(string message)
    {
        // Append to error message as warning
        if (string.IsNullOrEmpty(ErrorMessage))
            ErrorMessage = $"Warning: {message}";
        else
            ErrorMessage += $"; Warning: {message}";
    }

    public bool IsExpired => DateTime.UtcNow > ExpiresAt;

    public bool CanBeDeleted => Status == MigrationSessionStatus.Completed ||
                                Status == MigrationSessionStatus.Failed ||
                                Status == MigrationSessionStatus.Cancelled ||
                                Status == MigrationSessionStatus.Expired ||
                                IsExpired;
}
