using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.DeleteMasterUser;

public class DeleteMasterUserCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
}