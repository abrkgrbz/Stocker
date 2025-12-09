using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class ModuleDefinitionConfiguration : IEntityTypeConfiguration<ModuleDefinition>
{
    public void Configure(EntityTypeBuilder<ModuleDefinition> builder)
    {
        builder.ToTable("ModuleDefinitions");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(m => m.Code)
            .IsUnique();

        builder.Property(m => m.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(m => m.Description)
            .HasMaxLength(500);

        builder.Property(m => m.Icon)
            .HasMaxLength(100);

        builder.Property(m => m.Category)
            .HasMaxLength(50);

        builder.OwnsOne(m => m.MonthlyPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("MonthlyPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("MonthlyPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.Property(m => m.IsCore)
            .HasDefaultValue(false);

        builder.Property(m => m.IsActive)
            .HasDefaultValue(true);

        builder.Property(m => m.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        // Features relationship
        builder.HasMany(m => m.Features)
            .WithOne()
            .HasForeignKey(f => f.ModuleDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Dependencies relationship
        builder.HasMany(m => m.Dependencies)
            .WithOne()
            .HasForeignKey(d => d.ModuleDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ModuleFeatureConfiguration : IEntityTypeConfiguration<ModuleFeature>
{
    public void Configure(EntityTypeBuilder<ModuleFeature> builder)
    {
        builder.ToTable("ModuleFeatures");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FeatureName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(f => f.Description)
            .HasMaxLength(500);
    }
}

public class ModuleDependencyConfiguration : IEntityTypeConfiguration<ModuleDependency>
{
    public void Configure(EntityTypeBuilder<ModuleDependency> builder)
    {
        builder.ToTable("ModuleDependencies");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.DependentModuleCode)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(d => new { d.ModuleDefinitionId, d.DependentModuleCode })
            .IsUnique();
    }
}
