using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantBackup : Entity
{
    public Guid TenantId { get; private set; }
    public string BackupName { get; private set; }
    public string BackupType { get; private set; } // Full, Incremental, Differential
    public string Status { get; private set; } // Pending, InProgress, Completed, Failed, Deleted
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string CreatedBy { get; private set; }
    
    // Backup Details
    public long SizeInBytes { get; private set; }
    public string? FilePath { get; private set; }
    public string? StorageLocation { get; private set; } // Local, S3, Azure, etc.
    public string? DownloadUrl { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    
    // Backup Content
    public bool IncludesDatabase { get; private set; }
    public bool IncludesFiles { get; private set; }
    public bool IncludesConfiguration { get; private set; }
    public bool IsCompressed { get; private set; }
    public bool IsEncrypted { get; private set; }
    public string? EncryptionKey { get; private set; } // Encrypted
    
    // Restore Information
    public bool IsRestorable { get; private set; }
    public DateTime? LastRestoredAt { get; private set; }
    public int RestoreCount { get; private set; }
    public string? RestoreNotes { get; private set; }
    
    // Error Handling
    public string? ErrorMessage { get; private set; }
    public int RetryCount { get; private set; }
    
    // Metadata
    public string? Description { get; private set; }
    public string? Tags { get; private set; } // JSON array
    public string? Metadata { get; private set; } // JSON object for additional info
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantBackup() { } // EF Constructor
    
    private TenantBackup(
        Guid tenantId,
        string backupName,
        string backupType,
        string createdBy,
        bool includesDatabase,
        bool includesFiles,
        bool includesConfiguration,
        bool isCompressed,
        bool isEncrypted,
        string? description = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        BackupName = backupName;
        BackupType = backupType;
        Status = "Pending";
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        
        IncludesDatabase = includesDatabase;
        IncludesFiles = includesFiles;
        IncludesConfiguration = includesConfiguration;
        IsCompressed = isCompressed;
        IsEncrypted = isEncrypted;
        
        IsRestorable = false;
        RestoreCount = 0;
        RetryCount = 0;
        
        Description = description;
    }
    
    public static TenantBackup Create(
        Guid tenantId,
        string backupName,
        string backupType,
        string createdBy,
        bool includesDatabase = true,
        bool includesFiles = true,
        bool includesConfiguration = true,
        bool isCompressed = true,
        bool isEncrypted = true,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(backupName))
            throw new ArgumentException("Backup name cannot be empty.", nameof(backupName));
            
        var validTypes = new[] { "Full", "Incremental", "Differential" };
        if (!validTypes.Contains(backupType))
            throw new ArgumentException($"Invalid backup type. Must be one of: {string.Join(", ", validTypes)}", nameof(backupType));
            
        return new TenantBackup(
            tenantId,
            backupName,
            backupType,
            createdBy,
            includesDatabase,
            includesFiles,
            includesConfiguration,
            isCompressed,
            isEncrypted,
            description);
    }
    
    public void StartBackup()
    {
        if (Status != "Pending")
            throw new InvalidOperationException("Can only start pending backups.");
            
        Status = "InProgress";
    }
    
    public void CompleteBackup(
        long sizeInBytes,
        string filePath,
        string storageLocation,
        string? downloadUrl = null,
        DateTime? expiresAt = null)
    {
        if (Status != "InProgress")
            throw new InvalidOperationException("Can only complete in-progress backups.");
            
        Status = "Completed";
        CompletedAt = DateTime.UtcNow;
        SizeInBytes = sizeInBytes;
        FilePath = filePath;
        StorageLocation = storageLocation;
        DownloadUrl = downloadUrl;
        ExpiresAt = expiresAt;
        IsRestorable = true;
    }
    
    public void FailBackup(string errorMessage)
    {
        Status = "Failed";
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        RetryCount++;
    }
    
    public void MarkAsDeleted()
    {
        if (Status != "Completed")
            throw new InvalidOperationException("Can only delete completed backups.");
            
        Status = "Deleted";
        IsRestorable = false;
        FilePath = null;
        DownloadUrl = null;
    }
    
    public void RecordRestore(string? notes = null)
    {
        if (!IsRestorable)
            throw new InvalidOperationException("This backup is not restorable.");
            
        LastRestoredAt = DateTime.UtcNow;
        RestoreCount++;
        RestoreNotes = notes;
    }
    
    public void SetEncryptionKey(string encryptedKey)
    {
        if (!IsEncrypted)
            throw new InvalidOperationException("Cannot set encryption key for non-encrypted backup.");
            
        EncryptionKey = encryptedKey;
    }
    
    public void SetMetadata(string metadata)
    {
        Metadata = metadata;
    }
    
    public void SetTags(string tags)
    {
        Tags = tags;
    }
    
    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    }
    
    public bool CanRetry()
    {
        return Status == "Failed" && RetryCount < 3;
    }
}