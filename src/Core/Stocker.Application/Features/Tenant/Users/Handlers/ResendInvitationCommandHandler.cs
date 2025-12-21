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
/// Handles resending the invitation email to a user who hasn't activated their account yet.
/// Generates a new activation token and sends a fresh invitation email.
/// </summary>
public class ResendInvitationCommandHandler : IRequestHandler<ResendInvitationCommand, Result>
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<ResendInvitationCommandHandler> _logger;

    public ResendInvitationCommandHandler(
        IUserRepository userRepository,
        IEmailService emailService,
        IMasterDbContext masterDbContext,
        ILogger<ResendInvitationCommandHandler> logger)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

    public async Task<Result> Handle(ResendInvitationCommand request, CancellationToken cancellationToken)
    {
        // 1. Get the user
        var user = await _userRepository.GetTenantUserEntityByIdAsync(request.TenantId, request.UserId, cancellationToken);
        if (user == null)
        {
            return Result.Failure(new Error("User.NotFound", "Kullanıcı bulunamadı."));
        }

        // 2. Validate user is still pending activation
        if (user.Status != TenantUserStatus.PendingActivation)
        {
            return Result.Failure(new Error("User.AlreadyActivated", "Bu kullanıcı zaten aktifleştirilmiş."));
        }

        // 3. Generate new activation token
        user.GeneratePasswordResetToken();
        // Extend token validity to 7 days for invitation flow
        // Note: We need to access the private setter - this is done through the entity method

        // 4. Save the user with new token
        await _userRepository.UpdateTenantUserAsync(user, cancellationToken);

        // 5. Get tenant info for email
        var tenant = await _masterDbContext.Tenants
            .Where(t => t.Id == request.TenantId)
            .Select(t => new { t.Name })
            .FirstOrDefaultAsync(cancellationToken);

        var companyName = tenant?.Name ?? "Stocker";

        // 6. Send invitation email
        try
        {
            await _emailService.SendUserInvitationEmailAsync(
                email: user.Email.Value,
                userName: user.GetFullName(),
                inviterName: request.InviterName,
                companyName: companyName,
                activationToken: user.PasswordResetToken!,
                userId: user.Id,
                tenantId: request.TenantId,
                cancellationToken: cancellationToken
            );

            _logger.LogInformation(
                "Invitation email resent to {Email} for user {UserId} in tenant {TenantId}",
                user.Email.Value,
                user.Id,
                request.TenantId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to resend invitation email to {Email} for user {UserId}",
                user.Email.Value,
                user.Id);

            return Result.Failure(new Error("Email.Failed", "Davet e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin."));
        }
    }
}
