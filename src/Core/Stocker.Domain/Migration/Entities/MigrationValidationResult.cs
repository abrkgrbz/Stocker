using Stocker.SharedKernel.Primitives;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Domain.Migration.Entities;

/// <summary>
/// Represents validation result for a single record in migration
/// </summary>
public sealed class MigrationValidationResult : Entity
{
    private MigrationValidationResult() { } // EF Core

    public MigrationValidationResult(
        Guid sessionId,
        Guid chunkId,
        MigrationEntityType entityType,
        int rowIndex,
        string originalDataJson)
    {
        Id = Guid.NewGuid();
        SessionId = sessionId;
        ChunkId = chunkId;
        EntityType = entityType;
        RowIndex = rowIndex;
        OriginalDataJson = originalDataJson;
        Status = ValidationStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>Alternative constructor for background job (without chunk reference)</summary>
    public MigrationValidationResult(
        Guid sessionId,
        MigrationEntityType entityType,
        int rowNumber,
        string originalDataJson)
    {
        Id = Guid.NewGuid();
        SessionId = sessionId;
        ChunkId = Guid.Empty; // Will be set later if needed
        EntityType = entityType;
        RowIndex = rowNumber;
        GlobalRowIndex = rowNumber;
        OriginalDataJson = originalDataJson;
        Status = ValidationStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>Parent session ID</summary>
    public Guid SessionId { get; private set; }

    /// <summary>Parent chunk ID</summary>
    public Guid ChunkId { get; private set; }

    /// <summary>Type of entity</summary>
    public MigrationEntityType EntityType { get; private set; }

    /// <summary>Row index within the chunk (for error reporting)</summary>
    public int RowIndex { get; private set; }

    /// <summary>Global row index across all chunks</summary>
    public int GlobalRowIndex { get; private set; }

    /// <summary>Original data from source as JSON object</summary>
    public string OriginalDataJson { get; private set; } = string.Empty;

    /// <summary>Transformed data ready for import (after mapping)</summary>
    public string? TransformedDataJson { get; private set; }

    /// <summary>Validation status</summary>
    public ValidationStatus Status { get; private set; }

    /// <summary>Validation errors as JSON array</summary>
    public string? ErrorsJson { get; private set; }

    /// <summary>Validation warnings as JSON array</summary>
    public string? WarningsJson { get; private set; }

    /// <summary>User action on this record</summary>
    public string? UserAction { get; private set; } // "import", "skip", "fix"

    /// <summary>Fixed data if user edited</summary>
    public string? FixedDataJson { get; private set; }

    /// <summary>When record was created</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>When validation ran</summary>
    public DateTime? ValidatedAt { get; private set; }

    /// <summary>When import completed for this record</summary>
    public DateTime? ImportedAt { get; private set; }

    /// <summary>Navigation: Parent session</summary>
    public MigrationSession Session { get; private set; } = null!;

    /// <summary>Navigation: Parent chunk</summary>
    public MigrationChunk Chunk { get; private set; } = null!;

    // Domain methods

    public void SetGlobalRowIndex(int globalIndex)
    {
        GlobalRowIndex = globalIndex;
    }

    public void SetTransformedData(string transformedDataJson)
    {
        TransformedDataJson = transformedDataJson;
    }

    public void MarkAsValid()
    {
        Status = ValidationStatus.Valid;
        ValidatedAt = DateTime.UtcNow;
    }

    public void MarkAsWarning(string warningsJson)
    {
        Status = ValidationStatus.Warning;
        WarningsJson = warningsJson;
        ValidatedAt = DateTime.UtcNow;
    }

    public void MarkAsError(string errorsJson)
    {
        Status = ValidationStatus.Error;
        ErrorsJson = errorsJson;
        ValidatedAt = DateTime.UtcNow;
    }

    public void MarkAsErrorWithWarnings(string errorsJson, string? warningsJson)
    {
        Status = ValidationStatus.Error;
        ErrorsJson = errorsJson;
        WarningsJson = warningsJson;
        ValidatedAt = DateTime.UtcNow;
    }

    public void Skip()
    {
        Status = ValidationStatus.Skipped;
        UserAction = "skip";
    }

    public void Fix(string fixedDataJson)
    {
        Status = ValidationStatus.Fixed;
        UserAction = "fix";
        FixedDataJson = fixedDataJson;
    }

    public void MarkForImport()
    {
        UserAction = "import";
    }

    public void MarkAsImported()
    {
        ImportedAt = DateTime.UtcNow;
    }

    public bool CanBeImported => Status == ValidationStatus.Valid ||
                                  Status == ValidationStatus.Warning ||
                                  Status == ValidationStatus.Fixed;

    public string GetDataForImport()
    {
        // Priority: Fixed > Transformed > Original
        return FixedDataJson ?? TransformedDataJson ?? OriginalDataJson;
    }

    /// <summary>Sets validation result with errors and warnings (for background job use)</summary>
    public void SetValidationResult(ValidationStatus status, List<string> errors, List<string> warnings)
    {
        Status = status;
        if (errors.Count > 0)
            ErrorsJson = System.Text.Json.JsonSerializer.Serialize(errors);
        if (warnings.Count > 0)
            WarningsJson = System.Text.Json.JsonSerializer.Serialize(warnings);
        ValidatedAt = DateTime.UtcNow;
    }

    /// <summary>Alias for RowIndex/GlobalRowIndex for convenience</summary>
    public int RowNumber => GlobalRowIndex > 0 ? GlobalRowIndex : RowIndex;
}
