using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Queries;

public class GetSurveyResponsesQueryHandler : IRequestHandler<GetSurveyResponsesQuery, Result<List<SurveyResponseDto>>>
{
    private readonly ISurveyResponseRepository _repository;

    public GetSurveyResponsesQueryHandler(ISurveyResponseRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<List<SurveyResponseDto>>> Handle(GetSurveyResponsesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(
            request.CustomerId,
            request.SurveyType,
            request.Status,
            request.NpsCategory,
            request.Skip,
            request.Take,
            cancellationToken);

        var dtos = entities.Select(entity => new SurveyResponseDto
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
        }).ToList();

        return Result<List<SurveyResponseDto>>.Success(dtos);
    }
}
