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
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (user == null)
            {
                _logger.LogInformation("Email not found: {Email}", request.Email);
                return Result.Success(new CheckEmailResponse
                {
                    Exists = false,
                    Tenant = null
                });
            }

            // Note: Tenant relationship is managed separately in Tenant database
            // For registration flow, we can return user exists without tenant info
            // Tenant assignment happens during registration completion
            _logger.LogInformation("Email found: {Email}", request.Email);

            return Result.Success(new CheckEmailResponse
            {
                Exists = true,
                Tenant = null // Tenant info managed separately
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
