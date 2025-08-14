using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.ToggleMasterUserStatus;

public class ToggleMasterUserStatusCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
    public string? ModifiedBy { get; set; }
}