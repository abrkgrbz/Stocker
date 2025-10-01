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
            
            // Auto-approve and create tenant after email verification
            if (matchingRegistration.Status == RegistrationStatus.Pending)
            {
                // Create tenant first to get the TenantId
                var createTenantResult = await _mediator.Send(
                    new CreateTenantFromRegistrationCommand(matchingRegistration.Id), 
                    cancellationToken);
                
                if (createTenantResult.IsSuccess && createTenantResult.Value?.Id != null)
                {
                    // Now approve with the real TenantId
                    matchingRegistration.Approve("System-AutoApproval-EmailVerified", createTenantResult.Value.Id);
                    await _context.SaveChangesAsync(cancellationToken);
                    
                    _logger.LogInformation(
                        "Registration approved and tenant created for: {CompanyCode}, TenantId: {TenantId}", 
                        matchingRegistration.CompanyCode, 
                        createTenantResult.Value.Id);
                }
                else
                {
                    _logger.LogError(
                        "Failed to create tenant for registration: {RegistrationId}, Error: {Error}", 
                        matchingRegistration.Id, 
                        createTenantResult.Error?.Description);
                    
                    return Result<bool>.Failure(
                        Error.Failure("TenantCreation.Failed", 
                            $"E-posta doğrulandı ancak tenant oluşturulamadı: {createTenantResult.Error?.Description}"));
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