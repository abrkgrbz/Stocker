using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<RoleDto>>
{
    private readonly IUserRepository _userRepository;

    public GetRolesQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<RoleDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        return await _userRepository.GetRolesAsync(request.TenantId, cancellationToken);
    }
}