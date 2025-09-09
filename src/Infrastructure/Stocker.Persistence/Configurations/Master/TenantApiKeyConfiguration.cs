using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantApiKeyConfiguration : IEntityTypeConfiguration<TenantApiKey>
{
    public void Configure(EntityTypeBuilder<TenantApiKey> builder)
    {
        builder.ToTable("TenantApiKeys", "Master");

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

        builder.Property(x => x.Key)
            .HasColumnName("Key")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnName("Description")
            .HasMaxLength(500);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.LastUsedAt)
            .HasColumnName("LastUsedAt");

        builder.Property(x => x.ExpiresAt)
            .HasColumnName("ExpiresAt");

        builder.Property(x => x.IsActive)
            .HasColumnName("IsActive")
            .IsRequired();

        builder.Property(x => x.AllowedIpAddresses)
            .HasColumnName("AllowedIpAddresses")
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Scopes)
            .HasColumnName("Scopes")
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.RateLimit)
            .HasColumnName("RateLimit");

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
            .HasDatabaseName("IX_TenantApiKeys_TenantId");

        builder.HasIndex(x => x.Key)
            .HasDatabaseName("IX_TenantApiKeys_Key")
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.IsActive })
            .HasDatabaseName("IX_TenantApiKeys_TenantId_IsActive");
    }
}