using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Commands.VerifyEmail;

public sealed class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Result<bool>>
{
    private readonly MasterDbContext _context;
    private readonly ILogger<VerifyEmailCommandHandler> _logger;
    private readonly IMediator _mediator;
    private readonly IBackgroundJobService _backgroundJobService;

    public VerifyEmailCommandHandler(
        MasterDbContext context,
        ILogger<VerifyEmailCommandHandler> logger,
        IMediator mediator,
        IBackgroundJobService backgroundJobService)
    {
        _context = context;
        _logger = logger;
        _mediator = mediator;
        _backgroundJobService = backgroundJobService;
    }

    public async Task<Result<bool>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Find registration by email and token
            var registration = await _context.TenantRegistrations
                .FirstOrDefaultAsync(r => 
                    r.ContactEmail.Value == request.Email && 
                    r.EmailVerificationToken == request.Token, 
                    cancellationToken);

            if (registration == null)
            {
                return Result<bool>.Failure(Error.NotFound("Registration.NotFound", "Kayıt bulunamadı veya doğrulama kodu geçersiz."));
            }

            if (registration.EmailVerified)
            {
                return Result<bool>.Failure(Error.Validation("Email.AlreadyVerified", "E-posta adresi zaten doğrulanmış."));
            }

            // Verify email
            registration.VerifyEmail(request.Token);

            // Auto-approve if pending
            if (registration.Status == RegistrationStatus.Pending)
            {
                // Approve registration first
                registration.Approve("System-AutoApproval", Guid.NewGuid());
                
                _logger.LogInformation("Email verified and registration approved for: {CompanyCode}", 
                    registration.CompanyCode);
            }

            // Save all changes
            await _context.SaveChangesAsync(cancellationToken);

            // TODO: Trigger tenant creation in a separate process after approval
            // TODO: Send welcome email

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email");
            return Result<bool>.Failure(Error.Failure("Verification.Failed", $"E-posta doğrulama işlemi başarısız: {ex.Message}"));
        }
    }
}