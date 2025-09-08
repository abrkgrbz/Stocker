using MediatR;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class ToggleUserStatusCommandHandler : IRequestHandler<ToggleUserStatusCommand, ToggleUserStatusResult>
{
    private readonly IUserRepository _userRepository;

    public ToggleUserStatusCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ToggleUserStatusResult> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        var success = await _userRepository.ToggleUserStatusAsync(
            request.TenantId,
            request.UserId,
            cancellationToken);

        // Get the updated user to return current status
        if (success)
        {
            var user = await _userRepository.GetTenantUserByIdAsync(
                request.TenantId,
                request.UserId,
                cancellationToken);

            return new ToggleUserStatusResult
            {
                IsActive = user?.IsActive ?? false
            };
        }

        return new ToggleUserStatusResult
        {
            IsActive = false
        };
    }
}