using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.GeoLocation;

namespace Stocker.Persistence.Configurations.Master;

public class CountryConfiguration : BaseEntityTypeConfiguration<Country>
{
    public override void Configure(EntityTypeBuilder<Country> builder)
    {
        base.Configure(builder);

        builder.ToTable("Countries", "master");

        // Properties
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.NameEn)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(2);

        builder.Property(c => c.Code3)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.PhoneCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(c => c.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(c => c.Code)
            .IsUnique()
            .HasDatabaseName("IX_Countries_Code");

        builder.HasIndex(c => c.Code3)
            .IsUnique()
            .HasDatabaseName("IX_Countries_Code3");

        builder.HasIndex(c => c.Name)
            .HasDatabaseName("IX_Countries_Name");

        builder.HasIndex(c => c.IsActive)
            .HasDatabaseName("IX_Countries_IsActive");

        builder.HasIndex(c => c.DisplayOrder)
            .HasDatabaseName("IX_Countries_DisplayOrder");

        // Relationships
        builder.HasMany(c => c.Cities)
            .WithOne(city => city.Country)
            .HasForeignKey(city => city.CountryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
