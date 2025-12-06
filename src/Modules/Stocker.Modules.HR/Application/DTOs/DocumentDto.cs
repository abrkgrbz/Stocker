using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for EmployeeDocument entity
/// </summary>
public class EmployeeDocumentDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? IssuingAuthority { get; set; }
    public bool IsVerified { get; set; }
    public int? VerifiedById { get; set; }
    public string? VerifiedByName { get; set; }
    public DateTime? VerifiedDate { get; set; }
    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    public bool IsExpiringSoon => ExpiryDate.HasValue && ExpiryDate.Value <= DateTime.UtcNow.AddDays(30) && ExpiryDate.Value > DateTime.UtcNow;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating an employee document
/// </summary>
public class CreateEmployeeDocumentDto
{
    public int EmployeeId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for updating an employee document
/// </summary>
public class UpdateEmployeeDocumentDto
{
    public DocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for verifying a document
/// </summary>
public class VerifyDocumentDto
{
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for expiring documents report
/// </summary>
public class ExpiringDocumentsReportDto
{
    public int TotalExpiring { get; set; }
    public int ExpiredCount { get; set; }
    public int ExpiringIn30DaysCount { get; set; }
    public int ExpiringIn60DaysCount { get; set; }
    public int ExpiringIn90DaysCount { get; set; }
    public List<EmployeeDocumentDto> ExpiringDocuments { get; set; } = new();
}
