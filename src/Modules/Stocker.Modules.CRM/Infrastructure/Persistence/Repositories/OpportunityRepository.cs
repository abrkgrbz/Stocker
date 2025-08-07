using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Domain.Specifications;
using Stocker.Persistence.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Opportunity aggregate
/// </summary>
public class OpportunityRepository : GenericRepository<Opportunity, CRMDbContext>, IOpportunityRepository
{
    public OpportunityRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Opportunity>> GetByStageAsync(OpportunityStage stage, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(o => o.Stage == stage && !o.IsDeleted)
            .Include(o => o.Customer)
            .OrderByDescending(o => o.Amount != null ? o.Amount.Value : 0)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetByCustomerAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .Include(o => o.PrimaryContact)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(o => o.OwnerId == ownerId && !o.IsDeleted)
            .Include(o => o.Customer)
            .OrderBy(o => o.CloseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetOpenOpportunitiesAsync(CancellationToken cancellationToken = default)
    {
        var specification = new OpenOpportunitiesSpecification();
        return await FindAsync(specification, cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetClosingThisMonthAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

        var specification = new ClosingInPeriodSpecification(startOfMonth, endOfMonth);
        return await FindAsync(specification.ToExpression(), cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetClosingInPeriodAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var specification = new ClosingInPeriodSpecification(startDate, endDate);
        return await FindAsync(specification.ToExpression(), cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetOverdueOpportunitiesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(o => !o.IsDeleted)
            .Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
            .Where(o => o.CloseDate < DateTime.UtcNow)
            .Include(o => o.Customer)
            .OrderBy(o => o.CloseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetHighValueOpportunitiesAsync(decimal minAmount, CancellationToken cancellationToken = default)
    {
        var specification = new HighValueOpportunitiesSpecification(minAmount);
        return await FindAsync(specification, cancellationToken);
    }

    public async Task<Opportunity?> GetWithProductsAsync(Guid opportunityId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Products.Where(p => !p.IsDeleted))
            .Include(o => o.Customer)
            .Include(o => o.PrimaryContact)
            .FirstOrDefaultAsync(o => o.Id == opportunityId && !o.IsDeleted, cancellationToken);
    }

    public async Task<Opportunity?> GetWithFullDetailsAsync(Guid opportunityId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Customer)
                .ThenInclude(c => c.Contacts.Where(ct => !ct.IsDeleted))
            .Include(o => o.PrimaryContact)
            .Include(o => o.Products.Where(p => !p.IsDeleted))
            .Include(o => o.Competitors)
            .Include(o => o.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt))
            .Include(o => o.Notes.Where(n => !n.IsDeleted).OrderByDescending(n => n.CreatedAt))
            .FirstOrDefaultAsync(o => o.Id == opportunityId && !o.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<Opportunity>();

        var lowerSearchTerm = searchTerm.ToLower();

        return await DbSet
            .Include(o => o.Customer)
            .Where(o => !o.IsDeleted && (
                o.Name.ToLower().Contains(lowerSearchTerm) ||
                (o.Description != null && o.Description.ToLower().Contains(lowerSearchTerm)) ||
                o.Customer.CompanyName.ToLower().Contains(lowerSearchTerm)
            ))
            .OrderByDescending(o => o.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetPipelineValueAsync(OpportunityStage? stage = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(o => !o.IsDeleted);

        if (stage.HasValue)
        {
            query = query.Where(o => o.Stage == stage.Value);
        }
        else
        {
            query = query.Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost);
        }

        var opportunities = await query.ToListAsync(cancellationToken);
        return opportunities.Sum(o => o.Amount?.Value ?? 0);
    }

    public async Task<decimal> GetWeightedPipelineValueAsync(CancellationToken cancellationToken = default)
    {
        var opportunities = await DbSet
            .Where(o => !o.IsDeleted)
            .Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost)
            .ToListAsync(cancellationToken);

        return opportunities.Sum(o => o.WeightedAmount);
    }

    public async Task<OpportunityStatistics> GetStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null, Guid? ownerId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(o => !o.IsDeleted);

        if (startDate.HasValue)
            query = query.Where(o => o.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(o => o.CreatedAt <= endDate.Value);

        if (ownerId.HasValue)
            query = query.Where(o => o.OwnerId == ownerId.Value);

        var opportunities = await query.ToListAsync(cancellationToken);

        var totalOpportunities = opportunities.Count;
        var wonOpportunities = opportunities.Count(o => o.Stage == OpportunityStage.ClosedWon);
        var lostOpportunities = opportunities.Count(o => o.Stage == OpportunityStage.ClosedLost);
        var openOpportunities = opportunities.Count(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost);

        return new OpportunityStatistics
        {
            TotalOpportunities = totalOpportunities,
            OpenOpportunities = openOpportunities,
            WonOpportunities = wonOpportunities,
            LostOpportunities = lostOpportunities,
            TotalValue = opportunities.Sum(o => o.Amount?.Value ?? 0),
            WonValue = opportunities.Where(o => o.Stage == OpportunityStage.ClosedWon).Sum(o => o.Amount?.Value ?? 0),
            LostValue = opportunities.Where(o => o.Stage == OpportunityStage.ClosedLost).Sum(o => o.Amount?.Value ?? 0),
            PipelineValue = opportunities.Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost).Sum(o => o.Amount?.Value ?? 0),
            WeightedPipelineValue = opportunities.Where(o => o.Stage != OpportunityStage.ClosedWon && o.Stage != OpportunityStage.ClosedLost).Sum(o => o.WeightedAmount),
            WinRate = (totalOpportunities - openOpportunities) > 0 
                ? (decimal)wonOpportunities / (wonOpportunities + lostOpportunities) * 100 
                : 0,
            AverageOpportunityValue = totalOpportunities > 0 
                ? opportunities.Average(o => o.Amount?.Value ?? 0) 
                : 0,
            AverageSalesCycle = opportunities.Where(o => o.Stage == OpportunityStage.ClosedWon && o.ClosedDate.HasValue)
                .Select(o => (o.ClosedDate!.Value - o.CreatedAt).Days)
                .DefaultIfEmpty(0)
                .Average()
        };
    }

    public async Task<IReadOnlyList<Opportunity>> GetWonOpportunitiesAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(o => !o.IsDeleted && o.Stage == OpportunityStage.ClosedWon);

        if (fromDate.HasValue)
            query = query.Where(o => o.ClosedDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.ClosedDate <= toDate.Value);

        return await query
            .Include(o => o.Customer)
            .OrderByDescending(o => o.ClosedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetLostOpportunitiesAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(o => !o.IsDeleted && o.Stage == OpportunityStage.ClosedLost);

        if (fromDate.HasValue)
            query = query.Where(o => o.ClosedDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.ClosedDate <= toDate.Value);

        return await query
            .Include(o => o.Customer)
            .OrderByDescending(o => o.ClosedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetClosingSoonAsync(int daysAhead, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);

        return await DbSet
            .Where(o => !o.IsDeleted && !o.IsClosed)
            .Where(o => o.CloseDate <= cutoffDate)
            .Include(o => o.Customer)
            .Include(o => o.PrimaryContact)
            .OrderBy(o => o.CloseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Opportunity>> GetRequiringAttentionAsync(CancellationToken cancellationToken = default)
    {
        var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

        return await DbSet
            .Where(o => !o.IsDeleted && !o.IsClosed)
            .Where(o => o.CloseDate < DateTime.UtcNow || // Overdue
                       !o.LastActivityDate.HasValue || 
                       o.LastActivityDate.Value < oneWeekAgo) // No activity in a week
            .Include(o => o.Customer)
            .Include(o => o.PrimaryContact)
            .OrderBy(o => o.CloseDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<Opportunity?> GetWithActivitiesAsync(Guid opportunityId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(o => o.Customer)
            .Include(o => o.PrimaryContact)
            .Include(o => o.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt))
            .FirstOrDefaultAsync(o => o.Id == opportunityId && !o.IsDeleted, cancellationToken);
    }

    public async Task<PipelineStatistics> GetPipelineStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(o => !o.IsDeleted);

        if (fromDate.HasValue)
            query = query.Where(o => o.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.CreatedAt <= toDate.Value);

        var opportunities = await query.ToListAsync(cancellationToken);

        var totalOpportunities = opportunities.Count;
        var wonOpportunities = opportunities.Count(o => o.Stage == OpportunityStage.ClosedWon);
        var lostOpportunities = opportunities.Count(o => o.Stage == OpportunityStage.ClosedLost);

        var opportunitiesByStage = opportunities.GroupBy(o => o.Stage)
                                              .ToDictionary(g => g.Key, g => g.Count());

        var valueByStage = opportunities.GroupBy(o => o.Stage)
                                       .ToDictionary(g => g.Key, g => g.Sum(o => o.Amount.Value));

        var closedDeals = opportunities.Where(o => o.IsClosed && o.ClosedDate.HasValue);
        var salesCycles = closedDeals.Select(o => (o.ClosedDate!.Value - o.CreatedAt).Days).ToList();

        return new PipelineStatistics
        {
            TotalOpportunities = totalOpportunities,
            TotalPipelineValue = opportunities.Where(o => !o.IsClosed).Sum(o => o.Amount.Value),
            WeightedPipelineValue = opportunities.Where(o => !o.IsClosed).Sum(o => o.WeightedAmount.Value),
            WonDeals = wonOpportunities,
            WonValue = opportunities.Where(o => o.Stage == OpportunityStage.ClosedWon).Sum(o => o.Amount.Value),
            LostDeals = lostOpportunities,
            LostValue = opportunities.Where(o => o.Stage == OpportunityStage.ClosedLost).Sum(o => o.Amount.Value),
            WinRate = (wonOpportunities + lostOpportunities) > 0 
                ? (decimal)wonOpportunities / (wonOpportunities + lostOpportunities) * 100 
                : 0,
            AverageDealSize = totalOpportunities > 0 
                ? opportunities.Average(o => (double)o.Amount.Value) 
                : 0,
            AverageSalesCycle = salesCycles.Any() ? salesCycles.Average() : 0,
            OpportunitiesByStage = opportunitiesByStage,
            ValueByStage = valueByStage
        };
    }

    public async Task<SalesForecast> GetSalesForecastAsync(int monthsAhead, CancellationToken cancellationToken = default)
    {
        var startDate = DateTime.UtcNow;
        var endDate = startDate.AddMonths(monthsAhead);

        var opportunities = await DbSet
            .Where(o => !o.IsDeleted && !o.IsClosed)
            .Where(o => o.CloseDate >= startDate && o.CloseDate <= endDate)
            .ToListAsync(cancellationToken);

        var bestCase = opportunities.Where(o => o.Probability >= 75).Sum(o => o.Amount.Value);
        var mostLikely = opportunities.Sum(o => o.WeightedAmount.Value);
        var worstCase = opportunities.Where(o => o.Probability >= 25).Sum(o => o.WeightedAmount.Value);

        var forecastByMonth = new Dictionary<string, decimal>();
        var weightedForecastByMonth = new Dictionary<string, decimal>();

        for (int i = 0; i < monthsAhead; i++)
        {
            var monthStart = startDate.AddMonths(i);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);
            var monthKey = monthStart.ToString("yyyy-MM");

            var monthOpportunities = opportunities.Where(o => o.CloseDate >= monthStart && o.CloseDate <= monthEnd);
            
            forecastByMonth[monthKey] = monthOpportunities.Sum(o => o.Amount.Value);
            weightedForecastByMonth[monthKey] = monthOpportunities.Sum(o => o.WeightedAmount.Value);
        }

        return new SalesForecast
        {
            BestCase = bestCase,
            MostLikely = mostLikely,
            WorstCase = worstCase,
            ForecastByMonth = forecastByMonth,
            WeightedForecastByMonth = weightedForecastByMonth
        };
    }
}

/// <summary>
/// Opportunity statistics data
/// </summary>
public record OpportunityStatistics
{
    public int TotalOpportunities { get; init; }
    public int OpenOpportunities { get; init; }
    public int WonOpportunities { get; init; }
    public int LostOpportunities { get; init; }
    public decimal TotalValue { get; init; }
    public decimal WonValue { get; init; }
    public decimal LostValue { get; init; }
    public decimal PipelineValue { get; init; }
    public decimal WeightedPipelineValue { get; init; }
    public decimal WinRate { get; init; }
    public decimal AverageOpportunityValue { get; init; }
    public double AverageSalesCycle { get; init; }
}