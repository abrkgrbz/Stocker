using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

/// <summary>
/// EF Core configuration for UserSession entity
/// </summary>
public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder)
    {
        builder.ToTable("UserSessions", "master");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.UserId)
            .IsRequired();

        builder.Property(s => s.IsMasterUser)
            .IsRequired();

        builder.Property(s => s.TenantId);

        builder.Property(s => s.RefreshTokenHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.DeviceId)
            .HasMaxLength(256);

        builder.Property(s => s.DeviceInfo)
            .HasMaxLength(500);

        builder.Property(s => s.IpAddress)
            .HasMaxLength(50);

        builder.Property(s => s.Location)
            .HasMaxLength(200);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.LastActivityAt)
            .IsRequired();

        builder.Property(s => s.ExpiresAt)
            .IsRequired();

        builder.Property(s => s.IsRevoked)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.RevokedAt);

        builder.Property(s => s.RevokedReason)
            .HasMaxLength(500);

        // Indexes for efficient session lookup
        builder.HasIndex(s => s.UserId)
            .HasDatabaseName("IX_UserSessions_UserId");

        builder.HasIndex(s => new { s.UserId, s.IsMasterUser })
            .HasDatabaseName("IX_UserSessions_UserId_IsMasterUser");

        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("IX_UserSessions_TenantId");

        builder.HasIndex(s => s.RefreshTokenHash)
            .HasDatabaseName("IX_UserSessions_RefreshTokenHash");

        builder.HasIndex(s => s.ExpiresAt)
            .HasDatabaseName("IX_UserSessions_ExpiresAt");

        builder.HasIndex(s => new { s.UserId, s.IsRevoked, s.ExpiresAt })
            .HasDatabaseName("IX_UserSessions_UserId_IsRevoked_ExpiresAt");
    }
}
