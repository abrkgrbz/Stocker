using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Extensions;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.RegisterTenant;

public class RegisterTenantCommandHandler : IRequestHandler<RegisterTenantCommand, Result<TenantDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly ILogger<RegisterTenantCommandHandler> _logger;
    private readonly IBackgroundJobService _backgroundJobService;

    public RegisterTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IEmailService emailService,
        IMapper mapper,
        ILogger<RegisterTenantCommandHandler> logger,
        IBackgroundJobService backgroundJobService)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _mapper = mapper;
        _logger = logger;
        _backgroundJobService = backgroundJobService;
    }

    public async Task<Result<TenantDto>> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        // Transaction başlat
        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        
        try
        {
            // Check if company code is unique
            var existingTenant = await _unitOfWork.Tenants()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.Code == request.CompanyCode, cancellationToken);

            if (existingTenant != null)
            {
                return Result<TenantDto>.Failure(
                    Error.Validation("CompanyCode.Duplicate", "Bu şirket kodu zaten kullanımda"));
            }

            // Check if email is unique
            var existingUser = await _unitOfWork.MasterUsers()
                .AsQueryable()
                .Where(u => EF.Property<string>(u, "Email") == request.ContactEmail)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingUser != null)
            {
                return Result<TenantDto>.Failure(
                    Error.Validation("Email.Duplicate", "Bu email adresi zaten kayıtlı"));
            }

            // Get package
            var package = await _unitOfWork.Packages()
                .GetByIdAsync(Guid.Parse(request.PackageId), cancellationToken);

            if (package == null)
            {
                return Result<TenantDto>.Failure(
                    Error.NotFound("Package.NotFound", "Seçilen paket bulunamadı"));
            }

            // Create tenant using factory method
            var connectionString =   ConnectionString.Create(GenerateConnectionString(request.CompanyCode));
            var contactEmail =  Email.Create(request.ContactEmail);
            var contactPhone = !string.IsNullOrEmpty(request.ContactPhone) 
                ?  PhoneNumber.Create(request.ContactPhone) 
                : null;
            if (connectionString.IsFailure)
            {
                return Result<TenantDto>.Failure(Error.Validation("Tenant.InvalidConnectionString", "Invalid connection string format"));
            }
            if (contactEmail.IsFailure)
            {
                return Result<TenantDto>.Failure(Error.Validation("RegisterTenant.InvalidContactEmail", "Invalid contactEmail string format"));
            }
            if (contactPhone.IsFailure)
            {
                return Result<TenantDto>.Failure(Error.Validation("Tenant.InvalidContactPhone", "Invalid contactPhone string format"));
            }
            var tenant = Tenant.Create(
                name: request.CompanyName,
                code: request.CompanyCode,
                databaseName: $"Stocker_Tenant_{request.CompanyCode}",
                connectionString: connectionString.Value,
                contactEmail: contactEmail.Value,
                contactPhone: contactPhone.Value,
                description: $"Registered via self-service on {DateTime.UtcNow:yyyy-MM-dd}",
                logoUrl: null
            );

            // Keep tenant INACTIVE until payment is completed
            tenant.Deactivate();

            // Add domain if specified
            if (!string.IsNullOrEmpty(request.Domain))
            {
                tenant.AddDomain(request.Domain, isPrimary: true);
            }

            // Validate password before creating user
            // Note: In production, password validation should be done earlier in the process
            // This is just a safety check
            
            // Create master user for tenant admin
            // DON'T hash the password here - MasterUser.Create will do it
            
            // Parse name parts
            var nameParts = request.ContactName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.FirstOrDefault() ?? "Admin";
            var lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "User";
            
            var masterUser = MasterUser.Create(
                username: request.ContactEmail, // Use email as username
                email: contactEmail.Value,
                plainPassword: request.Password,  // ✅ DOĞRU! plainPassword kullan
                firstName: firstName,
                lastName: lastName,
                userType: UserType.FirmaYoneticisi,
                phoneNumber: contactPhone?.Value
            );

            // Assign user to tenant with TenantAdmin role
            masterUser.AssignToTenant(tenant.Id, UserType.FirmaYoneticisi);
            
            // Generate email verification token
            var verificationToken = masterUser.GenerateEmailVerificationToken();

            // Create subscription but mark it as PENDING (not active until payment)
            var billingCycle = request.BillingPeriod == "Yearly" 
                ? BillingCycle.Yillik 
                : BillingCycle.Aylik;
             
            var price = package.BasePrice;
            // Set a minimal trial period (1 day) to avoid validation error
            // This will be updated after payment
            var trialEndDate = DateTime.UtcNow.AddDays(1);
            
            var subscription = Subscription.Create(
                tenantId: tenant.Id,
                packageId: package.Id,
                billingCycle: billingCycle,
                price: price,
                startDate: DateTime.UtcNow,
                trialEndDate: trialEndDate
            );

            // Subscription starts as PENDING, not TRIAL
            subscription.Suspend("Awaiting payment"); // This will set status to Suspended until payment

            // Add package modules to subscription
            foreach (var module in package.Modules)
            {
                subscription.AddModule(module.ModuleCode, module.ModuleName, module.MaxEntities);
            }

            // Save to database
            await _unitOfWork.Tenants().AddAsync(tenant, cancellationToken);
            await _unitOfWork.MasterUsers().AddAsync(masterUser, cancellationToken);
            await _unitOfWork.Subscriptions().AddAsync(subscription, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            // Transaction'ı commit et
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Trigger tenant database provisioning in background
            _logger.LogInformation("Triggering tenant database provisioning for: {TenantId}", tenant.Id);
            _backgroundJobService.Enqueue<ITenantProvisioningJob>(job => job.ProvisionNewTenantAsync(tenant.Id));

            // Send verification email immediately
            try
            {
                await SendVerificationEmail(tenant, masterUser, verificationToken);
                _logger.LogInformation("Verification email sent successfully to: {Email}", masterUser.Email.Value);
            }
            catch (Exception emailEx)
            {
                // Email gönderimi başarısız olsa bile kayıt işlemi başarılı
                // Kullanıcı daha sonra email doğrulama linkini tekrar isteyebilir
                _logger.LogError(emailEx, "Failed to send verification email to: {Email}", masterUser.Email.Value);
            }

            _logger.LogInformation("Tenant registered successfully, database provisioning started: {TenantId}", tenant.Id);

            // Return success with message for frontend
            var result = _mapper.Map<TenantDto>(tenant);
            return Result<TenantDto>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering tenant");
            
            // Transaction'ı geri al
            if (_unitOfWork.HasActiveTransaction)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                _logger.LogInformation("Transaction rolled back due to registration error");
            }
            
            // Daha detaylı hata mesajı
            var errorMessage = "Kayıt işlemi başarısız oldu";
            if (ex.Message.Contains("duplicate", StringComparison.OrdinalIgnoreCase) || 
                ex.Message.Contains("unique", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Bu bilgiler ile daha önce kayıt yapılmış";
            }
            else if (ex.Message.Contains("connection", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Veritabanı bağlantı hatası";
            }
            
            return Result<TenantDto>.Failure(
                Error.Failure("Registration.Failed", errorMessage));
        }
    }

    private string GenerateConnectionString(string companyCode)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        
        if (environment == "Production")
        {
            // Production'da Docker network üzerinden SQL Server'a bağlan
            return $"Server=coolify.stoocker.app;Database=Stocker_Tenant_{companyCode};User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=true;";
        }
        
        // Local development
        return $"Server=localhost;Database=Stocker_Tenant_{companyCode};Trusted_Connection=true;TrustServerCertificate=true;";
    }

    private async Task SendVerificationEmail(Tenant tenant, MasterUser user, EmailVerificationToken verificationToken)
    {
        var baseUrl = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production" 
            ? "https://stoocker.app" 
            : "http://localhost:3000";
        
        var emailContent = $@"
            <h2>Stocker'a Hoş Geldiniz!</h2>
            <p>Sayın {user.FirstName} {user.LastName},</p>
            <p>{tenant.Name} için Stocker hesabınız başarıyla oluşturuldu.</p>
            <p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
            <a href='{baseUrl}/verify-email?token={verificationToken.Token}&email={Uri.EscapeDataString(user.Email.Value)}' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Hesabımı Aktifleştir</a>
            <p>Bu link 24 saat geçerlidir.</p>
            <p>Eğer link çalışmıyorsa, aşağıdaki URL'yi tarayıcınıza kopyalayın:</p>
            <p>{baseUrl}/verify-email?token={verificationToken.Token}&email={Uri.EscapeDataString(user.Email.Value)}</p>
            <br>
            <p>Saygılarımızla,<br>Stocker Ekibi</p>
        ";

        var emailMessage = new EmailMessage
        {
            To = user.Email.Value,
            Subject = "Stocker Hesap Aktivasyonu",
            Body = emailContent,
            IsHtml = true
        };

        await _emailService.SendAsync(emailMessage);
    }
}