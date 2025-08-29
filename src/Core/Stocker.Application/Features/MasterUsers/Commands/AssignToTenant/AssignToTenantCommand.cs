using MediatR;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.AssignToTenant;

public class AssignToTenantCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public UserType UserType { get; set; } = UserType.Regular;
    public string? AssignedBy { get; set; }
}