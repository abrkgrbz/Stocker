using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class ReferralConfiguration : IEntityTypeConfiguration<Referral>
{
    public void Configure(EntityTypeBuilder<Referral> builder)
    {
        builder.ToTable("Referrals", "crm");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .ValueGeneratedNever();

        builder.Property(r => r.TenantId)
            .IsRequired();

        builder.Property(r => r.ReferralCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.ReferrerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.ReferrerEmail)
            .HasMaxLength(255);

        builder.Property(r => r.ReferrerPhone)
            .HasMaxLength(50);

        builder.Property(r => r.ReferredName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.ReferredEmail)
            .HasMaxLength(255);

        builder.Property(r => r.ReferredPhone)
            .HasMaxLength(50);

        builder.Property(r => r.ReferredCompany)
            .HasMaxLength(200);

        builder.Property(r => r.ReferrerReward)
            .HasPrecision(18, 2);

        builder.Property(r => r.ReferredReward)
            .HasPrecision(18, 2);

        builder.Property(r => r.Currency)
            .HasMaxLength(3);

        builder.Property(r => r.ProgramName)
            .HasMaxLength(200);

        builder.Property(r => r.TotalSalesAmount)
            .HasPrecision(18, 2);

        builder.Property(r => r.ConversionValue)
            .HasPrecision(18, 2);

        builder.Property(r => r.ReferralMessage)
            .HasMaxLength(2000);

        builder.Property(r => r.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(r => r.RejectionReason)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(r => r.ReferrerCustomer)
            .WithMany()
            .HasForeignKey(r => r.ReferrerCustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.ReferrerContact)
            .WithMany()
            .HasForeignKey(r => r.ReferrerContactId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.ReferredCustomer)
            .WithMany()
            .HasForeignKey(r => r.ReferredCustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.ReferredLead)
            .WithMany()
            .HasForeignKey(r => r.ReferredLeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Campaign)
            .WithMany()
            .HasForeignKey(r => r.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Opportunity)
            .WithMany()
            .HasForeignKey(r => r.OpportunityId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(r => r.Deal)
            .WithMany()
            .HasForeignKey(r => r.DealId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => new { r.TenantId, r.ReferralCode }).IsUnique();
        builder.HasIndex(r => new { r.TenantId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.ReferralDate });
        builder.HasIndex(r => new { r.TenantId, r.ReferrerCustomerId });
        builder.HasIndex(r => new { r.TenantId, r.ReferredCustomerId });
    }
}
