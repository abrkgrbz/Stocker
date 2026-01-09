using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

/// <summary>
/// Handles user creation with invitation flow.
/// Creates user in PendingActivation status and sends invitation email.
/// User must click the activation link to set their password.
/// </summary>
public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMasterDbContext _masterDbContext;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IMasterDbContext masterDbContext,
        IEmailService emailService,
        ILogger<CreateUserCommandHandler> logger)
    {
        _userRepository = userRepository;
        _masterDbContext = masterDbContext;
        _emailService = emailService;
        _logger = logger;
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

        // Check if username already exists in this tenant
        var usernameExists = await _userRepository.UsernameExistsAsync(request.TenantId, request.Username, cancellationToken);
        if (usernameExists)
        {
            throw new InvalidOperationException($"Bu kullanıcı adı zaten kullanılıyor: {request.Username}");
        }

        // Check if email already exists in this tenant
        var emailExists = await _userRepository.EmailExistsAsync(request.TenantId, request.Email, cancellationToken);
        if (emailExists)
        {
            throw new InvalidOperationException($"Bu e-posta adresi zaten kullanılıyor: {request.Email}");
        }

        // Create value objects
        var emailResult = Stocker.Domain.Common.ValueObjects.Email.Create(request.Email);
        if (emailResult.IsFailure)
        {
            throw new InvalidOperationException($"Geçersiz e-posta adresi: {request.Email}");
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

        // Parse department and branch IDs if provided
        Guid? departmentId = null;
        if (!string.IsNullOrWhiteSpace(request.Department) && Guid.TryParse(request.Department, out var parsedDepartmentId))
        {
            departmentId = parsedDepartmentId;
        }

        Guid? branchId = null;
        if (!string.IsNullOrWhiteSpace(request.Branch) && Guid.TryParse(request.Branch, out var parsedBranchId))
        {
            branchId = parsedBranchId;
        }

        // Use invitation factory method - creates user in PendingActivation status
        var user = TenantUser.CreateForInvitation(
            request.TenantId,
            request.Username,
            emailResult.Value,
            request.FirstName,
            request.LastName,
            phone: phone,
            title: request.CreatedBy,
            departmentId: departmentId,
            branchId: branchId
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

        // 5. Get tenant info for email
        var tenant = await _masterDbContext.Tenants
            .Where(t => t.Id == request.TenantId)
            .Select(t => new { t.Name })
            .FirstOrDefaultAsync(cancellationToken);

        var companyName = request.CompanyName ?? tenant?.Name ?? "Stocker";
        var inviterName = request.InviterName ?? request.CreatedBy ?? "Yönetici";

        // 6. Send invitation email with activation token
        // The activation token was already generated in CreateForInvitation
        if (!string.IsNullOrEmpty(createdUser.PasswordResetToken))
        {
            try
            {
                await _emailService.SendUserInvitationEmailAsync(
                    email: createdUser.Email.Value,
                    userName: createdUser.GetFullName(),
                    inviterName: inviterName,
                    companyName: companyName,
                    activationToken: createdUser.PasswordResetToken,
                    userId: createdUser.Id,
                    tenantId: request.TenantId,
                    cancellationToken: cancellationToken
                );

                _logger.LogInformation(
                    "Invitation email sent to {Email} for user {UserId} in tenant {TenantId}",
                    createdUser.Email.Value,
                    createdUser.Id,
                    request.TenantId);
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the user creation
                // The admin can resend the invitation later
                _logger.LogWarning(
                    ex,
                    "Failed to send invitation email to {Email} for user {UserId}. User was created but email was not sent.",
                    createdUser.Email.Value,
                    createdUser.Id);
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
            DepartmentId = createdUser.DepartmentId,
            BranchId = createdUser.BranchId,
            Department = departmentId.HasValue ? request.Department : null,
            Branch = branchId.HasValue ? request.Branch : null,
            Roles = assignedRoleNames,
            IsActive = createdUser.Status == TenantUserStatus.Active,
            CreatedDate = createdUser.CreatedAt
        };
    }
}
