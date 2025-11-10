using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Queries;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class GetDealsQueryHandler : IRequestHandler<GetDealsQuery, IEnumerable<DealDto>>
{
    private readonly IDealRepository _dealRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetDealsQueryHandler> _logger;

    public GetDealsQueryHandler(
        IDealRepository dealRepository,
        ICurrentUserService currentUserService,
        ILogger<GetDealsQueryHandler> logger)
    {
        _dealRepository = dealRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<IEnumerable<DealDto>> Handle(GetDealsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;

        _logger.LogWarning("========== GetDealsQuery START ==========");
        _logger.LogWarning("GetDealsQuery: TenantId={TenantId}, Page={Page}, PageSize={PageSize}",
            tenantId, request.Page, request.PageSize);

        // Get total count without filters for debugging
        var totalDeals = await _dealRepository.AsQueryable().CountAsync(cancellationToken);
        _logger.LogWarning("Total deals in database (all tenants): {TotalDeals}", totalDeals);

        var dealsForTenant = await _dealRepository.AsQueryable()
            .Where(d => d.TenantId == tenantId)
            .CountAsync(cancellationToken);
        _logger.LogWarning("Total deals for TenantId {TenantId}: {DealsForTenant}", tenantId, dealsForTenant);

        // Start with base query on database - Include navigation properties
        var query = _dealRepository.AsQueryable()
            .Include(d => d.Customer)
            .Include(d => d.Pipeline)
            .Include(d => d.Stage)
            .Where(d => d.TenantId == tenantId);

        // Apply filters at database level
        if (!string.IsNullOrEmpty(request.Search))
        {
            query = query.Where(d => d.Name.Contains(request.Search));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(d => d.Status == request.Status.Value);
        }

        if (request.CustomerId.HasValue)
        {
            query = query.Where(d => d.CustomerId == request.CustomerId.Value);
        }

        if (request.PipelineId.HasValue)
        {
            query = query.Where(d => d.PipelineId == request.PipelineId.Value);
        }

        if (request.StageId.HasValue)
        {
            query = query.Where(d => d.StageId == request.StageId.Value);
        }

        if (request.MinAmount.HasValue)
        {
            query = query.Where(d => d.Value.Amount >= request.MinAmount.Value);
        }

        if (request.MaxAmount.HasValue)
        {
            query = query.Where(d => d.Value.Amount <= request.MaxAmount.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(d => d.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(d => d.CreatedAt <= request.ToDate.Value);
        }

        // Apply sorting - newest deals first
        query = query.OrderByDescending(d => d.CreatedAt);

        // Apply pagination at database level
        var skipCount = (request.Page - 1) * request.PageSize;
        query = query.Skip(skipCount).Take(request.PageSize);

        // Execute query and map to DTOs
        var deals = await query.ToListAsync(cancellationToken);

        _logger.LogWarning("GetDealsQuery: Found {Count} deals AFTER pagination for TenantId={TenantId}",
            deals.Count, tenantId);
        _logger.LogWarning("========== GetDealsQuery END ==========");

        var dealDtos = deals.Select(deal => new DealDto
        {
            Id = deal.Id,
            Title = deal.Name,
            Description = deal.Description,
            CustomerId = deal.CustomerId ?? Guid.Empty,
            CustomerName = deal.Customer?.CompanyName ?? string.Empty,
            Amount = deal.Value.Amount,
            Currency = deal.Value.Currency,
            Status = deal.Status,
            Priority = deal.Priority,
            PipelineId = deal.PipelineId,
            PipelineName = deal.Pipeline?.Name,
            StageId = deal.StageId,
            StageName = deal.Stage?.Name,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            Probability = deal.Probability,
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        }).ToList();

        return dealDtos;
    }
}