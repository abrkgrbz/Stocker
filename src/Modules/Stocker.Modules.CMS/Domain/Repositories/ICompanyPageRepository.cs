using Stocker.Modules.CMS.Domain.Entities;

namespace Stocker.Modules.CMS.Domain.Repositories;

public interface ITeamMemberRepository
{
    Task<TeamMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<TeamMember>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TeamMember>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TeamMember>> GetLeadershipAsync(CancellationToken cancellationToken = default);
    Task<TeamMember> AddAsync(TeamMember entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(TeamMember entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ICompanyValueRepository
{
    Task<CompanyValue?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<CompanyValue>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<CompanyValue>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<CompanyValue> AddAsync(CompanyValue entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(CompanyValue entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IContactInfoRepository
{
    Task<ContactInfo?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ContactInfo>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ContactInfo>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ContactInfo>> GetByTypeAsync(string type, CancellationToken cancellationToken = default);
    Task<ContactInfo> AddAsync(ContactInfo entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(ContactInfo entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ISocialLinkRepository
{
    Task<SocialLink?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<SocialLink>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<SocialLink>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<SocialLink> AddAsync(SocialLink entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(SocialLink entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
