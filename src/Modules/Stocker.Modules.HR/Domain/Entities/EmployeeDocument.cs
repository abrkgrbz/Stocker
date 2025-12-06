using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışan belgesi entity'si
/// </summary>
public class EmployeeDocument : BaseEntity
{
    public int EmployeeId { get; private set; }
    public DocumentType DocumentType { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public string FileName { get; private set; }
    public string FileUrl { get; private set; }
    public string? FileType { get; private set; }
    public long? FileSizeBytes { get; private set; }
    public DateTime? IssueDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public string? IssuingAuthority { get; private set; }
    public string? DocumentNumber { get; private set; }
    public bool IsVerified { get; private set; }
    public int? VerifiedById { get; private set; }
    public DateTime? VerifiedDate { get; private set; }
    public bool IsConfidential { get; private set; }
    public bool IsActive { get; private set; }
    public string? Notes { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? VerifiedBy { get; private set; }

    protected EmployeeDocument()
    {
        Title = string.Empty;
        FileName = string.Empty;
        FileUrl = string.Empty;
    }

    public EmployeeDocument(
        int employeeId,
        DocumentType documentType,
        string title,
        string fileName,
        string fileUrl,
        string? fileType = null,
        long? fileSizeBytes = null,
        string? description = null)
    {
        EmployeeId = employeeId;
        DocumentType = documentType;
        Title = title;
        FileName = fileName;
        FileUrl = fileUrl;
        FileType = fileType;
        FileSizeBytes = fileSizeBytes;
        Description = description;
        IsActive = true;
        IsVerified = false;
        IsConfidential = false;
    }

    public void Update(
        string title,
        string? description,
        DateTime? issueDate,
        DateTime? expiryDate,
        string? issuingAuthority,
        string? documentNumber)
    {
        Title = title;
        Description = description;
        IssueDate = issueDate;
        ExpiryDate = expiryDate;
        IssuingAuthority = issuingAuthority;
        DocumentNumber = documentNumber;
    }

    public void UpdateFile(string fileName, string fileUrl, string? fileType = null, long? fileSizeBytes = null)
    {
        FileName = fileName;
        FileUrl = fileUrl;
        FileType = fileType;
        FileSizeBytes = fileSizeBytes;
        IsVerified = false;
        VerifiedById = null;
        VerifiedDate = null;
    }

    public void Verify(int verifiedById)
    {
        IsVerified = true;
        VerifiedById = verifiedById;
        VerifiedDate = DateTime.UtcNow;
    }

    public void Unverify()
    {
        IsVerified = false;
        VerifiedById = null;
        VerifiedDate = null;
    }

    public void SetConfidential(bool isConfidential)
    {
        IsConfidential = isConfidential;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public bool IsExpired()
    {
        return ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    }

    public bool IsExpiringSoon(int daysThreshold = 30)
    {
        if (!ExpiryDate.HasValue) return false;
        var threshold = DateTime.UtcNow.AddDays(daysThreshold);
        return ExpiryDate.Value <= threshold && ExpiryDate.Value > DateTime.UtcNow;
    }
}
