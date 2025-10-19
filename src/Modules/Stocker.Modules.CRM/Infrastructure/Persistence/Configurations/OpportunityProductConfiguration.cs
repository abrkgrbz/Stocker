using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class OpportunityProductConfiguration : IEntityTypeConfiguration<OpportunityProduct>
{
    public void Configure(EntityTypeBuilder<OpportunityProduct> builder)
    {
        builder.ToTable("OpportunityProducts", "crm");

        builder.HasKey(op => op.Id);

        builder.Property(op => op.Id)
            .ValueGeneratedNever();

        builder.Property(op => op.TenantId)
            .IsRequired();

        builder.Property(op => op.OpportunityId)
            .IsRequired();

        builder.Property(op => op.ProductId)
            .IsRequired();

        builder.Property(op => op.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(op => op.ProductCode)
            .HasMaxLength(50);

        builder.Property(op => op.Description)
            .HasMaxLength(1000);

        // Money value objects
        builder.OwnsOne(op => op.UnitPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("UnitPrice")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(op => op.DiscountAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("DiscountAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("DiscountCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(op => op.TotalPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalPrice")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("TotalPriceCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Relationships
        builder.HasOne<Opportunity>()
            .WithMany()
            .HasForeignKey(op => op.OpportunityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(op => op.TenantId);
        builder.HasIndex(op => new { op.TenantId, op.OpportunityId });
        builder.HasIndex(op => new { op.TenantId, op.ProductId });
    }
}
