using MediatR;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        // Get the existing user first
        var existingUser = await _userRepository.GetTenantUserByIdAsync(
            request.TenantId,
            request.UserId,
            cancellationToken);

        if (existingUser == null)
            return false;

        // Create value objects for update
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return false;
        }
        
        var emailResult = Stocker.Domain.Common.ValueObjects.Email.Create(request.Email);
        if (emailResult.IsFailure)
        {
            return false; // Should handle error properly
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

        // Create a temporary TenantUser with updated values
        // Note: In reality, we should call UpdateProfile on the existing user  
        var userUpdate = TenantUser.Create(
            request.TenantId,
            (existingUser as dynamic).MasterUserId,
            (existingUser as dynamic).Username,
            emailResult.Value,
            request.FirstName,
            request.LastName,
            phone: phone
        );

        var result = await _userRepository.UpdateTenantUserAsync(
            request.TenantId, 
            request.UserId, 
            userUpdate, 
            cancellationToken);

        return result != null;
    }
}