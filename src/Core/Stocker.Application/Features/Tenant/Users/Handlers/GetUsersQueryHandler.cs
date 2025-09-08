using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, UsersListDto>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UsersListDto> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var result = await _userRepository.GetTenantUsersAsync(
            request.TenantId,
            request.Page,
            request.PageSize,
            request.Search,
            cancellationToken);

        return result;
    }
}