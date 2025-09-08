using MediatR;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public ResetPasswordCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        return await _userRepository.ResetUserPasswordAsync(
            request.TenantId,
            request.UserId,
            request.NewPassword,
            cancellationToken);
    }
}