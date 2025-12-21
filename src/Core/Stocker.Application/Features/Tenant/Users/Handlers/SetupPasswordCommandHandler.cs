using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Users.Handlers;

/// <summary>
/// Handles the password setup for invited users.
/// Validates the activation token and sets the user's password.
/// </summary>
public class SetupPasswordCommandHandler : IRequestHandler<SetupPasswordCommand, Result>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly IEmailService _emailService;
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<SetupPasswordCommandHandler> _logger;

    public SetupPasswordCommandHandler(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IEmailService emailService,
        IMasterDbContext masterDbContext,
        ILogger<SetupPasswordCommandHandler> logger)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _emailService = emailService;
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

    public async Task<Result> Handle(SetupPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate password confirmation
        if (request.Password != request.ConfirmPassword)
        {
            return Result.Failure(new Error("Password.Mismatch", "Şifreler eşleşmiyor."));
        }

        // 2. Get the user
        var user = await _userRepository.GetTenantUserEntityByIdAsync(request.TenantId, request.UserId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning(
                "Setup password attempt for non-existent user {UserId} in tenant {TenantId}",
                request.UserId,
                request.TenantId);
            return Result.Failure(new Error("User.NotFound", "Kullanıcı bulunamadı."));
        }

        // 3. Validate user is in PendingActivation status
        if (user.Status != TenantUserStatus.PendingActivation)
        {
            _logger.LogWarning(
                "Setup password attempt for already activated user {UserId}. Current status: {Status}",
                request.UserId,
                user.Status);
            return Result.Failure(new Error("User.AlreadyActivated", "Bu hesap zaten aktifleştirilmiş."));
        }

        // 4. Validate activation token
        if (!user.ValidatePasswordResetToken(request.Token))
        {
            _logger.LogWarning(
                "Invalid or expired activation token for user {UserId}",
                request.UserId);
            return Result.Failure(new Error("Token.Invalid", "Aktivasyon linki geçersiz veya süresi dolmuş. Lütfen yöneticinizden yeni bir davet talep edin."));
        }

        // 5. Validate password strength
        var passwordValidation = _passwordService.ValidatePassword(request.Password, user.Username, user.Email.Value);
        if (passwordValidation.IsFailure)
        {
            var errorMessage = passwordValidation.Error?.Description ?? "Şifre gereksinimlerini karşılamıyor";
            return Result.Failure(new Error("Password.Invalid", $"Şifre geçersiz: {errorMessage}"));
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

        // 8. Send welcome email
        try
        {
            var tenant = await _masterDbContext.Tenants
                .Where(t => t.Id == request.TenantId)
                .Select(t => new { t.Name })
                .FirstOrDefaultAsync(cancellationToken);

            await _emailService.SendWelcomeEmailAsync(
                user.Email.Value,
                user.GetFullName(),
                tenant?.Name ?? "Stocker",
                cancellationToken);
        }
        catch (Exception ex)
        {
            // Don't fail if welcome email fails
            _logger.LogWarning(ex, "Failed to send welcome email to user {UserId}", request.UserId);
        }

        return Result.Success();
    }
}
