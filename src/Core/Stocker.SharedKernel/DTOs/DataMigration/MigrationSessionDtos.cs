namespace Stocker.SharedKernel.DTOs.DataMigration;

// ============================================
// Request DTOs
// ============================================

/// <summary>
/// Request to create a new migration session
/// </summary>
public record CreateMigrationSessionRequest
{
    /// <summary>Source system type (Excel, Logo, ETA, etc.)</summary>
    public required string SourceType { get; init; }

    /// <summary>Friendly name of source (e.g., "Logo Tiger 3.0")</summary>
    public string SourceName { get; init; } = string.Empty;

    /// <summary>Entities to migrate (Customer, Product, Stock, etc.)</summary>
    public required List<string> Entities { get; init; }

    /// <summary>Migration options</summary>
    public MigrationOptionsDto? Options { get; init; }
}

/// <summary>
/// Migration options
/// </summary>
public record MigrationOptionsDto
{
    /// <summary>Update existing records if code/identifier matches</summary>
    public bool UpdateExisting { get; init; } = false;

    /// <summary>Skip records with errors during import</summary>
    public bool SkipErrors { get; init; } = true;

    /// <summary>Create missing reference entities (categories, brands, units)</summary>
    public bool CreateMissingReferences { get; init; } = false;

    /// <summary>Delete existing data before import (dangerous!)</summary>
    public bool DeleteExistingFirst { get; init; } = false;
}

/// <summary>
/// Request to upload a chunk of data
/// </summary>
public record UploadChunkRequest
{
    /// <summary>Entity type being uploaded</summary>
    public required string EntityType { get; init; }

    /// <summary>Zero-based chunk index</summary>
    public required int ChunkIndex { get; init; }

    /// <summary>Total number of chunks for this entity</summary>
    public required int TotalChunks { get; init; }

    /// <summary>Data records (max 1000 per chunk)</summary>
    public required List<Dictionary<string, object?>> Data { get; init; }
}

/// <summary>
/// Request to set field mapping configuration
/// </summary>
public record SetMappingConfigRequest
{
    /// <summary>Mapping configuration</summary>
    public required MappingConfigDto MappingConfig { get; init; }
}

/// <summary>
/// Mapping configuration
/// </summary>
public record MappingConfigDto
{
    /// <summary>Entity mappings by entity type</summary>
    public Dictionary<string, EntityMappingDto> EntityMappings { get; init; } = new();

    /// <summary>Template ID if using a saved template</summary>
    public Guid? TemplateId { get; init; }

    /// <summary>Template name if saving as new template</summary>
    public string? SaveAsTemplateName { get; init; }
}

/// <summary>
/// Entity mapping configuration
/// </summary>
public record EntityMappingDto
{
    /// <summary>Source table name</summary>
    public string? SourceTable { get; init; }

    /// <summary>Target Stocker entity</summary>
    public required string TargetEntity { get; init; }

    /// <summary>Field mappings</summary>
    public required List<FieldMappingDto> FieldMappings { get; init; }

    /// <summary>Default values for unmapped fields</summary>
    public Dictionary<string, object?>? DefaultValues { get; init; }

    /// <summary>Columns to skip</summary>
    public List<string>? SkipColumns { get; init; }
}

/// <summary>
/// Field mapping configuration
/// </summary>
public record FieldMappingDto
{
    /// <summary>Source field name</summary>
    public string? SourceField { get; init; }

    /// <summary>Target field name</summary>
    public string TargetField { get; init; } = string.Empty;

    /// <summary>Confidence score (0-1) for auto-mapping</summary>
    public double Confidence { get; init; }

    /// <summary>Is this field required?</summary>
    public bool Required { get; init; }

    /// <summary>Transform to apply (trim, uppercase, normalize_phone, etc.)</summary>
    public string? Transform { get; init; }

    /// <summary>Validation rule to apply</summary>
    public string? Validation { get; init; }

    /// <summary>Was this auto-mapped?</summary>
    public bool AutoMapped { get; init; }

    /// <summary>User note about this mapping</summary>
    public string? UserNote { get; init; }
}

/// <summary>
/// Request to commit/start import
/// </summary>
public record CommitMigrationRequest
{
    /// <summary>Import options</summary>
    public MigrationOptionsDto? Options { get; init; }
}

// ============================================
// Response DTOs
// ============================================

/// <summary>
/// Migration session response
/// </summary>
public record MigrationSessionResponse
{
    public Guid SessionId { get; init; }
    public Guid TenantId { get; init; }
    public string SourceType { get; init; } = string.Empty;
    public string SourceName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public List<string> Entities { get; init; } = new();

    // Statistics
    public int TotalRecords { get; init; }
    public int ValidRecords { get; init; }
    public int WarningRecords { get; init; }
    public int ErrorRecords { get; init; }
    public int ImportedRecords { get; init; }
    public int SkippedRecords { get; init; }

    // Progress percentage
    public double ValidationProgress { get; init; }
    public double ImportProgress { get; init; }

    // Timestamps
    public DateTime CreatedAt { get; init; }
    public DateTime? ValidatedAt { get; init; }
    public DateTime? ImportStartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public DateTime ExpiresAt { get; init; }

