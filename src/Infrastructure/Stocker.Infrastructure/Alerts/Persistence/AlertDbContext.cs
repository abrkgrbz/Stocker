using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Stocker.Infrastructure.Alerts.Domain;

namespace Stocker.Infrastructure.Alerts.Persistence;

/// <summary>
/// DbContext for the central alert system.
/// Uses the shared database with a dedicated schema.
/// </summary>
public class AlertDbContext : DbContext
{
    public AlertDbContext(DbContextOptions<AlertDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);

        // Suppress PendingModelChangesWarning - we handle migrations separately
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    public DbSet<AlertEntity> Alerts => Set<AlertEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Use dedicated schema for alerts
        modelBuilder.HasDefaultSchema("alerts");

        modelBuilder.Entity<AlertEntity>(entity =>
        {
            entity.ToTable("Alerts");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.TenantId)
                .IsRequired();

            entity.Property(e => e.Category)
                .IsRequired()
                .HasConversion<int>();

            entity.Property(e => e.Severity)
                .IsRequired()
                .HasConversion<int>();

            entity.Property(e => e.SourceModule)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(e => e.ActionUrl)
                .HasMaxLength(500);

            entity.Property(e => e.ActionLabel)
                .HasMaxLength(100);

            entity.Property(e => e.RelatedEntityType)
                .HasMaxLength(100);

            entity.Property(e => e.TargetRole)
                .HasMaxLength(100);

            entity.Property(e => e.MetadataJson)
                .HasColumnType("jsonb");

            // RowVersion for optimistic concurrency
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .HasDefaultValue(0u);

            // Indexes for common queries
            entity.HasIndex(e => e.TenantId)
                .HasDatabaseName("IX_Alerts_TenantId");

            entity.HasIndex(e => new { e.TenantId, e.UserId })
                .HasDatabaseName("IX_Alerts_Tenant_User");

            entity.HasIndex(e => new { e.TenantId, e.Category })
                .HasDatabaseName("IX_Alerts_Tenant_Category");

            entity.HasIndex(e => new { e.TenantId, e.Severity })
                .HasDatabaseName("IX_Alerts_Tenant_Severity");

            entity.HasIndex(e => new { e.TenantId, e.IsRead })
                .HasDatabaseName("IX_Alerts_Tenant_IsRead");

            entity.HasIndex(e => new { e.TenantId, e.SourceModule })
                .HasDatabaseName("IX_Alerts_Tenant_SourceModule");

            entity.HasIndex(e => e.ExpiresAt)
                .HasDatabaseName("IX_Alerts_ExpiresAt");

            entity.HasIndex(e => e.CreatedDate)
                .HasDatabaseName("IX_Alerts_CreatedDate");

            // Composite index for the most common query pattern
            entity.HasIndex(e => new { e.TenantId, e.UserId, e.IsRead, e.IsDismissed, e.Severity })
                .HasDatabaseName("IX_Alerts_Common_Query")
                .IsDescending(false, false, false, false, true);
        });
    }
}
