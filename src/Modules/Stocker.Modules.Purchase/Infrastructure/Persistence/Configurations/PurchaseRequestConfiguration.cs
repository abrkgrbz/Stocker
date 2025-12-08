using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PurchaseRequestConfiguration : IEntityTypeConfiguration<PurchaseRequest>
{
    public void Configure(EntityTypeBuilder<PurchaseRequest> builder)
    {
        builder.ToTable("PurchaseRequests");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RequestNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.RequestedByName)
            .HasMaxLength(200);

        builder.Property(r => r.DepartmentName)
            .HasMaxLength(200);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Priority)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Purpose)
            .HasMaxLength(1000);

        builder.Property(r => r.Notes)
            .HasMaxLength(2000);

        builder.Property(r => r.TotalEstimatedAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.Currency)
            .HasMaxLength(10);

        builder.Property(r => r.ApprovedByName)
            .HasMaxLength(200);

        builder.Property(r => r.ApprovalNotes)
            .HasMaxLength(1000);

        builder.Property(r => r.RejectedByName)
            .HasMaxLength(200);

        builder.Property(r => r.RejectionReason)
            .HasMaxLength(1000);

        builder.HasMany(r => r.Items)
            .WithOne(i => i.PurchaseRequest)
            .HasForeignKey(i => i.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.TenantId, r.RequestNumber }).IsUnique();
        builder.HasIndex(r => new { r.TenantId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.RequestedById });
        builder.HasIndex(r => new { r.TenantId, r.RequestDate });
    }
}

public class PurchaseRequestItemConfiguration : IEntityTypeConfiguration<PurchaseRequestItem>
{
    public void Configure(EntityTypeBuilder<PurchaseRequestItem> builder)
    {
        builder.ToTable("PurchaseRequestItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Unit)
            .HasMaxLength(50);

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.EstimatedUnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.EstimatedAmount)
            .HasPrecision(18, 4);

        builder.Property(i => i.PreferredSupplierName)
            .HasMaxLength(300);

        builder.Property(i => i.Specification)
            .HasMaxLength(2000);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(i => new { i.TenantId, i.PurchaseRequestId });
        builder.HasIndex(i => new { i.TenantId, i.ProductId });
    }
}
