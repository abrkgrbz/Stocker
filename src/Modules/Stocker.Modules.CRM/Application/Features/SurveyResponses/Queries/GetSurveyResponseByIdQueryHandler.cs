using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Queries;

public class GetSurveyResponseByIdQueryHandler : IRequestHandler<GetSurveyResponseByIdQuery, Result<SurveyResponseDto?>>
{
    private readonly ISurveyResponseRepository _repository;

    public GetSurveyResponseByIdQueryHandler(ISurveyResponseRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<SurveyResponseDto?>> Handle(GetSurveyResponseByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<SurveyResponseDto?>.Failure(new Error("SurveyResponse.NotFound", "Survey response not found", ErrorType.NotFound));
        }

        var dto = new SurveyResponseDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            SurveyType = entity.SurveyType,
            SurveyName = entity.SurveyName,
            Status = entity.Status,
            CustomerId = entity.CustomerId,
            ContactId = entity.ContactId,
            LeadId = entity.LeadId,
            TicketId = entity.TicketId,
            OrderId = entity.OrderId,
            CampaignId = entity.CampaignId,
            RespondentName = entity.RespondentName,
            RespondentEmail = entity.RespondentEmail,
            RespondentPhone = entity.RespondentPhone,
            IsAnonymous = entity.IsAnonymous,
            NpsScore = entity.NpsScore,
            NpsCategory = entity.NpsCategory,
            CsatScore = entity.CsatScore,
            CesScore = entity.CesScore,
            OverallSatisfaction = entity.OverallSatisfaction,
            WouldRecommend = entity.WouldRecommend,
            WouldRepurchase = entity.WouldRepurchase,
            SentDate = entity.SentDate,
            StartedDate = entity.StartedDate,
            CompletedDate = entity.CompletedDate,
            CompletionTimeSeconds = entity.CompletionTimeSeconds,
            OverallComment = entity.OverallComment,
            ImprovementSuggestion = entity.ImprovementSuggestion,
            Praise = entity.Praise,
            Complaint = entity.Complaint,
            FollowUpRequired = entity.FollowUpRequired,
            FollowUpDone = entity.FollowUpDone,
            FollowUpDate = entity.FollowUpDate,
            FollowUpNote = entity.FollowUpNote,
            AssignedToUserId = entity.AssignedToUserId,
            Source = entity.Source,
            DeviceType = entity.DeviceType,
            IpAddress = entity.IpAddress,
            Language = entity.Language,
            Answers = entity.Answers.Select(a => new SurveyAnswerDto
            {
                Id = a.Id,
                QuestionId = a.QuestionId,
                Question = a.Question,
                Answer = a.Answer,
                Score = a.Score,
                AnswerType = a.AnswerType,
                SortOrder = a.SortOrder
            }).ToList()
        };

        return Result<SurveyResponseDto?>.Success(dto);
    }
}
