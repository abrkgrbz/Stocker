using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using System.Text.Json;

namespace Stocker.Application.Features.TenantSetupWizard.Commands.UpdateWizardStep;

public sealed class UpdateWizardStepCommandHandler : IRequestHandler<UpdateWizardStepCommand, Result<TenantSetupWizardDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpdateWizardStepCommandHandler> _logger;

    public UpdateWizardStepCommandHandler(IMasterDbContext context, ILogger<UpdateWizardStepCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<TenantSetupWizardDto>> Handle(UpdateWizardStepCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var wizard = await _context.TenantSetupWizards
                .FirstOrDefaultAsync(x => x.Id == request.WizardId, cancellationToken);

            if (wizard == null)
                return Result<TenantSetupWizardDto>.Failure(Error.NotFound("Wizard.NotFound", "Wizard bulunamadı."));

            // Save step data if provided
            if (request.StepData != null && request.StepData.Count > 0)
            {
                wizard.SaveProgress(JsonSerializer.Serialize(request.StepData));
            }

            // Process action
            switch (request.Action.ToLower())
            {
                case "complete":
                    wizard.CompleteCurrentStep();
                    _logger.LogInformation("Wizard step completed. WizardId: {WizardId}, Step: {Step}", 
                        wizard.Id, wizard.CurrentStep);
                    break;

                case "skip":
                    if (!wizard.CanSkipCurrentStep)
                        return Result<TenantSetupWizardDto>.Failure(Error.Validation("Step.CannotSkip", "Bu adım atlanamaz."));
                    wizard.SkipCurrentStep(request.Reason ?? "User skipped");
                    break;

                case "previous":
                    wizard.GoToPreviousStep();
                    break;

                case "pause":
                    wizard.PauseWizard();
                    break;

                case "resume":
                    wizard.ResumeWizard();
                    break;

                case "requesthelp":
                    wizard.RequestHelp(request.Notes ?? "Help requested");
                    break;

                default:
                    return Result<TenantSetupWizardDto>.Failure(Error.Validation("Wizard.InvalidAction", $"Geçersiz işlem: {request.Action}"));
            }

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

            return Result<TenantSetupWizardDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating wizard step");
            return Result<TenantSetupWizardDto>.Failure(Error.Failure("Wizard.UpdateFailed", $"İşlem sırasında hata oluştu: {ex.Message}"));
        }
    }
}