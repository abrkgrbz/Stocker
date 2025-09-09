using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantContractConfiguration : IEntityTypeConfiguration<TenantContract>
{
    public void Configure(EntityTypeBuilder<TenantContract> builder)
    {
        builder.ToTable("TenantContracts", "Master");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ContractNumber)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(x => x.ContractNumber)
            .IsUnique();
            
        builder.Property(x => x.ContractType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.StartDate)
            .IsRequired();
            
        builder.Property(x => x.EndDate)
            .IsRequired();
            
        builder.Property(x => x.ContractValue)
            .IsRequired()
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(3);
            
        builder.Property(x => x.PaymentTerms)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        // Contract Details
        builder.Property(x => x.Terms)
            .HasMaxLength(4000);
            
        builder.Property(x => x.SpecialConditions)
            .HasMaxLength(2000);
            
        builder.Property(x => x.NoticePeriodDays)
            .IsRequired();
            
        builder.Property(x => x.RenewalPriceIncrease)
            .HasPrecision(5, 2);
            
        // Signing Information
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.SignedBy)
            .HasMaxLength(200);
            
        builder.Property(x => x.SignerTitle)
            .HasMaxLength(100);
            
        builder.Property(x => x.SignerEmail)
            .HasMaxLength(256);
            
        builder.Property(x => x.DocumentUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.DocumentHash)
            .HasMaxLength(256);
            
        // Approval
        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.ApprovalNotes)
            .HasMaxLength(500);
            
        // Termination
        builder.Property(x => x.TerminationReason)
            .HasMaxLength(500);
            
        builder.Property(x => x.TerminatedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.EarlyTerminationFee)
            .HasPrecision(18, 2);
            
        // SLA
        builder.Property(x => x.UptimeGuarantee)
            .HasPrecision(5, 2);
            
        builder.Property(x => x.SupportLevel)
            .HasMaxLength(50);
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithMany(t => t.Contracts)
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.StartDate);
        builder.HasIndex(x => x.EndDate);
        builder.HasIndex(x => new { x.TenantId, x.Status });
        builder.HasIndex(x => new { x.Status, x.EndDate });
    }
}