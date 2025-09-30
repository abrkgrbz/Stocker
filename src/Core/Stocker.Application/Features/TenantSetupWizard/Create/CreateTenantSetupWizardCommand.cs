using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupWizard.Create;

public sealed class CreateTenantSetupWizardCommand : IRequest<Result<TenantSetupWizardDto>>
{
    // TenantId removed - each tenant has its own database
    public string WizardType { get; set; } = "Onboarding";
}