using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Migration.Entities;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Persistence.Configurations.Master;

public class MigrationValidationResultConfiguration : IEntityTypeConfiguration<MigrationValidationResult>
{
    public void Configure(EntityTypeBuilder<MigrationValidationResult> builder)
    {
        builder.ToTable("MigrationValidationResults", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.SessionId)
            .HasColumnName("SessionId")
            .IsRequired();

        builder.Property(x => x.ChunkId)
            .HasColumnName("ChunkId")
            .IsRequired();

        builder.Property(x => x.EntityType)
            .HasColumnName("EntityType")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.RowIndex)
            .HasColumnName("RowIndex")
            .IsRequired();

        builder.Property(x => x.GlobalRowIndex)
            .HasColumnName("GlobalRowIndex")
            .IsRequired();

        builder.Property(x => x.OriginalDataJson)
            .HasColumnName("OriginalDataJson")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(x => x.TransformedDataJson)
            .HasColumnName("TransformedDataJson")
            .HasColumnType("text");

        builder.Property(x => x.Status)
            .HasColumnName("Status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ErrorsJson)
            .HasColumnName("ErrorsJson")
            .HasColumnType("text");

        builder.Property(x => x.WarningsJson)
            .HasColumnName("WarningsJson")
            .HasColumnType("text");

        builder.Property(x => x.UserAction)
            .HasColumnName("UserAction")
            .HasMaxLength(50);

        builder.Property(x => x.FixedDataJson)
            .HasColumnName("FixedDataJson")
            .HasColumnType("text");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.ValidatedAt)
            .HasColumnName("ValidatedAt");

        builder.Property(x => x.ImportedAt)
            .HasColumnName("ImportedAt");

        // Relationship to Chunk
        builder.HasOne(x => x.Chunk)
            .WithMany()
            .HasForeignKey(x => x.ChunkId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.SessionId)
            .HasDatabaseName("IX_MigrationValidationResults_SessionId");

        builder.HasIndex(x => x.ChunkId)
            .HasDatabaseName("IX_MigrationValidationResults_ChunkId");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_MigrationValidationResults_Status");

        builder.HasIndex(x => new { x.SessionId, x.Status })
            .HasDatabaseName("IX_MigrationValidationResults_SessionId_Status");

        builder.HasIndex(x => new { x.SessionId, x.EntityType })
            .HasDatabaseName("IX_MigrationValidationResults_SessionId_EntityType");

        builder.HasIndex(x => new { x.SessionId, x.GlobalRowIndex })
            .HasDatabaseName("IX_MigrationValidationResults_SessionId_GlobalRowIndex");
    }
}
