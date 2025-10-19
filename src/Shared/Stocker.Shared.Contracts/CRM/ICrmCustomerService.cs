namespace Stocker.Shared.Contracts.CRM;

/// <summary>
/// Cross-module contract for CRM customer operations
/// Used by other modules (Sales, Finance, Inventory) to interact with CRM customers
/// </summary>
public interface ICrmCustomerService
{
    /// <summary>
    /// Get customer by ID
    /// </summary>
    Task<CustomerDto?> GetCustomerByIdAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get customer by email
    /// </summary>
    Task<CustomerDto?> GetCustomerByEmailAsync(string email, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if customer exists
    /// </summary>
    Task<bool> CustomerExistsAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all active customers for a tenant
    /// </summary>
    Task<IEnumerable<CustomerDto>> GetActiveCustomersAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update customer credit limit (used by Finance module)
    /// </summary>
    Task<bool> UpdateCreditLimitAsync(Guid customerId, Guid tenantId, decimal newLimit, CancellationToken cancellationToken = default);

    /// <summary>
    /// Record customer transaction (used by Sales/Finance modules)
    /// </summary>
    Task RecordTransactionAsync(Guid customerId, Guid tenantId, decimal amount, string transactionType, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for cross-module customer data transfer
/// </summary>
public record CustomerDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public string CompanyName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Website { get; init; }
    public string? Industry { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? Country { get; init; }
    public string? PostalCode { get; init; }
    public decimal? AnnualRevenue { get; init; }
    public int? NumberOfEmployees { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}
