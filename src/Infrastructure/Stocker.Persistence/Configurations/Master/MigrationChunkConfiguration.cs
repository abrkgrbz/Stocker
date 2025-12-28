using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Migration.Entities;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Persistence.Configurations.Master;

public class MigrationChunkConfiguration : IEntityTypeConfiguration<MigrationChunk>
{
    public void Configure(EntityTypeBuilder<MigrationChunk> builder)
    {
        builder.ToTable("MigrationChunks", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.SessionId)
            .HasColumnName("SessionId")
            .IsRequired();

        builder.Property(x => x.EntityType)
            .HasColumnName("EntityType")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.ChunkIndex)
            .HasColumnName("ChunkIndex")
            .IsRequired();

        builder.Property(x => x.TotalChunks)
            .HasColumnName("TotalChunks")
            .IsRequired();

        builder.Property(x => x.RecordCount)
            .HasColumnName("RecordCount")
            .IsRequired();

        builder.Property(x => x.RawDataJson)
            .HasColumnName("RawDataJson")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("Status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.ValidatedAt)
            .HasColumnName("ValidatedAt");

        builder.Property(x => x.ImportedAt)
            .HasColumnName("ImportedAt");

        // Indexes
        builder.HasIndex(x => x.SessionId)
            .HasDatabaseName("IX_MigrationChunks_SessionId");

        builder.HasIndex(x => new { x.SessionId, x.EntityType })
            .HasDatabaseName("IX_MigrationChunks_SessionId_EntityType");

        builder.HasIndex(x => new { x.SessionId, x.ChunkIndex })
            .HasDatabaseName("IX_MigrationChunks_SessionId_ChunkIndex");
    }
}
