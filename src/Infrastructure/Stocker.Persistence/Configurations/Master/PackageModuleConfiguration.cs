using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class PackageModuleConfiguration : BaseEntityTypeConfiguration<PackageModule>
{
    public override void Configure(EntityTypeBuilder<PackageModule> builder)
    {
        base.Configure(builder);

        builder.ToTable("PackageModules", "master");

        // Properties
        builder.Property(pm => pm.PackageId)
            .IsRequired();

        builder.Property(pm => pm.ModuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pm => pm.ModuleName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pm => pm.IsIncluded)
            .IsRequired();

        // Indexes
        builder.HasIndex(pm => new { pm.PackageId, pm.ModuleCode })
            .IsUnique()
            .HasDatabaseName("IX_PackageModules_PackageId_ModuleCode");

        builder.HasIndex(pm => pm.PackageId)
            .HasDatabaseName("IX_PackageModules_PackageId");
    }
}