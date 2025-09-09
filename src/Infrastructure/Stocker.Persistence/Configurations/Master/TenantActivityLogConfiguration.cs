using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantActivityLogConfiguration : IEntityTypeConfiguration<TenantActivityLog>
{
    public void Configure(EntityTypeBuilder<TenantActivityLog> builder)
    {
        builder.ToTable("TenantActivityLogs", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        builder.Property(x => x.ActivityType)
            .HasColumnName("ActivityType")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.ActivityDescription)
            .HasColumnName("ActivityDescription")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.EntityType)
            .HasColumnName("EntityType")
            .HasMaxLength(100);

        builder.Property(x => x.EntityId)
            .HasColumnName("EntityId");

        builder.Property(x => x.OldValues)
            .HasColumnName("OldValues")
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.NewValues)
            .HasColumnName("NewValues")
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.IpAddress)
            .HasColumnName("IpAddress")
            .HasMaxLength(50);

        builder.Property(x => x.UserAgent)
            .HasColumnName("UserAgent")
            .HasMaxLength(500);

        builder.Property(x => x.UserId)
            .HasColumnName("UserId")
            .HasMaxLength(100);

        builder.Property(x => x.UserName)
            .HasColumnName("UserName")
            .HasMaxLength(200);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.Severity)
            .HasColumnName("Severity")
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("Info");

        builder.Property(x => x.AdditionalData)
            .HasColumnName("AdditionalData")
            .HasColumnType("nvarchar(max)");

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantActivityLogs_TenantId");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_TenantActivityLogs_CreatedAt");

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt })
            .HasDatabaseName("IX_TenantActivityLogs_TenantId_CreatedAt");

        builder.HasIndex(x => new { x.TenantId, x.ActivityType })
            .HasDatabaseName("IX_TenantActivityLogs_TenantId_ActivityType");

        builder.HasIndex(x => new { x.TenantId, x.EntityType, x.EntityId })
            .HasDatabaseName("IX_TenantActivityLogs_TenantId_EntityType_EntityId");

        builder.HasIndex(x => new { x.TenantId, x.UserId })
            .HasDatabaseName("IX_TenantActivityLogs_TenantId_UserId");
    }
}