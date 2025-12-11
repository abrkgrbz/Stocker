using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ISurveyResponseRepository
{
    System.Threading.Tasks.Task<List<SurveyResponse>> GetAllAsync(
        Guid? customerId = null,
        SurveyType? surveyType = null,
        SurveyResponseStatus? status = null,
        NpsCategory? npsCategory = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SurveyResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SurveyResponse>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SurveyResponse>> GetFollowUpRequiredAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<SurveyResponse>> GetDetractorsAsync(CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        SurveyType? surveyType = null,
        SurveyResponseStatus? status = null,
        NpsCategory? npsCategory = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<SurveyResponse> CreateAsync(SurveyResponse surveyResponse, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(SurveyResponse surveyResponse, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
