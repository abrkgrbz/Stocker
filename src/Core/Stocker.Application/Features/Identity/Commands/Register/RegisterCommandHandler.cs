using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;
using System.Security.Claims;
using BC = BCrypt.Net.BCrypt;

namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly ITenantUnitOfWork _tenantUnitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ITenantUnitOfWork tenantUnitOfWork,
        ITokenService tokenService,
        IBackgroundJobService backgroundJobService,
        ILogger<RegisterCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _tenantUnitOfWork = tenantUnitOfWork;
        _tokenService = tokenService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting registration for company: {CompanyName}", request.CompanyName);

            // Create tenant - use provided domain or generate from company name
            var subdomain = !string.IsNullOrWhiteSpace(request.Domain) 
                ? request.Domain.ToLower().Trim() 
                : GenerateSubdomain(request.CompanyName);
                
            var connectionStringResult = Domain.Master.ValueObjects.ConnectionString.Create("");
            var emailResult = Domain.Common.ValueObjects.Email.Create(request.Email);
            
            if (connectionStringResult.IsFailure || emailResult.IsFailure)
            {
                return Result<RegisterResponse>.Failure(Error.Validation("Register.InvalidData", "Geçersiz veri"));
            }
            
            var tenant = Tenant.Create(
                name: request.CompanyName,
                code: subdomain,
                databaseName: $"StockerTenant_{subdomain}",
                connectionString: connectionStringResult.Value,
                contactEmail: emailResult.Value,
                contactPhone: null,
                description: $"Identity: {request.IdentityType}-{request.IdentityNumber}, Sector: {request.Sector}, Employees: {request.EmployeeCount}",
                logoUrl: null);

            await _masterUnitOfWork.Repository<Tenant>().AddAsync(tenant, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            // Create master user
            var masterUser = MasterUser.Create(
                username: request.Username,
                email: emailResult.Value,
                plainPassword: request.Password,
                firstName: request.FirstName,
                lastName: request.LastName,
                userType: Domain.Master.Enums.UserType.TenantAdmin,
                phoneNumber: null);

            // Log the generated hash for debugging - ENHANCED
            _logger.LogWarning("REGISTER HASH DEBUG - Username: {Username}, PasswordFirst3: {PasswordPrefix}, PasswordLength: {PasswordLength}, HashFirst20: {HashPrefix}, SaltFirst20: {SaltPrefix}, FullHash: {FullHash}, FullSalt: {FullSalt}",
                request.Username,
                request.Password?.Substring(0, Math.Min(3, request.Password?.Length ?? 0)) ?? "N/A",
                request.Password?.Length ?? 0,
                masterUser.Password?.Hash?.Substring(0, Math.Min(20, masterUser.Password?.Hash?.Length ?? 0)) ?? "N/A",
                masterUser.Password?.Salt?.Substring(0, Math.Min(20, masterUser.Password?.Salt?.Length ?? 0)) ?? "N/A",
                masterUser.Password?.Hash ?? "N/A",
                masterUser.Password?.Salt ?? "N/A");
            
            // Verify immediately after creation
            var immediateVerify = masterUser.Password.Verify(request.Password);
            _logger.LogWarning("REGISTER VERIFICATION TEST - Password: {Password}, Immediate verification: {ImmediateVerify}",
                request.Password?.Substring(0, Math.Min(3, request.Password?.Length ?? 0)) ?? "N/A",
                immediateVerify);

            // Generate email verification token
            var emailVerificationToken = masterUser.GenerateEmailVerificationToken();

            await _masterUnitOfWork.Repository<MasterUser>().AddAsync(masterUser, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            // Create user-tenant relationship
            var userTenant = new UserTenant(
                userId: masterUser.Id,
                tenantId: tenant.Id,
                role: "TenantAdmin");

            await _masterUnitOfWork.Repository<UserTenant>().AddAsync(userTenant, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            // Generate JWT token for auto-login
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, masterUser.Id.ToString()),
                new Claim(ClaimTypes.Email, masterUser.Email.Value),
                new Claim("TenantId", tenant.Id.ToString()),
                new Claim(ClaimTypes.Role, "TenantAdmin"),
                new Claim(ClaimTypes.Name, $"{masterUser.FirstName} {masterUser.LastName}")
            };
            
            var token = _tokenService.GenerateAccessToken(claims);
            var refreshToken = _tokenService.GenerateRefreshToken();
            
            // Save refresh token
            masterUser.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

            // Queue verification email as background job
            _backgroundJobService.Enqueue<IEmailBackgroundJob>(job => 
                job.SendVerificationEmailAsync(
                    request.Email,
                    emailVerificationToken.Token,
                    $"{request.FirstName} {request.LastName}"));
            
            _logger.LogInformation("Verification email queued for {Email}", request.Email);

            // Queue welcome email as background job with 5 second delay
            _backgroundJobService.Schedule<IEmailBackgroundJob>(job => 
                job.SendWelcomeEmailAsync(
                    request.Email,
                    $"{request.FirstName} {request.LastName}",
                    request.CompanyName),
                TimeSpan.FromSeconds(5));
            
            _logger.LogInformation("Welcome email queued for {Email}", request.Email);

            // Queue tenant provisioning as background job
            _backgroundJobService.Enqueue<ITenantProvisioningJob>(job => 
                job.ProvisionNewTenantAsync(tenant.Id));
            
            _logger.LogInformation("Tenant provisioning queued for {TenantId}", tenant.Id);

            _logger.LogInformation("Registration completed successfully for company: {CompanyName}", request.CompanyName);

            return Result<RegisterResponse>.Success(new RegisterResponse
            {
                Success = true,
                Message = "Kayıt başarıyla tamamlandı",
                UserId = masterUser.Id,
                TenantId = tenant.Id,
                CompanyId = Guid.Empty, // Company will be created after tenant setup
                Token = token,
                RefreshToken = refreshToken,
                Email = masterUser.Email.Value,
                FullName = $"{masterUser.FirstName} {masterUser.LastName}",
                Subdomain = tenant.Code,
                SubdomainUrl = $"https://{tenant.Code}.stocker.app",
                CompanyName = request.CompanyName,
                RequiresEmailVerification = true,
                RedirectUrl = $"/welcome?tenant={tenant.Id}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for company: {CompanyName}", request.CompanyName);
            return Result<RegisterResponse>.Failure(Error.Failure("Register.Failed", "Kayıt işlemi sırasında bir hata oluştu"));
        }
    }

    private string GenerateSubdomain(string companyName)
    {
        // Generate a URL-safe subdomain from company name
        var subdomain = companyName.ToLower()
            .Replace(" ", "-")
            .Replace("ş", "s")
            .Replace("ç", "c")
            .Replace("ğ", "g")
            .Replace("ı", "i")
            .Replace("ö", "o")
            .Replace("ü", "u")
            .Replace(".", "")
            .Replace(",", "");

        // Ensure uniqueness by adding a suffix if needed
        return $"{subdomain}-{Guid.NewGuid().ToString("N").Substring(0, 6)}";
    }
}