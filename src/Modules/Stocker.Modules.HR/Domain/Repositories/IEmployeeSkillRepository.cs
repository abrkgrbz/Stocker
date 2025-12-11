using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for EmployeeSkill entity
/// </summary>
public interface IEmployeeSkillRepository : IHRRepository<EmployeeSkill>
{
    /// <summary>
    /// Gets all skills for a specific employee
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all employees with a specific skill
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetBySkillIdAsync(int skillId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all employees with a specific skill name
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetBySkillNameAsync(string skillName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets skills by category
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetByCategoryAsync(SkillCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets skills by proficiency level
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetByProficiencyLevelAsync(ProficiencyLevel level, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets verified skills
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetVerifiedSkillsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets certified skills
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetCertifiedSkillsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets skills with expiring certifications
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetExpiringCertificationsAsync(int daysThreshold = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets primary skills for employees
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetPrimarySkillsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees who can mentor for a specific skill
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetMentorsForSkillAsync(string skillName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employees who can train for a specific skill
    /// </summary>
    System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetTrainersForSkillAsync(string skillName, CancellationToken cancellationToken = default);
}
