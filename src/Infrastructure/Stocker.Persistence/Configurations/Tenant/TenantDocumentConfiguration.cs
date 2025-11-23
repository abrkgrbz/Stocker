using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantDocumentConfiguration : IEntityTypeConfiguration<TenantDocument>
{
    public void Configure(EntityTypeBuilder<TenantDocument> builder)
    {
        builder.ToTable("TenantDocuments");
        
        builder.HasKey(d => d.Id);
        
        // Document Information
        builder.Property(d => d.DocumentName)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(d => d.DocumentNumber)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(d => d.DocumentType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(d => d.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(d => d.Description)
            .HasMaxLength(2000);
            
        builder.Property(d => d.FileUrl)
            .IsRequired()
            .HasMaxLength(1000);
            
        builder.Property(d => d.FileName)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(d => d.FileExtension)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(d => d.FileSizeBytes)
            .IsRequired();
            
        builder.Property(d => d.MimeType)
            .HasMaxLength(100);
            
        builder.Property(d => d.FileHash)
            .HasMaxLength(128);
            
        // Version Control
        builder.Property(d => d.Version)
            .IsRequired()
            .HasDefaultValue(1);
            
        builder.Property(d => d.IsLatestVersion)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(d => d.PreviousVersionId);
        
        builder.Property(d => d.VersionNotes)
            .HasMaxLength(1000);
            
        // Validity
        builder.Property(d => d.EffectiveDate);
        
        builder.Property(d => d.ExpiryDate);
        
        builder.Property(d => d.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(d => d.RequiresRenewal)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.RenewalNoticeDays);
        
        builder.Property(d => d.RenewalNotificationDate);
        
        // Signing & Approval
        builder.Property(d => d.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(d => d.RequiresSignature)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.IsSigned)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.SignedDate);
        
        builder.Property(d => d.SignedBy)
            .HasMaxLength(200);
            
        builder.Property(d => d.SignatureUrl)
            .HasMaxLength(1000);
            
        builder.Property(d => d.RequiresApproval)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.IsApproved)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.ApprovedDate);
        
        builder.Property(d => d.ApprovedBy)
            .HasMaxLength(200);
            
        builder.Property(d => d.ApprovalNotes)
            .HasMaxLength(1000);
            
        // Access Control
        builder.Property(d => d.AccessLevel)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(d => d.IsConfidential)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.IsPublic)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.AllowedRoles)
            .HasColumnType("text");
            
        builder.Property(d => d.AllowedUsers)
            .HasColumnType("text");
            
        builder.Property(d => d.RequiresNDA)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Compliance & Legal
        builder.Property(d => d.IsLegalDocument)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.IsComplianceDocument)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.ComplianceStandard)
            .HasMaxLength(100);
            
        builder.Property(d => d.LegalJurisdiction)
            .HasMaxLength(200);
            
        builder.Property(d => d.RetentionPolicy)
            .HasMaxLength(500);
            
        builder.Property(d => d.RetentionUntil);
        
        builder.Property(d => d.CanBeDeleted)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Tags & Metadata
        builder.Property(d => d.Tags)
            .HasColumnType("text");
            
        builder.Property(d => d.CustomMetadata)
            .HasColumnType("text");
            
        builder.Property(d => d.Keywords)
            .HasMaxLength(1000);
            
        builder.Property(d => d.Language)
            .HasMaxLength(10);
            
        // Related Documents
        builder.Property(d => d.ParentDocumentId);
        
        builder.Property(d => d.RelatedDocumentIds)
            .HasColumnType("text");
            
        builder.Property(d => d.ReplacesDocumentId)
            .HasMaxLength(100);
            
        // Notifications
        builder.Property(d => d.SendExpiryNotification)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.SendRenewalNotification)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(d => d.NotificationRecipients)
            .HasColumnType("text");
            
        builder.Property(d => d.LastNotificationSent);
        
        // Statistics
        builder.Property(d => d.ViewCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(d => d.DownloadCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(d => d.LastViewedAt);
        
        builder.Property(d => d.LastViewedBy)
            .HasMaxLength(200);
            
        builder.Property(d => d.LastDownloadedAt);
        
        builder.Property(d => d.LastDownloadedBy)
            .HasMaxLength(200);
            
        // Audit
        builder.Property(d => d.UploadedAt)
            .IsRequired();
            
        builder.Property(d => d.UploadedBy)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(d => d.ModifiedAt);
        
        builder.Property(d => d.ModifiedBy)
            .HasMaxLength(200);
            
        builder.Property(d => d.ModificationReason)
            .HasMaxLength(500);
            
        // Navigation
        builder.HasOne(d => d.PreviousVersion)
            .WithMany()
            .HasForeignKey(d => d.PreviousVersionId)
            .OnDelete(DeleteBehavior.NoAction);
            
        builder.HasOne(d => d.ParentDocument)
            .WithMany()
            .HasForeignKey(d => d.ParentDocumentId)
            .OnDelete(DeleteBehavior.NoAction);
            
        // Indexes
        builder.HasIndex(d => d.DocumentNumber)
            .IsUnique()
            .HasDatabaseName("IX_TenantDocuments_DocumentNumber");
            
        builder.HasIndex(d => d.DocumentType)
            .HasDatabaseName("IX_TenantDocuments_DocumentType");
            
        builder.HasIndex(d => d.Category)
            .HasDatabaseName("IX_TenantDocuments_Category");
            
        builder.HasIndex(d => d.Status)
            .HasDatabaseName("IX_TenantDocuments_Status");
            
        builder.HasIndex(d => d.IsActive)
            .HasDatabaseName("IX_TenantDocuments_IsActive");
            
        builder.HasIndex(d => d.ExpiryDate)
            .HasDatabaseName("IX_TenantDocuments_ExpiryDate");
            
        builder.HasIndex(d => d.UploadedAt)
            .HasDatabaseName("IX_TenantDocuments_UploadedAt");
    }
}