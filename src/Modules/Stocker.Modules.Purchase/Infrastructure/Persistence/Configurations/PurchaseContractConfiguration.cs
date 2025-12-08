using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PurchaseContractConfiguration : IEntityTypeConfiguration<PurchaseContract>
{
    public void Configure(EntityTypeBuilder<PurchaseContract> builder)
    {
        builder.ToTable("PurchaseContracts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.ContractNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(c => c.SupplierCode)
            .HasMaxLength(50);

        builder.Property(c => c.SupplierName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(c => c.TotalContractValue)
            .HasPrecision(18, 4);

        builder.Property(c => c.UsedAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.RemainingAmount)
            .HasPrecision(18, 4);

        builder.Property(c => c.Currency)
            .HasMaxLength(10);

        builder.Property(c => c.MinimumOrderValue)
            .HasPrecision(18, 4);

        builder.Property(c => c.MaximumOrderValue)
            .HasPrecision(18, 4);

        builder.Property(c => c.DeliveryTerms)
            .HasMaxLength(4000);

        builder.Property(c => c.PaymentTerms)
            .HasMaxLength(4000);

        builder.Property(c => c.QualityTerms)
            .HasMaxLength(4000);

        builder.Property(c => c.PenaltyTerms)
            .HasMaxLength(4000);

        builder.Property(c => c.OtherTerms)
            .HasMaxLength(4000);

        builder.Property(c => c.WarrantyPeriodMonths)
            .HasPrecision(5, 2);

        builder.Property(c => c.CreatedByName)
            .HasMaxLength(200);

        builder.Property(c => c.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(c => c.ApprovalNotes)
            .HasMaxLength(1000);

        builder.Property(c => c.Notes)
            .HasMaxLength(2000);

        builder.Property(c => c.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(c => c.TerminationReason)
            .HasMaxLength(1000);

        builder.HasMany(c => c.Items)
            .WithOne()
            .HasForeignKey(i => i.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => new { c.TenantId, c.ContractNumber }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.SupplierId });
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.StartDate, c.EndDate });
    }
}

public class PurchaseContractItemConfiguration : IEntityTypeConfiguration<PurchaseContractItem>
{
    public void Configure(EntityTypeBuilder<PurchaseContractItem> builder)
    {
        builder.ToTable("PurchaseContractItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Unit)
            .HasMaxLength(50);

        builder.Property(i => i.ContractedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UsedQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.RemainingQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.MinOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.MaxOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.Currency)
            .HasMaxLength(10);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.Specifications)
            .HasMaxLength(2000);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        builder.HasMany(i => i.PriceBreaks)
            .WithOne()
            .HasForeignKey(p => p.ContractItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => new { i.TenantId, i.ContractId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}

public class PurchaseContractPriceBreakConfiguration : IEntityTypeConfiguration<PurchaseContractPriceBreak>
{
    public void Configure(EntityTypeBuilder<PurchaseContractPriceBreak> builder)
    {
        builder.ToTable("PurchaseContractPriceBreaks");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.MinQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.MaxQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(p => p.DiscountRate)
            .HasPrecision(5, 2);

        builder.HasIndex(p => new { p.TenantId, p.ContractItemId });
    }
}
