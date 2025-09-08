using MediatR;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;

    public CreateUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Note: In a real implementation, this would create a MasterUser first and then a TenantUser
        // For now, we'll use a temporary MasterUserId
        var masterUserId = Guid.NewGuid();
        
        // Create value objects
        var emailResult = Stocker.Domain.Common.ValueObjects.Email.Create(request.Email);
        if (emailResult.IsFailure)
        {
            return new UserDto(); // Should handle error properly
        }
        
        Stocker.Domain.Common.ValueObjects.PhoneNumber? phone = null;
        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            var phoneResult = Stocker.Domain.Common.ValueObjects.PhoneNumber.Create(request.Phone);
            if (phoneResult.IsSuccess)
            {
                phone = phoneResult.Value;
            }
        }

        // Use factory method to create TenantUser
        var user = TenantUser.Create(
            request.TenantId,
            masterUserId,
            request.Username,
            emailResult.Value,
            request.FirstName,
            request.LastName,
            phone: phone,
            title: request.CreatedBy
        );

        var createdUser = await _userRepository.CreateTenantUserAsync(user, cancellationToken);

        return new UserDto
        {
            Id = createdUser.Id,
            Username = createdUser.Username,
            Email = createdUser.Email.Value,
            FirstName = createdUser.FirstName,
            LastName = createdUser.LastName,
            Phone = createdUser.Phone?.Value,
            Department = request.Department ?? "Default",
            Branch = request.Branch ?? "Merkez",
            Role = request.Role,
            IsActive = createdUser.Status == Stocker.Domain.Tenant.Enums.TenantUserStatus.Active,
            CreatedDate = createdUser.CreatedAt
        };
    }
}