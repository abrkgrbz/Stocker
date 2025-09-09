using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantWebhookConfiguration : IEntityTypeConfiguration<TenantWebhook>
{
    public void Configure(EntityTypeBuilder<TenantWebhook> builder)
    {
        builder.ToTable("TenantWebhooks", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("Name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Url)
            .HasColumnName("Url")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnName("Description")
            .HasMaxLength(500);

        builder.Property(x => x.Events)
            .HasColumnName("Events")
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(x => x.Headers)
            .HasColumnName("Headers")
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Secret)
            .HasColumnName("Secret")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasColumnName("IsActive")
            .IsRequired();

        builder.Property(x => x.MaxRetries)
            .HasColumnName("MaxRetries")
            .IsRequired()
            .HasDefaultValue(3);

        builder.Property(x => x.TimeoutSeconds)
            .HasColumnName("TimeoutSeconds")
            .IsRequired()
            .HasDefaultValue(30);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.LastTriggeredAt)
            .HasColumnName("LastTriggeredAt");

        builder.Property(x => x.LastStatus)
            .HasColumnName("LastStatus")
            .HasMaxLength(500);

        builder.Property(x => x.FailureCount)
            .HasColumnName("FailureCount")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.SuccessCount)
            .HasColumnName("SuccessCount")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.CreatedBy)
            .HasColumnName("CreatedBy")
            .HasMaxLength(100)
            .IsRequired();

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantWebhooks_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.IsActive })
            .HasDatabaseName("IX_TenantWebhooks_TenantId_IsActive");

        builder.HasIndex(x => new { x.TenantId, x.Name })
            .HasDatabaseName("IX_TenantWebhooks_TenantId_Name")
            .IsUnique();
    }
}