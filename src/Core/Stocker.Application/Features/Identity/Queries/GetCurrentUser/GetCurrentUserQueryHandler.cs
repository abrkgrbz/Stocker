using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserInfo>>
{
    private readonly ILogger<GetCurrentUserQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantService _tenantService;

    public GetCurrentUserQueryHandler(
        ILogger<GetCurrentUserQueryHandler> logger,
        IMasterDbContext masterContext,
        ITenantService tenantService)
    {
        _logger = logger;
        _masterContext = masterContext;
        _tenantService = tenantService;
    }

    public async Task<Result<UserInfo>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting current user information for userId: {UserId}", request.UserId);

        try
        {
            // Fetch user from master database
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", request.UserId);
                return Result.Failure<UserInfo>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            // Get current tenant information if available
            var tenantId = _tenantService.GetCurrentTenantId();
            string? tenantName = null;
            string? tenantCode = null;

            if (tenantId.HasValue)
            {
                var tenant = await _masterContext.Tenants
                    .FirstOrDefaultAsync(t => t.Id == tenantId.Value, cancellationToken);

                if (tenant != null)
                {
                    tenantName = tenant.Name;
                    tenantCode = tenant.Code;
                }
            }

            // Determine roles based on user type
            var roles = new List<string>();
            if (user.UserType == Domain.Master.Enums.UserType.SistemYoneticisi)
            {
                roles.Add("SistemYoneticisi");
            }
            else if (user.UserType == Domain.Master.Enums.UserType.FirmaYoneticisi)
            {
                roles.Add("FirmaYoneticisi");
            }

            var userInfo = new UserInfo
            {
                Id = user.Id,
                Email = user.Email.Value,
                Username = user.Username,
                FullName = user.GetFullName(),
                Roles = roles,
                TenantId = tenantId,
                TenantName = tenantName,
                TenantCode = tenantCode
            };

            _logger.LogInformation("Successfully retrieved user information for: {Username}", user.Username);

            return Result.Success(userInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user: {UserId}", request.UserId);
            return Result.Failure<UserInfo>(
                Error.Failure("User.GetError", "An error occurred while retrieving user information"));
        }
    }
}
