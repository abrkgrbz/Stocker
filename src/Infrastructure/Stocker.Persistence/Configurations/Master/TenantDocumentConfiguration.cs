using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantDocumentConfiguration : IEntityTypeConfiguration<TenantDocument>
{
    public void Configure(EntityTypeBuilder<TenantDocument> builder)
    {
        builder.ToTable("TenantDocuments", "Master");
        
        builder.HasKey(x => x.Id);
        
        // Document Information
        builder.Property(x => x.DocumentName)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(x => x.DocumentNumber)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(x => x.DocumentNumber)
            .IsUnique();
            
        builder.Property(x => x.DocumentType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.Description)
            .HasMaxLength(2000);
            
        builder.Property(x => x.FileUrl)
            .IsRequired()
            .HasMaxLength(1000);
            
        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(x => x.FileExtension)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.Property(x => x.FileSizeBytes)
            .IsRequired();
            
        builder.Property(x => x.MimeType)
            .HasMaxLength(100);
            
        builder.Property(x => x.FileHash)
            .HasMaxLength(256);
            
        // Version Control
        builder.Property(x => x.Version)
            .IsRequired();
            
        builder.Property(x => x.IsLatestVersion)
            .IsRequired();
            
        builder.Property(x => x.VersionNotes)
            .HasMaxLength(1000);
            
        // Validity
        builder.Property(x => x.IsActive)
            .IsRequired();
            
        builder.Property(x => x.RequiresRenewal)
            .IsRequired();
            
        builder.Property(x => x.RenewalNoticeDays);
            
        // Signing & Approval
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.RequiresSignature)
            .IsRequired();
            
        builder.Property(x => x.IsSigned)
            .IsRequired();
            
        builder.Property(x => x.SignedBy)
            .HasMaxLength(200);
            
        builder.Property(x => x.SignatureUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.RequiresApproval)
            .IsRequired();
            
        builder.Property(x => x.IsApproved)
            .IsRequired();
            
        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(200);
            
        builder.Property(x => x.ApprovalNotes)
            .HasMaxLength(1000);
            
        // Access Control
        builder.Property(x => x.AccessLevel)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.IsConfidential)
            .IsRequired();
            
        builder.Property(x => x.IsPublic)
            .IsRequired();
            
        builder.Property(x => x.AllowedRoles)
            .HasMaxLength(1000);
            
        builder.Property(x => x.AllowedUsers)
            .HasMaxLength(1000);
            
        builder.Property(x => x.RequiresNDA)
            .IsRequired();
            
        // Compliance & Legal
        builder.Property(x => x.IsLegalDocument)
            .IsRequired();
            
        builder.Property(x => x.IsComplianceDocument)
            .IsRequired();
            
        builder.Property(x => x.ComplianceStandard)
            .HasMaxLength(100);
            
        builder.Property(x => x.LegalJurisdiction)
            .HasMaxLength(100);
            
        builder.Property(x => x.RetentionPolicy)
            .HasMaxLength(100);
            
        builder.Property(x => x.CanBeDeleted)
            .IsRequired();
            
        // Tags & Metadata
        builder.Property(x => x.Tags)
            .HasMaxLength(1000);
            
        builder.Property(x => x.CustomMetadata)
            .HasMaxLength(4000);
            
        builder.Property(x => x.Keywords)
            .HasMaxLength(1000);
            
        builder.Property(x => x.Language)
            .HasMaxLength(10);
            
        // Related Documents
        builder.Property(x => x.RelatedDocumentIds)
            .HasMaxLength(1000);
            
        builder.Property(x => x.ReplacesDocumentId)
            .HasMaxLength(50);
            
        // Notifications
        builder.Property(x => x.SendExpiryNotification)
            .IsRequired();
            
        builder.Property(x => x.SendRenewalNotification)
            .IsRequired();
            
        builder.Property(x => x.NotificationRecipients)
            .HasMaxLength(1000);
            
        // Statistics
        builder.Property(x => x.ViewCount)
            .IsRequired();
            
        builder.Property(x => x.DownloadCount)
            .IsRequired();
            
        builder.Property(x => x.LastViewedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.LastDownloadedBy)
            .HasMaxLength(100);
            
        // Audit
        builder.Property(x => x.UploadedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.ModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.ModificationReason)
            .HasMaxLength(500);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(x => x.PreviousVersion)
            .WithMany()
            .HasForeignKey(x => x.PreviousVersionId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(x => x.ParentDocument)
            .WithMany()
            .HasForeignKey(x => x.ParentDocumentId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.DocumentType);
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.ExpiryDate);
        builder.HasIndex(x => x.IsLatestVersion);
        builder.HasIndex(x => new { x.TenantId, x.DocumentType, x.IsActive });
        builder.HasIndex(x => new { x.TenantId, x.Category, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.IsLatestVersion, x.IsActive });
    }
}