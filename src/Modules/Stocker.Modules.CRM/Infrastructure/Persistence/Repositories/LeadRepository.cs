using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Domain.Specifications;
using Stocker.Persistence.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Lead aggregate
/// </summary>
public class LeadRepository : GenericRepository<Lead, CRMDbContext>, ILeadRepository
{
    public LeadRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Lead>> GetByStatusAsync(LeadStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.Status == status && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetByAssigneeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.AssignedToId == userId && !l.IsDeleted)
            .OrderByDescending(l => l.Priority)
            .ThenBy(l => l.NextFollowUpDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetHotLeadsAsync(CancellationToken cancellationToken = default)
    {
        var specification = new HotLeadsSpecification();
        return await FindAsync(specification, cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetLeadsRequiringFollowUpAsync(DateTime asOfDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => !l.IsDeleted)
            .Where(l => l.Status == LeadStatus.InProgress || l.Status == LeadStatus.Qualified)
            .Where(l => l.NextFollowUpDate.HasValue && l.NextFollowUpDate.Value <= asOfDate)
            .OrderBy(l => l.NextFollowUpDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetUnassignedLeadsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => !l.IsDeleted)
            .Where(l => !l.AssignedToId.HasValue)
            .Where(l => l.Status == LeadStatus.New || l.Status == LeadStatus.Contacted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetQualifiedLeadsAsync(CancellationToken cancellationToken = default)
    {
        var specification = new QualifiedLeadsSpecification();
        return await FindAsync(specification, cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetLeadsBySourceAsync(string source, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.Source == source && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetLeadsByCampaignAsync(string campaign, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.Campaign == campaign && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Lead?> GetWithActivitiesAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt))
            .Include(l => l.Contacts.Where(c => !c.IsDeleted))
            .FirstOrDefaultAsync(l => l.Id == leadId && !l.IsDeleted, cancellationToken);
    }

    public async Task<Lead?> GetWithFullDetailsAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Contacts.Where(c => !c.IsDeleted))
            .Include(l => l.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt))
            .Include(l => l.Notes.Where(n => !n.IsDeleted).OrderByDescending(n => n.CreatedAt))
            .FirstOrDefaultAsync(l => l.Id == leadId && !l.IsDeleted, cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(l => l.EmailAddress != null && l.EmailAddress.Value == email && !l.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<Lead>();

        var lowerSearchTerm = searchTerm.ToLower();

        return await DbSet
            .Where(l => !l.IsDeleted && (
                l.CompanyName.ToLower().Contains(lowerSearchTerm) ||
                (l.ContactFirstName != null && l.ContactFirstName.ToLower().Contains(lowerSearchTerm)) ||
                (l.ContactLastName != null && l.ContactLastName.ToLower().Contains(lowerSearchTerm)) ||
                (l.EmailAddress != null && l.EmailAddress.Value.ToLower().Contains(lowerSearchTerm)) ||
                (l.PhoneNumber != null && l.PhoneNumber.Number.Contains(searchTerm))
            ))
            .OrderByDescending(l => l.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<LeadStatistics> GetStatisticsAsync(Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(l => !l.IsDeleted);
        
        if (userId.HasValue)
        {
            query = query.Where(l => l.AssignedToId == userId.Value);
        }

        var leads = await query.ToListAsync(cancellationToken);

        return new LeadStatistics
        {
            TotalLeads = leads.Count,
            NewLeads = leads.Count(l => l.Status == LeadStatus.New),
            InProgressLeads = leads.Count(l => l.Status == LeadStatus.Contacted),
            QualifiedLeads = leads.Count(l => l.Status == LeadStatus.Qualified),
            ConvertedLeads = leads.Count(l => l.Status == LeadStatus.Converted),
            DisqualifiedLeads = leads.Count(l => l.Status == LeadStatus.Disqualified),
            HotLeads = leads.Count(l => l.Priority == Priority.Critical || l.Priority == Priority.High),
            OverdueLeads = leads.Count(l => l.NextFollowUpDate.HasValue && l.NextFollowUpDate.Value < DateTime.UtcNow),
            ConversionRate = leads.Count > 0 
                ? (decimal)leads.Count(l => l.Status == LeadStatus.Converted) / leads.Count * 100 
                : 0,
            AverageScore = leads.Any(l => l.Score != null) 
                ? (int)leads.Where(l => l.Score != null).Average(l => l.Score!.Value) 
                : 0
        };
    }

    public async Task<IReadOnlyList<Lead>> GetStaleLeadsAsync(int daysWithoutContact, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysWithoutContact);
        
        return await DbSet
            .Where(l => !l.IsDeleted)
            .Where(l => l.Status == LeadStatus.New || l.Status == LeadStatus.Contacted || l.Status == LeadStatus.Qualified)
            .Where(l => !l.LastContactDate.HasValue || l.LastContactDate.Value <= cutoffDate)
            .OrderBy(l => l.LastContactDate ?? l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetBySourceAsync(string source, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.Source == source && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Lead>> GetByCampaignAsync(string campaign, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.Campaign == campaign && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<LeadConversionStatistics> GetConversionStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(l => !l.IsDeleted);

        if (fromDate.HasValue)
            query = query.Where(l => l.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(l => l.CreatedAt <= toDate.Value);

        var leads = await query.ToListAsync(cancellationToken);

        var totalLeads = leads.Count;
        var convertedLeads = leads.Count(l => l.Status == LeadStatus.Converted);
        var qualifiedLeads = leads.Count(l => l.Status == LeadStatus.Qualified);
        var disqualifiedLeads = leads.Count(l => l.Status == LeadStatus.Disqualified);
        var lostLeads = leads.Count(l => l.Status == LeadStatus.Lost);

        var leadsBySource = leads.GroupBy(l => l.Source ?? "Unknown")
                                 .ToDictionary(g => g.Key, g => g.Count());

        var leadsByStatus = leads.GroupBy(l => l.Status)
                                .ToDictionary(g => g.Key, g => g.Count());

        var conversionDays = leads.Where(l => l.Status == LeadStatus.Converted && l.ConvertedDate.HasValue)
                                 .Select(l => (l.ConvertedDate!.Value - l.CreatedAt).TotalDays)
                                 .ToList();

        return new LeadConversionStatistics
        {
            TotalLeads = totalLeads,
            ConvertedLeads = convertedLeads,
            QualifiedLeads = qualifiedLeads,
            DisqualifiedLeads = disqualifiedLeads,
            LostLeads = lostLeads,
            ConversionRate = totalLeads > 0 ? (decimal)convertedLeads / totalLeads * 100 : 0,
            QualificationRate = totalLeads > 0 ? (decimal)qualifiedLeads / totalLeads * 100 : 0,
            AverageConversionDays = conversionDays.Any() ? conversionDays.Average() : 0,
            LeadsBySource = leadsBySource,
            LeadsByStatus = leadsByStatus
        };
    }

    public async Task<IReadOnlyList<Lead>> GetLeadsReadyForConversionAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => !l.IsDeleted)
            .Where(l => l.Status == LeadStatus.Qualified)
            .Where(l => l.IsQualified)
            .Where(l => l.HasBudget && l.HasAuthority && l.HasNeed && l.HasTimeline)
            .OrderByDescending(l => l.Score != null ? l.Score.Value : 0)
            .ThenBy(l => l.ExpectedCloseDate ?? DateTime.MaxValue)
            .ToListAsync(cancellationToken);
    }
}

/// <summary>
/// Lead statistics data
/// </summary>
public record LeadStatistics
{
    public int TotalLeads { get; init; }
    public int NewLeads { get; init; }
    public int InProgressLeads { get; init; }
    public int QualifiedLeads { get; init; }
    public int ConvertedLeads { get; init; }
    public int DisqualifiedLeads { get; init; }
    public int HotLeads { get; init; }
    public int OverdueLeads { get; init; }
    public decimal ConversionRate { get; init; }
    public int AverageScore { get; init; }
}