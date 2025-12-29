using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

/// <summary>
/// Handles the password setup for invited users.
/// Validates the activation token, sets the user's password, and returns auth tokens for auto-login.
/// </summary>
public class SetupPasswordCommandHandler : IRequestHandler<SetupPasswordCommand, Result<SetupPasswordResultDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IEmailService _emailService;
    private readonly IJwtService _jwtService;
    private readonly IMasterDbContext _masterDbContext;
    private readonly ITenantDbContext _tenantDbContext;
    private readonly ILogger<SetupPasswordCommandHandler> _logger;

    public SetupPasswordCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IEmailService emailService,
        IJwtService jwtService,
        IMasterDbContext masterDbContext,
        ITenantDbContext tenantDbContext,
        ILogger<SetupPasswordCommandHandler> logger)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _emailService = emailService;
        _jwtService = jwtService;
        _masterDbContext = masterDbContext;
        _tenantDbContext = tenantDbContext;
        _logger = logger;
    }

    public async Task<Result<SetupPasswordResultDto>> Handle(SetupPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate password confirmation
        if (request.Password != request.ConfirmPassword)
        {
            return Result<SetupPasswordResultDto>.Failure(new Error("Password.Mismatch", "Şifreler eşleşmiyor."));
        }

        // 2. Get the user
        var user = await _userRepository.GetTenantUserEntityByIdAsync(request.TenantId, request.UserId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning(
                "Setup password attempt for non-existent user {UserId} in tenant {TenantId}",
                request.UserId,
                request.TenantId);
            return Result<SetupPasswordResultDto>.Failure(new Error("User.NotFound", "Kullanıcı bulunamadı."));
        }

        // 3. Validate user is in PendingActivation status
        if (user.Status != TenantUserStatus.PendingActivation)
        {
            _logger.LogWarning(
                "Setup password attempt for already activated user {UserId}. Current status: {Status}",
                request.UserId,
                user.Status);
            return Result<SetupPasswordResultDto>.Failure(new Error("User.AlreadyActivated", "Bu hesap zaten aktifleştirilmiş."));
        }

        // 4. Validate activation token
        if (!user.ValidatePasswordResetToken(request.Token))
        {
            _logger.LogWarning(
                "Invalid or expired activation token for user {UserId}",
                request.UserId);
            return Result<SetupPasswordResultDto>.Failure(new Error("Token.Invalid", "Aktivasyon linki geçersiz veya süresi dolmuş. Lütfen yöneticinizden yeni bir davet talep edin."));
        }

        // 5. Validate password strength
        var passwordValidation = _passwordService.ValidatePassword(request.Password, user.Username, user.Email.Value);
        if (passwordValidation.IsFailure)
        {
            var errorMessage = passwordValidation.Error?.Description ?? "Şifre gereksinimlerini karşılamıyor";
            return Result<SetupPasswordResultDto>.Failure(new Error("Password.Invalid", $"Şifre geçersiz: {errorMessage}"));
        }

        // 6. Hash password and activate account
        var hashedPassword = _passwordService.HashPassword(request.Password);
        var passwordHash = _passwordService.GetCombinedHash(hashedPassword);

        user.ActivateWithPassword(passwordHash, request.Token);

        // 7. Save the changes
        await _userRepository.UpdateTenantUserAsync(user, cancellationToken);

        _logger.LogInformation(
            "User {UserId} in tenant {TenantId} successfully activated their account",
            request.UserId,
            request.TenantId);

        // 8. Get user roles for token generation
        var userRoleIds = await _tenantDbContext.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        var roles = await _tenantDbContext.Roles
            .Where(r => userRoleIds.Contains(r.Id))
            .Select(r => r.Name)
            .ToListAsync(cancellationToken);

        if (!roles.Any())
        {
            roles = new List<string> { "User" };
        }
        var primaryRole = roles.FirstOrDefault() ?? "User";

        // 9. Get user permissions
        var permissions = await _tenantDbContext.UserPermissions
            .Where(up => up.UserId == user.Id)
            .Select(up => $"{up.Resource}:{up.PermissionType}")
            .ToListAsync(cancellationToken);

        // 10. Generate JWT token for auto-login
        var authToken = _jwtService.GenerateToken(
            user.Id,
            user.Email.Value,
            user.Username,
            request.TenantId,
            primaryRole,
            permissions);

        // 11. Record login
        user.RecordLogin();
        await _userRepository.UpdateTenantUserAsync(user, cancellationToken);

        // 12. Send welcome email (async, don't wait)
        _ = Task.Run(async () =>
        {
            try
            {
                var tenant = await _masterDbContext.Tenants
                    .Where(t => t.Id == request.TenantId)
                    .Select(t => new { t.Name })
                    .FirstOrDefaultAsync(CancellationToken.None);

                await _emailService.SendWelcomeEmailAsync(
                    user.Email.Value,
                    user.GetFullName(),
                    tenant?.Name ?? "Stocker",
                    CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send welcome email to user {UserId}", request.UserId);
            }
        });

        // 13. Return result with auth tokens
        var result = new SetupPasswordResultDto
        {
            AccessToken = authToken.AccessToken,
            RefreshToken = authToken.RefreshToken,
            ExpiresAt = authToken.ExpiresAt,
            TokenType = authToken.TokenType,
            UserId = user.Id,
            TenantId = request.TenantId,
            FullName = user.GetFullName(),
            Email = user.Email.Value,
            Roles = roles
        };

        return Result<SetupPasswordResultDto>.Success(result);
    }
}
