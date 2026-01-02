using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadsQuery : IRequest<PagedResult<LeadDto>>
{
    public string? Search { get; set; }
    public LeadStatus? Status { get; set; }
    public LeadRating? Rating { get; set; }
    public string? Source { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetLeadsQueryHandler : IRequestHandler<GetLeadsQuery, PagedResult<LeadDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetLeadsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<LeadDto>> Handle(GetLeadsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Domain.Entities.Lead>().AsQueryable()
            .Where(l => l.TenantId == tenantId);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(l =>
                l.FirstName.ToLower().Contains(searchLower) ||
                l.LastName.ToLower().Contains(searchLower) ||
                l.Email.ToLower().Contains(searchLower) ||
                (l.CompanyName != null && l.CompanyName.ToLower().Contains(searchLower)));
        }

        if (request.Status.HasValue)
            query = query.Where(l => l.Status == request.Status.Value);

        if (request.Rating.HasValue)
            query = query.Where(l => l.Rating == request.Rating.Value);

        if (!string.IsNullOrWhiteSpace(request.Source))
            query = query.Where(l => l.Source == request.Source);

        if (request.FromDate.HasValue)
            query = query.Where(l => l.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(l => l.CreatedAt <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var leads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = leads.Select(l => new LeadDto
        {
            Id = l.Id,
            CompanyName = l.CompanyName,
            FirstName = l.FirstName,
            LastName = l.LastName,
            FullName = l.FullName,
            Email = l.Email,
            Phone = l.Phone,
            MobilePhone = l.MobilePhone,
            JobTitle = l.JobTitle,
            Industry = l.Industry,
            Source = l.Source,
            Status = l.Status,
            Rating = l.Rating,
            Address = l.Address,
            City = l.City,
            State = l.State,
            Country = l.Country,
            PostalCode = l.PostalCode,
            Website = l.Website,
            AnnualRevenue = l.AnnualRevenue,
            NumberOfEmployees = l.NumberOfEmployees,
            Description = l.Description,
            AssignedToUserId = l.AssignedToUserId,
            ConvertedDate = l.ConvertedDate,
            ConvertedToCustomerId = l.ConvertedToCustomerId,
            IsConverted = l.IsConverted,
            Score = l.Score,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt
        }).ToList();

        return new PagedResult<LeadDto>(items, request.Page, request.PageSize, totalCount);
    }
}
