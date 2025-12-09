namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

/// <summary>
/// Request to complete setup with package selection
/// Company billing information is collected later when user creates first invoice
/// </summary>
public sealed record CompleteSetupRequest
{
    /// <summary>
    /// Ready package ID (mutually exclusive with CustomPackage)
    /// </summary>
    public Guid? PackageId { get; init; }

    /// <summary>
    /// Custom package configuration (mutually exclusive with PackageId)
    /// </summary>
    public CustomPackageRequest? CustomPackage { get; init; }
}

/// <summary>
/// Custom package configuration for setup
/// </summary>
public sealed record CustomPackageRequest
{
    public List<string> SelectedModuleCodes { get; init; } = new();
    public string BillingCycle { get; init; } = "monthly";
    public int UserCount { get; init; } = 1;
    public string? StoragePlanCode { get; init; }
    public List<string>? SelectedAddOnCodes { get; init; }
    public string? IndustryCode { get; init; }
}
