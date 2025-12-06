using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for EmployeeDocument entity
/// </summary>
public interface IEmployeeDocumentRepository : IHRRepository<EmployeeDocument>
{
    /// <summary>
    /// Gets documents by employee
    /// </summary>
    Task<IReadOnlyList<EmployeeDocument>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets documents by type
    /// </summary>
    Task<IReadOnlyList<EmployeeDocument>> GetByTypeAsync(DocumentType documentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets documents by employee and type
    /// </summary>
    Task<IReadOnlyList<EmployeeDocument>> GetByEmployeeAndTypeAsync(int employeeId, DocumentType documentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expiring documents
    /// </summary>
    Task<IReadOnlyList<EmployeeDocument>> GetExpiringAsync(int daysThreshold = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expired documents
    /// </summary>
    Task<IReadOnlyList<EmployeeDocument>> GetExpiredAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unverified documents
    /// </summary>
    Task<IReadOnlyList<EmployeeDocument>> GetUnverifiedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if document number exists
    /// </summary>
    Task<bool> ExistsWithNumberAsync(string documentNumber, DocumentType documentType, int? excludeDocumentId = null, CancellationToken cancellationToken = default);
}
