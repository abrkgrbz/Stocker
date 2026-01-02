using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.GeoLocation;

namespace Stocker.Persistence.Configurations.Master;

public class CityConfiguration : BaseEntityTypeConfiguration<City>
{
    public override void Configure(EntityTypeBuilder<City> builder)
    {
        base.Configure(builder);

        builder.ToTable("Cities", "master");

        // Properties
        builder.Property(c => c.CountryId)
            .IsRequired();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.PlateCode)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(c => c.AreaCode)
            .HasMaxLength(10);

        builder.Property(c => c.Region)
            .HasMaxLength(50);

        builder.Property(c => c.Latitude)
            .HasPrecision(10, 7);

        builder.Property(c => c.Longitude)
            .HasPrecision(10, 7);

        builder.Property(c => c.Population);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(c => c.CountryId)
            .HasDatabaseName("IX_Cities_CountryId");

        builder.HasIndex(c => c.Name)
            .HasDatabaseName("IX_Cities_Name");

        builder.HasIndex(c => c.PlateCode)
            .HasDatabaseName("IX_Cities_PlateCode");

        builder.HasIndex(c => c.Region)
            .HasDatabaseName("IX_Cities_Region");

        builder.HasIndex(c => c.IsActive)
            .HasDatabaseName("IX_Cities_IsActive");

        builder.HasIndex(c => new { c.CountryId, c.PlateCode })
            .IsUnique()
            .HasDatabaseName("IX_Cities_CountryId_PlateCode");

        builder.HasIndex(c => new { c.CountryId, c.Name })
            .HasDatabaseName("IX_Cities_CountryId_Name");

        // Relationships
        builder.HasOne(c => c.Country)
            .WithMany(country => country.Cities)
            .HasForeignKey(c => c.CountryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Districts)
            .WithOne(district => district.City)
            .HasForeignKey(district => district.CityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
