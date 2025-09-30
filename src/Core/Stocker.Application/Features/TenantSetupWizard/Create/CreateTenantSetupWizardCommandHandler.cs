using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupWizard.Create;

public sealed class CreateTenantSetupWizardCommandHandler : IRequestHandler<CreateTenantSetupWizardCommand, Result<TenantSetupWizardDto>>
{
    private readonly ITenantDbContext _context;
    private readonly ILogger<CreateTenantSetupWizardCommandHandler> _logger;

    public CreateTenantSetupWizardCommandHandler(ITenantDbContext context, ILogger<CreateTenantSetupWizardCommandHandler> logger)
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
            var wizard = SetupWizard.Create(
                wizardType: wizardType,
                startedBy: "System");

            _context.SetupWizards.Add(wizard);
            await _context.SaveChangesAsync(cancellationToken);

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
                CurrentStepName = wizard.Steps.FirstOrDefault(s => s.Status == Domain.Tenant.Entities.StepStatus.Current)?.Title ?? string.Empty,
                CurrentStepDescription = wizard.Steps.FirstOrDefault(s => s.Status == Domain.Tenant.Entities.StepStatus.Current)?.Description ?? string.Empty,
                IsCurrentStepRequired = wizard.Steps.FirstOrDefault(s => s.Status == Domain.Tenant.Entities.StepStatus.Current)?.IsRequired ?? false,
                CanSkipCurrentStep = wizard.Steps.FirstOrDefault(s => s.Status == Domain.Tenant.Entities.StepStatus.Current)?.CanSkip ?? false,
                StartedAt = wizard.StartedAt,
                CompletedAt = wizard.CompletedAt
            };

            _logger.LogInformation("Setup wizard created for tenant {TenantId}", _context.TenantId);

            return Result<TenantSetupWizardDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setup wizard for tenant {TenantId}", _context.TenantId);
            return Result<TenantSetupWizardDto>.Failure(Error.Failure("Wizard.CreateFailed", $"Wizard oluşturulurken hata oluştu: {ex.Message}"));
        }
    }
}