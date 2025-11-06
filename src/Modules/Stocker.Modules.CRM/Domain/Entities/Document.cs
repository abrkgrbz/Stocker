using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a document attached to CRM entities (Customer, Deal, Contract, etc.)
/// Supports multiple storage providers (Azure Blob, AWS S3, Local Storage)
/// </summary>
public class Document : BaseEntity
{
    private Document() { } // EF Core

    private Document(
        string fileName,
        string originalFileName,
        string contentType,
        long fileSize,
        string storagePath,
        string storageProvider,
        string entityId,
        string entityType,
        DocumentCategory category,
        Guid tenantId,
        Guid uploadedBy)
    {
        FileName = fileName;
        OriginalFileName = originalFileName;
        ContentType = contentType;
        FileSize = fileSize;
        StoragePath = storagePath;
        StorageProvider = storageProvider;
        EntityId = entityId;
        EntityType = entityType;
        Category = category;
        TenantId = tenantId;
        UploadedBy = uploadedBy;
        UploadedAt = DateTime.UtcNow;
        Version = 1;
        IsArchived = false;
        AccessLevel = AccessLevel.Private;
    }

    #region Properties

    /// <summary>
    /// Tenant identifier for multi-tenancy
    /// </summary>
    public Guid TenantId { get; private set; }

    /// <summary>
    /// Unique file name in storage (e.g., "doc_abc123.pdf")
    /// </summary>
    public string FileName { get; private set; }

    /// <summary>
    /// Original file name uploaded by user (e.g., "Contract_2024.pdf")
    /// </summary>
    public string OriginalFileName { get; private set; }

