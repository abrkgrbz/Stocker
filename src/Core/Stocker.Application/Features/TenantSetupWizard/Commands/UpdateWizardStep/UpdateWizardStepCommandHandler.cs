using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Interfaces;
using System.Text.Json;

namespace Stocker.Application.Features.TenantSetupWizard.Commands.UpdateWizardStep;

public sealed class UpdateWizardStepCommandHandler : IRequestHandler<UpdateWizardStepCommand, Result<TenantSetupWizardDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMigrationService _migrationService;
    private readonly ITenantService _tenantService;
    private readonly ILogger<UpdateWizardStepCommandHandler> _logger;

    public UpdateWizardStepCommandHandler(
        ITenantDbContext context, 
        IMigrationService migrationService,
        ITenantService tenantService,
        ILogger<UpdateWizardStepCommandHandler> logger)
    {
        _context = context;
        _migrationService = migrationService;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<TenantSetupWizardDto>> Handle(UpdateWizardStepCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var wizard = await _context.SetupWizards
                .Include(x => x.Steps)
                .FirstOrDefaultAsync(x => x.Id == request.WizardId, cancellationToken);

            if (wizard == null)
                return Result<TenantSetupWizardDto>.Failure(Error.NotFound("Wizard.NotFound", "Wizard bulunamadı."));

            // Step data should be saved directly to the step
            var stepDataJson = request.StepData != null && request.StepData.Count > 0 
                ? JsonSerializer.Serialize(request.StepData) 
                : null;

            // Process action
            switch (request.Action.ToLower())
            {
                case "complete":
                    wizard.CompleteCurrentStep("User", stepDataJson);
                    _logger.LogInformation("Wizard step completed. WizardId: {WizardId}, Step: {Step}", 
                        wizard.Id, wizard.CurrentStepIndex);
                    break;

                case "skip":
                    var currentStep = wizard.Steps.FirstOrDefault(s => s.Status == Domain.Tenant.Entities.StepStatus.Current);
                    if (currentStep == null || !currentStep.CanSkip)
                        return Result<TenantSetupWizardDto>.Failure(Error.Validation("Step.CannotSkip", "Bu adım atlanamaz."));
                    wizard.SkipCurrentStep("User", request.Reason ?? "User skipped");
                    break;

                case "previous":
                    // Previous step functionality not available in new API
                    return Result<TenantSetupWizardDto>.Failure(Error.Validation("Wizard.UnsupportedAction", "Previous step not supported"));

                case "pause":
                    wizard.PauseWizard();
                    break;

                case "resume":
                    wizard.ResumeWizard();
                    break;

                case "requesthelp":
                    // Help request functionality not available in new API
                    _logger.LogInformation("Help requested for wizard {WizardId}: {Notes}", wizard.Id, request.Notes);
                    break;

                default:
                    return Result<TenantSetupWizardDto>.Failure(Error.Validation("Wizard.InvalidAction", $"Geçersiz işlem: {request.Action}"));
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Create DTO first
            var dto = new TenantSetupWizardDto
            {
                Id = wizard.Id,
                TenantId = Guid.Empty, // Tenant ID tracked separately
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

            return Result<TenantSetupWizardDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating wizard step");
            return Result<TenantSetupWizardDto>.Failure(Error.Failure("Wizard.UpdateFailed", $"İşlem sırasında hata oluştu: {ex.Message}"));
        }
    }
}