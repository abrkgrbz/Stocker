using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    public Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Mock implementation - will be replaced when ready
        var user = new UserDto
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            Department = request.Department ?? "Default",
            Branch = request.Branch ?? "Merkez",
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        };

        return Task.FromResult(user);
    }
}