using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class DealProductConfiguration : IEntityTypeConfiguration<DealProduct>
{
    public void Configure(EntityTypeBuilder<DealProduct> builder)
    {
        builder.ToTable("DealProducts", "crm");

        builder.HasKey(dp => dp.Id);

        builder.Property(dp => dp.Id)
            .ValueGeneratedNever();

        builder.Property(dp => dp.TenantId)
            .IsRequired();

        builder.Property(dp => dp.DealId)
            .IsRequired();

        builder.Property(dp => dp.ProductId)
            .IsRequired();

        builder.Property(dp => dp.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(dp => dp.ProductCode)
            .HasMaxLength(50);

        builder.Property(dp => dp.Description)
            .HasMaxLength(1000);

        // Money value objects
        builder.OwnsOne(dp => dp.UnitPrice, money =>
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

        builder.OwnsOne(dp => dp.DiscountAmount, money =>
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

        builder.OwnsOne(dp => dp.TotalPrice, money =>
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

        builder.OwnsOne(dp => dp.TaxAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TaxAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("TaxCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Relationships
        // Using NoAction to prevent multiple cascade paths in SQL Server
        builder.HasOne<Deal>()
            .WithMany()
            .HasForeignKey(dp => dp.DealId)
            .OnDelete(DeleteBehavior.NoAction);

        // Indexes
        builder.HasIndex(dp => dp.TenantId);
        builder.HasIndex(dp => new { dp.TenantId, dp.DealId });
        builder.HasIndex(dp => new { dp.TenantId, dp.ProductId });
    }
}
