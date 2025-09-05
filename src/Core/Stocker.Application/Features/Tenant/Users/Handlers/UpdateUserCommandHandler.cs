using MediatR;
using Stocker.Application.Features.Tenant.Users.Commands;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    public Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        // Mock implementation - will be replaced when ready
        return Task.FromResult(true);
    }
}