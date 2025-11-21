namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

public sealed record CompleteSetupRequest
{
    public Guid PackageId { get; init; }
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCode { get; init; } = string.Empty; // Deprecated - no longer used, tenant code is used instead
    public string? Sector { get; init; }
    public string? EmployeeCount { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? TaxOffice { get; init; }
    public string? TaxNumber { get; init; }
}
