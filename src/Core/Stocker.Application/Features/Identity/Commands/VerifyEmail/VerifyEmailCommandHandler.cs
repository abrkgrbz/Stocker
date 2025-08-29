using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Features.Identity.Commands.VerifyEmail;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Result<VerifyEmailResponse>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<VerifyEmailCommandHandler> _logger;

    public VerifyEmailCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<VerifyEmailCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<VerifyEmailResponse>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate email format
            var emailResult = Email.Create(request.Email);
            if (emailResult.IsFailure)
            {
                return Result<VerifyEmailResponse>.Failure(
                    Error.Validation("VerifyEmail.InvalidEmail", "Geçersiz email adresi"));
            }

            // Find user by email
            var user = await _unitOfWork.Repository<Domain.Master.Entities.MasterUser>()
                .AsQueryable()
                .Include(u => u.UserTenants)
                .FirstOrDefaultAsync(u => u.Email == emailResult.Value, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("Email verification attempted for non-existent user: {Email}", request.Email);
                return Result<VerifyEmailResponse>.Failure(
                    Error.NotFound("VerifyEmail.UserNotFound", "Kullanıcı bulunamadı"));
            }

            // Check if already verified
            if (user.IsEmailVerified)
            {
                _logger.LogInformation("Email already verified for user: {UserId}", user.Id);
                var userTenant = user.UserTenants.FirstOrDefault();
                string? existingTenantName = null;
                
                if (userTenant != null)
                {
                    var existingTenant = await _unitOfWork.Repository<Domain.Master.Entities.Tenant>()
                        .AsQueryable()
                        .FirstOrDefaultAsync(t => t.Id == userTenant.TenantId, cancellationToken);
                    existingTenantName = existingTenant?.Name;
                }
                
                return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
                {
                    Success = true,
                    Message = "Email adresiniz zaten doğrulanmış. Giriş yapabilirsiniz.",
                    RedirectUrl = "/login",
                    TenantId = userTenant?.TenantId,
                    TenantName = existingTenantName
                });
            }

            // Validate token
            if (!user.ValidateEmailVerificationToken(request.Token))
            {
                _logger.LogWarning("Invalid email verification token for user: {UserId}", user.Id);
                return Result<VerifyEmailResponse>.Failure(
                    Error.Validation("VerifyEmail.InvalidToken", "Geçersiz veya süresi dolmuş doğrulama linki"));
            }

            // Verify email
            user.VerifyEmail();
            
            // Activate user
            user.Activate();

            // Get tenant information
            var userTenantInfo = user.UserTenants.FirstOrDefault();
            Domain.Master.Entities.Tenant? tenant = null;
            string? tenantName = null;
            
            if (userTenantInfo != null)
            {
                // Load tenant separately
                tenant = await _unitOfWork.Repository<Domain.Master.Entities.Tenant>()
                    .AsQueryable()
                    .FirstOrDefaultAsync(t => t.Id == userTenantInfo.TenantId, cancellationToken);
                
                if (tenant != null)
                {
                    tenantName = tenant.Name;
                    if (!tenant.IsActive)
                    {
                        tenant.Activate();
                        _logger.LogInformation("Tenant activated after email verification: {TenantId}", tenant.Id);
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email verified successfully for user: {UserId}", user.Id);

            return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
            {
                Success = true,
                Message = "Email adresiniz başarıyla doğrulandı! Şirket bilgilerinizi tamamlayarak başlayabilirsiniz.",
                RedirectUrl = "/company-setup",
                TenantId = userTenantInfo?.TenantId,
                TenantName = tenantName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email for {Email}", request.Email);
            return Result<VerifyEmailResponse>.Failure(
                Error.Failure("VerifyEmail.Failed", "Email doğrulama işlemi başarısız oldu"));
        }
    }
}