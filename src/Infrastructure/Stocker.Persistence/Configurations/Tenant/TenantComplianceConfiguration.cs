using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantComplianceConfiguration : BaseEntityTypeConfiguration<TenantCompliance>
{
    public override void Configure(EntityTypeBuilder<TenantCompliance> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("TenantCompliances", "tenant");
        
        // Basic Properties
        builder.Property(x => x.Type)
            .IsRequired();
            
        builder.Property(x => x.Status)
            .IsRequired();
            
        builder.Property(x => x.Standard)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(x => x.Version)
            .HasMaxLength(50)
            .IsRequired();
            
        builder.Property(x => x.Description)
            .HasMaxLength(2000);
            
        // Compliance Details
        builder.Property(x => x.CertificationDate);
        
        builder.Property(x => x.ExpirationDate);
        
        builder.Property(x => x.CertificationNumber)
            .HasMaxLength(100);
            
        builder.Property(x => x.CertifyingBody)
            .HasMaxLength(200);
            
        builder.Property(x => x.AuditorName)
            .HasMaxLength(200);
            
        builder.Property(x => x.AuditorCompany)
            .HasMaxLength(200);
            
        // Requirements & Controls
        builder.Property(x => x.Requirements)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(x => x.ImplementedControls)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(x => x.PendingControls)
            .HasColumnType("text")
            .IsRequired();
            
        builder.Property(x => x.TotalRequirements)
            .IsRequired();
            
        builder.Property(x => x.CompletedRequirements)
            .IsRequired();
            
        builder.Property(x => x.ComplianceScore)
            .HasPrecision(5, 2)
            .IsRequired();
            
        // Risk Assessment
        builder.Property(x => x.RiskLevel)
            .IsRequired();
            
        builder.Property(x => x.RiskAssessment)
            .HasMaxLength(2000);
            
        builder.Property(x => x.MitigationPlan)
            .HasMaxLength(2000);
            
        builder.Property(x => x.LastRiskAssessment);
        
        builder.Property(x => x.NextRiskAssessment);
        
        // Audit Information
        builder.Property(x => x.LastAuditDate);
        
        builder.Property(x => x.NextAuditDate);
        
        builder.Property(x => x.LastAuditType);
        
        builder.Property(x => x.LastAuditResult)
            .HasMaxLength(500);
            
        builder.Property(x => x.LastAuditFindings)
            .HasColumnType("text");
            
        builder.Property(x => x.CorrectiveActions)
            .HasColumnType("text");
            
        builder.Property(x => x.HasOpenFindings)
            .IsRequired();
            
        builder.Property(x => x.OpenFindingsCount)
            .IsRequired();
            
        // Documentation
        builder.Property(x => x.PolicyDocumentUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.EvidenceDocumentUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.CertificateUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.AuditReportUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.RelatedDocuments)
            .HasColumnType("text");
            
        // Notifications & Reminders
        builder.Property(x => x.NotifyOnExpiration)
            .IsRequired();
            
        builder.Property(x => x.DaysBeforeExpirationNotify)
            .IsRequired();
            
        builder.Property(x => x.NotifyOnAudit)
            .IsRequired();
            
        builder.Property(x => x.DaysBeforeAuditNotify)
            .IsRequired();
            
        builder.Property(x => x.NotificationEmails)
            .HasMaxLength(500);
            
        builder.Property(x => x.LastNotificationSent);
        
        // Geographic & Legal
        builder.Property(x => x.ApplicableRegions)
            .HasColumnType("text");
            
        builder.Property(x => x.LegalJurisdiction)
            .HasMaxLength(200);
            
        builder.Property(x => x.DataResidencyRequirements)
            .HasMaxLength(500);
            
        builder.Property(x => x.RequiresDataLocalization)
            .IsRequired();
            
        // Cost & Resources
        builder.Property(x => x.ComplianceCost)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.AnnualMaintenanceCost)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.AssignedTeam)
            .HasMaxLength(200);
            
        builder.Property(x => x.ResponsiblePerson)
            .HasMaxLength(200);
            
        builder.Property(x => x.ResponsibleEmail)
            .HasMaxLength(200);
            
        // Status Tracking
        builder.Property(x => x.IsActive)
            .IsRequired();
            
        builder.Property(x => x.IsMandatory)
            .IsRequired();
            
        builder.Property(x => x.SuspendedAt);
        
        builder.Property(x => x.SuspensionReason)
            .HasMaxLength(500);
            
        builder.Property(x => x.ActivatedAt);
        
        // Audit Trail
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.ModifiedAt);
        
        builder.Property(x => x.ModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.ReviewedAt);
        
        builder.Property(x => x.ReviewedBy)
            .HasMaxLength(100);
            
        // Indexes
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Standard);
        builder.HasIndex(x => x.ExpirationDate);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.IsMandatory);
        builder.HasIndex(x => x.RiskLevel);
        builder.HasIndex(x => x.NextAuditDate);
        builder.HasIndex(x => new { x.Type, x.Status, x.IsActive });
    }
}