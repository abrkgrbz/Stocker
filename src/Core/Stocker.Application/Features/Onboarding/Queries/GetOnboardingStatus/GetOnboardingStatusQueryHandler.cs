using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Interfaces;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Onboarding.Queries.GetOnboardingStatus;

public sealed class GetOnboardingStatusQueryHandler
    : IRequestHandler<GetOnboardingStatusQuery, Result<OnboardingStatusResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetOnboardingStatusQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OnboardingStatusResponse>> Handle(
        GetOnboardingStatusQuery request,
        CancellationToken cancellationToken)
    {
        // Check if there's an active wizard for this tenant
        var wizard = await _context.SetupWizards
            .AsNoTracking()
            .Where(w => w.WizardType == WizardType.InitialSetup)
            .OrderByDescending(w => w.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (wizard == null)
        {
            // No wizard exists, needs onboarding
            return Result<OnboardingStatusResponse>.Success(new OnboardingStatusResponse
            {
                Id = null,
                WizardType = (int)WizardType.InitialSetup,
                Status = (int)WizardStatus.NotStarted,
                CurrentStepIndex = 0,
                TotalSteps = 4,
                ProgressPercentage = 0,
                RequiresOnboarding = true
            });
        }

        // Wizard exists, check if completed
        var requiresOnboarding = wizard.Status != WizardStatus.Completed;

        return Result<OnboardingStatusResponse>.Success(new OnboardingStatusResponse
        {
            Id = wizard.Id,
            WizardType = (int)wizard.WizardType,
            Status = (int)wizard.Status,
            CurrentStepIndex = wizard.CurrentStepIndex,
            TotalSteps = wizard.TotalSteps,
            ProgressPercentage = wizard.ProgressPercentage,
            RequiresOnboarding = requiresOnboarding
        });
    }
}
