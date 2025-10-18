using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Application.Features.Identity.Queries.CheckEmail;

public class CheckEmailQueryHandler : IRequestHandler<CheckEmailQuery, Result<CheckEmailResponse>>
{
    private readonly ILogger<CheckEmailQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly string _hmacSecret;

    public CheckEmailQueryHandler(
        ILogger<CheckEmailQueryHandler> logger,
        IMasterDbContext masterContext,
        Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _logger = logger;
        _masterContext = masterContext;
        _hmacSecret = configuration["Security:HmacSecret"] ?? throw new InvalidOperationException("HMAC secret not configured");
    }

    public async Task<Result<CheckEmailResponse>> Handle(CheckEmailQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Checking email existence and fetching tenants: {Email}", request.Email);

        try
        {
            // Find user by email in master database
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (user == null)
            {
                _logger.LogInformation("Email not found: {Email}", request.Email);
                return Result.Success(new CheckEmailResponse
                {
                    Exists = false,
                    Tenants = new List<TenantInfo>()
                });
            }

            // For now, return all active tenants
            // The actual access validation will happen during login on the tenant subdomain
            // In the future, we can optimize this by maintaining a UserTenant mapping table in master DB
            var tenants = await _masterContext.Tenants
                .Where(t => t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => new TenantInfo
                {
                    Code = t.Code,
                    Name = t.Name,
                    Domain = $"{t.Code}.stoocker.app"
                })
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Email found: {Email} with {TenantCount} tenants", request.Email, tenants.Count);

            return Result.Success(new CheckEmailResponse
            {
                Exists = true,
                Tenants = tenants
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email: {Email}", request.Email);
            return Result.Failure<CheckEmailResponse>(
                Error.Failure("Email.CheckError", "An error occurred while checking email"));
        }
    }

    private string GenerateHmacSignature(string tenantCode, long timestamp)
    {
        var message = $"{tenantCode}:{timestamp}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_hmacSecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToBase64String(hash);
    }
}
