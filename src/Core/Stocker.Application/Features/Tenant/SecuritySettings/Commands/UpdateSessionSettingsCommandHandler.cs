using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Handler for UpdateSessionSettingsCommand
/// </summary>
public class UpdateSessionSettingsCommandHandler : IRequestHandler<UpdateSessionSettingsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public UpdateSessionSettingsCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateSessionSettingsCommand request, CancellationToken cancellationToken)
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

        // Update session settings through reflection
        var sessionTimeoutProp = settings.GetType().GetProperty("SessionTimeoutMinutes");
        var singleSessionProp = settings.GetType().GetProperty("SingleSessionPerUser");

        sessionTimeoutProp?.SetValue(settings, request.SessionTimeoutMinutes);
        singleSessionProp?.SetValue(settings, request.MaxConcurrentSessions == 1);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
