using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

public interface IOpportunityRepository : IRepository<Opportunity>
{
    Task<Opportunity?> GetByNumberAsync(string opportunityNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Opportunity>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Opportunity>> GetBySalesPersonIdAsync(Guid salesPersonId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Opportunity>> GetByStageAsync(OpportunityStage stage, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Opportunity>> GetByPipelineIdAsync(Guid pipelineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Opportunity>> GetOpenAsync(CancellationToken cancellationToken = default);
    Task<string> GenerateOpportunityNumberAsync(CancellationToken cancellationToken = default);
}
