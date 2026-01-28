using MediatR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Diagnostics;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.SharedKernel.Results;
using System.Diagnostics;

namespace Stocker.Application.Features.Identity.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly ILogger<LoginCommandHandler> _logger;
    private readonly IAuthenticationService _authenticationService;
    private readonly ISecurityAuditService _auditService;
    private readonly IHostEnvironment _environment;

    public LoginCommandHandler(
        ILogger<LoginCommandHandler> logger,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService,
        IHostEnvironment environment)
    {
        _logger = logger;
        _authenticationService = authenticationService;
        _auditService = auditService;
        _environment = environment;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Distributed tracing için Activity başlat
        using var activity = StockerActivitySource.Identity.StartActivity("Login")
            ?.SetRequestInfo(request)
            ?.SetTag("auth.email", request.Email)
            ?.SetTag("auth.ip_address", request.IpAddress ?? "unknown");

        var stopwatch = Stopwatch.StartNew();
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        try
        {
            // Check for unusual login patterns
            var isUnusual = await _auditService.HasUnusualLoginPatternAsync(
                request.Email,
                request.IpAddress ?? "unknown",
                request.UserAgent,
                cancellationToken);

            var baseRiskScore = isUnusual ? 40 : 10;

            // Check if this is a master admin login attempt
            if (IsMasterAdminEmail(request.Email))
            {
                var masterResult = await _authenticationService.AuthenticateMasterUserAsync(
                    request.Email,
                    request.Password,
                    cancellationToken);

                if (masterResult.IsSuccess)
                {
                    activity?.SetUserId(masterResult.Value.User.Id, masterResult.Value.User.Username)
                        ?.SetTag("auth.result", "success")
                        ?.SetTag("auth.type", "master_admin");
                    _logger.LogInformation("Master admin {Email} logged in successfully", request.Email);

                    // Log successful master admin login
                    await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                    {
                        Event = "master_admin_login_success",
                        Email = request.Email,
                        UserId = masterResult.Value.User.Id,
                        IpAddress = request.IpAddress,
                        UserAgent = request.UserAgent,
                        RiskScore = baseRiskScore,
                        DurationMs = (int)stopwatch.ElapsedMilliseconds,
                        GdprCategory = "authentication"
                    }, cancellationToken);
                }
                else
                {
                    activity?.SetTag("auth.result", "failed")
                        ?.SetTag("auth.type", "master_admin");
                    // Log failed master admin login
                    await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                    {
                        Event = "master_admin_login_failed",
                        Email = request.Email,
                        IpAddress = request.IpAddress,
                        UserAgent = request.UserAgent,
                        RiskScore = baseRiskScore + 30,
                        DurationMs = (int)stopwatch.ElapsedMilliseconds,
                        GdprCategory = "authentication"
                    }, cancellationToken);
                }

                return masterResult;
            }

            // Regular tenant user login
            var result = await _authenticationService.AuthenticateAsync(
                request.Email,
                request.Password,
                cancellationToken);

            if (result.IsSuccess)
            {
                activity?.SetUserId(result.Value.User.Id, result.Value.User.Username)
                    ?.SetTenantId(result.Value.User.TenantId)
                    ?.SetTag("auth.result", "success")
                    ?.SetTag("auth.type", "tenant_user");
                _logger.LogInformation("User {Email} logged in successfully", request.Email);

                // Log successful login
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "login_success",
                    Email = request.Email,
                    TenantCode = result.Value.User.TenantCode ?? result.Value.User.TenantName, // Prefer TenantCode, fallback to TenantName
                    UserId = result.Value.User.Id,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = baseRiskScore,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    GdprCategory = "authentication"
                }, cancellationToken);
            }
            else
            {
                activity?.SetTag("auth.result", "failed")
                    ?.SetTag("auth.type", "tenant_user");
                _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);

                // Get failed attempt count
                var failedAttempts = await _auditService.GetFailedLoginAttemptsAsync(
                    request.Email,
                    TimeSpan.FromHours(1),
                    cancellationToken);

                // Log failed login with risk score based on attempts
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "login_failed",
                    Email = request.Email,
                    IpAddress = request.IpAddress,
                    UserAgent = request.UserAgent,
                    RiskScore = baseRiskScore + (failedAttempts * 10),
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    GdprCategory = "authentication",
                    Metadata = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        failedAttempts = failedAttempts + 1,
                        reason = result.Error?.Description ?? "Invalid credentials"
                    })
                }, cancellationToken);
            }

            return result;
        }
        catch (Exception ex)
        {
            activity?.SetError(ex);
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);

            // Log login error
            await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
            {
                Event = "login_error",
                Email = request.Email,
                IpAddress = request.IpAddress,
                UserAgent = request.UserAgent,
                RiskScore = 50,
                DurationMs = (int)stopwatch.ElapsedMilliseconds,
                Metadata = System.Text.Json.JsonSerializer.Serialize(new { error = ex.Message })
            }, cancellationToken);

            return Result.Failure<AuthResponse>(Error.Failure("Auth.LoginError", "An error occurred during login"));
        }
    }

    private bool IsMasterAdminEmail(string email)
    {
        // Production domains for master admins
        if (email.EndsWith("@stoocker.app", StringComparison.OrdinalIgnoreCase) ||
            email.EndsWith("@admin.stocker.app", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Development-only domains for local testing
        if (_environment.IsDevelopment())
        {
            if (email.EndsWith("@localhost.com", StringComparison.OrdinalIgnoreCase) ||
                email.EndsWith("@stocker.com", StringComparison.OrdinalIgnoreCase) ||
                email.EndsWith("@tenant.local", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
}
