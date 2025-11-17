namespace Stocker.Application.Features.Onboarding.Queries.GetOnboardingStatus;

public sealed record OnboardingStatusResponse
{
    public Guid? Id { get; init; }
    public int WizardType { get; init; }
    public int Status { get; init; }
    public int CurrentStepIndex { get; init; }
    public int TotalSteps { get; init; }
    public decimal ProgressPercentage { get; init; }
    public bool RequiresOnboarding { get; init; }
}
