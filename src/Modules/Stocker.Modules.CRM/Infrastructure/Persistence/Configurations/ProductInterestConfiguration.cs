using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class ProductInterestConfiguration : IEntityTypeConfiguration<ProductInterest>
{
    public void Configure(EntityTypeBuilder<ProductInterest> builder)
    {
        builder.ToTable("ProductInterests", "crm");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.ProductCategory)
            .HasMaxLength(100);

        builder.Property(p => p.InterestedQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.Unit)
            .HasMaxLength(50);

        builder.Property(p => p.EstimatedBudget)
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .HasMaxLength(3);

        builder.Property(p => p.QuotedPrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.InterestReason)
            .HasMaxLength(1000);

        builder.Property(p => p.Requirements)
            .HasColumnType("nvarchar(max)");

        builder.Property(p => p.Notes)
            .HasMaxLength(2000);

        builder.Property(p => p.CompetitorProducts)
            .HasMaxLength(1000);

        builder.Property(p => p.NotPurchasedReason)
            .HasMaxLength(1000);

        builder.Property(p => p.PurchaseProbability)
            .HasPrecision(5, 2);

        builder.Property(p => p.PromoCode)
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(p => p.Customer)
            .WithMany()
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Contact)
            .WithMany()
            .HasForeignKey(p => p.ContactId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Lead)
            .WithMany()
            .HasForeignKey(p => p.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Opportunity)
            .WithMany()
            .HasForeignKey(p => p.OpportunityId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Campaign)
            .WithMany()
            .HasForeignKey(p => p.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.ProductId });
        builder.HasIndex(p => new { p.TenantId, p.CustomerId });
        builder.HasIndex(p => new { p.TenantId, p.LeadId });
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.TenantId, p.InterestLevel });
        builder.HasIndex(p => new { p.TenantId, p.InterestDate });
    }
}
