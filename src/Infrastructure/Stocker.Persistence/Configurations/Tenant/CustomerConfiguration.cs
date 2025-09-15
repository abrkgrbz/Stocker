using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers", "tenant");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .ValueGeneratedNever();
            
        builder.Property(x => x.TenantId)
            .IsRequired();
            
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.TaxNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.TaxOffice)
            .HasMaxLength(100);
            
        builder.Property(x => x.CreditLimit)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.CurrentBalance)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.IsActive)
            .IsRequired();
            
        // Configure Email as owned type
        builder.OwnsOne(x => x.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("Email")
                .IsRequired()
                .HasMaxLength(255);
        });
        
        // Configure Phone as owned type
        builder.OwnsOne(x => x.Phone, phone =>
        {
            phone.Property(p => p.Value)
                .HasColumnName("Phone")
                .IsRequired()
                .HasMaxLength(50);
        });
        
        // Configure Address as owned type
        builder.OwnsOne(x => x.Address, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("Street")
                .IsRequired()
                .HasMaxLength(200);
                
            address.Property(a => a.Building)
                .HasColumnName("Building")
                .HasMaxLength(50);
                
            address.Property(a => a.Floor)
                .HasColumnName("Floor")
                .HasMaxLength(10);
                
            address.Property(a => a.Apartment)
                .HasColumnName("Apartment")
                .HasMaxLength(20);
                
            address.Property(a => a.City)
                .HasColumnName("City")
                .IsRequired()
                .HasMaxLength(100);
                
            address.Property(a => a.State)
                .HasColumnName("State")
                .HasMaxLength(100);
                
            address.Property(a => a.PostalCode)
                .HasColumnName("PostalCode")
                .HasMaxLength(20);
                
            address.Property(a => a.Country)
                .HasColumnName("Country")
                .IsRequired()
                .HasMaxLength(100);
        });
        
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.TenantId, x.Name });
    }
}