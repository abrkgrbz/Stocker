using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface ICustomerSegmentRepository : IRepository<CustomerSegment>
{
    Task<CustomerSegment?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<CustomerSegment?> GetDefaultAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerSegment>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerSegment>> GetByPriorityAsync(SegmentPriority priority, CancellationToken cancellationToken = default);
}
