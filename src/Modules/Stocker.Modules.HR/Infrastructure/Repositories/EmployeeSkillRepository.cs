using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmployeeSkill entity
/// </summary>
public class EmployeeSkillRepository : BaseRepository<EmployeeSkill>, IEmployeeSkillRepository
{
    public EmployeeSkillRepository(HRDbContext context) : base(context)
    {
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.EmployeeId == employeeId)
            .OrderByDescending(es => es.IsPrimary)
            .ThenBy(es => es.SkillName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetBySkillIdAsync(int skillId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.SkillId == skillId)
            .OrderByDescending(es => es.ProficiencyLevel)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetBySkillNameAsync(string skillName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.SkillName == skillName)
            .OrderByDescending(es => es.ProficiencyLevel)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetByCategoryAsync(SkillCategory category, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.Category == category)
            .OrderBy(es => es.SkillName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetByProficiencyLevelAsync(ProficiencyLevel level, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.ProficiencyLevel == level)
            .OrderBy(es => es.SkillName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetVerifiedSkillsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.IsVerified)
            .OrderBy(es => es.SkillName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetCertifiedSkillsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.IsCertified)
            .OrderBy(es => es.SkillName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetExpiringCertificationsAsync(int daysThreshold = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(daysThreshold);

        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted &&
                   es.IsCertified &&
                   es.CertificationExpiryDate.HasValue &&
                   es.CertificationExpiryDate.Value >= today &&
                   es.CertificationExpiryDate.Value <= endDate)
            .OrderBy(es => es.CertificationExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetPrimarySkillsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.IsPrimary)
            .OrderBy(es => es.SkillName)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetMentorsForSkillAsync(string skillName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.SkillName == skillName && es.CanMentor)
            .OrderByDescending(es => es.ProficiencyLevel)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<EmployeeSkill>> GetTrainersForSkillAsync(string skillName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(es => es.Employee)
            .Include(es => es.Skill)
            .Where(es => !es.IsDeleted && es.SkillName == skillName && es.CanTrain)
            .OrderByDescending(es => es.ProficiencyLevel)
            .ToListAsync(cancellationToken);
    }
}
