using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for InvoiceTax
/// </summary>
public class InvoiceTaxConfiguration : IEntityTypeConfiguration<InvoiceTax>
{
    public void Configure(EntityTypeBuilder<InvoiceTax> builder)
    {
        builder.ToTable("InvoiceTaxes", "finance");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.TaxCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.TaxName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.TaxRate)
            .HasPrecision(5, 2);

        builder.Property(t => t.ExemptionCode)
            .HasMaxLength(20);

        builder.Property(t => t.ExemptionReason)
            .HasMaxLength(500);

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Money value objects - owned entities
        builder.OwnsOne(t => t.TaxBase, ConfigureMoney("TaxBase"));
        builder.OwnsOne(t => t.TaxAmount, ConfigureMoney("TaxAmount"));

        // Relationships
        builder.HasOne(t => t.Invoice)
            .WithMany(i => i.Taxes)
            .HasForeignKey(t => t.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => t.InvoiceId);
        builder.HasIndex(t => new { t.TenantId, t.InvoiceId, t.TaxType });
        builder.HasIndex(t => t.TaxCode);
    }

    private static Action<OwnedNavigationBuilder<InvoiceTax, Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount).HasColumnName(columnPrefix).HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName($"{columnPrefix}Currency").HasMaxLength(3);
        };
    }
}
