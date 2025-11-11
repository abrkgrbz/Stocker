using MediatR;
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

    public TenantEnrichmentBehavior(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
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
                Console.WriteLine($"✅ TenantEnrichmentBehavior: Set TenantId={currentTenantId.Value} on {typeof(TRequest).Name}");
            }
            else if (tenantRequest.TenantId != Guid.Empty)
            {
                Console.WriteLine($"ℹ️ TenantEnrichmentBehavior: TenantId already set on {typeof(TRequest).Name}");
            }
            else
            {
                Console.WriteLine($"⚠️ TenantEnrichmentBehavior: No TenantId available for {typeof(TRequest).Name}");
            }
        }

        return await next();
    }
}
