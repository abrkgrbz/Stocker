using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantDocument : Entity
{
    public Guid TenantId { get; private set; }
    
    // Document Information
    public string DocumentName { get; private set; }
    public string DocumentNumber { get; private set; }
    public DocumentType DocumentType { get; private set; }
    public DocumentCategory Category { get; private set; }
    public string? Description { get; private set; }
    public string FileUrl { get; private set; }
    public string FileName { get; private set; }
    public string FileExtension { get; private set; }
    public long FileSizeBytes { get; private set; }
    public string? MimeType { get; private set; }
    public string? FileHash { get; private set; }
    
    // Version Control
    public int Version { get; private set; }
    public bool IsLatestVersion { get; private set; }
    public Guid? PreviousVersionId { get; private set; }
    public string? VersionNotes { get; private set; }
    
    // Validity
    public DateTime? EffectiveDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public bool IsActive { get; private set; }
    public bool RequiresRenewal { get; private set; }
    public int? RenewalNoticeDays { get; private set; }
    public DateTime? RenewalNotificationDate { get; private set; }
    
    // Signing & Approval
    public DocumentStatus Status { get; private set; }
    public bool RequiresSignature { get; private set; }
    public bool IsSigned { get; private set; }
    public DateTime? SignedDate { get; private set; }
    public string? SignedBy { get; private set; }
    public string? SignatureUrl { get; private set; }
    public bool RequiresApproval { get; private set; }
    public bool IsApproved { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? ApprovedBy { get; private set; }
    public string? ApprovalNotes { get; private set; }
    
    // Access Control
    public DocumentAccessLevel AccessLevel { get; private set; }
    public bool IsConfidential { get; private set; }
    public bool IsPublic { get; private set; }
    public string? AllowedRoles { get; private set; } // JSON array
    public string? AllowedUsers { get; private set; } // JSON array
    public bool RequiresNDA { get; private set; }
    
    // Compliance & Legal
    public bool IsLegalDocument { get; private set; }
    public bool IsComplianceDocument { get; private set; }
    public string? ComplianceStandard { get; private set; } // ISO, SOC2, etc.
    public string? LegalJurisdiction { get; private set; }
    public string? RetentionPolicy { get; private set; }
    public DateTime? RetentionUntil { get; private set; }
    public bool CanBeDeleted { get; private set; }
    
    // Tags & Metadata
    public string? Tags { get; private set; } // JSON array
    public string? CustomMetadata { get; private set; } // JSON object
    public string? Keywords { get; private set; }
    public string? Language { get; private set; }
    
    // Related Documents
    public Guid? ParentDocumentId { get; private set; }
    public string? RelatedDocumentIds { get; private set; } // JSON array
    public string? ReplacesDocumentId { get; private set; }
    
    // Notifications
    public bool SendExpiryNotification { get; private set; }
    public bool SendRenewalNotification { get; private set; }
    public string? NotificationRecipients { get; private set; } // JSON array
    public DateTime? LastNotificationSent { get; private set; }
    
    // Statistics
    public int ViewCount { get; private set; }
    public int DownloadCount { get; private set; }
    public DateTime? LastViewedAt { get; private set; }
    public string? LastViewedBy { get; private set; }
    public DateTime? LastDownloadedAt { get; private set; }
    public string? LastDownloadedBy { get; private set; }
    
    // Audit
    public DateTime UploadedAt { get; private set; }
    public string UploadedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    public string? ModificationReason { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    public TenantDocument? PreviousVersion { get; private set; }
    public TenantDocument? ParentDocument { get; private set; }
    
    private TenantDocument() { } // EF Constructor
    
    private TenantDocument(
        Guid tenantId,
        string documentName,
        DocumentType documentType,
        DocumentCategory category,
        string fileUrl,
        string fileName,
        long fileSizeBytes,
        string uploadedBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        DocumentName = documentName;
        DocumentNumber = GenerateDocumentNumber(documentType);
        DocumentType = documentType;
        Category = category;
        FileUrl = fileUrl;
        FileName = fileName;
        FileExtension = System.IO.Path.GetExtension(fileName);
        FileSizeBytes = fileSizeBytes;
        Version = 1;
        IsLatestVersion = true;
        IsActive = true;
        Status = DocumentStatus.Draft;
        AccessLevel = DocumentAccessLevel.Internal;
        IsConfidential = false;
        IsPublic = false;
        RequiresSignature = false;
        RequiresApproval = false;
        RequiresNDA = false;
        IsLegalDocument = false;
        IsComplianceDocument = false;
        CanBeDeleted = true;
        SendExpiryNotification = false;
        SendRenewalNotification = false;
        ViewCount = 0;
        DownloadCount = 0;
        UploadedAt = DateTime.UtcNow;
        UploadedBy = uploadedBy;
    }
    
    public static TenantDocument Create(
        Guid tenantId,
        string documentName,
        DocumentType documentType,
        DocumentCategory category,
        string fileUrl,
        string fileName,
        long fileSizeBytes,
        string uploadedBy,
        string? description = null)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (string.IsNullOrWhiteSpace(documentName))
            throw new ArgumentException("Document name cannot be empty.", nameof(documentName));
            
        if (string.IsNullOrWhiteSpace(fileUrl))
            throw new ArgumentException("File URL cannot be empty.", nameof(fileUrl));
            
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty.", nameof(fileName));
            
        if (fileSizeBytes <= 0)
            throw new ArgumentException("File size must be greater than zero.", nameof(fileSizeBytes));
            
        var document = new TenantDocument(
            tenantId,
            documentName,
            documentType,
            category,
            fileUrl,
            fileName,
            fileSizeBytes,
            uploadedBy);
            
        document.Description = description;
        
        return document;
    }
    
    public TenantDocument CreateNewVersion(
        string fileUrl,
        string fileName,
        long fileSizeBytes,
        string modifiedBy,
        string? versionNotes = null)
    {
        // Mark current version as not latest
        IsLatestVersion = false;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        
        // Create new version
        var newVersion = new TenantDocument(
            TenantId,
            DocumentName,
            DocumentType,
            Category,
            fileUrl,
            fileName,
            fileSizeBytes,
            modifiedBy)
        {
            Version = Version + 1,
            PreviousVersionId = Id,
            VersionNotes = versionNotes,
            Description = Description,
            EffectiveDate = EffectiveDate,
            ExpiryDate = ExpiryDate,
            RequiresRenewal = RequiresRenewal,
            RenewalNoticeDays = RenewalNoticeDays,
            AccessLevel = AccessLevel,
            IsConfidential = IsConfidential,
            RequiresSignature = RequiresSignature,
            RequiresApproval = RequiresApproval,
            RequiresNDA = RequiresNDA,
            IsLegalDocument = IsLegalDocument,
            IsComplianceDocument = IsComplianceDocument,
            ComplianceStandard = ComplianceStandard,
            LegalJurisdiction = LegalJurisdiction,
            RetentionPolicy = RetentionPolicy,
            RetentionUntil = RetentionUntil,
            Tags = Tags,
            Keywords = Keywords,
            Language = Language,
            ParentDocumentId = ParentDocumentId,
            SendExpiryNotification = SendExpiryNotification,
            SendRenewalNotification = SendRenewalNotification,
            NotificationRecipients = NotificationRecipients
        };
        
        return newVersion;
    }
    
    public void SetValidity(DateTime? effectiveDate, DateTime? expiryDate, bool requiresRenewal, int? renewalNoticeDays)
    {
        EffectiveDate = effectiveDate;
        ExpiryDate = expiryDate;
        RequiresRenewal = requiresRenewal;
        RenewalNoticeDays = renewalNoticeDays;
        
        if (requiresRenewal && renewalNoticeDays.HasValue && expiryDate.HasValue)
        {
            RenewalNotificationDate = expiryDate.Value.AddDays(-renewalNoticeDays.Value);
        }
        
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetAccessControl(
        DocumentAccessLevel accessLevel,
        bool isConfidential,
        bool isPublic,
        bool requiresNDA,
        List<string>? allowedRoles = null,
        List<string>? allowedUsers = null)
    {
        AccessLevel = accessLevel;
        IsConfidential = isConfidential;
        IsPublic = isPublic;
        RequiresNDA = requiresNDA;
        AllowedRoles = allowedRoles != null ? System.Text.Json.JsonSerializer.Serialize(allowedRoles) : null;
        AllowedUsers = allowedUsers != null ? System.Text.Json.JsonSerializer.Serialize(allowedUsers) : null;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetComplianceInfo(
        bool isLegal,
        bool isCompliance,
        string? complianceStandard,
        string? legalJurisdiction,
        string? retentionPolicy,
        DateTime? retentionUntil)
    {
        IsLegalDocument = isLegal;
        IsComplianceDocument = isCompliance;
        ComplianceStandard = complianceStandard;
        LegalJurisdiction = legalJurisdiction;
        RetentionPolicy = retentionPolicy;
        RetentionUntil = retentionUntil;
        CanBeDeleted = !isLegal && !isCompliance;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetNotificationSettings(
        bool sendExpiry,
        bool sendRenewal,
        List<string>? recipients)
    {
        SendExpiryNotification = sendExpiry;
        SendRenewalNotification = sendRenewal;
        NotificationRecipients = recipients != null ? System.Text.Json.JsonSerializer.Serialize(recipients) : null;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void MarkForSignature()
    {
        RequiresSignature = true;
        Status = DocumentStatus.PendingSignature;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Sign(string signedBy, string? signatureUrl = null)
    {
        if (!RequiresSignature)
            throw new InvalidOperationException("Document does not require signature.");
            
        IsSigned = true;
        SignedDate = DateTime.UtcNow;
        SignedBy = signedBy;
        SignatureUrl = signatureUrl;
        
        if (RequiresApproval)
        {
            Status = DocumentStatus.PendingApproval;
        }
        else
        {
            Status = DocumentStatus.Active;
            IsActive = true;
        }
        
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void MarkForApproval()
    {
        RequiresApproval = true;
        Status = DocumentStatus.PendingApproval;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Approve(string approvedBy, string? notes = null)
    {
        if (!RequiresApproval)
            throw new InvalidOperationException("Document does not require approval.");
            
        IsApproved = true;
        ApprovedDate = DateTime.UtcNow;
        ApprovedBy = approvedBy;
        ApprovalNotes = notes;
        Status = DocumentStatus.Active;
        IsActive = true;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Reject(string rejectedBy, string reason)
    {
        Status = DocumentStatus.Rejected;
        IsActive = false;
        ApprovalNotes = $"Rejected by {rejectedBy}: {reason}";
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = rejectedBy;
    }
    
    public void Activate()
    {
        Status = DocumentStatus.Active;
        IsActive = true;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Archive()
    {
        Status = DocumentStatus.Archived;
        IsActive = false;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Expire()
    {
        Status = DocumentStatus.Expired;
        IsActive = false;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void RecordView(string viewedBy)
    {
        ViewCount++;
        LastViewedAt = DateTime.UtcNow;
        LastViewedBy = viewedBy;
    }
    
    public void RecordDownload(string downloadedBy)
    {
        DownloadCount++;
        LastDownloadedAt = DateTime.UtcNow;
        LastDownloadedBy = downloadedBy;
    }
    
    public void SendNotification()
    {
        LastNotificationSent = DateTime.UtcNow;
    }
    
    public void SetTags(List<string> tags)
    {
        Tags = System.Text.Json.JsonSerializer.Serialize(tags);
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetMetadata(object metadata)
    {
        CustomMetadata = System.Text.Json.JsonSerializer.Serialize(metadata);
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetKeywords(string keywords)
    {
        Keywords = keywords;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetFileHash(string hash)
    {
        FileHash = hash;
    }
    
    public void SetMimeType(string mimeType)
    {
        MimeType = mimeType;
    }
    
    private static string GenerateDocumentNumber(DocumentType type)
    {
        var prefix = type switch
        {
            DocumentType.Contract => "CNT",
            DocumentType.Invoice => "INV",
            DocumentType.Agreement => "AGR",
            DocumentType.Policy => "POL",
            DocumentType.Certificate => "CRT",
            DocumentType.Report => "RPT",
            DocumentType.License => "LIC",
            _ => "DOC"
        };
        
        return $"{prefix}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
}

public enum DocumentType
{
    Contract = 0,
    Agreement = 1,
    Invoice = 2,
    Receipt = 3,
    Policy = 4,
    Certificate = 5,
    License = 6,
    Report = 7,
    Proposal = 8,
    Quotation = 9,
    PurchaseOrder = 10,
    Specification = 11,
    Manual = 12,
    Presentation = 13,
    Other = 14
}

public enum DocumentCategory
{
    Legal = 0,
    Financial = 1,
    Technical = 2,
    Administrative = 3,
    Compliance = 4,
    Marketing = 5,
    HR = 6,
    Operations = 7,
    Sales = 8,
    Support = 9
}

public enum DocumentStatus
{
    Draft = 0,
    PendingSignature = 1,
    PendingApproval = 2,
    Active = 3,
    Expired = 4,
    Archived = 5,
    Rejected = 6,
    Superseded = 7
}

public enum DocumentAccessLevel
{
    Public = 0,
    Internal = 1,
    Restricted = 2,
    Confidential = 3,
    TopSecret = 4
}