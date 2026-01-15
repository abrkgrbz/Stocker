using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.CheckEmail;

public class CheckEmailQueryHandler : IRequestHandler<CheckEmailQuery, Result<CheckEmailResponse>>
{
    private readonly ILogger<CheckEmailQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;
    private readonly IHmacService _hmacService;

    public CheckEmailQueryHandler(
        ILogger<CheckEmailQueryHandler> logger,
        IMasterDbContext masterContext,
        IHmacService hmacService)
    {
        _logger = logger;
        _masterContext = masterContext;
        _hmacService = hmacService;
    }

    public async Task<Result<CheckEmailResponse>> Handle(CheckEmailQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Checking email existence and fetching tenants: {Email}", request.Email);

        try
        {
            var normalizedEmail = request.Email.Trim().ToLower();

            // Find user by email in master database
            var user = await _masterContext.MasterUsers
                .FirstOrDefaultAsync(u => u.Email.Value == normalizedEmail, cancellationToken);

            // Also check TenantRegistrations for pending/approved registrations (any status)
            // Load into memory first to avoid EF Core translation issues with ValueObject
            var allRegistrations = await _masterContext.TenantRegistrations
                .ToListAsync(cancellationToken);

            var registrationWithEmail = allRegistrations
                .FirstOrDefault(r => r.AdminEmail.Value.ToLower() == normalizedEmail);

            // Also check TenantUserEmails for invited users
            var tenantUserEmails = await _masterContext.TenantUserEmails
                .Where(e => e.Email.Value == normalizedEmail)
                .Select(e => e.TenantId)
                .ToListAsync(cancellationToken);

            if (user == null && registrationWithEmail == null && tenantUserEmails.Count == 0)
            {
                _logger.LogInformation("Email not found: {Email}", request.Email);
                return Result.Success(new CheckEmailResponse
                {
                    Exists = false,
                    Tenants = new List<TenantInfo>()
                });
            }

            // Find tenant registrations where this email is the admin (with completed tenants)
            var tenantRegistrations = allRegistrations
                .Where(r => r.AdminEmail.Value.ToLower() == normalizedEmail && r.TenantId.HasValue)
                .Select(r => r.TenantId!.Value)
                .ToList();

            // Combine tenant IDs from registrations and invited user emails
            var allTenantIds = tenantRegistrations
                .Union(tenantUserEmails)
                .Distinct()
                .ToList();

            // Get tenant details for all tenant IDs
            var tenantList = await _masterContext.Tenants
                .Where(t => allTenantIds.Contains(t.Id) && t.IsActive)
                .OrderBy(t => t.Name)
                .Select(t => new
                {
                    t.Code,
                    t.Name
                })
                .ToListAsync(cancellationToken);

            // Generate HMAC signature for all tenants (both web and mobile)
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var tenants = tenantList.Select(t => new TenantInfo
            {
                Code = t.Code,
                Name = t.Name,
                Domain = $"{t.Code}.stoocker.app",
                Signature = GenerateHmacSignature(t.Code, timestamp),
                Timestamp = timestamp
            }).ToList();

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
        return _hmacService.GenerateTimestampedSignature(tenantCode, timestamp);
    }
}
