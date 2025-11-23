using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class PackageConfiguration : BaseEntityTypeConfiguration<Package>
{
    public override void Configure(EntityTypeBuilder<Package> builder)
    {
        base.Configure(builder);

        builder.ToTable("Packages", "master");

        // Properties
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.IsActive)
            .IsRequired();

        builder.Property(p => p.IsPublic)
            .IsRequired();

        builder.Property(p => p.TrialDays)
            .IsRequired();

        builder.Property(p => p.DisplayOrder)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Value Objects
        builder.OwnsOne(p => p.BasePrice, price =>
        {
            price.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("BasePriceAmount");

            price.Property(m => m.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("BasePriceCurrency");
        });

        builder.OwnsOne(p => p.Limits, limits =>
        {
            limits.Property(l => l.MaxUsers)
                .IsRequired()
                .HasColumnName("MaxUsers");

            limits.Property(l => l.MaxStorage)
                .IsRequired()
                .HasColumnName("MaxStorageGB");

            limits.Property(l => l.MaxProjects)
                .IsRequired()
                .HasColumnName("MaxProjects");

            limits.Property(l => l.MaxApiCalls)
                .IsRequired()
                .HasColumnName("MaxApiCallsPerMonth");

            limits.Property(l => l.ModuleLimits)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, int>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, int>())
                .HasColumnName("ModuleLimits")
                .HasColumnType("text");
        });

        // Relationships
        builder.HasMany(p => p.Features)
            .WithOne()
            .HasForeignKey(f => f.PackageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Modules)
            .WithOne()
            .HasForeignKey(m => m.PackageId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.Type)
            .HasDatabaseName("IX_Packages_Type");

        builder.HasIndex(p => p.IsActive)
            .HasDatabaseName("IX_Packages_IsActive");

        builder.HasIndex(p => new { p.IsPublic, p.DisplayOrder })
            .HasDatabaseName("IX_Packages_IsPublic_DisplayOrder");
    }
}