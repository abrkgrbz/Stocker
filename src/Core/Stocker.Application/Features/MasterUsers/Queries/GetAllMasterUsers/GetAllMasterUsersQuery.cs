using MediatR;
using Stocker.Application.DTOs.MasterUser;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Queries.GetAllMasterUsers;

public class GetAllMasterUsersQuery : IRequest<Result<List<MasterUserDto>>>
{
    public bool IncludeInactive { get; set; } = false;
    public string? SearchTerm { get; set; }
    public string? Role { get; set; }
    public Guid? TenantId { get; set; }
}