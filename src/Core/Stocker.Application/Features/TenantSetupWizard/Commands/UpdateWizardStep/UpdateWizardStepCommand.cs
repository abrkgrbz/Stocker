using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupWizard.Commands.UpdateWizardStep;

public sealed class UpdateWizardStepCommand : IRequest<Result<TenantSetupWizardDto>>
{
    public Guid WizardId { get; set; }
    public string Action { get; set; } = string.Empty; // complete, skip, previous, pause, resume, requestHelp
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public Dictionary<string, object>? StepData { get; set; }
}