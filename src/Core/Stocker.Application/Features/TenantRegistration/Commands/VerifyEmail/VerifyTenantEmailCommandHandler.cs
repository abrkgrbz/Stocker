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

            // Auto-approve if pending
            if (matchingRegistration.Status == RegistrationStatus.Pending)
            {
                // Approve registration first
                matchingRegistration.Approve("System-AutoApproval", Guid.NewGuid());
                
                _logger.LogInformation("Email verified and registration approved for: {CompanyCode}", 
                    matchingRegistration.CompanyCode);
            }

            // Save all changes
            await _context.SaveChangesAsync(cancellationToken);

            // If approved, create the tenant
            if (matchingRegistration.Status == RegistrationStatus.Approved)
            {
                try
                {
                    // Create tenant directly through MediatR - Hangfire will handle the background processing
                    var jobId = _backgroundJobService.Enqueue<IMediator>(mediator => 
                        mediator.Send(new CreateTenantFromRegistrationCommand(matchingRegistration.Id), CancellationToken.None));
                    
                    _logger.LogInformation("Tenant creation job enqueued with ID {JobId} for registration: {RegistrationId}", 
                        jobId, matchingRegistration.Id);
                }
                catch (Exception jobEx)
                {
                    _logger.LogError(jobEx, "Failed to enqueue tenant creation job for registration: {RegistrationId}", matchingRegistration.Id);
                    // Don't fail the verification if job enqueue fails
                }
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