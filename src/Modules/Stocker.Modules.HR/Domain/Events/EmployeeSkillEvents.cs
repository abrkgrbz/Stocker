using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region EmployeeSkill Events

/// <summary>
/// Raised when a skill is added to an employee
/// </summary>
public sealed record SkillAddedToEmployeeDomainEvent(
    int EmployeeSkillId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string SkillName,
    string ProficiencyLevel) : DomainEvent;

/// <summary>
/// Raised when an employee skill proficiency is updated
/// </summary>
public sealed record SkillProficiencyUpdatedDomainEvent(
    int EmployeeSkillId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string SkillName,
    string OldLevel,
    string NewLevel) : DomainEvent;

/// <summary>
/// Raised when a skill is endorsed
/// </summary>
public sealed record SkillEndorsedDomainEvent(
    int EmployeeSkillId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string SkillName,
    int EndorsedById,
    string EndorserName) : DomainEvent;

/// <summary>
/// Raised when a skill is removed from an employee
/// </summary>
public sealed record SkillRemovedFromEmployeeDomainEvent(
    int EmployeeSkillId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string SkillName) : DomainEvent;

#endregion
