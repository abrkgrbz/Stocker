using Stocker.SharedKernel.Primitives;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Domain.Migration.Entities;

/// <summary>
/// Represents a chunk of uploaded migration data
/// </summary>
public sealed class MigrationChunk : Entity
{
    private MigrationChunk() { } // EF Core

    public MigrationChunk(
        Guid sessionId,
        MigrationEntityType entityType,
        int chunkIndex,
        int totalChunks,
        string rawDataJson,
        int recordCount)
    {
        Id = Guid.NewGuid();
        SessionId = sessionId;
        EntityType = entityType;
        ChunkIndex = chunkIndex;
        TotalChunks = totalChunks;
        RawDataJson = rawDataJson;
        RecordCount = recordCount;
        Status = ChunkStatus.Received;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>Parent session ID</summary>
    public Guid SessionId { get; private set; }

    /// <summary>Type of entity in this chunk</summary>
    public MigrationEntityType EntityType { get; private set; }

    /// <summary>Zero-based chunk index</summary>
    public int ChunkIndex { get; private set; }

    /// <summary>Total number of chunks for this entity</summary>
    public int TotalChunks { get; private set; }

    /// <summary>Number of records in this chunk</summary>
    public int RecordCount { get; private set; }

    /// <summary>Raw data as JSON array</summary>
    public string RawDataJson { get; private set; } = string.Empty;

    /// <summary>Current status</summary>
    public ChunkStatus Status { get; private set; }

    /// <summary>When chunk was received</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>When chunk was validated</summary>
    public DateTime? ValidatedAt { get; private set; }

    /// <summary>When chunk was imported</summary>
    public DateTime? ImportedAt { get; private set; }

    /// <summary>Navigation: Parent session</summary>
    public MigrationSession Session { get; private set; } = null!;

    // Domain methods

    public void MarkAsValidated()
    {
        Status = ChunkStatus.Validated;
        ValidatedAt = DateTime.UtcNow;
    }

    public void MarkAsImported()
    {
        Status = ChunkStatus.Imported;
        ImportedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string? errorMessage = null)
    {
        Status = ChunkStatus.Failed;
        // Error message could be logged or stored if needed
    }

    /// <summary>Alias for RawDataJson for convenience</summary>
    public string DataJson => RawDataJson;
}
