using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.Persistence.Migrations;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.ProcessPayment;

public class ProcessPaymentCommandHandler : IRequestHandler<ProcessPaymentCommand, Result<ProcessPaymentResult>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMigrationService _migrationService;
    private readonly ILogger<ProcessPaymentCommandHandler> _logger;

    public ProcessPaymentCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IMigrationService migrationService,
        ILogger<ProcessPaymentCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _migrationService = migrationService;
        _logger = logger;
    }

    public async Task<Result<ProcessPaymentResult>> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get tenant
            var tenant = await _unitOfWork.Tenants()
                .GetByIdAsync(request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<ProcessPaymentResult>.Failure(
                    Error.NotFound("Tenant.NotFound", "Tenant bulunamadı"));
            }

            // Get subscription for the tenant (should be in Suspended status)
            var subscription = await _unitOfWork.Subscriptions()
                .AsQueryable()
                .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, cancellationToken);

            if (subscription == null)
            {
                return Result<ProcessPaymentResult>.Failure(
                    Error.NotFound("Subscription.NotFound", "Abonelik bulunamadı"));
            }

            // Check if already paid
            if (tenant.IsActive)
            {
                return Result<ProcessPaymentResult>.Failure(
                    Error.Validation("Payment.AlreadyProcessed", "Bu tenant için ödeme zaten alınmış"));
            }

            // Simulate payment processing
            var transactionId = request.TransactionId ?? $"TRX{DateTime.UtcNow.Ticks}";
            var invoiceNumber = request.InvoiceNumber ?? $"INV-{DateTime.UtcNow:yyyyMMdd}-{tenant.Code.ToUpper()}";

            // PAYMENT SUCCESSFUL - Now activate everything
            tenant.Activate();
            
            // For suspended subscriptions, we need to use StartTrial first, then Activate
            if (subscription.Status == Domain.Master.Enums.SubscriptionStatus.Suspended)
            {
                // Start trial period from now
                var trialDays = 14; // Default trial period
                subscription.StartTrial(DateTime.UtcNow.AddDays(trialDays));
            }
            subscription.Activate();
            
            // TODO: Create Master Invoice for subscription payment
            // Master Invoice entity has different structure and will be implemented separately
            
            // Trial period will start from payment date
            // The subscription entity will manage its own period

            // Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            // Create and migrate tenant database after successful payment
            _logger.LogInformation("Creating and migrating database for tenant {TenantId}...", request.TenantId);
            await _migrationService.MigrateTenantDatabaseAsync(request.TenantId);
            
            // Seed tenant data (roles, sample invoices, etc.)
            _logger.LogInformation("Seeding initial data for tenant {TenantId}...", request.TenantId);
            await _migrationService.SeedTenantDataAsync(request.TenantId);

            // Send activation email after successful payment
            await SendActivationEmail(tenant);
            
            _logger.LogInformation("Payment processed successfully for tenant {TenantId} - Tenant is now ACTIVE with database created", request.TenantId);

            return Result<ProcessPaymentResult>.Success(new ProcessPaymentResult
            {
                PaymentId = Guid.NewGuid(), // Simulated payment ID
                SubscriptionId = subscription.Id,
                TransactionId = transactionId,
                InvoiceNumber = invoiceNumber,
                Success = true,
                Message = "Ödeme başarıyla işlendi",
                ProcessedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment for tenant {TenantId}", request.TenantId);
            return Result<ProcessPaymentResult>.Failure(
                Error.Failure("Payment.ProcessingFailed", "Ödeme işlemi başarısız oldu"));
        }
    }

    private async Task SendActivationEmail(Domain.Master.Entities.Tenant tenant)
    {
        // For now, just log the activation
        _logger.LogInformation("Tenant {TenantCode} has been activated after successful payment", tenant.Code);
        
        // In production, you would:
        // 1. Get the tenant owner from MasterUsers
        // 2. Send them an activation email
        // 3. Include login credentials and getting started guide
    }
}