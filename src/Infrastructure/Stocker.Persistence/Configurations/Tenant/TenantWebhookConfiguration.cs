using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantWebhookConfiguration : BaseEntityTypeConfiguration<TenantWebhook>
{
    public override void Configure(EntityTypeBuilder<TenantWebhook> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("TenantWebhooks", "tenant");
        
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(x => x.Url)
            .HasMaxLength(500)
            .IsRequired();
            
        builder.Property(x => x.Secret)
            .HasMaxLength(500)
            .IsRequired();
            
        builder.Property(x => x.EventType)
            .IsRequired();
            
        builder.Property(x => x.IsActive)
            .IsRequired();
            
        builder.Property(x => x.Description)
            .HasMaxLength(1000);
            
        // Webhook Configuration
        builder.Property(x => x.HttpMethod)
            .HasMaxLength(10)
            .IsRequired();
            
        builder.Property(x => x.ContentType)
            .HasMaxLength(100);
            
        builder.Property(x => x.Headers)
            .HasColumnType("text");
            
        builder.Property(x => x.TimeoutSeconds)
            .IsRequired();
            
        builder.Property(x => x.MaxRetries)
            .IsRequired();
            
        builder.Property(x => x.RetryDelaySeconds)
            .IsRequired();
            
        // Authentication
        builder.Property(x => x.AuthType)
            .IsRequired();
            
        builder.Property(x => x.AuthToken)
            .HasMaxLength(500);
            
        builder.Property(x => x.AuthHeaderName)
            .HasMaxLength(100);
            
        builder.Property(x => x.BasicAuthUsername)
            .HasMaxLength(200);
            
        builder.Property(x => x.BasicAuthPassword)
            .HasMaxLength(500);
            
        // Filtering & Conditions
        builder.Property(x => x.EventFilters)
            .HasColumnType("text");
            
        builder.Property(x => x.PayloadTemplate)
            .HasColumnType("text");
            
        builder.Property(x => x.OnlyOnSuccess)
            .IsRequired();
            
        builder.Property(x => x.IncludePayload)
            .IsRequired();
            
        // Rate Limiting
        builder.Property(x => x.RateLimitPerMinute);
        
        builder.Property(x => x.LastTriggeredAt);
        
        builder.Property(x => x.TriggerCount)
            .IsRequired();
            
        // Statistics
        builder.Property(x => x.SuccessCount)
            .IsRequired();
            
        builder.Property(x => x.FailureCount)
            .IsRequired();
            
        builder.Property(x => x.LastSuccessAt);
        
        builder.Property(x => x.LastFailureAt);
        
        builder.Property(x => x.LastError)
            .HasMaxLength(2000);
            
        builder.Property(x => x.AverageResponseTime)
            .HasPrecision(10, 2)
            .IsRequired();
            
        // Audit
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.ModifiedAt);
        
        builder.Property(x => x.ModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.DeactivatedAt);
        
        builder.Property(x => x.DeactivatedBy)
            .HasMaxLength(100);
        
        // Indexes
        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.EventType);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.LastTriggeredAt);
        builder.HasIndex(x => new { x.EventType, x.IsActive });
    }
}