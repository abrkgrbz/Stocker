using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Commands;

/// <summary>
/// Handler for UpdateApiSecurityCommand
/// </summary>
public class UpdateApiSecurityCommandHandler : IRequestHandler<UpdateApiSecurityCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public UpdateApiSecurityCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateApiSecurityCommand request, CancellationToken cancellationToken)
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

        // Update API security settings through reflection
        var requireApiKeyProp = settings.GetType().GetProperty("RequireApiKey");
        var apiKeyExpiryProp = settings.GetType().GetProperty("ApiKeyExpiryDays");
        var rateLimitEnabledProp = settings.GetType().GetProperty("EnableApiRateLimiting");
        var rateLimitPerHourProp = settings.GetType().GetProperty("ApiRateLimitPerHour");

        requireApiKeyProp?.SetValue(settings, request.RequireApiKey);
        apiKeyExpiryProp?.SetValue(settings, request.ApiKeyExpiryDays);
        rateLimitEnabledProp?.SetValue(settings, request.RateLimitEnabled);
        rateLimitPerHourProp?.SetValue(settings, request.RateLimitRequestsPerHour);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
