using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for CustomerContract entity
/// </summary>
public interface ICustomerContractRepository : IRepository<CustomerContract>
{
    /// <summary>
    /// Gets the active contract for a customer
    /// </summary>
    Task<CustomerContract?> GetActiveContractByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets contract by contract number
    /// </summary>
    Task<CustomerContract?> GetByContractNumberAsync(
        string contractNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all contracts for a customer including expired ones
    /// </summary>
    Task<IReadOnlyList<CustomerContract>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets contracts by status
    /// </summary>
    Task<IReadOnlyList<CustomerContract>> GetByStatusAsync(
        ContractStatus status,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets contracts expiring within specified days
    /// </summary>
    Task<IReadOnlyList<CustomerContract>> GetExpiringContractsAsync(
        int daysUntilExpiration,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets contracts requiring renewal notification
    /// </summary>
    Task<IReadOnlyList<CustomerContract>> GetContractsRequiringRenewalNotificationAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique contract number
    /// </summary>
    Task<string> GenerateContractNumberAsync(CancellationToken cancellationToken = default);
}
