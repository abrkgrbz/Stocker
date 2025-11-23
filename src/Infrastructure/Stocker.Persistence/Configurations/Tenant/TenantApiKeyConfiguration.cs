using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantApiKeyConfiguration : IEntityTypeConfiguration<TenantApiKey>
{
    public void Configure(EntityTypeBuilder<TenantApiKey> builder)
    {
        // Table name
        builder.ToTable("TenantApiKeys");
        
        // Primary key
        builder.HasKey(k => k.Id);
        
        // Key Information
        builder.Property(k => k.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(k => k.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(k => k.KeyPrefix)
            .IsRequired()
            .HasMaxLength(8);
            
        builder.Property(k => k.HashedKey)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(k => k.EncryptedKey)
            .HasMaxLength(512);
            
        // Permissions & Scopes - JSON arrays
        builder.Property(k => k.KeyType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(k => k.Scopes)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(k => k.AllowedEndpoints)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(k => k.AllowedMethods)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        // Access Control - JSON arrays
        builder.Property(k => k.AllowedIpAddresses)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(k => k.AllowedDomains)
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
            .HasColumnType("text");
            
        builder.Property(k => k.RateLimitPerMinute);
        builder.Property(k => k.RateLimitPerHour);
        builder.Property(k => k.RateLimitPerDay);
        
        // Usage Tracking
        builder.Property(k => k.UsageCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(k => k.LastUsedAt);
        
        builder.Property(k => k.LastUsedIp)
            .HasMaxLength(45);
            
        builder.Property(k => k.LastUsedUserAgent)
            .HasMaxLength(500);
            
        // Lifecycle
        builder.Property(k => k.CreatedAt)
            .IsRequired();
            
        builder.Property(k => k.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(k => k.ExpiresAt);
        
        builder.Property(k => k.RevokedAt);
        
        builder.Property(k => k.RevokedBy)
            .HasMaxLength(100);
            
        builder.Property(k => k.RevocationReason)
            .HasMaxLength(500);
            
        // Status
        builder.Property(k => k.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(k => k.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(k => k.RequireHttps)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Metadata
        builder.Property(k => k.Environment)
            .HasMaxLength(50);
            
        builder.Property(k => k.AssociatedUserId)
            .HasMaxLength(100);
            
        builder.Property(k => k.AssociatedApplication)
            .HasMaxLength(100);
            
        builder.Property(k => k.Metadata)
            .HasColumnType("text");
            
        // Indexes
        builder.HasIndex(k => k.KeyPrefix)
            .HasDatabaseName("IX_TenantApiKeys_KeyPrefix");
            
        builder.HasIndex(k => k.Name)
            .HasDatabaseName("IX_TenantApiKeys_Name")
            .IsUnique();
            
        builder.HasIndex(k => k.Status)
            .HasDatabaseName("IX_TenantApiKeys_Status");
            
        builder.HasIndex(k => k.IsActive)
            .HasDatabaseName("IX_TenantApiKeys_IsActive");
            
        builder.HasIndex(k => k.KeyType)
            .HasDatabaseName("IX_TenantApiKeys_KeyType");
            
        builder.HasIndex(k => k.CreatedAt)
            .HasDatabaseName("IX_TenantApiKeys_CreatedAt");
            
        builder.HasIndex(k => k.ExpiresAt)
            .HasDatabaseName("IX_TenantApiKeys_ExpiresAt");
            
        builder.HasIndex(k => new { k.IsActive, k.Status })
            .HasDatabaseName("IX_TenantApiKeys_IsActive_Status");
            
        builder.HasIndex(k => k.AssociatedUserId)
            .HasDatabaseName("IX_TenantApiKeys_AssociatedUserId");
            
        builder.HasIndex(k => k.Environment)
            .HasDatabaseName("IX_TenantApiKeys_Environment");
    }
}