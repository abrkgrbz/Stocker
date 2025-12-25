using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesPipelineConfiguration : IEntityTypeConfiguration<SalesPipeline>
{
    public void Configure(EntityTypeBuilder<SalesPipeline> builder)
    {
        builder.ToTable("SalesPipelines", "sales");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Metrics
        builder.Property(p => p.TotalPipelineValue)
            .HasPrecision(18, 2);

        builder.Property(p => p.AverageConversionRate)
            .HasPrecision(5, 2);

        // Audit
        builder.Property(p => p.CreatedByName)
            .HasMaxLength(200);

        // Navigation
        builder.HasMany(p => p.Stages)
            .WithOne()
            .HasForeignKey(s => s.PipelineId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.Code);
        builder.HasIndex(p => new { p.TenantId, p.Code }).IsUnique();
        builder.HasIndex(p => p.IsDefault);
        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => new { p.TenantId, p.IsDefault });
    }
}

public class PipelineStageConfiguration : IEntityTypeConfiguration<PipelineStage>
{
    public void Configure(EntityTypeBuilder<PipelineStage> builder)
    {
        builder.ToTable("PipelineStages", "sales");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(1000);

        builder.Property(s => s.Category)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Metrics
        builder.Property(s => s.StageValue)
            .HasPrecision(18, 2);

        // Requirements - Store as JSON
        builder.Property(s => s.RequiredDocuments)
            .HasConversion(
                v => string.Join(";;", v),
                v => v.Split(";;", StringSplitOptions.RemoveEmptyEntries).ToList());

        builder.Property(s => s.RequiredActions)
            .HasConversion(
                v => string.Join(";;", v),
                v => v.Split(";;", StringSplitOptions.RemoveEmptyEntries).ToList());

        // Visual
        builder.Property(s => s.Color)
            .HasMaxLength(20);

        builder.Property(s => s.Icon)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => s.PipelineId);
        builder.HasIndex(s => new { s.PipelineId, s.OrderIndex });
        builder.HasIndex(s => new { s.PipelineId, s.Code }).IsUnique();
        builder.HasIndex(s => s.Category);
    }
}
