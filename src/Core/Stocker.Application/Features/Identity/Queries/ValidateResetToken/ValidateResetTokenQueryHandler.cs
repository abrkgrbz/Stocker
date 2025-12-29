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
                // Debug: Log exact values to understand Npgsql behavior
                var expiryValue = masterUser.PasswordResetTokenExpiry;
                var utcNow = DateTime.UtcNow;
                var localNow = DateTime.Now;

                _logger.LogInformation(
                    "Token expiry debug: ExpiryValue={Expiry}, ExpiryKind={Kind}, UtcNow={UtcNow}, LocalNow={LocalNow}",
                    expiryValue?.ToString("O"),
                    expiryValue?.Kind,
                    utcNow.ToString("O"),
                    localNow.ToString("O"));

                // Npgsql legacy mode with timestamptz: value is stored as UTC in DB
                // When read back, Npgsql converts to local time (but container is UTC, so no change)
                // The expiry was saved with DateTime.UtcNow.AddHours(1), so it's in UTC
                // Compare with UTC now
                var isValid = expiryValue.HasValue && expiryValue.Value > utcNow;

                _logger.LogInformation("Password reset token found in MasterUsers, valid: {IsValid}, ExpiryValue > UtcNow = {Comparison}",
                    isValid, expiryValue.HasValue ? $"{expiryValue.Value} > {utcNow}" : "null");

                return Result.Success(new ValidateResetTokenResponse
                {
                    Valid = isValid,
                    ExpiresAt = expiryValue ?? utcNow
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
                        var expiryValue = tenantUser.PasswordResetTokenExpiry;
                        var utcNow = DateTime.UtcNow;

                        var isValid = expiryValue.HasValue && expiryValue.Value > utcNow;

                        _logger.LogInformation("Password reset token found in Tenant {TenantId}, valid: {IsValid}", tenantId, isValid);

                        return Result.Success(new ValidateResetTokenResponse
                        {
                            Valid = isValid,
                            ExpiresAt = expiryValue ?? utcNow
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
                ExpiresAt = DateTime.UtcNow
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
