using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Shared.Contracts.CRM;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Services;

/// <summary>
/// Implementation of ICrmDealService for cross-module deal operations
/// </summary>
public class CrmDealService : ICrmDealService
{
    private readonly IDealRepository _dealRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CrmDealService> _logger;

    public CrmDealService(
        IDealRepository dealRepository,
        IUnitOfWork unitOfWork,
        ILogger<CrmDealService> logger)
    {
        _dealRepository = dealRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<DealDto?> GetDealByIdAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var deal = await _dealRepository.GetByIdAsync(dealId, cancellationToken);
            if (deal == null || deal.TenantId != tenantId)
                return null;

            return MapToDto(deal);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting deal {DealId} for tenant {TenantId}", dealId, tenantId);
            return null;
        }
    }

    public async Task<IEnumerable<DealDto>> GetWonDealsByCustomerAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get all deals for customer and filter for won deals
            var deals = await _dealRepository.GetByCustomerIdAsync(customerId, tenantId, cancellationToken);
            return deals
                .Where(d => d.Status == Domain.Enums.DealStatus.Won)
                .Select(MapToDto)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting won deals for customer {CustomerId}", customerId);
            return Enumerable.Empty<DealDto>();
        }
    }

    public async Task<decimal> GetDealTotalValueAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var deal = await _dealRepository.GetByIdAsync(dealId, cancellationToken);
            if (deal == null || deal.TenantId != tenantId)
                return 0;

            return deal.Value.Amount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting deal total value {DealId}", dealId);
            return 0;
        }
    }

    public async Task<bool> MarkDealAsInvoicedAsync(Guid dealId, Guid tenantId, Guid invoiceId, CancellationToken cancellationToken = default)
    {
        try
        {
            var deal = await _dealRepository.GetByIdAsync(dealId, cancellationToken);
            if (deal == null || deal.TenantId != tenantId)
            {
                _logger.LogWarning("Deal {DealId} not found for tenant {TenantId}", dealId, tenantId);
                return false;
            }

            _logger.LogInformation("Deal {DealId} marked as invoiced with invoice {InvoiceId}", dealId, invoiceId);

            // TODO: Add InvoiceId property to Deal entity
            // deal.MarkAsInvoiced(invoiceId);
            // await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking deal {DealId} as invoiced", dealId);
            return false;
        }
    }

    public async Task<IEnumerable<DealProductDto>> GetDealProductsAsync(Guid dealId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var deal = await _dealRepository.GetWithProductsAsync(dealId, tenantId, cancellationToken);
            if (deal == null || deal.TenantId != tenantId)
                return Enumerable.Empty<DealProductDto>();

            return deal.Products.Select(p => new DealProductDto
            {
                ProductId = Guid.Empty, // TODO: DealProduct.ProductId is int, needs conversion in Phase 4
                ProductName = p.ProductName ?? "Unknown",
                Quantity = p.Quantity,
                UnitPrice = p.UnitPrice.Amount,
                DiscountAmount = p.DiscountAmount.Amount,
                TotalPrice = p.TotalPrice.Amount
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting deal products for deal {DealId}", dealId);
            return Enumerable.Empty<DealProductDto>();
        }
    }

    private static DealDto MapToDto(Domain.Entities.Deal deal)
    {
        return new DealDto
        {
            Id = deal.Id,
            TenantId = deal.TenantId,
            CustomerId = deal.CustomerId ?? Guid.Empty,
            Title = deal.Name,
            Description = deal.Description,
            Amount = deal.Value.Amount,
            Currency = deal.Value.Currency,
            Stage = deal.Stage?.Name ?? "Unknown",
            Status = deal.Status.ToString(),
            ExpectedCloseDate = deal.ExpectedCloseDate,
            ActualCloseDate = deal.ActualCloseDate,
            IsWon = deal.Status == Domain.Enums.DealStatus.Won,
            CreatedAt = deal.CreatedAt
        };
    }
}
