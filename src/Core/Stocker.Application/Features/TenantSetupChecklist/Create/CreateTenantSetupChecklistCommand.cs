using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantSetupChecklist.Create;

public sealed class CreateTenantSetupChecklistCommand : IRequest<Result<TenantSetupChecklistDto>>
{
    // TenantId removed - each tenant has its own database
}