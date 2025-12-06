using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Employee entity
/// </summary>
public class EmployeeDto
{
    public int Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? MiddleName { get; set; }
    public string? NationalId { get; set; }
    public DateTime? BirthDate { get; set; }
    public int? Age => BirthDate.HasValue ? (int)((DateTime.Today - BirthDate.Value).TotalDays / 365.25) : null;
    public Gender? Gender { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? PhotoUrl { get; set; }

    // Contact Information
    public string? Email { get; set; }
    public string? PersonalEmail { get; set; }
    public string? Phone { get; set; }
    public string? MobilePhone { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }

    // Job Information
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? PositionId { get; set; }
    public string? PositionTitle { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public int? ShiftId { get; set; }
    public string? ShiftName { get; set; }
    public int? WorkLocationId { get; set; }
    public string? WorkLocationName { get; set; }
    public DateTime HireDate { get; set; }
    public DateTime? ProbationEndDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    public string? TerminationReason { get; set; }
    public int YearsOfService => (int)((DateTime.Today - HireDate).TotalDays / 365.25);
    public EmploymentType EmploymentType { get; set; }
    public EmployeeStatus Status { get; set; }

    // Salary Information
    public decimal? BaseSalary { get; set; }
    public string? Currency { get; set; }
    public PayrollPeriod? PayrollPeriod { get; set; }

    // Bank Information (partially masked)
    public string? BankName { get; set; }
    public string? IBAN { get; set; }

    // Emergency Contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }

    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for employee summary list view
/// </summary>
public class EmployeeSummaryDto
{
    public int Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Email { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionTitle { get; set; }
    public EmployeeStatus Status { get; set; }
    public DateTime HireDate { get; set; }
}

/// <summary>
/// DTO for creating an employee
/// </summary>
public class CreateEmployeeDto
{
    // Required Basic Info
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    // Optional Personal Info
    public string? MiddleName { get; set; }
    public string? BirthPlace { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? BloodType { get; set; }

    // Optional Contact Information
    public string? PersonalEmail { get; set; }
    public string? MobilePhone { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }

    // Required Job Information
    public int DepartmentId { get; set; }
    public int PositionId { get; set; }
    public DateTime HireDate { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public decimal BaseSalary { get; set; }

    // Optional Job Information
    public int? ManagerId { get; set; }
    public int? ShiftId { get; set; }
    public int? WorkLocationId { get; set; }
    public DateTime? ProbationEndDate { get; set; }

    // Salary Information
    public string Currency { get; set; } = "TRY";
    public PayrollPeriod PayrollPeriod { get; set; } = PayrollPeriod.Monthly;

    // Bank Information
    public string? BankName { get; set; }
    public string? BankBranch { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? IBAN { get; set; }

    // Emergency Contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }

    // Tax Information
    public string? SocialSecurityNumber { get; set; }
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
}

/// <summary>
/// DTO for updating an employee
/// </summary>
public class UpdateEmployeeDto
{
    // Personal Info (Required)
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    // Personal Info (Optional)
    public string? MiddleName { get; set; }
    public string? BirthPlace { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? BloodType { get; set; }

    // Contact Information (Optional)
    public string? PersonalEmail { get; set; }
    public string? MobilePhone { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }

    // Job Information (Required)
    public int DepartmentId { get; set; }
    public int PositionId { get; set; }
    public EmploymentType EmploymentType { get; set; }

    // Job Information (Optional)
    public int? ManagerId { get; set; }
    public int? ShiftId { get; set; }
    public int? WorkLocationId { get; set; }
    public DateTime? ProbationEndDate { get; set; }

    // Salary Information
    public decimal BaseSalary { get; set; }
    public string Currency { get; set; } = "TRY";
    public PayrollPeriod PayrollPeriod { get; set; } = PayrollPeriod.Monthly;

    // Bank Information
    public string? BankName { get; set; }
    public string? BankBranch { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? IBAN { get; set; }

    // Emergency Contact
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }

    // Tax Information
    public string? SocialSecurityNumber { get; set; }
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
}

/// <summary>
/// DTO for terminating an employee
/// </summary>
public class TerminateEmployeeDto
{
    public DateTime TerminationDate { get; set; }
    public string? TerminationReason { get; set; }
}

/// <summary>
/// DTO for employee organization chart
/// </summary>
public class EmployeeOrgChartDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? PositionTitle { get; set; }
    public string? DepartmentName { get; set; }
    public List<EmployeeOrgChartDto> Subordinates { get; set; } = new();
}
