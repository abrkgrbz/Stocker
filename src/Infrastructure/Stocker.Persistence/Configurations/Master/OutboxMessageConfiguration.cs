using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.Entities;

namespace Stocker.Persistence.Configurations.Master;

/// <summary>
/// EF Core configuration for OutboxMessage entity
/// </summary>
public class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("OutboxMessages", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Content)
            .IsRequired()
            .HasColumnType("jsonb"); // PostgreSQL JSON type for efficient storage

        builder.Property(x => x.OccurredOnUtc)
            .IsRequired();

        builder.Property(x => x.ProcessedOnUtc);

        builder.Property(x => x.Error)
            .HasMaxLength(2000);

        builder.Property(x => x.RetryCount)
            .HasDefaultValue(0);

        // Indexes for efficient querying
        builder.HasIndex(x => x.ProcessedOnUtc)
            .HasDatabaseName("IX_OutboxMessages_ProcessedOnUtc");

        // Composite index for unprocessed messages ordered by occurrence
        builder.HasIndex(x => new { x.ProcessedOnUtc, x.OccurredOnUtc })
            .HasDatabaseName("IX_OutboxMessages_Unprocessed")
            .HasFilter("\"ProcessedOnUtc\" IS NULL");

        // Index for cleanup of old processed messages
        builder.HasIndex(x => x.OccurredOnUtc)
            .HasDatabaseName("IX_OutboxMessages_OccurredOnUtc");
    }
}
