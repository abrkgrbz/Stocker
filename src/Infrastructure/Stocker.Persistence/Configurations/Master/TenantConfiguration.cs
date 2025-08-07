using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantConfiguration : BaseEntityTypeConfiguration<Domain.Master.Entities.Tenant>
{
    public override void Configure(EntityTypeBuilder<Domain.Master.Entities.Tenant> builder)
    {
        base.Configure(builder);

        builder.ToTable("Tenants", "master");

        // Properties
        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.DatabaseName)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(t => t.IsActive)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasMaxLength(500);

        builder.Property(t => t.LogoUrl)
            .HasMaxLength(500);

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.UpdatedAt);

        builder.Property(t => t.CreatedBy)
            .HasMaxLength(256);

        builder.Property(t => t.UpdatedBy)
            .HasMaxLength(256);

        // Value Objects
        builder.OwnsOne(t => t.ConnectionString, conn =>
        {
            conn.Property(c => c.Value)
                .IsRequired()
                .HasMaxLength(500)
                .HasColumnName("ConnectionString");
        });

        builder.OwnsOne(t => t.ContactEmail, email =>
        {
            email.Property(e => e.Value)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnName("ContactEmail");

            email.HasIndex(e => e.Value)
                .HasDatabaseName("IX_Tenants_ContactEmail");
        });

        builder.OwnsOne(t => t.ContactPhone, phone =>
        {
            phone.Property(p => p.Value)
                .HasMaxLength(20)
                .HasColumnName("ContactPhone");
        });

        // Relationships
        builder.HasMany(t => t.Domains)
            .WithOne()
            .HasForeignKey(d => d.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Features)
            .WithOne()
            .HasForeignKey(f => f.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Subscriptions)
            .WithOne(s => s.Tenant)
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(t => t.Code)
            .IsUnique()
            .HasDatabaseName("IX_Tenants_Code");

        builder.HasIndex(t => t.IsActive)
            .HasDatabaseName("IX_Tenants_IsActive");

        builder.HasIndex(t => t.CreatedAt)
            .HasDatabaseName("IX_Tenants_CreatedAt");
    }
}