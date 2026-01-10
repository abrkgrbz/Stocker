using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Employee Events

/// <summary>
/// Raised when a new employee is created
/// </summary>
public sealed record EmployeeCreatedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeCode,
    string FullName,
    string Email,
    int DepartmentId,
    string DepartmentName,
    int PositionId,
    string PositionName,
    DateTime HireDate) : DomainEvent;

/// <summary>
/// Raised when employee information is updated
/// </summary>
public sealed record EmployeeUpdatedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string FullName,
    string Email) : DomainEvent;

/// <summary>
/// Raised when an employee is assigned to a department
/// </summary>
public sealed record EmployeeDepartmentChangedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    int OldDepartmentId,
    string OldDepartmentName,
    int NewDepartmentId,
    string NewDepartmentName) : DomainEvent;

/// <summary>
/// Raised when an employee is promoted
/// </summary>
public sealed record EmployeePromotedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    int OldPositionId,
    string OldPositionName,
    int NewPositionId,
    string NewPositionName,
    decimal? SalaryIncrease) : DomainEvent;

/// <summary>
/// Raised when an employee's salary is updated
/// </summary>
public sealed record EmployeeSalaryUpdatedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    decimal OldSalary,
    decimal NewSalary,
    string Currency) : DomainEvent;

/// <summary>
/// Raised when an employee is terminated
/// </summary>
public sealed record EmployeeTerminatedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime TerminationDate,
    string? Reason) : DomainEvent;

/// <summary>
/// Raised when an employee resigns
/// </summary>
public sealed record EmployeeResignedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime ResignationDate,
    string? Reason) : DomainEvent;

/// <summary>
/// Raised when employee probation period ends
/// </summary>
public sealed record EmployeeProbationCompletedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime ProbationEndDate,
    bool IsSuccessful) : DomainEvent;

/// <summary>
/// Raised when an employee's probation is about to end
/// </summary>
public sealed record EmployeeProbationEndingDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime ProbationEndDate,
    int DaysRemaining,
    int ManagerId) : DomainEvent;

/// <summary>
/// Raised when an employee's contract is about to expire
/// </summary>
public sealed record EmployeeContractExpiringDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime ContractEndDate,
    int DaysRemaining,
    int ManagerId) : DomainEvent;

/// <summary>
/// Raised when employee work anniversary is approaching
/// </summary>
public sealed record EmployeeWorkAnniversaryDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    int YearsOfService,
    DateTime AnniversaryDate) : DomainEvent;

/// <summary>
/// Raised when employee birthday is approaching
/// </summary>
public sealed record EmployeeBirthdayDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime BirthDate) : DomainEvent;

#endregion
