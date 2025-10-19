namespace Stocker.Shared.Contracts.CRM;

/// <summary>
/// Cross-module contract for CRM lead operations
/// Used by Marketing and Sales modules to interact with CRM leads
/// </summary>
public interface ICrmLeadService
{
    /// <summary>
    /// Get lead by ID
    /// </summary>
    Task<LeadDto?> GetLeadByIdAsync(Guid leadId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get lead by email
    /// </summary>
    Task<LeadDto?> GetLeadByEmailAsync(string email, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create lead from marketing campaign
    /// </summary>
    Task<Guid> CreateLeadFromCampaignAsync(CreateLeadDto leadData, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update lead score (called by Marketing module)
    /// </summary>
    Task<bool> UpdateLeadScoreAsync(Guid leadId, Guid tenantId, int newScore, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get qualified leads for sales team
    /// </summary>
    Task<IEnumerable<LeadDto>> GetQualifiedLeadsAsync(Guid tenantId, int minScore, CancellationToken cancellationToken = default);

    /// <summary>
    /// Convert lead to customer (returns new customer ID)
    /// </summary>
    Task<Guid> ConvertLeadToCustomerAsync(Guid leadId, Guid tenantId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for cross-module lead data transfer
/// </summary>
public record LeadDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Company { get; init; }
    public string? JobTitle { get; init; }
    public string LeadSource { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int Score { get; init; }
    public bool IsQualified { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// DTO for creating a lead from external modules
/// </summary>
public record CreateLeadDto
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Company { get; init; }
    public string? JobTitle { get; init; }
    public string LeadSource { get; init; } = string.Empty;
    public string? Notes { get; init; }
}
