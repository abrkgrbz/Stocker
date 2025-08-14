using MediatR;
using Stocker.Application.DTOs.MasterUser;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Queries.GetMasterUserById;

public class GetMasterUserByIdQuery : IRequest<Result<MasterUserDto>>
{
    public Guid UserId { get; set; }
}