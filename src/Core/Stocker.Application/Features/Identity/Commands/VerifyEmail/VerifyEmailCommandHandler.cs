using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;
using Stocker.Domain.Master.Entities;

namespace Stocker.Application.Features.Identity.Commands.VerifyEmail;

public sealed class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Result<VerifyEmailResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly ILogger<VerifyEmailCommandHandler> _logger;

    public VerifyEmailCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ILogger<VerifyEmailCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _logger = logger;
    }

    public async Task<Result<VerifyEmailResponse>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing email verification for: {Email}", request.Email);

            // Find user by email
            var user = await _masterUnitOfWork.Repository<MasterUser>()
                .SingleOrDefaultAsync(u => u.Email.Value == request.Email, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for email: {Email}", request.Email);
                return Result<VerifyEmailResponse>.Failure(Error.NotFound("VerifyEmail.UserNotFound", "Kullanıcı bulunamadı"));
            }

            // Check if already verified
            if (user.IsEmailVerified)
            {
                _logger.LogInformation("Email already verified for: {Email}", request.Email);
                return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
                {
                    Success = true,
                    Message = "Email adresi zaten doğrulanmış",
                    RedirectUrl = "/login"
                });
            }

            // Verify the token
            try
            {
                user.VerifyEmail(request.Token);
                await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Email verified successfully for: {Email}", request.Email);

                // Get tenant for redirect
                var userTenant = await _masterUnitOfWork.Repository<UserTenant>()
                    .SingleOrDefaultAsync(ut => ut.UserId == user.Id, cancellationToken);

                var redirectUrl = userTenant != null 
                    ? $"/login?tenant={userTenant.TenantId}" 
                    : "/login";

                return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
                {
                    Success = true,
                    Message = "Email adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.",
                    RedirectUrl = redirectUrl
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid or expired token for email: {Email}", request.Email);
                return Result<VerifyEmailResponse>.Failure(Error.Validation("VerifyEmail.InvalidToken", ex.Message));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during email verification for: {Email}", request.Email);
            return Result<VerifyEmailResponse>.Failure(Error.Failure("VerifyEmail.Failed", "Email doğrulama sırasında bir hata oluştu"));
        }
    }
}