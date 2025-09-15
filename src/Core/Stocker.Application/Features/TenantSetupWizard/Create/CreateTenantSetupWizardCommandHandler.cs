using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupWizard.Create;

public sealed class CreateTenantSetupWizardCommandHandler : IRequestHandler<CreateTenantSetupWizardCommand, Result<TenantSetupWizardDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateTenantSetupWizardCommandHandler> _logger;

    public CreateTenantSetupWizardCommandHandler(IMasterDbContext context, ILogger<CreateTenantSetupWizardCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TenantSetupWizardDto>> Handle(CreateTenantSetupWizardCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Parse wizard type
            if (!Enum.TryParse<WizardType>(request.WizardType, out var wizardType))
            {
                wizardType = WizardType.InitialSetup;
            }

            // Create setup wizard  
            var wizard = Domain.Master.Entities.TenantSetupWizard.Create(
                tenantId: request.TenantId,
                wizardType: wizardType,
                totalSteps: 6,
                startedBy: "System");

            _context.TenantSetupWizards.Add(wizard);
            await _context.SaveChangesAsync(cancellationToken);

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

            _logger.LogInformation("Setup wizard created for tenant {TenantId}", request.TenantId);

            return Result<TenantSetupWizardDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setup wizard for tenant {TenantId}", request.TenantId);
            return Result<TenantSetupWizardDto>.Failure(Error.Failure("Wizard.CreateFailed", $"Wizard oluşturulurken hata oluştu: {ex.Message}"));
        }
    }
}