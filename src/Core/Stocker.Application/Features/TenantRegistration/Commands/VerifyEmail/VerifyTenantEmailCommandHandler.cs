using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Extensions;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.VerifyEmail;

public sealed class VerifyTenantEmailCommandHandler : IRequestHandler<VerifyTenantEmailCommand, Result<VerifyTenantEmailResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<VerifyTenantEmailCommandHandler> _logger;
    private readonly IMediator _mediator;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ISecurityAuditService _auditService;

    public VerifyTenantEmailCommandHandler(
        IMasterDbContext context,
        ILogger<VerifyTenantEmailCommandHandler> logger,
        IMediator mediator,
        IBackgroundJobService backgroundJobService,
        ISecurityAuditService auditService)
    {
        _context = context;
        _logger = logger;
        _mediator = mediator;
        _backgroundJobService = backgroundJobService;
        _auditService = auditService;
    }

    public async Task<Result<VerifyTenantEmailResponse>> Handle(VerifyTenantEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Find registration by email and token/code
            // Support both token (URL) and code (6-digit) verification
            // Fetch candidates first, then filter by Value Object in memory
            var tokenOrCode = !string.IsNullOrEmpty(request.Code) ? request.Code : request.Token;

            var candidates = await _context.TenantRegistrations
                .Where(r => r.EmailVerificationToken == tokenOrCode || r.EmailVerificationCode == tokenOrCode)
                .ToListAsync(cancellationToken);

            var matchingRegistration = candidates
                .FirstOrDefault(r => r.ContactEmail.Value == request.Email);
            
            // If found in memory list, get the tracked entity from context
            if (matchingRegistration != null)
            {
                // Re-fetch the entity to ensure it's tracked
                matchingRegistration = await _context.TenantRegistrations
                    .FirstOrDefaultAsync(r => r.Id == matchingRegistration.Id, cancellationToken);
            }

            if (matchingRegistration == null)
            {
                // Log failed verification - invalid token/code
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "tenant_email_verification_failed",
                    Email = request.Email,
                    RiskScore = 30,
                    GdprCategory = "authentication",
                    Metadata = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        reason = "invalid_token_or_code",
                        tokenOrCode = tokenOrCode
                    })
                }, cancellationToken);

                return Result<VerifyTenantEmailResponse>.Failure(Error.NotFound("Registration.NotFound", "Kayıt bulunamadı veya doğrulama kodu geçersiz."));
            }

            if (matchingRegistration.EmailVerified)
            {
                // Email already verified - this is an idempotent retry
                // Check if tenant creation is already in progress or completed
                _logger.LogInformation(
                    "Email already verified for registration: {RegistrationId}, TenantId: {TenantId}, Status: {Status}",
                    matchingRegistration.Id,
                    matchingRegistration.TenantId,
                    matchingRegistration.Status);

                // If tenant already exists and is valid, just return success
                if (matchingRegistration.TenantId.HasValue && matchingRegistration.TenantId.Value != Guid.Empty)
                {
                    _logger.LogInformation(
                        "Tenant already exists for registration: {RegistrationId}, returning success for idempotent retry",
                        matchingRegistration.Id);

                    return Result<VerifyTenantEmailResponse>.Success(new VerifyTenantEmailResponse
                    {
                        Success = true,
                        RegistrationId = matchingRegistration.Id,
                        Message = "Hesabınız oluşturuluyor..."
                    });
                }

                // Email verified but no tenant yet - schedule tenant creation (handles retry scenario)
                // The CreateTenantFromRegistrationCommandHandler has orphaned tenant cleanup logic
                if (matchingRegistration.Status == RegistrationStatus.Pending ||
                    matchingRegistration.Status == RegistrationStatus.Approved)
                {
                    _logger.LogInformation(
                        "🔄 Re-scheduling tenant creation for already-verified registration: {RegistrationId}",
                        matchingRegistration.Id);

                    _backgroundJobService.Schedule<IMediator>(
                        mediator => mediator.Send(
                            new CreateTenantFromRegistrationCommand(matchingRegistration.Id),
                            CancellationToken.None),
                        TimeSpan.FromSeconds(3));
                }

                return Result<VerifyTenantEmailResponse>.Success(new VerifyTenantEmailResponse
                {
                    Success = true,
                    RegistrationId = matchingRegistration.Id,
                    Message = "Hesabınız oluşturuluyor..."
                });
            }

            // Verify email (use token or code)
            matchingRegistration.VerifyEmail(tokenOrCode);

            _logger.LogInformation("Email verified successfully for: {Email}, Company: {CompanyCode}",
                matchingRegistration.ContactEmail.Value,
                matchingRegistration.CompanyCode);

            // Save email verification first
            await _context.SaveChangesAsync(cancellationToken);

            // Log successful email verification
            await _auditService.LogAuthEventAsync(new SecurityAuditEvent
            {
                Event = "tenant_email_verification_success",
                Email = matchingRegistration.ContactEmail.Value,
                TenantCode = matchingRegistration.CompanyCode,
                RiskScore = 10,
                GdprCategory = "authentication",
                Metadata = System.Text.Json.JsonSerializer.Serialize(new
                {
                    registrationId = matchingRegistration.Id,
                    companyName = matchingRegistration.CompanyName,
                    verificationType = !string.IsNullOrEmpty(request.Code) ? "code" : "token"
                })
            }, cancellationToken);

            // Schedule tenant creation in background with a small delay
            // This allows frontend to connect to SignalR and join the registration group
            // before tenant creation progress updates start being sent
            if (!matchingRegistration.TenantId.HasValue || matchingRegistration.TenantId.Value == Guid.Empty)
            {
                // Status must be Pending or Approved
                if (matchingRegistration.Status == RegistrationStatus.Pending ||
                    matchingRegistration.Status == RegistrationStatus.Approved)
                {
                    _logger.LogInformation(
                        "🚀 Scheduling tenant creation with 3 second delay for registration: {RegistrationId}, Company: {CompanyCode}, Status: {Status}",
                        matchingRegistration.Id,
                        matchingRegistration.CompanyCode,
                        matchingRegistration.Status);

                    // Schedule tenant creation with 3 second delay to allow frontend to:
                    // 1. Receive the API response with registrationId
                    // 2. Connect to SignalR
                    // 3. Join the registration-{id} group
                    // 4. Subscribe to TenantCreationProgress events
                    _backgroundJobService.Schedule<IMediator>(
                        mediator => mediator.Send(
                            new CreateTenantFromRegistrationCommand(matchingRegistration.Id),
                            CancellationToken.None),
                        TimeSpan.FromSeconds(3));

                    _logger.LogInformation(
                        "✅ Tenant creation scheduled for registration: {RegistrationId}",
                        matchingRegistration.Id);
                }
                else
                {
                    _logger.LogWarning(
                        "⚠️ Tenant creation skipped - Invalid status: {Status} for registration: {RegistrationId}",
                        matchingRegistration.Status,
                        matchingRegistration.Id);
                }
            }
            else
            {
                _logger.LogInformation(
                    "ℹ️ Tenant already exists for registration: {RegistrationId}, TenantId: {TenantId}",
                    matchingRegistration.Id,
                    matchingRegistration.TenantId);
            }

            return Result<VerifyTenantEmailResponse>.Success(new VerifyTenantEmailResponse
            {
                Success = true,
                RegistrationId = matchingRegistration.Id,
                Message = "E-posta doğrulandı. Hesabınız oluşturuluyor..."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email");

            // Log verification error
            await _auditService.LogSecurityEventAsync(new SecurityAuditEvent
            {
                Event = "tenant_email_verification_error",
                Email = request.Email,
                RiskScore = 50,
                Metadata = System.Text.Json.JsonSerializer.Serialize(new
                {
                    error = ex.Message,
                    stackTrace = ex.StackTrace != null ? ex.StackTrace.Substring(0, Math.Min(500, ex.StackTrace.Length)) : null
                })
            }, cancellationToken);

            return Result<VerifyTenantEmailResponse>.Failure(Error.Failure("Verification.Failed", $"E-posta doğrulama işlemi başarısız: {ex.Message}"));
        }
    }
}