    /// <summary>
    /// MIME type (e.g., "application/pdf", "image/png")
    /// </summary>
    public string ContentType { get; private set; }

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; private set; }

    /// <summary>
    /// Path or URL in storage provider
    /// </summary>
    public string StoragePath { get; private set; }

    /// <summary>
    /// Storage provider name: "Azure", "AWS", "Local"
    /// </summary>
    public string StorageProvider { get; private set; }

    /// <summary>
    /// ID of the related entity (Customer, Deal, Contract, etc.)
    /// Supports both numeric IDs and GUIDs as string
    /// </summary>
    public string EntityId { get; private set; }

    /// <summary>
    /// Type of the related entity (e.g., "Customer", "Deal", "Contract")
    /// </summary>
    public string EntityType { get; private set; }

    /// <summary>
    /// Document category for classification
    /// </summary>
    public DocumentCategory Category { get; private set; }

    /// <summary>
    /// Optional description or notes about the document
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// JSON array of tags for better organization
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Version number for version control
    /// </summary>
    public int Version { get; private set; }

    /// <summary>
    /// Reference to previous version (if this is a new version)
    /// </summary>
    public int? ParentDocumentId { get; private set; }

    /// <summary>
    /// When the document was uploaded
    /// </summary>
    public DateTime UploadedAt { get; private set; }

    /// <summary>
    /// User who uploaded the document
    /// </summary>
    public Guid UploadedBy { get; private set; }

    /// <summary>
    /// Optional expiration date for temporary documents
    /// </summary>
    public DateTime? ExpiresAt { get; private set; }

    /// <summary>
    /// Whether the document is archived (soft delete)
    /// </summary>
    public bool IsArchived { get; private set; }

    /// <summary>
    /// Access level for permission control
    /// </summary>
    public AccessLevel AccessLevel { get; private set; }

    /// <summary>
    /// Optional encryption key reference for sensitive documents
    /// </summary>
    public string? EncryptionKey { get; private set; }

    /// <summary>
    /// Optional metadata (page count, author, creation date, custom fields)
    /// JSON format
    /// </summary>
    public string? Metadata { get; private set; }

    #endregion

    #region Factory Methods

    public static Result<Document> Create(
        string originalFileName,
        string contentType,
        long fileSize,
        string storagePath,
        string storageProvider,
        string entityId,
        string entityType,
        DocumentCategory category,
        Guid tenantId,
        Guid uploadedBy,
        string? description = null,
        string? tags = null)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(originalFileName))
            return Result<Document>.Failure(Error.Validation("Document", "Original file name is required"));

        if (string.IsNullOrWhiteSpace(contentType))
            return Result<Document>.Failure(Error.Validation("Document", "Content type is required"));

        if (fileSize <= 0)
            return Result<Document>.Failure(Error.Validation("Document", "File size must be greater than zero"));

        if (string.IsNullOrWhiteSpace(storagePath))
            return Result<Document>.Failure(Error.Validation("Document", "Storage path is required"));

        if (string.IsNullOrWhiteSpace(storageProvider))
            return Result<Document>.Failure(Error.Validation("Document", "Storage provider is required"));

        if (string.IsNullOrWhiteSpace(entityId))
            return Result<Document>.Failure(Error.Validation("Document", "Entity ID is required"));

        if (string.IsNullOrWhiteSpace(entityType))
            return Result<Document>.Failure(Error.Validation("Document", "Entity type is required"));

        if (tenantId == Guid.Empty)
            return Result<Document>.Failure(Error.Validation("Document", "Tenant ID is required"));

        if (uploadedBy == Guid.Empty)
            return Result<Document>.Failure(Error.Validation("Document", "Uploaded by user ID is required"));

        // Generate unique file name
        var extension = Path.GetExtension(originalFileName);
        var fileName = $"doc_{Guid.NewGuid():N}{extension}";

        var document = new Document(
            fileName,
            originalFileName,
            contentType,
            fileSize,
            storagePath,
            storageProvider,
            entityId,
            entityType,
            category,
            tenantId,
            uploadedBy);

        if (!string.IsNullOrWhiteSpace(description))
            document.Description = description;

        if (!string.IsNullOrWhiteSpace(tags))
            document.Tags = tags;

        return Result<Document>.Success(document);
    }

    #endregion

    #region Business Methods

    public Result UpdateDescription(string? description)
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Cannot update archived document"));

        Description = description;
        return Result.Success();
    }

    public Result UpdateTags(string? tags)
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Cannot update archived document"));

        Tags = tags;
        return Result.Success();
    }

    public Result SetCategory(DocumentCategory category)
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Cannot update archived document"));

        Category = category;
        return Result.Success();
    }

    public Result SetAccessLevel(AccessLevel accessLevel)
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Cannot update archived document"));

        AccessLevel = accessLevel;
        return Result.Success();
    }

    public Result SetExpirationDate(DateTime? expiresAt)
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Cannot update archived document"));

        if (expiresAt.HasValue && expiresAt.Value <= DateTime.UtcNow)
            return Result.Failure(Error.Validation("Document", "Expiration date must be in the future"));

        ExpiresAt = expiresAt;
        return Result.Success();
    }

    public Result SetMetadata(string? metadata)
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Cannot update archived document"));

        Metadata = metadata;
        return Result.Success();
    }

    public Result Archive()
    {
        if (IsArchived)
            return Result.Failure(Error.Validation("Document", "Document is already archived"));

        IsArchived = true;
        return Result.Success();
    }

    public Result Unarchive()
    {
        if (!IsArchived)
            return Result.Failure(Error.Validation("Document", "Document is not archived"));

        IsArchived = false;
        return Result.Success();
    }

    public Result<Document> CreateNewVersion(
        string storagePath,
        long fileSize,
        Guid uploadedBy)
    {
        if (IsArchived)
            return Result<Document>.Failure(Error.Validation("Document", "Cannot create version of archived document"));

        var newVersion = new Document(
            FileName,
            OriginalFileName,
            ContentType,
            fileSize,
            storagePath,
            StorageProvider,
            EntityId,
            EntityType,
            Category,
            TenantId,
            uploadedBy)
        {
            ParentDocumentId = Id,
            Version = Version + 1,
            Description = Description,
            Tags = Tags,
            AccessLevel = AccessLevel
        };

        return Result<Document>.Success(newVersion);
    }

    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value <= DateTime.UtcNow;
    }

    public bool HasSizeLimit(long maxSizeBytes)
    {
        return FileSize <= maxSizeBytes;
    }

    public string GetFileExtension()
    {
        return Path.GetExtension(OriginalFileName).ToLowerInvariant();
    }

    public bool IsImage()
    {
        var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        return imageExtensions.Contains(GetFileExtension());
    }

    public bool IsPdf()
    {
        return GetFileExtension() == ".pdf";
    }

    public bool IsOfficeDocument()
    {
        var officeExtensions = new[] { ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx" };
        return officeExtensions.Contains(GetFileExtension());
    }

    #endregion
}
