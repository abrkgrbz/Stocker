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
                // Log failed verification - already verified
                await _auditService.LogAuthEventAsync(new SecurityAuditEvent
                {
                    Event = "tenant_email_verification_failed",
                    Email = matchingRegistration.ContactEmail.Value,
                    TenantCode = matchingRegistration.CompanyCode,
                    RiskScore = 20,
                    GdprCategory = "authentication",
                    Metadata = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        reason = "already_verified",
                        registrationId = matchingRegistration.Id
                    })
                }, cancellationToken);

                return Result<VerifyTenantEmailResponse>.Failure(Error.Validation("Email.AlreadyVerified", "E-posta adresi zaten doğrulanmış."));
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

            // Create tenant immediately (synchronous) for better UX
            // Only if tenant doesn't already exist
            if (!matchingRegistration.TenantId.HasValue || matchingRegistration.TenantId.Value == Guid.Empty)
            {
                // Status must be Pending or Approved
                if (matchingRegistration.Status == RegistrationStatus.Pending ||
                    matchingRegistration.Status == RegistrationStatus.Approved)
                {
                    _logger.LogInformation(
                        "🚀 Creating tenant synchronously for registration: {RegistrationId}, Company: {CompanyCode}, Status: {Status}",
                        matchingRegistration.Id,
                        matchingRegistration.CompanyCode,
                        matchingRegistration.Status);

                    try
                    {
                        // Create tenant synchronously
                        var tenantCreationResult = await _mediator.Send(
                            new CreateTenantFromRegistrationCommand(matchingRegistration.Id),
                            cancellationToken);

                        if (tenantCreationResult.IsSuccess)
                        {
                            _logger.LogInformation(
                                "✅ Tenant created successfully for registration: {RegistrationId}, TenantId: {TenantId}",
                                matchingRegistration.Id,
                                tenantCreationResult.Value.Id);
                        }
                        else
                        {
                            _logger.LogError(
                                "❌ Failed to create tenant for registration: {RegistrationId}, Error: {Error}",
                                matchingRegistration.Id,
                                tenantCreationResult.Error?.Description);

                            // Don't fail email verification if tenant creation fails
                            // User can try again or admin can manually create tenant
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "❌ Exception during tenant creation for registration: {RegistrationId}",
                            matchingRegistration.Id);

                        // Don't fail email verification if tenant creation fails
                    }
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