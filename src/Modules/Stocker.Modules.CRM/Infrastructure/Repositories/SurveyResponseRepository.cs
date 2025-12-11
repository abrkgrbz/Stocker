using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class SurveyResponseRepository : ISurveyResponseRepository
{
    private readonly CRMDbContext _context;

    public SurveyResponseRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<SurveyResponse>> GetAllAsync(
        Guid? customerId = null,
        SurveyType? surveyType = null,
        SurveyResponseStatus? status = null,
        NpsCategory? npsCategory = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SurveyResponses.Include(s => s.Answers).AsQueryable();

        if (customerId.HasValue)
            query = query.Where(s => s.CustomerId == customerId.Value);
        if (surveyType.HasValue)
            query = query.Where(s => s.SurveyType == surveyType.Value);
        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);
        if (npsCategory.HasValue)
            query = query.Where(s => s.NpsCategory == npsCategory.Value);

        return await query
            .OrderByDescending(s => s.CompletedDate ?? s.SentDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SurveyResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SurveyResponses
            .Include(s => s.Answers)
            .Include(s => s.Customer)
            .Include(s => s.Contact)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SurveyResponse>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.SurveyResponses
            .Include(s => s.Answers)
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.CompletedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SurveyResponse>> GetFollowUpRequiredAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SurveyResponses
            .Where(s => s.FollowUpRequired && !s.FollowUpDone)
            .OrderBy(s => s.CompletedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<SurveyResponse>> GetDetractorsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SurveyResponses
            .Where(s => s.NpsCategory == NpsCategory.Detractor && s.Status == SurveyResponseStatus.Completed)
            .OrderByDescending(s => s.CompletedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        SurveyType? surveyType = null,
        SurveyResponseStatus? status = null,
        NpsCategory? npsCategory = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SurveyResponses.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(s => s.CustomerId == customerId.Value);
        if (surveyType.HasValue)
            query = query.Where(s => s.SurveyType == surveyType.Value);
        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);
        if (npsCategory.HasValue)
            query = query.Where(s => s.NpsCategory == npsCategory.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<SurveyResponse> CreateAsync(SurveyResponse surveyResponse, CancellationToken cancellationToken = default)
    {
        _context.SurveyResponses.Add(surveyResponse);
        await _context.SaveChangesAsync(cancellationToken);
        return surveyResponse;
    }

    public async System.Threading.Tasks.Task UpdateAsync(SurveyResponse surveyResponse, CancellationToken cancellationToken = default)
    {
        _context.SurveyResponses.Update(surveyResponse);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await GetByIdAsync(id, cancellationToken);
        if (response != null)
        {
            _context.SurveyResponses.Remove(response);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
