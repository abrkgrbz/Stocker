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
        _logger.LogInformation("Checking email existence: {Email}", request.Email);

        try
        {
            // Find user by email in master database
            var user = await _masterContext.Users
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user == null)
            {
                _logger.LogInformation("Email not found: {Email}", request.Email);
                return Result.Success(new CheckEmailResponse
                {
                    Exists = false,
                    Tenant = null
                });
            }

            if (user.Tenant == null)
            {
                _logger.LogWarning("User {Email} exists but has no tenant", request.Email);
                return Result.Failure<CheckEmailResponse>(
                    Error.NotFound("Tenant.NotFound", "User account is not associated with any tenant"));
            }

            // Generate HMAC signature for tenant verification
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var signature = GenerateHmacSignature(user.Tenant.Code, timestamp);

            _logger.LogInformation("Email found: {Email}, Tenant: {TenantCode}", request.Email, user.Tenant.Code);

            return Result.Success(new CheckEmailResponse
            {
                Exists = true,
                Tenant = new TenantInfo
                {
                    Code = user.Tenant.Code,
                    Name = user.Tenant.Name,
                    Signature = signature,
                    Timestamp = timestamp
                }
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
