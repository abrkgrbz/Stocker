using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Entities.Migration;

namespace Stocker.Persistence.Configurations.Master;

public class ScheduledMigrationConfiguration : IEntityTypeConfiguration<ScheduledMigration>
{
    public void Configure(EntityTypeBuilder<ScheduledMigration> builder)
    {
        builder.ToTable("ScheduledMigrations", "dbo");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScheduleId)
            .IsRequired();

        builder.Property(x => x.TenantId)
            .IsRequired();

        builder.Property(x => x.ScheduledTime)
            .IsRequired();

        builder.Property(x => x.MigrationName)
            .HasMaxLength(200);

        builder.Property(x => x.ModuleName)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Error)
            .HasMaxLength(2000);

        builder.Property(x => x.HangfireJobId)
            .HasMaxLength(100);

        builder.HasIndex(x => x.ScheduleId)
            .IsUnique();

        builder.HasIndex(x => x.TenantId);

        builder.HasIndex(x => x.Status);

        builder.HasIndex(x => x.ScheduledTime);
    }
}
