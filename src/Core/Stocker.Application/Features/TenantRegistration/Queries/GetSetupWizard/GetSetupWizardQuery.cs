using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;

public sealed class GetSetupWizardQuery : IRequest<Result<TenantSetupWizardDto>>
{
    public Guid TenantId { get; set; }
}