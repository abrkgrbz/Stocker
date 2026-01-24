using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface ISalesPipelineRepository : IRepository<SalesPipeline>
{
    Task<SalesPipeline?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<SalesPipeline?> GetWithStagesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SalesPipeline?> GetDefaultAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesPipeline>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SalesPipeline>> GetByTypeAsync(PipelineType type, CancellationToken cancellationToken = default);
}
