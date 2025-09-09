using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetSetupChecklist;

public sealed class GetSetupChecklistQuery : IRequest<Result<TenantSetupChecklistDto>>
{
    public Guid TenantId { get; set; }
}