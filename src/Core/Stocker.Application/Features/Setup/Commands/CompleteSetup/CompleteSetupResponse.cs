namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

public sealed class CompleteSetupResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid CompanyId { get; set; }
    public Guid SubscriptionId { get; set; }
    public Guid TenantId { get; set; }
    public bool SetupCompleted { get; set; }
    public bool ProvisioningStarted { get; set; }
    public string RedirectUrl { get; set; } = "/dashboard";
}
