using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.RemoveFromTenant;

public class RemoveFromTenantCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string? RemovedBy { get; set; }
}