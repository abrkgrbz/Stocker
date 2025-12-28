using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.ResendVerificationEmail;

public sealed class ResendTenantVerificationEmailCommandHandler
    : IRequestHandler<ResendTenantVerificationEmailCommand, Result<ResendTenantVerificationEmailResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<ResendTenantVerificationEmailCommandHandler> _logger;

    public ResendTenantVerificationEmailCommandHandler(
        IMasterDbContext context,
        IBackgroundJobService backgroundJobService,
        ILogger<ResendTenantVerificationEmailCommandHandler> logger)
    {
        _context = context;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<Result<ResendTenantVerificationEmailResponse>> Handle(
        ResendTenantVerificationEmailCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing resend tenant verification email for: {Email}", request.Email);

            // Find registration by email (check both ContactEmail and AdminEmail)
            var registration = await _context.TenantRegistrations
                .FirstOrDefaultAsync(r =>
                    r.ContactEmail.Value == request.Email ||
                    r.AdminEmail.Value == request.Email,
                    cancellationToken);

            if (registration == null)
            {
                _logger.LogWarning("Registration not found for email: {Email}", request.Email);
                // Don't reveal if registration exists or not for security
                return Result<ResendTenantVerificationEmailResponse>.Success(new ResendTenantVerificationEmailResponse
                {
                    Success = true,
                    Message = "Eğer bu email adresi kayıtlıysa, doğrulama emaili gönderilecektir."
                });
            }

            // Check if already verified
            if (registration.EmailVerified)
            {
                _logger.LogInformation("Email already verified for: {Email}", request.Email);
                return Result<ResendTenantVerificationEmailResponse>.Success(new ResendTenantVerificationEmailResponse
                {
                    Success = true,
                    Message = "Email adresi zaten doğrulanmış."
                });
            }

            // Regenerate verification code and token
            var (newCode, newToken) = registration.RegenerateEmailVerificationCode();

            // Save changes
            await _context.SaveChangesAsync(cancellationToken);

            // Queue verification email as background job
            try
            {
                var jobId = _backgroundJobService.Enqueue<IEmailBackgroundJob>(job =>
                    job.SendTenantVerificationEmailAsync(
                        registration.ContactEmail.Value,
                        newCode,
                        newToken,
                        $"{registration.ContactPersonName} {registration.ContactPersonSurname}"));

                _logger.LogInformation("Verification email queued successfully. JobId: {JobId}, Email: {Email}",
                    jobId, request.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to queue verification email for {Email}", request.Email);
                return Result<ResendTenantVerificationEmailResponse>.Failure(
                    Error.Failure("ResendVerification.EmailFailed", "Email gönderilemedi. Lütfen daha sonra tekrar deneyin."));
            }

            return Result<ResendTenantVerificationEmailResponse>.Success(new ResendTenantVerificationEmailResponse
            {
                Success = true,
                Message = "Doğrulama emaili başarıyla gönderildi. Lütfen email kutunuzu kontrol edin."
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already verified"))
        {
            _logger.LogInformation("Email already verified for: {Email}", request.Email);
            return Result<ResendTenantVerificationEmailResponse>.Success(new ResendTenantVerificationEmailResponse
            {
                Success = true,
                Message = "Email adresi zaten doğrulanmış."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during resend tenant verification email for: {Email}", request.Email);
            return Result<ResendTenantVerificationEmailResponse>.Failure(
                Error.Failure("ResendVerification.Failed", "Email gönderimi sırasında bir hata oluştu."));
        }
    }
}
