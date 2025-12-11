using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class CompetitorConfiguration : IEntityTypeConfiguration<Competitor>
{
    public void Configure(EntityTypeBuilder<Competitor> builder)
    {
        builder.ToTable("Competitors", "crm");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Code)
            .HasMaxLength(50);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        builder.Property(c => c.Website)
            .HasMaxLength(500);

        builder.Property(c => c.Headquarters)
            .HasMaxLength(500);

        builder.Property(c => c.EmployeeCount)
            .HasMaxLength(50);

        builder.Property(c => c.AnnualRevenue)
            .HasMaxLength(100);

        builder.Property(c => c.MarketShare)
            .HasPrecision(5, 2);

        builder.Property(c => c.TargetMarkets)
            .HasMaxLength(1000);

        builder.Property(c => c.Industries)
            .HasMaxLength(500);

        builder.Property(c => c.GeographicCoverage)
            .HasMaxLength(500);

        builder.Property(c => c.CustomerSegments)
            .HasMaxLength(500);

        builder.Property(c => c.PricingStrategy)
            .HasMaxLength(1000);

        builder.Property(c => c.PriceRange)
            .HasMaxLength(200);

        builder.Property(c => c.SalesChannels)
            .HasMaxLength(500);

        builder.Property(c => c.MarketingStrategy)
            .HasMaxLength(2000);

        builder.Property(c => c.KeyMessage)
            .HasMaxLength(1000);

        builder.Property(c => c.SocialMediaLinks)
            .HasMaxLength(1000);

        builder.Property(c => c.ContactPerson)
            .HasMaxLength(200);

        builder.Property(c => c.Email)
            .HasMaxLength(255);

        builder.Property(c => c.Phone)
            .HasMaxLength(50);

        builder.Property(c => c.SwotSummary)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.CompetitiveStrategy)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.WinStrategy)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.LossReasons)
            .HasMaxLength(2000);

        builder.Property(c => c.AnalyzedBy)
            .HasMaxLength(200);

        builder.Property(c => c.Notes)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.Tags)
            .HasMaxLength(500);

        // Relationships
        builder.HasMany(c => c.Products)
            .WithOne(p => p.Competitor)
            .HasForeignKey(p => p.CompetitorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Strengths)
            .WithOne(s => s.Competitor)
            .HasForeignKey(s => s.CompetitorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Weaknesses)
            .WithOne(w => w.Competitor)
            .HasForeignKey(w => w.CompetitorId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.Name });
        builder.HasIndex(c => new { c.TenantId, c.IsActive });
        builder.HasIndex(c => new { c.TenantId, c.ThreatLevel });
    }
}

public class CompetitorProductConfiguration : IEntityTypeConfiguration<CompetitorProduct>
{
    public void Configure(EntityTypeBuilder<CompetitorProduct> builder)
    {
        builder.ToTable("CompetitorProducts", "crm");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.PriceRange)
            .HasMaxLength(100);

        builder.Property(p => p.Features)
            .HasColumnType("nvarchar(max)");

        builder.Property(p => p.Differentiators)
            .HasMaxLength(2000);

        builder.Property(p => p.OurAdvantage)
            .HasMaxLength(2000);

        builder.Property(p => p.OurDisadvantage)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.CompetitorId, p.ProductName });
    }
}

public class CompetitorStrengthConfiguration : IEntityTypeConfiguration<CompetitorStrength>
{
    public void Configure(EntityTypeBuilder<CompetitorStrength> builder)
    {
        builder.ToTable("CompetitorStrengths", "crm");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(s => s.CounterStrategy)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => s.CompetitorId);
    }
}

public class CompetitorWeaknessConfiguration : IEntityTypeConfiguration<CompetitorWeakness>
{
    public void Configure(EntityTypeBuilder<CompetitorWeakness> builder)
    {
        builder.ToTable("CompetitorWeaknesses", "crm");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Id)
            .ValueGeneratedNever();

        builder.Property(w => w.TenantId)
            .IsRequired();

        builder.Property(w => w.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(w => w.ExploitStrategy)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(w => w.TenantId);
        builder.HasIndex(w => w.CompetitorId);
    }
}
