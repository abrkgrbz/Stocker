using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Queries;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class GetDealsQueryHandler : IRequestHandler<GetDealsQuery, IEnumerable<DealDto>>
{
    private readonly IDealRepository _dealRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetDealsQueryHandler(
        IDealRepository dealRepository,
        ICurrentUserService currentUserService)
    {
        _dealRepository = dealRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<DealDto>> Handle(GetDealsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;

        // Get all deals for the tenant
        var deals = await _dealRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        // Apply filters
        var query = deals.AsQueryable();

        if (!string.IsNullOrEmpty(request.Search))
        {
            query = query.Where(d => d.Name.Contains(request.Search, StringComparison.OrdinalIgnoreCase));
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

        // Map to DTOs
        var dealDtos = query.Select(deal => new DealDto
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
            CurrentStageId = deal.StageId,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            Probability = deal.Probability,
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        }).ToList();

        return dealDtos;
    }
}