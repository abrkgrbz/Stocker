using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Repositories;
using System.Security.Claims;
using BC = BCrypt.Net.BCrypt;

namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly IMasterUnitOfWork _masterUnitOfWork;
    private readonly ITenantContextFactory _tenantContextFactory;
    private readonly ITokenService _tokenService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ITenantContextFactory tenantContextFactory,
        ITokenService tokenService,
        IBackgroundJobService backgroundJobService,
        ILogger<RegisterCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _tenantContextFactory = tenantContextFactory;
        _tokenService = tokenService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogWarning("REGISTER START - Company: {Company}, Username: {Username}, Email: {Email}", 
                request.CompanyName, request.Username, request.Email);
            _logger.LogInformation("Starting registration for company: {CompanyName}", request.CompanyName);

            // Create tenant - use provided domain or generate from company name
            var subdomain = !string.IsNullOrWhiteSpace(request.Domain) 
                ? request.Domain.ToLower().Trim() 
                : GenerateSubdomain(request.CompanyName);
                
            // Use a placeholder SQLite connection string during registration
            // The actual connection string will be set during tenant provisioning
            var connectionStringResult = Domain.Master.ValueObjects.ConnectionString.Create($"Data Source=StockerTenant_{subdomain}.db");
            var emailResult = Domain.Common.ValueObjects.Email.Create(request.Email);
            
            if (connectionStringResult.IsFailure || emailResult.IsFailure)
            {
                return Result<RegisterResponse>.Failure(Error.Validation("Register.InvalidData", "Geçersiz veri"));
            }
            
            var tenant = Domain.Master.Entities.Tenant.Create(
                name: request.CompanyName,
                code: subdomain,
                databaseName: $"StockerTenant_{subdomain}",
                connectionString: connectionStringResult.Value,
                contactEmail: emailResult.Value,
                contactPhone: null,
                description: $"Identity: {request.IdentityType}-{request.IdentityNumber}, Sector: {request.Sector}, Employees: {request.EmployeeCount}",
                logoUrl: null);

            await _masterUnitOfWork.Repository<Domain.Master.Entities.Tenant>().AddAsync(tenant, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

      
            
            // Create master user
            var masterUser = MasterUser.Create(
                username: request.Username,
                email: emailResult.Value,
                plainPassword: request.Password,
                firstName: request.FirstName,
                lastName: request.LastName,
                userType: Domain.Master.Enums.UserType.FirmaYoneticisi,
                phoneNumber: null);
            
            // CRITICAL DEBUG: Before SaveChanges
            _logger.LogWarning("BEFORE SAVE - User: {User}, Hash: {Hash}, Salt: {Salt}, PasswordValue: {PValue}, PasswordHash: {PHash}",
                masterUser.Username,
                masterUser.Password?.Hash,
                masterUser.Password?.Salt,
                masterUser.Password?.Value,
                masterUser.PasswordHash);

            // Generate email verification token
            var emailVerificationToken = masterUser.GenerateEmailVerificationToken();

            await _masterUnitOfWork.Repository<MasterUser>().AddAsync(masterUser, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);
            
            // CRITICAL DEBUG: Reload from database
            var reloadedUser = await _masterUnitOfWork.Repository<MasterUser>()
                .SingleOrDefaultAsync(u => u.Id == masterUser.Id, cancellationToken);
                
            _logger.LogWarning("AFTER SAVE - User: {User}, Hash: {Hash}, Salt: {Salt}, PasswordValue: {PValue}, PasswordHash: {PHash}",
                reloadedUser?.Username,
                reloadedUser?.Password?.Hash,
                reloadedUser?.Password?.Salt,
                reloadedUser?.Password?.Value,
                reloadedUser?.PasswordHash);

            // Create user-tenant relationship in the tenant's database
            // Note: During registration, the tenant's database might need to be created first
            // This should be handled by a separate migration/setup process
            try
            {
                using (var tenantContext = await _tenantContextFactory.CreateAsync(tenant.Id))
                {
                    var userTenant = UserTenant.Create(
                        userId: masterUser.Id,
                        username: masterUser.Username,
                        email: masterUser.Email.Value,
                        firstName: masterUser.FirstName,
                        lastName: masterUser.LastName,
                        userType: Domain.Tenant.Entities.UserType.FirmaYoneticisi,
                        assignedBy: "System",
                        phoneNumber: masterUser.PhoneNumber?.Value);

                    await tenantContext.Set<UserTenant>().AddAsync(userTenant, cancellationToken);
                    await tenantContext.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not create UserTenant for tenant {TenantId}. Tenant database might not be ready yet.", tenant.Id);
                // This is expected during registration - the tenant database might not exist yet
                // The UserTenant will be created during the tenant setup process
            }

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
            _logger.LogError(ex, "REGISTER ERROR - Company: {CompanyName}, Error: {Error}", 
                request.CompanyName, ex.Message);
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