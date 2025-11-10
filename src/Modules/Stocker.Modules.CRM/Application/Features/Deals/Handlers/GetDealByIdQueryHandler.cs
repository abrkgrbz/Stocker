using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Queries;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class GetDealByIdQueryHandler : IRequestHandler<GetDealByIdQuery, DealDto?>
{
    private readonly IDealRepository _dealRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetDealByIdQueryHandler> _logger;

    public GetDealByIdQueryHandler(
        IDealRepository dealRepository,
        ICurrentUserService currentUserService,
        ILogger<GetDealByIdQueryHandler> logger)
    {
        _dealRepository = dealRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<DealDto?> Handle(GetDealByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;

        _logger.LogInformation("GetDealByIdQuery: Fetching deal {DealId} for TenantId={TenantId}",
            request.Id, tenantId);

        var deal = await _dealRepository.AsQueryable()
            .Where(d => d.Id == request.Id && d.TenantId == tenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (deal == null)
        {
            _logger.LogWarning("GetDealByIdQuery: Deal {DealId} not found for TenantId={TenantId}",
                request.Id, tenantId);
            return null;
        }

        var dealDto = new DealDto
        {
            Id = deal.Id,
            Title = deal.Name,
            Description = deal.Description,
            CustomerId = deal.CustomerId ?? Guid.Empty,
            Amount = deal.Value.Amount,
            Currency = deal.Value.Currency,
            Status = deal.Status,
            Priority = deal.Priority,
            PipelineId = deal.PipelineId,
            StageId = deal.StageId,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            Probability = deal.Probability,
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };

        _logger.LogInformation("GetDealByIdQuery: Successfully fetched deal {DealId}", request.Id);

        return dealDto;
    }
}
