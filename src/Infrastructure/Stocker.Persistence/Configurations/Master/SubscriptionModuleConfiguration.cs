using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class SubscriptionModuleConfiguration : BaseEntityTypeConfiguration<SubscriptionModule>
{
    public override void Configure(EntityTypeBuilder<SubscriptionModule> builder)
    {
        base.Configure(builder);

        builder.ToTable("SubscriptionModules", "master");

        builder.Property(m => m.SubscriptionId)
            .IsRequired();

        builder.Property(m => m.ModuleCode)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(m => m.ModuleName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(m => m.MaxEntities);

        builder.Property(m => m.AddedAt)
            .IsRequired();

        // Index for faster lookups
        builder.HasIndex(m => m.SubscriptionId)
            .HasDatabaseName("IX_SubscriptionModules_SubscriptionId");

        builder.HasIndex(m => new { m.SubscriptionId, m.ModuleCode })
            .IsUnique()
            .HasDatabaseName("IX_SubscriptionModules_SubscriptionId_ModuleCode");
    }
}
