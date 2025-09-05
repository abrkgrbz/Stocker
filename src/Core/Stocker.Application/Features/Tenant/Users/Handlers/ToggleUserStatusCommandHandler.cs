using MediatR;
using Stocker.Application.Features.Tenant.Users.Commands;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class ToggleUserStatusCommandHandler : IRequestHandler<ToggleUserStatusCommand, ToggleUserStatusResult>
{
    public Task<ToggleUserStatusResult> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        // Mock implementation - will be replaced when ready
        var result = new ToggleUserStatusResult
        {
            IsActive = true // Mock: toggled to active
        };
        
        return Task.FromResult(result);
    }
}