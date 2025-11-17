using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Onboarding.Commands.CompleteOnboarding;

public sealed record CompleteOnboardingCommand : IRequest<Result<CompleteOnboardingResponse>>
{
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
    public string? Sector { get; init; }
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCode { get; init; } = string.Empty;
    public string PackageId { get; init; } = string.Empty;
    public string? ContactPhone { get; init; }
}
