using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

/// <summary>
/// Command to complete post-registration setup
/// Collects package selection and company details
/// </summary>
public sealed record CompleteSetupCommand : IRequest<Result<CompleteSetupResponse>>
{
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
    public Guid PackageId { get; init; }

    // Company information
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCode { get; init; } = string.Empty;
    public string? Sector { get; init; }
    public string? EmployeeCount { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? TaxOffice { get; init; }
    public string? TaxNumber { get; init; }
}
