using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, RoleDto?>
{
    private readonly IUserRepository _userRepository;

    public GetRoleByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<RoleDto?> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        return await _userRepository.GetRoleByIdAsync(request.TenantId, request.RoleId, cancellationToken);
    }
}
