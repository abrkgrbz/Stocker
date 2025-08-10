using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Contact
/// </summary>
public class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.ToTable("Contacts", "CRM");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.CustomerId)
            .IsRequired();

        builder.Property(c => c.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Phone)
            .HasMaxLength(50);

        builder.Property(c => c.MobilePhone)
            .HasMaxLength(50);

        builder.Property(c => c.JobTitle)
            .HasMaxLength(100);

        builder.Property(c => c.Department)
            .HasMaxLength(100);

        builder.Property(c => c.Notes)
            .HasMaxLength(1000);

        // Computed property - not mapped to database
        builder.Ignore(c => c.FullName);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.CustomerId });
        builder.HasIndex(c => new { c.TenantId, c.Email });
        builder.HasIndex(c => new { c.TenantId, c.IsActive });
        builder.HasIndex(c => new { c.TenantId, c.CustomerId, c.IsPrimary });
    }
}