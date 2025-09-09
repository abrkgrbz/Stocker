using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantIntegrationConfiguration : IEntityTypeConfiguration<TenantIntegration>
{
    public void Configure(EntityTypeBuilder<TenantIntegration> builder)
    {
        builder.ToTable("TenantIntegrations", "Master");

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

        builder.Property(x => x.Type)
            .HasColumnName("Type")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnName("Description")
            .HasMaxLength(500);

        builder.Property(x => x.Configuration)
            .HasColumnName("Configuration")
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasColumnName("IsActive")
            .IsRequired();

        builder.Property(x => x.IsConnected)
            .HasColumnName("IsConnected")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.LastSyncAt)
            .HasColumnName("LastSyncAt");

        builder.Property(x => x.LastSyncStatus)
            .HasColumnName("LastSyncStatus")
            .HasMaxLength(100);

        builder.Property(x => x.LastError)
            .HasColumnName("LastError")
            .HasMaxLength(1000);

        builder.Property(x => x.CreatedBy)
            .HasColumnName("CreatedBy")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.WebhookUrl)
            .HasColumnName("WebhookUrl")
            .HasMaxLength(500);

        builder.Property(x => x.ApiKey)
            .HasColumnName("ApiKey")
            .HasMaxLength(500);

        builder.Property(x => x.RefreshToken)
            .HasColumnName("RefreshToken")
            .HasMaxLength(1000);

        builder.Property(x => x.TokenExpiresAt)
            .HasColumnName("TokenExpiresAt");

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantIntegrations_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.Type })
            .HasDatabaseName("IX_TenantIntegrations_TenantId_Type");

        builder.HasIndex(x => new { x.TenantId, x.IsActive, x.IsConnected })
            .HasDatabaseName("IX_TenantIntegrations_TenantId_IsActive_IsConnected");
    }
}