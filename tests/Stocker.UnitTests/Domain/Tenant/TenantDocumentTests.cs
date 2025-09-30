using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;
using System.Collections.Generic;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantDocumentTests
{
    private const string DocumentName = "Test Contract";
    private const string FileUrl = "https://example.com/files/contract.pdf";
    private const string FileName = "contract.pdf";
    private const long FileSizeBytes = 1024000;
    private const string UploadedBy = "admin@test.com";
    private const string ModifiedBy = "manager@test.com";
    private const string Description = "Test contract description";

    [Fact]
    public void Create_WithValidData_ShouldCreateDocument()
    {
        // Act
        var document = TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            FileSizeBytes,
            UploadedBy,
            Description);

        // Assert
        document.Should().NotBeNull();
        document.Id.Should().NotBeEmpty();
        document.DocumentName.Should().Be(DocumentName);
        document.DocumentNumber.Should().StartWith("CNT-");
        document.DocumentNumber.Should().Contain(DateTime.UtcNow.ToString("yyyyMMdd"));
        document.DocumentType.Should().Be(DocumentType.Contract);
        document.Category.Should().Be(DocumentCategory.Legal);
        document.Description.Should().Be(Description);
        document.FileUrl.Should().Be(FileUrl);
        document.FileName.Should().Be(FileName);
        document.FileExtension.Should().Be(".pdf");
        document.FileSizeBytes.Should().Be(FileSizeBytes);
        document.Version.Should().Be(1);
        document.IsLatestVersion.Should().BeTrue();
        document.IsActive.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.Draft);
        document.AccessLevel.Should().Be(DocumentAccessLevel.Internal);
        document.IsConfidential.Should().BeFalse();
        document.IsPublic.Should().BeFalse();
        document.RequiresSignature.Should().BeFalse();
        document.RequiresApproval.Should().BeFalse();
        document.RequiresNDA.Should().BeFalse();
        document.IsLegalDocument.Should().BeFalse();
        document.IsComplianceDocument.Should().BeFalse();
        document.CanBeDeleted.Should().BeTrue();
        document.SendExpiryNotification.Should().BeFalse();
        document.SendRenewalNotification.Should().BeFalse();
        document.ViewCount.Should().Be(0);
        document.DownloadCount.Should().Be(0);
        document.UploadedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        document.UploadedBy.Should().Be(UploadedBy);
    }

    [Fact]
    public void Create_WithoutDescription_ShouldCreateDocument()
    {
        // Act
        var document = TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            FileSizeBytes,
            UploadedBy);

        // Assert
        document.Should().NotBeNull();
        document.Description.Should().BeNull();
    }

    [Fact]
    public void Create_WithNullDocumentName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantDocument.Create(
            null!,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            FileSizeBytes,
            UploadedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Document name cannot be empty.*")
            .WithParameterName("documentName");
    }

    [Fact]
    public void Create_WithEmptyDocumentName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantDocument.Create(
            "",
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            FileSizeBytes,
            UploadedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Document name cannot be empty.*")
            .WithParameterName("documentName");
    }

    [Fact]
    public void Create_WithNullFileUrl_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            null!,
            FileName,
            FileSizeBytes,
            UploadedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("File URL cannot be empty.*")
            .WithParameterName("fileUrl");
    }

    [Fact]
    public void Create_WithNullFileName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            null!,
            FileSizeBytes,
            UploadedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("File name cannot be empty.*")
            .WithParameterName("fileName");
    }

    [Fact]
    public void Create_WithZeroFileSize_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            0,
            UploadedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("File size must be greater than zero.*")
            .WithParameterName("fileSizeBytes");
    }

    [Fact]
    public void Create_WithNegativeFileSize_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            -1000,
            UploadedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("File size must be greater than zero.*")
            .WithParameterName("fileSizeBytes");
    }

    [Theory]
    [InlineData(DocumentType.Contract, "CNT")]
    [InlineData(DocumentType.Invoice, "INV")]
    [InlineData(DocumentType.Agreement, "AGR")]
    [InlineData(DocumentType.Policy, "POL")]
    [InlineData(DocumentType.Certificate, "CRT")]
    [InlineData(DocumentType.Report, "RPT")]
    [InlineData(DocumentType.License, "LIC")]
    [InlineData(DocumentType.Other, "DOC")]
    [InlineData(DocumentType.Proposal, "DOC")]
    [InlineData(DocumentType.Manual, "DOC")]
    public void Create_WithDifferentDocumentTypes_ShouldGenerateCorrectDocumentNumber(DocumentType docType, string expectedPrefix)
    {
        // Act
        var document = TenantDocument.Create(
            DocumentName,
            docType,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            FileSizeBytes,
            UploadedBy);

        // Assert
        document.DocumentNumber.Should().StartWith($"{expectedPrefix}-");
    }

    [Theory]
    [InlineData("document.pdf", ".pdf")]
    [InlineData("contract.docx", ".docx")]
    [InlineData("image.png", ".png")]
    [InlineData("spreadsheet.xlsx", ".xlsx")]
    [InlineData("archive.zip", ".zip")]
    [InlineData("file", "")]
    public void Create_WithDifferentFileNames_ShouldExtractCorrectExtension(string fileName, string expectedExtension)
    {
        // Act
        var document = TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            fileName,
            FileSizeBytes,
            UploadedBy);

        // Assert
        document.FileExtension.Should().Be(expectedExtension);
    }

    [Fact]
    public void CreateNewVersion_ShouldCreateNewVersionWithIncrementedVersionNumber()
    {
        // Arrange
        var original = CreateDocument();
        var newFileUrl = "https://example.com/files/contract-v2.pdf";
        var newFileName = "contract-v2.pdf";
        var newFileSize = 2048000L;
        var versionNotes = "Updated terms and conditions";

        // Act
        var newVersion = original.CreateNewVersion(
            newFileUrl,
            newFileName,
            newFileSize,
            ModifiedBy,
            versionNotes);

        // Assert
        newVersion.Should().NotBeNull();
        newVersion.Id.Should().NotBe(original.Id);
        newVersion.Version.Should().Be(2);
        newVersion.PreviousVersionId.Should().Be(original.Id);
        newVersion.VersionNotes.Should().Be(versionNotes);
        newVersion.IsLatestVersion.Should().BeTrue();
        newVersion.FileUrl.Should().Be(newFileUrl);
        newVersion.FileName.Should().Be(newFileName);
        newVersion.FileSizeBytes.Should().Be(newFileSize);
        newVersion.DocumentName.Should().Be(original.DocumentName);
        newVersion.DocumentType.Should().Be(original.DocumentType);
        newVersion.Category.Should().Be(original.Category);
        newVersion.Description.Should().Be(original.Description);
        
        // Original should be marked as not latest
        original.IsLatestVersion.Should().BeFalse();
        original.ModifiedAt.Should().NotBeNull();
        original.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void SetValidity_WithValidDates_ShouldSetValidity()
    {
        // Arrange
        var document = CreateDocument();
        var effectiveDate = DateTime.UtcNow.AddDays(1);
        var expiryDate = DateTime.UtcNow.AddYears(1);
        var requiresRenewal = true;
        var renewalNoticeDays = 30;

        // Act
        document.SetValidity(effectiveDate, expiryDate, requiresRenewal, renewalNoticeDays);

        // Assert
        document.EffectiveDate.Should().Be(effectiveDate);
        document.ExpiryDate.Should().Be(expiryDate);
        document.RequiresRenewal.Should().Be(requiresRenewal);
        document.RenewalNoticeDays.Should().Be(renewalNoticeDays);
        document.RenewalNotificationDate.Should().Be(expiryDate.AddDays(-renewalNoticeDays));
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetValidity_WithoutRenewal_ShouldNotSetRenewalNotificationDate()
    {
        // Arrange
        var document = CreateDocument();
        var effectiveDate = DateTime.UtcNow.AddDays(1);
        var expiryDate = DateTime.UtcNow.AddYears(1);

        // Act
        document.SetValidity(effectiveDate, expiryDate, false, null);

        // Assert
        document.RenewalNotificationDate.Should().BeNull();
    }

    [Fact]
    public void SetAccessControl_WithValidData_ShouldSetAccessControl()
    {
        // Arrange
        var document = CreateDocument();
        var accessLevel = DocumentAccessLevel.Confidential;
        var isConfidential = true;
        var isPublic = false;
        var requiresNDA = true;
        var allowedRoles = new List<string> { "Admin", "Manager" };
        var allowedUsers = new List<string> { "user1@test.com", "user2@test.com" };

        // Act
        document.SetAccessControl(
            accessLevel,
            isConfidential,
            isPublic,
            requiresNDA,
            allowedRoles,
            allowedUsers);

        // Assert
        document.AccessLevel.Should().Be(accessLevel);
        document.IsConfidential.Should().BeTrue();
        document.IsPublic.Should().BeFalse();
        document.RequiresNDA.Should().BeTrue();
        document.AllowedRoles.Should().Contain("Admin");
        document.AllowedRoles.Should().Contain("Manager");
        document.AllowedUsers.Should().Contain("user1@test.com");
        document.AllowedUsers.Should().Contain("user2@test.com");
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetComplianceInfo_ForLegalDocument_ShouldSetComplianceInfoAndDisableDeletion()
    {
        // Arrange
        var document = CreateDocument();
        var isLegal = true;
        var isCompliance = false;
        var complianceStandard = "ISO 27001";
        var legalJurisdiction = "United States";
        var retentionPolicy = "7 years";
        var retentionUntil = DateTime.UtcNow.AddYears(7);

        // Act
        document.SetComplianceInfo(
            isLegal,
            isCompliance,
            complianceStandard,
            legalJurisdiction,
            retentionPolicy,
            retentionUntil);

        // Assert
        document.IsLegalDocument.Should().BeTrue();
        document.IsComplianceDocument.Should().BeFalse();
        document.ComplianceStandard.Should().Be(complianceStandard);
        document.LegalJurisdiction.Should().Be(legalJurisdiction);
        document.RetentionPolicy.Should().Be(retentionPolicy);
        document.RetentionUntil.Should().Be(retentionUntil);
        document.CanBeDeleted.Should().BeFalse(); // Cannot delete legal documents
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetComplianceInfo_ForComplianceDocument_ShouldDisableDeletion()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.SetComplianceInfo(
            false,
            true,
            "SOC2",
            null,
            null,
            null);

        // Assert
        document.IsLegalDocument.Should().BeFalse();
        document.IsComplianceDocument.Should().BeTrue();
        document.CanBeDeleted.Should().BeFalse(); // Cannot delete compliance documents
    }

    [Fact]
    public void SetComplianceInfo_ForRegularDocument_ShouldAllowDeletion()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.SetComplianceInfo(
            false,
            false,
            null,
            null,
            null,
            null);

        // Assert
        document.IsLegalDocument.Should().BeFalse();
        document.IsComplianceDocument.Should().BeFalse();
        document.CanBeDeleted.Should().BeTrue();
    }

    [Fact]
    public void SetNotificationSettings_ShouldSetNotificationSettings()
    {
        // Arrange
        var document = CreateDocument();
        var sendExpiry = true;
        var sendRenewal = true;
        var recipients = new List<string> { "admin@test.com", "manager@test.com" };

        // Act
        document.SetNotificationSettings(sendExpiry, sendRenewal, recipients);

        // Assert
        document.SendExpiryNotification.Should().BeTrue();
        document.SendRenewalNotification.Should().BeTrue();
        document.NotificationRecipients.Should().Contain("admin@test.com");
        document.NotificationRecipients.Should().Contain("manager@test.com");
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void MarkForSignature_ShouldSetRequiresSignatureAndUpdateStatus()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.MarkForSignature();

        // Assert
        document.RequiresSignature.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.PendingSignature);
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Sign_WhenRequiresSignature_ShouldSignDocument()
    {
        // Arrange
        var document = CreateDocument();
        document.MarkForSignature();
        var signedBy = "john.doe@test.com";
        var signatureUrl = "https://example.com/signatures/sig123.png";

        // Act
        document.Sign(signedBy, signatureUrl);

        // Assert
        document.IsSigned.Should().BeTrue();
        document.SignedDate.Should().NotBeNull();
        document.SignedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        document.SignedBy.Should().Be(signedBy);
        document.SignatureUrl.Should().Be(signatureUrl);
        document.Status.Should().Be(DocumentStatus.Active);
        document.IsActive.Should().BeTrue();
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Sign_WhenDoesNotRequireSignature_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        var action = () => document.Sign("john.doe@test.com");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Document does not require signature.");
    }

    [Fact]
    public void Sign_WhenAlsoRequiresApproval_ShouldSetStatusToPendingApproval()
    {
        // Arrange
        var document = CreateDocument();
        document.MarkForSignature();
        document.MarkForApproval();

        // Act
        document.Sign("john.doe@test.com");

        // Assert
        document.IsSigned.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.PendingApproval);
        document.IsActive.Should().BeTrue(); // Document remains active until explicitly archived/expired
    }

    [Fact]
    public void MarkForApproval_ShouldSetRequiresApprovalAndUpdateStatus()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.MarkForApproval();

        // Assert
        document.RequiresApproval.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.PendingApproval);
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_WhenRequiresApproval_ShouldApproveDocument()
    {
        // Arrange
        var document = CreateDocument();
        document.MarkForApproval();
        var approvedBy = "manager@test.com";
        var notes = "Approved after review";

        // Act
        document.Approve(approvedBy, notes);

        // Assert
        document.IsApproved.Should().BeTrue();
        document.ApprovedDate.Should().NotBeNull();
        document.ApprovedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        document.ApprovedBy.Should().Be(approvedBy);
        document.ApprovalNotes.Should().Be(notes);
        document.Status.Should().Be(DocumentStatus.Active);
        document.IsActive.Should().BeTrue();
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_WhenDoesNotRequireApproval_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        var action = () => document.Approve("manager@test.com");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Document does not require approval.");
    }

    [Fact]
    public void Reject_ShouldRejectDocument()
    {
        // Arrange
        var document = CreateDocument();
        document.MarkForApproval();
        var rejectedBy = "manager@test.com";
        var reason = "Terms are not acceptable";

        // Act
        document.Reject(rejectedBy, reason);

        // Assert
        document.Status.Should().Be(DocumentStatus.Rejected);
        document.IsActive.Should().BeFalse();
        document.ApprovalNotes.Should().Contain($"Rejected by {rejectedBy}");
        document.ApprovalNotes.Should().Contain(reason);
        document.ModifiedAt.Should().NotBeNull();
        document.ModifiedBy.Should().Be(rejectedBy);
    }

    [Fact]
    public void Activate_ShouldActivateDocument()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.Activate();

        // Assert
        document.Status.Should().Be(DocumentStatus.Active);
        document.IsActive.Should().BeTrue();
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Archive_ShouldArchiveDocument()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.Archive();

        // Assert
        document.Status.Should().Be(DocumentStatus.Archived);
        document.IsActive.Should().BeFalse();
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Expire_ShouldExpireDocument()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.Expire();

        // Assert
        document.Status.Should().Be(DocumentStatus.Expired);
        document.IsActive.Should().BeFalse();
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void RecordView_ShouldIncrementViewCountAndUpdateLastViewed()
    {
        // Arrange
        var document = CreateDocument();
        var viewedBy = "user@test.com";

        // Act
        document.RecordView(viewedBy);

        // Assert
        document.ViewCount.Should().Be(1);
        document.LastViewedAt.Should().NotBeNull();
        document.LastViewedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        document.LastViewedBy.Should().Be(viewedBy);
    }

    [Fact]
    public void RecordView_MultipleTimes_ShouldIncrementCountEachTime()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.RecordView("user1@test.com");
        document.RecordView("user2@test.com");
        document.RecordView("user3@test.com");

        // Assert
        document.ViewCount.Should().Be(3);
        document.LastViewedBy.Should().Be("user3@test.com");
    }

    [Fact]
    public void RecordDownload_ShouldIncrementDownloadCountAndUpdateLastDownloaded()
    {
        // Arrange
        var document = CreateDocument();
        var downloadedBy = "user@test.com";

        // Act
        document.RecordDownload(downloadedBy);

        // Assert
        document.DownloadCount.Should().Be(1);
        document.LastDownloadedAt.Should().NotBeNull();
        document.LastDownloadedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        document.LastDownloadedBy.Should().Be(downloadedBy);
    }

    [Fact]
    public void SendNotification_ShouldUpdateLastNotificationSent()
    {
        // Arrange
        var document = CreateDocument();

        // Act
        document.SendNotification();

        // Assert
        document.LastNotificationSent.Should().NotBeNull();
        document.LastNotificationSent.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetTags_ShouldSetTagsAsJsonArray()
    {
        // Arrange
        var document = CreateDocument();
        var tags = new List<string> { "important", "contract", "2024" };

        // Act
        document.SetTags(tags);

        // Assert
        document.Tags.Should().NotBeNull();
        document.Tags.Should().Contain("important");
        document.Tags.Should().Contain("contract");
        document.Tags.Should().Contain("2024");
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetMetadata_ShouldSetCustomMetadataAsJson()
    {
        // Arrange
        var document = CreateDocument();
        var metadata = new
        {
            Department = "Legal",
            Priority = "High",
            ReviewDate = "2024-12-31"
        };

        // Act
        document.SetMetadata(metadata);

        // Assert
        document.CustomMetadata.Should().NotBeNull();
        document.CustomMetadata.Should().Contain("Department");
        document.CustomMetadata.Should().Contain("Legal");
        document.CustomMetadata.Should().Contain("Priority");
        document.CustomMetadata.Should().Contain("High");
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetKeywords_ShouldSetKeywords()
    {
        // Arrange
        var document = CreateDocument();
        var keywords = "contract, legal, agreement, 2024";

        // Act
        document.SetKeywords(keywords);

        // Assert
        document.Keywords.Should().Be(keywords);
        document.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetFileHash_ShouldSetFileHash()
    {
        // Arrange
        var document = CreateDocument();
        var hash = "sha256:abcdef123456789";

        // Act
        document.SetFileHash(hash);

        // Assert
        document.FileHash.Should().Be(hash);
    }

    [Fact]
    public void SetMimeType_ShouldSetMimeType()
    {
        // Arrange
        var document = CreateDocument();
        var mimeType = "application/pdf";

        // Act
        document.SetMimeType(mimeType);

        // Assert
        document.MimeType.Should().Be(mimeType);
    }

    [Fact]
    public void CompleteDocumentWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var document = TenantDocument.Create(
            "Service Agreement",
            DocumentType.Agreement,
            DocumentCategory.Legal,
            "https://example.com/files/agreement.pdf",
            "service-agreement.pdf",
            1500000,
            UploadedBy,
            "Service agreement for 2024");

        // Act & Assert - Initial state
        document.Status.Should().Be(DocumentStatus.Draft);
        document.Version.Should().Be(1);
        
        // Set validity
        var effectiveDate = DateTime.UtcNow.AddDays(7);
        var expiryDate = DateTime.UtcNow.AddYears(1);
        document.SetValidity(effectiveDate, expiryDate, true, 30);
        document.ExpiryDate.Should().Be(expiryDate);
        
        // Set access control
        document.SetAccessControl(
            DocumentAccessLevel.Restricted,
            false,
            false,
            true,
            new List<string> { "Legal", "Management" },
            null);
        document.RequiresNDA.Should().BeTrue();
        
        // Set compliance info
        document.SetComplianceInfo(
            true,
            true,
            "ISO 27001",
            "EU",
            "7 years",
            DateTime.UtcNow.AddYears(7));
        document.IsLegalDocument.Should().BeTrue();
        document.CanBeDeleted.Should().BeFalse();
        
        // Mark for signature
        document.MarkForSignature();
        document.Status.Should().Be(DocumentStatus.PendingSignature);
        
        // Sign the document
        document.Sign("signatory@test.com", "https://example.com/sig.png");
        document.IsSigned.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.Active);
        
        // Record some activity
        document.RecordView("viewer1@test.com");
        document.RecordView("viewer2@test.com");
        document.RecordDownload("downloader@test.com");
        document.ViewCount.Should().Be(2);
        document.DownloadCount.Should().Be(1);
        
        // Create a new version
        var newVersion = document.CreateNewVersion(
            "https://example.com/files/agreement-v2.pdf",
            "service-agreement-v2.pdf",
            1600000,
            ModifiedBy,
            "Updated payment terms");
        newVersion.Version.Should().Be(2);
        newVersion.PreviousVersionId.Should().Be(document.Id);
        document.IsLatestVersion.Should().BeFalse();
    }

    [Fact]
    public void CompleteSignAndApprovalWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var document = CreateDocument();
        
        // Act & Assert
        // Mark for both signature and approval
        document.MarkForSignature();
        document.MarkForApproval();
        document.RequiresSignature.Should().BeTrue();
        document.RequiresApproval.Should().BeTrue();
        
        // Sign first
        document.Sign("signer@test.com");
        document.IsSigned.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.PendingApproval); // Still needs approval
        
        // Then approve
        document.Approve("approver@test.com", "All terms accepted");
        document.IsApproved.Should().BeTrue();
        document.Status.Should().Be(DocumentStatus.Active);
        document.IsActive.Should().BeTrue();
    }

    [Fact]
    public void RejectAfterSignature_ShouldRejectDocument()
    {
        // Arrange
        var document = CreateDocument();
        document.MarkForSignature();
        document.MarkForApproval();
        document.Sign("signer@test.com");
        
        // Act
        document.Reject("approver@test.com", "Terms need revision");
        
        // Assert
        document.IsSigned.Should().BeTrue(); // Still signed
        document.IsApproved.Should().BeFalse();
        document.Status.Should().Be(DocumentStatus.Rejected);
        document.IsActive.Should().BeFalse();
    }

    private TenantDocument CreateDocument()
    {
        return TenantDocument.Create(
            DocumentName,
            DocumentType.Contract,
            DocumentCategory.Legal,
            FileUrl,
            FileName,
            FileSizeBytes,
            UploadedBy,
            Description);
    }
}