using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.GeoLocation;

namespace Stocker.Persistence.Configurations.Master;

public class DistrictConfiguration : BaseEntityTypeConfiguration<District>
{
    public override void Configure(EntityTypeBuilder<District> builder)
    {
        base.Configure(builder);

        builder.ToTable("Districts", "master");

        // Properties
        builder.Property(d => d.CityId)
            .IsRequired();

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.PostalCode)
            .HasMaxLength(10);

        builder.Property(d => d.Latitude)
            .HasPrecision(10, 7);

        builder.Property(d => d.Longitude)
            .HasPrecision(10, 7);

        builder.Property(d => d.Population);

        builder.Property(d => d.IsCentral)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(d => d.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(d => d.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(d => d.CityId)
            .HasDatabaseName("IX_Districts_CityId");

        builder.HasIndex(d => d.Name)
            .HasDatabaseName("IX_Districts_Name");

        builder.HasIndex(d => d.PostalCode)
            .HasDatabaseName("IX_Districts_PostalCode");

        builder.HasIndex(d => d.IsCentral)
            .HasDatabaseName("IX_Districts_IsCentral");

        builder.HasIndex(d => d.IsActive)
            .HasDatabaseName("IX_Districts_IsActive");

        builder.HasIndex(d => new { d.CityId, d.Name })
            .IsUnique()
            .HasDatabaseName("IX_Districts_CityId_Name");

        // Relationships
        builder.HasOne(d => d.City)
            .WithMany(city => city.Districts)
            .HasForeignKey(d => d.CityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
