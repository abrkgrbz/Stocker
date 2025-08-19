using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;
using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Features.Identity.Commands.ResendVerificationEmail;

public sealed class ResendVerificationEmailCommandHandler : IRequestHandler<ResendVerificationEmailCommand, Result<ResendVerificationEmailResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly IEmailService _emailService;
    private readonly ILogger<ResendVerificationEmailCommandHandler> _logger;

    public ResendVerificationEmailCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        IEmailService emailService,
        ILogger<ResendVerificationEmailCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<ResendVerificationEmailResponse>> Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing resend verification email for: {Email}", request.Email);

            // Find user by email
            var user = await _masterUnitOfWork.Repository<MasterUser>()
                .SingleOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for email: {Email}", request.Email);
                // Don't reveal if user exists or not for security
                return Result<ResendVerificationEmailResponse>.Success(new ResendVerificationEmailResponse
                {
                    Success = true,
                    Message = "Eğer bu email adresi kayıtlıysa, doğrulama emaili gönderilecektir."
                });
            }

            // Check if already verified
            if (user.IsEmailVerified)
            {
                _logger.LogInformation("Email already verified for: {Email}", request.Email);
                return Result<ResendVerificationEmailResponse>.Success(new ResendVerificationEmailResponse
                {
                    Success = true,
                    Message = "Email adresi zaten doğrulanmış."
                });
            }

            // Check for rate limiting (don't allow resending within 1 minute)
            if (user.EmailVerificationToken != null && 
                user.EmailVerificationToken.CreatedAt > DateTime.UtcNow.AddMinutes(-1))
            {
                var remainingSeconds = 60 - (DateTime.UtcNow - user.EmailVerificationToken.CreatedAt).TotalSeconds;
                _logger.LogWarning("Rate limit hit for email verification resend: {Email}", request.Email);
                return Result<ResendVerificationEmailResponse>.Failure(
                    Error.Validation("ResendVerification.TooSoon", 
                    $"Lütfen {Math.Ceiling(remainingSeconds)} saniye sonra tekrar deneyin."));
            }

            // Generate new verification token
            var emailVerificationToken = user.GenerateEmailVerificationToken();
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            // Send verification email
            try
            {
                await _emailService.SendEmailVerificationAsync(
                    email: request.Email,
                    token: emailVerificationToken.Token,
                    userName: user.GetFullName(),
                    cancellationToken);
                
                _logger.LogInformation("Verification email resent to {Email}", request.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend verification email to {Email}", request.Email);
                return Result<ResendVerificationEmailResponse>.Failure(
                    Error.Failure("ResendVerification.EmailFailed", "Email gönderilemedi. Lütfen daha sonra tekrar deneyin."));
            }

            return Result<ResendVerificationEmailResponse>.Success(new ResendVerificationEmailResponse
            {
                Success = true,
                Message = "Doğrulama emaili başarıyla gönderildi. Lütfen email kutunuzu kontrol edin."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during resend verification email for: {Email}", request.Email);
            return Result<ResendVerificationEmailResponse>.Failure(
                Error.Failure("ResendVerification.Failed", "Email gönderimi sırasında bir hata oluştu"));
        }
    }
}