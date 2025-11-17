namespace Stocker.Application.Features.Onboarding.Commands.CompleteOnboarding;

public sealed record CompleteOnboardingResponse
{
    public Guid WizardId { get; init; }
    public bool IsCompleted { get; init; }
    public string Message { get; init; } = string.Empty;
}
