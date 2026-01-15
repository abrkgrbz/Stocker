using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantUserEmailConfiguration : BaseEntityTypeConfiguration<TenantUserEmail>
{
    public override void Configure(EntityTypeBuilder<TenantUserEmail> builder)
    {
        base.Configure(builder);

        builder.ToTable("TenantUserEmails", "master");

        // Email Value Object
        builder.OwnsOne(e => e.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("Email")
                .IsRequired()
                .HasMaxLength(256);

            email.HasIndex(e => e.Value)
                .HasDatabaseName("IX_TenantUserEmails_Email");
        });

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.TenantUserId)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.IsActivated)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.ActivatedAt);

        // Composite index for efficient lookup
        builder.HasIndex(e => new { e.TenantId, e.TenantUserId })
            .IsUnique()
            .HasDatabaseName("IX_TenantUserEmails_TenantId_TenantUserId");

        // Foreign key to Tenant
        builder.HasOne(e => e.Tenant)
            .WithMany()
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
