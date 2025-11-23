using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantIntegrationConfiguration : IEntityTypeConfiguration<TenantIntegration>
{
    public void Configure(EntityTypeBuilder<TenantIntegration> builder)
    {
        builder.ToTable("TenantIntegrations");
        
        builder.HasKey(i => i.Id);
        
        builder.Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(i => i.Type)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(i => i.Description)
            .HasMaxLength(1000);
            
        builder.Property(i => i.Configuration)
            .IsRequired()
            .HasColumnType("text");
            
        builder.Property(i => i.IsActive)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(i => i.IsConnected)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(i => i.CreatedAt)
            .IsRequired();
            
        builder.Property(i => i.LastSyncAt);
        
        builder.Property(i => i.LastSyncStatus)
            .HasMaxLength(100);
            
        builder.Property(i => i.LastError)
            .HasMaxLength(2000);
            
        builder.Property(i => i.CreatedBy)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(i => i.WebhookUrl)
            .HasMaxLength(1000);
            
        builder.Property(i => i.ApiKey)
            .HasMaxLength(500);
            
        builder.Property(i => i.RefreshToken)
            .HasMaxLength(2000);
            
        builder.Property(i => i.TokenExpiresAt);
        
        // Indexes
        builder.HasIndex(i => i.Name)
            .HasDatabaseName("IX_TenantIntegrations_Name");
            
        builder.HasIndex(i => i.Type)
            .HasDatabaseName("IX_TenantIntegrations_Type");
            
        builder.HasIndex(i => i.IsActive)
            .HasDatabaseName("IX_TenantIntegrations_IsActive");
            
        builder.HasIndex(i => i.IsConnected)
            .HasDatabaseName("IX_TenantIntegrations_IsConnected");
    }
}