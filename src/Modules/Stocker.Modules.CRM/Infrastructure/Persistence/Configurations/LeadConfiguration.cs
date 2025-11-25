using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Lead
/// </summary>
public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.ToTable("Leads", "crm");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.CompanyName)
            .HasMaxLength(200);

        builder.Property(l => l.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(l => l.Phone)
            .HasMaxLength(50);

        builder.Property(l => l.MobilePhone)
            .HasMaxLength(50);

        builder.Property(l => l.JobTitle)
            .HasMaxLength(100);

        builder.Property(l => l.Industry)
            .HasMaxLength(100);

        builder.Property(l => l.Source)
            .HasMaxLength(100);

        builder.Property(l => l.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(l => l.Rating)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(l => l.Address)
            .HasMaxLength(500);

        builder.Property(l => l.City)
            .HasMaxLength(100);

        builder.Property(l => l.State)
            .HasMaxLength(100);

        builder.Property(l => l.Country)
            .HasMaxLength(100);

        builder.Property(l => l.PostalCode)
            .HasMaxLength(20);

        builder.Property(l => l.Website)
            .HasMaxLength(255);

        builder.Property(l => l.AnnualRevenue)
            .HasPrecision(18, 2);

        builder.Property(l => l.Description)
            .HasMaxLength(2000);

        builder.Property(l => l.Score)
            .HasDefaultValue(0);

        // Computed property - not mapped to database
        builder.Ignore(l => l.FullName);
        builder.Ignore(l => l.IsConverted);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.Email }).IsUnique();
        builder.HasIndex(l => new { l.TenantId, l.Status });
        builder.HasIndex(l => new { l.TenantId, l.Rating });
        builder.HasIndex(l => new { l.TenantId, l.AssignedToUserId });
        builder.HasIndex(l => new { l.TenantId, l.ConvertedToCustomerId });
        builder.HasIndex(l => new { l.TenantId, l.Score });
    }
}