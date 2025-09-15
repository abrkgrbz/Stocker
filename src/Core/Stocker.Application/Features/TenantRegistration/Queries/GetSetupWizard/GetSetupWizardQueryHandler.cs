using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using StepCategory = Stocker.Domain.Master.Enums.StepCategory;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;

public sealed class GetSetupWizardQueryHandler : IRequestHandler<GetSetupWizardQuery, Result<TenantSetupWizardDto>>
{
    private readonly IMasterDbContext _context;

    public GetSetupWizardQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TenantSetupWizardDto>> Handle(GetSetupWizardQuery request, CancellationToken cancellationToken)
    {
        var wizard = await _context.TenantSetupWizards
            .Where(x => x.TenantId == request.TenantId && x.WizardType == WizardType.InitialSetup)
            .FirstOrDefaultAsync(cancellationToken);

        if (wizard == null)
        {
            // Create new wizard if not exists
            wizard = Domain.Master.Entities.TenantSetupWizard.Create(
                tenantId: request.TenantId,
                wizardType: WizardType.InitialSetup,
                totalSteps: 6,
                startedBy: "System");

            wizard.StartWizard();
            wizard.UpdateStepDetails(
                "Şirket Bilgileri",
                "Temel şirket bilgilerini tamamlayın",
                Domain.Master.Entities.StepCategory.Required,
                true,
                false);

            _context.TenantSetupWizards.Add(wizard);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var dto = new TenantSetupWizardDto
        {
            Id = wizard.Id,
            TenantId = wizard.TenantId,
            WizardType = wizard.WizardType.ToString(),
            Status = wizard.Status.ToString(),
            TotalSteps = wizard.TotalSteps,
            CompletedSteps = wizard.CompletedSteps,
            CurrentStep = wizard.CurrentStep,
            ProgressPercentage = wizard.ProgressPercentage,
            CurrentStepName = wizard.CurrentStepName,
            CurrentStepDescription = wizard.CurrentStepDescription,
            IsCurrentStepRequired = wizard.IsCurrentStepRequired,
            CanSkipCurrentStep = wizard.CanSkipCurrentStep,
            StartedAt = wizard.StartedAt,
            CompletedAt = wizard.CompletedAt
        };

        return Result<TenantSetupWizardDto>.Success(dto);
    }
}