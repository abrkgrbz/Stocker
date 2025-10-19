using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class CustomerTagConfiguration : IEntityTypeConfiguration<CustomerTag>
{
    public void Configure(EntityTypeBuilder<CustomerTag> builder)
    {
        builder.ToTable("CustomerTags", "crm");

        builder.HasKey(ct => ct.Id);

        builder.Property(ct => ct.Id)
            .ValueGeneratedNever();

        builder.Property(ct => ct.TenantId)
            .IsRequired();

        builder.Property(ct => ct.CustomerId)
            .IsRequired();

        builder.Property(ct => ct.Tag)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(ct => ct.Color)
            .HasMaxLength(50);

        builder.Property(ct => ct.CreatedBy)
            .IsRequired();

        // Relationships
        builder.HasOne(ct => ct.Customer)
            .WithMany()
            .HasForeignKey(ct => ct.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(ct => ct.TenantId);
        builder.HasIndex(ct => new { ct.TenantId, ct.CustomerId });
        builder.HasIndex(ct => new { ct.TenantId, ct.Tag });
        builder.HasIndex(ct => new { ct.CustomerId, ct.Tag })
            .IsUnique();
    }
}
