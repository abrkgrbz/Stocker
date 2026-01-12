using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class BillOfMaterialConfiguration : IEntityTypeConfiguration<BillOfMaterial>
{
    public void Configure(EntityTypeBuilder<BillOfMaterial> builder)
    {
        builder.ToTable("BillOfMaterials");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.BaseQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.BaseUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.EstimatedMaterialCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedLaborCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.EstimatedOverheadCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalEstimatedCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.StandardYield)
            .HasPrecision(5, 2);

        builder.Property(x => x.ScrapRate)
            .HasPrecision(5, 2);

        builder.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.ProductId });
        builder.HasIndex(x => x.Status);
    }
}

public class BomLineConfiguration : IEntityTypeConfiguration<BomLine>
{
    public void Configure(EntityTypeBuilder<BomLine> builder)
    {
        builder.ToTable("BomLines");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ScrapRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.NetQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalCost)
            .HasPrecision(18, 4);

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.HasOne(x => x.Bom)
            .WithMany(x => x.Lines)
            .HasForeignKey(x => x.BomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.BomId, x.Sequence }).IsUnique();
    }
}

public class BomCoProductConfiguration : IEntityTypeConfiguration<BomCoProduct>
{
    public void Configure(EntityTypeBuilder<BomCoProduct> builder)
    {
        builder.ToTable("BomCoProducts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.YieldPercent)
            .HasPrecision(5, 2);

        builder.Property(x => x.CostAllocationPercent)
            .HasPrecision(5, 2);

        builder.Property(x => x.CostAllocationMethod)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.UnitValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.HasOne(x => x.Bom)
            .WithMany(x => x.CoProducts)
            .HasForeignKey(x => x.BomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
