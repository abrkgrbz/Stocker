using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class PackageFeatureConfiguration : BaseEntityTypeConfiguration<PackageFeature>
{
    public override void Configure(EntityTypeBuilder<PackageFeature> builder)
    {
        base.Configure(builder);

        builder.ToTable("PackageFeatures", "master");

        // Properties
        builder.Property(pf => pf.PackageId)
            .IsRequired();

        builder.Property(pf => pf.FeatureCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pf => pf.FeatureName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pf => pf.Description)
            .HasMaxLength(500);

        builder.Property(pf => pf.IsHighlighted)
            .IsRequired();

        builder.Property(pf => pf.DisplayOrder)
            .IsRequired();

        // Indexes
        builder.HasIndex(pf => new { pf.PackageId, pf.FeatureCode })
            .IsUnique()
            .HasDatabaseName("IX_PackageFeatures_PackageId_FeatureCode");

        builder.HasIndex(pf => pf.PackageId)
            .HasDatabaseName("IX_PackageFeatures_PackageId");
    }
}