using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMasterDbContext _masterDbContext;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IMasterDbContext masterDbContext)
    {
        _userRepository = userRepository;
        _masterDbContext = masterDbContext;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Check user limit from subscription (if exists)
        var subscription = await _masterDbContext.Subscriptions
            .Include(s => s.Package)
            .ThenInclude(p => p.Limits)
            .Where(s => s.TenantId == request.TenantId && s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif)
            .FirstOrDefaultAsync(cancellationToken);

        // Only check limits if subscription exists (for testing, we allow unlimited users if no subscription)
        if (subscription != null)
        {
            // 2. Get current user count from tenant database
            var currentUserCount = await _userRepository.GetTenantUserCountAsync(request.TenantId, cancellationToken);
            var maxUsers = subscription.Package.Limits.MaxUsers;

            // 3. Check if limit exceeded
            if (currentUserCount >= maxUsers)
            {
                throw new InvalidOperationException($"Kullanıcı limiti aşıldı. Paketiniz maksimum {maxUsers} kullanıcıya izin veriyor. Lütfen paketinizi yükseltin.");
            }
        }

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

        // 4. Assign roles if RoleIds provided
        if (request.RoleIds != null && request.RoleIds.Count > 0)
        {
            foreach (var roleId in request.RoleIds)
            {
                await _userRepository.AssignRoleAsync(request.TenantId, createdUser.Id, roleId, cancellationToken);
            }
        }

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