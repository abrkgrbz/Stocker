using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Master;

public class TenantFeatureConfiguration : BaseEntityTypeConfiguration<TenantFeature>
{
    public override void Configure(EntityTypeBuilder<TenantFeature> builder)
    {
        base.Configure(builder);

        builder.ToTable("TenantFeatures", "master");

        // Properties
        builder.Property(tf => tf.TenantId)
            .IsRequired();

        builder.Property(tf => tf.FeatureCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(tf => tf.IsEnabled)
            .IsRequired();

        builder.Property(tf => tf.EnabledAt)
            .IsRequired();

        // Configuration as JSON
        builder.Property(tf => tf.Configuration)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions?)null) ?? new Dictionary<string, string>())
            .HasColumnType("nvarchar(max)");

        // Indexes
        builder.HasIndex(tf => new { tf.TenantId, tf.FeatureCode })
            .IsUnique()
            .HasDatabaseName("IX_TenantFeatures_TenantId_FeatureCode");

        builder.HasIndex(tf => tf.IsEnabled)
            .HasDatabaseName("IX_TenantFeatures_IsEnabled");
    }
}