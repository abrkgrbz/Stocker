using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Payroll
/// </summary>
public class PayrollConfiguration : IEntityTypeConfiguration<Payroll>
{
    public void Configure(EntityTypeBuilder<Payroll> builder)
    {
        builder.ToTable("Payrolls", "hr");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(p => p.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Earnings - all decimal columns with precision
        builder.Property(p => p.BaseSalary).HasPrecision(18, 2);
        builder.Property(p => p.OvertimePay).HasPrecision(18, 2);
        builder.Property(p => p.Bonus).HasPrecision(18, 2);
        builder.Property(p => p.Allowances).HasPrecision(18, 2);
        builder.Property(p => p.OtherEarnings).HasPrecision(18, 2);

        // Deductions
        builder.Property(p => p.IncomeTax).HasPrecision(18, 2);
        builder.Property(p => p.SocialSecurityEmployee).HasPrecision(18, 2);
        builder.Property(p => p.UnemploymentInsuranceEmployee).HasPrecision(18, 2);
        builder.Property(p => p.HealthInsurance).HasPrecision(18, 2);
        builder.Property(p => p.StampTax).HasPrecision(18, 2);
        builder.Property(p => p.OtherDeductions).HasPrecision(18, 2);

        // Employer contributions
        builder.Property(p => p.SocialSecurityEmployer).HasPrecision(18, 2);
        builder.Property(p => p.UnemploymentInsuranceEmployer).HasPrecision(18, 2);

        // Turkish tax calculation fields
        builder.Property(p => p.CumulativeGrossEarnings).HasPrecision(18, 2);
        builder.Property(p => p.MinWageExemption).HasPrecision(18, 2);
        builder.Property(p => p.TaxBase).HasPrecision(18, 2);
        builder.Property(p => p.TaxBracket).HasDefaultValue(1);
        builder.Property(p => p.TaxBracketRate).HasPrecision(5, 4);
        builder.Property(p => p.SgkCeilingApplied).HasDefaultValue(false);
        builder.Property(p => p.SgkBase).HasPrecision(18, 2);
        builder.Property(p => p.EffectiveTaxRate).HasPrecision(5, 4);

        // Working days
        builder.Property(p => p.OvertimeHours).HasPrecision(8, 2);

        builder.Property(p => p.PaymentReference)
            .HasMaxLength(100);

        builder.Property(p => p.Notes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(p => p.Employee)
            .WithMany(e => e.Payrolls)
            .HasForeignKey(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.CalculatedBy)
            .WithMany()
            .HasForeignKey(p => p.CalculatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.ApprovedBy)
            .WithMany()
            .HasForeignKey(p => p.ApprovedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Items)
            .WithOne(pi => pi.Payroll)
            .HasForeignKey(pi => pi.PayrollId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => new { p.TenantId, p.EmployeeId });
        builder.HasIndex(p => new { p.TenantId, p.Year, p.Month });
        builder.HasIndex(p => new { p.TenantId, p.Status });
        builder.HasIndex(p => new { p.EmployeeId, p.Year, p.Month }).IsUnique();
    }
}
