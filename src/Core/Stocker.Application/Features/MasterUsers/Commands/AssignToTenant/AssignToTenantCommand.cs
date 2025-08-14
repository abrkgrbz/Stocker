using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.AssignToTenant;

public class AssignToTenantCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string Role { get; set; } = "User";
    public string? AssignedBy { get; set; }
}