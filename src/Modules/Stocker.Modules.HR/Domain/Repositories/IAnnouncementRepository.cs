using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Announcement entity
/// </summary>
public interface IAnnouncementRepository : IHRRepository<Announcement>
{
    /// <summary>
    /// Gets an announcement with acknowledgments
    /// </summary>
    Task<Announcement?> GetWithAcknowledgmentsAsync(int announcementId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets published announcements
    /// </summary>
    Task<IReadOnlyList<Announcement>> GetPublishedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active (not expired) announcements
    /// </summary>
    Task<IReadOnlyList<Announcement>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pinned announcements
    /// </summary>
    Task<IReadOnlyList<Announcement>> GetPinnedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets announcements by department
    /// </summary>
    Task<IReadOnlyList<Announcement>> GetByDepartmentAsync(int? departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets announcements requiring acknowledgment
    /// </summary>
    Task<IReadOnlyList<Announcement>> GetRequiringAcknowledgmentAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unacknowledged announcements for an employee
    /// </summary>
    Task<IReadOnlyList<Announcement>> GetUnacknowledgedByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets acknowledgment statistics for an announcement
    /// </summary>
    Task<(int TotalTarget, int Acknowledged)> GetAcknowledgmentStatsAsync(int announcementId, CancellationToken cancellationToken = default);
}
