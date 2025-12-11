using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public class UpdateSurveyResponseCommandHandler : IRequestHandler<UpdateSurveyResponseCommand, Result<bool>>
{
    private readonly ISurveyResponseRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateSurveyResponseCommandHandler(
        ISurveyResponseRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateSurveyResponseCommand request, CancellationToken cancellationToken)
    {
        var surveyResponse = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (surveyResponse == null)
            return Result<bool>.Failure(Error.NotFound("SurveyResponse.NotFound", "Survey response not found"));

        if (surveyResponse.TenantId != request.TenantId)
            return Result<bool>.Failure(Error.Forbidden("SurveyResponse.Forbidden", "Access denied"));

        if (request.NpsScore.HasValue)
            surveyResponse.SetNpsScore(request.NpsScore.Value);

        if (request.CsatScore.HasValue)
            surveyResponse.SetCsatScore(request.CsatScore.Value);

        if (request.CesScore.HasValue)
            surveyResponse.SetCesScore(request.CesScore.Value);

        if (request.OverallSatisfaction.HasValue)
            surveyResponse.SetOverallSatisfaction(request.OverallSatisfaction.Value);

        if (request.WouldRecommend.HasValue)
            surveyResponse.SetWouldRecommend(request.WouldRecommend);

        if (request.WouldRepurchase.HasValue)
            surveyResponse.SetWouldRepurchase(request.WouldRepurchase);

        if (request.OverallComment != null || request.ImprovementSuggestion != null || request.Praise != null || request.Complaint != null)
        {
            surveyResponse.SetFeedback(
                request.OverallComment,
                request.ImprovementSuggestion,
                request.Praise,
                request.Complaint);
        }

        if (request.FollowUpRequired.HasValue)
            surveyResponse.SetFollowUpRequired(request.FollowUpRequired.Value);

        if (request.AssignedToUserId.HasValue)
            surveyResponse.SetAssignedTo(request.AssignedToUserId.Value);

        if (request.Status.HasValue)
        {
            switch (request.Status.Value)
            {
                case Domain.Entities.SurveyResponseStatus.Sent:
                    surveyResponse.Send();
                    break;
                case Domain.Entities.SurveyResponseStatus.Started:
                    surveyResponse.Start();
                    break;
                case Domain.Entities.SurveyResponseStatus.Completed:
                    surveyResponse.Complete();
                    break;
            }
        }

        await _repository.UpdateAsync(surveyResponse, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
