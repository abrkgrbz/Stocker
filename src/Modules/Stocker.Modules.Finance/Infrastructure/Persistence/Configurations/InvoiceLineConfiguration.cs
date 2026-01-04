using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for InvoiceLine
/// </summary>
public class InvoiceLineConfiguration : IEntityTypeConfiguration<InvoiceLine>
{
    public void Configure(EntityTypeBuilder<InvoiceLine> builder)
    {
        builder.ToTable("InvoiceLines", "finance");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.ProductCode)
            .HasMaxLength(50);

        builder.Property(l => l.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(l => l.AdditionalDescription)
            .HasMaxLength(1000);

        builder.Property(l => l.Brand)
            .HasMaxLength(100);

        builder.Property(l => l.Model)
            .HasMaxLength(100);

        builder.Property(l => l.HsCode)
            .HasMaxLength(20);

        builder.Property(l => l.Quantity)
            .HasPrecision(18, 4);

        builder.Property(l => l.Unit)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("ADET");

        builder.Property(l => l.UnitCode)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("C62");

        builder.Property(l => l.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(l => l.DiscountReason)
            .HasMaxLength(500);

        builder.Property(l => l.VatExemptionDescription)
            .HasMaxLength(500);

        builder.Property(l => l.SctRate)
            .HasPrecision(5, 2);

        builder.Property(l => l.LotSerialNumber)
            .HasMaxLength(100);

        builder.Property(l => l.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Money value objects - owned entities
        builder.OwnsOne(l => l.UnitPrice, ConfigureMoney("UnitPrice"));
        builder.OwnsOne(l => l.LineTotal, ConfigureMoney("LineTotal"));
        builder.OwnsOne(l => l.GrossAmount, ConfigureMoney("GrossAmount"));
        builder.OwnsOne(l => l.DiscountAmount, ConfigureMoney("DiscountAmount"));
        builder.OwnsOne(l => l.NetAmount, ConfigureMoney("NetAmount"));
        builder.OwnsOne(l => l.VatAmount, ConfigureMoney("VatAmount"));
        builder.OwnsOne(l => l.AmountIncludingVat, ConfigureMoney("AmountIncludingVat"));
        builder.OwnsOne(l => l.WithholdingAmount, ConfigureMoney("WithholdingAmount"));
        builder.OwnsOne(l => l.SctAmount, ConfigureMoney("SctAmount"));

        // Relationships
        builder.HasOne(l => l.Invoice)
            .WithMany(i => i.Lines)
            .HasForeignKey(l => l.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.CostCenter)
            .WithMany()
            .HasForeignKey(l => l.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => l.InvoiceId);
        builder.HasIndex(l => new { l.TenantId, l.InvoiceId, l.LineNumber });
        builder.HasIndex(l => l.ProductId);
        builder.HasIndex(l => l.ProductCode);
        builder.HasIndex(l => l.CostCenterId);
        builder.HasIndex(l => l.WarehouseId);
        builder.HasIndex(l => l.OrderLineId);
        builder.HasIndex(l => l.WaybillLineId);
    }

    private static Action<OwnedNavigationBuilder<InvoiceLine, Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount).HasColumnName(columnPrefix).HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName($"{columnPrefix}Currency").HasMaxLength(3);
        };
    }
}
