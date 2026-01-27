using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.LoginToTenant;

/// <summary>
/// Handler for master admin to login/impersonate a tenant
/// Creates an impersonation token that allows access to tenant resources
/// </summary>
public class LoginToTenantCommandHandler : IRequestHandler<LoginToTenantCommand, Result<LoginToTenantResponse>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<LoginToTenantCommandHandler> _logger;

    public LoginToTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IJwtService jwtService,
        IConfiguration configuration,
        ILogger<LoginToTenantCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<Result<LoginToTenantResponse>> Handle(LoginToTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get tenant
            var tenant = await _unitOfWork.Tenants()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<LoginToTenantResponse>.Failure(DomainErrors.Tenant.NotFound(request.TenantId));
            }

            // Check if tenant is active
            if (!tenant.IsActive)
            {
                return Result<LoginToTenantResponse>.Failure(
                    new Error("Tenant.Inactive", "Cannot login to an inactive tenant", ErrorType.Validation));
            }

            // Log impersonation for audit
            _logger.LogWarning(
                "Master admin {MasterUserEmail} ({MasterUserId}) is impersonating tenant {TenantCode} ({TenantId})",
                request.MasterUserEmail, request.MasterUserId, tenant.Code, tenant.Id);

            // Generate impersonation token with special claims
            var permissions = new List<string>
            {
                "TenantAdmin",
                "Impersonation",
                "ViewAll",
                "ManageAll"
            };

            // Generate token with tenant context
            var token = _jwtService.GenerateToken(
                userId: Guid.Parse(request.MasterUserId),
                email: request.MasterUserEmail,
                userName: $"Master Admin ({request.MasterUserEmail})",
                tenantId: tenant.Id,
                role: "TenantAdmin",
                permissions: permissions);

            // Add impersonation claim (this should be handled in token generation ideally)
            // For now, we mark this as an impersonation session in the response

            // Get frontend URL from configuration
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
            var redirectUrl = $"{frontendUrl}/dashboard?impersonation=true&tenantId={tenant.Id}";

            var expiresIn = (int)(token.ExpiresAt - DateTime.UtcNow).TotalSeconds;

            return Result<LoginToTenantResponse>.Success(new LoginToTenantResponse
            {
                TenantId = tenant.Id,
                TenantCode = tenant.Code,
                TenantName = tenant.Name,
                AccessToken = token.AccessToken,
                RefreshToken = token.RefreshToken,
                RedirectUrl = redirectUrl,
                ExpiresIn = expiresIn,
                ExpiresAt = token.ExpiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during tenant impersonation for tenant {TenantId}", request.TenantId);
            return Result<LoginToTenantResponse>.Failure(DomainErrors.General.UnProcessableRequest);
        }
    }
}
