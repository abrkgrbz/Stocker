using MediatR;
using Microsoft.Extensions.Logging;
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

    public LoginCommandHandler(
        ILogger<LoginCommandHandler> logger,
        IAuthenticationService authenticationService,
        ISecurityAuditService auditService)
    {
        _logger = logger;
        _authenticationService = authenticationService;
        _auditService = auditService;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
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
        // You can implement more sophisticated logic here
        // For now, checking if email domain is for system admins
        return email.EndsWith("@stoocker.app", StringComparison.OrdinalIgnoreCase) ||
               email.EndsWith("@admin.stocker.app", StringComparison.OrdinalIgnoreCase);
    }
}
