using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;

public sealed class GetSetupWizardQueryHandler : IRequestHandler<GetSetupWizardQuery, Result<TenantSetupWizardDto>>
{
    private readonly ITenantDbContext _context;

    public GetSetupWizardQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TenantSetupWizardDto>> Handle(GetSetupWizardQuery request, CancellationToken cancellationToken)
    {
        // SetupWizard no longer has TenantId - need to track tenant association separately
        var wizard = await _context.SetupWizards
            .Include(x => x.Steps)
            .Where(x => x.WizardType == WizardType.InitialSetup)
            .FirstOrDefaultAsync(cancellationToken);

        if (wizard == null)
        {
            // Create new wizard if not exists
            wizard = SetupWizard.Create(
                wizardType: WizardType.InitialSetup,
                startedBy: "System");

            wizard.StartWizard();

            _context.SetupWizards.Add(wizard);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var dto = new TenantSetupWizardDto
        {
            Id = wizard.Id,
            TenantId = _context.TenantId, // Get from context (database-per-tenant)
            WizardType = wizard.WizardType.ToString(),
            Status = wizard.Status.ToString(),
            TotalSteps = wizard.TotalSteps,
            CompletedSteps = wizard.CompletedSteps,
            CurrentStep = wizard.CurrentStepIndex,
            ProgressPercentage = wizard.ProgressPercentage,
            CurrentStepName = wizard.Steps.FirstOrDefault(s => s.Status == StepStatus.Current)?.Title ?? string.Empty,
            CurrentStepDescription = wizard.Steps.FirstOrDefault(s => s.Status == StepStatus.Current)?.Description ?? string.Empty,
            IsCurrentStepRequired = wizard.Steps.FirstOrDefault(s => s.Status == StepStatus.Current)?.IsRequired ?? false,
            CanSkipCurrentStep = wizard.Steps.FirstOrDefault(s => s.Status == StepStatus.Current)?.CanSkip ?? false,
            StartedAt = wizard.StartedAt,
            CompletedAt = wizard.CompletedAt
        };

        return Result<TenantSetupWizardDto>.Success(dto);
    }
}