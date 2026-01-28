using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class PasswordHistoryConfiguration : IEntityTypeConfiguration<PasswordHistory>
{
    public void Configure(EntityTypeBuilder<PasswordHistory> builder)
    {
        builder.ToTable("PasswordHistories", "master");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.MasterUserId)
            .IsRequired();

        builder.Property(p => p.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Index for efficient lookup by user
        builder.HasIndex(p => p.MasterUserId)
            .HasDatabaseName("IX_PasswordHistories_MasterUserId");

        // Composite index for checking password history
        builder.HasIndex(p => new { p.MasterUserId, p.CreatedAt })
            .HasDatabaseName("IX_PasswordHistories_MasterUserId_CreatedAt")
            .IsDescending(false, true);

        // Foreign key relationship with MasterUser
        builder.HasOne<MasterUser>()
            .WithMany()
            .HasForeignKey(p => p.MasterUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
