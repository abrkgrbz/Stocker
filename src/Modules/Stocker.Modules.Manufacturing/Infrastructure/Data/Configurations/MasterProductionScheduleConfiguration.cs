using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class MasterProductionScheduleConfiguration : IEntityTypeConfiguration<MasterProductionSchedule>
{
    public void Configure(EntityTypeBuilder<MasterProductionSchedule> builder)
    {
        builder.ToTable("MasterProductionSchedules", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScheduleNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.PeriodType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.ScheduleNumber })
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.Status });

        builder.HasMany(x => x.Lines)
            .WithOne(x => x.Mps)
            .HasForeignKey(x => x.MpsId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Lines).AutoInclude(false);
    }
}

public class MpsLineConfiguration : IEntityTypeConfiguration<MpsLine>
{
    public void Configure(EntityTypeBuilder<MpsLine> builder)
    {
        builder.ToTable("MpsLines", "manufacturing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ForecastQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.CustomerOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.DependentDemand)
            .HasPrecision(18, 4);

        builder.Property(x => x.PlannedProductionQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ProjectedAvailableBalance)
            .HasPrecision(18, 4);

        builder.Property(x => x.AvailableToPromise)
            .HasPrecision(18, 4);

        builder.Property(x => x.BeginningInventory)
            .HasPrecision(18, 4);

        builder.Property(x => x.SafetyStock)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualProductionQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.ActualSalesQuantity)
            .HasPrecision(18, 4);

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.HasIndex(x => new { x.MpsId, x.ProductId, x.PeriodDate });
        builder.HasIndex(x => new { x.ProductId, x.PeriodDate });
    }
}
