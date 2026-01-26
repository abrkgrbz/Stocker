using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core configuration for the ProcessedRequest entity.
/// </summary>
public class ProcessedRequestConfiguration : IEntityTypeConfiguration<ProcessedRequest>
{
    public void Configure(EntityTypeBuilder<ProcessedRequest> builder)
    {
        builder.ToTable("processed_requests", "sales");

        builder.HasKey(x => x.Id);

        // Id is the request ID (idempotency key), not auto-generated
        builder.Property(x => x.Id)
            .ValueGeneratedNever();

        builder.Property(x => x.CommandName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.ProcessedAt)
            .IsRequired();

        builder.Property(x => x.TenantId)
            .IsRequired();

        // Index for faster cleanup queries
        builder.HasIndex(x => x.ProcessedAt)
            .HasDatabaseName("ix_processed_requests_processed_at");

        // Index for tenant-based queries (optional, for analytics)
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("ix_processed_requests_tenant_id");
    }
}
