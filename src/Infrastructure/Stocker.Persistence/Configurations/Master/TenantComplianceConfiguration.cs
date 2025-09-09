using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantComplianceConfiguration : IEntityTypeConfiguration<TenantCompliance>
{
    public void Configure(EntityTypeBuilder<TenantCompliance> builder)
    {
        builder.ToTable("TenantCompliances", "Master");
        
        builder.HasKey(x => x.Id);
        
        // GDPR / KVKK
        builder.Property(x => x.GDPRConsentVersion)
            .HasMaxLength(20);
            
        builder.Property(x => x.KVKKConsentVersion)
            .HasMaxLength(20);
            
        builder.Property(x => x.DataProtectionOfficer)
            .HasMaxLength(200);
            
        builder.Property(x => x.DataProtectionOfficerEmail)
            .HasMaxLength(256);
            
        builder.Property(x => x.DataProtectionOfficerPhone)
            .HasMaxLength(50);
            
        // Data Policies
        builder.Property(x => x.DataRetentionPolicy)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.DataCategories)
            .HasMaxLength(2000);
            
        builder.Property(x => x.SensitiveDataTypes)
            .HasMaxLength(2000);
            
        // Privacy Settings
        builder.Property(x => x.PrivacyPolicyUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.PrivacyPolicyVersion)
            .HasMaxLength(20);
            
        // Security Certifications
        builder.Property(x => x.ISO27001CertificateNumber)
            .HasMaxLength(100);
            
        builder.Property(x => x.SOC2ReportUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.PCIDSSLevel)
            .HasMaxLength(20);
            
        // Audit & Reporting
        builder.Property(x => x.LastAuditReport)
            .HasMaxLength(500);
            
        builder.Property(x => x.AuditFrequency)
            .HasMaxLength(50);
            
        builder.Property(x => x.ExternalAuditor)
            .HasMaxLength(200);
            
        // Access Control
        builder.Property(x => x.EncryptionAlgorithm)
            .HasMaxLength(50);
            
        // Backup & Recovery
        builder.Property(x => x.BackupFrequency)
            .HasMaxLength(50);
            
        builder.Property(x => x.BackupLocation)
            .HasMaxLength(500);
            
        // Incident Management
        builder.Property(x => x.IncidentResponseTeam)
            .HasMaxLength(2000);
            
        builder.Property(x => x.IncidentResponseProcedure)
            .HasMaxLength(4000);
            
        // Vulnerability Management
        builder.Property(x => x.ScanFrequency)
            .HasMaxLength(50);
            
        // Third Party & Vendor Management
        builder.Property(x => x.ThirdPartyVendors)
            .HasMaxLength(4000);
            
        builder.Property(x => x.DataProcessingAgreements)
            .HasMaxLength(4000);
            
        builder.Property(x => x.SubProcessors)
            .HasMaxLength(4000);
            
        // Compliance Status
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.ComplianceScore)
            .IsRequired()
            .HasPrecision(5, 2);
            
        builder.Property(x => x.NonComplianceAreas)
            .HasMaxLength(4000);
            
        builder.Property(x => x.RemediationPlan)
            .HasMaxLength(4000);
            
        // Documentation
        builder.Property(x => x.PolicyDocumentsUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.ComplianceReportsUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.CertificatesUrl)
            .HasMaxLength(500);
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne()
            .HasForeignKey<TenantCompliance>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.ComplianceScore);
        builder.HasIndex(x => x.GDPRCompliant);
        builder.HasIndex(x => x.KVKKCompliant);
        builder.HasIndex(x => x.ISO27001Certified);
    }
}