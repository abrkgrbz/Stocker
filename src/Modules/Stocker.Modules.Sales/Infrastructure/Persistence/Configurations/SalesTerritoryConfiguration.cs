using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesTerritoryConfiguration : IEntityTypeConfiguration<SalesTerritory>
{
    public void Configure(EntityTypeBuilder<SalesTerritory> builder)
    {
        builder.ToTable("SalesTerritories", "sales");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TerritoryCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        builder.Property(t => t.TerritoryType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Geographic Info
        builder.Property(t => t.Country)
            .HasMaxLength(100);

        builder.Property(t => t.Region)
            .HasMaxLength(100);

        builder.Property(t => t.City)
            .HasMaxLength(100);

        builder.Property(t => t.District)
            .HasMaxLength(100);

        builder.Property(t => t.GeoBoundary)
            .HasColumnType("text");

        // Manager
        builder.Property(t => t.TerritoryManagerName)
            .HasMaxLength(200);

        // Performance
        builder.Property(t => t.LastPerformanceScore)
            .HasPrecision(5, 2);

        // Notes
        builder.Property(t => t.Notes)
            .HasMaxLength(2000);

        // Money - PotentialValue
        builder.OwnsOne(t => t.PotentialValue, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("PotentialValue")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("PotentialValueCurrency")
                .HasMaxLength(3);
        });

        // Money - AnnualTarget
        builder.OwnsOne(t => t.AnnualTarget, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("AnnualTarget")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("AnnualTargetCurrency")
                .HasMaxLength(3);
        });

        // Self-referencing Hierarchy
        builder.HasOne<SalesTerritory>()
            .WithMany(t => t.ChildTerritories)
            .HasForeignKey(t => t.ParentTerritoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Navigation - Assignments
        builder.HasMany(t => t.Assignments)
            .WithOne()
            .HasForeignKey(a => a.TerritoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Navigation - Customers
        builder.HasMany(t => t.Customers)
            .WithOne()
            .HasForeignKey(c => c.TerritoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Navigation - PostalCodes
        builder.HasMany(t => t.PostalCodes)
            .WithOne()
            .HasForeignKey(p => p.TerritoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => t.TerritoryCode);
        builder.HasIndex(t => new { t.TenantId, t.TerritoryCode }).IsUnique();
        builder.HasIndex(t => t.ParentTerritoryId);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.TerritoryType);
        builder.HasIndex(t => new { t.TenantId, t.Status });
        builder.HasIndex(t => new { t.TenantId, t.ParentTerritoryId });
        builder.HasIndex(t => new { t.TenantId, t.TerritoryManagerId });
        builder.HasIndex(t => new { t.TenantId, t.Country, t.Region, t.City });
    }
}

public class TerritoryAssignmentConfiguration : IEntityTypeConfiguration<TerritoryAssignment>
{
    public void Configure(EntityTypeBuilder<TerritoryAssignment> builder)
    {
        builder.ToTable("TerritoryAssignments", "sales");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.SalesRepresentativeName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Role)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.CommissionRate)
            .HasPrecision(5, 2);

        // Indexes
        builder.HasIndex(a => a.TerritoryId);
        builder.HasIndex(a => a.SalesRepresentativeId);
        builder.HasIndex(a => new { a.TerritoryId, a.SalesRepresentativeId });
        builder.HasIndex(a => new { a.TerritoryId, a.IsActive });
        builder.HasIndex(a => new { a.SalesRepresentativeId, a.IsActive });
        builder.HasIndex(a => new { a.TerritoryId, a.Role, a.IsActive });
    }
}

public class TerritoryCustomerConfiguration : IEntityTypeConfiguration<TerritoryCustomer>
{
    public void Configure(EntityTypeBuilder<TerritoryCustomer> builder)
    {
        builder.ToTable("TerritoryCustomers", "sales");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.PrimarySalesRepresentativeName)
            .HasMaxLength(200);

        // Indexes
        builder.HasIndex(c => c.TerritoryId);
        builder.HasIndex(c => c.CustomerId);
        builder.HasIndex(c => new { c.TerritoryId, c.CustomerId }).IsUnique();
        builder.HasIndex(c => new { c.TerritoryId, c.IsActive });
        builder.HasIndex(c => new { c.CustomerId, c.IsActive });
        builder.HasIndex(c => c.PrimarySalesRepresentativeId);
    }
}

public class TerritoryPostalCodeConfiguration : IEntityTypeConfiguration<TerritoryPostalCode>
{
    public void Configure(EntityTypeBuilder<TerritoryPostalCode> builder)
    {
        builder.ToTable("TerritoryPostalCodes", "sales");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.PostalCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.AreaName)
            .HasMaxLength(200);

        // Indexes
        builder.HasIndex(p => p.TerritoryId);
        builder.HasIndex(p => p.PostalCode);
        builder.HasIndex(p => new { p.TerritoryId, p.PostalCode }).IsUnique();
    }
}
