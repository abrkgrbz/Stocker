using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantCompliance : Entity
{
    public Guid TenantId { get; private set; }
    
    // GDPR / KVKK Compliance
    public bool GDPRCompliant { get; private set; }
    public DateTime? GDPRConsentDate { get; private set; }
    public string? GDPRConsentVersion { get; private set; }
    public bool KVKKCompliant { get; private set; }
    public DateTime? KVKKConsentDate { get; private set; }
    public string? KVKKConsentVersion { get; private set; }
    public string? DataProtectionOfficer { get; private set; }
    public string? DataProtectionOfficerEmail { get; private set; }
    public string? DataProtectionOfficerPhone { get; private set; }
    
    // Data Policies
    public DataRetentionPolicy DataRetentionPolicy { get; private set; }
    public int DataRetentionDays { get; private set; }
    public bool AutoDeleteExpiredData { get; private set; }
    public DateTime? LastDataPurgeDate { get; private set; }
    public DateTime? NextDataPurgeDate { get; private set; }
    public string? DataCategories { get; private set; } // JSON
    public string? SensitiveDataTypes { get; private set; } // JSON
    
    // Privacy Settings
    public bool AllowDataExport { get; private set; }
    public bool AllowDataDeletion { get; private set; }
    public bool AllowDataPortability { get; private set; }
    public bool RequireConsentForMarketing { get; private set; }
    public bool RequireConsentForAnalytics { get; private set; }
    public bool RequireConsentForThirdParty { get; private set; }
    public string? PrivacyPolicyUrl { get; private set; }
    public string? PrivacyPolicyVersion { get; private set; }
    public DateTime? PrivacyPolicyAcceptedDate { get; private set; }
    
    // Security Certifications
    public bool ISO27001Certified { get; private set; }
    public DateTime? ISO27001ExpiryDate { get; private set; }
    public string? ISO27001CertificateNumber { get; private set; }
    public bool SOC2Compliant { get; private set; }
    public DateTime? SOC2AuditDate { get; private set; }
    public string? SOC2ReportUrl { get; private set; }
    public bool PCIDSSCompliant { get; private set; }
    public string? PCIDSSLevel { get; private set; }
    public DateTime? PCIDSSValidUntil { get; private set; }
    public bool HIPAACompliant { get; private set; }
    public DateTime? HIPAAAssessmentDate { get; private set; }
    
    // Audit & Reporting
    public bool AuditLogEnabled { get; private set; }
    public int AuditLogRetentionDays { get; private set; }
    public bool DetailedAuditLog { get; private set; }
    public DateTime? LastAuditDate { get; private set; }
    public DateTime? NextAuditDate { get; private set; }
    public string? LastAuditReport { get; private set; }
    public string? AuditFrequency { get; private set; } // Monthly, Quarterly, Yearly
    public string? ExternalAuditor { get; private set; }
    
    // Access Control
    public bool RoleBasedAccessControl { get; private set; }
    public bool AttributeBasedAccessControl { get; private set; }
    public bool RequireMFA { get; private set; }
    public int PasswordMinLength { get; private set; }
    public bool PasswordRequireUppercase { get; private set; }
    public bool PasswordRequireLowercase { get; private set; }
    public bool PasswordRequireNumbers { get; private set; }
    public bool PasswordRequireSpecialChars { get; private set; }
    public int PasswordExpiryDays { get; private set; }
    public int PasswordHistoryCount { get; private set; }
    public int MaxLoginAttempts { get; private set; }
    public int AccountLockoutMinutes { get; private set; }
    public int SessionTimeoutMinutes { get; private set; }
    
    // Encryption
    public bool DataEncryptionAtRest { get; private set; }
    public bool DataEncryptionInTransit { get; private set; }
    public string? EncryptionAlgorithm { get; private set; }
    public int EncryptionKeyLength { get; private set; }
    public DateTime? LastKeyRotationDate { get; private set; }
    public int KeyRotationIntervalDays { get; private set; }
    
    // Backup & Recovery
    public bool AutoBackupEnabled { get; private set; }
    public string? BackupFrequency { get; private set; }
    public int BackupRetentionDays { get; private set; }
    public bool BackupEncryption { get; private set; }
    public string? BackupLocation { get; private set; }
    public DateTime? LastBackupDate { get; private set; }
    public DateTime? LastBackupTestDate { get; private set; }
    public int RecoveryTimeObjectiveHours { get; private set; }
    public int RecoveryPointObjectiveHours { get; private set; }
    
    // Incident Management
    public bool IncidentResponsePlan { get; private set; }
    public string? IncidentResponseTeam { get; private set; } // JSON
    public string? IncidentResponseProcedure { get; private set; }
    public int IncidentNotificationHours { get; private set; }
    public DateTime? LastIncidentDate { get; private set; }
    public int TotalIncidents { get; private set; }
    public int UnresolvedIncidents { get; private set; }
    
    // Vulnerability Management
    public bool VulnerabilityScanning { get; private set; }
    public string? ScanFrequency { get; private set; }
    public DateTime? LastScanDate { get; private set; }
    public DateTime? NextScanDate { get; private set; }
    public int CriticalVulnerabilities { get; private set; }
    public int HighVulnerabilities { get; private set; }
    public int MediumVulnerabilities { get; private set; }
    public int LowVulnerabilities { get; private set; }
    public bool PenetrationTesting { get; private set; }
    public DateTime? LastPenTestDate { get; private set; }
    
    // Third Party & Vendor Management
    public string? ThirdPartyVendors { get; private set; } // JSON
    public bool VendorRiskAssessment { get; private set; }
    public DateTime? LastVendorAuditDate { get; private set; }
    public string? DataProcessingAgreements { get; private set; } // JSON
    public string? SubProcessors { get; private set; } // JSON
    
    // Compliance Status
    public ComplianceStatus Status { get; private set; }
    public decimal ComplianceScore { get; private set; }
    public DateTime? LastAssessmentDate { get; private set; }
    public DateTime? NextAssessmentDate { get; private set; }
    public string? NonComplianceAreas { get; private set; } // JSON
    public string? RemediationPlan { get; private set; }
    public DateTime? RemediationDeadline { get; private set; }
    
    // Documentation
    public string? PolicyDocumentsUrl { get; private set; }
    public string? ComplianceReportsUrl { get; private set; }
    public string? CertificatesUrl { get; private set; }
    public DateTime? DocumentsLastUpdated { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantCompliance() { } // EF Constructor
    
    private TenantCompliance(Guid tenantId, string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        
        // Set defaults
        GDPRCompliant = false;
        KVKKCompliant = false;
        
        DataRetentionPolicy = DataRetentionPolicy.Standard;
        DataRetentionDays = 365;
        AutoDeleteExpiredData = false;
        
        AllowDataExport = true;
        AllowDataDeletion = true;
        AllowDataPortability = true;
        RequireConsentForMarketing = true;
        RequireConsentForAnalytics = true;
        RequireConsentForThirdParty = true;
        
        ISO27001Certified = false;
        SOC2Compliant = false;
        PCIDSSCompliant = false;
        HIPAACompliant = false;
        
        AuditLogEnabled = true;
        AuditLogRetentionDays = 90;
        DetailedAuditLog = false;
        AuditFrequency = "Quarterly";
        
        RoleBasedAccessControl = true;
        AttributeBasedAccessControl = false;
        RequireMFA = false;
        PasswordMinLength = 8;
        PasswordRequireUppercase = true;
        PasswordRequireLowercase = true;
        PasswordRequireNumbers = true;
        PasswordRequireSpecialChars = true;
        PasswordExpiryDays = 90;
        PasswordHistoryCount = 5;
        MaxLoginAttempts = 5;
        AccountLockoutMinutes = 30;
        SessionTimeoutMinutes = 30;
        
        DataEncryptionAtRest = true;
        DataEncryptionInTransit = true;
        EncryptionAlgorithm = "AES-256";
        EncryptionKeyLength = 256;
        KeyRotationIntervalDays = 90;
        
        AutoBackupEnabled = true;
        BackupFrequency = "Daily";
        BackupRetentionDays = 30;
        BackupEncryption = true;
        RecoveryTimeObjectiveHours = 4;
        RecoveryPointObjectiveHours = 24;
        
        IncidentResponsePlan = false;
        IncidentNotificationHours = 72;
        TotalIncidents = 0;
        UnresolvedIncidents = 0;
        
        VulnerabilityScanning = false;
        ScanFrequency = "Monthly";
        CriticalVulnerabilities = 0;
        HighVulnerabilities = 0;
        MediumVulnerabilities = 0;
        LowVulnerabilities = 0;
        PenetrationTesting = false;
        
        VendorRiskAssessment = false;
        
        Status = ComplianceStatus.Pending;
        ComplianceScore = 0;
        
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }
    
    public static TenantCompliance Create(Guid tenantId, string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        return new TenantCompliance(tenantId, createdBy);
    }
    
    public void SetGDPRCompliance(bool compliant, string? version = null)
    {
        GDPRCompliant = compliant;
        if (compliant)
        {
            GDPRConsentDate = DateTime.UtcNow;
            GDPRConsentVersion = version ?? "1.0";
        }
        UpdateComplianceScore();
    }
    
    public void SetKVKKCompliance(bool compliant, string? version = null)
    {
        KVKKCompliant = compliant;
        if (compliant)
        {
            KVKKConsentDate = DateTime.UtcNow;
            KVKKConsentVersion = version ?? "1.0";
        }
        UpdateComplianceScore();
    }
    
    public void SetDataProtectionOfficer(string name, string email, string? phone = null)
    {
        DataProtectionOfficer = name;
        DataProtectionOfficerEmail = email;
        DataProtectionOfficerPhone = phone;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetDataRetentionPolicy(DataRetentionPolicy policy, int retentionDays, bool autoDelete)
    {
        DataRetentionPolicy = policy;
        DataRetentionDays = retentionDays;
        AutoDeleteExpiredData = autoDelete;
        
        if (autoDelete)
        {
            NextDataPurgeDate = DateTime.UtcNow.AddDays(retentionDays);
        }
        
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdatePrivacySettings(
        bool allowExport,
        bool allowDeletion,
        bool allowPortability,
        bool requireMarketingConsent,
        bool requireAnalyticsConsent,
        bool requireThirdPartyConsent,
        string? privacyPolicyUrl,
        string? privacyPolicyVersion)
    {
        AllowDataExport = allowExport;
        AllowDataDeletion = allowDeletion;
        AllowDataPortability = allowPortability;
        RequireConsentForMarketing = requireMarketingConsent;
        RequireConsentForAnalytics = requireAnalyticsConsent;
        RequireConsentForThirdParty = requireThirdPartyConsent;
        PrivacyPolicyUrl = privacyPolicyUrl;
        PrivacyPolicyVersion = privacyPolicyVersion;
        
        if (!string.IsNullOrEmpty(privacyPolicyVersion))
        {
            PrivacyPolicyAcceptedDate = DateTime.UtcNow;
        }
        
        UpdateComplianceScore();
    }
    
    public void SetISO27001Certification(bool certified, DateTime? expiryDate, string? certificateNumber)
    {
        ISO27001Certified = certified;
        ISO27001ExpiryDate = expiryDate;
        ISO27001CertificateNumber = certificateNumber;
        UpdateComplianceScore();
    }
    
    public void SetSOC2Compliance(bool compliant, DateTime? auditDate, string? reportUrl)
    {
        SOC2Compliant = compliant;
        SOC2AuditDate = auditDate;
        SOC2ReportUrl = reportUrl;
        UpdateComplianceScore();
    }
    
    public void SetPCIDSSCompliance(bool compliant, string? level, DateTime? validUntil)
    {
        PCIDSSCompliant = compliant;
        PCIDSSLevel = level;
        PCIDSSValidUntil = validUntil;
        UpdateComplianceScore();
    }
    
    public void SetHIPAACompliance(bool compliant, DateTime? assessmentDate)
    {
        HIPAACompliant = compliant;
        HIPAAAssessmentDate = assessmentDate;
        UpdateComplianceScore();
    }
    
    public void ConfigureAuditSettings(
        bool enabled,
        int retentionDays,
        bool detailed,
        string frequency,
        string? externalAuditor)
    {
        AuditLogEnabled = enabled;
        AuditLogRetentionDays = retentionDays;
        DetailedAuditLog = detailed;
        AuditFrequency = frequency;
        ExternalAuditor = externalAuditor;
        
        UpdateNextAuditDate(frequency);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ConfigurePasswordPolicy(
        int minLength,
        bool requireUppercase,
        bool requireLowercase,
        bool requireNumbers,
        bool requireSpecialChars,
        int expiryDays,
        int historyCount)
    {
        PasswordMinLength = minLength;
        PasswordRequireUppercase = requireUppercase;
        PasswordRequireLowercase = requireLowercase;
        PasswordRequireNumbers = requireNumbers;
        PasswordRequireSpecialChars = requireSpecialChars;
        PasswordExpiryDays = expiryDays;
        PasswordHistoryCount = historyCount;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ConfigureAccessControl(
        bool rbac,
        bool abac,
        bool requireMFA,
        int maxLoginAttempts,
        int lockoutMinutes,
        int sessionTimeout)
    {
        RoleBasedAccessControl = rbac;
        AttributeBasedAccessControl = abac;
        RequireMFA = requireMFA;
        MaxLoginAttempts = maxLoginAttempts;
        AccountLockoutMinutes = lockoutMinutes;
        SessionTimeoutMinutes = sessionTimeout;
        UpdateComplianceScore();
    }
    
    public void ConfigureEncryption(
        bool atRest,
        bool inTransit,
        string algorithm,
        int keyLength,
        int rotationDays)
    {
        DataEncryptionAtRest = atRest;
        DataEncryptionInTransit = inTransit;
        EncryptionAlgorithm = algorithm;
        EncryptionKeyLength = keyLength;
        KeyRotationIntervalDays = rotationDays;
        UpdateComplianceScore();
    }
    
    public void ConfigureBackup(
        bool autoBackup,
        string frequency,
        int retentionDays,
        bool encryption,
        string? location,
        int rtoHours,
        int rpoHours)
    {
        AutoBackupEnabled = autoBackup;
        BackupFrequency = frequency;
        BackupRetentionDays = retentionDays;
        BackupEncryption = encryption;
        BackupLocation = location;
        RecoveryTimeObjectiveHours = rtoHours;
        RecoveryPointObjectiveHours = rpoHours;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RecordBackup()
    {
        LastBackupDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RecordBackupTest()
    {
        LastBackupTestDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetIncidentResponsePlan(bool hasPlan, object? team, string? procedure, int notificationHours)
    {
        IncidentResponsePlan = hasPlan;
        IncidentResponseTeam = team != null ? JsonSerializer.Serialize(team) : null;
        IncidentResponseProcedure = procedure;
        IncidentNotificationHours = notificationHours;
        UpdateComplianceScore();
    }
    
    public void RecordIncident(bool resolved = false)
    {
        TotalIncidents++;
        if (!resolved)
        {
            UnresolvedIncidents++;
        }
        LastIncidentDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResolveIncident()
    {
        if (UnresolvedIncidents > 0)
        {
            UnresolvedIncidents--;
        }
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateVulnerabilities(int critical, int high, int medium, int low)
    {
        CriticalVulnerabilities = critical;
        HighVulnerabilities = high;
        MediumVulnerabilities = medium;
        LowVulnerabilities = low;
        LastScanDate = DateTime.UtcNow;
        UpdateNextScanDate();
        UpdateComplianceScore();
    }
    
    public void RecordPenetrationTest()
    {
        PenetrationTesting = true;
        LastPenTestDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetVendorManagement(object? vendors, bool riskAssessment, object? agreements, object? subProcessors)
    {
        ThirdPartyVendors = vendors != null ? JsonSerializer.Serialize(vendors) : null;
        VendorRiskAssessment = riskAssessment;
        DataProcessingAgreements = agreements != null ? JsonSerializer.Serialize(agreements) : null;
        SubProcessors = subProcessors != null ? JsonSerializer.Serialize(subProcessors) : null;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RecordVendorAudit()
    {
        LastVendorAuditDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RecordAudit(string? reportUrl)
    {
        LastAuditDate = DateTime.UtcNow;
        LastAuditReport = reportUrl;
        UpdateNextAuditDate(AuditFrequency);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void PerformDataPurge()
    {
        LastDataPurgeDate = DateTime.UtcNow;
        NextDataPurgeDate = DateTime.UtcNow.AddDays(DataRetentionDays);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RotateEncryptionKeys()
    {
        LastKeyRotationDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateComplianceStatus(ComplianceStatus status, object? nonComplianceAreas = null, string? remediationPlan = null, DateTime? remediationDeadline = null)
    {
        Status = status;
        NonComplianceAreas = nonComplianceAreas != null ? JsonSerializer.Serialize(nonComplianceAreas) : null;
        RemediationPlan = remediationPlan;
        RemediationDeadline = remediationDeadline;
        LastAssessmentDate = DateTime.UtcNow;
        NextAssessmentDate = CalculateNextAssessmentDate();
        UpdateComplianceScore();
    }
    
    public void UpdateDocumentation(string? policyUrl, string? reportsUrl, string? certificatesUrl)
    {
        PolicyDocumentsUrl = policyUrl;
        ComplianceReportsUrl = reportsUrl;
        CertificatesUrl = certificatesUrl;
        DocumentsLastUpdated = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void UpdateComplianceScore()
    {
        decimal score = 0;
        decimal maxScore = 0;
        
        // GDPR/KVKK (20 points)
        maxScore += 20;
        if (GDPRCompliant) score += 10;
        if (KVKKCompliant) score += 10;
        
        // Certifications (30 points)
        maxScore += 30;
        if (ISO27001Certified) score += 10;
        if (SOC2Compliant) score += 10;
        if (PCIDSSCompliant) score += 5;
        if (HIPAACompliant) score += 5;
        
        // Security Controls (30 points)
        maxScore += 30;
        if (RequireMFA) score += 10;
        if (DataEncryptionAtRest) score += 5;
        if (DataEncryptionInTransit) score += 5;
        if (IncidentResponsePlan) score += 5;
        if (VulnerabilityScanning) score += 5;
        
        // Audit & Monitoring (20 points)
        maxScore += 20;
        if (AuditLogEnabled) score += 10;
        if (DetailedAuditLog) score += 5;
        if (LastAuditDate.HasValue && LastAuditDate.Value > DateTime.UtcNow.AddMonths(-12)) score += 5;
        
        ComplianceScore = maxScore > 0 ? Math.Round((score / maxScore) * 100, 2) : 0;
        
        // Update status based on score
        if (ComplianceScore >= 90)
            Status = ComplianceStatus.Compliant;
        else if (ComplianceScore >= 70)
            Status = ComplianceStatus.PartiallyCompliant;
        else if (ComplianceScore >= 50)
            Status = ComplianceStatus.NonCompliant;
        else
            Status = ComplianceStatus.Critical;
            
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void UpdateNextAuditDate(string frequency)
    {
        NextAuditDate = frequency?.ToLower() switch
        {
            "monthly" => DateTime.UtcNow.AddMonths(1),
            "quarterly" => DateTime.UtcNow.AddMonths(3),
            "yearly" => DateTime.UtcNow.AddYears(1),
            _ => DateTime.UtcNow.AddMonths(3)
        };
    }
    
    private void UpdateNextScanDate()
    {
        NextScanDate = ScanFrequency?.ToLower() switch
        {
            "daily" => DateTime.UtcNow.AddDays(1),
            "weekly" => DateTime.UtcNow.AddDays(7),
            "monthly" => DateTime.UtcNow.AddMonths(1),
            _ => DateTime.UtcNow.AddMonths(1)
        };
    }
    
    private DateTime CalculateNextAssessmentDate()
    {
        return Status switch
        {
            ComplianceStatus.Critical => DateTime.UtcNow.AddMonths(1),
            ComplianceStatus.NonCompliant => DateTime.UtcNow.AddMonths(3),
            ComplianceStatus.PartiallyCompliant => DateTime.UtcNow.AddMonths(6),
            ComplianceStatus.Compliant => DateTime.UtcNow.AddYears(1),
            _ => DateTime.UtcNow.AddMonths(3)
        };
    }
}

public enum DataRetentionPolicy
{
    Minimal = 0,    // 30 days
    Standard = 1,   // 1 year
    Extended = 2,   // 3 years
    Legal = 3,      // 7 years
    Permanent = 4   // No deletion
}

public enum ComplianceStatus
{
    Pending = 0,
    Compliant = 1,
    PartiallyCompliant = 2,
    NonCompliant = 3,
    Critical = 4,
    UnderReview = 5
}