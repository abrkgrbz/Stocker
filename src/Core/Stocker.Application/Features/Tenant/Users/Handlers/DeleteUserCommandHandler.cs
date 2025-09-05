using MediatR;
using Stocker.Application.Features.Tenant.Users.Commands;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, bool>
{
    public Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        // Mock implementation - will be replaced when ready
        return Task.FromResult(true);
    }
}