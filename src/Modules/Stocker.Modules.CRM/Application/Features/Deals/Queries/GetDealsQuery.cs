using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealsQuery : IRequest<IEnumerable<DealDto>>
{
    public string? Search { get; set; }
    public DealStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? PipelineId { get; set; }
    public Guid? StageId { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetDealsQueryHandler : IRequestHandler<GetDealsQuery, IEnumerable<DealDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetDealsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<DealDto>> Handle(GetDealsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var query = _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .Include(d => d.Pipeline)
            .Include(d => d.Stage)
            .Where(d => d.TenantId == tenantId && d.Status != DealStatus.Deleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(d => d.Name.Contains(request.Search) ||
                                      (d.Description != null && d.Description.Contains(request.Search)));
        }

        if (request.Status.HasValue)
            query = query.Where(d => d.Status == request.Status.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(d => d.CustomerId == request.CustomerId.Value);

        if (request.PipelineId.HasValue)
            query = query.Where(d => d.PipelineId == request.PipelineId.Value);

        if (request.StageId.HasValue)
            query = query.Where(d => d.StageId == request.StageId.Value);

        if (request.MinAmount.HasValue)
            query = query.Where(d => d.Value.Amount >= request.MinAmount.Value);

        if (request.MaxAmount.HasValue)
            query = query.Where(d => d.Value.Amount <= request.MaxAmount.Value);

        if (request.FromDate.HasValue)
            query = query.Where(d => d.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(d => d.CreatedAt <= request.ToDate.Value);

        var deals = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return deals.Select(d => new DealDto
        {
            Id = d.Id,
            Title = d.Name,
            Description = d.Description,
            CustomerId = d.CustomerId ?? Guid.Empty,
            Amount = d.Value.Amount,
            Currency = d.Value.Currency,
            Status = d.Status,
            Priority = d.Priority,
            PipelineId = d.PipelineId,
            PipelineName = d.Pipeline?.Name,
            StageId = d.StageId,
            StageName = d.Stage?.Name,
            ExpectedCloseDate = d.ExpectedCloseDate ?? DateTime.UtcNow,
            ActualCloseDate = d.ActualCloseDate,
            Probability = d.Probability,
            LostReason = d.LostReason,
            CompetitorName = d.CompetitorName,
            OwnerId = d.OwnerId.ToString(),
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        });
    }
}
