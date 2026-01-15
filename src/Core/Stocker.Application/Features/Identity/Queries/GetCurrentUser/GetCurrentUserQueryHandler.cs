using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Application.Features.Identity.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserInfo>>
{
    private readonly ILogger<GetCurrentUserQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantService _tenantService;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public GetCurrentUserQueryHandler(
        ILogger<GetCurrentUserQueryHandler> logger,
        IMasterDbContext masterContext,
        ITenantService tenantService,
        ITenantDbContextFactory tenantDbContextFactory)
    {
        _logger = logger;
        _masterContext = masterContext;
        _tenantService = tenantService;
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<UserInfo>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetCurrentUserQuery for User {UserId} (IsInvitedUser: {IsInvitedUser}, TenantUserId: {TenantUserId})",
            request.UserId, request.IsInvitedUser, request.TenantUserId);

        try
        {
            // Handle invited users (no MasterUser record, only TenantUser)
            if (request.IsInvitedUser && request.TenantUserId.HasValue && request.TenantId.HasValue)
            {
                return await HandleInvitedUserAsync(request, cancellationToken);
            }

            // Fetch user from master database (regular users)
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", request.UserId);
                return Result.Failure<UserInfo>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            // Get current tenant information if available
            var tenantId = request.TenantId ?? _tenantService.GetCurrentTenantId();
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

    private async Task<Result<UserInfo>> HandleInvitedUserAsync(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling invited user: TenantUserId={TenantUserId}, TenantId={TenantId}",
            request.TenantUserId, request.TenantId);

        try
        {
            // Get tenant context
            await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId!.Value);

            // Find the tenant user
            var tenantUser = await tenantContext.TenantUsers
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == request.TenantUserId!.Value, cancellationToken);

            if (tenantUser == null)
            {
                _logger.LogWarning("Invited tenant user not found: {TenantUserId}", request.TenantUserId);
                return Result.Failure<UserInfo>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            // Get tenant info
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == request.TenantId!.Value, cancellationToken);

            // Get user roles
            var userRoleIds = tenantUser.UserRoles.Select(ur => ur.RoleId).ToList();
            var roles = await tenantContext.Roles
                .Where(r => userRoleIds.Contains(r.Id))
                .Select(r => r.Name)
                .ToListAsync(cancellationToken);

            if (!roles.Any())
            {
                roles.Add("User"); // Default role
            }

            var userInfo = new UserInfo
            {
                Id = tenantUser.Id,
                Email = tenantUser.Email.Value,
                Username = tenantUser.Username,
                FullName = tenantUser.GetFullName(),
                Roles = roles,
                TenantId = request.TenantId,
                TenantName = tenant?.Name,
                TenantCode = tenant?.Code
            };

            _logger.LogInformation("Successfully retrieved invited user information for: {Username}", tenantUser.Username);

            return Result.Success(userInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting invited user info: TenantUserId={TenantUserId}", request.TenantUserId);
            return Result.Failure<UserInfo>(
                Error.Failure("User.GetError", "An error occurred while retrieving user information"));
        }
    }
}
