using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class MrpPlanConfiguration : IEntityTypeConfiguration<MrpPlan>
{
    public void Configure(EntityTypeBuilder<MrpPlan> builder)
    {
        builder.ToTable("MrpPlans", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlanNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.DefaultLotSizingMethod)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.FixedOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.PlanNumber })
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.Status });

        builder.HasMany(x => x.Requirements)
            .WithOne(x => x.MrpPlan)
            .HasForeignKey(x => x.MrpPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.PlannedOrders)
            .WithOne(x => x.MrpPlan)
            .HasForeignKey(x => x.MrpPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Exceptions)
            .WithOne(x => x.MrpPlan)
            .HasForeignKey(x => x.MrpPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Requirements).AutoInclude(false);
        builder.Navigation(x => x.PlannedOrders).AutoInclude(false);
        builder.Navigation(x => x.Exceptions).AutoInclude(false);
    }
}

public class MrpRequirementConfiguration : IEntityTypeConfiguration<MrpRequirement>
{
    public void Configure(EntityTypeBuilder<MrpRequirement> builder)
    {
        builder.ToTable("MrpRequirements", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.GrossRequirement)
            .HasPrecision(18, 4);

        builder.Property(x => x.OnHandStock)
            .HasPrecision(18, 4);

        builder.Property(x => x.ScheduledReceipts)
            .HasPrecision(18, 4);

        builder.Property(x => x.SafetyStock)
            .HasPrecision(18, 4);

        builder.Property(x => x.NetRequirement)
            .HasPrecision(18, 4);

        builder.Property(x => x.PlannedOrderReceipt)
            .HasPrecision(18, 4);

        builder.Property(x => x.PlannedOrderRelease)
            .HasPrecision(18, 4);

        builder.Property(x => x.ProjectedOnHand)
            .HasPrecision(18, 4);

        builder.Property(x => x.DemandSource)
            .HasMaxLength(100);

        builder.HasIndex(x => new { x.MrpPlanId, x.ProductId, x.RequirementDate });
        builder.HasIndex(x => x.ProductId);
    }
}

public class PlannedOrderConfiguration : IEntityTypeConfiguration<PlannedOrder>
{
    public void Configure(EntityTypeBuilder<PlannedOrder> builder)
    {
        builder.ToTable("PlannedOrders", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.LotSizingMethod)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.OriginalQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ConvertedToOrderType)
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(x => new { x.TenantId, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.ProductId });
        builder.HasIndex(x => x.PlannedStartDate);
    }
}

public class MrpExceptionConfiguration : IEntityTypeConfiguration<MrpException>
{
    public void Configure(EntityTypeBuilder<MrpException> builder)
    {
        builder.ToTable("MrpExceptions", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ExceptionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Severity)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.Details)
            .HasMaxLength(2000);

        builder.Property(x => x.ResolutionNotes)
            .HasMaxLength(1000);

        builder.HasIndex(x => new { x.MrpPlanId, x.ExceptionType });
        builder.HasIndex(x => new { x.TenantId, x.IsResolved });
    }
}
