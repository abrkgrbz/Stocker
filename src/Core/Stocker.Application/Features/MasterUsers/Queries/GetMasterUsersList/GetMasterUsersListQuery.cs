using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.MasterUser;

namespace Stocker.Application.Features.MasterUsers.Queries.GetMasterUsersList;

public class GetMasterUsersListQuery : IRequest<Result<List<MasterUserDto>>>
{
    public bool IncludeInactive { get; set; } = false;
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}