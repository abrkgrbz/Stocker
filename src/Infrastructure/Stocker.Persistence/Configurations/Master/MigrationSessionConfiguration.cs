using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Migration.Entities;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Persistence.Configurations.Master;

public class MigrationSessionConfiguration : IEntityTypeConfiguration<MigrationSession>
{
    public void Configure(EntityTypeBuilder<MigrationSession> builder)
    {
        builder.ToTable("MigrationSessions", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        builder.Property(x => x.CreatedByUserId)
            .HasColumnName("CreatedByUserId")
            .IsRequired();

        builder.Property(x => x.SourceType)
            .HasColumnName("SourceType")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.SourceName)
            .HasColumnName("SourceName")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("Status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Store entities as JSON array
        builder.Property(x => x.Entities)
            .HasColumnName("Entities")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<MigrationEntityType>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<MigrationEntityType>())
            .HasColumnType("text");

        // Statistics
        builder.Property(x => x.TotalRecords)
            .HasColumnName("TotalRecords")
            .HasDefaultValue(0);

        builder.Property(x => x.ValidRecords)
            .HasColumnName("ValidRecords")
            .HasDefaultValue(0);

        builder.Property(x => x.WarningRecords)
            .HasColumnName("WarningRecords")
            .HasDefaultValue(0);

        builder.Property(x => x.ErrorRecords)
            .HasColumnName("ErrorRecords")
            .HasDefaultValue(0);

        builder.Property(x => x.ImportedRecords)
            .HasColumnName("ImportedRecords")
            .HasDefaultValue(0);

        builder.Property(x => x.SkippedRecords)
            .HasColumnName("SkippedRecords")
            .HasDefaultValue(0);

        // JSON fields
        builder.Property(x => x.OptionsJson)
            .HasColumnName("OptionsJson")
            .HasColumnType("text");

        builder.Property(x => x.MappingConfigJson)
            .HasColumnName("MappingConfigJson")
            .HasColumnType("text");

        builder.Property(x => x.ErrorMessage)
            .HasColumnName("ErrorMessage")
            .HasMaxLength(2000);

        builder.Property(x => x.ImportJobId)
            .HasColumnName("ImportJobId")
            .HasMaxLength(100);

        // Timestamps
        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.ValidatedAt)
            .HasColumnName("ValidatedAt");

        builder.Property(x => x.ImportStartedAt)
            .HasColumnName("ImportStartedAt");

        builder.Property(x => x.CompletedAt)
            .HasColumnName("CompletedAt");

        builder.Property(x => x.ExpiresAt)
            .HasColumnName("ExpiresAt")
            .IsRequired();

        // Relationships
        builder.HasMany(x => x.Chunks)
            .WithOne(x => x.Session)
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ValidationResults)
            .WithOne(x => x.Session)
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_MigrationSessions_TenantId");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_MigrationSessions_Status");

        builder.HasIndex(x => x.ExpiresAt)
            .HasDatabaseName("IX_MigrationSessions_ExpiresAt");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_MigrationSessions_TenantId_Status");

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt })
            .HasDatabaseName("IX_MigrationSessions_TenantId_CreatedAt");
    }
}
