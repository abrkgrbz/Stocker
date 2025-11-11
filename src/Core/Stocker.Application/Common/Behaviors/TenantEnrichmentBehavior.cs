using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Application.Common.Behaviors;

/// <summary>
/// Automatically sets TenantId on requests that implement ITenantRequest
/// This runs BEFORE TenantValidationBehavior to ensure TenantId is populated
/// </summary>
public class TenantEnrichmentBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<TenantEnrichmentBehavior<TRequest, TResponse>> _logger;

    public TenantEnrichmentBehavior(
        ICurrentUserService currentUserService,
        ILogger<TenantEnrichmentBehavior<TRequest, TResponse>> logger)
    {
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Check if request implements ITenantRequest
        if (request is ITenantRequest tenantRequest)
        {
            var currentTenantId = _currentUserService.TenantId;

            // If request doesn't have TenantId set, set it from current user
            if (tenantRequest.TenantId == Guid.Empty && currentTenantId.HasValue)
            {
                tenantRequest.TenantId = currentTenantId.Value;
                _logger.LogInformation($"✅ TenantEnrichmentBehavior: Set TenantId={currentTenantId.Value} on {typeof(TRequest).Name}");
            }
            else if (tenantRequest.TenantId != Guid.Empty)
            {
                _logger.LogInformation($"ℹ️ TenantEnrichmentBehavior: TenantId already set on {typeof(TRequest).Name}");
            }
            else
            {
               _logger.LogWarning($"⚠️ TenantEnrichmentBehavior: No TenantId available for {typeof(TRequest).Name}");
            }
        }

        return await next();
    }
}
