using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Employee
/// </summary>
public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees", "hr");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.EmployeeCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.MiddleName)
            .HasMaxLength(100);

        builder.Property(e => e.NationalId)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Gender)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.MaritalStatus)
            .HasMaxLength(50);

        builder.Property(e => e.Nationality)
            .HasMaxLength(100);

        builder.Property(e => e.BloodType)
            .HasMaxLength(10);

        builder.Property(e => e.BirthPlace)
            .HasMaxLength(200);

        builder.Property(e => e.PhotoUrl)
            .HasMaxLength(500);

        // Email Value Object
        builder.OwnsOne(e => e.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("Email")
                .HasMaxLength(255)
                .IsRequired();
        });

        // Personal Email Value Object
        builder.OwnsOne(e => e.PersonalEmail, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("PersonalEmail")
                .HasMaxLength(255);
        });

        // Phone Value Object
        builder.OwnsOne(e => e.Phone, phone =>
        {
            phone.Property(p => p.Value)
                .HasColumnName("Phone")
                .HasMaxLength(20)
                .IsRequired();
        });

        // Mobile Phone Value Object
        builder.OwnsOne(e => e.MobilePhone, phone =>
        {
            phone.Property(p => p.Value)
                .HasColumnName("MobilePhone")
                .HasMaxLength(20);
        });

        // Address Value Object
        builder.OwnsOne(e => e.Address, address =>
        {
            address.Property(a => a.Street).HasColumnName("Street").HasMaxLength(200);
            address.Property(a => a.City).HasColumnName("City").HasMaxLength(100);
            address.Property(a => a.State).HasColumnName("State").HasMaxLength(100);
            address.Property(a => a.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
            address.Property(a => a.Country).HasColumnName("Country").HasMaxLength(100);
        });

        builder.Property(e => e.EmploymentType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.BaseSalary)
            .HasPrecision(18, 2);

        builder.Property(e => e.Currency)
            .HasMaxLength(10)
            .HasDefaultValue("TRY");

        builder.Property(e => e.PayrollPeriod)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.BankName)
            .HasMaxLength(100);

        builder.Property(e => e.BankBranch)
            .HasMaxLength(100);

        builder.Property(e => e.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(e => e.IBAN)
            .HasMaxLength(50);

        builder.Property(e => e.EmergencyContactName)
            .HasMaxLength(100);

        builder.Property(e => e.EmergencyContactPhone)
            .HasMaxLength(20);

        builder.Property(e => e.EmergencyContactRelation)
            .HasMaxLength(50);

        builder.Property(e => e.SocialSecurityNumber)
            .HasMaxLength(20);

        builder.Property(e => e.TaxNumber)
            .HasMaxLength(20);

        builder.Property(e => e.TaxOffice)
            .HasMaxLength(100);

        builder.Property(e => e.TerminationReason)
            .HasMaxLength(500);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        // Ignore computed property
        builder.Ignore(e => e.FullName);

        // Relationships
        builder.HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Position)
            .WithMany(p => p.Employees)
            .HasForeignKey(e => e.PositionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Manager)
            .WithMany(m => m.Subordinates)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Shift)
            .WithMany(s => s.Employees)
            .HasForeignKey(e => e.ShiftId)
            .OnDelete(DeleteBehavior.SetNull);

        // Note: WorkLocationId is FK but no navigation property in Employee

        // Indexes
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => new { e.TenantId, e.EmployeeCode }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.NationalId }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.DepartmentId });
        builder.HasIndex(e => new { e.TenantId, e.PositionId });
        builder.HasIndex(e => new { e.TenantId, e.ManagerId });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.WorkLocationId });
    }
}
