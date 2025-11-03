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
    private readonly IPasswordService _passwordService;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IMasterDbContext masterDbContext,
        IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _masterDbContext = masterDbContext;
        _passwordService = passwordService;
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

        // Validate and hash password
        var passwordValidation = _passwordService.ValidatePassword(request.Password, request.Username, request.Email);
        if (passwordValidation.IsFailure)
        {
            var errorMessage = passwordValidation.Error?.Description ?? "Şifre gereksinimlerini karşılamıyor";
            throw new InvalidOperationException($"Şifre geçersiz: {errorMessage}. Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir.");
        }

        var hashedPassword = _passwordService.HashPassword(request.Password);
        var passwordHash = _passwordService.GetCombinedHash(hashedPassword);

        // Note: MasterUserId is kept for legacy compatibility but tenant users have independent login
        var masterUserId = Guid.Empty;

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

        // Use factory method to create TenantUser with password hash
        var user = TenantUser.Create(
            request.TenantId,
            masterUserId,
            request.Username,
            passwordHash,
            emailResult.Value,
            request.FirstName,
            request.LastName,
            phone: phone,
            title: request.CreatedBy
        );

        var createdUser = await _userRepository.CreateTenantUserAsync(user, cancellationToken);

        // 4. Assign roles if RoleIds provided
        var assignedRoleNames = new List<string>();
        if (request.RoleIds != null && request.RoleIds.Count > 0)
        {
            foreach (var roleId in request.RoleIds)
            {
                await _userRepository.AssignRoleAsync(request.TenantId, createdUser.Id, roleId, cancellationToken);
            }

            // Get the actual assigned role names from the user details
            var userDetails = await _userRepository.GetTenantUserByIdAsync(request.TenantId, createdUser.Id, cancellationToken);
            if (userDetails != null && userDetails.Roles.Count > 0)
            {
                assignedRoleNames = userDetails.Roles.Select(r => r.Name).ToList();
            }
        }
        else if (!string.IsNullOrEmpty(request.Role))
        {
            // Legacy single role support - add the role name if provided
            assignedRoleNames.Add(request.Role);
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
            Roles = assignedRoleNames, // Return actual assigned role names
            IsActive = createdUser.Status == Stocker.Domain.Tenant.Enums.TenantUserStatus.Active,
            CreatedDate = createdUser.CreatedAt
        };
    }
}