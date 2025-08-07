using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Master;

public class MasterUserConfiguration : BaseEntityTypeConfiguration<MasterUser>
{
    public override void Configure(EntityTypeBuilder<MasterUser> builder)
    {
        base.Configure(builder);

        builder.ToTable("MasterUsers", "master");

        // Properties
        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.UserType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(u => u.IsActive)
            .IsRequired();

        builder.Property(u => u.IsEmailVerified)
            .IsRequired();

        builder.Property(u => u.TwoFactorEnabled)
            .IsRequired();

        builder.Property(u => u.TwoFactorSecret)
            .HasMaxLength(200);

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.FailedLoginAttempts)
            .IsRequired();

        builder.Property(u => u.ProfilePictureUrl)
            .HasMaxLength(500);

        builder.Property(u => u.Timezone)
            .HasMaxLength(100);

        builder.Property(u => u.PreferredLanguage)
            .HasMaxLength(10);

        // Value Objects
        builder.OwnsOne(u => u.Email, email =>
        {
            email.Property(e => e.Value)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnName("Email");

            email.HasIndex(e => e.Value)
                .IsUnique()
                .HasDatabaseName("IX_MasterUsers_Email");
        });

        builder.OwnsOne(u => u.Password, password =>
        {
            password.Property(p => p.Hash)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnName("PasswordHash");

            password.Property(p => p.Salt)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnName("PasswordSalt");
        });

        builder.OwnsOne(u => u.PhoneNumber, phone =>
        {
            phone.Property(p => p.Value)
                .HasMaxLength(20)
                .HasColumnName("PhoneNumber");
        });

        // RefreshTokens as owned collection
        builder.OwnsMany(u => u.RefreshTokens, rt =>
        {
            rt.ToTable("MasterUserRefreshTokens", "master");
            rt.WithOwner().HasForeignKey("UserId");
            rt.Property<int>("Id").ValueGeneratedOnAdd();
            rt.HasKey("Id");

            rt.Property(r => r.Token)
                .IsRequired()
                .HasMaxLength(500);

            rt.Property(r => r.ExpiresAt)
                .IsRequired();

            rt.Property(r => r.CreatedAt)
                .IsRequired();

            rt.Property(r => r.DeviceInfo)
                .HasMaxLength(500);

            rt.Property(r => r.IpAddress)
                .HasMaxLength(50);

            rt.HasIndex(r => r.Token)
                .HasDatabaseName("IX_MasterUserRefreshTokens_Token");
        });

        // Relationships
        builder.HasMany(u => u.Tenants)
            .WithOne()
            .HasForeignKey(ut => ut.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.LoginHistory)
            .WithOne()
            .HasForeignKey(h => h.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(u => u.Username)
            .IsUnique()
            .HasDatabaseName("IX_MasterUsers_Username");

        builder.HasIndex(u => u.IsActive)
            .HasDatabaseName("IX_MasterUsers_IsActive");

        builder.HasIndex(u => u.UserType)
            .HasDatabaseName("IX_MasterUsers_UserType");
    }
}