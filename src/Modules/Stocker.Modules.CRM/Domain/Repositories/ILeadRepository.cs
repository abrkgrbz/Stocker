using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Domain.Repositories;

/// <summary>
/// Repository interface for Lead entity
/// </summary>
public interface ILeadRepository : IRepository<Lead>
{
    /// <summary>
    /// Gets leads by status
    /// </summary>
    Task<IReadOnlyList<Lead>> GetByStatusAsync(LeadStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leads by rating
    /// </summary>
    Task<IReadOnlyList<Lead>> GetByRatingAsync(LeadRating rating, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leads assigned to a specific user
    /// </summary>
    Task<IReadOnlyList<Lead>> GetByAssignedUserAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unassigned leads
    /// </summary>
    Task<IReadOnlyList<Lead>> GetUnassignedLeadsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets qualified leads that haven't been converted
    /// </summary>
    Task<IReadOnlyList<Lead>> GetQualifiedLeadsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets converted leads
    /// </summary>
    Task<IReadOnlyList<Lead>> GetConvertedLeadsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches leads by name, company, or email
    /// </summary>
    Task<IReadOnlyList<Lead>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a lead with the given email exists
    /// </summary>
    Task<bool> ExistsWithEmailAsync(string email, Guid? excludeLeadId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leads by source
    /// </summary>
    Task<IReadOnlyList<Lead>> GetBySourceAsync(string source, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets high-scoring leads
    /// </summary>
    Task<IReadOnlyList<Lead>> GetHighScoringLeadsAsync(int minimumScore = 70, CancellationToken cancellationToken = default);
}