using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
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
    private readonly IConfiguration _configuration;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IMasterUnitOfWork masterUnitOfWork,
        ITenantContextFactory tenantContextFactory,
        ITokenService tokenService,
        IBackgroundJobService backgroundJobService,
        IConfiguration configuration,
        ILogger<RegisterCommandHandler> logger)
    {
        _masterUnitOfWork = masterUnitOfWork;
        _tenantContextFactory = tenantContextFactory;
        _tokenService = tokenService;
        _backgroundJobService = backgroundJobService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("REGISTER START (Minimal Flow) - Email: {Email}, TeamName: {TeamName}, Name: {FirstName} {LastName}",
                request.Email, request.TeamName, request.FirstName, request.LastName);

            // Validate essential fields
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.TeamName) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName))
            {
                return Result<RegisterResponse>.Failure(Error.Validation("Register.MissingFields", "Tüm alanları doldurmanız gerekiyor"));
            }

            // Use TeamName as subdomain
            var subdomain = request.TeamName.ToLower().Trim();

            // Check if email already exists
            var existingUserByEmail = await _masterUnitOfWork.Repository<MasterUser>()
                .SingleOrDefaultAsync(u => u.Email.Value.ToLower() == request.Email.ToLower(), cancellationToken);

            if (existingUserByEmail != null)
            {
                _logger.LogWarning("Registration failed - Email already exists: {Email}", request.Email);
                return Result<RegisterResponse>.Failure(Error.Conflict("Register.EmailExists", "Bu e-posta adresi zaten kullanılıyor"));
            }

            // Check if tenant code (team name) already exists
            var existingTenant = await _masterUnitOfWork.Repository<Domain.Master.Entities.Tenant>()
                .SingleOrDefaultAsync(t => t.Code.ToLower() == subdomain, cancellationToken);

            if (existingTenant != null)
            {
                _logger.LogWarning("Registration failed - Team name already exists: {TeamName}", request.TeamName);
                return Result<RegisterResponse>.Failure(Error.Conflict("Register.TeamNameExists", "Bu takım adı zaten kullanılıyor"));
            }

            // Build PostgreSQL connection string for tenant database based on master connection
            var masterConnectionString = _configuration.GetConnectionString("MasterConnection");
            if (string.IsNullOrEmpty(masterConnectionString))
            {
                return Result<RegisterResponse>.Failure(Error.Validation("Register.NoMasterConnection", "Sistem yapılandırması hatalı"));
            }

            var tenantDatabaseName = $"tenant_{subdomain}";

            // Parse master connection string and replace database name
            var builder = new Npgsql.NpgsqlConnectionStringBuilder(masterConnectionString)
            {
                Database = tenantDatabaseName
            };
            var tenantConnectionString = builder.ConnectionString;

            _logger.LogInformation("Creating tenant with database: {DatabaseName}", tenantDatabaseName);

            var connectionStringResult = Domain.Master.ValueObjects.ConnectionString.Create(tenantConnectionString);
            var emailResult = Domain.Common.ValueObjects.Email.Create(request.Email);

            if (connectionStringResult.IsFailure || emailResult.IsFailure)
            {
                return Result<RegisterResponse>.Failure(Error.Validation("Register.InvalidData", "Geçersiz veri"));
            }

            // Use TeamName as company name initially (can be updated later)
            var companyName = $"{request.FirstName} {request.LastName}'s Team";

            var tenant = Domain.Master.Entities.Tenant.Create(
                name: companyName,
                code: subdomain,
                databaseName: tenantDatabaseName,
                connectionString: connectionStringResult.Value,
                contactEmail: emailResult.Value,
                contactPhone: null,
                description: $"Minimal registration - {DateTime.UtcNow:yyyy-MM-dd}",
                logoUrl: null);

            await _masterUnitOfWork.Repository<Domain.Master.Entities.Tenant>().AddAsync(tenant, cancellationToken);
            await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

      
            
            // Create master user - use email as username
            var masterUser = MasterUser.Create(
                username: request.Email.Split('@')[0], // Use email prefix as username
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

            // CRITICAL: Queue verification email - if this fails, rollback the entire registration
            // This ensures users don't get "stuck" in a state where they're registered but can't verify
            try
            {
                _logger.LogInformation("Queuing verification email for {Email}", request.Email);
                _backgroundJobService.Enqueue<IEmailBackgroundJob>(job =>
                    job.SendTenantVerificationEmailAsync(
                        request.Email,
                        emailVerificationToken.OtpCode,
                        emailVerificationToken.Token,
                        $"{request.FirstName} {request.LastName}"));
                _logger.LogInformation("Verification email with OTP code queued successfully for {Email}", request.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "CRITICAL: Failed to queue verification email for {Email}. Rolling back registration.", request.Email);

                // Rollback: Remove the user and tenant from database
                _masterUnitOfWork.Repository<MasterUser>().Remove(masterUser);
                _masterUnitOfWork.Repository<Domain.Master.Entities.Tenant>().Remove(tenant);
                await _masterUnitOfWork.SaveChangesAsync(cancellationToken);

                return Result<RegisterResponse>.Failure(
                    Error.Failure("Register.EmailQueueFailed",
                    "Kayıt işlemi tamamlanamadı. Lütfen daha sonra tekrar deneyin."));
            }

            _logger.LogInformation("Registration completed successfully for team: {TeamName}. Database will be created after email verification.", request.TeamName);

            return Result<RegisterResponse>.Success(new RegisterResponse
            {
                Success = true,
                Message = "Kayıt başarıyla tamamlandı! Lütfen email adresinizi kontrol edin ve doğrulama linkine tıklayın.",
                UserId = masterUser.Id,
                TenantId = tenant.Id,
                CompanyId = Guid.Empty, // Company will be created during setup
                Token = token,
                RefreshToken = refreshToken,
                Email = masterUser.Email.Value,
                FullName = $"{masterUser.FirstName} {masterUser.LastName}",
                Subdomain = tenant.Code,
                SubdomainUrl = $"https://{tenant.Code}.stoocker.app",
                CompanyName = companyName,
                RequiresEmailVerification = true,
                RequiresSetup = false, // Setup will be done after email verification
                RedirectUrl = $"/register/verify-email?email={Uri.EscapeDataString(request.Email)}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "REGISTER ERROR - TeamName: {TeamName}, Email: {Email}, Error: {Error}",
                request.TeamName, request.Email, ex.Message);
            return Result<RegisterResponse>.Failure(Error.Failure("Register.Failed", "Kayıt işlemi sırasında bir hata oluştu"));
        }
    }
}