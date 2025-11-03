using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Handler for UpdatePasswordPolicyCommand
/// </summary>
public class UpdatePasswordPolicyCommandHandler : IRequestHandler<UpdatePasswordPolicyCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public UpdatePasswordPolicyCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdatePasswordPolicyCommand request, CancellationToken cancellationToken)
    {
        var settings = await _context.TenantSecuritySettings
            .Where(s => s.Id == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
        {
            // Create default settings if not found
            settings = Domain.Tenant.Entities.TenantSecuritySettings.CreateDefault(request.ModifiedBy);

            // Use reflection to set the Id to the TenantId
            var idProperty = settings.GetType().BaseType?.GetProperty("Id");
            idProperty?.SetValue(settings, request.TenantId);

            _context.TenantSecuritySettings.Add(settings);
        }

        // Update password policy using the domain method
        settings.SetPasswordPolicy(
            minLength: request.MinPasswordLength,
            requireUpper: request.RequireUppercase,
            requireLower: request.RequireLowercase,
            requireNumbers: request.RequireNumbers,
            requireSpecial: request.RequireSpecialChars,
            expiryDays: request.PasswordExpiryDays
        );

        // Update PasswordHistoryCount through reflection since it doesn't have a setter in SetPasswordPolicy
        var passwordHistoryProperty = settings.GetType().GetProperty("PasswordHistoryCount");
        if (passwordHistoryProperty != null && passwordHistoryProperty.CanWrite)
        {
            passwordHistoryProperty.SetValue(settings, request.PreventPasswordReuse);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
