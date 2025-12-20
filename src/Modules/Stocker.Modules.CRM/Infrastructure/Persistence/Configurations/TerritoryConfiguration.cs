using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class TerritoryConfiguration : IEntityTypeConfiguration<Territory>
{
    public void Configure(EntityTypeBuilder<Territory> builder)
    {
        builder.ToTable("Territories", "crm");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Description)
            .HasMaxLength(1000);

        builder.Property(t => t.HierarchyPath)
            .HasMaxLength(500);

        builder.Property(t => t.Country)
            .HasMaxLength(100);

        builder.Property(t => t.CountryCode)
            .HasMaxLength(3);

        builder.Property(t => t.Region)
            .HasMaxLength(100);

        builder.Property(t => t.City)
            .HasMaxLength(100);

        builder.Property(t => t.District)
            .HasMaxLength(100);

        builder.Property(t => t.PostalCodeRange)
            .HasMaxLength(200);

        builder.Property(t => t.GeoCoordinates)
            .HasColumnType("text");

        builder.Property(t => t.SalesTarget)
            .HasPrecision(18, 2);

        builder.Property(t => t.Currency)
            .HasMaxLength(3);

        builder.Property(t => t.PotentialValue)
            .HasPrecision(18, 2);

        builder.Property(t => t.PrimarySalesRepName)
            .HasMaxLength(200);

        builder.Property(t => t.TotalSales)
            .HasPrecision(18, 2);

        // Relationships
        builder.HasOne(t => t.ParentTerritory)
            .WithMany()
            .HasForeignKey(t => t.ParentTerritoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.AssignedSalesTeam)
            .WithMany()
            .HasForeignKey(t => t.AssignedSalesTeamId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(t => t.Assignments)
            .WithOne(a => a.Territory)
            .HasForeignKey(a => a.TerritoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => new { t.TenantId, t.Code }).IsUnique();
        builder.HasIndex(t => new { t.TenantId, t.IsActive });
        builder.HasIndex(t => new { t.TenantId, t.TerritoryType });
        builder.HasIndex(t => new { t.TenantId, t.ParentTerritoryId });
    }
}

public class TerritoryAssignmentConfiguration : IEntityTypeConfiguration<TerritoryAssignment>
{
    public void Configure(EntityTypeBuilder<TerritoryAssignment> builder)
    {
        builder.ToTable("TerritoryAssignments", "crm");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .ValueGeneratedNever();

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.UserName)
            .HasMaxLength(200);

        builder.Property(a => a.ResponsibilityPercentage)
            .HasPrecision(5, 2);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TerritoryId, a.UserId, a.IsActive });
    }
}
