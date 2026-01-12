using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class KpiDefinitionConfiguration : IEntityTypeConfiguration<KpiDefinition>
{
    public void Configure(EntityTypeBuilder<KpiDefinition> builder)
    {
        builder.ToTable("KpiDefinitions");

        builder.HasKey(k => k.Id);

        builder.Property(k => k.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(k => k.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(k => k.Description)
            .HasMaxLength(1000);

        builder.Property(k => k.Unit)
            .HasMaxLength(50);

        builder.Property(k => k.Formula)
            .HasMaxLength(500);

        builder.Property(k => k.Category)
            .HasMaxLength(100);

        builder.Property(k => k.Color)
            .HasMaxLength(20);

        builder.Property(k => k.IconName)
            .HasMaxLength(50);

        builder.Property(k => k.TargetValue)
            .HasPrecision(18, 4);

        builder.Property(k => k.MinThreshold)
            .HasPrecision(18, 4);

        builder.Property(k => k.MaxThreshold)
            .HasPrecision(18, 4);

        builder.Property(k => k.TolerancePercent)
            .HasPrecision(18, 4);

        builder.HasIndex(k => k.Code).IsUnique();
        builder.HasIndex(k => k.Type);
        builder.HasIndex(k => k.IsActive);

        builder.HasMany(k => k.Values)
            .WithOne(v => v.KpiDefinition)
            .HasForeignKey(v => v.KpiDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(k => k.Targets)
            .WithOne(t => t.KpiDefinition)
            .HasForeignKey(t => t.KpiDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class KpiValueConfiguration : IEntityTypeConfiguration<KpiValue>
{
    public void Configure(EntityTypeBuilder<KpiValue> builder)
    {
        builder.ToTable("KpiValues");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Value)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(v => v.PreviousValue)
            .HasPrecision(18, 4);

        builder.Property(v => v.ChangePercent)
            .HasPrecision(18, 4);

        builder.Property(v => v.TargetValue)
            .HasPrecision(18, 4);

        builder.Property(v => v.Variance)
            .HasPrecision(18, 4);

        builder.Property(v => v.VariancePercent)
            .HasPrecision(18, 4);

        builder.Property(v => v.Component1)
            .HasPrecision(18, 4);

        builder.Property(v => v.Component1Name)
            .HasMaxLength(100);

        builder.Property(v => v.Component2)
            .HasPrecision(18, 4);

        builder.Property(v => v.Component2Name)
            .HasMaxLength(100);

        builder.Property(v => v.Component3)
            .HasPrecision(18, 4);

        builder.Property(v => v.Component3Name)
            .HasMaxLength(100);

        builder.Property(v => v.Notes)
            .HasMaxLength(1000);

        builder.Property(v => v.CalculatedBy)
            .HasMaxLength(100);

        builder.HasIndex(v => new { v.KpiDefinitionId, v.PeriodStart, v.PeriodEnd });
        builder.HasIndex(v => v.PeriodType);
        builder.HasIndex(v => v.WorkCenterId);
        builder.HasIndex(v => v.ProductId);
        builder.HasIndex(v => v.CalculatedDate);
    }
}

public class KpiTargetConfiguration : IEntityTypeConfiguration<KpiTarget>
{
    public void Configure(EntityTypeBuilder<KpiTarget> builder)
    {
        builder.ToTable("KpiTargets");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TargetValue)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(t => t.StretchTarget)
            .HasPrecision(18, 4);

        builder.Property(t => t.MinimumTarget)
            .HasPrecision(18, 4);

        builder.Property(t => t.Notes)
            .HasMaxLength(1000);

        builder.Property(t => t.SetBy)
            .HasMaxLength(100);

        builder.Property(t => t.ApprovedBy)
            .HasMaxLength(100);

        builder.HasIndex(t => new { t.KpiDefinitionId, t.Year });
        builder.HasIndex(t => t.IsApproved);
    }
}

public class DashboardConfigurationConfiguration : IEntityTypeConfiguration<DashboardConfiguration>
{
    public void Configure(EntityTypeBuilder<DashboardConfiguration> builder)
    {
        builder.ToTable("DashboardConfigurations");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(d => d.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(d => d.Description)
            .HasMaxLength(1000);

        builder.Property(d => d.CreatedBy)
            .HasMaxLength(100);

        builder.Property(d => d.LayoutJson)
            .HasMaxLength(4000);

        builder.HasIndex(d => d.Code).IsUnique();
        builder.HasIndex(d => d.IsDefault);
        builder.HasIndex(d => d.IsPublic);
        builder.HasIndex(d => d.IsActive);

        builder.HasMany(d => d.Widgets)
            .WithOne(w => w.DashboardConfiguration)
            .HasForeignKey(w => w.DashboardConfigurationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DashboardWidgetConfiguration : IEntityTypeConfiguration<DashboardWidget>
{
    public void Configure(EntityTypeBuilder<DashboardWidget> builder)
    {
        builder.ToTable("DashboardWidgets");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(w => w.ConfigurationJson)
            .HasMaxLength(4000);

        builder.Property(w => w.DataSourceQuery)
            .HasMaxLength(2000);

        builder.HasIndex(w => w.DashboardConfigurationId);
        builder.HasIndex(w => w.KpiDefinitionId);
        builder.HasIndex(w => w.DisplayOrder);

        builder.HasOne(w => w.KpiDefinition)
            .WithMany()
            .HasForeignKey(w => w.KpiDefinitionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class OeeRecordConfiguration : IEntityTypeConfiguration<OeeRecord>
{
    public void Configure(EntityTypeBuilder<OeeRecord> builder)
    {
        builder.ToTable("OeeRecords");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.WorkCenterCode)
            .HasMaxLength(50);

        builder.Property(o => o.WorkCenterName)
            .HasMaxLength(200);

        builder.Property(o => o.ShiftName)
            .HasMaxLength(100);

        builder.Property(o => o.PlannedProductionTime)
            .HasPrecision(18, 2);

        builder.Property(o => o.ActualProductionTime)
            .HasPrecision(18, 2);

        builder.Property(o => o.DowntimeMinutes)
            .HasPrecision(18, 2);

        builder.Property(o => o.SetupMinutes)
            .HasPrecision(18, 2);

        builder.Property(o => o.BreakMinutes)
            .HasPrecision(18, 2);

        builder.Property(o => o.PlannedQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.ActualQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.GoodQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.DefectQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.ReworkQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.ScrapQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.IdealCycleTime)
            .HasPrecision(18, 4);

        builder.Property(o => o.ActualCycleTime)
            .HasPrecision(18, 4);

        builder.Property(o => o.Availability)
            .HasPrecision(18, 4);

        builder.Property(o => o.Performance)
            .HasPrecision(18, 4);

        builder.Property(o => o.Quality)
            .HasPrecision(18, 4);

        builder.Property(o => o.OeeValue)
            .HasPrecision(18, 4);

        builder.Property(o => o.ProductionOrderNumber)
            .HasMaxLength(50);

        builder.Property(o => o.ProductCode)
            .HasMaxLength(50);

        builder.Property(o => o.Notes)
            .HasMaxLength(1000);

        builder.Property(o => o.RecordedBy)
            .HasMaxLength(100);

        builder.Property(o => o.ValidatedBy)
            .HasMaxLength(100);

        builder.HasIndex(o => o.WorkCenterId);
        builder.HasIndex(o => o.RecordDate);
        builder.HasIndex(o => new { o.WorkCenterId, o.RecordDate });
        builder.HasIndex(o => o.ProductionOrderId);
        builder.HasIndex(o => o.IsValidated);
    }
}

public class ProductionPerformanceSummaryConfiguration : IEntityTypeConfiguration<ProductionPerformanceSummary>
{
    public void Configure(EntityTypeBuilder<ProductionPerformanceSummary> builder)
    {
        builder.ToTable("ProductionPerformanceSummaries");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.WorkCenterCode)
            .HasMaxLength(50);

        builder.Property(p => p.ProductCode)
            .HasMaxLength(50);

        builder.Property(p => p.PlannedQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.ProducedQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.GoodQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.DefectQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.ScrapQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.PlannedTime)
            .HasPrecision(18, 2);

        builder.Property(p => p.ActualTime)
            .HasPrecision(18, 2);

        builder.Property(p => p.DowntimeMinutes)
            .HasPrecision(18, 2);

        builder.Property(p => p.SetupMinutes)
            .HasPrecision(18, 2);

        builder.Property(p => p.ProductionEfficiency)
            .HasPrecision(18, 4);

        builder.Property(p => p.QualityRate)
            .HasPrecision(18, 4);

        builder.Property(p => p.OnTimeDeliveryRate)
            .HasPrecision(18, 4);

        builder.Property(p => p.OeeAverage)
            .HasPrecision(18, 4);

        builder.Property(p => p.CapacityUtilization)
            .HasPrecision(18, 4);

        builder.Property(p => p.ScrapRate)
            .HasPrecision(18, 4);

        builder.Property(p => p.PlannedCost)
            .HasPrecision(18, 2);

        builder.Property(p => p.ActualCost)
            .HasPrecision(18, 2);

        builder.Property(p => p.CostVariance)
            .HasPrecision(18, 2);

        builder.Property(p => p.CostVariancePercent)
            .HasPrecision(18, 4);

        builder.Property(p => p.CalculatedBy)
            .HasMaxLength(100);

        builder.HasIndex(p => new { p.PeriodStart, p.PeriodEnd });
        builder.HasIndex(p => p.PeriodType);
        builder.HasIndex(p => p.WorkCenterId);
        builder.HasIndex(p => p.ProductId);
    }
}
