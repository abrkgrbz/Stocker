using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Handler for UpdateTwoFactorSettingsCommand
/// </summary>
public class UpdateTwoFactorSettingsCommandHandler : IRequestHandler<UpdateTwoFactorSettingsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public UpdateTwoFactorSettingsCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateTwoFactorSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await _context.TenantSecuritySettings
            .Where(s => s.Id == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
        {
            settings = Domain.Tenant.Entities.TenantSecuritySettings.CreateDefault(request.ModifiedBy);

            // Use reflection to set the Id to the TenantId
            var idProperty = settings.GetType().BaseType?.GetProperty("Id");
            idProperty?.SetValue(settings, request.TenantId);

            _context.TenantSecuritySettings.Add(settings);
        }

        // Update 2FA settings through reflection
        var twoFactorRequiredProp = settings.GetType().GetProperty("TwoFactorRequired");
        var twoFactorOptionalProp = settings.GetType().GetProperty("TwoFactorOptional");
        var requireDeviceApprovalProp = settings.GetType().GetProperty("RequireDeviceApproval");
        var deviceTrustDurationProp = settings.GetType().GetProperty("DeviceTrustDurationDays");

        twoFactorRequiredProp?.SetValue(settings, request.Require2FA);
        twoFactorOptionalProp?.SetValue(settings, request.Allow2FA);
        requireDeviceApprovalProp?.SetValue(settings, request.TrustedDevices);
        deviceTrustDurationProp?.SetValue(settings, request.TrustedDeviceDays);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
