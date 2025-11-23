using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantActivityLogConfiguration : IEntityTypeConfiguration<TenantActivityLog>
{
    public void Configure(EntityTypeBuilder<TenantActivityLog> builder)
    {
        // Table name
        builder.ToTable("TenantActivityLogs");
        
        // Primary key
        builder.HasKey(l => l.Id);
        
        // Properties
        builder.Property(l => l.ActivityType)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(l => l.EntityType)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(l => l.EntityId);
        
        builder.Property(l => l.Action)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(l => l.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        // User information
        builder.Property(l => l.UserId)
            .IsRequired();
            
        builder.Property(l => l.UserName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(l => l.UserEmail)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(l => l.UserRole)
            .HasMaxLength(50);
            
        // Context information
        builder.Property(l => l.IpAddress)
            .HasMaxLength(45); // IPv6 max length
            
        builder.Property(l => l.UserAgent)
            .HasMaxLength(500);
            
        builder.Property(l => l.SessionId)
            .HasMaxLength(100);
            
        builder.Property(l => l.RequestId)
            .HasMaxLength(100);
            
        // Data tracking - JSON columns
        builder.Property(l => l.OldData)
            .HasColumnType("text");
            
        builder.Property(l => l.NewData)
            .HasColumnType("text");
            
        builder.Property(l => l.Changes)
            .HasColumnType("text");
            
        builder.Property(l => l.AdditionalData)
            .HasColumnType("text");
            
        // Result information
        builder.Property(l => l.IsSuccess)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(l => l.ErrorMessage)
            .HasMaxLength(1000);
            
        builder.Property(l => l.ErrorDetails)
            .HasColumnType("text");
            
        builder.Property(l => l.HttpStatusCode);
        
        // Timing
        builder.Property(l => l.ActivityAt)
            .IsRequired();
            
        builder.Property(l => l.Duration);
        
        // Categorization
        builder.Property(l => l.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(l => l.Severity)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(l => l.IsSystemGenerated)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Indexes
        builder.HasIndex(l => l.ActivityAt)
            .HasDatabaseName("IX_TenantActivityLogs_ActivityAt")
            .IsDescending();
            
        builder.HasIndex(l => l.UserId)
            .HasDatabaseName("IX_TenantActivityLogs_UserId");
            
        builder.HasIndex(l => l.EntityId)
            .HasDatabaseName("IX_TenantActivityLogs_EntityId");
            
        builder.HasIndex(l => new { l.EntityType, l.EntityId })
            .HasDatabaseName("IX_TenantActivityLogs_EntityType_EntityId");
            
        builder.HasIndex(l => l.ActivityType)
            .HasDatabaseName("IX_TenantActivityLogs_ActivityType");
            
        builder.HasIndex(l => l.Category)
            .HasDatabaseName("IX_TenantActivityLogs_Category");
            
        builder.HasIndex(l => l.Severity)
            .HasDatabaseName("IX_TenantActivityLogs_Severity");
            
        builder.HasIndex(l => l.IsSuccess)
            .HasDatabaseName("IX_TenantActivityLogs_IsSuccess");
            
        builder.HasIndex(l => new { l.UserId, l.ActivityAt })
            .HasDatabaseName("IX_TenantActivityLogs_UserId_ActivityAt")
            .IsDescending(false, true);
    }
}