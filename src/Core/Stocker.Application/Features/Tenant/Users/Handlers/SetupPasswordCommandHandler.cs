using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

/// <summary>
/// Handles the password setup for invited users.
/// Validates the activation token, sets the user's password, and returns auth tokens for auto-login.
/// Uses ITenantDbContextFactory to create tenant-specific context since this endpoint runs without tenant resolution.
/// </summary>
public class SetupPasswordCommandHandler : IRequestHandler<SetupPasswordCommand, Result<SetupPasswordResultDto>>
{
    private readonly IPasswordService _passwordService;
    private readonly IEmailService _emailService;
    private readonly IJwtService _jwtService;
    private readonly IMasterDbContext _masterDbContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ILogger<SetupPasswordCommandHandler> _logger;

    public SetupPasswordCommandHandler(
        IPasswordService passwordService,
        IEmailService emailService,
        IJwtService jwtService,
        IMasterDbContext masterDbContext,
        ITenantDbContextFactory tenantDbContextFactory,
        ILogger<SetupPasswordCommandHandler> logger)
    {
        _passwordService = passwordService;
        _emailService = emailService;
        _jwtService = jwtService;
        _masterDbContext = masterDbContext;
        _tenantDbContextFactory = tenantDbContextFactory;
        _logger = logger;
    }

    public async Task<Result<SetupPasswordResultDto>> Handle(SetupPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate password confirmation
        if (request.Password != request.ConfirmPassword)
        {
            return Result<SetupPasswordResultDto>.Failure(new Error("Password.Mismatch", "Şifreler eşleşmiyor."));
        }

        // 2. Create tenant-specific context using factory (since this endpoint runs without tenant resolution)
        var tenantDbContext = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);
        if (tenantDbContext == null)
        {
            _logger.LogWarning("Could not create tenant context for TenantId {TenantId}", request.TenantId);
            return Result<SetupPasswordResultDto>.Failure(new Error("Tenant.NotFound", "Şirket bulunamadı."));
        }

        // 3. Get the user directly from tenant context
        var user = await tenantDbContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.TenantId == request.TenantId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning(
                "Setup password attempt for non-existent user {UserId} in tenant {TenantId}",
                request.UserId,
                request.TenantId);
            return Result<SetupPasswordResultDto>.Failure(new Error("User.NotFound", "Kullanıcı bulunamadı."));
        }

        // 4. Validate user is in PendingActivation status
        if (user.Status != TenantUserStatus.PendingActivation)
        {
            _logger.LogWarning(
                "Setup password attempt for already activated user {UserId}. Current status: {Status}",
                request.UserId,
                user.Status);
            return Result<SetupPasswordResultDto>.Failure(new Error("User.AlreadyActivated", "Bu hesap zaten aktifleştirilmiş."));
        }

        // 5. Validate activation token
        if (!user.ValidatePasswordResetToken(request.Token))
        {
            _logger.LogWarning(
                "Invalid or expired activation token for user {UserId}",
                request.UserId);
            return Result<SetupPasswordResultDto>.Failure(new Error("Token.Invalid", "Aktivasyon linki geçersiz veya süresi dolmuş. Lütfen yöneticinizden yeni bir davet talep edin."));
        }

        // 6. Validate password strength
        var passwordValidation = _passwordService.ValidatePassword(request.Password, user.Username, user.Email.Value);
        if (passwordValidation.IsFailure)
        {
            var errorMessage = passwordValidation.Error?.Description ?? "Şifre gereksinimlerini karşılamıyor";
            return Result<SetupPasswordResultDto>.Failure(new Error("Password.Invalid", $"Şifre geçersiz: {errorMessage}"));
        }

        // 7. Hash password and activate account
        var hashedPassword = _passwordService.HashPassword(request.Password);
        var passwordHash = _passwordService.GetCombinedHash(hashedPassword);

        user.ActivateWithPassword(passwordHash, request.Token);

        // 8. Save the changes
        tenantDbContext.TenantUsers.Update(user);
        await tenantDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "User {UserId} in tenant {TenantId} successfully activated their account",
            request.UserId,
            request.TenantId);

        // 9. Get user roles for token generation
        var userRoleIds = await tenantDbContext.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        var roles = await tenantDbContext.Roles
            .Where(r => userRoleIds.Contains(r.Id))
            .Select(r => r.Name)
            .ToListAsync(cancellationToken);

        if (!roles.Any())
        {
            roles = new List<string> { "User" };
        }
        var primaryRole = roles.FirstOrDefault() ?? "User";

        // 10. Get user permissions
        var permissions = await tenantDbContext.UserPermissions
            .Where(up => up.UserId == user.Id)
            .Select(up => $"{up.Resource}:{up.PermissionType}")
            .ToListAsync(cancellationToken);

        // 11. Generate JWT token for auto-login
        var authToken = _jwtService.GenerateToken(
            user.Id,
            user.Email.Value,
            user.Username,
            request.TenantId,
            primaryRole,
            permissions);

        // 12. Record login
        user.RecordLogin();
        tenantDbContext.TenantUsers.Update(user);
        await tenantDbContext.SaveChangesAsync(cancellationToken);

        // 13. Get tenant info for subdomain and welcome email
        var tenantInfo = await _masterDbContext.Tenants
            .Include(t => t.Domains)
            .Where(t => t.Id == request.TenantId)
            .Select(t => new { t.Name, Domains = t.Domains.ToList() })
            .FirstOrDefaultAsync(cancellationToken);

        // Get primary subdomain (or first available)
        var tenantSubdomain = tenantInfo?.Domains
            .Where(d => d.IsPrimary)
            .Select(d => d.DomainName)
            .FirstOrDefault()
            ?? tenantInfo?.Domains.FirstOrDefault()?.DomainName
            ?? string.Empty;

        // Send welcome email (async, don't wait)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendWelcomeEmailAsync(
                    user.Email.Value,
                    user.GetFullName(),
                    tenantInfo?.Name ?? "Stocker",
                    CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send welcome email to user {UserId}", request.UserId);
            }
        });

        // 14. Return result with auth tokens and tenant subdomain
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
            Roles = roles,
            TenantSubdomain = tenantSubdomain
        };

        return Result<SetupPasswordResultDto>.Success(result);
    }
}
