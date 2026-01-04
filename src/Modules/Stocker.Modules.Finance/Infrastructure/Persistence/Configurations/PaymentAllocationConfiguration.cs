using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PaymentAllocation
/// </summary>
public class PaymentAllocationConfiguration : IEntityTypeConfiguration<PaymentAllocation>
{
    public void Configure(EntityTypeBuilder<PaymentAllocation> builder)
    {
        builder.ToTable("PaymentAllocations", "finance");

        builder.HasKey(pa => pa.Id);

        builder.Property(pa => pa.TenantId)
            .IsRequired();

        builder.Property(pa => pa.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(pa => pa.ExchangeRate)
            .HasPrecision(18, 6)
            .HasDefaultValue(1);

        builder.Property(pa => pa.Description)
            .HasMaxLength(500);

        // Money value objects - owned entities
        builder.OwnsOne(pa => pa.Amount, ConfigureMoney("Amount"));
        builder.OwnsOne(pa => pa.AmountTRY, ConfigureMoney("AmountTRY"));

        // Relationships
        builder.HasOne(pa => pa.Payment)
            .WithMany(p => p.Allocations)
            .HasForeignKey(pa => pa.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pa => pa.Invoice)
            .WithMany()
            .HasForeignKey(pa => pa.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pa => pa.CurrentAccountTransaction)
            .WithMany()
            .HasForeignKey(pa => pa.CurrentAccountTransactionId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(pa => pa.TenantId);
        builder.HasIndex(pa => pa.PaymentId);
        builder.HasIndex(pa => pa.InvoiceId);
        builder.HasIndex(pa => new { pa.TenantId, pa.PaymentId, pa.InvoiceId });
        builder.HasIndex(pa => pa.AllocationDate);
        builder.HasIndex(pa => pa.CurrentAccountTransactionId);
    }

    private static Action<OwnedNavigationBuilder<PaymentAllocation, Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount).HasColumnName(columnPrefix).HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName($"{columnPrefix}Currency").HasMaxLength(3);
        };
    }
}
