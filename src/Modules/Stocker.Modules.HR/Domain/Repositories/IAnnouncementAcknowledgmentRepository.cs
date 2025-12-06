using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for AnnouncementAcknowledgment entity
/// </summary>
public interface IAnnouncementAcknowledgmentRepository : IHRRepository<AnnouncementAcknowledgment>
{
    /// <summary>
    /// Gets acknowledgments for an announcement
    /// </summary>
    Task<IReadOnlyList<AnnouncementAcknowledgment>> GetByAnnouncementAsync(int announcementId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets acknowledgments by employee
    /// </summary>
    Task<IReadOnlyList<AnnouncementAcknowledgment>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets acknowledgment for a specific announcement and employee
    /// </summary>
    Task<AnnouncementAcknowledgment?> GetByAnnouncementAndEmployeeAsync(int announcementId, int employeeId, CancellationToken cancellationToken = default);
}
