using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Onboarding.Queries.GetOnboardingStatus;

public sealed record GetOnboardingStatusQuery : IRequest<Result<OnboardingStatusResponse>>
{
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
}
