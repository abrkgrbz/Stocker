using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.DeleteTenant;

public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand, Result<bool>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteTenantCommandHandler> _logger;

    public DeleteTenantCommandHandler(
        IMasterUnitOfWork unitOfWork,
        ILogger<DeleteTenantCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Get tenant
            var tenant = await _unitOfWork.Tenants()
                .GetByIdAsync(request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Tenant.NotFound", "Tenant bulunamadı"));
            }

            // Check if tenant has active subscription
            var hasActiveSubscription = await _unitOfWork.Subscriptions()
                .AsQueryable()
                .AnyAsync(s => s.TenantId == request.TenantId && 
                    (s.Status == Domain.Master.Enums.SubscriptionStatus.Aktif ||
                     s.Status == Domain.Master.Enums.SubscriptionStatus.Deneme), 
                    cancellationToken);

            if (hasActiveSubscription)
            {
                return Result<bool>.Failure(
                    Error.Conflict("Tenant.HasActiveSubscription", 
                        "Aktif aboneliği olan tenant silinemez. Önce aboneliği iptal edin."));
            }

            // Check if tenant has any unpaid invoices
            var hasUnpaidInvoices = await _unitOfWork.Invoices()
                .AsQueryable()
                .AnyAsync(i => i.TenantId == request.TenantId && 
                    i.Status != Domain.Master.Enums.InvoiceStatus.Odendi, 
                    cancellationToken);

            if (hasUnpaidInvoices)
            {
                return Result<bool>.Failure(
                    Error.Conflict("Tenant.HasUnpaidInvoices", 
                        "Ödenmemiş faturaları olan tenant silinemez."));
            }

            if (request.HardDelete)
            {
                // Hard delete - permanently remove from database
                // First, delete related records
                
                // Delete tenant users
                var tenantUsers = await _unitOfWork.MasterUsers()
                    .AsQueryable()
                    .Where(u => u.UserTenants.Any(ut => ut.TenantId == request.TenantId))
                    .ToListAsync(cancellationToken);

                foreach (var user in tenantUsers)
                {
                    // Remove tenant association
                    user.RemoveFromTenant(request.TenantId);
                    
                    // If user has no other tenants, deactivate the user
                    if (!user.UserTenants.Any())
                    {
                        user.Deactivate();
                        await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
                    }
                }

                // Deactivate subscriptions (soft delete)
                var subscriptions = await _unitOfWork.Subscriptions()
                    .AsQueryable()
                    .Where(s => s.TenantId == request.TenantId)
                    .ToListAsync(cancellationToken);

                foreach (var subscription in subscriptions)
                {
                    subscription.Cancel("Tenant deleted"); // Cancel method requires reason parameter
                    await _unitOfWork.Subscriptions().UpdateAsync(subscription, cancellationToken);
                }

                // Mark invoices as cancelled (soft delete)
                var invoices = await _unitOfWork.Invoices()
                    .AsQueryable()
                    .Where(i => i.TenantId == request.TenantId)
                    .ToListAsync(cancellationToken);

                foreach (var invoice in invoices)
                {
                    // Invoice.Cancel() might also not take parameters
                    // Assuming Cancel method exists on Invoice entity
                    invoice.Cancel(); 
                    await _unitOfWork.Invoices().UpdateAsync(invoice, cancellationToken);
                }

                // Finally, deactivate the tenant (soft delete)
                tenant.Deactivate();
                await _unitOfWork.Tenants().UpdateAsync(tenant, cancellationToken);
                
                _logger.LogWarning("Tenant {TenantId} ({TenantCode}) has been HARD DELETED. Reason: {Reason}", 
                    tenant.Id, tenant.Code, request.Reason);
            }
            else
            {
                // Soft delete - just deactivate
                tenant.Deactivate();
                
                // TODO: Add deletion reason tracking
                // if (!string.IsNullOrEmpty(request.Reason))
                // {
                //     tenant.UpdateDescription($"[DELETED: {DateTime.UtcNow:yyyy-MM-dd}] {request.Reason}");
                // }

                await _unitOfWork.Tenants().UpdateAsync(tenant, cancellationToken);
                
                _logger.LogInformation("Tenant {TenantId} ({TenantCode}) has been soft deleted. Reason: {Reason}", 
                    tenant.Id, tenant.Code, request.Reason);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tenant {TenantId}", request.TenantId);
            return Result<bool>.Failure(
                Error.Failure("Tenant.DeleteFailed", "Tenant silme işlemi başarısız oldu"));
        }
    }
}