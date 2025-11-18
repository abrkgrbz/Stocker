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

            // Find user by email - Add detailed logging
            var emailValue = emailResult.Value.Value;
            _logger.LogInformation("Searching for user with email: {Email}", emailValue);
            
            Domain.Master.Entities.MasterUser? user = null;
            
            try
            {
                // Try using owned entity navigation
                _logger.LogDebug("Attempting to query with owned entity navigation");
                user = await _unitOfWork.Repository<Domain.Master.Entities.MasterUser>()
                    .AsQueryable()
                    // UserTenants moved to Tenant domain
                    .FirstOrDefaultAsync(u => u.Email.Value == emailValue, cancellationToken);
            }
            catch (Exception queryEx)
            {
                _logger.LogError(queryEx, "Owned entity query failed, trying alternative approach. Error: {ErrorMessage}", queryEx.Message);
                
                // Fallback: Load all users and filter in memory
                _logger.LogDebug("Using in-memory filtering as fallback");
                var allUsers = await _unitOfWork.Repository<Domain.Master.Entities.MasterUser>()
                    .AsQueryable()
                    // UserTenants moved to Tenant domain
                    .ToListAsync(cancellationToken);
                
                _logger.LogDebug($"Loaded {allUsers.Count} users, filtering by email");
                user = allUsers.FirstOrDefault(u => u.Email?.Value == emailValue);
            }

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
                // UserTenant has been moved to Tenant domain
                // Tenant association should be retrieved from Tenant context
                // For now, returning without tenant information
                
                return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
                {
                    Success = true,
                    Message = "Email adresiniz zaten doğrulanmış. Giriş yapabilirsiniz.",
                    RedirectUrl = "/login",
                    TenantId = null,
                    TenantName = null
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
            
            // Activate user if not already active
            if (!user.IsActive)
            {
                user.Activate();
                _logger.LogInformation("User activated after email verification: {UserId}", user.Id);
            }
            else
            {
                _logger.LogInformation("User was already active: {UserId}", user.Id);
            }

            // Get tenant information - Find tenant by contact email
            var tenant = await _unitOfWork.Repository<Domain.Master.Entities.Tenant>()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.ContactEmail.Value == emailValue, cancellationToken);

            if (tenant == null)
            {
                _logger.LogWarning("No tenant found for user email: {Email}", emailValue);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
                {
                    Success = true,
                    Message = "Email adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.",
                    RedirectUrl = "/login",
                    TenantId = null,
                    TenantName = null
                });
            }

            // Create TenantRegistration record
            var contactEmailVo = Domain.Common.ValueObjects.Email.Create(emailValue);
            var contactPhoneVo = user.PhoneNumber ?? Domain.Common.ValueObjects.PhoneNumber.Create("+90");
            var adminEmailVo = Domain.Common.ValueObjects.Email.Create(emailValue);

            if (contactEmailVo.IsFailure || contactPhoneVo.IsFailure || adminEmailVo.IsFailure)
            {
                _logger.LogError("Failed to create value objects for TenantRegistration");
            }
            else
            {
                var tenantRegistration = Domain.Master.Entities.TenantRegistration.Create(
                    companyName: tenant.Name,
                    companyCode: tenant.Code,
                    contactPersonName: user.FirstName,
                    contactPersonSurname: user.LastName,
                    contactEmail: contactEmailVo.Value,
                    contactPhone: contactPhoneVo.Value,
                    addressLine1: "",
                    city: "Istanbul",
                    postalCode: "34000",
                    country: "Turkey",
                    adminEmail: adminEmailVo.Value,
                    adminUsername: user.Username,
                    adminFirstName: user.FirstName,
                    adminLastName: user.LastName);

                // Auto-approve since email is verified
                tenantRegistration.Approve("System", tenant.Id);

                await _unitOfWork.Repository<Domain.Master.Entities.TenantRegistration>()
                    .AddAsync(tenantRegistration, cancellationToken);

                _logger.LogInformation("Created TenantRegistration for tenant: {TenantId}", tenant.Id);
            }

            // Create TenantDomain record for subdomain
            var tenantDomain = Domain.Master.Entities.TenantDomain.Create(
                tenantId: tenant.Id,
                domainName: $"{tenant.Code}.stoocker.app",
                isPrimary: true);

            tenantDomain.Verify(); // Auto-verify the subdomain

            await _unitOfWork.Repository<Domain.Master.Entities.TenantDomain>()
                .AddAsync(tenantDomain, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email verified successfully for user: {UserId}, Tenant: {TenantId}", user.Id, tenant.Id);
            _logger.LogInformation("Created TenantRegistration and TenantDomain for tenant: {TenantId}", tenant.Id);

            return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
            {
                Success = true,
                Message = "Email adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.",
                RedirectUrl = "/login",
                TenantId = tenant.Id,
                TenantName = tenant.Name
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