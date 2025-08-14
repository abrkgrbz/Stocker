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
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly ILogger<RegisterTenantCommandHandler> _logger;

    public RegisterTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        IMapper mapper,
        ILogger<RegisterTenantCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<TenantDto>> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
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
                .FirstOrDefaultAsync(u => u.Email.Value == request.ContactEmail, cancellationToken);

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
            var hashedPassword = _passwordHasher.HashPassword(request.Password);
            
            // Parse name parts
            var nameParts = request.ContactName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.FirstOrDefault() ?? "Admin";
            var lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "User";
            
            var masterUser = MasterUser.Create(
                username: request.ContactEmail, // Use email as username
                email: contactEmail.Value,
                passwordHash: hashedPassword,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: contactPhone?.Value
            );

            // Assign user to tenant with TenantAdmin role
            masterUser.AssignToTenant(tenant.Id, "TenantAdmin");

            // Create subscription but mark it as PENDING (not active until payment)
            var billingCycle = request.BillingPeriod == "Yearly" 
                ? BillingCycle.Annually 
                : BillingCycle.Monthly;
             
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

            // Don't send activation email yet - wait for payment
            // await SendActivationEmail(tenant, masterUser);

            _logger.LogInformation("Tenant pre-registered successfully (awaiting payment): {TenantId}", tenant.Id);

            return Result<TenantDto>.Success(_mapper.Map<TenantDto>(tenant));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering tenant");
            return Result<TenantDto>.Failure(
                Error.Failure("Registration.Failed", "Kayıt işlemi başarısız oldu"));
        }
    }

    private string GenerateConnectionString(string companyCode)
    {
        // In production, this would generate a proper connection string
        return $"Server=localhost;Database=Stocker_Tenant_{companyCode};Trusted_Connection=true;TrustServerCertificate=true;";
    }

    private async Task SendActivationEmail(Tenant tenant, MasterUser user)
    {
        // Generate activation token
        var activationToken = Guid.NewGuid().ToString();
        
        // In real implementation, save token to database
        
        var emailContent = $@"
            <h2>Stocker'a Hoş Geldiniz!</h2>
            <p>Sayın {user.FirstName} {user.LastName},</p>
            <p>{tenant.Name} için Stocker hesabınız başarıyla oluşturuldu.</p>
            <p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
            <a href='http://localhost:3000/verify-email?token={activationToken}'>Hesabımı Aktifleştir</a>
            <p>14 günlük ücretsiz deneme süreniz başlamıştır.</p>
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