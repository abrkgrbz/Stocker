namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for EmployeeBenefit entity
/// </summary>
public record EmployeeBenefitDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public string BenefitType { get; init; } = string.Empty;
    public string BenefitName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;

    // Value Information
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PaymentFrequency { get; init; } = string.Empty;
    public decimal? AnnualValue { get; init; }
    public bool TaxIncluded { get; init; }
    public bool IsTaxable { get; init; }

    // Period Information
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public DateTime? RenewalDate { get; init; }
    public DateTime? VestingDate { get; init; }
    public int? WaitingPeriodMonths { get; init; }

    // Health Insurance
    public string? InsuranceProvider { get; init; }
    public string? PolicyNumber { get; init; }
    public string? CoverageLevel { get; init; }
    public bool IncludesFamily { get; init; }
    public bool SpouseCovered { get; init; }
    public bool ChildrenCovered { get; init; }
    public int? NumberOfDependents { get; init; }

    // Vehicle
    public string? VehiclePlate { get; init; }
    public string? VehicleModel { get; init; }
    public decimal? FuelAllowance { get; init; }
    public int? MileageLimit { get; init; }

    // Phone/Internet
    public string? PhoneNumber { get; init; }
    public decimal? MonthlyLimit { get; init; }
    public string? Operator { get; init; }

    // Meal Card
    public string? CardNumber { get; init; }
    public decimal? DailyAmount { get; init; }
    public string? CardProvider { get; init; }

    // Usage Information
    public decimal? UsedAmount { get; init; }
    public decimal? RemainingAmount { get; init; }
    public DateTime? LastUsageDate { get; init; }

    // Additional Information
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public string? DocumentUrl { get; init; }
    public int? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }

    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    // Computed Properties
    public bool IsExpired => EndDate.HasValue && EndDate.Value < DateTime.UtcNow;
    public bool IsVested => !VestingDate.HasValue || VestingDate.Value <= DateTime.UtcNow;
}
