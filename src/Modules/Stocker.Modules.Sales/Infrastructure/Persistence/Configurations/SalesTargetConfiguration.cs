using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesTargetConfiguration : IEntityTypeConfiguration<SalesTarget>
{
    public void Configure(EntityTypeBuilder<SalesTarget> builder)
    {
        builder.ToTable("SalesTargets", "sales");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TargetCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        builder.Property(t => t.SalesRepresentativeName)
            .HasMaxLength(200);

        builder.Property(t => t.SalesTeamName)
            .HasMaxLength(200);

        builder.Property(t => t.SalesTerritoryName)
            .HasMaxLength(200);

        builder.OwnsOne(t => t.TotalTargetAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalTargetAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalTargetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(t => t.TotalActualAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalActualAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TotalActualCurrency").HasMaxLength(3);
        });

        builder.Property(t => t.TargetQuantity).HasPrecision(18, 4);
        builder.Property(t => t.ActualQuantity).HasPrecision(18, 4);
        builder.Property(t => t.MinimumAchievementPercentage).HasPrecision(5, 2);

        builder.Property(t => t.TargetType).HasConversion<string>().HasMaxLength(30);
        builder.Property(t => t.PeriodType).HasConversion<string>().HasMaxLength(30);
        builder.Property(t => t.MetricType).HasConversion<string>().HasMaxLength(30);
        builder.Property(t => t.Status).HasConversion<string>().HasMaxLength(30);

        builder.Property(t => t.Notes).HasMaxLength(4000);

        builder.HasMany(t => t.Periods)
            .WithOne()
            .HasForeignKey(p => p.SalesTargetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.ProductTargets)
            .WithOne()
            .HasForeignKey(p => p.SalesTargetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Achievements)
            .WithOne()
            .HasForeignKey(a => a.SalesTargetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => t.TargetCode);
        builder.HasIndex(t => new { t.TenantId, t.TargetCode }).IsUnique();
        builder.HasIndex(t => t.Year);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.SalesRepresentativeId);
        builder.HasIndex(t => t.SalesTeamId);
        builder.HasIndex(t => new { t.TenantId, t.Year, t.Status });
    }
}

public class SalesTargetPeriodConfiguration : IEntityTypeConfiguration<SalesTargetPeriod>
{
    public void Configure(EntityTypeBuilder<SalesTargetPeriod> builder)
    {
        builder.ToTable("SalesTargetPeriods", "sales");

        builder.HasKey(p => p.Id);

        builder.OwnsOne(p => p.TargetAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TargetAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TargetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(p => p.ActualAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ActualAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ActualCurrency").HasMaxLength(3);
        });

        builder.Property(p => p.TargetQuantity).HasPrecision(18, 4);
        builder.Property(p => p.ActualQuantity).HasPrecision(18, 4);

        builder.HasIndex(p => new { p.SalesTargetId, p.PeriodNumber }).IsUnique();
    }
}

public class SalesTargetProductConfiguration : IEntityTypeConfiguration<SalesTargetProduct>
{
    public void Configure(EntityTypeBuilder<SalesTargetProduct> builder)
    {
        builder.ToTable("SalesTargetProducts", "sales");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.ProductCode).IsRequired().HasMaxLength(50);
        builder.Property(p => p.ProductName).IsRequired().HasMaxLength(200);

        builder.OwnsOne(p => p.TargetAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TargetAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("TargetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(p => p.ActualAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ActualAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("ActualCurrency").HasMaxLength(3);
        });

        builder.Property(p => p.TargetQuantity).HasPrecision(18, 4);
        builder.Property(p => p.ActualQuantity).HasPrecision(18, 4);
        builder.Property(p => p.Weight).HasPrecision(5, 2);

        builder.HasIndex(p => new { p.SalesTargetId, p.ProductId }).IsUnique();
    }
}

public class SalesTargetAchievementConfiguration : IEntityTypeConfiguration<SalesTargetAchievement>
{
    public void Configure(EntityTypeBuilder<SalesTargetAchievement> builder)
    {
        builder.ToTable("SalesTargetAchievements", "sales");

        builder.HasKey(a => a.Id);

        builder.OwnsOne(a => a.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.Property(a => a.Quantity).HasPrecision(18, 4);

        builder.HasIndex(a => a.SalesTargetId);
        builder.HasIndex(a => a.AchievementDate);
        builder.HasIndex(a => a.SalesOrderId);
    }
}
