using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class CapacityPlanConfiguration : IEntityTypeConfiguration<CapacityPlan>
{
    public void Configure(EntityTypeBuilder<CapacityPlan> builder)
    {
        builder.ToTable("CapacityPlans", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlanNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.OverloadThreshold)
            .HasPrecision(5, 2);

        builder.Property(x => x.BottleneckThreshold)
            .HasPrecision(5, 2);

        builder.Property(x => x.AverageUtilization)
            .HasPrecision(5, 2);

        builder.Property(x => x.ExecutedBy)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.PlanNumber })
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.Status });

        builder.HasOne(x => x.MrpPlan)
            .WithMany()
            .HasForeignKey(x => x.MrpPlanId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Requirements)
            .WithOne(x => x.CapacityPlan)
            .HasForeignKey(x => x.CapacityPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Exceptions)
            .WithOne(x => x.CapacityPlan)
            .HasForeignKey(x => x.CapacityPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Requirements).AutoInclude(false);
        builder.Navigation(x => x.Exceptions).AutoInclude(false);
    }
}

public class CapacityRequirementConfiguration : IEntityTypeConfiguration<CapacityRequirement>
{
    public void Configure(EntityTypeBuilder<CapacityRequirement> builder)
    {
        builder.ToTable("CapacityRequirements", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AvailableCapacity)
            .HasPrecision(18, 4);

        builder.Property(x => x.RequiredCapacity)
            .HasPrecision(18, 4);

        builder.Property(x => x.SetupTime)
            .HasPrecision(18, 4);

        builder.Property(x => x.RunTime)
            .HasPrecision(18, 4);

        builder.Property(x => x.QueueTime)
            .HasPrecision(18, 4);

        builder.Property(x => x.MoveTime)
            .HasPrecision(18, 4);

        builder.Property(x => x.LoadPercent)
            .HasPrecision(10, 2);

        builder.Property(x => x.OverUnderCapacity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ShiftedHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.LoadDetails)
            .WithOne(x => x.CapacityRequirement)
            .HasForeignKey(x => x.CapacityRequirementId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CapacityPlanId, x.WorkCenterId, x.PeriodDate });
        builder.HasIndex(x => new { x.WorkCenterId, x.PeriodDate });
        builder.HasIndex(x => x.Status);

        builder.Navigation(x => x.LoadDetails).AutoInclude(false);
    }
}

public class CapacityLoadDetailConfiguration : IEntityTypeConfiguration<CapacityLoadDetail>
{
    public void Configure(EntityTypeBuilder<CapacityLoadDetail> builder)
    {
        builder.ToTable("CapacityLoadDetails", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SetupHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.RunHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.QueueHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.MoveHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.TotalHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.LoadType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasOne(x => x.ProductionOrder)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Operation)
            .WithMany()
            .HasForeignKey(x => x.OperationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.ProductionOrderId);
        builder.HasIndex(x => x.PlannedOrderId);
    }
}

public class CapacityExceptionConfiguration : IEntityTypeConfiguration<CapacityException>
{
    public void Configure(EntityTypeBuilder<CapacityException> builder)
    {
        builder.ToTable("CapacityExceptions", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
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

        builder.Property(x => x.RequiredCapacity)
            .HasPrecision(18, 4);

        builder.Property(x => x.AvailableCapacity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ShortageHours)
            .HasPrecision(18, 4);

        builder.Property(x => x.ResolvedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ResolutionNotes)
            .HasMaxLength(1000);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CapacityPlanId, x.Type });
        builder.HasIndex(x => new { x.TenantId, x.IsResolved });
    }
}
