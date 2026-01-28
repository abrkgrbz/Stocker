using System;
using System.Collections.Generic;
using System.Linq;
using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public class TenantCompliance : AggregateRoot<Guid>
{
    private TenantCompliance() { }
    public ComplianceType Type { get; private set; }
    public ComplianceStatus Status { get; private set; }
    public string Standard { get; private set; } = string.Empty;
    public string Version { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    
    // Compliance Details
    public DateTime? CertificationDate { get; private set; }
    public DateTime? ExpirationDate { get; private set; }
    public string? CertificationNumber { get; private set; }
    public string? CertifyingBody { get; private set; }
    public string? AuditorName { get; private set; }
    public string? AuditorCompany { get; private set; }
    
    // Requirements & Controls
    public string Requirements { get; private set; } = "[]"; // JSON array
    public string ImplementedControls { get; private set; } = "[]"; // JSON array
    public string PendingControls { get; private set; } = "[]"; // JSON array
    public int TotalRequirements { get; private set; }
    public int CompletedRequirements { get; private set; }
    public decimal ComplianceScore { get; private set; }
    
    // Risk Assessment
    public RiskLevel RiskLevel { get; private set; }
    public string? RiskAssessment { get; private set; }
    public string? MitigationPlan { get; private set; }
    public DateTime? LastRiskAssessment { get; private set; }
    public DateTime? NextRiskAssessment { get; private set; }
    
    // Audit Information
    public DateTime? LastAuditDate { get; private set; }
    public DateTime? NextAuditDate { get; private set; }
    public AuditType? LastAuditType { get; private set; }
    public string? LastAuditResult { get; private set; }
    public string? LastAuditFindings { get; private set; } // JSON array
    public string? CorrectiveActions { get; private set; } // JSON array
    public bool HasOpenFindings { get; private set; }
    public int OpenFindingsCount { get; private set; }
    
    // Documentation
    public string? PolicyDocumentUrl { get; private set; }
    public string? EvidenceDocumentUrl { get; private set; }
    public string? CertificateUrl { get; private set; }
    public string? AuditReportUrl { get; private set; }
    public string? RelatedDocuments { get; private set; } // JSON array of document URLs
    
    // Notifications & Reminders
    public bool NotifyOnExpiration { get; private set; } = true;
    public int DaysBeforeExpirationNotify { get; private set; } = 30;
    public bool NotifyOnAudit { get; private set; } = true;
    public int DaysBeforeAuditNotify { get; private set; } = 30;
    public string? NotificationEmails { get; private set; } // Comma separated
    public DateTime? LastNotificationSent { get; private set; }
    
    // Geographic & Legal
    public string? ApplicableRegions { get; private set; } // JSON array
    public string? LegalJurisdiction { get; private set; }
    public string? DataResidencyRequirements { get; private set; }
    public bool RequiresDataLocalization { get; private set; }
    
    // Cost & Resources
    public decimal? ComplianceCost { get; private set; }
    public decimal? AnnualMaintenanceCost { get; private set; }
    public string? AssignedTeam { get; private set; }
    public string? ResponsiblePerson { get; private set; }
    public string? ResponsibleEmail { get; private set; }
    
    // Status Tracking
    public bool IsActive { get; private set; } = true;
    public bool IsMandatory { get; private set; }
    public DateTime? SuspendedAt { get; private set; }
    public string? SuspensionReason { get; private set; }
    public DateTime? ActivatedAt { get; private set; }
    
    // Audit Trail
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public string? ReviewedBy { get; private set; }
    
    public static TenantCompliance Create(
        ComplianceType type,
        string standard,
        string version,
        string createdBy,
        bool isMandatory = false,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(standard))
            throw new ArgumentException("Compliance standard is required", nameof(standard));
        if (string.IsNullOrWhiteSpace(version))
            throw new ArgumentException("Standard version is required", nameof(version));
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Creator is required", nameof(createdBy));
            
        return new TenantCompliance
        {
            Id = Guid.NewGuid(),
            Type = type,
            Status = ComplianceStatus.NotStarted,
            Standard = standard,
            Version = version,
            Description = description,
            IsMandatory = isMandatory,
            RiskLevel = RiskLevel.Medium,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            ActivatedAt = DateTime.UtcNow
        };
    }
    
    public void SetCertification(
        DateTime certificationDate,
        DateTime expirationDate,
        string certificationNumber,
        string certifyingBody,
        string? auditorName = null,
        string? auditorCompany = null,
        string modifiedBy = null)
    {
        if (expirationDate <= certificationDate)
            throw new ArgumentException("Expiration date must be after certification date");
        if (string.IsNullOrWhiteSpace(certificationNumber))
            throw new ArgumentException("Certification number is required");
        if (string.IsNullOrWhiteSpace(certifyingBody))
            throw new ArgumentException("Certifying body is required");
            
        CertificationDate = certificationDate;
        ExpirationDate = expirationDate;
        CertificationNumber = certificationNumber;
        CertifyingBody = certifyingBody;
        AuditorName = auditorName;
        AuditorCompany = auditorCompany;
        Status = ComplianceStatus.Certified;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy ?? DomainConstants.SystemUser;
    }
    
    public void UpdateRequirements(
        string requirements,
        string implementedControls,
        string pendingControls,
        int totalRequirements,
        int completedRequirements,
        string modifiedBy)
    {
        Requirements = requirements;
        ImplementedControls = implementedControls;
        PendingControls = pendingControls;
        TotalRequirements = totalRequirements;
        CompletedRequirements = completedRequirements;
        
        // Calculate compliance score
        if (TotalRequirements > 0)
        {
            ComplianceScore = Math.Round((decimal)CompletedRequirements / TotalRequirements * 100, 2);
            
            // Update status based on score
            if (ComplianceScore == 100)
                Status = ComplianceStatus.FullyCompliant;
            else if (ComplianceScore >= 80)
                Status = ComplianceStatus.PartiallyCompliant;
            else if (ComplianceScore > 0)
                Status = ComplianceStatus.InProgress;
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetRiskAssessment(
        RiskLevel riskLevel,
        string riskAssessment,
        string? mitigationPlan,
        DateTime? nextAssessment,
        string assessedBy)
    {
        RiskLevel = riskLevel;
        RiskAssessment = riskAssessment;
        MitigationPlan = mitigationPlan;
        LastRiskAssessment = DateTime.UtcNow;
        NextRiskAssessment = nextAssessment;
        
        ReviewedAt = DateTime.UtcNow;
        ReviewedBy = assessedBy;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = assessedBy;
    }
    
    public void RecordAudit(
        AuditType auditType,
        string auditResult,
        string? findings,
        string? correctiveActions,
        DateTime? nextAuditDate,
        string auditedBy)
    {
        LastAuditDate = DateTime.UtcNow;
        LastAuditType = auditType;
        LastAuditResult = auditResult;
        LastAuditFindings = findings;
        CorrectiveActions = correctiveActions;
        NextAuditDate = nextAuditDate;
        
        // Parse findings to count open items
        if (!string.IsNullOrWhiteSpace(findings))
        {
            try
            {
                var findingsArray = System.Text.Json.JsonSerializer.Deserialize<List<dynamic>>(findings);
                OpenFindingsCount = findingsArray?.Count ?? 0;
                HasOpenFindings = OpenFindingsCount > 0;
            }
            catch
            {
                HasOpenFindings = true;
                OpenFindingsCount = 1;
            }
        }
        else
        {
            HasOpenFindings = false;
            OpenFindingsCount = 0;
        }
        
        // Update status based on audit result
        var lowerResult = auditResult.ToLowerInvariant();
        if (lowerResult.Contains("pass") || (lowerResult.Contains("compliant") && !lowerResult.Contains("non")))
            Status = ComplianceStatus.Certified;
        else if (lowerResult.Contains("fail") || lowerResult.Contains("non-compliant") || lowerResult.Contains("noncompliant"))
            Status = ComplianceStatus.NonCompliant;
        else
            Status = ComplianceStatus.UnderReview;
            
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = auditedBy;
    }
    
    public void SetDocumentation(
        string? policyDocumentUrl,
        string? evidenceDocumentUrl,
        string? certificateUrl,
        string? auditReportUrl,
        string? relatedDocuments,
        string modifiedBy)
    {
        PolicyDocumentUrl = policyDocumentUrl;
        EvidenceDocumentUrl = evidenceDocumentUrl;
        CertificateUrl = certificateUrl;
        AuditReportUrl = auditReportUrl;
        RelatedDocuments = relatedDocuments;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetNotificationSettings(
        bool notifyOnExpiration,
        int daysBeforeExpiration,
        bool notifyOnAudit,
        int daysBeforeAudit,
        string? notificationEmails,
        string modifiedBy)
    {
        NotifyOnExpiration = notifyOnExpiration;
        DaysBeforeExpirationNotify = daysBeforeExpiration;
        NotifyOnAudit = notifyOnAudit;
        DaysBeforeAuditNotify = daysBeforeAudit;
        NotificationEmails = notificationEmails;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetGeographicRequirements(
        string? applicableRegions,
        string? legalJurisdiction,
        string? dataResidencyRequirements,
        bool requiresDataLocalization,
        string modifiedBy)
    {
        ApplicableRegions = applicableRegions;
        LegalJurisdiction = legalJurisdiction;
        DataResidencyRequirements = dataResidencyRequirements;
        RequiresDataLocalization = requiresDataLocalization;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetCostAndResources(
        decimal? complianceCost,
        decimal? annualMaintenanceCost,
        string? assignedTeam,
        string? responsiblePerson,
        string? responsibleEmail,
        string modifiedBy)
    {
        ComplianceCost = complianceCost;
        AnnualMaintenanceCost = annualMaintenanceCost;
        AssignedTeam = assignedTeam;
        ResponsiblePerson = responsiblePerson;
        ResponsibleEmail = responsibleEmail;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void Suspend(string reason, string suspendedBy)
    {
        if (!IsActive)
            return;
            
        IsActive = false;
        SuspendedAt = DateTime.UtcNow;
        SuspensionReason = reason;
        Status = ComplianceStatus.Suspended;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = suspendedBy;
    }
    
    public void Activate(string activatedBy)
    {
        if (IsActive)
            return;
            
        IsActive = true;
        ActivatedAt = DateTime.UtcNow;
        SuspendedAt = null;
        SuspensionReason = null;
        
        if (Status == ComplianceStatus.Suspended)
            Status = ComplianceStatus.InProgress;
            
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = activatedBy;
    }
    
    public void RecordNotificationSent()
    {
        LastNotificationSent = DateTime.UtcNow;
    }
    
    public bool IsExpiringSoon()
    {
        if (!ExpirationDate.HasValue)
            return false;
            
        var daysUntilExpiration = (ExpirationDate.Value - DateTime.UtcNow).TotalDays;
        return daysUntilExpiration <= DaysBeforeExpirationNotify && daysUntilExpiration > 0;
    }
    
    public bool IsAuditDueSoon()
    {
        if (!NextAuditDate.HasValue)
            return false;
            
        var daysUntilAudit = (NextAuditDate.Value - DateTime.UtcNow).TotalDays;
        return daysUntilAudit <= DaysBeforeAuditNotify && daysUntilAudit > 0;
    }
}

public enum ComplianceType
{
    GDPR,
    HIPAA,
    PCI_DSS,
    SOC2,
    ISO27001,
    ISO9001,
    CCPA,
    KVKK, // Turkish GDPR
    LGPD, // Brazilian GDPR
    PIPEDA, // Canadian Privacy
    FERPA,
    COPPA,
    SOX,
    NIST,
    FedRAMP,
    Custom
}

public enum ComplianceStatus
{
    NotStarted,
    InProgress,
    UnderReview,
    PartiallyCompliant,
    FullyCompliant,
    Certified,
    NonCompliant,
    Expired,
    Suspended
}

public enum RiskLevel
{
    Low,
    Medium,
    High,
    Critical
}

public enum AuditType
{
    Internal,
    External,
    Certification,
    Surveillance,
    Recertification,
    Special
}