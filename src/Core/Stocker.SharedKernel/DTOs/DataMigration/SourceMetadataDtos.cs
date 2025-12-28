namespace Stocker.SharedKernel.DTOs.DataMigration;

/// <summary>
/// Metadata about the source system (for Desktop Connector)
/// </summary>
public record SourceMetadataDto
{
    /// <summary>Source system name (e.g., "Logo Tiger")</summary>
    public string SourceName { get; init; } = string.Empty;

    /// <summary>Source type (Logo, ETA, Mikro, etc.)</summary>
    public string SourceType { get; init; } = string.Empty;

    /// <summary>Database version if applicable</summary>
    public string? DatabaseVersion { get; init; }

    /// <summary>Connection status</summary>
    public bool IsConnected { get; init; }

    /// <summary>Tables/entities available for migration</summary>
    public List<TableMetadataDto> Tables { get; init; } = new();

    /// <summary>When metadata was retrieved</summary>
    public DateTime RetrievedAt { get; init; } = DateTime.UtcNow;
}

/// <summary>
/// Metadata about a source table
/// </summary>
public record TableMetadataDto
{
    /// <summary>Table name in source database</summary>
    public string TableName { get; init; } = string.Empty;

    /// <summary>User-friendly name</summary>
    public string FriendlyName { get; init; } = string.Empty;

    /// <summary>Mapped Stocker entity type</summary>
    public string? MappedEntityType { get; init; }

    /// <summary>Number of records in table</summary>
    public int RowCount { get; init; }

    /// <summary>Column definitions</summary>
    public List<ColumnMetadataDto> Columns { get; init; } = new();

    /// <summary>Is this a standard table (vs custom)</summary>
    public bool IsStandardTable { get; init; }
}

/// <summary>
/// Metadata about a source column
/// </summary>
public record ColumnMetadataDto
{
    /// <summary>Column name in source</summary>
    public string ColumnName { get; init; } = string.Empty;

    /// <summary>Data type (e.g., "nvarchar(50)", "int", "decimal(18,2)")</summary>
    public string DataType { get; init; } = string.Empty;

    /// <summary>Is column nullable</summary>
    public bool IsNullable { get; init; }

    /// <summary>Is this a standard field (vs custom/OZEL_KOD)</summary>
    public bool IsStandardField { get; init; }

    /// <summary>Sample values from first few records</summary>
    public List<string?> SampleValues { get; init; } = new();

    /// <summary>Suggested target field (auto-mapping)</summary>
    public string? SuggestedTarget { get; init; }

    /// <summary>Confidence of suggested mapping (0-1)</summary>
    public double? MappingConfidence { get; init; }
}

/// <summary>
/// Target entity definition
/// </summary>
public record TargetEntityDto
{
    /// <summary>Entity type name</summary>
    public string EntityType { get; init; } = string.Empty;

    /// <summary>Display name (Turkish)</summary>
    public string DisplayName { get; init; } = string.Empty;

    /// <summary>Description</summary>
    public string? Description { get; init; }

    /// <summary>Available fields</summary>
    public List<TargetFieldDto> Fields { get; init; } = new();

    /// <summary>Dependencies (must import these first)</summary>
    public List<string> Dependencies { get; init; } = new();
}

/// <summary>
/// Auto-mapping result
/// </summary>
public record AutoMappingResultDto
{
    /// <summary>Entity type</summary>
    public string EntityType { get; init; } = string.Empty;

    /// <summary>Source columns from uploaded data</summary>
    public List<SourceColumnDto> SourceColumns { get; init; } = new();

    /// <summary>Target fields in Stocker</summary>
    public List<TargetFieldDto> TargetFields { get; init; } = new();

    /// <summary>Suggested mappings</summary>
    public List<FieldMappingDto> SuggestedMappings { get; init; } = new();

    /// <summary>Overall mapping confidence (0-1)</summary>
    public double ConfidenceScore { get; init; }
}

/// <summary>
/// Source column information
/// </summary>
public record SourceColumnDto
{
    /// <summary>Column name from source</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Sample value from first record</summary>
    public string? SampleValue { get; init; }
}