    // Error info
    public string? ErrorMessage { get; init; }
    public string? ImportJobId { get; init; }
}

/// <summary>
/// Response for create session
/// </summary>
public record CreateMigrationSessionResponse
{
    public Guid SessionId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string UploadEndpoint { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}

/// <summary>
/// Chunk upload response
/// </summary>
public record UploadChunkResponse
{
    public Guid ChunkId { get; init; }
    public int ChunkIndex { get; init; }
    public int RecordsReceived { get; init; }
    public int TotalChunksReceived { get; init; }
    public int TotalChunksExpected { get; init; }
    public int TotalRecordsReceived { get; init; }
    public bool IsComplete { get; init; }
}

/// <summary>
/// Validation summary response
/// </summary>
public record ValidationSummaryResponse
{
    public string Status { get; init; } = string.Empty;
    public int TotalRecords { get; init; }
    public int ValidRecords { get; init; }
    public int WarningRecords { get; init; }
    public int ErrorRecords { get; init; }

    public double ValidPercentage => TotalRecords > 0 ? Math.Round((double)ValidRecords / TotalRecords * 100, 1) : 0;
    public double WarningPercentage => TotalRecords > 0 ? Math.Round((double)WarningRecords / TotalRecords * 100, 1) : 0;
    public double ErrorPercentage => TotalRecords > 0 ? Math.Round((double)ErrorRecords / TotalRecords * 100, 1) : 0;

    /// <summary>Breakdown by entity type</summary>
    public List<EntityValidationSummary> EntitySummaries { get; init; } = new();
}

/// <summary>
/// Validation summary per entity type
/// </summary>
public record EntityValidationSummary
{
    public string EntityType { get; init; } = string.Empty;
    public int TotalRecords { get; init; }
    public int ValidRecords { get; init; }
    public int WarningRecords { get; init; }
    public int ErrorRecords { get; init; }
}

/// <summary>
/// Validation preview with paginated results
/// </summary>
public record ValidationPreviewResponse
{
    public Guid SessionId { get; init; }
    public int TotalRecords { get; init; }
    public int ValidCount { get; init; }
    public int WarningCount { get; init; }
    public int ErrorCount { get; init; }
    public int FixedCount { get; init; }
    public int SkippedCount { get; init; }
    public int PendingCount { get; init; }
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }

    /// <summary>Filter applied (all, valid, warning, error)</summary>
    public string Filter { get; init; } = "all";

    public List<ValidationResultItem> Records { get; init; } = new();
}

/// <summary>
/// Single validation result item
/// </summary>
public record ValidationResultItem
{
    public Guid RecordId { get; init; }
    public int RowIndex { get; init; }
    public string EntityType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;

    /// <summary>Original data from source as JSON</summary>
    public string? OriginalData { get; init; }

    /// <summary>Transformed data (after mapping) as JSON</summary>
    public string? TransformedData { get; init; }

    /// <summary>Fixed data (user corrections) as JSON</summary>
    public string? FixedData { get; init; }

    /// <summary>Validation errors as JSON</summary>
    public string? Errors { get; init; }

    /// <summary>Validation warnings as JSON</summary>
    public string? Warnings { get; init; }

    /// <summary>User action taken</summary>
    public string? UserAction { get; init; }
}

/// <summary>
/// Validation error
/// </summary>
public record ValidationErrorDto
{
    public string Field { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? Code { get; init; }
    public object? Value { get; init; }
}

/// <summary>
/// Validation warning
/// </summary>
public record ValidationWarningDto
{
    public string Field { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? Code { get; init; }
}

/// <summary>
/// Commit/import response
/// </summary>
public record CommitMigrationResponse
{
    public Guid SessionId { get; init; }
    public string JobId { get; init; } = string.Empty;
    public int EstimatedRecords { get; init; }
    public string Message { get; init; } = string.Empty;
}

/// <summary>
/// Bulk action response
/// </summary>
public record BulkActionResponse
{
    public int UpdatedCount { get; init; }
    public int SkippedCount { get; init; }
    public int TotalRequested { get; init; }
}

/// <summary>
/// Import progress (for SignalR updates)
/// </summary>
public record ImportProgressDto
{
    public Guid SessionId { get; init; }
    public string Status { get; init; } = string.Empty;
    public int TotalRecords { get; init; }
    public int ImportableRecords { get; init; }
    public int ImportedRecords { get; init; }
    public int SkippedRecords { get; init; }
    public int ProgressPercentage { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string? ErrorMessage { get; init; }
    public TimeSpan? EstimatedTimeRemaining { get; init; }
}

/// <summary>
/// Mapping template DTO
/// </summary>
public record MappingTemplateDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string SourceType { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public List<FieldMappingDto> Mappings { get; init; } = new();
}

/// <summary>
/// Stocker entity schema DTO
/// </summary>
public record StockerEntitySchemaDto
{
    public string EntityType { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public List<TargetFieldDto> Fields { get; init; } = new();
}

/// <summary>
/// Target field definition
/// </summary>
public record TargetFieldDto
{
    public string Name { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string DataType { get; init; } = string.Empty;
    public bool IsRequired { get; init; }
    public int? MaxLength { get; init; }
    public string? Description { get; init; }
    public string? DefaultValue { get; init; }
}
