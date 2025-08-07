using MediatR;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Behaviors;

public class TenantValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;

    public TenantValidationBehavior(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Check if request implements ITenantRequest
        if (request is ITenantRequest tenantRequest)
        {
            var currentTenantId = _currentUserService.TenantId;

            // If user is not super admin and tenant IDs don't match
            if (!_currentUserService.IsSuperAdmin && 
                currentTenantId.HasValue && 
                tenantRequest.TenantId != currentTenantId.Value)
            {
                var error = new Error(
                    "Tenant.Unauthorized", 
                    "You are not authorized to access this tenant's data.", 
                    ErrorType.Unauthorized);

                if (typeof(TResponse).IsGenericType && 
                    typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
                {
                    var resultType = typeof(Result<>).MakeGenericType(typeof(TResponse).GetGenericArguments()[0]);
                    var failureMethod = resultType.GetMethod("Failure", new[] { typeof(Error) });
                    return (TResponse)failureMethod!.Invoke(null, new object[] { error })!;
                }
                else if (typeof(TResponse) == typeof(Result))
                {
                    return (TResponse)(object)Result.Failure(error);
                }
            }
        }

        return await next();
    }
}