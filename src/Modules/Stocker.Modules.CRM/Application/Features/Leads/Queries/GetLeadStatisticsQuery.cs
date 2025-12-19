using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Leads.Queries;

public class GetLeadStatisticsQuery : IRequest<LeadStatisticsDto>
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetLeadStatisticsQueryHandler : IRequestHandler<GetLeadStatisticsQuery, LeadStatisticsDto>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetLeadStatisticsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<LeadStatisticsDto> Handle(GetLeadStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Domain.Entities.Lead>().AsQueryable()
            .Where(l => l.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(l => l.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(l => l.CreatedAt <= request.ToDate.Value);

        var leads = await query.ToListAsync(cancellationToken);

        var totalLeads = leads.Count;
        var newLeads = leads.Count(l => l.Status == LeadStatus.New);
        var qualifiedLeads = leads.Count(l => l.Status == LeadStatus.Qualified);
        var convertedLeads = leads.Count(l => l.Status == LeadStatus.Converted);
        var disqualifiedLeads = leads.Count(l => l.Status == LeadStatus.Unqualified);

        var conversionRate = totalLeads > 0 ? (decimal)convertedLeads / totalLeads * 100 : 0;
        var qualificationRate = totalLeads > 0 ? (decimal)qualifiedLeads / totalLeads * 100 : 0;

        var leadsByStatus = leads
            .GroupBy(l => l.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        var leadsByRating = leads
            .GroupBy(l => l.Rating)
            .ToDictionary(g => g.Key, g => g.Count());

        var leadsBySource = leads
            .Where(l => !string.IsNullOrEmpty(l.Source))
            .GroupBy(l => l.Source!)
            .ToDictionary(g => g.Key, g => g.Count());

        // Monthly leads for the last 12 months
        var monthlyLeads = leads
            .Where(l => l.CreatedAt >= DateTime.UtcNow.AddMonths(-12))
            .GroupBy(l => new { l.CreatedAt.Year, l.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyLeadDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:00}",
                NewLeads = g.Count(l => l.Status == LeadStatus.New),
                QualifiedLeads = g.Count(l => l.Status == LeadStatus.Qualified),
                ConvertedLeads = g.Count(l => l.Status == LeadStatus.Converted)
            })
            .ToList();

        return new LeadStatisticsDto
        {
            TotalLeads = totalLeads,
            NewLeads = newLeads,
            QualifiedLeads = qualifiedLeads,
            ConvertedLeads = convertedLeads,
            DisqualifiedLeads = disqualifiedLeads,
            ConversionRate = Math.Round(conversionRate, 2),
            QualificationRate = Math.Round(qualificationRate, 2),
            LeadsByStatus = leadsByStatus,
            LeadsByRating = leadsByRating,
            LeadsBySource = leadsBySource,
            MonthlyLeads = monthlyLeads
        };
    }
}
