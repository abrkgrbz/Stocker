using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantSettingsConfiguration : IEntityTypeConfiguration<TenantSettings>
{
    public void Configure(EntityTypeBuilder<TenantSettings> builder)
    {
        builder.ToTable("TenantSettings", "Master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        // General Settings
        builder.Property(x => x.TimeZone)
            .HasColumnName("TimeZone")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.DateFormat)
            .HasColumnName("DateFormat")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.TimeFormat)
            .HasColumnName("TimeFormat")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Currency)
            .HasColumnName("Currency")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Language)
            .HasColumnName("Language")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.Country)
            .HasColumnName("Country")
            .HasMaxLength(10)
            .IsRequired();

        // Business Settings
        builder.Property(x => x.CompanyName)
            .HasColumnName("CompanyName")
            .HasMaxLength(200);

        builder.Property(x => x.TaxNumber)
            .HasColumnName("TaxNumber")
            .HasMaxLength(50);

        builder.Property(x => x.Address)
            .HasColumnName("Address")
            .HasMaxLength(500);

        builder.Property(x => x.Phone)
            .HasColumnName("Phone")
            .HasMaxLength(50);

        builder.Property(x => x.Email)
            .HasColumnName("Email")
            .HasMaxLength(200);

        builder.Property(x => x.Website)
            .HasColumnName("Website")
            .HasMaxLength(200);

        // Feature Toggles
        builder.Property(x => x.EnableTwoFactor)
            .HasColumnName("EnableTwoFactor")
            .IsRequired();

        builder.Property(x => x.EnableApiAccess)
            .HasColumnName("EnableApiAccess")
            .IsRequired();

        builder.Property(x => x.EnableWebhooks)
            .HasColumnName("EnableWebhooks")
            .IsRequired();

        builder.Property(x => x.EnableEmailNotifications)
            .HasColumnName("EnableEmailNotifications")
            .IsRequired();

        builder.Property(x => x.EnableSmsNotifications)
            .HasColumnName("EnableSmsNotifications")
            .IsRequired();

        builder.Property(x => x.EnableAutoBackup)
            .HasColumnName("EnableAutoBackup")
            .IsRequired();

        // Limits and Quotas
        builder.Property(x => x.MaxUsers)
            .HasColumnName("MaxUsers")
            .IsRequired();

        builder.Property(x => x.MaxStorage)
            .HasColumnName("MaxStorage")
            .IsRequired();

        builder.Property(x => x.MaxApiCallsPerMonth)
            .HasColumnName("MaxApiCallsPerMonth")
            .IsRequired();

        builder.Property(x => x.DataRetentionDays)
            .HasColumnName("DataRetentionDays")
            .IsRequired();

        builder.Property(x => x.SessionTimeoutMinutes)
            .HasColumnName("SessionTimeoutMinutes")
            .IsRequired();

        // Customization
        builder.Property(x => x.LogoUrl)
            .HasColumnName("LogoUrl")
            .HasMaxLength(500);

        builder.Property(x => x.FaviconUrl)
            .HasColumnName("FaviconUrl")
            .HasMaxLength(500);

        builder.Property(x => x.PrimaryColor)
            .HasColumnName("PrimaryColor")
            .HasMaxLength(20);

        builder.Property(x => x.SecondaryColor)
            .HasColumnName("SecondaryColor")
            .HasMaxLength(20);

        builder.Property(x => x.CustomCss)
            .HasColumnName("CustomCss")
            .HasColumnType("nvarchar(max)");

        // Email Settings
        builder.Property(x => x.SmtpHost)
            .HasColumnName("SmtpHost")
            .HasMaxLength(200);

        builder.Property(x => x.SmtpPort)
            .HasColumnName("SmtpPort");

        builder.Property(x => x.SmtpUsername)
            .HasColumnName("SmtpUsername")
            .HasMaxLength(200);

        builder.Property(x => x.SmtpPassword)
            .HasColumnName("SmtpPassword")
            .HasMaxLength(500);

        builder.Property(x => x.SmtpEnableSsl)
            .HasColumnName("SmtpEnableSsl")
            .IsRequired();

        builder.Property(x => x.EmailFromAddress)
            .HasColumnName("EmailFromAddress")
            .HasMaxLength(200);

        builder.Property(x => x.EmailFromName)
            .HasColumnName("EmailFromName")
            .HasMaxLength(200);

        // Metadata
        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("UpdatedAt");

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("UpdatedBy")
            .HasMaxLength(100);

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithOne()
            .HasForeignKey<TenantSettings>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantSettings_TenantId")
            .IsUnique();
    }
}