using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantComplianceTests
{
    private const string CreatedBy = "admin@test.com";
    private const string ModifiedBy = "manager@test.com";
    private const string Standard = "ISO27001";
    private const string Version = "2022";

    [Fact]
    public void Create_WithValidData_ShouldCreateCompliance()
    {
        // Act
        var compliance = TenantCompliance.Create(
            ComplianceType.ISO27001,
            Standard,
            Version,
            CreatedBy,
            true,
            "Information Security Management");

        // Assert
        compliance.Should().NotBeNull();
        compliance.Id.Should().NotBeEmpty();
        compliance.Type.Should().Be(ComplianceType.ISO27001);
        compliance.Status.Should().Be(ComplianceStatus.NotStarted);
        compliance.Standard.Should().Be(Standard);
        compliance.Version.Should().Be(Version);
        compliance.Description.Should().Be("Information Security Management");
        compliance.IsMandatory.Should().BeTrue();
        compliance.RiskLevel.Should().Be(RiskLevel.Medium);
        compliance.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        compliance.CreatedBy.Should().Be(CreatedBy);
        compliance.ActivatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        compliance.IsActive.Should().BeTrue();
        compliance.ComplianceScore.Should().Be(0);
        compliance.TotalRequirements.Should().Be(0);
        compliance.CompletedRequirements.Should().Be(0);
        compliance.Requirements.Should().Be("[]");
        compliance.ImplementedControls.Should().Be("[]");
        compliance.PendingControls.Should().Be("[]");
        compliance.NotifyOnExpiration.Should().BeTrue();
        compliance.DaysBeforeExpirationNotify.Should().Be(30);
        compliance.NotifyOnAudit.Should().BeTrue();
        compliance.DaysBeforeAuditNotify.Should().Be(30);
    }

    [Fact]
    public void Create_WithMinimalData_ShouldCreateCompliance()
    {
        // Act
        var compliance = TenantCompliance.Create(
            ComplianceType.GDPR,
            "GDPR",
            "2018",
            CreatedBy);

        // Assert
        compliance.Should().NotBeNull();
        compliance.Type.Should().Be(ComplianceType.GDPR);
        compliance.IsMandatory.Should().BeFalse();
        compliance.Description.Should().BeNull();
    }

    [Fact]
    public void Create_WithNullStandard_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCompliance.Create(
            ComplianceType.ISO27001,
            null!,
            Version,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Compliance standard is required*")
            .WithParameterName("standard");
    }

    [Fact]
    public void Create_WithEmptyStandard_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCompliance.Create(
            ComplianceType.ISO27001,
            "",
            Version,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Compliance standard is required*")
            .WithParameterName("standard");
    }

    [Fact]
    public void Create_WithNullVersion_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCompliance.Create(
            ComplianceType.ISO27001,
            Standard,
            null!,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Standard version is required*")
            .WithParameterName("version");
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCompliance.Create(
            ComplianceType.ISO27001,
            Standard,
            Version,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Creator is required*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void SetCertification_WithValidData_ShouldSetCertificationDetails()
    {
        // Arrange
        var compliance = CreateCompliance();
        var certificationDate = DateTime.UtcNow;
        var expirationDate = DateTime.UtcNow.AddYears(3);
        var certificationNumber = "CERT-2024-001";
        var certifyingBody = "TUV SUD";
        var auditorName = "John Doe";
        var auditorCompany = "Audit Corp";

        // Act
        compliance.SetCertification(
            certificationDate,
            expirationDate,
            certificationNumber,
            certifyingBody,
            auditorName,
            auditorCompany,
            ModifiedBy);

        // Assert
        compliance.CertificationDate.Should().Be(certificationDate);
        compliance.ExpirationDate.Should().Be(expirationDate);
        compliance.CertificationNumber.Should().Be(certificationNumber);
        compliance.CertifyingBody.Should().Be(certifyingBody);
        compliance.AuditorName.Should().Be(auditorName);
        compliance.AuditorCompany.Should().Be(auditorCompany);
        compliance.Status.Should().Be(ComplianceStatus.Certified);
        compliance.ModifiedAt.Should().NotBeNull();
        compliance.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void SetCertification_WithExpirationBeforeCertification_ShouldThrowArgumentException()
    {
        // Arrange
        var compliance = CreateCompliance();
        var certificationDate = DateTime.UtcNow;
        var expirationDate = DateTime.UtcNow.AddDays(-1);

        // Act
        var action = () => compliance.SetCertification(
            certificationDate,
            expirationDate,
            "CERT-001",
            "Body",
            modifiedBy: ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Expiration date must be after certification date");
    }

    [Fact]
    public void SetCertification_WithNullCertificationNumber_ShouldThrowArgumentException()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        var action = () => compliance.SetCertification(
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(1),
            null!,
            "Body",
            modifiedBy: ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Certification number is required");
    }

    [Fact]
    public void SetCertification_WithNullCertifyingBody_ShouldThrowArgumentException()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        var action = () => compliance.SetCertification(
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(1),
            "CERT-001",
            null!,
            modifiedBy: ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Certifying body is required");
    }

    [Fact]
    public void UpdateRequirements_WithAllCompleted_ShouldSetFullyCompliant()
    {
        // Arrange
        var compliance = CreateCompliance();
        var requirements = "[\"REQ-001\", \"REQ-002\", \"REQ-003\"]";
        var implementedControls = "[\"CTRL-001\", \"CTRL-002\", \"CTRL-003\"]";
        var pendingControls = "[]";

        // Act
        compliance.UpdateRequirements(
            requirements,
            implementedControls,
            pendingControls,
            totalRequirements: 10,
            completedRequirements: 10,
            ModifiedBy);

        // Assert
        compliance.Requirements.Should().Be(requirements);
        compliance.ImplementedControls.Should().Be(implementedControls);
        compliance.PendingControls.Should().Be(pendingControls);
        compliance.TotalRequirements.Should().Be(10);
        compliance.CompletedRequirements.Should().Be(10);
        compliance.ComplianceScore.Should().Be(100);
        compliance.Status.Should().Be(ComplianceStatus.FullyCompliant);
        compliance.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void UpdateRequirements_With80PercentCompleted_ShouldSetPartiallyCompliant()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        compliance.UpdateRequirements(
            "[]",
            "[]",
            "[]",
            totalRequirements: 10,
            completedRequirements: 8,
            ModifiedBy);

        // Assert
        compliance.ComplianceScore.Should().Be(80);
        compliance.Status.Should().Be(ComplianceStatus.PartiallyCompliant);
    }

    [Fact]
    public void UpdateRequirements_WithSomeCompleted_ShouldSetInProgress()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        compliance.UpdateRequirements(
            "[]",
            "[]",
            "[]",
            totalRequirements: 10,
            completedRequirements: 3,
            ModifiedBy);

        // Assert
        compliance.ComplianceScore.Should().Be(30);
        compliance.Status.Should().Be(ComplianceStatus.InProgress);
    }

    [Fact]
    public void UpdateRequirements_WithZeroTotal_ShouldNotUpdateStatus()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        compliance.UpdateRequirements(
            "[]",
            "[]",
            "[]",
            totalRequirements: 0,
            completedRequirements: 0,
            ModifiedBy);

        // Assert
        compliance.ComplianceScore.Should().Be(0);
        compliance.Status.Should().Be(ComplianceStatus.NotStarted);
    }

    [Fact]
    public void SetRiskAssessment_ShouldUpdateRiskInformation()
    {
        // Arrange
        var compliance = CreateCompliance();
        var riskAssessment = "High risk due to sensitive data processing";
        var mitigationPlan = "Implement additional security controls";
        var nextAssessment = DateTime.UtcNow.AddMonths(6);

        // Act
        compliance.SetRiskAssessment(
            RiskLevel.High,
            riskAssessment,
            mitigationPlan,
            nextAssessment,
            ModifiedBy);

        // Assert
        compliance.RiskLevel.Should().Be(RiskLevel.High);
        compliance.RiskAssessment.Should().Be(riskAssessment);
        compliance.MitigationPlan.Should().Be(mitigationPlan);
        compliance.LastRiskAssessment.Should().NotBeNull();
        compliance.NextRiskAssessment.Should().Be(nextAssessment);
        compliance.ReviewedAt.Should().NotBeNull();
        compliance.ReviewedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void RecordAudit_WithPassResult_ShouldSetCertified()
    {
        // Arrange
        var compliance = CreateCompliance();
        var findings = "[{\"issue\":\"Minor documentation gap\"}]";
        var correctiveActions = "[{\"action\":\"Update documentation\"}]";
        var nextAuditDate = DateTime.UtcNow.AddMonths(12);

        // Act
        compliance.RecordAudit(
            AuditType.External,
            "Pass - Compliant",
            findings,
            correctiveActions,
            nextAuditDate,
            ModifiedBy);

        // Assert
        compliance.LastAuditDate.Should().NotBeNull();
        compliance.LastAuditType.Should().Be(AuditType.External);
        compliance.LastAuditResult.Should().Be("Pass - Compliant");
        compliance.LastAuditFindings.Should().Be(findings);
        compliance.CorrectiveActions.Should().Be(correctiveActions);
        compliance.NextAuditDate.Should().Be(nextAuditDate);
        compliance.Status.Should().Be(ComplianceStatus.Certified);
        compliance.HasOpenFindings.Should().BeTrue();
        compliance.OpenFindingsCount.Should().Be(1);
    }

    [Fact]
    public void RecordAudit_WithFailResult_ShouldSetNonCompliant()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        compliance.RecordAudit(
            AuditType.Internal,
            "Fail - Non-compliant",
            null,
            null,
            null,
            ModifiedBy);

        // Assert
        compliance.Status.Should().Be(ComplianceStatus.NonCompliant);
        compliance.HasOpenFindings.Should().BeFalse();
        compliance.OpenFindingsCount.Should().Be(0);
    }

    [Fact]
    public void RecordAudit_WithOtherResult_ShouldSetUnderReview()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        compliance.RecordAudit(
            AuditType.Surveillance,
            "Pending review",
            null,
            null,
            null,
            ModifiedBy);

        // Assert
        compliance.Status.Should().Be(ComplianceStatus.UnderReview);
    }

    [Fact]
    public void SetDocumentation_ShouldUpdateAllDocumentUrls()
    {
        // Arrange
        var compliance = CreateCompliance();
        var policyUrl = "https://docs.example.com/policy.pdf";
        var evidenceUrl = "https://docs.example.com/evidence.pdf";
        var certificateUrl = "https://docs.example.com/cert.pdf";
        var auditReportUrl = "https://docs.example.com/audit.pdf";
        var relatedDocs = "[\"doc1.pdf\", \"doc2.pdf\"]";

        // Act
        compliance.SetDocumentation(
            policyUrl,
            evidenceUrl,
            certificateUrl,
            auditReportUrl,
            relatedDocs,
            ModifiedBy);

        // Assert
        compliance.PolicyDocumentUrl.Should().Be(policyUrl);
        compliance.EvidenceDocumentUrl.Should().Be(evidenceUrl);
        compliance.CertificateUrl.Should().Be(certificateUrl);
        compliance.AuditReportUrl.Should().Be(auditReportUrl);
        compliance.RelatedDocuments.Should().Be(relatedDocs);
    }

    [Fact]
    public void SetNotificationSettings_ShouldUpdateNotificationConfiguration()
    {
        // Arrange
        var compliance = CreateCompliance();
        var emails = "admin@test.com,manager@test.com";

        // Act
        compliance.SetNotificationSettings(
            notifyOnExpiration: false,
            daysBeforeExpiration: 60,
            notifyOnAudit: true,
            daysBeforeAudit: 45,
            emails,
            ModifiedBy);

        // Assert
        compliance.NotifyOnExpiration.Should().BeFalse();
        compliance.DaysBeforeExpirationNotify.Should().Be(60);
        compliance.NotifyOnAudit.Should().BeTrue();
        compliance.DaysBeforeAuditNotify.Should().Be(45);
        compliance.NotificationEmails.Should().Be(emails);
    }

    [Fact]
    public void SetGeographicRequirements_ShouldUpdateGeographicData()
    {
        // Arrange
        var compliance = CreateCompliance();
        var regions = "[\"EU\", \"US\", \"UK\"]";
        var jurisdiction = "European Union";
        var dataResidency = "EU data centers only";

        // Act
        compliance.SetGeographicRequirements(
            regions,
            jurisdiction,
            dataResidency,
            requiresDataLocalization: true,
            ModifiedBy);

        // Assert
        compliance.ApplicableRegions.Should().Be(regions);
        compliance.LegalJurisdiction.Should().Be(jurisdiction);
        compliance.DataResidencyRequirements.Should().Be(dataResidency);
        compliance.RequiresDataLocalization.Should().BeTrue();
    }

    [Fact]
    public void SetCostAndResources_ShouldUpdateCostAndResourceData()
    {
        // Arrange
        var compliance = CreateCompliance();
        var complianceCost = 50000m;
        var annualCost = 10000m;
        var team = "Security Team";
        var responsiblePerson = "John Smith";
        var responsibleEmail = "john@test.com";

        // Act
        compliance.SetCostAndResources(
            complianceCost,
            annualCost,
            team,
            responsiblePerson,
            responsibleEmail,
            ModifiedBy);

        // Assert
        compliance.ComplianceCost.Should().Be(complianceCost);
        compliance.AnnualMaintenanceCost.Should().Be(annualCost);
        compliance.AssignedTeam.Should().Be(team);
        compliance.ResponsiblePerson.Should().Be(responsiblePerson);
        compliance.ResponsibleEmail.Should().Be(responsibleEmail);
    }

    [Fact]
    public void Suspend_WhenActive_ShouldSuspendCompliance()
    {
        // Arrange
        var compliance = CreateCompliance();
        var reason = "Pending re-evaluation";

        // Act
        compliance.Suspend(reason, ModifiedBy);

        // Assert
        compliance.IsActive.Should().BeFalse();
        compliance.SuspendedAt.Should().NotBeNull();
        compliance.SuspensionReason.Should().Be(reason);
        compliance.Status.Should().Be(ComplianceStatus.Suspended);
        compliance.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void Suspend_WhenAlreadyInactive_ShouldNotChange()
    {
        // Arrange
        var compliance = CreateCompliance();
        compliance.Suspend("First suspension", ModifiedBy);
        var firstSuspendedAt = compliance.SuspendedAt;

        // Act
        compliance.Suspend("Second attempt", "other@test.com");

        // Assert
        compliance.SuspendedAt.Should().Be(firstSuspendedAt);
        compliance.SuspensionReason.Should().Be("First suspension");
    }

    [Fact]
    public void Activate_WhenSuspended_ShouldActivateAndClearSuspension()
    {
        // Arrange
        var compliance = CreateCompliance();
        compliance.Suspend("Temporary suspension", ModifiedBy);

        // Act
        compliance.Activate("activator@test.com");

        // Assert
        compliance.IsActive.Should().BeTrue();
        compliance.ActivatedAt.Should().NotBeNull();
        compliance.SuspendedAt.Should().BeNull();
        compliance.SuspensionReason.Should().BeNull();
        compliance.Status.Should().Be(ComplianceStatus.InProgress);
        compliance.ModifiedBy.Should().Be("activator@test.com");
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ShouldNotChange()
    {
        // Arrange
        var compliance = CreateCompliance();
        var firstActivatedAt = compliance.ActivatedAt;

        // Act
        compliance.Activate("activator@test.com");

        // Assert
        compliance.ActivatedAt.Should().Be(firstActivatedAt);
    }

    [Fact]
    public void RecordNotificationSent_ShouldUpdateLastNotificationSent()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        compliance.RecordNotificationSent();

        // Assert
        compliance.LastNotificationSent.Should().NotBeNull();
        compliance.LastNotificationSent.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void IsExpiringSoon_WhenWithinNotificationPeriod_ShouldReturnTrue()
    {
        // Arrange
        var compliance = CreateCompliance();
        compliance.SetCertification(
            DateTime.UtcNow.AddDays(-100),
            DateTime.UtcNow.AddDays(20), // Expires in 20 days
            "CERT-001",
            "Body",
            modifiedBy: ModifiedBy);

        // Act
        var result = compliance.IsExpiringSoon();

        // Assert
        result.Should().BeTrue(); // Default notification is 30 days before
    }

    [Fact]
    public void IsExpiringSoon_WhenOutsideNotificationPeriod_ShouldReturnFalse()
    {
        // Arrange
        var compliance = CreateCompliance();
        compliance.SetCertification(
            DateTime.UtcNow.AddDays(-100),
            DateTime.UtcNow.AddDays(60), // Expires in 60 days
            "CERT-001",
            "Body",
            modifiedBy: ModifiedBy);

        // Act
        var result = compliance.IsExpiringSoon();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpiringSoon_WhenNoExpirationDate_ShouldReturnFalse()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        var result = compliance.IsExpiringSoon();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpiringSoon_WhenAlreadyExpired_ShouldReturnFalse()
    {
        // Arrange
        var compliance = CreateCompliance();
        compliance.SetCertification(
            DateTime.UtcNow.AddDays(-100),
            DateTime.UtcNow.AddDays(-1), // Already expired
            "CERT-001",
            "Body",
            modifiedBy: ModifiedBy);

        // Act
        var result = compliance.IsExpiringSoon();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsAuditDueSoon_WhenWithinNotificationPeriod_ShouldReturnTrue()
    {
        // Arrange
        var compliance = CreateCompliance();
        compliance.RecordAudit(
            AuditType.External,
            "Pass",
            null,
            null,
            DateTime.UtcNow.AddDays(25), // Audit in 25 days
            ModifiedBy);

        // Act
        var result = compliance.IsAuditDueSoon();

        // Assert
        result.Should().BeTrue(); // Default notification is 30 days before
    }

    [Fact]
    public void IsAuditDueSoon_WhenNoNextAuditDate_ShouldReturnFalse()
    {
        // Arrange
        var compliance = CreateCompliance();

        // Act
        var result = compliance.IsAuditDueSoon();

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData(ComplianceType.GDPR)]
    [InlineData(ComplianceType.HIPAA)]
    [InlineData(ComplianceType.PCI_DSS)]
    [InlineData(ComplianceType.SOC2)]
    [InlineData(ComplianceType.ISO27001)]
    [InlineData(ComplianceType.ISO9001)]
    [InlineData(ComplianceType.CCPA)]
    [InlineData(ComplianceType.KVKK)]
    [InlineData(ComplianceType.Custom)]
    public void Create_WithDifferentComplianceTypes_ShouldSetCorrectType(ComplianceType type)
    {
        // Act
        var compliance = TenantCompliance.Create(
            type,
            Standard,
            Version,
            CreatedBy);

        // Assert
        compliance.Type.Should().Be(type);
    }

    [Fact]
    public void CompleteComplianceWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var compliance = TenantCompliance.Create(
            ComplianceType.ISO27001,
            "ISO 27001",
            "2022",
            CreatedBy,
            isMandatory: true,
            "Information Security Management System");

        // Act & Assert - Initial state
        compliance.Status.Should().Be(ComplianceStatus.NotStarted);
        
        // Start requirements implementation
        compliance.UpdateRequirements(
            "[\"REQ-001\", \"REQ-002\"]",
            "[\"CTRL-001\"]",
            "[\"CTRL-002\"]",
            totalRequirements: 10,
            completedRequirements: 5,
            ModifiedBy);
        compliance.Status.Should().Be(ComplianceStatus.InProgress);
        compliance.ComplianceScore.Should().Be(50);
        
        // Complete all requirements
        compliance.UpdateRequirements(
            "[\"REQ-001\", \"REQ-002\"]",
            "[\"CTRL-001\", \"CTRL-002\"]",
            "[]",
            totalRequirements: 10,
            completedRequirements: 10,
            ModifiedBy);
        compliance.Status.Should().Be(ComplianceStatus.FullyCompliant);
        compliance.ComplianceScore.Should().Be(100);
        
        // Perform external audit
        compliance.RecordAudit(
            AuditType.External,
            "Pass - Fully Compliant",
            null,
            null,
            DateTime.UtcNow.AddYears(1),
            "auditor@test.com");
        compliance.Status.Should().Be(ComplianceStatus.Certified);
        
        // Set certification
        compliance.SetCertification(
            DateTime.UtcNow,
            DateTime.UtcNow.AddYears(3),
            "ISO-CERT-2024",
            "TUV SUD",
            "John Auditor",
            "Audit Company Ltd",
            ModifiedBy);
        compliance.Status.Should().Be(ComplianceStatus.Certified);
        compliance.CertificationNumber.Should().Be("ISO-CERT-2024");
    }

    private TenantCompliance CreateCompliance()
    {
        return TenantCompliance.Create(
            ComplianceType.ISO27001,
            Standard,
            Version,
            CreatedBy);
    }
}