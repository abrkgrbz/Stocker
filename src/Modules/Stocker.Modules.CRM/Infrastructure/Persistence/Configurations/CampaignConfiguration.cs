using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class CampaignConfiguration : IEntityTypeConfiguration<Campaign>
{
    public void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.ToTable("Campaigns", "crm");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        // Money value objects
        builder.OwnsOne(c => c.BudgetedCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("BudgetedCost")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("BudgetedCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(c => c.ActualCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ActualCost")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("ActualCostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(c => c.ExpectedRevenue, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ExpectedRevenue")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("ExpectedRevenueCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(c => c.ActualRevenue, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ActualRevenue")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("ActualRevenueCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.Type });
        builder.HasIndex(c => new { c.TenantId, c.StartDate, c.EndDate });
    }
}
