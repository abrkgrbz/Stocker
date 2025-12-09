namespace Stocker.Application.Features.Onboarding.Commands.CompleteOnboarding;

public sealed record CompleteOnboardingResponse
{
    public Guid WizardId { get; init; }
    public Guid TenantId { get; init; }
    public bool IsCompleted { get; init; }
    public bool ProvisioningStarted { get; init; }
    public string Message { get; init; } = string.Empty;
}
