using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.ValidateResetToken;

public class ValidateResetTokenQueryHandler : IRequestHandler<ValidateResetTokenQuery, Result<ValidateResetTokenResponse>>
{
    private readonly ILogger<ValidateResetTokenQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public ValidateResetTokenQueryHandler(
        ILogger<ValidateResetTokenQueryHandler> logger,
        IMasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory)
    {
        _logger = logger;
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<ValidateResetTokenResponse>> Handle(ValidateResetTokenQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Validating password reset token");

        try
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return Result.Success(new ValidateResetTokenResponse
                {
                    Valid = false,
                    ExpiresAt = DateTime.UtcNow
                });
            }

            // Normalize token to URL-safe Base64 format (as stored in database)
            // Database stores tokens with: + -> -, / -> _, trailing = removed
            var normalizedToken = request.Token
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            // First, check in MasterUsers - try both original and normalized token
            var masterUser = await _masterContext.MasterUsers
                .Where(u => u.PasswordResetToken == request.Token || u.PasswordResetToken == normalizedToken)
                .Select(u => new { u.PasswordResetTokenExpiry })
                .FirstOrDefaultAsync(cancellationToken);

            if (masterUser != null)
            {
                // Use Turkey timezone for consistent timestamp handling
                // Container runs in UTC but PostgreSQL stores in Europe/Istanbul (+03)
                var turkeyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
                var turkeyNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, turkeyTimeZone);

                var isValid = masterUser.PasswordResetTokenExpiry.HasValue &&
                              masterUser.PasswordResetTokenExpiry.Value > turkeyNow;

                _logger.LogInformation("Password reset token found in MasterUsers, valid: {IsValid}, Expiry={Expiry}, ExpiryKind={ExpiryKind}, TurkeyNow={TurkeyNow}, UtcNow={UtcNow}",
                    isValid, masterUser.PasswordResetTokenExpiry, masterUser.PasswordResetTokenExpiry?.Kind, turkeyNow, DateTime.UtcNow);

                return Result.Success(new ValidateResetTokenResponse
                {
                    Valid = isValid,
                    ExpiresAt = masterUser.PasswordResetTokenExpiry ?? turkeyNow
                });
            }

            // If not found in MasterUsers, search in all tenant databases
            var tenants = await _masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);

            foreach (var tenantId in tenants)
            {
                try
                {
                    await using var tenantContext = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

                    var tenantUser = await tenantContext.TenantUsers
                        .Where(u => u.PasswordResetToken == request.Token || u.PasswordResetToken == normalizedToken)
                        .Select(u => new { u.PasswordResetTokenExpiry })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (tenantUser != null)
                    {
                        // Use Turkey timezone for consistent timestamp handling
                        var turkeyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
                        var turkeyNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, turkeyTimeZone);

                        var isValid = tenantUser.PasswordResetTokenExpiry.HasValue &&
                                      tenantUser.PasswordResetTokenExpiry.Value > turkeyNow;

                        _logger.LogInformation("Password reset token found in Tenant {TenantId}, valid: {IsValid}", tenantId, isValid);

                        return Result.Success(new ValidateResetTokenResponse
                        {
                            Valid = isValid,
                            ExpiresAt = tenantUser.PasswordResetTokenExpiry ?? turkeyNow
                        });
                    }
                }
                catch (Exception tenantEx)
                {
                    _logger.LogWarning(tenantEx, "Error searching for token in tenant {TenantId}", tenantId);
                    // Continue to next tenant
                }
            }

            // Token not found anywhere
            _logger.LogWarning("Password reset token not found in any database");
            return Result.Success(new ValidateResetTokenResponse
            {
                Valid = false,
                ExpiresAt = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password reset token");
            return Result.Failure<ValidateResetTokenResponse>(
                Error.Failure("Token.ValidationError", "Error validating reset token"));
        }
    }
}
