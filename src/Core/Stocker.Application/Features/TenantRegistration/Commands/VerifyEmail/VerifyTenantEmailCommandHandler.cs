using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Extensions;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.VerifyEmail;

public sealed class VerifyTenantEmailCommandHandler : IRequestHandler<VerifyTenantEmailCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<VerifyTenantEmailCommandHandler> _logger;
    private readonly IMediator _mediator;
    private readonly IBackgroundJobService _backgroundJobService;

    public VerifyTenantEmailCommandHandler(
        IMasterDbContext context,
        ILogger<VerifyTenantEmailCommandHandler> logger,
        IMediator mediator,
        IBackgroundJobService backgroundJobService)
    {
        _context = context;
        _logger = logger;
        _mediator = mediator;
        _backgroundJobService = backgroundJobService;
    }

    public async Task<Result<bool>> Handle(VerifyTenantEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Find registration by email and token
            // Fetch candidates first, then filter by Value Object in memory
            var candidates = await _context.TenantRegistrations
                .Where(r => r.EmailVerificationToken == request.Token || r.EmailVerificationCode == request.Token)
                .ToListAsync(cancellationToken);
            
            var matchingRegistration = candidates
                .FirstOrDefault(r => r.ContactEmail.Value == request.Email);
            
            // If found in memory list, get the tracked entity from context
            if (matchingRegistration != null)
            {
                // Re-fetch the entity to ensure it's tracked
                matchingRegistration = await _context.TenantRegistrations
                    .FirstOrDefaultAsync(r => r.Id == matchingRegistration.Id, cancellationToken);
            }

            if (matchingRegistration == null)
            {
                return Result<bool>.Failure(Error.NotFound("Registration.NotFound", "Kayıt bulunamadı veya doğrulama kodu geçersiz."));
            }

            if (matchingRegistration.EmailVerified)
            {
                return Result<bool>.Failure(Error.Validation("Email.AlreadyVerified", "E-posta adresi zaten doğrulanmış."));
            }

            // Verify email
            matchingRegistration.VerifyEmail(request.Token);
            
            _logger.LogInformation("Email verified successfully for: {Email}, Company: {CompanyCode}", 
                matchingRegistration.ContactEmail.Value, 
                matchingRegistration.CompanyCode);

            // Save email verification first
            await _context.SaveChangesAsync(cancellationToken);
            
            // Enqueue tenant provisioning job (async) - don't block user
            if (matchingRegistration.Status == RegistrationStatus.Pending)
            {
                // Enqueue background job for tenant creation
                // This will create tenant, database, run migrations, and seed data
                var jobId = _backgroundJobService.Enqueue<IMediator>(mediator => 
                    mediator.Send(new CreateTenantFromRegistrationCommand(matchingRegistration.Id), CancellationToken.None));
                
                _logger.LogInformation(
                    "Tenant provisioning job enqueued with ID {JobId} for registration: {RegistrationId}, Company: {CompanyCode}", 
                    jobId, 
                    matchingRegistration.Id,
                    matchingRegistration.CompanyCode);
                
                // Note: Tenant will be created asynchronously by Hangfire (typically 10-30 seconds)
                // Frontend should show "Account is being prepared..." message
                // User can try to login after a few seconds, or we can add polling/notification
            }

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email");
            return Result<bool>.Failure(Error.Failure("Verification.Failed", $"E-posta doğrulama işlemi başarısız: {ex.Message}"));
        }
    }
}