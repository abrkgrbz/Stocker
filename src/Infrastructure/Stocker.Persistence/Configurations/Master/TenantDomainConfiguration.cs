using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantDomainConfiguration : BaseEntityTypeConfiguration<TenantDomain>
{
    public override void Configure(EntityTypeBuilder<TenantDomain> builder)
    {
        base.Configure(builder);

        builder.ToTable("TenantDomains", "master");

        // Properties
        builder.Property(td => td.TenantId)
            .IsRequired();

        builder.Property(td => td.DomainName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(td => td.IsPrimary)
            .IsRequired();

        builder.Property(td => td.IsVerified)
            .IsRequired();

        builder.Property(td => td.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(td => td.DomainName)
            .IsUnique()
            .HasDatabaseName("IX_TenantDomains_DomainName");

        builder.HasIndex(td => new { td.TenantId, td.IsPrimary })
            .HasFilter("[IsPrimary] = 1")
            .IsUnique()
            .HasDatabaseName("IX_TenantDomains_TenantId_Primary");
    }
}